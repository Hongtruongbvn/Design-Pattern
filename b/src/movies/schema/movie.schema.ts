import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

export type MovieDocument = Movie & Document;

@Schema({ timestamps: true })
export class Movie extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, min: 1 })
  duration: number;

  @Prop({ required: true, type: [String] })
  genre: string[];

  @Prop({ required: true })
  posterUrl: string;
  
  @Prop({ type: Types.ObjectId, ref: 'Room' })
  roomId: Types.ObjectId;

  @Prop({ default: false }) // Mặc định là false
  isShowing: boolean;

  @Prop({ type: Object })
  metadata: {
    director: string;
    cast: string[];
    rating: number;
    releaseDate: Date;
  };
}

export const MovieSchema = SchemaFactory.createForClass(Movie);