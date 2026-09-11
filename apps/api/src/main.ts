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
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { loadEnvironment as loadEnvironmentFromSchema } from './config/env.schema';

export function configureApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix('api/v1', {
    exclude: ['webhooks/mercado-pago', 'internal/cron/process'],
  });
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(helmet());
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
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(environment.PORT, '0.0.0.0');
}

if (require.main === module) {
  void bootstrap();
}
