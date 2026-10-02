import argon2 from 'argon2';
import { ActorType, EmailEventKey, OrderItemType, OrderStatus, PrismaClient, UserStatus } from '@prisma/client';
import { seedDefaultHomeBanners } from '../apps/api/src/modules/settings/default-home-banners';

const prisma = new PrismaClient();

const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL?.trim().toLowerCase() || 'admin@admin.com';
const defaultCustomerEmail = process.env.DEFAULT_CUSTOMER_EMAIL?.trim().toLowerCase() || 'cliente@demo.com';

const permissions = [
  ['products.write', 'Criar e editar produtos'],
  ['inventory.adjust', 'Ajustar estoque'],
  ['orders.update', 'Atualizar pedidos'],
  ['payments.refund', 'Solicitar reembolso'],
  ['promotions.publish', 'Publicar promoções'],
  ['reports.financial', 'Visualizar relatórios financeiros'],
  ['settings.manage', 'Gerenciar configurações do site'],
  ['payments.manage', 'Gerenciar integração de pagamentos'],
  ['notifications.manage', 'Gerenciar notificações e e-mails'],
] as const;

const emailTemplates = [
  { key: EmailEventKey.ACCOUNT_CREATED, subject: 'Bem-vinda à {{siteName}}', htmlBody: '<p>Olá {{customerName}},</p><p>Seu cadastro foi criado com sucesso. Acesse <a href="{{loginUrl}}">sua conta</a>.</p>', textBody: 'Olá {{customerName}}, seu cadastro foi criado com sucesso. Acesse: {{loginUrl}}.' },
  { key: EmailEventKey.ORDER_CREATED, subject: 'Pedido {{orderId}} recebido', htmlBody: '<p>Olá {{customerName}},</p><p>Recebemos o pedido <strong>{{orderId}}</strong> no valor de {{total}}.</p><p>Acompanhe em {{orderUrl}}.</p>', textBody: 'Olá {{customerName}}, recebemos o pedido {{orderId}} no valor de {{total}}. Acompanhe em {{orderUrl}}.' },
  { key: EmailEventKey.PAYMENT_PENDING, subject: 'Pagamento pendente do pedido {{orderId}}', htmlBody: '<p>O pagamento do pedido {{orderId}} está aguardando confirmação.</p><p>Valor: {{total}}</p>', textBody: 'O pagamento do pedido {{orderId}} está aguardando confirmação. Valor: {{total}}.' },
  { key: EmailEventKey.PAYMENT_APPROVED, subject: 'Pagamento aprovado — pedido {{orderId}}', htmlBody: '<p>Seu pagamento foi aprovado e o pedido {{orderId}} seguirá para preparação.</p>', textBody: 'Seu pagamento foi aprovado e o pedido {{orderId}} seguirá para preparação.' },
  { key: EmailEventKey.PAYMENT_REJECTED, subject: 'Não foi possível aprovar o pagamento do pedido {{orderId}}', htmlBody: '<p>O pagamento do pedido {{orderId}} não foi aprovado. Revise os dados ou escolha outra forma de pagamento.</p>', textBody: 'O pagamento do pedido {{orderId}} não foi aprovado. Revise os dados ou escolha outra forma de pagamento.' },
  { key: EmailEventKey.ORDER_STATUS_CHANGED, subject: 'Atualização do pedido {{orderId}}', htmlBody: '<p>O status do pedido {{orderId}} mudou para <strong>{{status}}</strong>.</p><p>Acompanhe em {{orderUrl}}.</p>', textBody: 'O status do pedido {{orderId}} mudou para {{status}}. Acompanhe em {{orderUrl}}.' },
  { key: EmailEventKey.PASSWORD_RESET, subject: 'Recupere o acesso à {{siteName}}', htmlBody: '<p>Olá {{customerName}},</p><p>Use este link para redefinir sua senha: <a href="{{resetUrl}}">{{resetUrl}}</a>.</p>', textBody: 'Olá {{customerName}}, use este link para redefinir sua senha: {{resetUrl}}.' },
] as const;

async function main(): Promise<void> {
  const passwordVariables = ['DEFAULT_ADMIN_PASSWORD', 'DEFAULT_CUSTOMER_PASSWORD'] as const;
  const missingPasswordVariables = passwordVariables.filter((name) => !process.env[name]?.trim());
  if (missingPasswordVariables.length > 0) {
    throw new Error(`Missing required seed account password environment variables: ${missingPasswordVariables.join(', ')}`);
  }

  const adminCredential = process.env.DEFAULT_ADMIN_PASSWORD!;
  const customerCredential = process.env.DEFAULT_CUSTOMER_PASSWORD!;
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const adminPasswordHash = await argon2.hash(adminCredential, { type: argon2.argon2id });
  const adminUser = await prisma.user.upsert({
    where: { email: defaultAdminEmail },
    update: { passwordHash: adminPasswordHash, status: UserStatus.ACTIVE },
    create: { email: defaultAdminEmail, passwordHash: adminPasswordHash, status: UserStatus.ACTIVE },
    select: { id: true },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  const customerPasswordHash = await argon2.hash(customerCredential, { type: argon2.argon2id });
  const customerUser = await prisma.user.upsert({
    where: { email: defaultCustomerEmail },
    update: {
      passwordHash: customerPasswordHash,
      status: UserStatus.ACTIVE,
      profile: {
        upsert: {
          update: { firstName: 'Cliente', lastName: 'Demonstração', phone: '(96) 98100-1897' },
          create: { firstName: 'Cliente', lastName: 'Demonstração', phone: '(96) 98100-1897' },
        },
      },
    },
    create: {
      email: defaultCustomerEmail,
      passwordHash: customerPasswordHash,
      status: UserStatus.ACTIVE,
      profile: { create: { firstName: 'Cliente', lastName: 'Demonstração', phone: '(96) 98100-1897' } },
    },
    select: { id: true },
  });

  if (process.env.NODE_ENV !== 'production' || process.env.SEED_DEMO_DATA === 'true') {
    const demoVariant = await prisma.productVariant.findFirst({
      where: { status: 'ACTIVE', product: { status: 'ACTIVE' } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, sku: true, priceCents: true, product: { select: { name: true } } },
    });

    if (demoVariant) {
      const existingDemoOrder = await prisma.order.findFirst({
        where: { userId: customerUser.id, contactEmail: defaultCustomerEmail, shippingMethodCode: 'DEMO_SEED' },
        select: { id: true },
      });

      if (!existingDemoOrder) {
        await prisma.order.create({
          data: {
            userId: customerUser.id,
            status: OrderStatus.AWAITING_PAYMENT,
            subtotalCents: demoVariant.priceCents,
            totalCents: demoVariant.priceCents,
            contactEmail: defaultCustomerEmail,
            shippingMethodCode: 'DEMO_SEED',
            shippingProvider: 'Demonstração local',
            shippingDays: 1,
            shippingAddressJson: { postalCode: '68900050', city: 'Macapá', state: 'AP' },
            items: {
              create: {
                itemType: OrderItemType.PRODUCT_VARIANT,
                variantId: demoVariant.id,
                name: demoVariant.product.name,
                sku: demoVariant.sku,
                quantity: 1,
                unitPriceCents: demoVariant.priceCents,
                totalCents: demoVariant.priceCents,
              },
            },
            statusHistory: {
              create: {
                fromStatus: OrderStatus.DRAFT,
                toStatus: OrderStatus.AWAITING_PAYMENT,
                actorType: ActorType.SYSTEM,
                actorId: customerUser.id,
                source: 'SEED',
              },
            },
          },
        });
      }
    }
  }

  for (const [code, description] of permissions) {
    const permission = await prisma.permission.upsert({
      where: { code },
      update: { description },
      create: { code, description },
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  await prisma.vipTier.createMany({
    data: [
      { name: 'Bronze', rank: 1, discountBps: 0 },
      { name: 'Prata', rank: 2, discountBps: 500 },
      { name: 'Ouro', rank: 3, discountBps: 1000 },
    ],
    skipDuplicates: true,
  });

  await prisma.siteConfiguration.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Jonas & Elivaldo Hair Designers',
      address: 'Av. Gen. Gurjão, 151 - Central, Macapá - AP, 68900-050',
      phone: '(96) 98100-1897',
      whatsapp: '5596981001897',
      instagramUrl: 'https://www.instagram.com/jonas_elivaldo_hair_designers/',
      title: 'Jonas & Elivaldo Hair Designers',
      description: 'Beleza, cuidado e experiência profissional em Macapá.',
    },
  });

  await seedDefaultHomeBanners(prisma);

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { key_locale: { key: template.key, locale: 'pt-BR' } },
      update: {},
      create: { ...template, locale: 'pt-BR', enabled: true },
    });
    for (const locale of ['en-US', 'es-ES']) {
      await prisma.emailTemplate.upsert({
        where: { key_locale: { key: template.key, locale } },
        update: {},
        create: { ...template, locale, enabled: false },
      });
    }
    await prisma.notificationPreference.upsert({
      where: { eventKey: template.key },
      update: {},
      create: { eventKey: template.key, enabled: true },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
