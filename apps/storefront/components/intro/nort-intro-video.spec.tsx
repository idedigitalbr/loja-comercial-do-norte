/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { NortIntroVideo, NORT_INTRO_FINISHED_EVENT } from './nort-intro-video';
import {
  STORAGE_KEY_INTRO_VIEWS,
  MAX_INTRO_VIEWS,
  shouldShowNortIntro,
  recordNortIntroView,
} from './nort-intro-helpers';

describe('Nort Intro Video & Fake Loading Component', () => {
  beforeEach(() => {
    delete (window as any).location;
    (window as any).location = new URL('https://lojacomercialdonorte.vercel.app/');
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('nort-intro-helpers', () => {
    it('permite exibição para novos visitantes e respeita o limite de 3 vezes', () => {
      // 1ª visita: ainda não exibido (vazio)
      expect(shouldShowNortIntro(window.localStorage)).toBe(true);
      expect(recordNortIntroView(window.localStorage)).toBe(1);
      expect(window.localStorage.getItem(STORAGE_KEY_INTRO_VIEWS)).toBe('1');

      // 2ª visita
      expect(shouldShowNortIntro(window.localStorage)).toBe(true);
      expect(recordNortIntroView(window.localStorage)).toBe(2);
      expect(window.localStorage.getItem(STORAGE_KEY_INTRO_VIEWS)).toBe('2');

      // 3ª visita
      expect(shouldShowNortIntro(window.localStorage)).toBe(true);
      expect(recordNortIntroView(window.localStorage)).toBe(3);
      expect(window.localStorage.getItem(STORAGE_KEY_INTRO_VIEWS)).toBe('3');

      // 4ª visita em diante: atingiu MAX_INTRO_VIEWS (3) -> NÃO deve mais abrir
      expect(shouldShowNortIntro(window.localStorage)).toBe(false);
    });

    it('permite override forçado via query param ?intro=1 mesmo após 3 exibições', () => {
      window.localStorage.setItem(STORAGE_KEY_INTRO_VIEWS, '3');
      expect(shouldShowNortIntro(window.localStorage)).toBe(false);

      // Simula query param no window
      delete (window as any).location;
      (window as any).location = new URL('https://lojacomercialdonorte.vercel.app/?intro=1');

      expect(shouldShowNortIntro(window.localStorage)).toBe(true);
    });

    it('reseta contagem quando query param ?reset-intro=1 é fornecido', () => {
      window.localStorage.setItem(STORAGE_KEY_INTRO_VIEWS, '5');
      delete (window as any).location;
      (window as any).location = new URL('https://lojacomercialdonorte.vercel.app/?reset-intro=1');

      expect(shouldShowNortIntro(window.localStorage)).toBe(true);
      expect(window.localStorage.getItem(STORAGE_KEY_INTRO_VIEWS)).toBeNull();
    });
  });

  describe('NortIntroVideo Component', () => {
    beforeEach(() => {
      // Mock do HTMLMediaElement no jsdom
      window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
      window.HTMLMediaElement.prototype.pause = vi.fn();
    });

    it('renderiza tela cheia com vídeo, barra de progresso e texto de carregamento', () => {
      render(<NortIntroVideo forceOpen />);

      // Verifica dialog acessível
      const dialog = screen.getByTestId('nort-intro-video-overlay');
      expect(dialog).toBeTruthy();

      // Verifica elemento de vídeo com fontes webm e mp4
      const video = screen.getByTestId('nort-intro-video-element') as HTMLVideoElement;
      expect(video).toBeTruthy();
      expect(video.querySelector('source[type="video/webm"]')?.getAttribute('src')).toBe('/videos/nort-intro.webm');
      expect(video.querySelector('source[type="video/mp4"]')?.getAttribute('src')).toBe('/videos/nort-intro.mp4');

      // Não tem controles nativos de play/pause
      expect(video.getAttribute('controls')).toBeNull();

      // Verifica texto de loading
      expect(screen.getByText('Carregando loja virtual Comercial do Norte...')).toBeTruthy();

      // Verifica presença da barra de progresso
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeTruthy();

      // Verifica branding
      expect(screen.getByText('Comercial do Norte')).toBeTruthy();
      expect(screen.getByText('Apresentação Oficial')).toBeTruthy();
    });

    it('atualiza o progresso e contagem regressiva ao receber eventos de timeUpdate e metadata', () => {
      render(<NortIntroVideo forceOpen />);

      const video = screen.getByTestId('nort-intro-video-element') as HTMLVideoElement;

      act(() => {
        // Simula carregamento de metadata com duração de 20s
        Object.defineProperty(video, 'duration', { value: 20, writable: true });
        fireEvent.loadedMetadata(video);

        // Simula avanço de tempo para 10s (50%)
        Object.defineProperty(video, 'currentTime', { value: 10, writable: true });
        fireEvent.timeUpdate(video);
      });

      // 50% de progresso e 10s restantes
      expect(screen.getByText('50%')).toBeTruthy();
      expect(screen.getByText('10s restantes')).toBeTruthy();
    });

    it('alterna o botão de som entre ativado e desativado', () => {
      render(<NortIntroVideo forceOpen />);

      const soundBtn = screen.getByTestId('nort-intro-sound-toggle');
      expect(screen.getByText('Ativar som')).toBeTruthy();

      act(() => {
        fireEvent.click(soundBtn);
      });

      expect(screen.getByText('Som ativo')).toBeTruthy();
    });

    it('fecha a intro e dispara evento customizado ao clicar em "Pular para a loja"', () => {
      vi.useFakeTimers();
      const onFinishMock = vi.fn();
      const eventListener = vi.fn();
      window.addEventListener(NORT_INTRO_FINISHED_EVENT, eventListener);

      render(<NortIntroVideo forceOpen onFinish={onFinishMock} />);

      const skipBtn = screen.getByTestId('nort-intro-skip-button');
      act(() => {
        fireEvent.click(skipBtn);
      });

      // Dispara callback e evento imediatamente
      expect(onFinishMock).toHaveBeenCalledTimes(1);
      expect(eventListener).toHaveBeenCalledTimes(1);

      // Avança o timer de fade-out (700ms)
      act(() => {
        vi.advanceTimersByTime(750);
      });

      // O overlay é removido do DOM
      expect(screen.queryByTestId('nort-intro-video-overlay')).toBeNull();

      window.removeEventListener(NORT_INTRO_FINISHED_EVENT, eventListener);
      vi.useRealTimers();
    });

    it('finaliza automaticamente quando o vídeo chega ao fim (onEnded)', () => {
      vi.useFakeTimers();
      const onFinishMock = vi.fn();

      render(<NortIntroVideo forceOpen onFinish={onFinishMock} />);

      const video = screen.getByTestId('nort-intro-video-element') as HTMLVideoElement;

      act(() => {
        fireEvent.ended(video);
      });

      expect(onFinishMock).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(750);
      });

      expect(screen.queryByTestId('nort-intro-video-overlay')).toBeNull();
      vi.useRealTimers();
    });

    it('não renderiza se o visitante já visualizou 3 vezes e não há forceOpen', () => {
      window.localStorage.setItem(STORAGE_KEY_INTRO_VIEWS, '3');

      render(<NortIntroVideo />);

      expect(screen.queryByTestId('nort-intro-video-overlay')).toBeNull();
    });
  });
});
