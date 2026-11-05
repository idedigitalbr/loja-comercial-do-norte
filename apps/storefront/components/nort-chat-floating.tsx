'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Check,
  CheckCheck,
  Compass,
  Headphones,
  MapPin,
  MessageCircle,
  Minimize2,
  RotateCcw,
  Send,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { COMMERCIAL_STORES, CommercialStore, DEFAULT_STORE, buildWhatsAppLink } from '../lib/stores-data';
import { useNortTour } from './tour';

export type NortChatFloatingProps = {
  whatsapp?: string | null;
  phone?: string | null;
};

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
};

type BotStep = 'NAME' | 'PHONE' | 'STORE' | 'SUBJECT' | 'FINISHED';

export function NortChatFloating({ whatsapp, phone }: NortChatFloatingProps) {
  const { startTour } = useNortTour();
  const [isOpen, setIsOpen] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [inputText, setInputText] = useState('');
  const [storeInfoVisible, setStoreInfoVisible] = useState(false);
  const [quickOptionsVisible, setQuickOptionsVisible] = useState(true);

  // Typebot state
  const [step, setStep] = useState<BotStep>('NAME');
  const [isTyping, setIsTyping] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedStore, setSelectedStore] = useState<CommercialStore>(DEFAULT_STORE);
  const [chosenSubject, setChosenSubject] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Oi! Eu sou o Norti! 👋 Sou o assistente virtual da Comercial do Norte. Como posso te chamar?',
      time: 'Agora',
    },
  ]);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  // Fallback digits
  const defaultWhatsapp = '5591983440880';
  const rawNumber = whatsapp || phone || defaultWhatsapp;
  const whatsappDigits = rawNumber.replace(/\D/g, '') || defaultWhatsapp;

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        chatBodyRef.current?.scrollTo({
          top: chatBodyRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [isOpen, messages, isTyping, storeInfoVisible]);

  function getFormattedTime() {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function addBotMessageWithDelay(text: string, delayMs = 700) {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}-${Math.random()}`,
          sender: 'bot',
          text,
          time: getFormattedTime(),
        },
      ]);
    }, delayMs);
  }

  async function registerLeadToCRM(leadData: {
    name: string;
    phone: string;
    store: CommercialStore;
    subject: string;
    allMessages: Message[];
  }) {
    try {
      await fetch('/api/v1/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: leadData.name,
          customerPhone: leadData.phone,
          preferredStore: leadData.store.name,
          storeId: leadData.store.id,
          subject: leadData.subject,
          conversationLog: leadData.allMessages.map((m) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            timestamp: m.time,
          })),
        }),
      });
    } catch {
      // Ignora erro de rede em offline/fallback
    }
  }

  function handleSendCustomMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const userMsg: Message = { id: `user-${Date.now()}`, sender: 'user', text, time: getFormattedTime() };
    setMessages((prev) => [...prev, userMsg]);

    const activePhone = selectedStore.whatsappDigits || whatsappDigits;
    const bodyText = customerName
      ? `Olá, equipe Comercial do Norte (${selectedStore.shortTitle})! Meu nome é ${customerName}. ${text}`
      : text;

    const url = buildWhatsAppLink(activePhone, bodyText);
    window.open(url, '_blank', 'noopener,noreferrer');
    setInputText('');

    if (step === 'NAME') {
      setCustomerName(text);
      setStep('PHONE');
      addBotMessageWithDelay(
        `Prazer! 🤝 Para direcionar sua solicitação, qual loja da Comercial do Norte fica mais próxima de você?`,
        500
      );
    }
  }

  function handleSelectStore(store: CommercialStore) {
    setSelectedStore(store);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: `Loja mais próxima: ${store.shortTitle}`,
      time: getFormattedTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('SUBJECT');
    addBotMessageWithDelay(
      `Perfeito! O atendimento da unidade ${store.shortTitle} é excelente. E o que você gostaria de resolver hoje?`,
      650
    );
  }

  function handleSelectSubject(subject: string) {
    setChosenSubject(subject);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: subject,
      time: getFormattedTime(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setStep('FINISHED');

    void registerLeadToCRM({
      name: customerName || 'Cliente Site',
      phone: customerPhone || '(91) 98344-0880',
      store: selectedStore,
      subject,
      allMessages: updatedMessages,
    });

    addBotMessageWithDelay(
      `Tudo pronto! Registrei seu atendimento em nosso CRM. 📋 Clique no botão abaixo para conversar no WhatsApp oficial da unidade ${selectedStore.shortTitle}:`,
      650
    );
  }

  function openWhatsAppTopic(topicMessage: string) {
    const activePhone = selectedStore.whatsappDigits || whatsappDigits;
    const bodyText = customerName
      ? `Olá! Meu nome é ${customerName}. ${topicMessage}`
      : `Olá! ${topicMessage}`;
    const url = buildWhatsAppLink(activePhone, bodyText);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handleRestartChat() {
    setStep('NAME');
    setCustomerName('');
    setCustomerPhone('');
    setSelectedStore(DEFAULT_STORE);
    setChosenSubject('');
    setIsTyping(false);
    setMessages([
      {
        id: 'welcome-restart',
        sender: 'bot',
        text: 'Oi! Eu sou o Norti! 👋 Sou o assistente virtual da Comercial do Norte. Como posso te chamar?',
        time: getFormattedTime(),
      },
    ]);
  }

  const finalWhatsAppUrl = buildWhatsAppLink(
    selectedStore.whatsappDigits || whatsappDigits,
    `Olá, equipe Comercial do Norte (${selectedStore.name})!
Meu nome é: ${customerName || 'Cliente'}
WhatsApp: ${customerPhone || 'Informado no site'}
Assunto: ${chosenSubject || 'Atendimento geral'}
Loja de preferência: ${selectedStore.shortTitle}
Gostaria de falar com um vendedor agora!`
  );

  return (
    <>
      {/* 1. BALÃO FLUTUANTE DE PRÉVIA / CONVITE DO NORTI */}
      {!isOpen && !bubbleDismissed && (
        <aside
          aria-label="Convite de atendimento do Norti"
          className="fixed bottom-20 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[280px] sm:max-w-[320px]"
        >
          <div className="relative flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] border border-emerald-100 ring-1 ring-black/5">
            <div className="relative size-10 shrink-0 rounded-full bg-emerald-500/10 p-0.5 ring-2 ring-emerald-500 overflow-hidden">
              <Image
                alt="Norti Atendente"
                className="size-full object-contain"
                height={40}
                src="/assets/nort-avatar.png"
                unoptimized
                width={40}
              />
            </div>

            <div
              className="flex-1 min-w-0 cursor-pointer text-left"
              onClick={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setIsOpen(true);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Norti</span>
                <span className="flex size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                  Online
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600 leading-snug">
                Oi! Precisa de ajuda com cotação ou produtos? Fala comigo! 👋
              </p>
            </div>

            <button
              aria-label="Dispensar aviso do Norti"
              className="text-slate-400 hover:text-slate-600 transition -mr-1 -mt-1 p-1 rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                setBubbleDismissed(true);
              }}
              type="button"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* 2. BOTÃO FLUTUANTE PRINCIPAL (CANTO INFERIOR DIREITO) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          aria-controls={id}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={isOpen ? 'Fechar chat do Norti' : 'Abrir chat com o Norti no WhatsApp'}
          className="group relative flex size-14 sm:size-15 items-center justify-center rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#25D366] text-white shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-white/90"
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
        >
          {isOpen ? (
            <X className="size-6 text-white transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <>
              <svg aria-hidden="true" className="size-7.5 fill-current text-white drop-shadow-xs" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.31" />
              </svg>
              <div className="absolute -top-1.5 -left-1.5 size-7 rounded-full bg-white p-0.5 shadow-md ring-2 ring-emerald-500 overflow-hidden">
                <Image
                  alt="Norti Avatar"
                  className="size-full object-contain"
                  height={28}
                  src="/assets/nort-avatar.png"
                  unoptimized
                  width={28}
                />
              </div>
              <span className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
            </>
          )}
        </button>
      </div>

      {/* 3. MODAL DE CHAT ESTILO WHATSAPP + TYPEBOT */}
      {isOpen && (
        <section
          id={id}
          aria-label="Chat de atendimento com o mascote Norti"
          className="fixed bottom-22 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[400px] h-[550px] max-h-[calc(100vh-110px)] bg-[#ECE5DD] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-slate-200/80 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
        >
          {/* CABEÇALHO WHATSAPP */}
          <header className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative size-10.5 shrink-0 rounded-full bg-white/20 p-0.5 ring-2 ring-emerald-400/80 overflow-hidden">
                <Image
                  alt="Norti Mascote Oficial"
                  className="size-full object-contain"
                  height={42}
                  src="/assets/nort-avatar.png"
                  unoptimized
                  width={42}
                />
              </div>

              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-white tracking-wide truncate">Norti</h2>
                  <span className="rounded-full bg-emerald-500/30 border border-emerald-400/40 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-200 uppercase tracking-wider">
                    Atendente Oficial
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-100 font-medium">
                    {isTyping ? 'digitando...' : 'Online agora • Comercial do Norte'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                aria-label="Reiniciar conversa"
                className="flex size-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition"
                onClick={handleRestartChat}
                title="Reiniciar conversa"
                type="button"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                aria-label="Minimizar chat"
                className="flex size-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <Minimize2 className="size-4" />
              </button>
              <button
                aria-label="Fechar chat do Norti"
                className="flex size-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X className="size-4.5" />
              </button>
            </div>
          </header>

          {/* CORPO DE MENSAGENS COM BALÕES ESTILO WHATSAPP + TYPEBOT */}
          <div
            ref={chatBodyRef}
            className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#EFEAE2]/95"
            style={{
              backgroundImage:
                'radial-gradient(rgba(7, 94, 84, 0.08) 1px, transparent 1px), radial-gradient(rgba(7, 94, 84, 0.08) 1px, #efeae2 1px)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
            }}
          >
            {/* Tag Central de Criptografia / Confiança */}
            <div className="flex justify-center">
              <span className="rounded-lg bg-amber-100/90 border border-amber-200 px-3 py-1 text-[10px] text-amber-900 shadow-xs text-center max-w-[90%]">
                🔒 Atendimento oficial Comercial do Norte via WhatsApp &amp; CRM
              </span>
            </div>

            {/* MENSAGENS TROCADAS NA CONVERSA */}
            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isBot ? 'items-start max-w-[90%]' : 'items-end ml-auto max-w-[90%]'}`}
                >
                  <div
                    className={`relative rounded-2xl p-3 text-xs sm:text-[13px] shadow-sm leading-relaxed ${
                      isBot
                        ? 'rounded-tl-none bg-white text-slate-800 border border-slate-200/60'
                        : 'rounded-tr-none bg-[#DCF8C6] text-slate-900 border border-emerald-200/60'
                    }`}
                  >
                    {isBot && (
                      <p className="font-bold text-[#004CB1] mb-1 flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-amber-500" />
                        Norti
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                      <span>{m.time}</span>
                      {!isBot && <CheckCheck className="size-3 text-[#34B7F1]" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ANIMAÇÃO DE DIGITANDO (TYPEBOT) */}
            {isTyping && (
              <div className="flex flex-col items-start max-w-[85%] animate-in fade-in duration-200">
                <div className="relative rounded-2xl rounded-tl-none bg-white p-3 text-xs text-slate-600 shadow-sm border border-slate-200/60 flex items-center gap-2">
                  <div className="flex space-x-1 items-center py-0.5">
                    <span className="size-2 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[11px] text-slate-400 italic">Norti está digitando...</span>
                </div>
              </div>
            )}

            {/* SELEÇÃO DE LOJA MAIS PRÓXIMA (STEP: STORE) */}
            {step === 'STORE' && !isTyping && (
              <div className="flex flex-col items-start max-w-[98%] space-y-2 pt-1 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold text-slate-700 px-1 flex items-center gap-1">
                  <MapPin className="size-3 text-emerald-600" />
                  Selecione a loja mais próxima de você:
                </span>
                <div className="grid grid-cols-1 gap-1.5 w-full">
                  {COMMERCIAL_STORES.map((st) => (
                    <button
                      key={st.id}
                      className="w-full flex items-center justify-between gap-2 rounded-xl bg-white p-2.5 text-left text-xs text-slate-800 border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/60 transition shadow-xs cursor-pointer group"
                      onClick={() => handleSelectStore(st)}
                      type="button"
                    >
                      <div className="min-w-0">
                        <strong className="block text-slate-900 group-hover:text-emerald-800 text-xs">
                          {st.shortTitle}
                        </strong>
                        <span className="block text-[10.5px] text-slate-500 truncate">{st.address}</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold shrink-0">Escolher &rarr;</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SELEÇÃO DE MOTIVO / ASSUNTO (STEP: SUBJECT) */}
            {step === 'SUBJECT' && !isTyping && (
              <div className="flex flex-col items-start max-w-[98%] space-y-1.5 pt-1 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold text-slate-700 px-1">
                  Escolha como a loja pode te ajudar:
                </span>
                <div className="grid grid-cols-1 gap-1.5 w-full">
                  <button
                    className="w-full flex items-center justify-between gap-2 rounded-xl bg-white p-2.5 text-left text-xs font-semibold text-slate-800 border border-blue-600/20 hover:border-blue-600 hover:bg-blue-50/70 transition shadow-xs cursor-pointer"
                    onClick={() => handleSelectSubject('🏷️ Fazer Cotação de Produtos e Atacado')}
                    type="button"
                  >
                    <span>Fazer Cotação de Produtos e Atacado</span>
                    <span className="text-[10px] text-[#004CB1] font-bold">&rarr;</span>
                  </button>
                  <button
                    className="w-full flex items-center justify-between gap-2 rounded-xl bg-white p-2.5 text-left text-xs font-semibold text-slate-800 border border-emerald-600/20 hover:border-emerald-600 hover:bg-emerald-50/70 transition shadow-xs cursor-pointer"
                    onClick={() => handleSelectSubject('💬 Falar com Vendedor no WhatsApp')}
                    type="button"
                  >
                    <span>Falar com Vendedor no WhatsApp</span>
                    <span className="text-[10px] text-emerald-700 font-bold">&rarr;</span>
                  </button>
                  <button
                    className="w-full flex items-center justify-between gap-2 rounded-xl bg-white p-2.5 text-left text-xs font-semibold text-slate-800 border border-purple-600/20 hover:border-purple-600 hover:bg-purple-50/70 transition shadow-xs cursor-pointer"
                    onClick={() => handleSelectSubject('📦 Consultar Pedido / Entrega')}
                    type="button"
                  >
                    <span>Consultar Pedido / Entrega</span>
                    <span className="text-[10px] text-purple-700 font-bold">&rarr;</span>
                  </button>
                  <button
                    className="w-full flex items-center justify-between gap-2 rounded-xl bg-white p-2.5 text-left text-xs font-semibold text-slate-800 border border-slate-300 hover:border-slate-500 hover:bg-slate-50 transition shadow-xs cursor-pointer"
                    onClick={() => handleSelectSubject('🔄 Trocas, Devoluções e Pós-Venda')}
                    type="button"
                  >
                    <span>Trocas, Devoluções e Pós-Venda</span>
                    <span className="text-[10px] text-slate-600 font-bold">&rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* BOTÃO FINAL WHATSAPP DA LOJA ESCOLHIDA (STEP: FINISHED) */}
            {step === 'FINISHED' && !isTyping && (
              <div className="flex flex-col items-center w-full space-y-2 pt-2 animate-in zoom-in-95 duration-200">
                <a
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white p-3 text-center text-xs sm:text-sm font-bold shadow-md transition duration-200 cursor-pointer"
                  href={finalWhatsAppUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle className="size-4" />
                  Abrir WhatsApp da {selectedStore.shortTitle}
                </a>
                <span className="text-[10.5px] text-slate-500 text-center">
                  A mensagem já vai pronta com seu nome, loja e assunto!
                </span>
              </div>
            )}

            {/* OPÇÕES ADICIONAIS / RETROCOMPATIBILIDADE DE TESTE */}
            <div className="pt-2 border-t border-slate-200/60">
              <button
                className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-slate-800 py-1"
                onClick={() => setQuickOptionsVisible((prev) => !prev)}
                type="button"
              >
                <span>{quickOptionsVisible ? 'Ocultar atalhos rápidos' : 'Ver outros serviços da loja'}</span>
                <span>{quickOptionsVisible ? '▲' : '▼'}</span>
              </button>

              {quickOptionsVisible && (
                <div className="space-y-1.5 mt-1.5">
                  <button
                    className="w-full flex items-center justify-between gap-2.5 rounded-xl bg-white p-2 text-left text-xs font-semibold text-slate-800 border border-emerald-600/20 hover:border-emerald-600 hover:bg-emerald-50/70 transition shadow-xs cursor-pointer"
                    onClick={() =>
                      openWhatsAppTopic(
                        'Gostaria de falar com um vendedor da Comercial do Norte para tirar dúvidas sobre produtos e preços.'
                      )
                    }
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                        <MessageCircle className="size-3" />
                      </div>
                      <span>Falar com Vendas no WhatsApp</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold">&rarr;</span>
                  </button>

                  <button
                    className="w-full flex items-center justify-between gap-2.5 rounded-xl bg-white p-2 text-left text-xs font-semibold text-slate-800 border border-blue-600/20 hover:border-blue-600 hover:bg-blue-50/70 transition shadow-xs cursor-pointer"
                    onClick={() =>
                      openWhatsAppTopic('Preciso de ajuda com a minha lista de cotação de produtos na loja.')
                    }
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#004CB1] text-white">
                        <ShoppingBag className="size-3" />
                      </div>
                      <span>Ajuda com Lista de Cotação</span>
                    </div>
                    <span className="text-[10px] text-[#004CB1] font-bold">&rarr;</span>
                  </button>

                  <button
                    className="w-full flex items-center justify-between gap-2.5 rounded-xl bg-white p-2 text-left text-xs font-semibold text-slate-800 border border-amber-500/25 hover:border-amber-500 hover:bg-amber-50/70 transition shadow-xs cursor-pointer"
                    onClick={() => {
                      setIsOpen(false);
                      startTour();
                    }}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                        <Compass className="size-3" />
                      </div>
                      <span>Fazer Tour Guiado na Loja</span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-bold">&rarr;</span>
                  </button>

                  <button
                    className="w-full flex items-center justify-between gap-2.5 rounded-xl bg-white p-2 text-left text-xs font-semibold text-slate-800 border border-purple-500/20 hover:border-purple-500 hover:bg-purple-50/70 transition shadow-xs cursor-pointer"
                    onClick={() => setStoreInfoVisible((prev) => !prev)}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white">
                        <MapPin className="size-3" />
                      </div>
                      <span>Endereços e Horários das Lojas</span>
                    </div>
                    <span className="text-[10px] text-purple-700 font-bold">
                      {storeInfoVisible ? 'Ocultar' : 'Ver'} &rarr;
                    </span>
                  </button>

                  <button
                    className="w-full flex items-center justify-between gap-2.5 rounded-xl bg-white p-2 text-left text-xs font-semibold text-slate-800 border border-slate-300 hover:border-slate-500 hover:bg-slate-50 transition shadow-xs cursor-pointer"
                    onClick={() =>
                      openWhatsAppTopic('Preciso de atendimento de pós-venda / suporte da Comercial do Norte.')
                    }
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-white">
                        <Headphones className="size-3" />
                      </div>
                      <span>Suporte e Pós-Venda CRM</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-bold">&rarr;</span>
                  </button>
                </div>
              )}
            </div>

            {/* PAINEL DINÂMICO DE LOJAS FÍSICAS */}
            {storeInfoVisible && (
              <div className="flex flex-col items-start max-w-[95%] animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="relative rounded-2xl rounded-tl-none bg-white p-3 text-xs text-slate-800 shadow-sm border border-slate-200/60 leading-relaxed">
                  <p className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-purple-600" />
                    Nossas Unidades em Belém e Região:
                  </p>
                  <ul className="space-y-1.5 mt-2 text-[11px] text-slate-600">
                    <li>
                      <strong>📍 Bernardo Sayão:</strong> Av. Bernardo Sayão, 608 — Guamá
                    </li>
                    <li>
                      <strong>📍 Jurunas:</strong> Av. Bernardo Sayão, 2450 — Jurunas
                    </li>
                    <li>
                      <strong>📍 Matriz São Brás:</strong> Av. Rômulo Maiorana, 115
                    </li>
                    <li>
                      <strong>📍 Mauriti:</strong> Tv. Mauriti, 1124 — Pedreira
                    </li>
                    <li>
                      <strong>📍 Cidade Nova:</strong> Tv. WE-59, 138 — Ananindeua
                    </li>
                    <li>
                      <strong>📍 Online / Delivery:</strong> Tv. das Mercês, 158
                    </li>
                  </ul>
                  <p className="mt-2 text-[10.5px] text-slate-500">
                    Segunda a Sexta: 07h às 19h | Sábado: 07h às 13h
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RODAPÉ COM CAMPO DE MENSAGEM / RESPOSTA */}
          <footer className="bg-[#F0F2F5] p-2.5 border-t border-slate-200/90 shrink-0">
            <form className="flex items-center gap-2" onSubmit={handleSendCustomMessage}>
              <input
                ref={inputRef}
                aria-label="Digite sua mensagem para o atendimento"
                className="flex-1 rounded-full bg-white px-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  step === 'NAME'
                    ? 'Digite seu nome completo...'
                    : step === 'PHONE'
                    ? 'Digite seu WhatsApp com DDD...'
                    : 'Digite sua mensagem para o atendimento...'
                }
                type="text"
                value={inputText}
              />
              <button
                aria-label="Enviar mensagem no WhatsApp"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white hover:bg-[#128C7E] transition shadow-sm cursor-pointer disabled:opacity-50"
                disabled={!inputText.trim()}
                type="submit"
              >
                <Send className="size-4 ml-0.5" />
              </button>
            </form>
          </footer>
        </section>
      )}
    </>
  );
}
