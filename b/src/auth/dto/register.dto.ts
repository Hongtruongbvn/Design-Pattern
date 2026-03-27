import { IsEmail, IsString, MinLength, MaxLength, Matches, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class Register{
    @ApiProperty({example: "example@gmail.com" , description:'Email của người dùng'})
    @IsEmail({},{message: 'Email không đúng định dạng'})
    @IsString()
    email:string;
    @ApiProperty({ example: 'password123', description: 'Mật khẩu (ít nhất 6 ký tự)' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không được vượt quá 50 ký tự' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số',
  })
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên' })
  @IsString()
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Họ tên không được vượt quá 100 ký tự' })
  fullName: string;

  @ApiProperty({ example: '0912345678', description: 'Số điện thoại' })
  @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ' })
  @IsString()
  phoneNumber: string;
}