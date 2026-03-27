import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Res } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingService } from './bookings.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/user/schema/user.schema';
import { Roles } from 'src/auth/roles.decorator';
import type { Response } from 'express';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn đặt vé mới' })
  create(@CurrentUser('id') userId: string, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(userId, createBookingDto);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng của tôi' })
  getMyBookings(@CurrentUser('id') userId: string) {
    return this.bookingService.getUserBookings(userId);
  }

  @Get(':bookingId/qr')
  @ApiOperation({ summary: 'Lấy QR code thanh toán' })
  async getPaymentQR(
    @Param('bookingId') bookingId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingService.getPaymentQRCode(bookingId, userId);
  }

  @Get(':bookingId/ticket')
  @ApiOperation({ summary: 'Tải vé PDF' })
  async downloadTicket(
    @Param('bookingId') bookingId: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.bookingService.generateTicketPDF(bookingId, userId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ticket_${bookingId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.send(pdfBuffer);
  }

  // ==================== ADMIN ENDPOINTS ====================
  
  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Thống kê tổng quan hệ thống (Admin)' })
  async getAdminStats() {
    return this.bookingService.getAdminStats();
  }

  @Get('admin/revenue')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Thống kê doanh thu (Admin)' })
  async getRevenueStats(@Query('month') month?: string, @Query('year') year?: string) {
    return this.bookingService.getRevenueStats(
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Get('admin/users')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách người dùng (Admin)' })
  async getAllUsers() {
    return this.bookingService.getAllUsers();
  }

  @Get('admin/pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng chờ xác nhận (Admin)' })
  async getPendingBookings() {
    return this.bookingService.getPendingBookings();
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy tất cả đơn hàng (Admin)' })
  async getAllBookings() {
    return this.bookingService.getAllBookings();
  }

  @Post('admin/:bookingId/confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Xác nhận thanh toán đơn hàng (Admin)' })
  async adminConfirmPayment(
    @Param('bookingId') bookingId: string,
    @CurrentUser('id') adminId: string,
    @Body('note') note?: string,
  ) {
    return this.bookingService.adminConfirmPayment(bookingId, adminId, note);
  }

  @Post('admin/:bookingId/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Từ chối đơn hàng (Admin)' })
  async adminRejectBooking(
    @Param('bookingId') bookingId: string,
    @CurrentUser('id') adminId: string,
    @Body('reason') reason: string,
  ) {
    return this.bookingService.adminRejectBooking(bookingId, adminId, reason);
  }

  @Patch('admin/users/:userId/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật trạng thái người dùng (Admin)' })
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.bookingService.updateUserStatus(userId, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng' })
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }
}