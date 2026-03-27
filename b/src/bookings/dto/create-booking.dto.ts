import { IsString, IsArray, ArrayMinSize, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID suất chiếu' })
  @IsMongoId()
  showtimeId: string;

  @ApiProperty({ example: ['A1', 'A2'], description: 'Danh sách ghế đặt' })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  seats: string[];
}