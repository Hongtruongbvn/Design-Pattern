import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schema/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Movie } from '../movies/schema/movie.schema';
import { Showtime } from '../showtimes/schema/showtime.schema';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    @InjectModel(Showtime.name) private showtimeModel: Model<Showtime>,
  ) {}

  async create(createRoomDto: CreateRoomDto) {
    // Tạo seat layout tự động dựa trên capacity
    const seatLayout = this.generateSeatLayout(createRoomDto.capacity);
    
    const room = new this.roomModel({
      ...createRoomDto,
      seatLayout,
    });
    
    return await room.save();
  }

  async findAll() {
    return await this.roomModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const room = await this.roomModel.findById(id).exec();
    if (!room) {
      throw new NotFoundException('Phòng không tồn tại');
    }
    return room;
  }

  async findByTheater(theater: string) {
    return await this.roomModel
      .find({ theater, isActive: true })
      .sort({ name: 1 })
      .exec();
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    const room = await this.roomModel
      .findByIdAndUpdate(id, updateRoomDto, { returnDocument: 'after' })
      .exec();
    
    if (!room) {
      throw new NotFoundException('Phòng không tồn tại');
    }
    return room;
  }

  async remove(id: string) {
    // Kiểm tra xem có showtime nào trong phòng này không
    const showtimes = await this.showtimeModel.find({ roomId: id });
    if (showtimes.length > 0) {
      throw new BadRequestException(
        `Không thể xóa phòng vì còn ${showtimes.length} suất chiếu. Vui lòng xóa các suất chiếu trước.`
      );
    }

    // Kiểm tra xem có movie nào trong phòng này không
    const movies = await this.movieModel.find({ roomId: id });
    if (movies.length > 0) {
      throw new BadRequestException(
        `Không thể xóa phòng vì còn ${movies.length} phim đang chiếu trong phòng này. Vui lòng xóa các phim trước.`
      );
    }

    const room = await this.roomModel.findByIdAndDelete(id).exec();
    if (!room) {
      throw new NotFoundException('Phòng không tồn tại');
    }
    return { message: 'Xóa phòng thành công' };
  }

  async getSeatLayout(id: string) {
    const room = await this.findOne(id);
    return {
      roomId: room._id,
      roomName: room.name,
      theater: room.theater,
      type: room.type,
      capacity: room.capacity,
      seatLayout: room.seatLayout,
    };
  }

  private generateSeatLayout(capacity: number) {
    // Cố định 8 hàng A-H, mỗi hàng 10 ghế = 80 ghế
    const rows = 8;
    const columns = 10;
    const seatMap: Record<string, any> = {};
    
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    
    for (let i = 0; i < rows; i++) {
      const row = rowLetters[i];
      for (let j = 1; j <= columns; j++) {
        const seatNumber = `${row}${j}`;
        seatMap[seatNumber] = {
          row: row,
          number: j,
          type: i === 0 ? 'vip' : 'standard',
          status: 'available',
        };
      }
    }
    
    return {
      rows,
      columns,
      seatMap,
    };
  }
}