'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  STORAGE_KEY_INTRO_VIEWS,
  recordNortIntroView,
  shouldShowNortIntro,
  setIntroActive,
} from './nort-intro-helpers';

export const NORT_INTRO_FINISHED_EVENT = 'nort-intro-finished';

export interface NortIntroVideoProps {
  /**
   * Forçar abertura para testes ou previews
   */
  forceOpen?: boolean;
  /**
   * Callback disparado quando o vídeo termina ou é pulado
   */
  onFinish?: () => void;
}

/**
 * Formata segundos no formato MM:SS (ex: 00:13 / 00:17)
 */
export function formatTime(seconds: number): string {
  if (Number.isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function NortIntroVideo({ forceOpen = false, onFinish }: NortIntroVideoProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  // O áudio deve começar estritamente MUTADO para garantir autoplay sem restrições do navegador
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(17);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const finishedRef = useRef(false);

  // Sinaliza imediatamente para o ecossistema que a intro está ativa no client
  if (typeof window !== 'undefined' && (forceOpen || shouldShowNortIntro())) {
    setIntroActive(true);
  }

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    setIsFadingOut(true);
    setIntroActive(false);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(NORT_INTRO_FINISHED_EVENT));
    }

    onFinish?.();

    const timer = setTimeout(() => {
      setIsOpen(false);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleTogglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isPlaying) {
      vid.pause();
      setIsPlaying(false);
    } else {
      vid
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [isPlaying]);

  const handleToggleSound = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      // Garante que continue tocando se estiver pausado
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
    // Ao interagir com o controle de som, fecha o destaque visual
    setShowAudioPrompt(false);
  }, [isMuted]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width <= 0) return;
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const targetTime = ratio * duration;
      if (videoRef.current && duration > 0) {
        videoRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    },
    [duration]
  );

  const handleToggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    const targetElement = overlayRef.current || document.documentElement;

    if (!document.fullscreenElement) {
      if (targetElement.requestFullscreen) {
        targetElement.requestFullscreen().catch(() => {});
      } else if ((targetElement as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        (targetElement as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as unknown as { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
        (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);

    // Atalhos globais para testes manuais
    if (typeof window !== 'undefined') {
      (window as unknown as { __replayNortIntro?: () => void }).__replayNortIntro = () => {
        try {
          localStorage.removeItem(STORAGE_KEY_INTRO_VIEWS);
          window.location.search = '?intro=1';
        } catch {}
      };
      (window as unknown as { __resetNortIntro?: () => void }).__resetNortIntro = () => {
        try {
          localStorage.removeItem(STORAGE_KEY_INTRO_VIEWS);
          window.location.reload();
        } catch {}
      };
    }

    if (forceOpen || shouldShowNortIntro()) {
      recordNortIntroView();
      setIntroActive(true);
      setIsOpen(true);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    } else {
      setIntroActive(false);
    }
  }, [forceOpen]);

  // Autoplay mutado garantido por padrão em conformidade com políticas dos navegadores
  useEffect(() => {
    if (!isOpen) return;

    const vid = videoRef.current;
    if (vid) {
      vid.muted = true;
      setIsMuted(true);

      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Em caso de bloqueio total excepcional pelo navegador
            setIsPlaying(false);
          });
      }
    }
  }, [isOpen]);

  // Sincronização do estado de Fullscreen
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish();
      } else if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleSound();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleFinish, handleTogglePlay, handleToggleSound, handleToggleFullscreen]);

  // Restaura overflow ao desmontar
  useEffect(() => {
    return () => {
      setIntroActive(false);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, []);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const content = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Apresentação Oficial Comercial do Norte"
      data-testid="nort-intro-video-overlay"
      onClick={(e) => {
        // Clicar no fundo da tela (vídeo) alterna reprodução/pausa
        if (e.target === overlayRef.current || e.target === videoRef.current) {
          handleTogglePlay();
        }
      }}
      className={`fixed inset-0 z-[9999999] w-screen h-screen bg-black overflow-hidden select-none transition-opacity duration-700 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* VÍDEO FULLSCREEN TOTAL: Preenche 100% da viewport, sem molduras nem headers */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
        }}
        onLoadedMetadata={(e) => {
          const dur = e.currentTarget.duration;
          if (dur && !Number.isNaN(dur) && dur > 0) {
            setDuration(dur);
          }
        }}
        onEnded={handleFinish}
        onError={handleFinish}
        data-testid="nort-intro-video-element"
        className="absolute inset-0 w-full h-full object-cover object-center cursor-pointer"
      >
        <source src="/videos/nort-intro.webm" type="video/webm" />
        <source src="/videos/nort-intro.mp4" type="video/mp4" />
      </video>

      {/* GRADIENTE INFERIOR SUAVE ESTILO YOUTUBE FULLSCREEN */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none h-44 sm:h-56 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-30"
        aria-hidden="true"
      />

      {/* NOVO PLAYER INFERIOR: BARRA DE PROGRESSO VERMELHA E CONTROLES */}
      <footer className="absolute bottom-0 inset-x-0 z-40 px-4 sm:px-8 md:px-12 pb-5 sm:pb-7 pt-6 flex flex-col gap-3 sm:gap-4 select-none">
        {/* ÚNICA BARRA DE PROGRESSO: Vermelha #FF0033 com Marcador Dinâmico e Cápsula com % integrada */}
        <div
          className="relative w-full py-2 -my-2 cursor-pointer group"
          onClick={handleSeek}
          role="slider"
          tabIndex={0}
          aria-label="Progresso do vídeo"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPercent)}
          data-testid="nort-intro-progress-container"
        >
          {/* Trilha base branca com transparência */}
          <div className="relative w-full h-1 sm:h-[4px] bg-white/30 rounded-full overflow-visible transition-all duration-150 group-hover:h-1.5">
            {/* Barra percorrida vermelha #FF0033 */}
            <div
              className="h-full bg-[#FF0033] rounded-full relative transition-all duration-75 ease-linear shadow-[0_0_8px_rgba(255,0,51,0.7)]"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progressPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {/* Marcador com Cápsula Vermelha Dinâmica contendo a porcentagem atual */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center justify-center z-10 pointer-events-none"
                data-testid="nort-intro-progress-marker"
              >
                <span className="bg-[#FF0033] text-white font-bold text-[10px] sm:text-xs leading-none px-2 py-0.5 rounded-full shadow-[0_2px_8px_rgba(255,0,51,0.6)] select-none whitespace-nowrap">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LINHA HORIZONTAL DE CONTROLES INFERIORES */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-white">
          {/* LADO ESQUERDO: Play/Pause, Mute com Destaque Animado, Tempo, Separador e "Preparando sua loja..." */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* 1. Botão Reproduzir / Pausar */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePlay();
              }}
              data-testid="nort-intro-play-toggle"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
            >
              {isPlaying ? (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6,4 20,12 6,20" />
                </svg>
              )}
            </button>

            {/* 2. Botão de Áudio com Destaque Animado Obrigatório */}
            <div className="relative flex items-center">
              {/* Destaque Animado no Botão de Áudio: "Clique para ativar o áudio" */}
              {showAudioPrompt && isMuted && (
                <div
                  className="absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-6 mb-2 flex flex-col items-start z-50 cursor-pointer pointer-events-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSound();
                  }}
                  role="tooltip"
                  aria-label="Clique para ativar o áudio"
                  data-testid="nort-intro-audio-prompt"
                >
                  {/* Cápsula com borda luminosa e glow vermelho sutil */}
                  <div className="relative px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/85 border border-[#FF0033] shadow-[0_0_12px_rgba(255,0,51,0.65)] backdrop-blur-md animate-nort-pulse-glow transition-all hover:scale-105 active:scale-95">
                    <span className="text-[11px] sm:text-xs font-semibold text-white tracking-wide whitespace-nowrap select-none">
                      Clique para ativar o áudio
                    </span>
                  </div>

                  {/* Seta curvada vermelha apontando diretamente para o ícone de áudio */}
                  <div className="w-6 h-3.5 relative -mt-0.5 ml-3 sm:ml-4 overflow-visible pointer-events-none">
                    <svg
                      className="w-6 h-3.5 overflow-visible"
                      viewBox="0 0 24 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 13 0 C 13 5, 5 6, 3 10"
                        stroke="#FF0033"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 1 7 L 3 11 L 6 8"
                        stroke="#FF0033"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Botão de Som Mudo / Ativo */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSound();
                }}
                data-testid="nort-intro-sound-toggle"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
              >
                {isMuted ? (
                  <svg
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
                    <line x1="22" y1="9" x2="16" y2="15" />
                    <line x1="16" y1="9" x2="22" y2="15" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>
            </div>

            {/* 3. Tempo atual e duração do vídeo (formato 00:13 / 00:17) */}
            <span
              data-testid="nort-intro-time-display"
              className="font-mono text-xs sm:text-sm font-medium text-white/90 tabular-nums select-none tracking-tight"
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Separador vertical sutil */}
            <span className="hidden xs:inline-block text-white/30 text-xs sm:text-sm select-none" aria-hidden="true">
              |
            </span>

            {/* 4. Texto explicativo "Preparando sua loja..." */}
            <span className="hidden sm:inline-block text-xs sm:text-sm text-white/80 select-none">
              Preparando sua loja...
            </span>
          </div>

          {/* LADO DIREITO: "Pular apresentação" e Ícone de Tela Cheia */}
          <div className="flex items-center gap-3.5 sm:gap-5">
            {/* 1. Pular apresentação */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFinish();
              }}
              data-testid="nort-intro-skip-button"
              className="text-xs sm:text-sm font-medium text-white/90 hover:text-white transition-colors cursor-pointer select-none focus-visible:underline"
              aria-label="Pular apresentação e entrar na loja"
            >
              Pular apresentação
            </button>

            {/* 2. Ícone de Tela Cheia */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFullscreen();
              }}
              data-testid="nort-intro-fullscreen-toggle"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            >
              {isFullscreen ? (
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 14h6v6" />
                  <path d="M20 10h-6V4" />
                  <path d="M14 10l7-7" />
                  <path d="M10 14l-7 7" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );

  return createPortal(content, document.body);
}
