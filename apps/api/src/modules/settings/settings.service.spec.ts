import { describe, expect, it, vi } from 'vitest';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  it('returns only published site fields and never returns payment or SMTP secrets', async () => {
    const prisma = {
      siteConfiguration: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'default',
          siteName: 'Comercial do Norte',
          logoPath: 'uploads/site/logo.webp',
          faviconPath: 'uploads/site/favicon.webp',
          address: 'Macapá - AP',
          phone: '(96) 98100-1897',
          whatsapp: '5596981001897',
          instagramUrl: 'https://instagram.com/loja',
          title: 'Comercial do Norte',
          description: 'Loja profissional',
        }),
      },
      siteBanner: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'banner-1',
            desktopPath: 'uploads/site/banner.webp',
            mobilePath: null,
            eyebrow: 'Novidade',
            title: 'Cuide dos seus cabelos',
            description: 'Conheça a coleção',
            ctaLabel: 'Ver produtos',
            ctaHref: '/loja',
            sortOrder: 1,
            status: 'ACTIVE',
          },
        ]),
      },
    };
    const service = new SettingsService(prisma as never, {} as never);

    const result = await service.getPublicConfig();

    expect(result).toEqual({
      site: expect.objectContaining({
        siteName: 'Comercial do Norte',
        logoPath: '/storage/uploads/site/logo.webp',
      }),
      banners: [expect.objectContaining({ id: 'banner-1', desktopPath: '/storage/uploads/site/banner.webp' })],
      features: { checkout: false, payments: false, trainings: false },
    });
    expect(JSON.stringify(result)).not.toContain('accessToken');
    expect(JSON.stringify(result)).not.toContain('smtpPassword');
  });

  it('não expõe mídia de banner hospedada fora da storage local (sem hotlink)', async () => {
    const externalPath = 'https://jonaselivaldohair.com.br/wp-content/uploads/2025/11/FOTO-288.jpg';
    const prisma = {
      siteConfiguration: { findUnique: vi.fn().mockResolvedValue(null) },
      siteBanner: {
        findMany: vi.fn().mockResolvedValue([{
          id: 'legacy-banner-1',
          desktopPath: externalPath,
          mobilePath: null,
          eyebrow: null,
          title: 'Banner antigo',
          description: null,
          ctaLabel: null,
          ctaHref: '/loja',
          sortOrder: 0,
          status: 'ACTIVE',
        }]),
      },
    };
    const service = new SettingsService(prisma as never, {} as never);

    const result = await service.getPublicConfig();

    expect(result.banners[0]).toEqual(expect.objectContaining({ desktopPath: '' }));
    expect(JSON.stringify(result)).not.toMatch(/jonaselivaldohair/i);
  });

  it('recusa salvar banner com mídia externa', async () => {
    const prisma = { siteBanner: { create: vi.fn() } };
    const service = new SettingsService(prisma as never, {} as never);

    await expect(service.createBanner({ desktopPath: 'https://example.com/banner.jpg' })).rejects.toThrow('INVALID_MEDIA_PATH');
    expect(prisma.siteBanner.create).not.toHaveBeenCalled();
  });

  it('returns mask flags instead of decrypted credentials to administrators', async () => {
    const prisma = {
      siteConfiguration: { findUnique: vi.fn().mockResolvedValue(null) },
      siteBanner: { findMany: vi.fn().mockResolvedValue([]) },
      paymentConfiguration: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'default',
          environment: 'TEST',
          publicKey: 'TEST-public',
          accessTokenEncrypted: 'encrypted-token',
          webhookSecretEncrypted: 'encrypted-webhook',
          enabled: true,
          enablePix: true,
          enableCard: true,
        }),
      },
      smtpConfiguration: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'default',
          host: 'smtp.example.com',
          port: 587,
          username: 'mailer@example.com',
          passwordEncrypted: 'encrypted-password',
          security: 'STARTTLS',
          fromEmail: 'loja@example.com',
          fromName: 'Loja',
          replyTo: null,
          enabled: true,
        }),
      },
      emailTemplate: { findMany: vi.fn().mockResolvedValue([]) },
      notificationPreference: { findMany: vi.fn().mockResolvedValue([]) },
    };
    const service = new SettingsService(prisma as never, {} as never);

    const result = await service.getAdminSnapshot();

    expect(result.payments).toEqual(expect.objectContaining({ hasAccessToken: true, hasWebhookSecret: true }));
    expect(result.smtp).toEqual(expect.objectContaining({ hasPassword: true }));
    expect(result).not.toHaveProperty('payments.accessToken');
    expect(result).not.toHaveProperty('smtp.password');
  });

  it('rejects unsafe banner destinations before persisting them', async () => {
    const prisma = {
      siteBanner: { create: vi.fn() },
    };
    const service = new SettingsService(prisma as never, {} as never);

    await expect(service.createBanner({ desktopPath: '/storage/banner.webp', ctaHref: 'javascript:alert(1)' })).rejects.toThrow('INVALID_CTA_HREF');
    expect(prisma.siteBanner.create).not.toHaveBeenCalled();
  });

  it('rejects enabling card payments without the required credentials', async () => {
    const prisma = {
      paymentConfiguration: { findUnique: vi.fn().mockResolvedValue(null), upsert: vi.fn() },
    };
    const service = new SettingsService(prisma as never, {} as never);

    await expect(service.updatePaymentSettings({ enabled: true, enableCard: true })).rejects.toThrow('ACCESS_TOKEN_REQUIRED');
    expect(prisma.paymentConfiguration.upsert).not.toHaveBeenCalled();
  });

  it('rejects enabling SMTP without a host and sender address', async () => {
    const prisma = {
      smtpConfiguration: { findUnique: vi.fn().mockResolvedValue(null), upsert: vi.fn() },
    };
    const service = new SettingsService(prisma as never, {} as never);

    await expect(service.updateSmtpSettings({ enabled: true })).rejects.toThrow('SMTP_HOST_REQUIRED');
    expect(prisma.smtpConfiguration.upsert).not.toHaveBeenCalled();
  });
});
