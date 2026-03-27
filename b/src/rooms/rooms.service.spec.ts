// rooms.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RoomsService } from './rooms.service';
import { Room } from './schema/room.schema';
import { Movie } from '../movies/schema/movie.schema';
import { Showtime } from '../showtimes/schema/showtime.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('RoomsService', () => {
  let service: RoomsService;
  let roomModel: any;
  let showtimeModel: any;
  let movieModel: any;

  beforeEach(async () => {
    roomModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      save: jest.fn(),
    };

    showtimeModel = {
      find: jest.fn(),
    };

    movieModel = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: getModelToken(Room.name), useValue: roomModel },
        { provide: getModelToken(Movie.name), useValue: movieModel },
        { provide: getModelToken(Showtime.name), useValue: showtimeModel },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  describe('findOne', () => {
    it('should return a room when found', async () => {
      const mockRoom = { _id: '123', name: 'Room 1', theater: 'CGV' };
      roomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRoom),
      });

      const result = await service.findOne('123');
      expect(result).toEqual(mockRoom);
    });

    it('should throw NotFoundException when room not found', async () => {
      roomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should throw error when room has showtimes', async () => {
      showtimeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ _id: 'st1' }, { _id: 'st2' }]),
      });

      await expect(service.remove('123')).rejects.toThrow(BadRequestException);
      await expect(service.remove('123')).rejects.toThrow(
        'Không thể xóa phòng vì còn 2 suất chiếu',
      );
    });

    it('should delete room when no showtimes', async () => {
      showtimeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });
      movieModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });
      roomModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: '123' }),
      });

      const result = await service.remove('123');
      expect(result).toEqual({ message: 'Xóa phòng thành công' });
    });
  });
});