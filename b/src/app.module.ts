import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {MongooseModule} from "@nestjs/mongoose"
import{ConfigModule, ConfigService} from "@nestjs/config"
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MoviesModule } from './movies/movies.module';
import { ShowtimesModule } from './showtimes/showtimes.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:'.env'
    }),
    MongooseModule.forRootAsync({
      imports:[ConfigModule],
      useFactory: async (ConfigService : ConfigService)=>({
        uri : ConfigService.get<string>('MONGODB_URL'),
        
      }),
      inject:[ConfigService]
    }),
    UserModule,
    MoviesModule,
    ShowtimesModule,
    BookingsModule,
    AuthModule,
    RoomsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
