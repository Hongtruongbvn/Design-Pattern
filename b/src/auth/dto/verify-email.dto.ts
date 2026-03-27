import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: 'verification-token-123', description: 'Token xác thực email' })
  @IsString()
  token: string;
}