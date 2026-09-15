import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { StorefrontShell } from './storefront-shell';

describe('StorefrontShell', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    document.documentElement.lang = 'pt-BR';
  });

  it('presents branded commerce navigation and conversion actions', () => {
    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <main>Conteúdo da loja</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    expect(within(screen.getByRole('banner')).getByRole('img', { name: 'Jonas & Elivaldo Hair Designers' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Loja' })[0]).toHaveAttribute('href', '/loja');
    const primaryNav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(primaryNav).getByRole('link', { name: 'Sobre nós' })).toHaveAttribute('href', '/sobre-nos');
    expect(within(primaryNav).getByRole('link', { name: 'Serviços' })).toHaveAttribute('href', '/servicos');
    expect(within(primaryNav).getByRole('link', { name: 'Certificação internacional' })).toHaveAttribute('href', '/certificacao-internacional');
    expect(screen.getAllByRole('link', { name: 'Entrar' })[0]).toHaveAttribute('href', '/entrar');
    expect(screen.getAllByRole('link', { name: /WhatsApp/i })[0]).toHaveAttribute('href', expect.stringContaining('wa.me'));
    expect(screen.getAllByRole('link', { name: /Carrinho/i })[0]).toHaveAttribute('href', '/carrinho');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('uses Lucide icons for navigation, commerce and contact actions', () => {
    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <main>Conteúdo da loja</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const banner = screen.getByRole('banner');
    expect(banner.querySelector('[data-icon="chevron-down"].lucide')).toBeInTheDocument();
    expect(banner.querySelector('[data-icon="shopping-cart"].lucide')).toBeInTheDocument();
    expect(banner.querySelector('[data-icon="message-circle"].lucide')).toBeInTheDocument();
    expect(banner.querySelector('[data-icon="menu"].lucide')).toBeInTheDocument();

    const footer = screen.getByRole('contentinfo');
    expect(footer.querySelector('[data-icon="map-pin"].lucide')).toBeInTheDocument();
    expect(footer.querySelector('[data-icon="instagram"].lucide')).toBeInTheDocument();
    expect(screen.queryByText('⌄')).not.toBeInTheDocument();
    expect(screen.queryByText('◌')).not.toBeInTheDocument();
    expect(screen.queryByText('⌖')).not.toBeInTheDocument();
    expect(screen.queryByText('◉')).not.toBeInTheDocument();
  });

  it('marks only the current institutional route as active', () => {
    render(
      <MemoryRouter initialEntries={['/sobre-nos']}>
        <StorefrontShell>
          <main>Conteúdo institucional</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const primaryNav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(primaryNav).getByRole('link', { name: 'Sobre nós' })).toHaveClass('is-active');
    expect(within(primaryNav).getByRole('link', { name: 'Home' })).not.toHaveClass('is-active');
  });

  it('recreates the legacy footer contact block and bottom strip', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell>
          <main>Conteúdo institucional</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: /Av\. Gen\. Gurjão/ })).toHaveAttribute('href', 'https://maps.app.goo.gl/YpTsxUwiuvHUPDHw7');
    expect(within(footer).getByRole('link', { name: /WhatsApp/i })).toHaveAttribute('href', 'https://wa.me/5596981001897');
    expect(within(footer).getByRole('link', { name: /Instagram/i })).toHaveAttribute('href', 'https://instagram.com/jonas_elivaldo_hair_designers/');
    expect(within(footer).getByText(/Todos os direitos reservados/)).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: /Desenvolvido por/i })).toHaveAttribute('href', 'https://digital.ideinstituto.com.br/');
  });

  it('offers the six legacy languages and persists the selected language', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell>
          <main>Conteúdo institucional</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const languageGroup = within(screen.getByRole('contentinfo')).getByRole('group', { name: 'Idiomas' });
    expect(within(languageGroup).getAllByRole('button')).toHaveLength(6);

    const english = within(languageGroup).getByRole('button', { name: 'Traduzir site para English' });
    await user.click(english);

    expect(document.documentElement.lang).toBe('en');
    expect(window.localStorage.getItem('site-language')).toBe('en');
    expect(english).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps the external translation engine out of the focus order', async () => {
    window.localStorage.setItem('site-language', 'es');

    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell>
          <main>Conteúdo institucional</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    await waitFor(() => expect(within(screen.getByRole('group', { name: 'Idiomas' })).getByRole('button', { name: 'Traduzir site para Español' })).toHaveAttribute('aria-pressed', 'true'));
    expect(document.documentElement.lang).toBe('es');
    expect(document.getElementById('google_translate_element')).toHaveAttribute('inert');
  });
});
