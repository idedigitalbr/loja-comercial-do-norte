import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../app.module';
import { configureApp, loadEnvironment } from '../../main';

/**
 * Jornada mínima de aceite (E8) contra a API real:
 * catálogo publicado → cotação enviada → vendas consulta/avança no admin.
 * Sem checkout/pagamento em nenhum passo.
 */
describe('Fluxo de cotação (E2E)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let adminCookie = '';
  beforeAll(async () => {
    loadEnvironment();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    server = app.getHttpServer();

    const email = process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@admin.com';
    const password = process.env.DEFAULT_ADMIN_PASSWORD ?? '';
    const login = await request(server).post('/api/v1/auth/login').send({ email, password });
    expect(login.status).toBe(201);
    {
      // Mantém apenas pares `nome=valor` (descarta atributos como HttpOnly/Path).
      const cookies = (login.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
      adminCookie = cookies.map((cookie) => cookie.split(';')[0]).join('; ');
      expect(adminCookie).toContain('je_access=');
    }
  }, 30_000);

  afterAll(async () => {
    await app.close();
  });

  it('lista o catálogo publicado sem exigir login', async () => {
    const response = await request(server).get('/api/v1/catalog/products').expect(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('registra a cotação sem login, devolve protocolo e não cria pedido', async () => {
    const products = (await request(server).get('/api/v1/catalog/products').expect(200)).body as Array<{
      variants: Array<{ id: string }>;
    }>;
    expect(products.length).toBeGreaterThan(0);
    const variantId = products[0].variants[0]?.id;
    expect(variantId).toBeTruthy();

    const publicId = `e2e-${Date.now()}`;
    const created = await request(server)
      .post('/api/v1/quotes')
      .send({
        customerName: 'Cliente de Teste E2E',
        customerPhone: '(91) 90000-0000',
        customerEmail: 'e2e@example.com',
        notes: 'Solicitação criada pelo teste automatizado.',
        idempotencyKey: publicId,
        items: [{ variantId, quantity: 2 }],
      })
      .expect(201);

    expect(created.body).toEqual(expect.objectContaining({
      publicId: expect.any(String),
      status: 'REQUESTED',
      itemsCount: 2,
    }));
    expect(created.body.subtotalCents).toBeGreaterThan(0);

    // Idempotência: a mesma chave devolve a mesma cotação.
    const repeated = await request(server)
      .post('/api/v1/quotes')
      .send({
        customerName: 'Cliente de Teste E2E',
        customerPhone: '(91) 90000-0000',
        idempotencyKey: publicId,
        items: [{ variantId, quantity: 2 }],
      })
      .expect(201);
    expect(repeated.body.publicId).toBe(created.body.publicId);

    // Consulta pública com telefone mascarado.
    const publicView = await request(server).get(`/api/v1/quotes/${created.body.publicId}`).expect(200);
    expect(publicView.body.customerPhone).toMatch(/^\*+0000$/);
    expect(publicView.body).not.toHaveProperty('events');

    // Nenhum pedido foi criado: a fase 1 não converte cotação em venda.
    const orders = await request(server).get('/api/v1/orders').expect(401);
    expect(orders.body.code).toBeTruthy();
  });

  it('mantém checkout desligado por padrão (fase 1)', async () => {
    const response = await request(server).post('/api/v1/checkout/quote').send({ cartId: 'inexistente' });
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('FEATURE_NOT_AVAILABLE');
  });

  it('permite que o admin veja e avance a cotação (quando há sessão)', async () => {
    const list = await request(server).get('/api/v1/admin/quotes?status=REQUESTED&pageSize=5').set('Cookie', adminCookie).expect(200);
    expect(Array.isArray(list.body.items)).toBe(true);
    expect(list.body.counts).toBeTruthy();
    expect(list.body.items.length).toBeGreaterThan(0);

    const quote = list.body.items[0];
    const advanced = await request(server)
      .patch(`/api/v1/admin/quotes/${quote.id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'IN_REVIEW', reason: 'Teste E2E' })
      .expect(200);
    expect(advanced.body.status).toBe('IN_REVIEW');
  });

  it('protege a fila de cotações sem sessão', async () => {
    const response = await request(server).get('/api/v1/admin/quotes');
    expect(response.status).toBe(401);
  });
});
