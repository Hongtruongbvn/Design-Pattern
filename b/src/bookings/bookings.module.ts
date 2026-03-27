import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingService } from './bookings.service';
import { BookingController } from './bookings.controller';
import { UserRoleFactory } from '../factories/user-role.factory';
import { Booking, BookingSchema } from './schema/booking.schema';
import { Showtime, ShowtimeSchema } from '../showtimes/schema/showtime.schema';
import { User, UserSchema } from '../user/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Showtime.name, schema: ShowtimeSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService, UserRoleFactory],
  exports: [BookingService],
})
export class BookingsModule {}