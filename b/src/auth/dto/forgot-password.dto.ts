import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email cần lấy lại mật khẩu' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;
}