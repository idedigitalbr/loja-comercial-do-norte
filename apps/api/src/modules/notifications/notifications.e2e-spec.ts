import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../app.module';
import { configureApp, loadEnvironment } from '../../main';

describe('Notifications API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    loadEnvironment();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  }, 30_000);

  afterAll(async () => {
    await app.close();
  });

  it('protects SMTP test sends and template test sends with an admin session', async () => {
    const emailTest = await request(app.getHttpServer())
      .post('/api/v1/admin/settings/email/test')
      .send({ recipient: 'cliente@example.com' });
    const templateTest = await request(app.getHttpServer())
      .post('/api/v1/admin/settings/templates/ORDER_CREATED/pt-BR/test')
      .send({ recipient: 'cliente@example.com' });

    expect(emailTest.status).toBe(401);
    expect(templateTest.status).toBe(401);
  });
});
