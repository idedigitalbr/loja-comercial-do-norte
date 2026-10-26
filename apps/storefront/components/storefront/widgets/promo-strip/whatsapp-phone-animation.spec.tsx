/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { WhatsappPhoneAnimation } from './whatsapp-phone-animation';
import { PromoStripWidget } from './promo-strip';

// Mock Elementor Context
vi.mock('@/components/storefront/editor/elementor-editor-context', () => ({
  useElementor: () => ({
    isEditing: false,
    previewMode: false,
  }),
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: (entries: IntersectionObserverEntry[]) => void;
  constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
    this.callback = callback;
  }
  observe = vi.fn((elem: Element) => {
    this.callback([
      {
        isIntersecting: true,
        target: elem,
      } as unknown as IntersectionObserverEntry,
    ]);
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
}

describe('WhatsappPhoneAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    act(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders phone container with accessible label and initiates timeline', () => {
    render(<WhatsappPhoneAnimation ctaUrl="https://wa.me/5591983440880" />);

    const container = screen.getByRole('region', {
      name: /Demonstração interativa do WhatsApp da Comercial do Norte/i,
    });
    expect(container).toBeDefined();

    // Início na Gaveta de Apps (Cena 1)
    expect(screen.getByText('Quarta-feira, 28 de outubro')).toBeDefined();
    expect(screen.getByText('Comercial')).toBeDefined();

    // Executa os timers sucessivos da timeline até o chat final (~12s)
    act(() => {
      for (let i = 0; i < 25; i++) {
        vi.advanceTimersByTime(500);
      }
    });

    // Agora devemos ter chegado ao chat com as mensagens e o convite final
    expect(screen.getAllByText('Entre no nosso grupo WhatsApp').length).toBeGreaterThan(0);
    expect(screen.getByText('OFERTAS COMERCIAL DO NORTE')).toBeDefined();
    expect(screen.getByText('Entrar no Grupo de Ofertas')).toBeDefined();
  });

  it('supports restart on click', () => {
    const onRestartMock = vi.fn();
    render(<WhatsappPhoneAnimation onRestart={onRestartMock} />);

    const container = screen.getByRole('region', {
      name: /Demonstração interativa do WhatsApp da Comercial do Norte/i,
    });

    fireEvent.click(container);
    expect(onRestartMock).toHaveBeenCalled();
  });

  it('renders PromoStripWidget with whatsapp-group variant', () => {
    render(
      <PromoStripWidget
        ctaLabel="Participar do Grupo WhatsApp"
        ctaUrl="https://wa.me/5591983440880"
        highlightText="Exclusivas do WhatsApp"
        subtitle="Receba promoções relâmpago e lotes especiais."
        title="Entre em nosso Grupo de ofertas"
        variant="whatsapp-group"
      />
    );

    expect(screen.getByText('RECEBA OFERTAS NO WHATSAPP')).toBeDefined();
    expect(screen.getByText('Entre em nosso')).toBeDefined();
    expect(screen.getByText('Exclusivas do WhatsApp')).toBeDefined();
    expect(screen.getAllByText(/Participar do Grupo WhatsApp/i).length).toBeGreaterThan(0);
  });
});
