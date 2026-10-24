import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Rate limit simples em memória para endpoints públicos (cotação, busca).
 *
 * Limitação conhecida: o contador é por instância do processo. Em produção com
 * múltiplas réplicas, trocar por um store compartilhado (Redis) — registrado no
 * roadmap F4. O IP depende de trust proxy no reverse proxy para ser o real.
 */
export const PUBLIC_RATE_LIMIT = 'public_rate_limit';

export type PublicRateLimitOptions = { limit: number; windowMs: number };

export const PublicRateLimit = (options: PublicRateLimitOptions) => SetMetadata(PUBLIC_RATE_LIMIT, options);

type Bucket = { count: number; resetAt: number };
const MAX_TRACKED_KEYS = 10_000;
const buckets = new Map<string, Bucket>();

/** Exposto para testes. */
export function resetPublicRateLimit(): void {
  buckets.clear();
}

function pruneExpired(now: number): void {
  if (buckets.size <= MAX_TRACKED_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

@Injectable()
export class PublicRateLimitGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.get<PublicRateLimitOptions>(PUBLIC_RATE_LIMIT, context.getHandler());
    if (!options) return true;

    const request = context.switchToHttp().getRequest<{ ip?: string; method?: string; route?: { path?: string } }>();
    const now = Date.now();
    pruneExpired(now);
    const key = `${request.method ?? 'GET'}:${request.route?.path ?? 'unknown'}:${request.ip ?? 'unknown'}`;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return true;
    }

    bucket.count += 1;
    if (bucket.count > options.limit) {
      throw new HttpException(
        { code: 'RATE_LIMITED', message: 'Muitas solicitações em sequência. Aguarde alguns instantes.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
