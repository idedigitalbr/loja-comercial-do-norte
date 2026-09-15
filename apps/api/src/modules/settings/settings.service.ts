import {
  EmailEventKey,
  PaymentEnvironment,
  Prisma,
  RecordStatus,
  SmtpSecurity,
} from '@prisma/client';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SettingsCryptoService } from '../../common/crypto/settings-crypto.service';
import { PrismaService } from '../database/prisma.service';
import { normalizeStoredMediaPath, publicStoragePath } from '../files/storage-path';
import {
  AdminSettingsSnapshot,
  EmailTemplateInput,
  NotificationPreferenceInput,
  PaymentSettingsInput,
  PublicSiteConfig,
  RuntimePaymentConfig,
  RuntimeSmtpConfig,
  SiteBannerInput,
  SiteUpdateInput,
  SmtpSettingsInput,
} from './settings.types';

type SiteFields = {
  siteName?: string;
  logoPath?: string | null;
  faviconPath?: string | null;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagramUrl?: string | null;
  title?: string | null;
  description?: string | null;
};

const DEFAULT_SITE: Required<SiteFields> = {
  siteName: 'Loja Jonas & Elivaldo',
  logoPath: null,
  faviconPath: null,
  address: null,
  phone: null,
  whatsapp: null,
  instagramUrl: null,
  title: null,
  description: null,
};

function safeCtaHref(value: string | null | undefined): string | null {
  if (!value) return null;
  return /^(?:\/(?!\/)[^\s]*|https:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+)$/i.test(value) ? value : null;
}

function normalizeBannerInput<T extends SiteBannerInput | Partial<SiteBannerInput>>(input: T): T {
  if (input.ctaHref !== undefined && input.ctaHref !== null && !safeCtaHref(input.ctaHref)) {
    throw new BadRequestException('INVALID_CTA_HREF');
  }
  const normalized = { ...input } as T & Partial<SiteBannerInput>;
  if (input.desktopPath !== undefined) normalized.desktopPath = normalizeStoredMediaPath(input.desktopPath) ?? '';
  if (input.mobilePath !== undefined) normalized.mobilePath = normalizeStoredMediaPath(input.mobilePath);
  return normalized;
}

function mapSite(site: SiteFields) {
  return {
    siteName: site.siteName ?? DEFAULT_SITE.siteName,
    logoPath: publicStoragePath(site.logoPath),
    faviconPath: publicStoragePath(site.faviconPath),
    address: site.address ?? null,
    phone: site.phone ?? null,
    whatsapp: site.whatsapp ?? null,
    instagramUrl: site.instagramUrl ?? null,
    title: site.title ?? null,
    description: site.description ?? null,
  };
}

function mapBanner(banner: { id: string; desktopPath: string; mobilePath: string | null; eyebrow: string | null; title: string | null; description: string | null; ctaLabel: string | null; ctaHref: string | null; sortOrder: number; status?: RecordStatus }) {
  return {
    id: banner.id,
    desktopPath: publicStoragePath(banner.desktopPath) ?? '',
    mobilePath: publicStoragePath(banner.mobilePath),
    eyebrow: banner.eyebrow,
    title: banner.title,
    description: banner.description,
    ctaLabel: banner.ctaLabel,
    ctaHref: safeCtaHref(banner.ctaHref),
    sortOrder: banner.sortOrder,
    ...(banner.status ? { status: banner.status } : {}),
  };
}

@Injectable()
export class SettingsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(SettingsCryptoService) private readonly crypto: SettingsCryptoService,
  ) {}

  async getPublicConfig(): Promise<PublicSiteConfig> {
    const [site, banners] = await Promise.all([
      this.prisma.siteConfiguration.findUnique({ where: { id: 'default' } }),
      this.prisma.siteBanner.findMany({ where: { status: RecordStatus.ACTIVE }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }),
    ]);

    return {
      site: mapSite(site ?? DEFAULT_SITE),
      banners: banners.map((banner) => mapBanner(banner)),
    };
  }

  async getAdminSnapshot(): Promise<AdminSettingsSnapshot> {
    const [site, banners, payments, smtp, templates, notifications] = await Promise.all([
      this.prisma.siteConfiguration.findUnique({ where: { id: 'default' } }),
      this.prisma.siteBanner.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }),
      this.prisma.paymentConfiguration.findUnique({ where: { id: 'default' } }),
      this.prisma.smtpConfiguration.findUnique({ where: { id: 'default' } }),
      this.prisma.emailTemplate.findMany({ orderBy: [{ key: 'asc' }, { locale: 'asc' }] }),
      this.prisma.notificationPreference.findMany({ orderBy: { eventKey: 'asc' } }),
    ]);

    return {
      site: mapSite(site ?? DEFAULT_SITE),
      banners: banners.map((banner) => mapBanner(banner) as AdminSettingsSnapshot['banners'][number]),
      payments: {
        environment: payments?.environment ?? PaymentEnvironment.TEST,
        publicKey: payments?.publicKey ?? null,
        enabled: payments?.enabled ?? false,
        enablePix: payments?.enablePix ?? true,
        enableCard: payments?.enableCard ?? true,
        hasAccessToken: Boolean(payments?.accessTokenEncrypted),
        hasWebhookSecret: Boolean(payments?.webhookSecretEncrypted),
      },
      smtp: {
        host: smtp?.host ?? null,
        port: smtp?.port ?? 587,
        username: smtp?.username ?? null,
        security: smtp?.security ?? SmtpSecurity.STARTTLS,
        fromEmail: smtp?.fromEmail ?? null,
        fromName: smtp?.fromName ?? null,
        replyTo: smtp?.replyTo ?? null,
        enabled: smtp?.enabled ?? false,
        hasPassword: Boolean(smtp?.passwordEncrypted),
      },
      templates: templates.map((template) => ({
        id: template.id,
        key: template.key,
        locale: template.locale,
        subject: template.subject,
        htmlBody: template.htmlBody,
        textBody: template.textBody,
        enabled: template.enabled,
      })),
      notifications: notifications.map((preference) => ({
        id: preference.id,
        eventKey: preference.eventKey,
        enabled: preference.enabled,
        recipientOverride: preference.recipientOverride,
      })),
    };
  }

  async updateSite(input: SiteUpdateInput) {
    const normalized = {
      ...input,
      ...(input.logoPath !== undefined ? { logoPath: normalizeStoredMediaPath(input.logoPath) } : {}),
      ...(input.faviconPath !== undefined ? { faviconPath: normalizeStoredMediaPath(input.faviconPath) } : {}),
    };
    return this.prisma.siteConfiguration.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...normalized },
      update: normalized,
    });
  }

  async listBanners() {
    const banners = await this.prisma.siteBanner.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
    return banners.map((banner) => mapBanner(banner));
  }

  async createBanner(input: SiteBannerInput) {
    const normalized = normalizeBannerInput(input);
    const banner = await this.prisma.siteBanner.create({ data: { ...normalized, status: input.status ?? RecordStatus.DRAFT } });
    return mapBanner(banner);
  }

  async updateBanner(id: string, input: Partial<SiteBannerInput>) {
    await this.assertBanner(id);
    const banner = await this.prisma.siteBanner.update({ where: { id }, data: normalizeBannerInput(input) });
    return mapBanner(banner);
  }

  async deleteBanner(id: string) {
    await this.assertBanner(id);
    await this.prisma.siteBanner.delete({ where: { id } });
    return { ok: true };
  }

  async getPaymentSettings(): Promise<AdminSettingsSnapshot['payments']> {
    return (await this.getAdminSnapshot()).payments;
  }

  async getRuntimePaymentConfig(): Promise<RuntimePaymentConfig | null> {
    const payment = await this.prisma.paymentConfiguration.findUnique({ where: { id: 'default' } });
    if (!payment?.enabled || !payment.accessTokenEncrypted) return null;
    return {
      environment: payment.environment,
      accessToken: this.crypto.decrypt(payment.accessTokenEncrypted),
      publicKey: payment.publicKey,
      webhookSecret: payment.webhookSecretEncrypted ? this.crypto.decrypt(payment.webhookSecretEncrypted) : null,
      enabled: payment.enabled,
      enablePix: payment.enablePix,
      enableCard: payment.enableCard,
    };
  }

  async updatePaymentSettings(input: PaymentSettingsInput) {
    if (input.accessToken !== undefined && !input.accessToken.trim()) throw new BadRequestException('ACCESS_TOKEN_REQUIRED');
    if (input.webhookSecret !== undefined && !input.webhookSecret.trim()) throw new BadRequestException('WEBHOOK_SECRET_REQUIRED');
    const current = await this.prisma.paymentConfiguration.findUnique({
      where: { id: 'default' },
      select: { accessTokenEncrypted: true, publicKey: true, enabled: true, enablePix: true, enableCard: true },
    });
    const enabled = input.enabled ?? current?.enabled ?? false;
    const enablePix = input.enablePix ?? current?.enablePix ?? true;
    const enableCard = input.enableCard ?? current?.enableCard ?? true;
    const hasAccessToken = Boolean(input.accessToken?.trim() || current?.accessTokenEncrypted);
    const publicKey = input.publicKey !== undefined ? input.publicKey?.trim() : current?.publicKey?.trim();
    if (enabled && !hasAccessToken) throw new BadRequestException('ACCESS_TOKEN_REQUIRED');
    if (enabled && !enablePix && !enableCard) throw new BadRequestException('PAYMENT_METHOD_REQUIRED');
    if (enabled && enableCard && !publicKey) throw new BadRequestException('PUBLIC_KEY_REQUIRED_FOR_CARD');
    const data: Prisma.PaymentConfigurationUpdateInput = {
      ...(input.environment !== undefined ? { environment: input.environment } : {}),
      ...(input.publicKey !== undefined ? { publicKey: input.publicKey } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.enablePix !== undefined ? { enablePix: input.enablePix } : {}),
      ...(input.enableCard !== undefined ? { enableCard: input.enableCard } : {}),
      ...(input.accessToken?.trim() ? { accessTokenEncrypted: this.crypto.encrypt(input.accessToken.trim()) } : {}),
      ...(input.webhookSecret?.trim() ? { webhookSecretEncrypted: this.crypto.encrypt(input.webhookSecret.trim()) } : {}),
    };
    return this.prisma.paymentConfiguration.upsert({ where: { id: 'default' }, create: { id: 'default', ...data } as Prisma.PaymentConfigurationCreateInput, update: data });
  }

  async getSmtpSettings(): Promise<AdminSettingsSnapshot['smtp']> {
    return (await this.getAdminSnapshot()).smtp;
  }

  async getRuntimeSmtpConfig(): Promise<RuntimeSmtpConfig | null> {
    const smtp = await this.prisma.smtpConfiguration.findUnique({ where: { id: 'default' } });
    if (!smtp?.enabled || !smtp.host || !smtp.fromEmail) return null;
    return {
      host: smtp.host,
      port: smtp.port,
      username: smtp.username,
      password: smtp.passwordEncrypted ? this.crypto.decrypt(smtp.passwordEncrypted) : null,
      security: smtp.security,
      fromEmail: smtp.fromEmail,
      fromName: smtp.fromName ?? 'Loja Jonas & Elivaldo',
      replyTo: smtp.replyTo,
      enabled: smtp.enabled,
    };
  }

  async getRuntimeWebhookSecret(): Promise<string | null> {
    const payment = await this.prisma.paymentConfiguration.findUnique({ where: { id: 'default' }, select: { webhookSecretEncrypted: true } });
    return payment?.webhookSecretEncrypted ? this.crypto.decrypt(payment.webhookSecretEncrypted) : null;
  }

  async updateSmtpSettings(input: SmtpSettingsInput) {
    const current = await this.prisma.smtpConfiguration.findUnique({
      where: { id: 'default' },
      select: { host: true, username: true, passwordEncrypted: true, security: true, fromEmail: true, enabled: true },
    });
    const enabled = input.enabled ?? current?.enabled ?? false;
    const host = input.host !== undefined ? input.host : current?.host;
    const username = input.username !== undefined ? input.username : current?.username;
    const security = input.security ?? current?.security ?? SmtpSecurity.STARTTLS;
    const fromEmail = input.fromEmail !== undefined ? input.fromEmail : current?.fromEmail;
    const hasPassword = Boolean(input.password?.trim() || current?.passwordEncrypted);
    if (enabled && !host?.trim()) throw new BadRequestException('SMTP_HOST_REQUIRED');
    if (enabled && !fromEmail?.trim()) throw new BadRequestException('SMTP_FROM_EMAIL_REQUIRED');
    if (enabled && username?.trim() && !hasPassword) throw new BadRequestException('SMTP_PASSWORD_REQUIRED');
    if (enabled && process.env.NODE_ENV === 'production' && security === SmtpSecurity.NONE) throw new BadRequestException('SMTP_TLS_REQUIRED_IN_PRODUCTION');
    const data: Prisma.SmtpConfigurationUpdateInput = {
      ...(input.host !== undefined ? { host: input.host } : {}),
      ...(input.port !== undefined ? { port: input.port } : {}),
      ...(input.username !== undefined ? { username: input.username } : {}),
      ...(input.security !== undefined ? { security: input.security } : {}),
      ...(input.fromEmail !== undefined ? { fromEmail: input.fromEmail } : {}),
      ...(input.fromName !== undefined ? { fromName: input.fromName } : {}),
      ...(input.replyTo !== undefined ? { replyTo: input.replyTo } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.password?.trim() ? { passwordEncrypted: this.crypto.encrypt(input.password.trim()) } : {}),
    };
    return this.prisma.smtpConfiguration.upsert({ where: { id: 'default' }, create: { id: 'default', ...data } as Prisma.SmtpConfigurationCreateInput, update: data });
  }

  listEmailTemplates() {
    return this.prisma.emailTemplate.findMany({ orderBy: [{ key: 'asc' }, { locale: 'asc' }] });
  }

  updateEmailTemplate(key: EmailEventKey, locale: string, input: EmailTemplateInput) {
    return this.prisma.emailTemplate.upsert({ where: { key_locale: { key, locale } }, create: { key, locale, ...input }, update: input });
  }

  updateNotificationPreference(eventKey: EmailEventKey, input: NotificationPreferenceInput) {
    return this.prisma.notificationPreference.upsert({ where: { eventKey }, create: { eventKey, ...input }, update: input });
  }

  private async assertBanner(id: string): Promise<void> {
    const banner = await this.prisma.siteBanner.findUnique({ where: { id }, select: { id: true } });
    if (!banner) throw new NotFoundException('BANNER_NOT_FOUND');
  }
}
