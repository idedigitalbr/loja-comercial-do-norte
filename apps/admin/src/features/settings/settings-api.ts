export type SiteSettings = {
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

export type BannerSettings = {
  id: string;
  desktopPath: string;
  mobilePath: string | null;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
};

export type PaymentSettings = {
  environment: 'TEST' | 'PRODUCTION';
  publicKey: string | null;
  enabled: boolean;
  enablePix: boolean;
  enableCard: boolean;
  hasAccessToken: boolean;
  hasWebhookSecret: boolean;
};

export type EmailSettings = {
  host: string | null;
  port: number;
  username: string | null;
  security: 'NONE' | 'STARTTLS' | 'SSL_TLS';
  fromEmail: string | null;
  fromName: string | null;
  replyTo: string | null;
  enabled: boolean;
  hasPassword: boolean;
};

export type EmailTemplateSettings = {
  id: string;
  key: string;
  locale: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  enabled: boolean;
};

export type NotificationSettings = {
  id: string;
  eventKey: string;
  enabled: boolean;
  recipientOverride: string | null;
};

export type AdminSettingsSnapshot = {
  site: SiteSettings;
  banners: BannerSettings[];
  payments: PaymentSettings;
  smtp: EmailSettings;
  templates: EmailTemplateSettings[];
  notifications: NotificationSettings[];
};

export type SiteSettingsInput = Partial<Omit<SiteSettings, 'logoPath' | 'faviconPath'>> & {
  logoPath?: string | null;
  faviconPath?: string | null;
};

export type BannerInput = Omit<BannerSettings, 'id' | 'status'> & { status?: BannerSettings['status'] };

export type PaymentSettingsInput = {
  environment?: PaymentSettings['environment'];
  accessToken?: string;
  publicKey?: string | null;
  webhookSecret?: string;
  enabled?: boolean;
  enablePix?: boolean;
  enableCard?: boolean;
};

export type EmailSettingsInput = {
  host?: string | null;
  port?: number;
  username?: string | null;
  password?: string;
  security?: EmailSettings['security'];
  fromEmail?: string | null;
  fromName?: string | null;
  replyTo?: string | null;
  enabled?: boolean;
};

export type UploadKind = 'logo' | 'favicon' | 'banner';

export type UploadResult = { path: string; variants: string[]; altText: string };

export type NotificationSettingsInput = {
  enabled?: boolean;
  recipientOverride?: string | null;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null) as { message?: string; code?: string } | null;
  if (!response.ok) throw new Error(payload?.message ?? payload?.code ?? 'Não foi possível concluir a solicitação.');
  return payload as T;
}

export async function getSettings(): Promise<AdminSettingsSnapshot> {
  return parseResponse<AdminSettingsSnapshot>(await fetch('/api/v1/admin/settings', { credentials: 'include' }));
}

export async function saveSite(input: SiteSettingsInput): Promise<void> {
  await parseResponse(await fetch('/api/v1/admin/settings/site', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }));
}

export async function uploadMedia(kind: UploadKind, file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  return parseResponse<UploadResult>(await fetch(`/api/v1/admin/settings/media/${kind}`, { method: 'POST', credentials: 'include', body: form }));
}

export async function saveBanner(input: BannerInput, id?: string): Promise<void> {
  await parseResponse(await fetch(`/api/v1/admin/settings/banners${id ? `/${encodeURIComponent(id)}` : ''}`, {
    method: id ? 'PATCH' : 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }));
}

export async function deleteBanner(id: string): Promise<void> {
  await parseResponse(await fetch(`/api/v1/admin/settings/banners/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' }));
}

export async function savePaymentSettings(input: PaymentSettingsInput): Promise<void> {
  await parseResponse(await fetch('/api/v1/admin/settings/payments', {
    method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  }));
}

export async function testPayment(input: Pick<PaymentSettingsInput, 'accessToken' | 'environment'> = {}) {
  return parseResponse<{ ok: boolean; environment: PaymentSettings['environment']; accountLabel?: string }>(await fetch('/api/v1/admin/settings/payments/test', {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  }));
}

export async function saveEmailSettings(input: EmailSettingsInput): Promise<void> {
  await parseResponse(await fetch('/api/v1/admin/settings/email', {
    method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  }));
}

export async function testEmail(recipient: string): Promise<void> {
  await parseResponse(await fetch('/api/v1/admin/settings/email/test', {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipient }),
  }));
}

export async function saveNotificationPreference(eventKey: string, input: NotificationSettingsInput): Promise<void> {
  await parseResponse(await fetch('/api/v1/admin/settings/notifications/' + encodeURIComponent(eventKey), {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }));
}

export async function saveTemplate(key: string, locale: string, input: Pick<EmailTemplateSettings, 'subject' | 'htmlBody' | 'textBody' | 'enabled'>): Promise<void> {
  await parseResponse(await fetch(`/api/v1/admin/settings/templates/${encodeURIComponent(key)}/${encodeURIComponent(locale)}`, {
    method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  }));
}

export async function testTemplate(key: string, locale: string, recipient: string, variables: Record<string, string | number> = {}): Promise<void> {
  await parseResponse(await fetch(`/api/v1/admin/settings/templates/${encodeURIComponent(key)}/${encodeURIComponent(locale)}/test`, {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipient, variables }),
  }));
}
