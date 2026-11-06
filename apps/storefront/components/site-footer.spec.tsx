/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SiteFooter } from './site-footer';

vi.mock('next/image', () => ({
  default: ({ fill, priority, unoptimized, ...props }: any) => <img {...props} />,
}));

describe('SiteFooter Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renderiza os links sociais incluindo o canal oficial do YouTube e o símbolo do Universo Business', () => {
    render(
      <SiteFooter
        categories={[]}
        site={{
          siteName: 'Comercial do Norte',
          metaDescription: 'Loja',
          logoUrl: '/logo.png',
          contactPhone: '(91) 98344-0880',
          contactEmail: 'contato@comercialdonorte.com.br',
          addressCity: 'Belém',
          addressState: 'PA',
        } as any}
      />
    );

    // YouTube Comercial do Norte (Issue #72)
    const youtubeLink = screen.getByRole('link', {
      name: /canal oficial no youtube comercial do norte/i,
    });
    expect(youtubeLink).toBeDefined();
    expect(youtubeLink.getAttribute('href')).toBe(
      'https://www.youtube.com/@comercialdosplasticosdistr243'
    );
    expect(youtubeLink.getAttribute('target')).toBe('_blank');

    // Universo Business Podcast (Issue #73)
    const universoBusinessLink = screen.getByRole('link', {
      name: /podcast universo business/i,
    });
    expect(universoBusinessLink).toBeDefined();
    expect(universoBusinessLink.getAttribute('href')).toBe(
      'https://www.youtube.com/@universobusinesscast'
    );
    expect(universoBusinessLink.getAttribute('target')).toBe('_blank');

    // Imagem do símbolo oficial Universo Business
    const universoBusinessImg = screen.getByAltText(/símbolo do universo business/i);
    expect(universoBusinessImg).toBeDefined();
    expect(universoBusinessImg.getAttribute('src')).toBe(
      '/logo-universo-business-transparente.png'
    );
  });
});
