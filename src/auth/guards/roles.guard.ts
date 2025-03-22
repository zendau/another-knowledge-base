import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Type,
  mixin,
} from '@nestjs/common';
import { UserRole } from '@/user/entiries/user.entity';

const RoleGuard = (requiredRole: UserRole): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        throw new ForbiddenException('Access denied: User not auth');
      }

      if (!user.role || !requiredRole) {
        throw new ForbiddenException('Access denied: Role is undefined');
      }

      return user.role === requiredRole;
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;
