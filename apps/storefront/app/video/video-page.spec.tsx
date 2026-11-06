/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VideoPageClient } from './video-page-client';
import * as introModule from '@/components/intro';

vi.mock('next/image', () => ({
  default: ({ fill, priority, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: any) => {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

describe('VideoPageClient (/video)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(introModule, 'openNortVideo').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('dispara a abertura do vídeo em tela cheia automaticamente ao carregar a página', () => {
    vi.useFakeTimers();
    render(<VideoPageClient whatsapp="5591983440880" siteUrl="https://loja-comercialdonorte.vercel.app" />);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(introModule.openNortVideo).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('renderiza os títulos principais, identificação oficial e preview do vídeo', () => {
    render(<VideoPageClient whatsapp="5591983440880" siteUrl="https://loja-comercialdonorte.vercel.app" />);

    expect(screen.getByText(/para todos os negócios/i)).toBeDefined();
    expect(screen.getByText(/de todos os tamanhos/i)).toBeDefined();
    expect(screen.getByText(/apresentação institucional comercial do norte/i)).toBeDefined();
    expect(screen.getByAltText(/assista ao vídeo institucional comercial do norte/i)).toBeDefined();
  });

  it('permite reabrir o vídeo em tela cheia ao clicar no botão de play da vitrine ou no CTA de replay', () => {
    render(<VideoPageClient whatsapp="5591983440880" siteUrl="https://loja-comercialdonorte.vercel.app" />);

    const heroPlayBtn = screen.getByTestId('video-hero-play-button');
    fireEvent.click(heroPlayBtn);
    expect(introModule.openNortVideo).toHaveBeenCalled();

    const replayCtaBtn = screen.getByTestId('video-cta-replay-button');
    fireEvent.click(replayCtaBtn);
    expect(introModule.openNortVideo).toHaveBeenCalled();
  });

  it('renderiza os links para a Loja Virtual e atendimento no WhatsApp com parâmetros corretos', () => {
    render(<VideoPageClient whatsapp="5591983440880" siteUrl="https://loja-comercialdonorte.vercel.app" />);

    const storeLink = screen.getByTestId('video-cta-store-button');
    expect(storeLink.getAttribute('href')).toBe('/');

    const topStoreLink = screen.getByTestId('video-go-to-store-button');
    expect(topStoreLink.getAttribute('href')).toBe('/');

    const whatsappChat = screen.getByTestId('video-cta-whatsapp-chat-button');
    expect(whatsappChat.getAttribute('href')).toContain('https://wa.me/5591983440880');
    expect(whatsappChat.getAttribute('href')).toContain(encodeURIComponent('vídeo de apresentação'));

    const whatsappShare = screen.getByTestId('video-cta-whatsapp-share-button');
    expect(whatsappShare.getAttribute('href')).toContain('https://api.whatsapp.com/send');
    expect(whatsappShare.getAttribute('href')).toContain(
      encodeURIComponent('https://loja-comercialdonorte.vercel.app/video')
    );
  });

  it('renderiza a seção do Mascote Nort e segmentos com atalhos de navegação', () => {
    render(<VideoPageClient whatsapp="5591983440880" siteUrl="https://loja-comercialdonorte.vercel.app" />);

    expect(screen.getByAltText(/mascote nort comercial do norte/i)).toBeDefined();
    expect(screen.getByText(/veja as embalagens ideais para o seu segmento/i)).toBeDefined();
    expect(screen.getByText(/🍔 lanchonetes/i)).toBeDefined();
    expect(screen.getByText(/🍕 pizzarias/i)).toBeDefined();
    expect(screen.getByText(/🎂 confeitarias/i)).toBeDefined();
    expect(screen.getByText(/🥡 delivery & refeições/i)).toBeDefined();
  });

  it('permite copiar o link do vídeo para compartilhar com feedback visual', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<VideoPageClient whatsapp="5591983440880" siteUrl="https://loja-comercialdonorte.vercel.app" />);

    const shareBtn = screen.getByTestId('video-share-button');
    await act(async () => {
      fireEvent.click(shareBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith('https://loja-comercialdonorte.vercel.app/video');
    expect(screen.getByText('Copiado!')).toBeDefined();
  });
});
