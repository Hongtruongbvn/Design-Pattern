import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private mailerService: MailerService) {}

  async sendVerificationEmail(email: string, fullName: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Xác thực email</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Chào ${fullName},</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại Movie Booking System.</p>
          <p>Vui lòng click vào link bên dưới để kích hoạt tài khoản của bạn:</p>
          <p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
              Kích hoạt tài khoản
            </a>
          </p>
          <p>Hoặc copy link sau vào trình duyệt: <br> ${verificationUrl}</p>
          <p>Link này sẽ hết hạn sau 24 giờ.</p>
          <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
          <br>
          <p>Trân trọng,<br>Movie Booking System</p>
          <p style="font-size: 12px; color: #666;">Email hỗ trợ: ${process.env.SUPPORT_EMAIL}</p>
        </div>
      </body>
      </html>
    `;
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Xác thực email - Movie Booking System',
        html: htmlContent,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, fullName: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Đặt lại mật khẩu</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Chào ${fullName},</h2>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
          <p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px;">
              Đặt lại mật khẩu
            </a>
          </p>
          <p>Hoặc copy link sau vào trình duyệt: <br> ${resetUrl}</p>
          <p>Link này sẽ hết hạn sau 1 giờ.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          <br>
          <p>Trân trọng,<br>Movie Booking System</p>
          <p style="font-size: 12px; color: #666;">Email hỗ trợ: ${process.env.SUPPORT_EMAIL}</p>
        </div>
      </body>
      </html>
    `;
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Đặt lại mật khẩu - Movie Booking System',
        html: htmlContent,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, fullName: string) {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Chào mừng</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Chào mừng ${fullName} đến với Movie Booking System!</h2>
          <p>Cảm ơn bạn đã xác thực email thành công.</p>
          <p>Bạn có thể bắt đầu đặt vé xem phim ngay bây giờ.</p>
          <p>
            <a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
              Đăng nhập ngay
            </a>
          </p>
          <br>
          <p>Trân trọng,<br>Movie Booking System</p>
          <p style="font-size: 12px; color: #666;">Email hỗ trợ: ${process.env.SUPPORT_EMAIL}</p>
        </div>
      </body>
      </html>
    `;
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Chào mừng đến với Movie Booking System',
        html: htmlContent,
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
    }
  }
}