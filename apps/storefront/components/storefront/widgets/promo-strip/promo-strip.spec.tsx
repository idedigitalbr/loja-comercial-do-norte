/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { PromoStripWidget } from './promo-strip';

// Mock Next.js Image & Link
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, priority, unoptimized, ...rest }: any) => <img {...rest} />,
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Mock Elementor Context
vi.mock('@/components/storefront/editor/elementor-editor-context', () => ({
  useElementor: () => ({
    isEditing: false,
    previewMode: false,
  }),
}));

describe('PromoStripWidget', () => {
  afterEach(() => {
    cleanup();
  });
  it('renderiza a variante offers-strip diretamente como imagem no container sem fundo escuro e sem vão excessivo', () => {
    const { container } = render(
      <PromoStripWidget
        ctaUrl="/loja?oferta=1"
        highlightText="OFERTAS IMPERDÍVEIS"
        imageUrl="/assets/HOME Vitrine/S9-BANNERZINHO-Promo/S9-BANNERZINHO-Promo.webp"
        title="em embalagens, descartáveis e utilidades"
        variant="offers-strip"
      />
    );

    const section = container.querySelector('section');
    expect(section).toBeDefined();
    expect(section?.className).toContain('cn-container');
    expect(section?.className).not.toContain('bg-[#001F4D]');

    const imageContainer = section?.firstElementChild;
    expect(imageContainer?.className).toContain('rounded-2xl');
    expect(imageContainer?.className).not.toContain('bg-[#001F4D]');

    const img = section?.querySelector('img');
    expect(img).toBeDefined();
    expect(img?.getAttribute('src')).toBe('/assets/HOME Vitrine/S9-BANNERZINHO-Promo/S9-BANNERZINHO-Promo.webp');

    const link = section?.querySelector('a');
    expect(link).toBeDefined();
    expect(link?.getAttribute('href')).toBe('/loja?oferta=1');
  });

  it('direciona para a página de ofertas (/ofertas) por padrão quando ctaUrl está vazio ou não definido', () => {
    const { container } = render(
      <PromoStripWidget
        highlightText="OFERTAS IMPERDÍVEIS"
        variant="offers-strip"
      />
    );

    const link = container.querySelector('a');
    expect(link).toBeDefined();
    expect(link?.getAttribute('href')).toBe('/ofertas');
    expect(link?.getAttribute('aria-label')).toContain('OFERTAS IMPERDÍVEIS');
  });

  it('não adiciona link quando ctaUrl é explicitamente #', () => {
    const { container } = render(
      <PromoStripWidget
        ctaUrl="#"
        highlightText="OFERTAS IMPERDÍVEIS"
        variant="offers-strip"
      />
    );

    const link = container.querySelector('a');
    expect(link).toBeNull();
  });
});
