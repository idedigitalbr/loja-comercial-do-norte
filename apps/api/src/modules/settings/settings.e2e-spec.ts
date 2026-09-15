import argon2 from 'argon2';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../database/prisma.service';
import { configureApp, loadEnvironment } from '../../main';

describe('Settings API', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminEmail: string;
  let cookies: string[] = [];

  beforeAll(async () => {
    loadEnvironment();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = moduleRef.get(PrismaService);

    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (!adminRole) throw new Error('ADMIN role must be seeded before running API e2e tests.');

    adminEmail = `settings-e2e-${Date.now()}@example.com`;
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await argon2.hash('SenhaE2e123!', { type: argon2.argon2id }),
        status: UserStatus.ACTIVE,
        roles: { create: { roleId: adminRole.id } },
      },
    });

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: 'SenhaE2e123!' });
    if (login.status !== 201 && login.status !== 200) throw new Error(`Admin e2e login failed with ${login.status}.`);
    const setCookie = login.headers['set-cookie'];
    cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  }, 30_000);

  afterAll(async () => {
    if (adminEmail) await prisma.user.delete({ where: { email: adminEmail } });
    await app.close();
  });

  it('exposes only sanitized public site configuration', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/site/config')
      .expect(200)
      .expect(({ body }) => {
        expect(body.site).toEqual(expect.objectContaining({ siteName: expect.any(String) }));
        expect(body).not.toHaveProperty('payments');
        expect(body).not.toHaveProperty('smtp');
        expect(JSON.stringify(body)).not.toMatch(/accessToken|passwordEncrypted|webhookSecret/i);
      });
  });

  it('requires authentication for administrative settings', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/settings')
      .expect(401);
  });

  it('allows an administrator to read masked settings without returning secrets', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/admin/settings')
      .set('Cookie', cookies);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ site: expect.any(Object), payments: expect.any(Object), smtp: expect.any(Object) }));
    expect(response.body.payments).not.toHaveProperty('accessToken');
    expect(response.body.smtp).not.toHaveProperty('password');
  });

  it('validates banner CTA destinations at the HTTP boundary', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/settings/banners')
      .set('Cookie', cookies)
      .send({ desktopPath: '/storage/banner.webp', ctaHref: 'javascript:alert(1)' });
    expect(response.status).toBe(400);
  });
});
