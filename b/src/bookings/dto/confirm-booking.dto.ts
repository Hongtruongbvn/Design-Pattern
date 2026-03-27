import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmBookingDto {
  @ApiProperty({ example: 'PAY_123456', description: 'ID thanh toán' })
  @IsString()
  paymentId: string;

  @ApiProperty({ example: 'banking', description: 'Phương thức thanh toán' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;
}