import argon2 from 'argon2';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../app.module';
import { configureApp, loadEnvironment } from '../../main';
import { PrismaService } from '../database/prisma.service';

describe('Customer account API', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let customerId: string;
  let customerEmail: string;
  let cookies: string[] = [];

  beforeAll(async () => {
    loadEnvironment();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = moduleRef.get(PrismaService);

    customerEmail = `account-e2e-${Date.now()}@example.com`;
    const customer = await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await argon2.hash('SenhaConta123!', { type: argon2.argon2id }),
        status: UserStatus.ACTIVE,
        profile: { create: { firstName: 'Cliente', lastName: 'Conta', phone: '96981001897' } },
      },
    });
    customerId = customer.id;

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: customerEmail, password: 'SenhaConta123!' });
    expect([200, 201]).toContain(login.status);
    const setCookie = login.headers['set-cookie'];
    cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  }, 30_000);

  afterAll(async () => {
    if (customerId) await prisma.user.delete({ where: { id: customerId } });
    await app.close();
  });

  it('returns a private account summary for the authenticated customer', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/account')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      user: expect.objectContaining({
        email: customerEmail,
        profile: expect.objectContaining({ firstName: 'Cliente', lastName: 'Conta' }),
      }),
      metrics: expect.objectContaining({ orderCount: expect.any(Number), favoriteCount: expect.any(Number) }),
    }));
    expect(JSON.stringify(response.body)).not.toMatch(/passwordHash|accessToken|refreshToken/i);
  });

  it('requires a session for customer account data', async () => {
    await request(app.getHttpServer()).get('/api/v1/account').expect(401);
  });

  it('lists only the customer order scope and supports profile and address updates', async () => {
    const orders = await request(app.getHttpServer())
      .get('/api/v1/account/orders?page=1&pageSize=6')
      .set('Cookie', cookies);
    expect(orders.status).toBe(200);
    expect(orders.body).toEqual(expect.objectContaining({ items: expect.any(Array), page: 1, pageSize: 6 }));

    const profile = await request(app.getHttpServer())
      .patch('/api/v1/account/profile')
      .set('Cookie', cookies)
      .send({ firstName: 'Cliente Atualizado', lastName: 'Conta', phone: '96999999999' });
    expect(profile.status).toBe(200);
    expect(profile.body.profile).toEqual(expect.objectContaining({ firstName: 'Cliente Atualizado', phone: '96999999999' }));

    const address = await request(app.getHttpServer())
      .post('/api/v1/account/addresses')
      .set('Cookie', cookies)
      .send({ label: 'Casa', recipientName: 'Cliente Atualizado', street: 'Av. Gen. Gurjão', number: '151', district: 'Central', city: 'Macapá', state: 'ap', postalCode: '68900-050', isDefault: true });
    expect(address.status).toBe(201);
    expect(address.body).toEqual(expect.objectContaining({ label: 'Casa', state: 'AP', postalCode: '68900050', isDefault: true }));

    const addresses = await request(app.getHttpServer()).get('/api/v1/account/addresses').set('Cookie', cookies);
    expect(addresses.status).toBe(200);
    expect(addresses.body).toEqual(expect.arrayContaining([expect.objectContaining({ publicId: address.body.publicId, isDefault: true })]));
  });

  it('does not expose an order outside the authenticated customer scope', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/account/orders/order-that-does-not-belong')
      .set('Cookie', cookies);
    expect(response.status).toBe(404);
  });
});
