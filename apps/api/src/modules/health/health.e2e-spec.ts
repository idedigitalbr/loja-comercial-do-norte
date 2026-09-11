import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../app.module';
import { configureApp, loadEnvironment } from '../../main';

describe('Health API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    loadEnvironment();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns database readiness and request id', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect(({ body, headers }) => {
        expect(body.status).toBe('ok');
        expect(body.database).toBe('up');
        expect(body.requestId).toEqual(expect.any(String));
        expect(headers['x-request-id']).toBe(body.requestId);
      });
  });

  it('returns a standardized error with the propagated request id', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/route-that-does-not-exist')
      .set('x-request-id', 'req_test_health')
      .expect(404)
      .expect(({ body, headers }) => {
        expect(body.code).toBe('HTTP_ERROR');
        expect(body.requestId).toBe('req_test_health');
        expect(headers['x-request-id']).toBe('req_test_health');
      });
  });
});
