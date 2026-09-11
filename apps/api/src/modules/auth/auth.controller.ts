import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SessionGuard } from './guards/session.guard';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

type RequestWithCookies = Request & {
  cookies?: Record<string, string | undefined>;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
    const session = await this.authService.login(body.email, body.password);
    this.setSessionCookies(response, session.accessToken, session.refreshToken, session.expiresAt);
    return { user: session.user };
  }

  @Post('refresh')
  async refresh(@Req() request: RequestWithCookies, @Res({ passthrough: true }) response: Response) {
    const session = await this.authService.refresh(request.cookies?.je_refresh ?? '');
    this.setSessionCookies(response, session.accessToken, session.refreshToken, session.expiresAt);
    return { user: session.user };
  }

  @Post('logout')
  async logout(@Req() request: RequestWithCookies, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(request.cookies?.je_refresh);
    this.clearSessionCookies(response);
    return { ok: true };
  }

  @UseGuards(SessionGuard)
  @Get('me')
  me(@Req() request: Request & { user: unknown }) {
    return { user: request.user };
  }

  private setSessionCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
  ): void {
    const options = this.cookieOptions();
    response.cookie('je_access', accessToken, options);
    response.cookie('je_refresh', refreshToken, { ...options, expires: expiresAt });
  }

  private clearSessionCookies(response: Response): void {
    const options = this.cookieOptions();
    response.clearCookie('je_access', options);
    response.clearCookie('je_refresh', options);
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
  }
}
