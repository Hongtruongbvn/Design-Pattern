// showtimes.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ShowtimeService } from './showtimes.service';
import { Showtime } from './schema/showtime.schema';
import { Movie } from '../movies/schema/movie.schema';
import { Room } from '../rooms/schema/room.schema';
import { Booking } from '../bookings/schema/booking.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('ShowtimeService', () => {
  let service: ShowtimeService;
  let showtimeModel: any;
  let movieModel: any;
  let roomModel: any;

  beforeEach(async () => {
    showtimeModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      save: jest.fn(),
    };

    movieModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    roomModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimeService,
        { provide: getModelToken(Showtime.name), useValue: showtimeModel },
        { provide: getModelToken(Movie.name), useValue: movieModel },
        { provide: getModelToken(Room.name), useValue: roomModel },
        { provide: getModelToken(Booking.name), useValue: {} },
      ],
    }).compile();

    service = module.get<ShowtimeService>(ShowtimeService);
  });

  describe('create', () => {
    it('should create a showtime successfully', async () => {
      const createDto = {
        movieId: 'movie123',
        roomId: 'room123',
        startTime: new Date('2024-12-25T14:00:00'),
        endTime: new Date('2024-12-25T17:00:00'),
        basePrice: 100000,
      };

      movieModel.findById.mockResolvedValue({ _id: 'movie123', title: 'Avengers' });
      roomModel.findById.mockResolvedValue({ _id: 'room123', name: 'Room 1', theater: 'CGV' });
      showtimeModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      
      const mockSave = jest.fn().mockResolvedValue({ ...createDto, _id: 'st123' });
      showtimeModel.prototype.save = mockSave;

      const result = await service.create(createDto);
      expect(result).toBeDefined();
    });

    it('should throw error when overlapping showtime', async () => {
      const createDto = {
        movieId: 'movie123',
        roomId: 'room123',
        startTime: new Date('2024-12-25T14:00:00'),
        endTime: new Date('2024-12-25T17:00:00'),
        basePrice: 100000,
      };

      movieModel.findById.mockResolvedValue({ _id: 'movie123' });
      roomModel.findById.mockResolvedValue({ _id: 'room123' });
      showtimeModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'st123' }),
      });

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow(
        'Suất chiếu bị trùng lịch trong cùng phòng',
      );
    });
  });

  describe('getAvailableSeats', () => {
    it('should return list of available seats', async () => {
      const mockShowtime = {
        _id: 'st123',
        seats: {
          'A1': 'available',
          'A2': 'booked',
          'A3': 'available',
          'A4': 'pending',
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockShowtime as any);

      const result = await service.getAvailableSeats('st123');
      expect(result.availableSeats).toEqual(['A1', 'A3']);
      expect(result.totalSeats).toBe(4);
      expect(result.bookedSeats).toBe(2);
    });
  });

  describe('startShowtime', () => {
    it('should start showtime successfully', async () => {
      const mockShowtime = {
        _id: 'st123',
        isActive: false,
        movieId: 'movie123',
        save: jest.fn().mockResolvedValue(true),
      };

      showtimeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShowtime),
      });

      movieModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ isShowing: false, save: jest.fn() }),
      });

      const result = await service.startShowtime('st123');
      expect(result.message).toBe('Đã bắt đầu suất chiếu');
    });

    it('should throw error if showtime already active', async () => {
      const mockShowtime = {
        _id: 'st123',
        isActive: true,
      };

      showtimeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShowtime),
      });

      await expect(service.startShowtime('st123')).rejects.toThrow(BadRequestException);
      await expect(service.startShowtime('st123')).rejects.toThrow(
        'Suất chiếu đã được bắt đầu',
      );
    });
  });
});