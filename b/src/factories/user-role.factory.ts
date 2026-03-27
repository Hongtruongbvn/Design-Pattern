import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/user/schema/user.schema';

export interface RolePermissions {
  canBookTickets: boolean;
  canCancelBookings: boolean;
  canManageMovies: boolean;
  canViewReports: boolean;
  discountPercentage: number;
  priorityBooking: boolean;
}

@Injectable()
export class UserRoleFactory {
  private readonly rolePermissions: Map<UserRole, RolePermissions> = new Map([
    [UserRole.USER, {
      canBookTickets: true,
      canCancelBookings: true,
      canManageMovies: false,
      canViewReports: false,
      discountPercentage: 0,
      priorityBooking: false,
    }],
    [UserRole.VIP, {
      canBookTickets: true,
      canCancelBookings: true,
      canManageMovies: false,
      canViewReports: false,
      discountPercentage: 15,
      priorityBooking: true,
    }],
    [UserRole.ADMIN, {
      canBookTickets: true,
      canCancelBookings: true,
      canManageMovies: true,
      canViewReports: true,
      discountPercentage: 0,
      priorityBooking: true,
    }],
  ]);

  createRolePermissions(role: UserRole): RolePermissions {
    const permissions = this.rolePermissions.get(role);
    if (!permissions) {
      throw new Error(`Invalid role: ${role}`);
    }
    return { ...permissions };
  }

  upgradeToVip(user: any): any {
    return {
      ...user,
      role: UserRole.VIP,
      loyaltyPoints: (user.loyaltyPoints || 0) + 100,
    };
  }

  calculatePriceWithDiscount(basePrice: number, role: UserRole): number {
    const permissions = this.createRolePermissions(role);
    const discount = permissions.discountPercentage;
    return basePrice * (1 - discount / 100);
  }
}