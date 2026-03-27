import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShowtimeService } from './showtimes.service';
import { ShowtimeController } from './showtimes.controller';
import { Showtime, ShowtimeSchema } from './schema/showtime.schema';
import { Movie, MovieSchema } from '../movies/schema/movie.schema';
import { Room, RoomSchema } from '../rooms/schema/room.schema';
import { Booking, BookingSchema } from '../bookings/schema/booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Showtime.name, schema: ShowtimeSchema },
      { name: Movie.name, schema: MovieSchema },
      { name: Room.name, schema: RoomSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [ShowtimeController],
  providers: [ShowtimeService],
  exports: [ShowtimeService],
})
export class ShowtimesModule {}