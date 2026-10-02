import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SettingsPage } from './settings-page';

const snapshot = {
  site: { siteName: 'Jonas & Elivaldo', logoPath: '/storage/logo.webp', faviconPath: null, address: 'Macapá', phone: '(96) 98100-1897', whatsapp: '5596981001897', instagramUrl: 'https://instagram.com/je', title: 'Jonas', description: 'Descrição' },
  banners: [],
  payments: { environment: 'TEST', publicKey: 'TEST-public', enabled: false, enablePix: true, enableCard: true, hasAccessToken: true, hasWebhookSecret: false },
  smtp: { host: 'smtp.example.com', port: 587, username: 'mailer@example.com', security: 'STARTTLS', fromEmail: 'loja@example.com', fromName: 'Loja', replyTo: null, enabled: false, hasPassword: true },
  templates: [],
  notifications: [],
};

const templateSnapshot = {
  ...snapshot,
  templates: [{ id: 'template-1', key: 'ORDER_CREATED', locale: 'pt-BR', subject: 'Pedido {{orderId}}', htmlBody: '<h1>Olá {{customerName}}</h1>', textBody: 'Olá {{customerName}}', enabled: true }],
};

describe('SettingsPage', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('shows configuration tabs and masked integration state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => snapshot }));
    render(<SettingsPage />);

    expect(await screen.findByRole('tab', { name: 'Identidade do site' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Banners da Home' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Mercado Pago' })).toBeInTheDocument();
    expect(await screen.findByText('Token configurado')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('TEST-token')).not.toBeInTheDocument();
  });

  it('reports a loading failure without crashing the admin shell', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    render(<SettingsPage />);

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar as configurações.'));
  });

  it('shows a sandboxed preview for the selected email template', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => templateSnapshot }));
    render(<SettingsPage />);

    await userEvent.setup().click(await screen.findByRole('tab', { name: 'Templates de e-mail' }));

    const preview = await screen.findByTitle('Pré-visualização do template');
    expect(preview).toHaveAttribute('sandbox');
    expect(preview).toHaveAttribute('srcdoc', expect.stringContaining('Ana Cliente'));
  });
});
