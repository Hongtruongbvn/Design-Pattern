import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "src/user/schema/user.schema";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string
    });
  }

  async validate(payload: JwtPayload) {
    console.log('JWT Strategy validate - payload:', payload); // Debug
    
    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not exist');
    }

    if (!user.IsActive) {
      throw new UnauthorizedException('Please verify your email');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };
  }
}