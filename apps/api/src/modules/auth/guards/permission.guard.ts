import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../auth.service';

const PERMISSIONS_KEY = 'required_permissions';

export const Permissions = {
  PRODUCTS_WRITE: 'products.write',
  INVENTORY_ADJUST: 'inventory.adjust',
  ORDERS_UPDATE: 'orders.update',
  PAYMENTS_REFUND: 'payments.refund',
  PROMOTIONS_PUBLISH: 'promotions.publish',
  REPORTS_FINANCIAL: 'reports.financial',
} as const;

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const permissions = request.user?.permissions ?? [];
    if (!required.every((permission) => permissions.includes(permission))) {
      throw new ForbiddenException('INSUFFICIENT_PERMISSIONS');
    }
    return true;
  }
}
