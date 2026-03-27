import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoomType } from '../schema/room.schema';

export class CreateRoomDto {
  @ApiProperty({ example: 'Room 1', description: 'Tên phòng' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'CGV Vincom Center', description: 'Tên rạp' })
  @IsString()
  theater: string;

  @ApiProperty({ enum: RoomType, default: RoomType.STANDARD })
  @IsEnum(RoomType)
  @IsOptional()
  type?: RoomType;

  @ApiProperty({ example: 80, description: 'Sức chứa' })
  @IsNumber()
  @Min(1)
  capacity: number;
}