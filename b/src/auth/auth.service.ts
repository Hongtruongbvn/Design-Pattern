import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';
import { TokenService } from './token.service';
import { User, UserDocument, UserRole } from '../user/schema/user.schema';
import { Register } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private tokenService: TokenService,
  ) {}

  async register(registerDto: Register) {
    const { email, password, fullName, phoneNumber } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    }).exec();
    
    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email đã tồn tại');
      }
      if (existingUser.phoneNumber === phoneNumber) {
        throw new ConflictException('Số điện thoại đã tồn tại');
      }
    }

    // Hash password trực tiếp
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    console.log('Password hashed successfully:', hashedPassword);

    // Create new user (inactive)
    const user = new this.userModel({
      email,
      passwordHash: hashedPassword,
      fullName,
      phoneNumber,
      role: UserRole.USER,
      IsActive: false,
      loyaltyPoints: 0,
    });

    await user.save();
    console.log('User saved successfully:', user.email);

    // Create verification token
    const verificationToken = await this.tokenService.createVerificationToken(user._id.toString());

    // Send verification email
    await this.emailService.sendVerificationEmail(email, fullName, verificationToken);

    return {
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.',
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        IsActive: user.IsActive,
      },
    };
  }

  async verifyEmail(token: string) {
    const userId = await this.tokenService.verifyEmail(token);
    
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    if (user.IsActive) {
      throw new BadRequestException('Tài khoản đã được kích hoạt trước đó');
    }

    user.IsActive = true;
    await user.save();

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.fullName);

    // Generate token for auto login after verification
    const authToken = this.generateToken(user);

    return {
      message: 'Email đã được xác thực thành công!',
      user: this.sanitizeUser(user),
      token: authToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    console.log('User found:', user.email);
    console.log('Stored hash:', user.passwordHash);

    // Check if user is active
    if (!user.IsActive) {
      throw new UnauthorizedException('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt tài khoản.');
    }

    // Compare password trực tiếp
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      return {
        message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.',
      };
    }

    if (!user.IsActive) {
      throw new BadRequestException('Tài khoản chưa được kích hoạt. Vui lòng kích hoạt tài khoản trước khi đặt lại mật khẩu.');
    }

    const resetToken = await this.tokenService.createPasswordResetToken(user._id.toString());
    await this.emailService.sendPasswordResetEmail(email, user.fullName, resetToken);

    return {
      message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword, confirmPassword } = resetPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }

    const userId = await this.tokenService.verifyResetToken(token);

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    // Hash password mới trực tiếp
    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
    user.passwordHash = hashedPassword;
    await user.save();

    return {
      message: 'Mật khẩu đã được đặt lại thành công!',
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new BadRequestException('Email không tồn tại');
    }

    if (user.IsActive) {
      throw new BadRequestException('Tài khoản đã được kích hoạt');
    }

    const verificationToken = await this.tokenService.createVerificationToken(user._id.toString());
    await this.emailService.sendVerificationEmail(email, user.fullName, verificationToken);

    return {
      message: 'Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.',
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return this.sanitizeUser(user);
  }

  private generateToken(user: UserDocument): string {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: UserDocument) {
    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      IsActive: user.IsActive,
      loyaltyPoints: user.loyaltyPoints,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}