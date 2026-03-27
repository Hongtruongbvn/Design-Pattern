import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShowtimeDocument = Showtime & Document;

@Schema({ timestamps: true })
export class Showtime {
  @Prop({ type: Types.ObjectId, ref: 'Movie', required: true })
  movieId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  roomId: Types.ObjectId;

  @Prop({ required: true })
  theater: string;

  @Prop({ required: true })
  room: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ type: Number, default: 100000 })
  basePrice: number;

  @Prop({ type: Object, default: {} })
  seats: Record<string, string>;

  @Prop({ default: true })
  isActive: boolean;
}

export const ShowtimeSchema = SchemaFactory.createForClass(Showtime);