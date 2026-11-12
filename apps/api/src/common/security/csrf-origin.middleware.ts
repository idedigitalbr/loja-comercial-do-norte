import type { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

function getHeader(request: Request, name: string): string | undefined {
  const value = request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

export function isAuthorizedRequestOrigin(
  candidateOrigin: string,
  authorizedOrigins: Set<string>,
  isProductionEnv: boolean,
): boolean {
  if (authorizedOrigins.has(candidateOrigin)) {
    return true;
  }
  if (!isProductionEnv) {
    try {
      const parsed = new URL(candidateOrigin);
      return (
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        LOCAL_HOSTNAMES.has(parsed.hostname)
      );
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Mitiga CSRF em requisições mutáveis autenticadas por cookie (especialmente
 * com SameSite=None entre origens admin/storefront e API).
 */
export function createCsrfOriginMiddleware(authorizedOrigins: Set<string>) {
  return function csrfOriginMiddleware(req: Request, res: Response, next: NextFunction) {
    if (SAFE_METHODS.has(req.method.toUpperCase())) {
      next();
      return;
    }

    const requestPath = req.originalUrl || req.url || '';
    if (
      requestPath.startsWith('/api/v1/webhooks/') ||
      requestPath.startsWith('/api/v1/internal/cron/')
    ) {
      next();
      return;
    }

    const isProductionEnv =
      process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

    const secFetchSite = getHeader(req, 'sec-fetch-site')?.toLowerCase();
    if (secFetchSite === 'cross-site') {
      res.status(403).json({
        code: 'CSRF_ORIGIN_BLOCKED',
        message: 'Requisição cross-site não autorizada.',
      });
      return;
    }

    const originHeader = getHeader(req, 'origin')?.trim();
    if (originHeader) {
      if (!isAuthorizedRequestOrigin(originHeader, authorizedOrigins, isProductionEnv)) {
        res.status(403).json({
          code: 'CSRF_ORIGIN_BLOCKED',
          message: 'Origem não autorizada.',
        });
        return;
      }
      next();
      return;
    }

    const refererHeader = getHeader(req, 'referer')?.trim();
    if (refererHeader) {
      let refererOrigin = '';
      try {
        refererOrigin = new URL(refererHeader).origin;
      } catch {
        res.status(403).json({
          code: 'CSRF_ORIGIN_BLOCKED',
          message: 'Referer inválido.',
        });
        return;
      }
      if (!isAuthorizedRequestOrigin(refererOrigin, authorizedOrigins, isProductionEnv)) {
        res.status(403).json({
          code: 'CSRF_ORIGIN_BLOCKED',
          message: 'Referer não autorizado.',
        });
        return;
      }
      next();
      return;
    }

    const authHeader = getHeader(req, 'authorization');
    const hasBearerToken = Boolean(authHeader && /^Bearer\s+\S+/i.test(authHeader));
    const cookies = (req as Request & { cookies?: Record<string, string | undefined> }).cookies;
    const rawCookieHeader = getHeader(req, 'cookie') ?? '';
    const hasSessionCookie =
      Boolean(cookies?.je_access || cookies?.je_refresh) ||
      /\b(?:je_access|je_refresh)=/.test(rawCookieHeader);

    if (isProductionEnv && hasSessionCookie && !hasBearerToken) {
      res.status(403).json({
        code: 'CSRF_ORIGIN_REQUIRED',
        message: 'Cabeçalho Origin obrigatório para requisições autenticadas por cookie.',
      });
      return;
    }

    next();
  };
}
