import { UserRole } from "src/user/schema/user.schema";

export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    phoneNumber: string;
    isActive: boolean;
  };
  token: string;
  message?: string;
}