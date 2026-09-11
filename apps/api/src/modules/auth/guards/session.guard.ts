import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

type RequestWithAuth = {
  cookies?: Record<string, string | undefined>;
  user?: unknown;
};

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const cookieValue = request.cookies?.je_access;
    if (!cookieValue) {
      throw new UnauthorizedException('AUTHENTICATION_REQUIRED');
    }

    request.user = await this.authService.validateAccessToken(cookieValue);
    return true;
  }
}
