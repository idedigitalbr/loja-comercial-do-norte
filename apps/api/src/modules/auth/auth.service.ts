import argon2 from 'argon2';
import { EmailEventKey, Prisma, UserStatus } from '@prisma/client';
import {
  ConflictException,
  Inject,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const accessUserSelect = {
  id: true,
  publicId: true,
  email: true,
  status: true,
  roles: {
    select: {
      role: {
        select: {
          name: true,
          permissions: {
            select: { permission: { select: { code: true } } },
          },
        },
      },
    },
  },
} as const;
const authUserSelect = { ...accessUserSelect, passwordHash: true } as const;

type AccessUser = Prisma.UserGetPayload<{ select: typeof accessUserSelect }>;
type AuthUser = Prisma.UserGetPayload<{ select: typeof authUserSelect }>;

export type AuthenticatedUser = {
  id: string;
  publicId: string;
  email: string;
  roles: string[];
  permissions: string[];
};

export type AuthSessionResult = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: AuthenticatedUser;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Optional() @Inject(NotificationsService) private readonly notifications?: NotificationsService,
  ) {}

  async register(input: { email: string; password: string; firstName: string; lastName: string }) {
    const email = input.email.trim().toLowerCase();
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const existing = await transaction.user.findUnique({ where: { email }, select: { id: true } });
        if (existing) throw new ConflictException('EMAIL_ALREADY_REGISTERED');
        const user = await transaction.user.create({
          data: {
            email,
            passwordHash,
            status: UserStatus.ACTIVE,
            profile: { create: { firstName: input.firstName.trim(), lastName: input.lastName.trim() } },
          },
          select: { id: true, publicId: true, email: true },
        });
        try {
          await this.notifications?.enqueue(EmailEventKey.ACCOUNT_CREATED, {
            entityId: user.id,
            userId: user.id,
            recipient: user.email,
            customerName: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
            email: user.email,
            loginUrl: '/entrar',
          }, transaction);
        } catch {
          // A notification failure must not invalidate a successful account registration.
        }
        return user;
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('EMAIL_ALREADY_REGISTERED');
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthSessionResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: authUserSelect,
    });

    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      !(await argon2.verify(user.passwordHash, password))
    ) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    return this.issueSession(user);
  }

  async refresh(refreshToken: string): Promise<AuthSessionResult> {
    const session = await this.findSessionByRefreshToken(refreshToken);
    if (!session) {
      throw new UnauthorizedException('SESSION_REVOKED');
    }

    const revokedAt = new Date();
    const updated = await this.prisma.session.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt },
    });
    if (updated.count !== 1) {
      throw new UnauthorizedException('SESSION_REVOKED');
    }

    return this.issueSession(session.user);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    const session = await this.findSessionByRefreshToken(refreshToken);
    if (session) {
      await this.prisma.session.updateMany({
        where: { id: session.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true, status: true } });
    if (!user || user.status !== UserStatus.ACTIVE || !(await argon2.verify(user.passwordHash, currentPassword))) {
      throw new UnauthorizedException('INVALID_CURRENT_PASSWORD');
    }
    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      this.prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    return { ok: true };
  }

  async validateAccessToken(accessToken: string): Promise<AuthenticatedUser> {
    const payload = this.verifyAccessToken(accessToken);
    const session = await this.prisma.session.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { user: { select: accessUserSelect } },
    });

    if (!session || session.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('SESSION_REVOKED');
    }

    return this.toAuthenticatedUser(session.user);
  }

  private async findSessionByRefreshToken(refreshToken: string) {
    if (!refreshToken) return null;

    const sessions = await this.prisma.session.findMany({
      where: { revokedAt: null, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        tokenHash: true,
        user: { select: accessUserSelect },
      },
    });

    for (const session of sessions) {
      if (await argon2.verify(session.tokenHash, refreshToken)) {
        if (session.user.status !== UserStatus.ACTIVE) return null;
        return session;
      }
    }

    return null;
  }

  private async issueSession(user: AuthUser | AccessUser): Promise<AuthSessionResult> {
    const refreshToken = randomBytes(48).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const tokenHash = await argon2.hash(refreshToken, { type: argon2.argon2id });
    const session = await this.prisma.session.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    return {
      accessToken: this.signAccessToken({
        sessionId: session.id,
        userId: user.id,
        expiresAt,
      }),
      refreshToken,
      expiresAt,
      user: this.toAuthenticatedUser(user),
    };
  }

  private toAuthenticatedUser(user: AccessUser): AuthenticatedUser {
    const roles = user.roles.map(({ role }) => role.name);
    const permissions = user.roles.flatMap(({ role }) =>
      role.permissions.map(({ permission }) => permission.code),
    );

    return {
      id: user.id,
      publicId: user.publicId,
      email: user.email,
      roles: [...new Set(roles)],
      permissions: [...new Set(permissions)],
    };
  }

  private signAccessToken(input: {
    sessionId: string;
    userId: string;
    expiresAt: Date;
  }): string {
    const payload = Buffer.from(
      JSON.stringify({
        sessionId: input.sessionId,
        userId: input.userId,
        exp: Math.floor(input.expiresAt.getTime() / 1000),
      }),
    ).toString('base64url');
    return `${payload}.${this.sign(payload)}`;
  }

  private verifyAccessToken(token: string): {
    sessionId: string;
    userId: string;
    exp: number;
  } {
    try {
      const [payload, signature] = token.split('.');
      if (!payload || !signature || !this.isValidSignature(payload, signature)) {
        throw new Error('invalid signature');
      }
      const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
        sessionId?: string;
        userId?: string;
        exp?: number;
      };
      if (
        !parsed.sessionId ||
        !parsed.userId ||
        !parsed.exp ||
        parsed.exp <= Math.floor(Date.now() / 1000)
      ) {
        throw new Error('expired token');
      }
      return parsed as { sessionId: string; userId: string; exp: number };
    } catch {
      throw new UnauthorizedException('INVALID_ACCESS_TOKEN');
    }
  }

  private sign(payload: string): string {
    return createHmac('sha256', process.env.COOKIE_SECRET ?? 'development-cookie-secret')
      .update(payload)
      .digest('base64url');
  }

  private isValidSignature(payload: string, signature: string): boolean {
    const expected = Buffer.from(this.sign(payload));
    const received = Buffer.from(signature);
    return expected.length === received.length && timingSafeEqual(expected, received);
  }
}
