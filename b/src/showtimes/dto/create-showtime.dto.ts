import { IsString, IsDateString, IsNumber, IsObject, IsOptional, Min, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShowtimeDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID phim' })
  @IsMongoId()
  movieId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439022', description: 'ID phòng chiếu' })
  @IsMongoId()
  roomId: string;

  @ApiProperty({ example: '2024-03-25T19:00:00Z', description: 'Thời gian bắt đầu' })
  @IsDateString()
  startTime: Date;

  @ApiProperty({ example: '2024-03-25T21:30:00Z', description: 'Thời gian kết thúc' })
  @IsDateString()
  endTime: Date;

  @ApiProperty({ example: 100000, description: 'Giá vé cơ bản' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ example: {
    'A1': 'available',
    'A2': 'available'
  }, description: 'Sơ đồ ghế' })
  @IsObject()
  @IsOptional()
  seats?: Record<string, string>;
}