export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin' | 'vip';
  phoneNumber: string;
  isActive: boolean;
  loyaltyPoints: number;
  createdAt?: string;
  updatedAt?: string;
}
export interface Movie {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  genre: string[];
  posterUrl: string;
  isShowing?: boolean;
  metadata?: {
    director: string;
    cast: string[];
    rating: number;
    releaseDate: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
// Thêm vào file types.ts
export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailData {
  token: string;
}
export interface Showtime {
  _id: string;
  movieId: string | Movie;
  theater: string;
  room: string;
  startTime: Date;
  endTime: Date;
  basePrice: number;
  seats: Record<string, string>;
  isActive: boolean;
}

export interface Booking {
  _id: string;
  userId: string | User;
  showtimeId: string | Showtime;
  seats: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentId?: string;
  paymentDetails?: {
    method: string;
    transactionId: string;
    paidAt: Date;
  };
  ticketDetails?: {
    qrCode: string;
    bookingCode: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface ApiError {
  response?: {
    data?: {
      message: string;
    };
  };
  message: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailData {
  token: string;
}