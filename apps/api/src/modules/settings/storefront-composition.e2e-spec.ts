import 'reflect-metadata';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AuthService } from '../auth/auth.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { PrismaService } from '../database/prisma.service';
import { StorefrontCompositionService } from './storefront-composition.service';
import { StorefrontCompositionController, PublicStorefrontCompositionController } from './storefront-composition.controller';

// Never inherit DATABASE_URL: this suite owns a random schema on loopback only.
const databaseUrl = process.env.COMPOSITION_TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:55432/postgres';
const url = new URL(databaseUrl);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw new Error('COMPOSITION_TEST_DATABASE_URL must use loopback');
const schema = `cn_editor_test_${randomUUID().replaceAll('-', '')}`;
url.searchParams.set('schema', schema);
const prisma = new PrismaService({ datasources: { db: { url: url.toString() } } });
const composition = { page: 'home', version: 1, widgets: [{ id: 'hero', type: 'hero-carousel', enabled: true, order: 0, props: { slides: [] } }] };
let app: INestApplication;
let schemaCreated = false;

describe('Storefront publication HTTP + real PostgreSQL (isolated schema)', () => {
  beforeAll(async () => {
    await prisma.$connect();
    await prisma.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    schemaCreated = true;
    await prisma.$executeRawUnsafe(`CREATE TYPE "${schema}"."ActorType" AS ENUM ('USER', 'SYSTEM', 'PROVIDER')`);
    await prisma.$executeRawUnsafe(`CREATE TABLE "${schema}"."SiteConfiguration" ("id" text PRIMARY KEY, "homeComposition" jsonb, "updatedAt" timestamp NOT NULL DEFAULT now())`);
    await prisma.$executeRawUnsafe(`CREATE TABLE "${schema}"."AuditLog" ("id" text PRIMARY KEY, "actorType" "${schema}"."ActorType" NOT NULL, "actorId" text, "action" varchar(120) NOT NULL, "entityType" varchar(120) NOT NULL, "entityId" varchar(191) NOT NULL, "beforeJson" jsonb, "afterJson" jsonb, "requestId" varchar(100), "createdAt" timestamp NOT NULL DEFAULT now())`);
    const module = await Test.createTestingModule({
      controllers: [StorefrontCompositionController, PublicStorefrontCompositionController],
      providers: [StorefrontCompositionService, SessionGuard, PermissionGuard,
        { provide: PrismaService, useValue: prisma },
        { provide: AuthService, useValue: { validateAccessToken: async (token: string) => {
          if (!['editor', 'viewer', 'restorer'].includes(token)) throw new UnauthorizedException();
          return { id: token, publicId: token, email: `${token}@localhost`, roles: [], permissions: token === 'viewer' ? [] : ['settings.manage'] };
        } } },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });
  beforeEach(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.$executeRawUnsafe(`INSERT INTO "${schema}"."SiteConfiguration" (id, "homeComposition") VALUES ('default', '${JSON.stringify(composition)}'::jsonb) ON CONFLICT (id) DO UPDATE SET "homeComposition" = EXCLUDED."homeComposition"`);
  });
  afterAll(async () => {
    await app?.close();
    try {
      if (schemaCreated) await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    } finally { await prisma.$disconnect(); }
  });
  it('requires session and settings.manage even when a caller spoofs admin headers', async () => {
    await request(app.getHttpServer()).post('/api/v1/admin/storefront/composition').set('x-admin-role', 'ADMIN').send(composition).expect(401);
    await request(app.getHttpServer()).post('/api/v1/admin/storefront/composition').auth('viewer', { type: 'bearer' }).send(composition).expect(403);
    await request(app.getHttpServer()).get('/api/v1/admin/storefront/revisions').expect(401);
    expect(await prisma.auditLog.count()).toBe(0);
  });
  it('publishes durably and exposes only composition to anonymous visitors', async () => {
    const changed = { ...composition, version: 2 };
    const result = await request(app.getHttpServer()).post('/api/v1/admin/storefront/composition').auth('editor', { type: 'bearer' }).send(changed).expect(201);
    const publicResult = await request(app.getHttpServer()).get('/api/v1/site/composition').expect(200);
    expect(publicResult.body).toEqual({ data: changed });
    expect((await prisma.auditLog.findUniqueOrThrow({ where: { id: result.body.data.id } })).actorType).toBe('USER');
    expect((await prisma.auditLog.findUniqueOrThrow({ where: { id: result.body.data.id } })).actorId).toBe('editor');
  });
  it('rolls back composition when checkpoint insertion fails in PostgreSQL', async () => {
    await prisma.$executeRawUnsafe(`ALTER TABLE "${schema}"."AuditLog" ADD CONSTRAINT reject_checkpoint CHECK ("entityType" <> 'StorefrontComposition')`);
    try {
      await request(app.getHttpServer()).post('/api/v1/admin/storefront/composition').auth('editor', { type: 'bearer' }).send({ ...composition, version: 9 }).expect(500);
      expect(await new StorefrontCompositionService(prisma).getComposition()).toEqual(composition);
      expect(await prisma.auditLog.count()).toBe(0);
    } finally { await prisma.$executeRawUnsafe(`ALTER TABLE "${schema}"."AuditLog" DROP CONSTRAINT reject_checkpoint`); }
  });
  it('does not insert a revision without an existing site configuration', async () => {
    await prisma.siteConfiguration.deleteMany();
    await request(app.getHttpServer()).post('/api/v1/admin/storefront/composition').auth('editor', { type: 'bearer' }).send(composition).expect(500);
    expect(await prisma.auditLog.count()).toBe(0);
  });
  it('restores a checkpoint with the current editor as author and keeps the original', async () => {
    const first = await request(app.getHttpServer()).post('/api/v1/admin/storefront/composition').auth('editor', { type: 'bearer' }).send(composition).expect(201);
    const restored = await request(app.getHttpServer()).post(`/api/v1/admin/storefront/revisions/${first.body.data.id}/restore`).auth('restorer', { type: 'bearer' }).send({}).expect(201);
    expect(restored.body.data.authorEmail).toBe('restorer@localhost');
    expect(restored.body.data.id).not.toBe(first.body.data.id);
    expect(await prisma.auditLog.count()).toBe(2);
  });
  it('rejects invalid compositions and missing revisions without writing', async () => {
    await request(app.getHttpServer()).post('/api/v1/admin/storefront/composition').auth('editor', { type: 'bearer' }).send({ ...composition, widgets: [{ ...composition.widgets[0], type: 'untrusted-html' }] }).expect(400);
    await request(app.getHttpServer()).post('/api/v1/admin/storefront/revisions/missing/restore').auth('editor', { type: 'bearer' }).send({}).expect(404);
    expect(await prisma.auditLog.count()).toBe(0);
  });
});
