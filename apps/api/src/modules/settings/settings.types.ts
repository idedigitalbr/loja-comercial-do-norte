import {
  EmailEventKey,
  PaymentEnvironment,
  RecordStatus,
  SmtpSecurity,
} from '@prisma/client';

export type SiteUpdateInput = {
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

export type SiteBannerInput = {
  desktopPath: string;
  mobilePath?: string | null;
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  sortOrder?: number;
  status?: RecordStatus;
};

export type PaymentSettingsInput = {
  environment?: PaymentEnvironment;
  accessToken?: string;
  publicKey?: string | null;
  webhookSecret?: string;
  enabled?: boolean;
  enablePix?: boolean;
  enableCard?: boolean;
};

export type SmtpSettingsInput = {
  host?: string | null;
  port?: number;
  username?: string | null;
  password?: string;
  security?: SmtpSecurity;
  fromEmail?: string | null;
  fromName?: string | null;
  replyTo?: string | null;
  enabled?: boolean;
};

export type EmailTemplateInput = {
  subject: string;
  htmlBody: string;
  textBody: string;
  enabled?: boolean;
};

export type NotificationPreferenceInput = {
  enabled?: boolean;
  recipientOverride?: string | null;
};

export type PublicSiteConfig = {
  site: {
    siteName: string;
    logoPath: string | null;
    faviconPath: string | null;
    address: string | null;
    phone: string | null;
    whatsapp: string | null;
    instagramUrl: string | null;
    title: string | null;
    description: string | null;
  };
  banners: Array<{
    id: string;
    desktopPath: string;
    mobilePath: string | null;
    eyebrow: string | null;
    title: string | null;
    description: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    sortOrder: number;
  }>;
};

export type AdminSettingsSnapshot = {
  site: PublicSiteConfig['site'];
  banners: Array<PublicSiteConfig['banners'][number] & { status: RecordStatus }>;
  payments: {
    environment: PaymentEnvironment;
    publicKey: string | null;
    enabled: boolean;
    enablePix: boolean;
    enableCard: boolean;
    hasAccessToken: boolean;
    hasWebhookSecret: boolean;
  };
  smtp: {
    host: string | null;
    port: number;
    username: string | null;
    security: SmtpSecurity;
    fromEmail: string | null;
    fromName: string | null;
    replyTo: string | null;
    enabled: boolean;
    hasPassword: boolean;
  };
  templates: Array<{
    id: string;
    key: EmailEventKey;
    locale: string;
    subject: string;
    htmlBody: string;
    textBody: string;
    enabled: boolean;
  }>;
  notifications: Array<{
    id: string;
    eventKey: EmailEventKey;
    enabled: boolean;
    recipientOverride: string | null;
  }>;
};

export type RuntimePaymentConfig = {
  environment: PaymentEnvironment;
  accessToken: string;
  publicKey: string | null;
  webhookSecret: string | null;
  enabled: boolean;
  enablePix: boolean;
  enableCard: boolean;
};

export type RuntimeSmtpConfig = {
  host: string;
  port: number;
  username: string | null;
  password: string | null;
  security: SmtpSecurity;
  fromEmail: string;
  fromName: string;
  replyTo: string | null;
  enabled: boolean;
};
