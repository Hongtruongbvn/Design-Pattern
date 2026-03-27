import { IsString, IsNumber, IsArray, IsOptional, IsUrl, Min, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({ example: 'Avengers: Endgame', description: 'Tên phim' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Sau sự kiện của Infinity War...', description: 'Mô tả phim' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 181, description: 'Thời lượng (phút)' })
  @IsNumber()
  @Min(1)
  duration: number; // Sửa từ Duration thành duration

  @ApiProperty({ example: ['Action', 'Adventure', 'Sci-Fi'], description: 'Thể loại' })
  @IsArray()
  @IsString({ each: true })
  genre: string[];

  @ApiProperty({ example: 'https://example.com/poster.jpg', description: 'URL poster' })
  @IsUrl()
  posterUrl: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID phòng chiếu' })
  @IsMongoId()
  @IsOptional()
  roomId?: string;

  @ApiProperty({ example: {
    director: 'Anthony Russo',
    cast: ['Robert Downey Jr.', 'Chris Evans'],
    rating: 8.4,
    releaseDate: '2019-04-26'
  }, description: 'Metadata' })
  @IsOptional()
  metadata?: {
    director: string;
    cast: string[];
    rating: number;
    releaseDate: Date;
  };
}