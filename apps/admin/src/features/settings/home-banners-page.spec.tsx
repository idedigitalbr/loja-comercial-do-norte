import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomeBannersPage } from './home-banners-page';

const snapshot = {
  site: { siteName: 'Jonas & Elivaldo', logoPath: null, faviconPath: null, address: null, phone: null, whatsapp: null, instagramUrl: null, title: null, description: null },
  banners: [{ id: 'banner-1', desktopPath: '/storage/home.webp', mobilePath: '/storage/home-mobile.webp', eyebrow: 'Jonas & Elivaldo', title: 'Você linda todos os dias', description: 'Agende já.', ctaLabel: 'ASSISTA NOSSO VÍDEO', ctaHref: 'https://youtube.com/watch?v=demo', sortOrder: 0, status: 'ACTIVE' as const }],
  payments: { environment: 'TEST' as const, publicKey: null, enabled: false, enablePix: true, enableCard: true, hasAccessToken: false, hasWebhookSecret: false },
  smtp: { host: null, port: 587, username: null, security: 'STARTTLS' as const, fromEmail: null, fromName: null, replyTo: null, enabled: false, hasPassword: false },
  templates: [],
  notifications: [],
};

describe('HomeBannersPage', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the dedicated home banner editor with existing banner content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => snapshot }));
    render(<HomeBannersPage />);

    expect(await screen.findByRole('heading', { name: 'Banners da Home' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Novo banner' })).toBeInTheDocument();
    expect(screen.getByText('Você linda todos os dias')).toBeInTheDocument();
    expect(screen.getByLabelText('Enviar imagem desktop')).toHaveAttribute('type', 'file');
    expect(screen.getByLabelText('Enviar imagem mobile (opcional)')).toHaveAttribute('type', 'file');
    expect(screen.getByText('1 banners cadastrados')).toBeInTheDocument();
  });

  it('shows the empty state when no home banner is registered', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...snapshot, banners: [] }) }));
    render(<HomeBannersPage />);

    expect(await screen.findByText('Nenhum banner cadastrado')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Novo banner' })).toBeInTheDocument();
  });
});
