import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './schema/room.schema';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { Movie, MovieSchema } from '../movies/schema/movie.schema';
import { Showtime, ShowtimeSchema } from '../showtimes/schema/showtime.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    MongooseModule.forFeature([{ name: Showtime.name, schema: ShowtimeSchema }]),
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService, MongooseModule],
})
export class RoomsModule {}