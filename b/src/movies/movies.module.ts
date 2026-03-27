import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MovieService } from './movies.service';
import { MovieController } from './movies.controller';
import { Movie, MovieSchema } from './schema/movie.schema';
import { RoomsModule } from 'src/rooms/rooms.module';
import { Showtime, ShowtimeSchema } from '../showtimes/schema/showtime.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    MongooseModule.forFeature([{ name: Showtime.name, schema: ShowtimeSchema }]),
    RoomsModule,
  ],
  controllers: [MovieController],
  providers: [MovieService],
  exports: [MovieService],
})
export class MoviesModule {}