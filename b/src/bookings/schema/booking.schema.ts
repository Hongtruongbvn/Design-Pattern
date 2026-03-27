import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BookingStatus {
  PENDING = 'pending',      // Chờ xác nhận thanh toán
  CONFIRMED = 'confirmed',  // Đã xác nhận thanh toán
  CANCELLED = 'cancelled',  // Đã hủy
  COMPLETED = 'completed',  // Đã hoàn thành (đã chiếu)
}

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Showtime', required: true })
  showtimeId: Types.ObjectId;

  @Prop({ type: [String], required: true })
  seats: string[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop()
  paymentId: string;

  @Prop({ type: Object })
  paymentDetails: {
    method: string;
    transactionId: string;
    paidAt: Date;
    adminNote?: string;
    confirmedBy?: string;
  };

  @Prop({ type: Object })
  ticketDetails: {
    qrCode: string;
    bookingCode: string;
  };
}

export const BookingSchema = SchemaFactory.createForClass(Booking);