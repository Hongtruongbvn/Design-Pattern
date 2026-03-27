import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie, MovieDocument } from './schema/movie.schema';
import { Room, RoomDocument } from '../rooms/schema/room.schema';
import { Showtime } from '../showtimes/schema/showtime.schema';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Showtime.name) private showtimeModel: Model<Showtime>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    // Nếu có roomId, kiểm tra phòng tồn tại
    if (createMovieDto.roomId) {
      const room = await this.roomModel.findById(createMovieDto.roomId);
      if (!room) {
        throw new NotFoundException('Phòng không tồn tại');
      }
    }

    const movie = new this.movieModel({
      ...createMovieDto,
      roomId: createMovieDto.roomId ? new Types.ObjectId(createMovieDto.roomId) : undefined,
    });
    
    return await movie.save();
  }

  async findAll() {
    return await this.movieModel
      .find()
      .populate('roomId', 'name theater type capacity')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const movie = await this.movieModel
      .findById(id)
      .populate('roomId', 'name theater type capacity seatLayout')
      .exec();
    if (!movie) {
      throw new NotFoundException('Phim không tồn tại');
    }
    return movie;
  }

  async update(id: string, updateMovieDto: UpdateMovieDto) {
    // Nếu cập nhật roomId, kiểm tra phòng mới
    if (updateMovieDto.roomId) {
      const room = await this.roomModel.findById(updateMovieDto.roomId);
      if (!room) {
        throw new NotFoundException('Phòng không tồn tại');
      }
      updateMovieDto.roomId = new Types.ObjectId(updateMovieDto.roomId) as any;
    }

    const movie = await this.movieModel
      .findByIdAndUpdate(id, updateMovieDto, { returnDocument: 'after' })
      .exec();
    
    if (!movie) {
      throw new NotFoundException('Phim không tồn tại');
    }
    return movie;
  }

  async remove(id: string) {
    // Kiểm tra xem có showtime nào của phim này không
    const showtimes = await this.showtimeModel.find({ movieId: id });
    if (showtimes.length > 0) {
      throw new BadRequestException(
        `Không thể xóa phim vì còn ${showtimes.length} suất chiếu. Vui lòng xóa các suất chiếu trước.`
      );
    }

    const movie = await this.movieModel.findByIdAndDelete(id).exec();
    if (!movie) {
      throw new NotFoundException('Phim không tồn tại');
    }
    return { message: 'Xóa phim thành công' };
  }

  async findShowing() {
    return await this.movieModel
      .find({ isShowing: true })
      .populate('roomId', 'name theater type')
      .sort({ createdAt: -1 })
      .exec();
  }

  async searchByTitle(title: string) {
    return await this.movieModel
      .find({ title: { $regex: title, $options: 'i' } })
      .populate('roomId', 'name theater')
      .exec();
  }

  async findByGenre(genre: string) {
    return await this.movieModel
      .find({ genre: { $in: [genre] } })
      .populate('roomId', 'name theater')
      .exec();
  }

  async getMoviesByRoom(roomId: string) {
    return await this.movieModel
      .find({ roomId, isShowing: true })
      .exec();
  }
}