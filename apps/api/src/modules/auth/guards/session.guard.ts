import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

type RequestWithAuth = {
  headers?: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string | undefined>;
  user?: unknown;
};

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const cookieValue = request.cookies?.je_access;
    const authHeader = typeof request.headers?.authorization === 'string'
      ? request.headers.authorization
      : undefined;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const token = cookieValue || bearerToken;
    if (!token) {
      throw new UnauthorizedException('AUTHENTICATION_REQUIRED');
    }

    request.user = await this.authService.validateAccessToken(token);
    return true;
  }
}
