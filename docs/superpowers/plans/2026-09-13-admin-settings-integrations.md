# Configurações administrativas e integrações — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar uma área de configurações no Admin para identidade/banners do site, Mercado Pago e SMTP/templates, com dados públicos consumidos pelo storefront e notificações transacionais assíncronas.

**Architecture:** O backend terá um módulo de configurações com modelos tipados e uma camada de cifra para segredos. O site público lerá somente uma projeção sanitizada; o Admin usará endpoints protegidos por sessão e permissões. Pagamentos e e-mails usarão os serviços existentes, idempotência e jobs assíncronos, sem colocar credenciais no código ou no navegador.

**Tech Stack:** NestJS 11, Prisma 6, MySQL, React 19, Vite, Vitest, `LocalFileStorageService`, `ScheduledJob`, `fetch` para a API Mercado Pago e Nodemailer para SMTP.

**Spec:** `docs/superpowers/specs/2026-09-13-admin-settings-integrations-design.md`

## Global Constraints

- Segredos nunca serão retornados por endpoints GET, logs ou respostas públicas.
- `SETTINGS_ENCRYPTION_KEY` será usado para AES-GCM e será obrigatório fora do desenvolvimento.
- Uploads permanecerão em `storage/uploads` e não substituirão arquivos anteriores automaticamente.
- Mutação administrativa exigirá `SessionGuard` e `PermissionGuard`.
- Cada etapa começa com um teste que falha e termina com teste, typecheck e commit próprios.
- O fallback estático atual do storefront continuará funcionando durante indisponibilidade da API.
- O catálogo e os dados importados do WooCommerce não serão apagados nem migrados novamente.

---

### Task 1: Criptografia e permissões para configurações

**Files:**
- Create: `apps/api/src/common/crypto/settings-crypto.service.ts`
- Test: `apps/api/src/common/crypto/settings-crypto.service.spec.ts`
- Modify: `apps/api/src/config/env.schema.ts`
- Modify: `apps/api/src/modules/auth/guards/permission.guard.ts`
- Modify: `prisma/seed.ts`
- Modify: `apps/api/src/common/security/security.module.ts`

**Interfaces:**
- Produces `SettingsCryptoService.encrypt(value: string): string` and `SettingsCryptoService.decrypt(payload: string): string`.
- Produces `Permissions.SETTINGS_MANAGE`, `Permissions.PAYMENTS_MANAGE` and `Permissions.NOTIFICATIONS_MANAGE`.
- `EnvironmentSchema` accepts `SETTINGS_ENCRYPTION_KEY` and rejects missing/invalid production values.

- [ ] **Step 1: Write the failing tests**

```typescript
it('round-trips a secret without returning the original payload', () => {
  const service = new SettingsCryptoService(Buffer.alloc(32, 7).toString('base64'));
  const payload = service.encrypt('mp-access-token');

  expect(payload).not.toContain('mp-access-token');
  expect(service.decrypt(payload)).toBe('mp-access-token');
});

it('rejects a malformed payload', () => {
  const service = new SettingsCryptoService(Buffer.alloc(32, 7).toString('base64'));
  expect(() => service.decrypt('not-a-valid-ciphertext')).toThrow('SETTINGS_SECRET_INVALID');
});
```

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run: `pnpm --filter api exec vitest run src/common/crypto/settings-crypto.service.spec.ts`

Expected: FAIL because `SettingsCryptoService` does not exist.

- [ ] **Step 3: Implement the smallest AES-GCM service**

Use `randomBytes(12)` for the IV, `createCipheriv('aes-256-gcm', key, iv)`, append the auth tag, and encode `iv.tag.ciphertext` as base64url segments. The constructor must decode a 32-byte base64 key and throw `SETTINGS_ENCRYPTION_KEY_INVALID` otherwise. `decrypt` must map all decode/authentication errors to `SETTINGS_SECRET_INVALID`.

- [ ] **Step 4: Add environment and permission contracts**

Add the encryption key to `EnvironmentSchema` with a development-only fallback generated from the existing development cookie secret; require the explicit key when `NODE_ENV=production`. Add the three permission constants, seed their descriptions, and export the crypto service through `SecurityModule` without exposing the key.

- [ ] **Step 5: Run tests and typecheck**

Run: `pnpm --filter api exec vitest run src/common/crypto/settings-crypto.service.spec.ts && pnpm --filter api typecheck`

Expected: PASS with no secret printed.

- [ ] **Step 6: Commit the isolated foundation**

```bash
git add apps/api/src/common/crypto apps/api/src/config/env.schema.ts apps/api/src/modules/auth/guards/permission.guard.ts apps/api/src/common/security/security.module.ts prisma/seed.ts
git commit -m "feat: add secure settings secrets and permissions"
```

---

### Task 2: Persistência tipada e API administrativa de configurações

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260913090000_add_admin_settings/migration.sql`
- Create: `apps/api/src/modules/settings/settings.module.ts`
- Create: `apps/api/src/modules/settings/settings.service.ts`
- Create: `apps/api/src/modules/settings/settings.controller.ts`
- Create: `apps/api/src/modules/settings/settings.dto.ts`
- Test: `apps/api/src/modules/settings/settings.service.spec.ts`
- Test: `apps/api/src/modules/settings/settings.controller.spec.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- `SettingsService.getPublicConfig(): Promise<PublicSiteConfig>` returns only published identity and banners.
- `SettingsService.getAdminSnapshot(): Promise<AdminSettingsSnapshot>` returns masked secret metadata, never plaintext.
- `SettingsService.updateSite(input)`, `listBanners()`, `createBanner(input)`, `updateBanner(id, input)`, `deleteBanner(id)`, `getPaymentSettings()`, `updatePaymentSettings(input)`, `getSmtpSettings()`, `updateSmtpSettings(input)`, `listEmailTemplates()` and `updateEmailTemplate(key, locale, input)` are service boundaries.
- Routes are `/api/v1/site/config`, `/api/v1/admin/settings/site`, `/api/v1/admin/settings/banners`, `/api/v1/admin/settings/payments`, `/api/v1/admin/settings/email` and `/api/v1/admin/settings/templates`.

- [ ] **Step 1: Write failing service tests for the public projection and masking**

```typescript
it('returns only published site fields and never returns payment or SMTP secrets', async () => {
  const service = new SettingsService(prisma, crypto);
  const result = await service.getPublicConfig();

  expect(result).toEqual(expect.objectContaining({ site: expect.any(Object), banners: expect.any(Array) }));
  expect(JSON.stringify(result)).not.toContain('accessToken');
  expect(JSON.stringify(result)).not.toContain('smtpPassword');
});

it('returns mask flags instead of decrypted credentials to administrators', async () => {
  const result = await service.getAdminSnapshot();
  expect(result.payments).toEqual(expect.objectContaining({ hasAccessToken: true }));
  expect(result.smtp).toEqual(expect.objectContaining({ hasPassword: true }));
  expect(result).not.toHaveProperty('payments.accessToken');
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `pnpm --filter api exec vitest run src/modules/settings/settings.service.spec.ts`

Expected: FAIL because the settings module and Prisma models are absent.

- [ ] **Step 3: Add Prisma models and migration**

Add `SiteConfiguration` as a singleton row, `SiteBanner` with desktop/mobile paths, copy, CTA, `sortOrder` and `status`, `PaymentConfiguration`, `SmtpConfiguration`, `EmailTemplate` keyed by `key` and `locale`, `NotificationPreference`, and `EmailDelivery` with `dedupeKey`, status, attempts and error. Add unique constraints for singleton settings, banner ordering lookup, template key/locale and delivery deduplication. Generate a migration from the schema; do not modify existing catalog tables.

- [ ] **Step 4: Implement service projections and CRUD**

Use `SettingsCryptoService` only on write/read inside the service. `getAdminSnapshot` returns `hasAccessToken`, `hasWebhookSecret`, `hasPassword` and editable non-secret fields. `getPublicConfig` filters `status=ACTIVE`, orders banners by `sortOrder`, and maps paths to public `/storage/...` URLs. Delete operations only remove database rows; physical media remains recoverable.

- [ ] **Step 5: Add protected controllers and DTO validation**

Use `@UseGuards(SessionGuard, PermissionGuard)` on admin routes and `@RequirePermissions(...)` per resource. Use `class-validator` for URLs, e-mails, enum environment, port ranges, CTA text and bounded string lengths. Reject secret fields that are present as empty strings; an omitted secret keeps the stored value. Keep `GET /site/config` public and sanitized.

- [ ] **Step 6: Register the module and run migration tests**

Import `SettingsModule` from `AppModule`, run `pnpm prisma validate`, run the focused service/controller tests, and run `pnpm --filter api typecheck`.

- [ ] **Step 7: Commit the persistence/API slice**

```bash
git add prisma/schema.prisma prisma/migrations apps/api/src/modules/settings apps/api/src/app.module.ts
git commit -m "feat: add administrative settings API"
```

---

### Task 3: Mídia, identidade e banners no site público

**Files:**
- Create: `apps/api/src/modules/settings/site-media.controller.ts`
- Test: `apps/api/src/modules/settings/site-media.controller.spec.ts`
- Create: `apps/storefront/src/content/site-config-client.ts`
- Test: `apps/storefront/src/content/site-config-client.spec.ts`
- Modify: `apps/storefront/src/components/storefront-shell.tsx`
- Modify: `apps/storefront/src/app.tsx`
- Modify: `apps/storefront/src/content/institutional-content.ts`
- Modify: `apps/storefront/src/styles.css`

**Interfaces:**
- `POST /api/v1/admin/settings/media/logo`, `POST /api/v1/admin/settings/media/favicon` and `POST /api/v1/admin/settings/media/banner` accept multipart images and return only the public path and dimensions.
- `loadSiteConfig(fetcher = fetch): Promise<PublicSiteConfig | null>` returns `null` on a non-OK response so the existing static content remains active.
- `StorefrontShell` renders the configured logo and `HomePage` renders active banners in configured order.

- [ ] **Step 1: Write failing upload and fallback tests**

```typescript
it('stores a banner through the existing image storage service', async () => {
  const result = await controller.uploadBanner({ file: fakeJpegFile });
  expect(storage.storeImage).toHaveBeenCalledWith(expect.objectContaining({ originalName: 'home.jpg' }));
  expect(result.path).toMatch(/^\/storage\/uploads\//);
});

it('returns null when remote site configuration is unavailable', async () => {
  const result = await loadSiteConfig(async () => ({ ok: false } as Response));
  expect(result).toBeNull();
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `pnpm --filter api exec vitest run src/modules/settings/site-media.controller.spec.ts && pnpm --filter storefront exec vitest run src/content/site-config-client.spec.ts`

Expected: FAIL because the upload controller and config client do not exist.

- [ ] **Step 3: Implement media upload with existing validation**

Reuse `LocalFileStorageService`, `memoryStorage()`, MIME allowlist `image/jpeg,image/png,image/webp`, and the existing size limit. Use a dedicated `site` storage namespace and `storeSquareImage` for favicon. Save returned paths through `SettingsService` only after storage succeeds.

- [ ] **Step 4: Implement public configuration loading and document identity**

Load `/api/v1/site/config` once at the storefront shell boundary. Merge only defined remote identity values over `institutionalContent.site`. Update or create the favicon `<link rel="icon">` and document title when configured; do not remove the static fallback if loading fails.

- [ ] **Step 5: Render banners without changing catalog behavior**

Make `HomePage` use published remote banners when the list is non-empty and otherwise preserve the current institutional hero/promotional sections. Keep CTA links constrained to validated internal paths or `https://`/`mailto:`/`tel:` values.

- [ ] **Step 6: Run storefront tests, typecheck and build**

Run: `pnpm --filter storefront exec vitest run src/content/site-config-client.spec.ts src/pages/institutional-pages.spec.ts && pnpm --filter storefront typecheck && pnpm --filter storefront build`

Expected: PASS and the static site remains usable with the API unavailable.

- [ ] **Step 7: Commit the public site slice**

```bash
git add apps/api/src/modules/settings/site-media.controller.ts apps/api/src/modules/settings/site-media.controller.spec.ts apps/storefront/src/content/site-config-client.ts apps/storefront/src/content/site-config-client.spec.ts apps/storefront/src/components/storefront-shell.tsx apps/storefront/src/app.tsx apps/storefront/src/content/institutional-content.ts apps/storefront/src/styles.css
git commit -m "feat: load site identity and home banners from settings"
```

---

### Task 4: Mercado Pago configurável e funcional

**Files:**
- Modify: `apps/api/src/modules/payments/mercado-pago.provider.ts`
- Modify: `apps/api/src/modules/payments/payment-provider.ts`
- Modify: `apps/api/src/modules/payments/payments.service.ts`
- Modify: `apps/api/src/modules/payments/payments.module.ts`
- Modify: `apps/api/src/modules/payments/mercado-pago-webhook.controller.ts`
- Create: `apps/api/src/modules/settings/payment-settings.service.ts`
- Test: `apps/api/src/modules/payments/mercado-pago.provider.spec.ts`
- Test: `apps/api/src/modules/settings/payment-settings.service.spec.ts`
- Modify: `apps/api/src/modules/checkout/checkout.service.ts`

**Interfaces:**
- `PaymentSettingsService.getRuntimeConfig(): Promise<RuntimePaymentConfig | null>` decrypts settings inside the API only.
- `MercadoPagoProvider.createCardPayment(input)` calls the official `/v1/payments` endpoint with a tokenized card and payer e-mail.
- `MercadoPagoProvider.createPixPayment(input)` calls the same endpoint with payment method `pix` and maps QR fields.
- `MercadoPagoProvider.refundPayment(input)` calls the refund endpoint and maps the provider id/status.
- `PaymentSettingsService.testConnection(input)` calls `/users/me` and returns `{ ok, environment, accountLabel? }` without returning the token.

- [ ] **Step 1: Write failing provider tests at the HTTP boundary**

```typescript
it('creates a Pix payment with the configured access token and maps QR data', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 42, status: 'pending', point_of_interaction: { transaction_data: { qr_code: 'pix-code', qr_code_base64: 'base64' } } }), { status: 201 }));
  const provider = new MercadoPagoProvider(settings, fetcher);
  const result = await provider.createPixPayment({ amountCents: 8300, payerEmail: 'cliente@example.com' });

  expect(fetcher).toHaveBeenCalledWith('https://api.mercadopago.com/v1/payments', expect.objectContaining({ method: 'POST', headers: expect.objectContaining({ Authorization: 'Bearer TEST-token' }) }));
  expect(result).toEqual(expect.objectContaining({ externalId: '42', status: 'pending', qrCode: 'pix-code' }));
});

it('maps provider errors to MERCADO_PAGO_REQUEST_FAILED', async () => {
  const provider = new MercadoPagoProvider(settings, vi.fn().mockResolvedValue(new Response('{}', { status: 500 })));
  await expect(provider.createPixPayment({ amountCents: 8300, payerEmail: 'cliente@example.com' })).rejects.toThrow('MERCADO_PAGO_REQUEST_FAILED');
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `pnpm --filter api exec vitest run src/modules/payments/mercado-pago.provider.spec.ts`

Expected: FAIL because the current provider always throws `MERCADO_PAGO_NOT_CONFIGURED`.

- [ ] **Step 3: Implement runtime settings and provider HTTP calls**

Inject `PaymentSettingsService`, use an injectable fetch function for tests, enforce a bounded `AbortSignal.timeout`, select the base URL from `TEST`/`PRODUCTION`, and map HTTP errors without including response bodies or tokens in thrown messages. Add payer e-mail to the provider input and obtain it from the order before creating a payment.

- [ ] **Step 4: Preserve idempotency and harden the webhook**

Keep the existing `IdempotencyKey` flow. Validate the Mercado Pago signature when a webhook secret is configured, persist the event before applying the payment status, and return the existing duplicate response for repeated event ids. Keep webhook handling outside the global API prefix as currently configured.

- [ ] **Step 5: Add configuration test endpoint and controller tests**

Add `POST /api/v1/admin/settings/payments/test`, protect it with `PAYMENTS_MANAGE`, and assert that a successful test returns no token. Add tests for missing configuration, invalid environment, timeout and permission rejection.

- [ ] **Step 6: Run payment regression tests and typecheck**

Run: `pnpm --filter api exec vitest run src/modules/payments src/modules/checkout && pnpm --filter api typecheck`

Expected: existing idempotency/controller tests and new provider tests pass.

- [ ] **Step 7: Commit the payment slice**

```bash
git add apps/api/src/modules/payments apps/api/src/modules/settings/payment-settings.service.ts apps/api/src/modules/checkout/checkout.service.ts
git commit -m "feat: connect Mercado Pago to admin settings"
```

---

### Task 5: SMTP, templates e fila de notificações

**Files:**
- Modify: `apps/api/package.json`
- Modify: `pnpm-lock.yaml`
- Create: `apps/api/src/modules/notifications/notifications.module.ts`
- Create: `apps/api/src/modules/notifications/notifications.service.ts`
- Create: `apps/api/src/modules/notifications/email-renderer.ts`
- Create: `apps/api/src/modules/notifications/email-sender.ts`
- Test: `apps/api/src/modules/notifications/email-renderer.spec.ts`
- Test: `apps/api/src/modules/notifications/notifications.service.spec.ts`
- Modify: `apps/api/src/modules/jobs/jobs.module.ts`
- Modify: `apps/api/src/modules/jobs/jobs.service.ts`
- Modify: `apps/api/src/modules/jobs/job-handlers.ts`
- Modify: `apps/api/src/modules/auth/auth.service.ts`
- Modify: `apps/api/src/modules/auth/auth.controller.ts`
- Modify: `apps/api/src/modules/orders/orders.service.ts`
- Modify: `apps/api/src/modules/payments/payments.service.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- `EmailRenderer.render(template, variables): { subject: string; html: string; text: string }` rejects unknown variables.
- `EmailSender.send(message): Promise<void>` sends through the decrypted SMTP configuration and redacts credentials from errors.
- `NotificationsService.enqueue(event, payload, transaction?): Promise<void>` creates one deduplicated `EmailDelivery` and a `SEND_TRANSACTIONAL_EMAIL` scheduled job.
- `NotificationsService.processJob(payload): Promise<void>` renders, sends and records delivery status with bounded retry behavior.

- [ ] **Step 1: Add Nodemailer and write failing renderer tests**

Run: `pnpm --filter api add nodemailer` and add `@types/nodemailer` if the compiler requires it. Then write:

```typescript
it('renders approved order variables in both HTML and text bodies', () => {
  const result = renderer.render({ subject: 'Pedido {{orderId}}', html: '<p>{{customerName}}</p>', text: 'Pedido {{orderId}}' }, { orderId: 'JE-100', customerName: 'Ana' });
  expect(result.subject).toBe('Pedido JE-100');
  expect(result.html).toContain('Ana');
  expect(result.text).toBe('Pedido JE-100');
});

it('rejects an undeclared variable instead of sending it literally', () => {
  expect(() => renderer.render({ subject: '{{secret}}', html: '', text: '' }, {})).toThrow('EMAIL_VARIABLE_NOT_ALLOWED');
});
```

- [ ] **Step 2: Run the renderer tests and verify failure**

Run: `pnpm --filter api exec vitest run src/modules/notifications/email-renderer.spec.ts`

Expected: FAIL because the renderer does not exist.

- [ ] **Step 3: Implement rendering and SMTP sender**

Allow only the documented variables for each event, HTML-escape interpolated text, preserve authored HTML tags, and generate text from the text template. Build a Nodemailer transport from decrypted settings, require TLS for production SMTP configuration, and map connection/authentication failures to `SMTP_SEND_FAILED` without logging the password.

- [ ] **Step 4: Write failing idempotency and retry tests**

```typescript
it('enqueues one delivery for the same event and recipient', async () => {
  await service.enqueue('ORDER_CREATED', { orderId: 'order-1', recipient: 'ana@example.com' });
  await service.enqueue('ORDER_CREATED', { orderId: 'order-1', recipient: 'ana@example.com' });
  expect(prisma.emailDelivery.create).toHaveBeenCalledTimes(1);
});

it('marks a delivery retryable when SMTP fails before max attempts', async () => {
  sender.send.mockRejectedValue(new Error('SMTP_SEND_FAILED'));
  await service.processJob({ deliveryId: 'delivery-1' });
  expect(prisma.emailDelivery.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'RETRY' }) }));
});
```

- [ ] **Step 5: Run notification tests and verify failure**

Run: `pnpm --filter api exec vitest run src/modules/notifications/notifications.service.spec.ts`

Expected: FAIL because delivery persistence and job processing are absent.

- [ ] **Step 6: Connect notification jobs and domain events**

Replace the no-op `SEND_TRANSACTIONAL_EMAIL` handler with the injected notification processor while preserving the existing `JobsService` batch contract. Enqueue events transactionally from account registration, `OrdersService.createFromCart`, payment creation/webhook status changes and `OrdersService.transition`. Use dedupe keys composed from event name, entity id and status. Add the missing customer registration endpoint/service path so a successful registration creates an active customer and emits `ACCOUNT_CREATED`; login behavior remains unchanged.

- [ ] **Step 7: Add admin SMTP/template endpoints and tests**

Implement `POST /api/v1/admin/settings/email/test` and `POST /api/v1/admin/settings/templates/:key/test`, protected by `NOTIFICATIONS_MANAGE`. Test sends use the submitted recipient only, never persist a test event as a store notification, and never return credentials. Add template seed data for the required Portuguese events with English/Spanish locale rows disabled until translated.

- [ ] **Step 8: Run all API regressions and typecheck**

Run: `pnpm --filter api exec vitest run src/modules/auth src/modules/orders src/modules/checkout src/modules/payments src/modules/jobs src/modules/notifications && pnpm --filter api typecheck`

Expected: PASS with no secret values in output.

- [ ] **Step 9: Commit the notification slice**

```bash
git add apps/api/package.json pnpm-lock.yaml apps/api/src/modules/notifications apps/api/src/modules/jobs apps/api/src/modules/auth apps/api/src/modules/orders apps/api/src/modules/payments apps/api/src/app.module.ts
git commit -m "feat: add SMTP templates and transactional notifications"
```

---

### Task 6: Interface de configurações no Admin

**Files:**
- Create: `apps/admin/src/features/settings/settings-page.tsx`
- Create: `apps/admin/src/features/settings/settings-api.ts`
- Create: `apps/admin/src/features/settings/settings-page.spec.tsx`
- Modify: `apps/admin/src/admin-shell.tsx`
- Modify: `apps/admin/src/styles.css`

**Interfaces:**
- `SettingsPage` renders tabs `site`, `banners`, `payments`, `email` and `templates`.
- `settings-api.ts` exposes typed `getSettings`, `saveSite`, `uploadMedia`, `saveBanner`, `savePaymentSettings`, `testPayment`, `saveEmailSettings`, `testEmail`, `saveTemplate`.
- Secret inputs are write-only; after save they show “Configurado” and never receive a secret value from the API.

- [ ] **Step 1: Write failing component tests**

```tsx
it('shows the configuration tabs and masked integration state', async () => {
  render(<SettingsPage />);
  expect(await screen.findByRole('tab', { name: 'Identidade do site' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Mercado Pago' })).toBeInTheDocument();
  expect(screen.getByText('Token configurado')).toBeInTheDocument();
  expect(screen.queryByDisplayValue('TEST-token')).not.toBeInTheDocument();
});

it('submits a home banner upload without requiring a URL field', async () => {
  render(<SettingsPage />);
  await userEvent.click(screen.getByRole('tab', { name: 'Banners da Home' }));
  expect(screen.getByLabelText('Enviar imagem desktop')).toHaveAttribute('type', 'file');
});
```

- [ ] **Step 2: Run the Admin test and verify failure**

Run: `pnpm --filter admin exec vitest run src/features/settings/settings-page.spec.tsx`

Expected: FAIL because the settings page and navigation entry do not exist.

- [ ] **Step 3: Implement typed API helpers and settings page**

Follow the existing `fetch(..., { credentials: 'include' })` style. Render success/error status messages, disable submit during requests, use multipart uploads for media, show banner ordering controls, and show “manter atual” behavior for omitted secrets. Include connection-test buttons for Mercado Pago and SMTP plus template preview/test controls.

- [ ] **Step 4: Add Admin navigation and Lucide icons**

Extend `AdminSection` with `settings`, add the navigation item with the existing Lucide `settings-2` icon, and render `SettingsPage` from `SectionContent`. Keep the current store link, authentication flow and all catalog sections unchanged.

- [ ] **Step 5: Add professional responsive styling**

Use the existing Admin tokens, cards, buttons, form grid and table styles. Keep secret fields visually distinct, make the tab strip keyboard accessible, and make banner previews maintain the configured aspect ratio on widths below 820px.

- [ ] **Step 6: Run Admin tests, typecheck and build**

Run: `pnpm --filter admin exec vitest run src/features/settings/settings-page.spec.tsx src/admin-shell.spec.ts && pnpm --filter admin typecheck && pnpm --filter admin build`

Expected: PASS and the build output remains rooted at `/admin/`.

- [ ] **Step 7: Commit the Admin slice**

```bash
git add apps/admin/src/features/settings apps/admin/src/admin-shell.tsx apps/admin/src/styles.css
git commit -m "feat: add admin settings workspace"
```

---

### Task 7: Integração final, documentação e verificação ponta a ponta

**Files:**
- Modify: `docs/runbooks/local-laragon.md`
- Modify: `docs/runbooks/hostinger-deploy.md`
- Modify: `apps/api/src/config/production.config.ts`
- Create: `apps/api/src/modules/settings/settings.e2e-spec.ts`
- Create: `apps/api/src/modules/notifications/notifications.e2e-spec.ts`

- [ ] **Step 1: Write failing e2e checks**

Cover the following HTTP contract with a test admin session: `GET /api/v1/site/config` is `200` and sanitized; admin site/banner/payment/email GETs are `200`; unauthenticated mutations return `401`; configured secrets are never present in JSON; and the public Home renders the remote logo/banner when the endpoint returns them.

- [ ] **Step 2: Run the e2e checks and verify failure**

Run: `pnpm --filter api test:e2e -- src/modules/settings/settings.e2e-spec.ts src/modules/notifications/notifications.e2e-spec.ts`

Expected: FAIL only for contracts not yet connected by the previous tasks.

- [ ] **Step 3: Complete runtime configuration and docs**

Document `SETTINGS_ENCRYPTION_KEY`, the Mercado Pago environment/token/public key/webhook setup, SMTP requirements, cron processing for `SEND_TRANSACTIONAL_EMAIL`, local URLs (`5173` storefront, `5174/admin/`, `3001` API proxy) and the production `/admin` shell. Add startup validation for missing production encryption key and invalid SMTP/payment combinations.

- [ ] **Step 4: Run the full verification set**

Run:

```bash
pnpm prisma validate
pnpm --filter api typecheck
pnpm --filter admin typecheck
pnpm --filter storefront typecheck
pnpm --filter api test
pnpm --filter admin test
pnpm --filter storefront test
pnpm build
```

Expected: all commands exit successfully; no test or build output contains a real token, password or SMTP credential.

- [ ] **Step 5: Perform local smoke checks**

Open `http://localhost:5174/admin/`, verify the new Configurações navigation after authentication, upload a non-sensitive test logo/banner, save masked Mercado Pago/SMTP metadata, send test e-mail, then open the storefront at `http://localhost:5173/` and verify the published identity/banner. Confirm `/loja` still shows the imported products.

- [ ] **Step 6: Commit documentation and final verification**

```bash
git add docs/runbooks apps/api/src/config/production.config.ts apps/api/src/modules/settings/settings.e2e-spec.ts apps/api/src/modules/notifications/notifications.e2e-spec.ts
git commit -m "docs: document settings integrations and verification"
```
