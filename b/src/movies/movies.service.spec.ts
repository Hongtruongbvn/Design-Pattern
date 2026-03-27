// movies.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MovieService } from './movies.service';
import { Movie } from './schema/movie.schema';
import { Room } from '../rooms/schema/room.schema';
import { Showtime } from '../showtimes/schema/showtime.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('MovieService', () => {
  let service: MovieService;
  let movieModel: any;
  let roomModel: any;
  let showtimeModel: any;

  beforeEach(async () => {
    movieModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      save: jest.fn(),
    };

    roomModel = {
      findById: jest.fn(),
    };

    showtimeModel = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        { provide: getModelToken(Movie.name), useValue: movieModel },
        { provide: getModelToken(Room.name), useValue: roomModel },
        { provide: getModelToken(Showtime.name), useValue: showtimeModel },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
  });

  describe('create', () => {
    it('should create a movie successfully', async () => {
      const createDto = {
        title: 'Avengers',
        duration: 180,
        genre: ['Action'],
        posterUrl: 'http://example.com/poster.jpg',
        roomId: 'room123',
      };

      roomModel.findById.mockResolvedValue({ _id: 'room123', name: 'Room 1' });
      
      const mockSave = jest.fn().mockResolvedValue({ ...createDto, _id: 'movie123' });
      movieModel.prototype.save = mockSave;

      const result = await service.create(createDto);
      expect(result).toBeDefined();
    });

    it('should throw error when room not found', async () => {
      const createDto = {
        title: 'Avengers',
        duration: 180,
        genre: ['Action'],
        posterUrl: 'http://example.com/poster.jpg',
        roomId: 'room123',
      };

      roomModel.findById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto)).rejects.toThrow('Phòng không tồn tại');
    });
  });

  describe('findOne', () => {
    it('should return a movie when found', async () => {
      const mockMovie = { _id: '123', title: 'Avengers', duration: 180 };
      movieModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMovie),
        }),
      });

      const result = await service.findOne('123');
      expect(result).toEqual(mockMovie);
    });

    it('should throw NotFoundException when movie not found', async () => {
      movieModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('123')).rejects.toThrow('Phim không tồn tại');
    });
  });

  describe('remove', () => {
    it('should throw error when movie has showtimes', async () => {
      showtimeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ _id: 'st1' }]),
      });

      await expect(service.remove('123')).rejects.toThrow(BadRequestException);
      await expect(service.remove('123')).rejects.toThrow(
        'Không thể xóa phim vì còn 1 suất chiếu',
      );
    });

    it('should delete movie when no showtimes', async () => {
      showtimeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });
      movieModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: '123' }),
      });

      const result = await service.remove('123');
      expect(result).toEqual({ message: 'Xóa phim thành công' });
    });
  });
});