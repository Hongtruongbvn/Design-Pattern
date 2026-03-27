import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  VIP = 'vip',
}

export type UserDocument = User & Document & {
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  createdAt?: Date;
  updatedAt?: Date;
};

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ default: UserRole.USER, type: String, enum: UserRole })
  role: UserRole;

  @Prop({ default: false })
  IsActive: boolean;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ default: 0 })
  loyaltyPoints: number;
}

export const UserSchema = SchemaFactory.createForClass(User);



// Method để so sánh password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};