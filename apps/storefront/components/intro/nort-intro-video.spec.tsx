/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { NortIntroVideo, NORT_INTRO_FINISHED_EVENT, formatTime, openNortVideo, OPEN_NORT_VIDEO_EVENT } from './nort-intro-video';
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
    (window as any).location = new URL('https://loja-comercialdonorte.vercel.app/');
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
    it('por padrão, abertura automática ao abrir o site está desativada', () => {
      expect(shouldShowNortIntro(window.localStorage)).toBe(false);
    });

    it('permite exibição para novos visitantes e respeita o limite de 3 vezes quando enforceLimit está ativo', () => {
      expect(shouldShowNortIntro(window.localStorage, true, true)).toBe(true);
      expect(recordNortIntroView(window.localStorage)).toBe(1);
      expect(window.localStorage.getItem(STORAGE_KEY_INTRO_VIEWS)).toBe('1');

      expect(shouldShowNortIntro(window.localStorage, true, true)).toBe(true);
      expect(recordNortIntroView(window.localStorage)).toBe(2);
      expect(window.localStorage.getItem(STORAGE_KEY_INTRO_VIEWS)).toBe('2');

      expect(shouldShowNortIntro(window.localStorage, true, true)).toBe(true);
      expect(recordNortIntroView(window.localStorage)).toBe(3);
      expect(window.localStorage.getItem(STORAGE_KEY_INTRO_VIEWS)).toBe('3');

      expect(shouldShowNortIntro(window.localStorage, true, true)).toBe(false);
    });

    it('quando auto-abertura está ativa e enforceLimit=false, exibe sempre independentemente do número de visualizações', () => {
      window.localStorage.setItem(STORAGE_KEY_INTRO_VIEWS, '10');
      expect(shouldShowNortIntro(window.localStorage, false, true)).toBe(true);
    });

    it('permite override forçado via query param ?intro=1 mesmo após 3 exibições', () => {
      window.localStorage.setItem(STORAGE_KEY_INTRO_VIEWS, '3');
      expect(shouldShowNortIntro(window.localStorage, true)).toBe(false);

      delete (window as any).location;
      (window as any).location = new URL('https://loja-comercialdonorte.vercel.app/?intro=1');

      expect(shouldShowNortIntro(window.localStorage, true)).toBe(true);
    });

    it('reseta contagem quando query param ?reset-intro=1 é fornecido', () => {
      window.localStorage.setItem(STORAGE_KEY_INTRO_VIEWS, '5');
      delete (window as any).location;
      (window as any).location = new URL('https://loja-comercialdonorte.vercel.app/?reset-intro=1');

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

    it('renderiza com a barrinha minimalista vermelha e a contagem mini no canto inferior direito', () => {
      render(<NortIntroVideo forceOpen />);

      const dialog = screen.getByTestId('nort-intro-video-overlay');
      expect(dialog).toBeTruthy();

      const video = screen.getByTestId('nort-intro-video-element') as HTMLVideoElement;
      expect(video).toBeTruthy();

      // Barra de progresso vermelha e marcador minimalista no rodapé estão presentes
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeTruthy();
      expect(screen.getByTestId('nort-intro-progress-marker')).toBeTruthy();

      // Status mini no canto inferior direito está presente mesmo no modo minimalista
      expect(screen.getByTestId('nort-intro-countdown-mini')).toBeTruthy();

      // Aviso flutuante pedindo para clicar está presente quando mutado
      const floatingPrompt = screen.getByTestId('nort-intro-audio-prompt-floating');
      expect(floatingPrompt).toBeTruthy();
      expect(floatingPrompt.textContent).toContain('Clique para ativar o áudio');
    });

    it('clicar em qualquer canto do vídeo na 1ª vez ativa o áudio e reinicia o vídeo do começo', () => {
      render(<NortIntroVideo forceOpen />);

      const video = screen.getByTestId('nort-intro-video-element') as HTMLVideoElement;
      video.currentTime = 8;

      const soundBtn = screen.getByTestId('nort-intro-sound-toggle');
      expect(soundBtn.getAttribute('aria-label')).toBe('Ativar som');

      // Clica no vídeo
      act(() => {
        fireEvent.click(video);
      });

      // O vídeo volta para 0 e ativa o som
      expect(video.currentTime).toBe(0);
      expect(soundBtn.getAttribute('aria-label')).toBe('Desativar som');
      expect(window.HTMLMediaElement.prototype.pause).not.toHaveBeenCalled();

      // O aviso flutuante de desmutar desaparece
      expect(screen.queryByTestId('nort-intro-audio-prompt-floating')).toBeNull();
    });

    it('quando o vídeo é mutado novamente, o aviso flutuante volta a aparecer', () => {
      render(<NortIntroVideo forceOpen />);

      const video = screen.getByTestId('nort-intro-video-element') as HTMLVideoElement;

      // 1º clique: ativa o áudio -> aviso desaparece
      act(() => {
        fireEvent.click(video);
      });
      expect(screen.queryByTestId('nort-intro-audio-prompt-floating')).toBeNull();

      // 2º clique: muta o áudio -> aviso volta a aparecer!
      act(() => {
        fireEvent.click(video);
      });
      expect(screen.getByTestId('nort-intro-audio-prompt-floating')).toBeTruthy();

      // 3º clique: desmuta novamente -> aviso desaparece!
      act(() => {
        fireEvent.click(video);
      });
      expect(screen.queryByTestId('nort-intro-audio-prompt-floating')).toBeNull();
    });

    it('expande os controles inferiores quando o mouse se move para o rodapé', () => {
      render(<NortIntroVideo forceOpen />);

      const overlay = screen.getByTestId('nort-intro-video-overlay');
      const dialog = screen.getByTestId('nort-intro-video-overlay');
      const footer = dialog.querySelector('footer');

      // Move o mouse para a área inferior (y = 700)
      act(() => {
        fireEvent.mouseMove(overlay, { clientX: 200, clientY: 700 });
      });

      expect(footer?.className).toContain('pb-4');
    });

    it('permite ajustar o volume através do slider', () => {
      render(<NortIntroVideo forceOpen />);

      const slider = screen.getByTestId('nort-intro-volume-slider') as HTMLInputElement;
      const soundBtn = screen.getByTestId('nort-intro-sound-toggle');

      act(() => {
        fireEvent.change(slider, { target: { value: '0.6' } });
      });

      expect(soundBtn.getAttribute('aria-label')).toBe('Desativar som');
    });

    it('atualiza a contagem decrescente em ambos os locais (mini e expandido)', () => {
      render(<NortIntroVideo forceOpen />);

      const video = screen.getByTestId('nort-intro-video-element') as HTMLVideoElement;

      act(() => {
        Object.defineProperty(video, 'duration', { value: 26, writable: true });
        fireEvent.loadedMetadata(video);

        Object.defineProperty(video, 'currentTime', { value: 10, writable: true });
        fireEvent.timeUpdate(video);
      });

      const countdownMini = screen.getByTestId('nort-intro-countdown-mini');
      expect(countdownMini.textContent).toBe('16 Segundos');

      const countdown = screen.getByTestId('nort-intro-countdown');
      expect(countdown.textContent).toBe('16 Segundos');

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar.getAttribute('aria-valuenow')).toBe('38');
    });

    it('exibe o botão de pular mini no canto direito APENAS após atingir a metade do vídeo', () => {
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
      expect(screen.queryByTestId('nort-intro-skip-button-mini')).toBeNull();

      // Avança para 10s (metade exata do vídeo)
      act(() => {
        Object.defineProperty(video, 'currentTime', { value: 10, writable: true });
        fireEvent.timeUpdate(video);
      });

      // Agora o botão de pular mini DEVE estar visível no canto direito
      const skipMini = screen.getByTestId('nort-intro-skip-button-mini');
      expect(skipMini).toBeTruthy();
      expect(skipMini.textContent).toContain('Pular');
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

    it('fecha a intro e dispara evento customizado ao clicar no botão de pular', () => {
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

      const skipBtn = screen.getByTestId('nort-intro-skip-button-mini');
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

    it('não renderiza quando o query param ?no-intro=1 está presente', () => {
      delete (window as any).location;
      (window as any).location = new URL('https://loja-comercialdonorte.vercel.app/?no-intro=1');

      render(<NortIntroVideo />);

      expect(screen.queryByTestId('nort-intro-video-overlay')).toBeNull();
    });

    it('abre o player em tela cheia ao receber o evento open-nort-intro-video e fecha pelo botão fechar', () => {
      render(<NortIntroVideo />);
      expect(screen.queryByTestId('nort-intro-video-overlay')).toBeNull();

      act(() => {
        openNortVideo();
      });

      expect(screen.getByTestId('nort-intro-video-overlay')).toBeDefined();
      expect(screen.getByTestId('nort-intro-close-button')).toBeDefined();

      const closeBtn = screen.getByTestId('nort-intro-close-button');
      act(() => {
        fireEvent.click(closeBtn);
      });
    });
  });
});
