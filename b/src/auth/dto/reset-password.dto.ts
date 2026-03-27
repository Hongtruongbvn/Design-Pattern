import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-123', description: 'Token reset mật khẩu' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newPassword123', description: 'Mật khẩu mới' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không được vượt quá 50 ký tự' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số',
  })
  newPassword: string;

  @ApiProperty({ example: 'newPassword123', description: 'Xác nhận mật khẩu mới' })
  @IsString()
  confirmPassword: string;
}