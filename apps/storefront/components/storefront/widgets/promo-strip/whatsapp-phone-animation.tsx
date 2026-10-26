'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

interface WhatsappPhoneAnimationProps {
  ctaUrl?: string;
  className?: string;
  onRestart?: () => void;
}

interface MessageItem {
  id: string;
  type: 'received' | 'sent' | 'invite';
  title?: string;
  text?: string;
  time?: string;
  hasChecks?: boolean;
  checksBlue?: boolean;
}

export function WhatsappPhoneAnimation({
  ctaUrl = 'https://wa.me/5591983440880',
  className = '',
  onRestart,
}: WhatsappPhoneAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const isRunningRef = useRef(false);

  // Cenas: 1 = Gaveta de Apps, 2 = Lista de Conversas, 3 = Chat
  const [currentScene, setCurrentScene] = useState<1 | 2 | 3>(1);
  const [wppPressed, setWppPressed] = useState(false);
  const [chatItemPressed, setChatItemPressed] = useState(false);

  // Estados do Chat
  const [contactStatus, setContactStatus] = useState<'online' | 'digitando...'>('online');
  const [isTypingBubble, setIsTypingBubble] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('Mensagem');
  const [isInputPlaceholder, setIsInputPlaceholder] = useState(true);
  const [isSendBtnSent, setIsSendBtnSent] = useState(false);

  const addTimer = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
    }
  }, []);

  const resetState = useCallback(() => {
    clearAllTimers();
    setCurrentScene(1);
    setWppPressed(false);
    setChatItemPressed(false);
    setContactStatus('online');
    setIsTypingBubble(false);
    setMessages([]);
    setInputText('Mensagem');
    setIsInputPlaceholder(true);
    setIsSendBtnSent(false);
    isRunningRef.current = false;
  }, [clearAllTimers]);

  const runAnimationSequence = useCallback(() => {
    clearAllTimers();
    resetState();
    isRunningRef.current = true;

    // Cena 1: Gaveta de Apps visível
    setCurrentScene(1);

    // 1. Toque no app WhatsApp após 1.2s
    addTimer(() => {
      setWppPressed(true);

      // 2. Abre a Lista de Conversas
      addTimer(() => {
        setCurrentScene(2);
        setWppPressed(false);

        // 3. Toque na conversa Comercial do Norte após 800ms
        addTimer(() => {
          setChatItemPressed(true);

          // 4. Entra na tela de Chat
          addTimer(() => {
            setCurrentScene(3);
            setChatItemPressed(false);

            // 5. Diálogo: primeiro indicador de digitação
            addTimer(() => {
              setContactStatus('digitando...');
              setIsTypingBubble(true);

              // 5.1 Primeira mensagem recebida
              addTimer(() => {
                setContactStatus('online');
                setIsTypingBubble(false);
                setMessages([
                  {
                    id: 'msg-1',
                    type: 'received',
                    title: 'Entre no nosso grupo WhatsApp',
                    time: '09:41',
                  },
                ]);
                scrollToBottom();

                // 5.2 Segundo indicador de digitação
                addTimer(() => {
                  setContactStatus('digitando...');
                  setIsTypingBubble(true);
                  scrollToBottom();

                  // 5.3 Segunda mensagem recebida
                  addTimer(() => {
                    setContactStatus('online');
                    setIsTypingBubble(false);
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: 'msg-2',
                        type: 'received',
                        text: 'Você irá começar a receber ofertas.',
                        time: '09:41',
                      },
                    ]);
                    scrollToBottom();

                    // 5.4 Simulação de digitação da resposta pelo usuário
                    addTimer(() => {
                      const replyText = 'Quero as ofertas! 😍';
                      setIsInputPlaceholder(false);
                      setInputText('');

                      let charIdx = 0;
                      const typeNext = () => {
                        if (charIdx < replyText.length) {
                          setInputText(replyText.slice(0, charIdx + 1));
                          charIdx++;
                          const delay = Math.floor(Math.random() * 20) + 35;
                          addTimer(typeNext, delay);
                        } else {
                          // Concluiu a digitação: clica em enviar
                          addTimer(() => {
                            setIsSendBtnSent(true);

                            addTimer(() => {
                              setInputText('Mensagem');
                              setIsInputPlaceholder(true);
                              setIsSendBtnSent(false);

                              // Mensagem enviada pelo usuário (balão verde)
                              setMessages((prev) => [
                                ...prev,
                                {
                                  id: 'msg-3',
                                  type: 'sent',
                                  text: replyText,
                                  time: '09:41',
                                  hasChecks: true,
                                  checksBlue: false,
                                },
                              ]);
                              scrollToBottom();

                              // Checks ficam azuis
                              addTimer(() => {
                                setMessages((prev) =>
                                  prev.map((m) =>
                                    m.id === 'msg-3' ? { ...m, checksBlue: true } : m
                                  )
                                );

                                // Comercial do Norte envia o Card de Convite Oficial
                                addTimer(() => {
                                  setContactStatus('digitando...');
                                  setIsTypingBubble(true);
                                  scrollToBottom();

                                  addTimer(() => {
                                    setContactStatus('online');
                                    setIsTypingBubble(false);
                                    setMessages((prev) => [
                                      ...prev,
                                      {
                                        id: 'msg-invite',
                                        type: 'invite',
                                        time: '09:41',
                                      },
                                    ]);
                                    scrollToBottom();

                                    // Mantém a tela final exibida por 16s antes de reiniciar suavemente
                                    addTimer(() => {
                                      runAnimationSequence();
                                    }, 16000);
                                  }, 1100);
                                }, 700);
                              }, 450);
                            }, 180);
                          }, 250);
                        }
                      };

                      typeNext();
                    }, 900);
                  }, 850);
                }, 750);
              }, 900);
            }, 350);
          }, 220);
        }, 800);
      }, 300);
    }, 1200);
  }, [addTimer, clearAllTimers, resetState, scrollToBottom]);

  // Inicia a animação imediatamente no cliente e reinicia se visível
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setCurrentScene(3);
      setMessages([
        {
          id: 'msg-1',
          type: 'received',
          title: 'Entre no nosso grupo WhatsApp',
          time: '09:41',
        },
        {
          id: 'msg-2',
          type: 'received',
          text: 'Você irá começar a receber ofertas.',
          time: '09:41',
        },
        {
          id: 'msg-3',
          type: 'sent',
          text: 'Quero as ofertas! 😍',
          time: '09:41',
          hasChecks: true,
          checksBlue: true,
        },
        {
          id: 'msg-invite',
          type: 'invite',
          time: '09:41',
        },
      ]);
      return;
    }

    // Inicia imediatamente
    runAnimationSequence();

    const elem = containerRef.current;
    if (!elem) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isRunningRef.current) {
              runAnimationSequence();
            }
          } else {
            clearAllTimers();
            isRunningRef.current = false;
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(elem);

    return () => {
      observer.disconnect();
      clearAllTimers();
    };
  }, [clearAllTimers, runAnimationSequence]);

  const handleContainerClick = () => {
    runAnimationSequence();
    if (onRestart) onRestart();
  };

  return (
    <div
      aria-label="Demonstração interativa do WhatsApp da Comercial do Norte. Toque para reiniciar."
      className={`wpp-phone-container ${className}`}
      onClick={handleContainerClick}
      ref={containerRef}
      role="region"
    >
      <div className="wpp-phone-screen">
        {/* Câmera Frontal Punch-Hole S23 */}
        <div aria-hidden="true" className="wpp-s23-camera" />

        <div className="wpp-screen-viewport">
          {/* ─────────────────────────────────────────────────────────────
              CENA 1: GAVETA / HOME DE APLICATIVOS
              ───────────────────────────────────────────────────────────── */}
          <div className={`wpp-scene-drawer ${currentScene > 1 ? 'is-hidden' : ''}`}>
              {/* Barra de Status na Gaveta */}
              <div aria-hidden="true" className="wpp-status-bar drawer-status">
                <span className="wpp-status-time">09:41</span>
                <div className="wpp-status-icons">
                  <svg viewBox="0 0 16 12">
                    <rect height="3" rx="0.5" width="2.5" x="0" y="9" />
                    <rect height="6" rx="0.5" width="2.5" x="4" y="6" />
                    <rect height="9" rx="0.5" width="2.5" x="8" y="3" />
                    <rect height="12" rx="0.5" width="2.5" x="12" y="0" />
                  </svg>
                  <svg viewBox="0 0 16 12">
                    <path d="M8 10.5C8.55 10.5 9 10.95 9 11.5C9 12.05 8.55 12.5 8 12.5C7.45 12.5 7 12.05 7 11.5C7 10.95 7.45 10.5 8 10.5ZM8 7C9.93 7 11.66 7.82 12.87 9.13L11.45 10.55C10.57 9.59 9.36 9 8 9C6.64 9 5.43 9.59 4.55 10.55L3.13 9.13C4.34 7.82 6.07 7 8 7ZM8 3.5C10.96 3.5 13.62 4.73 15.5 6.71L14.08 8.13C12.56 6.52 10.4 5.5 8 5.5C5.6 5.5 3.44 6.52 1.92 8.13L0.5 6.71C2.38 4.73 5.04 3.5 8 3.5ZM8 0C11.98 0 15.56 1.63 18.12 4.28L16.7 5.7C14.5 3.41 11.42 2 8 2C4.58 2 1.5 3.41 -0.7 5.7L-2.12 4.28C0.44 1.63 4.02 0 8 0Z" />
                  </svg>
                  <svg viewBox="0 0 24 12">
                    <rect
                      fill="none"
                      height="12"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      width="20"
                      x="0"
                      y="0"
                    />
                    <rect fill="currentColor" height="7" rx="1.5" width="13" x="2.5" y="2.5" />
                    <path d="M22 4C22.6 4.3 23 5 23 6C23 7 22.6 7.7 22 8V4Z" fill="currentColor" />
                  </svg>
                </div>
              </div>

              <div className="wpp-drawer-widget">
                <div className="wpp-drawer-widget-date">Quarta-feira, 28 de outubro</div>
                <div className="wpp-drawer-widget-clock">09:41</div>
              </div>

              <div className="wpp-apps-grid">
                {/* App 1: Comercial do Norte */}
                <div className="wpp-app-item">
                  <div className="wpp-app-icon-wrapper wpp-icon-cdn">
                    <Image
                      alt="Comercial do Norte"
                      className="size-full object-cover"
                      height={44}
                      src="/assets/Logos/logo-comercial-do-norte-quadrada.png"
                      unoptimized
                      width={44}
                    />
                  </div>
                  <span className="wpp-app-label">Comercial</span>
                </div>

                {/* App 2: Câmera */}
                <div className="wpp-app-item">
                  <div className="wpp-app-icon-wrapper wpp-icon-camera">
                    <svg
                      fill="none"
                      height="18"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="18"
                    >
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  </div>
                  <span className="wpp-app-label">Câmera</span>
                </div>

                {/* App 3: Fotos */}
                <div className="wpp-app-item">
                  <div className="wpp-app-icon-wrapper wpp-icon-photos">
                    <svg height="18" viewBox="0 0 24 24" width="18">
                      <circle cx="12" cy="8" fill="#FF5252" opacity="0.85" r="4" />
                      <circle cx="16" cy="12" fill="#FFA726" opacity="0.85" r="4" />
                      <circle cx="12" cy="16" fill="#66BB6A" opacity="0.85" r="4" />
                      <circle cx="8" cy="12" fill="#42A5F5" opacity="0.85" r="4" />
                    </svg>
                  </div>
                  <span className="wpp-app-label">Fotos</span>
                </div>

                {/* App 4: WhatsApp (Alvo do Toque) */}
                <div className={`wpp-app-item wpp-app-whatsapp ${wppPressed ? 'is-pressed' : ''}`}>
                  <div className="wpp-app-icon-wrapper wpp-icon-whatsapp">
                    <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.487 1.333 5.01L2 22l5.127-1.335c1.472.803 3.134 1.226 4.881 1.226 5.507 0 9.99-4.478 9.99-9.984 0-5.506-4.483-9.984-9.986-9.984zm0 18.283c-1.49 0-2.95-.398-4.23-1.155l-.304-.18-3.14.818.835-3.048-.198-.314a8.263 8.263 0 01-1.272-4.385c0-4.568 3.72-8.284 8.309-8.284 4.587 0 8.307 3.716 8.307 8.284 0 4.568-3.72 8.284-8.307 8.284zm4.557-6.22c-.25-.125-1.478-.728-1.707-.811-.229-.084-.396-.125-.563.125-.166.25-.646.811-.792.977-.146.166-.292.187-.542.062-.25-.125-1.056-.388-2.012-1.24-.744-.664-1.247-1.485-1.393-1.735-.146-.25-.015-.385.11-.509.112-.112.25-.292.375-.438.125-.146.166-.25.25-.417.083-.166.041-.312-.021-.437-.063-.125-.563-1.354-.771-1.854-.203-.487-.41-.42-.563-.428-.145-.008-.312-.008-.479-.008-.167 0-.437.063-.666.312-.229.25-.875.854-.875 2.083 0 1.229.896 2.417 1.02 2.583.125.167 1.762 2.69 4.269 3.774.596.257 1.062.411 1.425.526.598.19 1.142.163 1.572.099.48-.071 1.478-.604 1.687-1.187.208-.583.208-1.083.146-1.187-.063-.104-.229-.166-.479-.291z" />
                    </svg>
                    <span className="wpp-app-badge">1</span>
                  </div>
                  <span className="wpp-app-label">WhatsApp</span>
                </div>
              </div>
            </div>

          {/* ─────────────────────────────────────────────────────────────
              CENA 2: LISTA DE CONVERSAS DO WHATSAPP
              ───────────────────────────────────────────────────────────── */}
          <div className={`wpp-scene-list ${currentScene === 2 ? 'is-active' : ''}`}>
              <div className="wpp-list-header">
                <div aria-hidden="true" className="wpp-status-bar">
                  <span className="wpp-status-time">09:41</span>
                  <div className="wpp-status-icons">
                    <svg viewBox="0 0 16 12">
                      <rect height="3" rx="0.5" width="2.5" x="0" y="9" />
                      <rect height="6" rx="0.5" width="2.5" x="4" y="6" />
                      <rect height="9" rx="0.5" width="2.5" x="8" y="3" />
                      <rect height="12" rx="0.5" width="2.5" x="12" y="0" />
                    </svg>
                    <svg viewBox="0 0 16 12">
                      <path d="M8 10.5C8.55 10.5 9 10.95 9 11.5C9 12.05 8.55 12.5 8 12.5C7.45 12.5 7 12.05 7 11.5C7 10.95 7.45 10.5 8 10.5ZM8 7C9.93 7 11.66 7.82 12.87 9.13L11.45 10.55C10.57 9.59 9.36 9 8 9C6.64 9 5.43 9.59 4.55 10.55L3.13 9.13C4.34 7.82 6.07 7 8 7ZM8 3.5C10.96 3.5 13.62 4.73 15.5 6.71L14.08 8.13C12.56 6.52 10.4 5.5 8 5.5C5.6 5.5 3.44 6.52 1.92 8.13L0.5 6.71C2.38 4.73 5.04 3.5 8 3.5ZM8 0C11.98 0 15.56 1.63 18.12 4.28L16.7 5.7C14.5 3.41 11.42 2 8 2C4.58 2 1.5 3.41 -0.7 5.7L-2.12 4.28C0.44 1.63 4.02 0 8 0Z" />
                    </svg>
                    <svg viewBox="0 0 24 12">
                      <rect
                        fill="none"
                        height="12"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        width="20"
                        x="0"
                        y="0"
                      />
                      <rect fill="currentColor" height="7" rx="1.5" width="13" x="2.5" y="2.5" />
                      <path d="M22 4C22.6 4.3 23 5 23 6C23 7 22.6 7.7 22 8V4Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>

                <div className="wpp-list-header-content">
                  <div className="wpp-list-header-top">
                    <span className="wpp-list-title">WhatsApp</span>
                    <div className="wpp-list-actions">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                      </svg>
                      <svg viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                      </svg>
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="2.2" />
                        <circle cx="12" cy="12" r="2.2" />
                        <circle cx="12" cy="19" r="2.2" />
                      </svg>
                    </div>
                  </div>

                  <div className="wpp-list-tabs">
                    <span className="wpp-list-tab active">Conversas</span>
                    <span className="wpp-list-tab">Atualizações</span>
                    <span className="wpp-list-tab">Comunidades</span>
                    <span className="wpp-list-tab">Ligações</span>
                  </div>
                </div>
              </div>

              <div className="wpp-chats-body">
                {/* Item de Conversa: Comercial do Norte */}
                <div className={`wpp-chat-item ${chatItemPressed ? 'is-pressed' : ''}`}>
                  <div className="wpp-chat-item-avatar">
                    <Image
                      alt="Comercial do Norte"
                      className="size-full object-cover"
                      height={38}
                      src="/assets/Logos/logo-comercial-do-norte-quadrada.png"
                      unoptimized
                      width={38}
                    />
                  </div>
                  <div className="wpp-chat-item-info">
                    <div className="wpp-chat-item-header">
                      <span className="wpp-chat-item-name">
                        Comercial do Norte
                        <span className="wpp-badge-verified">
                          <svg fill="none" viewBox="0 0 18 18">
                            <circle cx="9" cy="9" fill="#25D366" r="9" />
                            <path
                              d="M5.5 9.2L7.8 11.5L12.5 6.5"
                              stroke="#FFFFFF"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                            />
                          </svg>
                        </span>
                      </span>
                      <span className="wpp-chat-item-time">09:41</span>
                    </div>
                    <div className="wpp-chat-item-preview">
                      <span className="wpp-chat-item-msg">Entre no nosso grupo WhatsApp</span>
                      <span className="wpp-chat-item-unread">1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* ─────────────────────────────────────────────────────────────
              CENA 3: A CONVERSA (COMERCIAL DO NORTE)
              ───────────────────────────────────────────────────────────── */}
          <div className={`wpp-scene-chat ${currentScene === 3 ? 'is-active' : ''}`}>
              {/* Header Verde do WhatsApp */}
              <div className="wpp-chat-header-wrap">
                <div aria-hidden="true" className="wpp-status-bar">
                  <span className="wpp-status-time">09:41</span>
                  <div className="wpp-status-icons">
                    <svg viewBox="0 0 16 12">
                      <rect height="3" rx="0.5" width="2.5" x="0" y="9" />
                      <rect height="6" rx="0.5" width="2.5" x="4" y="6" />
                      <rect height="9" rx="0.5" width="2.5" x="8" y="3" />
                      <rect height="12" rx="0.5" width="2.5" x="12" y="0" />
                    </svg>
                    <svg viewBox="0 0 16 12">
                      <path d="M8 10.5C8.55 10.5 9 10.95 9 11.5C9 12.05 8.55 12.5 8 12.5C7.45 12.5 7 12.05 7 11.5C7 10.95 7.45 10.5 8 10.5ZM8 7C9.93 7 11.66 7.82 12.87 9.13L11.45 10.55C10.57 9.59 9.36 9 8 9C6.64 9 5.43 9.59 4.55 10.55L3.13 9.13C4.34 7.82 6.07 7 8 7ZM8 3.5C10.96 3.5 13.62 4.73 15.5 6.71L14.08 8.13C12.56 6.52 10.4 5.5 8 5.5C5.6 5.5 3.44 6.52 1.92 8.13L0.5 6.71C2.38 4.73 5.04 3.5 8 3.5ZM8 0C11.98 0 15.56 1.63 18.12 4.28L16.7 5.7C14.5 3.41 11.42 2 8 2C4.58 2 1.5 3.41 -0.7 5.7L-2.12 4.28C0.44 1.63 4.02 0 8 0Z" />
                    </svg>
                    <svg viewBox="0 0 24 12">
                      <rect
                        fill="none"
                        height="12"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        width="20"
                        x="0"
                        y="0"
                      />
                      <rect fill="currentColor" height="7" rx="1.5" width="13" x="2.5" y="2.5" />
                      <path d="M22 4C22.6 4.3 23 5 23 6C23 7 22.6 7.7 22 8V4Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>

                <div className="wpp-chat-nav">
                  <span className="wpp-nav-back">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </span>

                  <div className="wpp-nav-avatar">
                    <Image
                      alt="Comercial do Norte"
                      className="size-full object-cover"
                      height={36}
                      src="/assets/Logos/logo-comercial-do-norte-quadrada.png"
                      unoptimized
                      width={36}
                    />
                  </div>

                  <div className="wpp-nav-info">
                    <div className="wpp-nav-name">
                      Comercial do Norte
                      <span className="wpp-badge-verified">
                        <svg fill="none" viewBox="0 0 18 18">
                          <circle cx="9" cy="9" fill="#25D366" r="9" />
                          <path
                            d="M5.5 9.2L7.8 11.5L12.5 6.5"
                            stroke="#FFFFFF"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                        </svg>
                      </span>
                    </div>
                    <span className={`wpp-nav-status ${contactStatus === 'digitando...' ? 'is-typing' : ''}`}>
                      {contactStatus}
                    </span>
                  </div>

                  <div className="wpp-nav-actions">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect height="14" rx="2" ry="2" width="15" x="1" y="5" />
                    </svg>
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="2.2" />
                      <circle cx="12" cy="12" r="2.2" />
                      <circle cx="12" cy="19" r="2.2" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Conteúdo das Mensagens */}
              <div className="wpp-chat-content" ref={messagesScrollRef}>
                {messages.map((msg) => {
                  if (msg.type === 'invite') {
                    return (
                      <div className="wpp-msg received wpp-msg-invite" key={msg.id}>
                        <a
                          className="wpp-invite-card-link"
                          href={ctaUrl}
                          onClick={(e) => e.stopPropagation()}
                          rel="noopener noreferrer"
                          target="_blank"
                          title="Entrar no Grupo de Ofertas Comercial do Norte"
                        >
                          <div className="wpp-invite-preview">
                            <div className="wpp-invite-avatar">
                              <Image
                                alt="Comercial do Norte"
                                className="size-full object-cover"
                                height={34}
                                src="/assets/Logos/logo-comercial-do-norte-quadrada.png"
                                unoptimized
                                width={34}
                              />
                            </div>
                            <div className="wpp-invite-preview-info">
                              <div className="wpp-invite-group-name">
                                OFERTAS COMERCIAL DO NORTE
                              </div>
                              <div className="wpp-invite-group-desc">
                                WhatsApp Group Invite
                              </div>
                              <div className="wpp-invite-group-url">
                                wa.me/5591983440880
                              </div>
                            </div>
                          </div>

                          <div className="wpp-invite-link-row">
                            <span className="wpp-invite-link-text">
                              https://wa.me/5591983440880
                            </span>
                            <span className="wpp-msg-meta">{msg.time || '09:41'}</span>
                          </div>

                          <div className="wpp-invite-action-btn">
                            <span>Entrar no Grupo de Ofertas</span>
                            <svg
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </div>
                        </a>
                      </div>
                    );
                  }

                  return (
                    <div className={`wpp-msg ${msg.type}`} key={msg.id}>
                      {msg.title ? (
                        <div className="wpp-msg-title">{msg.title}</div>
                      ) : null}
                      {msg.text ? <div className="wpp-msg-text">{msg.text}</div> : null}
                      <div className="wpp-msg-meta">
                        {msg.time || '09:41'}
                        {msg.hasChecks ? (
                          <span
                            aria-hidden="true"
                            className={`wpp-checks ${msg.checksBlue ? 'is-blue' : ''}`}
                          >
                            <svg
                              fill="none"
                              viewBox="0 0 16 11"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1 6L4.5 9.5L11.5 2M5 6L8.5 9.5L15.5 2"
                                stroke="#8696A0"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                              />
                            </svg>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}

                {/* Indicador de Digitação (3 pontos) */}
                {isTypingBubble ? (
                  <div
                    aria-label="Digitando..."
                    className="wpp-typing-bubble"
                    id="wpp-typing-bubble"
                  >
                    <span className="wpp-typing-dot" />
                    <span className="wpp-typing-dot" />
                    <span className="wpp-typing-dot" />
                  </div>
                ) : null}
              </div>

              {/* Barra Inferior de Digitação (WhatsApp S23) */}
              <div className="wpp-chat-bottom">
                <div className="wpp-bottom-input-wrap">
                  <span className="wpp-bottom-icon">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" x2="9.01" y1="9" y2="9" />
                      <line x1="15" x2="15.01" y1="9" y2="9" />
                    </svg>
                  </span>
                  <span
                    className={`wpp-bottom-input-text ${
                      isInputPlaceholder ? 'is-placeholder' : ''
                    }`}
                  >
                    {inputText}
                  </span>
                  <span className="wpp-bottom-icon">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </span>
                </div>
                <button
                  aria-label="Enviar mensagem"
                  className={`wpp-bottom-btn ${isSendBtnSent ? 'is-sent' : ''}`}
                  type="button"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
