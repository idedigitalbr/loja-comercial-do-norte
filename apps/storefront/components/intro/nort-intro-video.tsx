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

  // Estados de reprodução, áudio e volume
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const [hasInteractedAudio, setHasInteractedAudio] = useState(false);

  // Controle de posição do mouse para o tooltip flutuante
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(false);

  // A UI inferior começa TOTALMENTE OCULTA no início conforme solicitado!
  const [isUiVisible, setIsUiVisible] = useState(false);

  // Tempo e duração
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(26);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const finishedRef = useRef(false);

  // Refs de alta performance para 60 FPS contínuos sem sobrecarga de re-renders
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const progressMarkerRef = useRef<HTMLDivElement | null>(null);
  const progressTextRef = useRef<HTMLSpanElement | null>(null);
  const countdownRef = useRef<HTMLSpanElement | null>(null);
  const lastRemainingRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const uiDelayTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Ativação inicial de áudio: reinicia o vídeo do começo com som ativado e revela a UI após delay
  const handleActivateAudio = useCallback(() => {
    setIsMuted(false);
    if (videoRef.current) {
      // Reinicia o vídeo do começo conforme solicitado
      videoRef.current.currentTime = 0;
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 1;
      setCurrentTime(0);
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    setShowAudioPrompt(false);
    setHasInteractedAudio(true);

    // Conforme solicitado: começa sem aparecer a UI; após alguns segundos sim que aparece o negócio de baixo
    if (uiDelayTimerRef.current) clearTimeout(uiDelayTimerRef.current);
    uiDelayTimerRef.current = setTimeout(() => {
      setIsUiVisible(true);
      // Auto-oculta após 3s se a pessoa não mexer o mouse lá embaixo
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        setIsUiVisible(false);
      }, 3000);
    }, 1600);
  }, [volume]);

  // Alterna som entre mutado e desmutado (sem pausar o vídeo)
  const handleToggleSound = useCallback(() => {
    if (!hasInteractedAudio) {
      handleActivateAudio();
      return;
    }

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted && videoRef.current.volume === 0) {
        videoRef.current.volume = 1;
        setVolume(1);
      }
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  }, [hasInteractedAudio, handleActivateAudio, isMuted]);

  // Controle de volume deslizante
  const handleVolumeChange = useCallback(
    (newVol: number) => {
      const clamped = Math.max(0, Math.min(1, newVol));
      setVolume(clamped);
      if (videoRef.current) {
        videoRef.current.volume = clamped;
        if (clamped === 0) {
          videoRef.current.muted = true;
          setIsMuted(true);
        } else {
          videoRef.current.muted = false;
          setIsMuted(false);
        }
      }
      if (!hasInteractedAudio) {
        setShowAudioPrompt(false);
        setHasInteractedAudio(true);
      }
    },
    [hasInteractedAudio]
  );

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

  const handleOverlayMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const clientX = e.clientX;
      const clientY = e.clientY;
      setMousePos({ x: clientX, y: clientY });

      const threshold = typeof window !== 'undefined' ? window.innerHeight - 150 : 600;
      const isBottom = clientY >= threshold;
      setIsNearBottom(isBottom);

      // Se o áudio já foi ativado, a barra inferior só aparece se o mouse for movido para a parte de baixo!
      if (hasInteractedAudio) {
        if (isBottom) {
          setIsUiVisible(true);
          if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = setTimeout(() => {
            setIsUiVisible(false);
          }, 2500);
        } else {
          // Se o mouse subiu para cima da barra, fecha suavemente
          if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = setTimeout(() => {
            setIsUiVisible(false);
          }, 1200);
        }
      }
    },
    [hasInteractedAudio]
  );

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
            setIsPlaying(false);
          });
      }
    }
  }, [isOpen]);

  // Loop a 60 FPS contínuo via requestAnimationFrame para fluidez total da barra e tempo
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const updateLoop = () => {
      const vid = videoRef.current;
      if (vid && vid.duration > 0) {
        const curr = vid.currentTime;
        const dur = vid.duration;
        const pct = Math.min(100, Math.max(0, (curr / dur) * 100));

        // Atualização contínua a 60 FPS diretamente no DOM
        if (progressFillRef.current) {
          progressFillRef.current.style.width = `${pct}%`;
          progressFillRef.current.setAttribute('aria-valuenow', String(Math.round(pct)));
        }
        if (progressMarkerRef.current) {
          progressMarkerRef.current.style.left = `${pct}%`;
        }
        if (progressTextRef.current) {
          progressTextRef.current.textContent = `${Math.round(pct)}%`;
        }

        // Atualização da contagem regressiva decrescente
        const remaining = Math.max(0, Math.ceil(dur - curr));
        if (countdownRef.current && remaining !== lastRemainingRef.current) {
          lastRemainingRef.current = remaining;
          countdownRef.current.textContent = `${remaining} ${remaining === 1 ? 'Segundo' : 'Segundos'}`;
        }

        // Mantém currentTime sincronizado para a regra do botão "Pular" (só após metade)
        setCurrentTime(curr);
      }

      if (isMounted) {
        animFrameRef.current = requestAnimationFrame(updateLoop);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
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
      } else if (e.key === ' ' || e.key === 'm' || e.key === 'M') {
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
  }, [isOpen, handleFinish, handleToggleSound, handleToggleFullscreen]);

  // Restaura overflow e timers ao desmontar
  useEffect(() => {
    return () => {
      setIntroActive(false);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (uiDelayTimerRef.current) clearTimeout(uiDelayTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, []);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const initialPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const initialRemaining = Math.max(0, Math.ceil(duration - currentTime));
  // O botão pular só é habilitado após atingir a metade do vídeo
  const canSkip = duration > 0 && currentTime >= duration / 2;

  const content = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Apresentação Oficial Comercial do Norte"
      data-testid="nort-intro-video-overlay"
      onMouseMove={handleOverlayMouseMove}
      onClick={(e) => {
        // Clicar em qualquer canto do vídeo MUTA e DESMUTA (não há pause; na 1ª vez reinicia do começo)
        if (e.target === overlayRef.current || e.target === videoRef.current) {
          handleToggleSound();
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
          // Fallback para ambientes sem rAF (ex: testes jsdom)
          const curr = e.currentTarget.currentTime;
          setCurrentTime(curr);
          if (duration > 0) {
            const pct = Math.min(100, Math.max(0, (curr / duration) * 100));
            if (progressFillRef.current) {
              progressFillRef.current.style.width = `${pct}%`;
              progressFillRef.current.setAttribute('aria-valuenow', String(Math.round(pct)));
            }
            if (progressMarkerRef.current) {
              progressMarkerRef.current.style.left = `${pct}%`;
            }
            if (progressTextRef.current) {
              progressTextRef.current.textContent = `${Math.round(pct)}%`;
            }
            const rem = Math.max(0, Math.ceil(duration - curr));
            if (countdownRef.current) {
              countdownRef.current.textContent = `${rem} ${rem === 1 ? 'Segundo' : 'Segundos'}`;
            }
          }
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

      {/* AVISO FLUTUANTE SEGUINDO O MOUSE (No início apenas este elemento aparece pedindo para clicar!) */}
      {showAudioPrompt && isMuted && (
        <div
          className="fixed z-50 pointer-events-auto cursor-pointer transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
          style={{
            left: mousePos ? mousePos.x : '50%',
            top: mousePos ? Math.max(45, mousePos.y - 36) : '75%',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleActivateAudio();
          }}
          role="tooltip"
          aria-label="Clique para ativar o áudio"
          data-testid="nort-intro-audio-prompt-floating"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#11050b]/95 border-[1.5px] border-white shadow-[0_0_20px_rgba(255,0,51,0.95),inset_0_0_8px_rgba(255,0,51,0.4)] backdrop-blur-md animate-nort-pulse-glow hover:scale-105 active:scale-95 transition-transform">
            <svg
              className="w-4 h-4 text-white animate-nort-icon-glow shrink-0"
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
            <span className="text-xs sm:text-sm font-semibold text-white tracking-wide whitespace-nowrap select-none">
              Clique para ativar o áudio
            </span>
          </div>
        </div>
      )}

      {/* GRADIENTE INFERIOR SUAVE ESTILO YOUTUBE FULLSCREEN (Controlado por isUiVisible) */}
      <div
        className={`absolute inset-x-0 bottom-0 pointer-events-none h-44 sm:h-56 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-30 transition-opacity duration-500 ease-out ${
          isUiVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* NOVO PLAYER INFERIOR: BARRA DE PROGRESSO VERMELHA E CONTROLES (Começa oculto e só aparece após ativar o áudio) */}
      <footer
        onMouseEnter={() => {
          if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
          setIsUiVisible(true);
        }}
        onMouseLeave={() => {
          if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = setTimeout(() => {
            setIsUiVisible(false);
          }, 2500);
        }}
        className={`absolute bottom-0 inset-x-0 z-40 px-4 sm:px-8 md:px-12 pb-5 sm:pb-7 pt-12 flex flex-col gap-3 select-none transition-all duration-500 ease-out ${
          isUiVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* CONTAINER DA BARRA DE PROGRESSO */}
        <div className="relative w-full">
          {/* ÚNICA BARRA DE PROGRESSO: Vermelha #FF0033 a 60 FPS contínuos com Marcador Dinâmico e Cápsula com % */}
          <div
            className="relative w-full py-2 -my-2 cursor-pointer group"
            onClick={handleSeek}
            role="slider"
            tabIndex={0}
            aria-label="Progresso do vídeo"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(initialPercent)}
            data-testid="nort-intro-progress-container"
          >
            {/* Trilha base branca com transparência */}
            <div className="relative w-full h-1 sm:h-[4px] bg-white/30 rounded-full overflow-visible group-hover:h-1.5 transition-all duration-150">
              {/* Barra percorrida vermelha #FF0033 com atualização fluida a 60 FPS */}
              <div
                ref={progressFillRef}
                className="h-full bg-[#FF0033] rounded-full relative shadow-[0_0_8px_rgba(255,0,51,0.7)]"
                style={{ width: `${initialPercent}%` }}
                role="progressbar"
                aria-valuenow={Math.round(initialPercent)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {/* Marcador com Cápsula Vermelha Dinâmica contendo a porcentagem atual */}
                <div
                  ref={progressMarkerRef}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center justify-center z-10 pointer-events-none"
                  style={{ left: '100%' }}
                  data-testid="nort-intro-progress-marker"
                >
                  <span
                    ref={progressTextRef}
                    className="bg-[#FF0033] text-white font-bold text-[10px] sm:text-xs leading-none px-2 py-0.5 rounded-full shadow-[0_2px_8px_rgba(255,0,51,0.6)] select-none whitespace-nowrap"
                  >
                    {Math.round(initialPercent)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LINHA HORIZONTAL DE CONTROLES INFERIORES */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-white pt-1">
          {/* LADO ESQUERDO: Controle de Áudio (Mute/Unmute com Slider expansível YouTube) e Texto com Contagem Regressiva */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1. Controle de Áudio com Slider de Volume estilo YouTube */}
            <div className="relative flex items-center group/volume">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSound();
                }}
                data-testid="nort-intro-sound-toggle"
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-white/70 ${
                  isMuted && showAudioPrompt ? 'animate-nort-icon-glow' : ''
                }`}
                aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
              >
                {isMuted || volume === 0 ? (
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
                ) : volume < 0.5 ? (
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

              {/* Slider deslizante de volume expansível no hover estilo YouTube */}
              <div
                className="w-0 opacity-0 group-hover/volume:w-16 sm:group-hover/volume:w-20 group-hover/volume:opacity-100 group-focus-within/volume:w-16 sm:group-focus-within/volume:w-20 group-focus-within/volume:opacity-100 transition-all duration-200 overflow-hidden flex items-center pr-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  data-testid="nort-intro-volume-slider"
                  className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-white hover:accent-red-500 transition-all"
                  aria-label="Controle de volume"
                />
              </div>
            </div>

            {/* 2. Título exato com contagem decrescente: "Carregando a loja será aberta em... X Segundos" */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/90 select-none">
              <span className="font-medium text-white/90">Carregando a loja será aberta em...</span>
              <span
                ref={countdownRef}
                data-testid="nort-intro-countdown"
                className="font-bold text-white font-mono tabular-nums bg-white/10 px-2 py-0.5 rounded shadow-sm"
              >
                {initialRemaining} {initialRemaining === 1 ? 'Segundo' : 'Segundos'}
              </span>
            </div>
          </div>

          {/* LADO DIREITO: Botão "Pular apresentação" estilo YouTube Anúncio + Botão de Tela Cheia */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Botão estilo YouTube Anúncios (com cantos arredondados e ícone ▶|, exibido APENAS após a metade do vídeo) */}
            {canSkip && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFinish();
                }}
                data-testid="nort-intro-skip-button"
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 text-white text-xs sm:text-sm font-medium border border-white/20 backdrop-blur-md shadow-lg active:scale-95 transition-all cursor-pointer animate-in fade-in zoom-in-95 duration-300 focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="Pular apresentação"
              >
                <span>Pular apresentação</span>
                {/* Ícone clássico do YouTube "Pular anúncio" ▶| */}
                <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <rect x="17" y="4" width="2.5" height="16" rx="0.5" />
                </svg>
              </button>
            )}

            {/* Ícone de Tela Cheia */}
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
