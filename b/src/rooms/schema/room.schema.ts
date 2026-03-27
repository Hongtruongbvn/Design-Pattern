import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

export enum RoomType {
  STANDARD = 'standard',
  VIP = 'vip',
  IMAX = 'imax',
  _4DX = '4dx',
}

export type RoomDocument = Room & Document;

@Schema({ timestamps: true })
export class Room {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  theater: string; // Tên rạp (CGV, Lotte, v.v.)

  @Prop({ enum: RoomType, default: RoomType.STANDARD })
  type: RoomType;

  @Prop({ required: true })
  capacity: number;

  @Prop({ type: Object, required: true })
  seatLayout: {
    rows: number;
    columns: number;
    seatMap: Record<string, {
      row: string;
      number: number;
      type: 'standard' | 'vip' | 'couple';
      status: 'available' | 'maintenance';
    }>;
  };

  @Prop({ default: true })
  isActive: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);