import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { Movie, MovieDocument } from '../movies/schema/movie.schema';
import { Showtime, ShowtimeDocument } from './schema/showtime.schema';
import { Room, RoomDocument } from '../rooms/schema/room.schema';
import { Booking } from '../bookings/schema/booking.schema';

@Injectable()
export class ShowtimeService {
  constructor(
    @InjectModel(Showtime.name) private showtimeModel: Model<ShowtimeDocument>,
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  async create(createShowtimeDto: CreateShowtimeDto) {
    const movie = await this.movieModel.findById(createShowtimeDto.movieId);
    if (!movie) {
      throw new NotFoundException('Phim không tồn tại');
    }

    const room = await this.roomModel.findById(createShowtimeDto.roomId);
    if (!room) {
      throw new NotFoundException('Phòng không tồn tại');
    }

    // Kiểm tra suất chiếu trùng lịch
    const overlapping = await this.showtimeModel.findOne({
      roomId: createShowtimeDto.roomId,
      $or: [
        {
          startTime: { $lt: createShowtimeDto.endTime },
          endTime: { $gt: createShowtimeDto.startTime }
        }
      ]
    });

    if (overlapping) {
      throw new BadRequestException('Suất chiếu bị trùng lịch trong cùng phòng');
    }

    const seats = this.initializeSeatsFromRoom(room);

    const showtime = new this.showtimeModel({
      ...createShowtimeDto,
      movieId: new Types.ObjectId(createShowtimeDto.movieId),
      roomId: new Types.ObjectId(createShowtimeDto.roomId),
      theater: room.theater,
      room: room.name,
      seats,
      isActive: false,
    });

    return await showtime.save();
  }

  async startShowtime(id: string) {
    const showtime = await this.showtimeModel.findById(id);
    if (!showtime) {
      throw new NotFoundException('Suất chiếu không tồn tại');
    }

    if (showtime.isActive) {
      throw new BadRequestException('Suất chiếu đã được bắt đầu');
    }

    showtime.isActive = true;
    await showtime.save();

    const movie = await this.movieModel.findById(showtime.movieId);
    if (movie && !movie.isShowing) {
      movie.isShowing = true;
      await movie.save();
    }

    return {
      message: 'Đã bắt đầu suất chiếu',
      showtime,
    };
  }

  async endShowtime(id: string) {
    const showtime = await this.showtimeModel.findById(id);
    if (!showtime) {
      throw new NotFoundException('Suất chiếu không tồn tại');
    }

    if (!showtime.isActive) {
      throw new BadRequestException('Suất chiếu chưa được bắt đầu');
    }

    showtime.isActive = false;
    await showtime.save();

    const otherActiveShowtimes = await this.showtimeModel.findOne({
      movieId: showtime.movieId,
      isActive: true,
      _id: { $ne: id }
    });

    if (!otherActiveShowtimes) {
      await this.movieModel.findByIdAndUpdate(showtime.movieId, { isShowing: false });
    }

    return {
      message: 'Đã kết thúc suất chiếu',
      showtime,
    };
  }

  async findAll() {
    return await this.showtimeModel
      .find()
      .populate('movieId', 'title posterUrl duration')
      .populate('roomId', 'name theater type')
      .sort({ startTime: 1 })
      .exec();
  }

  async findActive() {
    return await this.showtimeModel
      .find({ isActive: true })
      .populate('movieId', 'title posterUrl duration')
      .populate('roomId', 'name theater type')
      .sort({ startTime: 1 })
      .exec();
  }

  async findOne(id: string) {
    const showtime = await this.showtimeModel
      .findById(id)
      .populate('movieId', 'title description posterUrl duration metadata')
      .populate('roomId', 'name theater type seatLayout')
      .exec();
    
    if (!showtime) {
      throw new NotFoundException('Suất chiếu không tồn tại');
    }
    return showtime;
  }

  async findByMovie(movieId: string) {
    return await this.showtimeModel
      .find({ 
        movieId: new Types.ObjectId(movieId), 
        isActive: true
      })
      .populate('movieId', 'title posterUrl')
      .populate('roomId', 'name theater type')
      .sort({ startTime: 1 })
      .exec();
  }

  async findByTheater(theater: string) {
    return await this.showtimeModel
      .find({ theater, isActive: true })
      .populate('movieId', 'title posterUrl duration')
      .populate('roomId', 'name theater type')
      .sort({ startTime: 1 })
      .exec();
  }

  async findByDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.showtimeModel
      .find({
        startTime: { $gte: startOfDay, $lte: endOfDay },
        isActive: true
      })
      .populate('movieId', 'title posterUrl duration')
      .populate('roomId', 'name theater type')
      .sort({ startTime: 1 })
      .exec();
  }

  async update(id: string, updateShowtimeDto: UpdateShowtimeDto) {
    const showtime = await this.showtimeModel
      .findByIdAndUpdate(id, updateShowtimeDto, { returnDocument: 'after' })
      .exec();
    
    if (!showtime) {
      throw new NotFoundException('Suất chiếu không tồn tại');
    }
    return showtime;
  }

  async remove(id: string) {
    // Kiểm tra xem có booking nào của suất chiếu này không
    const bookings = await this.bookingModel.find({ showtimeId: id });
    if (bookings.length > 0) {
      throw new BadRequestException(
        `Không thể xóa suất chiếu vì còn ${bookings.length} đơn đặt vé. Vui lòng xóa các đơn đặt vé trước.`
      );
    }

    const showtime = await this.showtimeModel.findByIdAndDelete(id).exec();
    if (!showtime) {
      throw new NotFoundException('Suất chiếu không tồn tại');
    }
    
    const otherActiveShowtimes = await this.showtimeModel.findOne({
      movieId: showtime.movieId,
      isActive: true
    });
    
    if (!otherActiveShowtimes) {
      await this.movieModel.findByIdAndUpdate(showtime.movieId, { isShowing: false });
    }
    
    return { message: 'Xóa suất chiếu thành công' };
  }

  async getAvailableSeats(showtimeId: string) {
    const showtime = await this.findOne(showtimeId);
    
    const availableSeats: string[] = [];
    const seats = showtime.seats;
    
    for (const seatNumber of Object.keys(seats)) {
      if (seats[seatNumber] === 'available') {
        availableSeats.push(seatNumber);
      }
    }
    
    return {
      showtimeId,
      availableSeats,
      totalSeats: Object.keys(seats).length,
      bookedSeats: Object.keys(seats).length - availableSeats.length,
    };
  }

  async reserveSeats(showtimeId: string, seats: string[]) {
    const showtime = await this.findOne(showtimeId);
    
    if (!showtime.isActive) {
      throw new BadRequestException('Suất chiếu chưa được bắt đầu');
    }
    
    for (const seat of seats) {
      if (showtime.seats[seat] !== 'available') {
        throw new BadRequestException(`Ghế ${seat} đã được đặt hoặc không khả dụng`);
      }
    }
    
    for (const seat of seats) {
      showtime.seats[seat] = 'pending';
    }
    
    await showtime.save();
    return showtime;
  }

  async confirmSeats(showtimeId: string, seats: string[]) {
    const showtime = await this.findOne(showtimeId);
    
    for (const seat of seats) {
      if (showtime.seats[seat] === 'pending') {
        showtime.seats[seat] = 'booked';
      }
    }
    
    await showtime.save();
    return showtime;
  }

  async releaseSeats(showtimeId: string, seats: string[]) {
    const showtime = await this.findOne(showtimeId);
    
    for (const seat of seats) {
      if (showtime.seats[seat] === 'pending') {
        showtime.seats[seat] = 'available';
      }
    }
    
    await showtime.save();
    return showtime;
  }

  private initializeSeatsFromRoom(room: RoomDocument): Record<string, string> {
    const seats: Record<string, string> = {};
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 10;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (let j = 1; j <= seatsPerRow; j++) {
        seats[`${row}${j}`] = 'available';
      }
    }
    
    return seats;
  }
}