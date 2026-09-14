import { describe, expect, it, vi } from 'vitest';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  it('returns only published site fields and never returns payment or SMTP secrets', async () => {
    const prisma = {
      siteConfiguration: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'default',
          siteName: 'Loja Jonas & Elivaldo',
          logoPath: 'uploads/site/logo.webp',
          faviconPath: 'uploads/site/favicon.webp',
          address: 'Macapá - AP',
          phone: '(96) 98100-1897',
          whatsapp: '5596981001897',
          instagramUrl: 'https://instagram.com/loja',
          title: 'Jonas & Elivaldo',
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
        siteName: 'Loja Jonas & Elivaldo',
        logoPath: '/storage/uploads/site/logo.webp',
      }),
      banners: [expect.objectContaining({ id: 'banner-1', desktopPath: '/storage/uploads/site/banner.webp' })],
    });
    expect(JSON.stringify(result)).not.toContain('accessToken');
    expect(JSON.stringify(result)).not.toContain('smtpPassword');
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
});
