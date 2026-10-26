import 'reflect-metadata';
import {
  BadRequestException,
  INestApplication,
  RequestMethod,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'node:path';
import { static as serveStatic } from 'express';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { loadEnvironment as loadEnvironmentFromSchema } from './config/env.schema';
import { assertProductionConfiguration } from './config/production.config';
import { resolveApiProjectRoot, resolveApiStorageRoot } from './modules/files/storage-root';

export function configureApp(app: INestApplication): INestApplication {
  const httpServer = app.getHttpAdapter().getInstance();
  httpServer.use('/admin/assets', serveStatic(join(resolveApiProjectRoot(), 'public/admin/assets')));
  httpServer.use('/storage/uploads', serveStatic(join(resolveApiStorageRoot(), 'uploads')));
  httpServer.use('/storage/uploads', serveStatic(join(resolveApiProjectRoot(), 'public/storage/uploads')));
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: 'admin', method: RequestMethod.GET },
      { path: 'admin/assets/(.*)', method: RequestMethod.GET },
      { path: 'webhooks/mercado-pago', method: RequestMethod.ALL },
      { path: 'internal/cron/process', method: RequestMethod.ALL },
    ],
  });

  const authorizedOrigins = new Set<string>([
    'https://loja-comercialdonorte.vercel.app',
    'https://lojacomercialdonorte.vercel.app',
    'https://admin-comercialdonorte.vercel.app',
    ...[process.env.APP_ORIGIN, process.env.ADMIN_ORIGIN]
      .flatMap((orig) => (orig ? orig.split(',').map((o) => o.trim()) : []))
      .filter(Boolean),
  ]);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (authorizedOrigins.has(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
        try {
          const local = new URL(origin);
          if (['http:', 'https:'].includes(local.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(local.hostname)) return callback(null, true);
        } catch { /* Malformed origins are refused. */ }
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", 'data:', 'blob:'],
        frameSrc: ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
      },
    },
  }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Verifique os campos informados.',
          fieldErrors: errors.reduce<Record<string, string[]>>((result, error) => {
            result[error.property] = Object.values(error.constraints ?? {});
            return result;
          }, {}),
        }),
    }),
  );
  app.useGlobalInterceptors(new RequestIdInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());
  return app;
}

export function loadEnvironment() {
  return loadEnvironmentFromSchema();
}

let cachedHandler: ((req: Request, res: Response) => void) | null = null;

export async function getOrCreateHandler(): Promise<(req: Request, res: Response) => void> {
  if (cachedHandler) return cachedHandler;
  loadEnvironment();
  if (process.env.NODE_ENV === 'production') assertProductionConfiguration(process.env);
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.init();
  const instance = app.getHttpAdapter().getInstance();
  cachedHandler = (req: Request, res: Response) => instance(req, res);
  return cachedHandler;
}

// Handler padrão compatível com Vercel Functions (Fluid Compute)
export default async function handler(req: Request, res: Response) {
  const h = await getOrCreateHandler();
  return h(req, res);
}

async function bootstrap() {
  const environment = loadEnvironment();
  if (process.env.NODE_ENV === 'production') assertProductionConfiguration(process.env);
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(environment.PORT, '0.0.0.0');
}

if (require.main === module) {
  void bootstrap();
}
