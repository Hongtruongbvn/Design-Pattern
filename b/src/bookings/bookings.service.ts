import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking, BookingStatus } from './schema/booking.schema';
import { Showtime } from 'src/showtimes/schema/showtime.schema';
import { User } from 'src/user/schema/user.schema';
import { UserRoleFactory } from 'src/factories/user-role.factory';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
const PDFDocument = require('pdfkit');

@Injectable()
export class BookingService {
  private pdfFontPath: string;
  private pdfFontBoldPath: string;
  private pdfFontItalicPath: string;

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Showtime.name) private showtimeModel: Model<Showtime>,
    @InjectModel(User.name) private userModel: Model<User>,
    private userRoleFactory: UserRoleFactory,
  ) {
    this.pdfFontPath = path.join(process.cwd(), 'src', 'fonts', 'DejaVuSans.ttf');
    this.pdfFontBoldPath = path.join(process.cwd(), 'src', 'fonts', 'DejaVuSans-Bold.ttf');
    this.pdfFontItalicPath = path.join(process.cwd(), 'src', 'fonts', 'DejaVuSans-Oblique.ttf');
  }

  async createPaymentQRCode(amount: number, content: string): Promise<string> {
    const bankCode = '970441';
    const accountNumber = '006908140';
    const name = 'PHAM HONG TRUONG';
    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(name)}`;
    const qrCodeBase64 = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
    });
    return qrCodeBase64;
  }

  async generateTicketQRCode(booking: any): Promise<string> {
    const ticketData = {
      bookingId: booking._id.toString(),
      bookingCode: booking.ticketDetails?.bookingCode,
      movie: booking.showtimeId?.movieId?.title || 'N/A',
      theater: booking.showtimeId?.theater,
      room: booking.showtimeId?.room,
      seats: booking.seats,
      date: new Date(booking.showtimeId?.startTime).toLocaleString('vi-VN'),
      customer: booking.userId?.fullName,
    };
    const qrCodeBase64 = await QRCode.toDataURL(JSON.stringify(ticketData), {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 250,
    });
    return qrCodeBase64;
  }

  async create(userId: string, createBookingDto: CreateBookingDto) {
    const { showtimeId, seats } = createBookingDto;

    const showtime = await this.showtimeModel.findById(showtimeId);
    if (!showtime) {
      throw new NotFoundException('Suất chiếu không tồn tại');
    }

    if (!showtime.isActive) {
      throw new BadRequestException('Suất chiếu chưa được bắt đầu');
    }

    for (const seat of seats) {
      const seatStatus = showtime.seats[seat];
      if (!seatStatus || seatStatus !== 'available') {
        throw new BadRequestException(`Ghế ${seat} đã được đặt hoặc không khả dụng`);
      }
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const baseAmount = showtime.basePrice * seats.length;
    const totalAmount = this.userRoleFactory.calculatePriceWithDiscount(baseAmount, user.role);
    const bookingCode = this.generateBookingCode();
    const paymentQRCode = await this.createPaymentQRCode(
      totalAmount,
      `Thanh toan ve xem phim - Ma ve: ${bookingCode}`
    );

    const booking = new this.bookingModel({
      userId: new Types.ObjectId(userId),
      showtimeId: new Types.ObjectId(showtimeId),
      seats,
      totalAmount,
      status: BookingStatus.PENDING,
      ticketDetails: {
        bookingCode: bookingCode,
        qrCode: paymentQRCode,
      },
    });

    for (const seat of seats) {
      showtime.seats[seat] = 'pending';
    }
    await showtime.save();
    await booking.save();

    return await this.bookingModel
      .findById(booking._id)
      .populate('showtimeId', 'startTime endTime theater room basePrice movieId')
      .populate('userId', 'email fullName phoneNumber');
  }

  async getUserBookings(userId: string) {
    return await this.bookingModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'showtimeId',
        populate: {
          path: 'movieId',
          select: 'title posterUrl duration'
        }
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPaymentQRCode(bookingId: string, userId: string) {
    const booking = await this.bookingModel.findById(bookingId);
    
    if (!booking) {
      throw new NotFoundException('Đặt vé không tồn tại');
    }
    
    const currentUser = await this.userModel.findById(userId);
    const isAdmin = currentUser?.role === 'admin';
    const isOwner = booking.userId.toString() === userId;
    
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin này');
    }
    
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Đơn hàng đã được xử lý');
    }
    
    return {
      qrCode: booking.ticketDetails?.qrCode,
      amount: booking.totalAmount,
      bookingCode: booking.ticketDetails?.bookingCode,
      status: booking.status,
    };
  }

  async generateTicketPDF(bookingId: string, userId: string): Promise<Buffer> {
    const booking = await this.bookingModel.findById(bookingId)
      .populate({
        path: 'showtimeId',
        populate: {
          path: 'movieId',
          select: 'title posterUrl duration'
        }
      })
      .populate('userId', 'email fullName phoneNumber');
    
    if (!booking) {
      throw new NotFoundException('Đặt vé không tồn tại');
    }
    
    const currentUser = await this.userModel.findById(userId);
    const isAdmin = currentUser?.role === 'admin';
    const isOwner = booking.userId._id.toString() === userId;
    
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Bạn không có quyền tải vé này');
    }
    
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Vé chưa được xác nhận thanh toán');
    }

    const showtime = booking.showtimeId as any;
    const user = booking.userId as any;
    const movie = showtime?.movieId;

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50, layout: 'portrait' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        try {
          if (fs.existsSync(this.pdfFontPath)) {
            doc.registerFont('DejaVu', this.pdfFontPath);
            doc.registerFont('DejaVu-Bold', this.pdfFontBoldPath);
            doc.registerFont('DejaVu-Italic', this.pdfFontItalicPath);
            doc.font('DejaVu');
          }
        } catch (error) {
          console.warn('Không thể load font tiếng Việt, sử dụng font mặc định');
        }

        doc.rect(30, 30, 550, 750).stroke();

        doc.fontSize(24)
          .font('Helvetica-Bold')
          .fillColor('#2563eb')
          .text('MOVIE TICKET', { align: 'center' })
          .moveDown(0.5);

        doc.fontSize(12)
          .font('Helvetica')
          .fillColor('#666666')
          .text('VE XEM PHIM DIEN ANH', { align: 'center' })
          .moveDown(1.5);

        if (booking.ticketDetails?.qrCode) {
          try {
            const qrBuffer = Buffer.from(booking.ticketDetails.qrCode.split(',')[1], 'base64');
            doc.image(qrBuffer, {
              fit: [120, 120],
              align: 'center',
            });
            doc.moveDown(1);
          } catch (err) {
            console.error('Error loading QR code:', err);
          }
        }

        let currentY = doc.y + 20;
        
        doc.rect(50, currentY, 510, 280).fillOpacity(0.05).fill('#f3f4f6');
        doc.fillOpacity(1);
        
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#1f2937')
          .text('THONG TIN VE', 70, currentY + 15);
        
        currentY += 45;
        
        const infoRows = [
          { label: 'Ma ve:', value: booking.ticketDetails?.bookingCode || 'N/A' },
          { label: 'Phim:', value: movie?.title || 'N/A' },
          { label: 'Ngay chieu:', value: new Date(showtime?.startTime).toLocaleDateString('vi-VN') },
          { label: 'Gio chieu:', value: new Date(showtime?.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
          { label: 'Rap:', value: `${showtime?.theater} - ${showtime?.room}` },
          { label: 'Ghe:', value: booking.seats.join(', ') },
          { label: 'So luong:', value: `${booking.seats.length} ve` },
          { label: 'Tong tien:', value: `${booking.totalAmount.toLocaleString()} VND` },
        ];
        
        infoRows.forEach((row, index) => {
          doc.fontSize(11)
            .font('Helvetica-Bold')
            .fillColor('#374151')
            .text(row.label, 70, currentY + index * 28);
          doc.font('Helvetica')
            .fillColor('#1f2937')
            .text(row.value, 180, currentY + index * 28);
        });
        
        currentY += infoRows.length * 28 + 20;
        
        doc.fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#1f2937')
          .text('THONG TIN KHACH HANG', 70, currentY);
        currentY += 25;
        
        doc.fontSize(10)
          .font('Helvetica')
          .text(`Ho ten: ${user?.fullName || 'N/A'}`, 70, currentY);
        currentY += 20;
        doc.text(`Email: ${user?.email || 'N/A'}`, 70, currentY);
        currentY += 20;
        doc.text(`SDT: ${user?.phoneNumber || 'N/A'}`, 70, currentY);
        currentY += 35;
        
        doc.fontSize(9)
          .font('Helvetica-Oblique')
          .fillColor('#6b7280')
          .text('Vui long xuat trinh ve (ban giay hoac dien tu) tai quay de vao rap', { align: 'center' })
          .moveDown(0.5)
          .text('Ve da bao gom VAT 10%', { align: 'center' })
          .text(`Ma giao dich: ${booking.paymentDetails?.transactionId || 'N/A'}`, { align: 'center' })
          .text('Chuc ban co trai nghiem xem phim tuyet voi!', { align: 'center' });
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async findOne(id: string) {
    const booking = await this.bookingModel
      .findById(id)
      .populate({
        path: 'showtimeId',
        populate: {
          path: 'movieId',
          select: 'title posterUrl duration'
        }
      })
      .populate('userId', 'email fullName phoneNumber')
      .exec();
    
    if (!booking) {
      throw new NotFoundException('Đặt vé không tồn tại');
    }
    return booking;
  }

  async getPendingBookings() {
    return await this.bookingModel
      .find({ status: BookingStatus.PENDING })
      .populate({
        path: 'showtimeId',
        populate: {
          path: 'movieId',
          select: 'title posterUrl duration'
        }
      })
      .populate('userId', 'email fullName phoneNumber')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllBookings() {
    return await this.bookingModel
      .find()
      .populate({
        path: 'showtimeId',
        populate: {
          path: 'movieId',
          select: 'title posterUrl duration'
        }
      })
      .populate('userId', 'email fullName phoneNumber')
      .sort({ createdAt: -1 })
      .exec();
  }

  async adminConfirmPayment(bookingId: string, adminId: string, note?: string) {
    const booking = await this.bookingModel.findById(bookingId)
      .populate('showtimeId')
      .populate('userId');
    
    if (!booking) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Đơn hàng đã được xử lý trước đó');
    }

    const ticketQRCode = await this.generateTicketQRCode(booking);

    booking.status = BookingStatus.CONFIRMED;
    booking.paymentId = `ADMIN_${Date.now()}`;
    booking.paymentDetails = {
      method: 'banking',
      transactionId: `TXN_${Date.now()}`,
      paidAt: new Date(),
      adminNote: note,
      confirmedBy: adminId,
    };
    booking.ticketDetails.qrCode = ticketQRCode;

    await booking.save();

    const showtime = await this.showtimeModel.findById(booking.showtimeId);
    if (showtime) {
      for (const seat of booking.seats) {
        if (showtime.seats[seat] === 'pending') {
          showtime.seats[seat] = 'booked';
        }
      }
      await showtime.save();
    }

    const user = await this.userModel.findById(booking.userId);
    if (user) {
      const pointsEarned = Math.floor(booking.totalAmount / 10000);
      user.loyaltyPoints = (user.loyaltyPoints || 0) + pointsEarned;
      await user.save();
    }

    return {
      message: 'Đã xác nhận thanh toán thành công',
      booking,
    };
  }

  async adminRejectBooking(bookingId: string, adminId: string, reason: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Đơn hàng đã được xử lý trước đó');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.paymentDetails = {
      method: 'rejected',
      transactionId: `REJECT_${Date.now()}`,
      paidAt: new Date(),
      adminNote: reason,
      confirmedBy: adminId,
    };

    await booking.save();

    const showtime = await this.showtimeModel.findById(booking.showtimeId);
    if (showtime) {
      for (const seat of booking.seats) {
        if (showtime.seats[seat] === 'pending') {
          showtime.seats[seat] = 'available';
        }
      }
      await showtime.save();
    }

    return {
      message: 'Đã từ chối đơn hàng',
      booking,
    };
  }

  async getRevenueStats(month?: number, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month !== undefined ? month : new Date().getMonth() + 1;

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const bookings = await this.bookingModel.aggregate([
      {
        $match: {
          status: BookingStatus.CONFIRMED,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalBookings: { $sum: 1 },
          totalTickets: { $sum: { $size: '$seats' } },
          averageTicketPrice: { $avg: '$totalAmount' },
        },
      },
    ]);

    const dailyStats = await this.bookingModel.aggregate([
      {
        $match: {
          status: BookingStatus.CONFIRMED,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
          tickets: { $sum: { $size: '$seats' } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      period: `${currentMonth}/${currentYear}`,
      summary: bookings[0] || {
        totalRevenue: 0,
        totalBookings: 0,
        totalTickets: 0,
        averageTicketPrice: 0,
      },
      dailyBreakdown: dailyStats,
    };
  }

  async getAdminStats() {
    const totalUsers = await this.userModel.countDocuments();
    const totalMovies = await this.showtimeModel.distinct('movieId');
    const totalShowtimes = await this.showtimeModel.countDocuments();
    
    const currentMonthStats = await this.getRevenueStats();
    
    const activeBookings = await this.bookingModel.countDocuments({
      status: BookingStatus.CONFIRMED,
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    });

    return {
      users: {
        total: totalUsers,
        active: await this.userModel.countDocuments({ isActive: true }),
      },
      movies: {
        total: totalMovies.length,
        showing: await this.showtimeModel.countDocuments({ isActive: true }),
      },
      showtimes: {
        total: totalShowtimes,
        upcoming: await this.showtimeModel.countDocuments({ 
          startTime: { $gt: new Date() } 
        }),
      },
      revenue: currentMonthStats.summary,
      bookings: {
        totalThisMonth: currentMonthStats.summary.totalBookings,
        active: activeBookings,
      },
    };
  }

  async getAllUsers() {
    return await this.userModel
      .find({}, '-passwordHash')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-passwordHash');
    
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    
    return user;
  }

  private generateBookingCode(): string {
    const prefix = 'BK';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }
}