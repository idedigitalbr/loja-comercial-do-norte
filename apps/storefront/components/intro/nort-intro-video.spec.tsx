/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { NortIntroVideo, NORT_INTRO_FINISHED_EVENT, formatTime } from './nort-intro-video';
import {
  STORAGE_KEY_INTRO_VIEWS,
  shouldShowNortIntro,
  recordNortIntroView,
  isIntroActive,
  setIntroActive,
} from './nort-intro-helpers';

describe('Nort Intro Video & YouTube-Style Minimal Loading Component', () => {
  beforeEach(() => {
    delete (window as any).location;
    (window as any).location = new URL('https://lojacomercialdonorte.vercel.app/');
    window.localStorage.clear();
    window.sessionStorage.clear();
    setIntroActive(false);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('formatTime helper', () => {
    it('formata segundos no padrão MM:SS com dois dígitos', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(13)).toBe('00:13');
      expect(formatTime(17)).toBe('00:17');
      expect(formatTime(65)).toBe('01:05');
      expect(formatTime(-1)).toBe('00:00');
      expect(formatTime(NaN)).toBe('00:00');
    });
  });

  describe('nort-intro-helpers', () => {
    it('permite exibição para novos visitantes e respeita o limite de 3 vezes', () => {
      expect(shouldShowNortIntro(window.localStorage)).toBe(true);
      expect(recordNortIntroView(window.localStorage)).toBe(1);
      expect(window.localStorage.getItem(STORAGE_KEY_INTRO_VIEWS)).toBe('1');

      expect(shouldShowNortIntro(window.localStorage)).toBe(true);
      expect(recordNortIntroView(window.localStorage)).toBe(2);
      expect(window.localStorage.getItem(STORAGE_KEY_INTRO_VIEWS)).toBe('2');

      expect(shouldShowNortIntro(window.localStorage)).toBe(true);
      expect(recordNortIntroView(window.localStorage)).toBe(3);
      expect(window.localStorage.getItem(STORAGE_KEY_INTRO_VIEWS)).toBe('3');

      expect(shouldShowNortIntro(window.localStorage)).toBe(false);
    });

    it('permite override forçado via query param ?intro=1 mesmo após 3 exibições', () => {
      window.localStorage.setItem(STORAGE_KEY_INTRO_VIEWS, '3');
      expect(shouldShowNortIntro(window.localStorage)).toBe(false);

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

    it('controla a flag isIntroActive corretamente', () => {
      expect(isIntroActive()).toBe(false);
      setIntroActive(true);
      expect(isIntroActive()).toBe(true);
      setIntroActive(false);
      expect(isIntroActive()).toBe(false);
    });
  });

  describe('NortIntroVideo Component (YouTube Fullscreen Redesign)', () => {
    beforeEach(() => {
      window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
      window.HTMLMediaElement.prototype.pause = vi.fn();
    });

    it('renderiza vídeo fullscreen limpo com o player inferior YouTube, sem molduras e sem cabeçalhos poluídos', () => {
      render(<NortIntroVideo forceOpen />);

      const dialog = screen.getByTestId('nort-intro-video-overlay');
      expect(dialog).toBeTruthy();

      const video = screen.getByTestId('nort-intro-video-element') as HTMLVideoElement;
      expect(video).toBeTruthy();
      expect(video.querySelector('source[type="video/webm"]')?.getAttribute('src')).toBe('/videos/nort-intro.webm');
      expect(video.querySelector('source[type="video/mp4"]')?.getAttribute('src')).toBe('/videos/nort-intro.mp4');

      // Sem controles nativos e sem textos desnecessários
      expect(video.getAttribute('controls')).toBeNull();
      expect(screen.queryByText('Carregando loja virtual Comercial do Norte...')).toBeNull();
      expect(screen.queryByText('Apresentação Oficial')).toBeNull();

      // Barra de progresso vermelha e marcador
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeTruthy();
      expect(screen.getByTestId('nort-intro-progress-marker')).toBeTruthy();

      // Controles inferiores
      expect(screen.getByTestId('nort-intro-play-toggle')).toBeTruthy();
      expect(screen.getByTestId('nort-intro-sound-toggle')).toBeTruthy();
      expect(screen.getByText('Carregando a loja será aberta em...')).toBeTruthy();
      expect(screen.getByTestId('nort-intro-countdown')).toBeTruthy();
      expect(screen.getByTestId('nort-intro-fullscreen-toggle')).toBeTruthy();
    });

    it('inicia mutado com o destaque animado "Clique para ativar o áudio" posicionado acima da barra', () => {
      render(<NortIntroVideo forceOpen />);

      const soundBtn = screen.getByTestId('nort-intro-sound-toggle');
      expect(soundBtn.getAttribute('aria-label')).toBe('Ativar som');

      // Destaque pulsante "Clique para ativar o áudio"
      const prompt = screen.getByTestId('nort-intro-audio-prompt');
      expect(prompt).toBeTruthy();
      expect(screen.getByText('Clique para ativar o áudio')).toBeTruthy();

      // Clica no destaque para ativar o som
      act(() => {
        fireEvent.click(prompt);
      });

      // Áudio desmutado
      expect(soundBtn.getAttribute('aria-label')).toBe('Desativar som');
      // Destaque desaparece
      expect(screen.queryByTestId('nort-intro-audio-prompt')).toBeNull();
    });

    it('alterna Play e Pause corretamente', async () => {
      render(<NortIntroVideo forceOpen />);

      const playBtn = screen.getByTestId('nort-intro-play-toggle');
      expect(playBtn.getAttribute('aria-label')).toBe('Pausar vídeo');

      act(() => {
        fireEvent.click(playBtn);
      });

      expect(playBtn.getAttribute('aria-label')).toBe('Reproduzir vídeo');

      await act(async () => {
        fireEvent.click(playBtn);
      });

      expect(playBtn.getAttribute('aria-label')).toBe('Pausar vídeo');
    });

    it('atualiza a contagem decrescente "Carregando a loja será aberta em... X Segundos" e a barra de progresso', () => {
      render(<NortIntroVideo forceOpen />);

      const video = screen.getByTestId('nort-intro-video-element') as HTMLVideoElement;

      act(() => {
        Object.defineProperty(video, 'duration', { value: 26, writable: true });
        fireEvent.loadedMetadata(video);

        Object.defineProperty(video, 'currentTime', { value: 10, writable: true });
        fireEvent.timeUpdate(video);
      });

      const countdown = screen.getByTestId('nort-intro-countdown');
      expect(countdown.textContent).toBe('16 Segundos');

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar.getAttribute('aria-valuenow')).toBe('38');
    });

    it('exibe o botão "Pular apresentação" APENAS após atingir a metade do vídeo', () => {
      render(<NortIntroVideo forceOpen />);

      const video = screen.getByTestId('nort-intro-video-element') as HTMLVideoElement;

      // Define duração total de 20s
      act(() => {
        Object.defineProperty(video, 'duration', { value: 20, writable: true });
        fireEvent.loadedMetadata(video);

        // Tempo em 5s (antes da metade de 10s)
        Object.defineProperty(video, 'currentTime', { value: 5, writable: true });
        fireEvent.timeUpdate(video);
      });

      // Botão NÃO deve estar presente antes da metade
      expect(screen.queryByTestId('nort-intro-skip-button')).toBeNull();

      // Avança para 10s (metade exata do vídeo)
      act(() => {
        Object.defineProperty(video, 'currentTime', { value: 10, writable: true });
        fireEvent.timeUpdate(video);
      });

      // Agora o botão estilo YouTube DEVE estar visível
      const skipBtn = screen.getByTestId('nort-intro-skip-button');
      expect(skipBtn).toBeTruthy();
      expect(skipBtn.textContent).toContain('Pular apresentação');
    });

    it('permite buscar ponto do vídeo (seek) ao clicar na barra de progresso', () => {
      render(<NortIntroVideo forceOpen />);

      const video = screen.getByTestId('nort-intro-video-element') as HTMLVideoElement;

      act(() => {
        Object.defineProperty(video, 'duration', { value: 100, writable: true });
        fireEvent.loadedMetadata(video);
      });

      const progressContainer = screen.getByTestId('nort-intro-progress-container');
      vi.spyOn(progressContainer, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 1000,
        height: 10,
        bottom: 10,
        right: 1000,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      act(() => {
        fireEvent.click(progressContainer, { clientX: 750 });
      });

      // 750 / 1000 = 75% -> 75s
      expect(video.currentTime).toBe(75);
    });

    it('fecha a intro e dispara evento customizado ao clicar em "Pular apresentação"', () => {
      vi.useFakeTimers();
      const onFinishMock = vi.fn();
      const eventListener = vi.fn();
      window.addEventListener(NORT_INTRO_FINISHED_EVENT, eventListener);

      render(<NortIntroVideo forceOpen onFinish={onFinishMock} />);

      const video = screen.getByTestId('nort-intro-video-element') as HTMLVideoElement;

      // Coloca após a metade do vídeo para exibir o botão
      act(() => {
        Object.defineProperty(video, 'duration', { value: 20, writable: true });
        fireEvent.loadedMetadata(video);
        Object.defineProperty(video, 'currentTime', { value: 15, writable: true });
        fireEvent.timeUpdate(video);
      });

      const skipBtn = screen.getByTestId('nort-intro-skip-button');
      act(() => {
        fireEvent.click(skipBtn);
      });

      expect(onFinishMock).toHaveBeenCalledTimes(1);
      expect(eventListener).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(750);
      });

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
