import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { ResetToken, ResetTokenDocument } from './schema/reset-token.schema';
import { VerificationToken, VerificationTokenDocument } from './schema/verification-token.schema';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(VerificationToken.name) 
    private verificationTokenModel: Model<VerificationTokenDocument>,
    @InjectModel(ResetToken.name) 
    private resetTokenModel: Model<ResetTokenDocument>,
  ) {}

  async createVerificationToken(userId: string): Promise<string> {
    // Xóa token cũ nếu có
    await this.verificationTokenModel.deleteMany({ userId });

    // Tạo token mới
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token hết hạn sau 24h

    await this.verificationTokenModel.create({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  async verifyEmail(token: string): Promise<string> {
    const verificationToken = await this.verificationTokenModel.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationToken) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    const userId = verificationToken.userId.toString();
    
    // Xóa token sau khi sử dụng
    await this.verificationTokenModel.deleteOne({ _id: verificationToken._id });

    return userId;
  }

  async createPasswordResetToken(userId: string): Promise<string> {
    // Xóa token cũ nếu có
    await this.resetTokenModel.deleteMany({ userId });

    // Tạo token mới
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token hết hạn sau 1h

    await this.resetTokenModel.create({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  async verifyResetToken(token: string): Promise<string> {
    const resetToken = await this.resetTokenModel.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    const userId = resetToken.userId.toString();
    
    // Xóa token sau khi sử dụng
    await this.resetTokenModel.deleteOne({ _id: resetToken._id });

    return userId;
  }
}