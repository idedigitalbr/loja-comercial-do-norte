import 'reflect-metadata';
import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'node:path';
import { static as serveStatic } from 'express';
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
  app.setGlobalPrefix('api/v1', {
    exclude: ['webhooks/mercado-pago', 'internal/cron/process'],
  });
  // Storefront (Next.js) e admin rodam em origens separadas da API: liberar
  // apenas as origens configuradas, sempre com credenciais.
  const allowedOrigins = [process.env.APP_ORIGIN, process.env.ADMIN_ORIGIN]
    .map((origin) => origin?.trim())
    .filter((origin): origin is string => Boolean(origin));
  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : false,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", 'data:'],
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
