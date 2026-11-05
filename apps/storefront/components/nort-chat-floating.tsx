'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, CheckCheck, Minimize2, RotateCcw, Send, X } from 'lucide-react';
import {
  COMMERCIAL_STORES,
  CommercialStore,
  DEFAULT_STORE,
  buildWhatsAppLink,
  findNearestStoreByCep,
  findNearestStoreByCoords,
  formatBrazilPhoneMask,
  formatCepMask,
} from '../lib/stores-data';
import { useNortTour } from './tour';

export type NortChatFloatingProps = {
  whatsapp?: string | null;
  phone?: string | null;
};

export type ChatMessage = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  quotedTitle?: string;
  quotedText?: string;
};

export type BotStep =
  | 'IDENTIFY'
  | 'UNIT_MODE'
  | 'UNIT_CEP'
  | 'UNIT_LIST'
  | 'SERVICE'
  | 'FINISHED';

const INITIAL_BOT_MESSAGE =
  'Olá! 👋 Eu sou o Nort, assistente virtual da Comercial do Norte!\n\nPara começar, me conta: qual é o seu nome e número do WhatsApp?';

/* ============================================================================
 * SUBCOMPONENTES REUTILIZÁVEIS (PADRÃO WHATSAPP)
 * ============================================================================ */

function NortAvatar({ size = 30, alt = 'Nort' }: { size?: number; alt?: string }) {
  return (
    <div
      className="relative shrink-0 rounded-full bg-[#FFFFFF] border border-[#D1D7DB] overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Image
        alt={alt}
        className="size-full object-contain"
        height={size}
        src="/assets/nort-avatar.png"
        unoptimized
        width={size}
      />
    </div>
  );
}

function VerifiedBadge() {
  return (
    <svg
      aria-label="Conta comercial verificada"
      className="size-4 shrink-0 text-[#00A884]"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2l2.4 1.8 3-.3.9 2.9 2.7 1.3-.8 2.9 1.5 2.6-2.2 2.1.2 3-2.9.6-1.8 2.4-2.8-1.1-2.8 1.1-1.8-2.4-2.9-.6.2-3-2.2-2.1 1.5-2.6-.8-2.9 2.7-1.3.9-2.9 3 .3L12 2zm-1.1 13.4l5.3-5.3-1.4-1.4-3.9 3.9-1.9-1.9-1.4 1.4 3.3 3.3z" />
    </svg>
  );
}

function TypingIndicatorBubble() {
  return (
    <div
      aria-label="Nort está digitando"
      className="flex items-start gap-2 max-w-[85%] animate-in fade-in duration-150"
    >
      <NortAvatar alt="Nort digitando" size={30} />
      <div className="relative rounded-[10px] rounded-tl-none bg-[#F1F3F4] px-3.5 py-2.5 shadow-[0_1px_1px_rgba(17,27,33,0.12)] border border-[#D1D7DB]/60">
        {/* Tail superior esquerdo */}
        <span
          aria-hidden="true"
          className="absolute -left-[6px] top-0 w-0 h-0 border-t-[8px] border-t-[#F1F3F4] border-l-[6px] border-l-transparent"
        />
        <div className="flex items-center gap-1.5 py-0.5">
          <span className="size-2 rounded-full bg-[#667781] animate-bounce motion-reduce:animate-none" />
          <span className="size-2 rounded-full bg-[#667781] animate-bounce [animation-delay:0.18s] motion-reduce:animate-none" />
          <span className="size-2 rounded-full bg-[#667781] animate-bounce [animation-delay:0.36s] motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  showAvatar,
}: {
  message: ChatMessage;
  showAvatar: boolean;
}) {
  const isBot = message.sender === 'bot';

  if (isBot) {
    return (
      <div className="flex items-start gap-2 max-w-[90%] animate-in fade-in duration-150">
        {showAvatar ? (
          <NortAvatar alt="Nort" size={30} />
        ) : (
          <div aria-hidden="true" className="w-[30px] shrink-0" />
        )}
        <div
          className={`relative bg-[#F1F3F4] text-[#111B21] rounded-[10px] ${
            showAvatar ? 'rounded-tl-none' : ''
          } px-3 pt-2 pb-1.5 shadow-[0_1px_1px_rgba(17,27,33,0.12)] border border-[#D1D7DB]/50 text-[13px] leading-[1.42]`}
        >
          {showAvatar && (
            <span
              aria-hidden="true"
              className="absolute -left-[6px] top-0 w-0 h-0 border-t-[8px] border-t-[#F1F3F4] border-l-[6px] border-l-transparent"
            />
          )}
          <p className="whitespace-pre-wrap break-words pr-10">{message.text}</p>
          <div className="flex justify-end -mt-1">
            <span className="text-[10px] text-[#667781] leading-none select-none">
              {message.time}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end w-full animate-in fade-in duration-150">
      <div className="relative max-w-[85%] bg-[#E0FBD4] text-[#111B21] rounded-[10px] rounded-tr-none px-3 pt-2 pb-1.5 shadow-[0_1px_1px_rgba(17,27,33,0.12)] border border-[#D1D7DB]/50 text-[13px] leading-[1.42]">
        <span
          aria-hidden="true"
          className="absolute -right-[6px] top-0 w-0 h-0 border-t-[8px] border-t-[#E0FBD4] border-r-[6px] border-r-transparent"
        />
        {message.quotedText && (
          <div className="mb-1.5 rounded-[6px] bg-[#D1F4CC] border-l-[3px] border-l-[#075844] px-2 py-1 text-[11px] text-[#667781]">
            <span className="block font-bold text-[#075844]">
              {message.quotedTitle || 'Nort | Comercial do Norte'}
            </span>
            <span className="line-clamp-2">{message.quotedText}</span>
          </div>
        )}
        <p className="whitespace-pre-wrap break-words pr-12">{message.text}</p>
        <div className="flex items-center justify-end gap-1 -mt-1">
          <span className="text-[10px] text-[#667781] leading-none select-none">
            {message.time}
          </span>
          <CheckCheck aria-label="Mensagem entregue" className="size-3.5 text-[#00A884]" />
        </div>
      </div>
    </div>
  );
}

function QuickReplyButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="w-full rounded-[10px] bg-[#FFFFFF] hover:bg-[#F8F9FA] active:bg-[#F1F3F4] text-[#00A884] font-semibold text-[13px] py-2.5 px-3 text-center shadow-[0_1px_1px_rgba(17,27,33,0.12)] border border-[#D1D7DB] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

/* ============================================================================
 * COMPONENTE PRINCIPAL — CHAT DO NORT (ESTILO WHATSAPP CONVERSACIONAL GUIADO)
 * ============================================================================ */

export function NortChatFloating({ whatsapp, phone }: NortChatFloatingProps) {
  const { startTour } = useNortTour();
  const [isOpen, setIsOpen] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  // Etapas e estado do atendimento
  const [step, setStep] = useState<BotStep>('IDENTIFY');
  const [isTyping, setIsTyping] = useState(false);

  // Dados do cliente e escolhas
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [cepInput, setCepInput] = useState('');
  const [cepError, setCepError] = useState('');
  const [pendingStoreId, setPendingStoreId] = useState<string>(DEFAULT_STORE.id);
  const [selectedStore, setSelectedStore] = useState<CommercialStore>(DEFAULT_STORE);
  const [chosenSubject, setChosenSubject] = useState('');
  const [customMessageText, setCustomMessageText] = useState('');
  const [storeInfoVisible, setStoreInfoVisible] = useState(false);

  // Histórico de mensagens
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: INITIAL_BOT_MESSAGE,
      time: 'Agora',
    },
  ]);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const cepInputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);
  const id = useId();

  // Fallback digits
  const defaultWhatsapp = '5591983440880';
  const rawNumber = whatsapp || phone || defaultWhatsapp;
  const whatsappDigits = rawNumber.replace(/\D/g, '') || defaultWhatsapp;

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

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
      const scrollTimer = window.setTimeout(() => {
        if (chatBodyRef.current && typeof chatBodyRef.current.scrollTo === 'function') {
          chatBodyRef.current.scrollTo({
            top: chatBodyRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
        if (step === 'IDENTIFY') {
          nameInputRef.current?.focus();
        } else if (step === 'UNIT_CEP') {
          cepInputRef.current?.focus();
        } else if (step === 'FINISHED') {
          customInputRef.current?.focus();
        }
      }, 60);
      return () => window.clearTimeout(scrollTimer);
    }
  }, [isOpen, messages, isTyping, step, storeInfoVisible]);

  function getFormattedTime() {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function scheduleBotReply(text: string, onDone?: () => void) {
    // Respeita movimento reduzido ou calcula tempo proporcional (800ms a 1400ms)
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const calculatedDelay = prefersReducedMotion
      ? 150
      : Math.min(1300, Math.max(800, text.length * 6));

    setIsTyping(true);
    const timerId = window.setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sender: 'bot',
          text,
          time: getFormattedTime(),
        },
      ]);
      onDone?.();
    }, calculatedDelay);

    timersRef.current.push(timerId);
  }

  async function registerLeadToCRM(leadData: {
    name: string;
    phone: string;
    store: CommercialStore;
    subject: string;
    allMessages: ChatMessage[];
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
      // Ignora erro de rede em modo offline ou teste
    }
  }

  /* ============================================================================
   * ETAPA 1 — IDENTIFICAÇÃO (NOME + WHATSAPP)
   * ============================================================================ */
  function handleIdentifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isTyping) return;

    const cleanName = customerName.trim();
    const phoneDigits = customerPhone.replace(/\D/g, '');

    if (cleanName.length < 2) {
      setFormError('Por favor, informe seu nome.');
      return;
    }

    if (phoneDigits.length < 10) {
      setFormError('Informe um WhatsApp válido com DDD, ex: (91) 99999-9999.');
      return;
    }

    setFormError('');
    const formattedPhone = formatBrazilPhoneMask(phoneDigits);
    setCustomerName(cleanName);
    setCustomerPhone(formattedPhone);

    const userMsg: ChatMessage = {
      id: `user-id-${Date.now()}`,
      sender: 'user',
      text: `${cleanName}\n📱 ${formattedPhone}`,
      time: getFormattedTime(),
      quotedText: 'Para começar, me conta: qual é o seu nome e número do WhatsApp?',
    };

    setMessages((prev) => [...prev, userMsg]);
    setStep('UNIT_MODE');

    scheduleBotReply(
      `Prazer, ${cleanName}! 😊\n\nAgora me diz: em qual unidade da Comercial do Norte você gostaria de ser atendido?`
    );
  }

  /* ============================================================================
   * ETAPA 2 — ESCOLHA DA UNIDADE (LOCALIZAÇÃO, CEP OU LISTA)
   * ============================================================================ */
  function handleFindNearestUnit() {
    if (isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-near-${Date.now()}`,
      sender: 'user',
      text: '📍 Encontrar a mais próxima de mim',
      time: getFormattedTime(),
      quotedText: 'Agora me diz: em qual unidade da Comercial do Norte você gostaria de ser atendido?',
    };
    setMessages((prev) => [...prev, userMsg]);

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nearest = findNearestStoreByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
          confirmStoreSelection(
            nearest,
            `Encontrei a unidade mais próxima da sua localização: ${nearest.shortTitle} (${nearest.address}).`
          );
        },
        () => {
          setStep('UNIT_CEP');
          scheduleBotReply(
            'Não consegui acessar sua localização automática. Sem problemas! Informe seu CEP abaixo para eu localizar a unidade mais próxima:'
          );
        },
        { timeout: 5000 }
      );
    } else {
      setStep('UNIT_CEP');
      scheduleBotReply(
        'Para localizar a loja mais próxima, informe seu CEP abaixo:'
      );
    }
  }

  function handleShowUnitList() {
    if (isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-list-${Date.now()}`,
      sender: 'user',
      text: '🏬 Escolher uma unidade',
      time: getFormattedTime(),
      quotedText: 'Agora me diz: em qual unidade da Comercial do Norte você gostaria de ser atendido?',
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('UNIT_LIST');
  }

  function handleCepSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isTyping) return;

    const digits = cepInput.replace(/\D/g, '');
    if (digits.length < 5) {
      setCepError('Informe um CEP válido (ex: 66093-005).');
      return;
    }

    setCepError('');
    const nearest = findNearestStoreByCep(digits);
    const formattedCep = formatCepMask(digits);

    const userMsg: ChatMessage = {
      id: `user-cep-${Date.now()}`,
      sender: 'user',
      text: `CEP: ${formattedCep} (${nearest.shortTitle})`,
      time: getFormattedTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSelectedStore(nearest);
    setStep('SERVICE');

    scheduleBotReply(
      `Perfeito, ${customerName || 'visitante'}! 💙 Identifiquei a ${nearest.shortTitle} como a mais próxima.\n\nAgora me conta, como posso te ajudar hoje?`
    );
  }

  function confirmStoreSelection(store: CommercialStore, customPrefix?: string) {
    if (isTyping) return;
    setSelectedStore(store);

    const userMsg: ChatMessage = {
      id: `user-store-${Date.now()}`,
      sender: 'user',
      text: `🏬 ${store.shortTitle}`,
      time: getFormattedTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('SERVICE');

    const replyText = customPrefix
      ? `${customPrefix}\n\nPerfeito, ${customerName || 'visitante'}! 💙\nAgora me conta, como posso te ajudar hoje?`
      : `Perfeito, ${customerName || 'visitante'}! 💙\n\nAgora me conta, como posso te ajudar hoje?`;

    scheduleBotReply(replyText);
  }

  /* ============================================================================
   * ETAPA 3 — COMO PODEMOS AJUDAR? (SERVIÇOS E REDIRECIONAMENTO)
   * ============================================================================ */
  function handleSelectService(serviceLabel: string, topicDetail: string) {
    if (isTyping) return;
    setChosenSubject(serviceLabel);

    const userMsg: ChatMessage = {
      id: `user-srv-${Date.now()}`,
      sender: 'user',
      text: serviceLabel,
      time: getFormattedTime(),
      quotedText: 'Agora me conta, como posso te ajudar hoje?',
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setStep('FINISHED');

    void registerLeadToCRM({
      name: customerName || 'Cliente Site',
      phone: customerPhone || '(91) 98344-0880',
      store: selectedStore,
      subject: serviceLabel,
      allMessages: updatedMessages,
    });

    const activePhone = selectedStore.whatsappDigits || whatsappDigits;
    const bodyText = customerName
      ? `Olá, equipe Comercial do Norte (${selectedStore.shortTitle})! Meu nome é ${customerName} (${customerPhone}). ${topicDetail}`
      : `Olá! ${topicDetail}`;

    const url = buildWhatsAppLink(activePhone, bodyText);
    if (typeof window !== 'undefined' && typeof window.open === 'function') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    scheduleBotReply(
      `Tudo certo, ${customerName || 'visitante'}! Já preparei seu atendimento para a ${selectedStore.shortTitle}.\n\nSe a janela do WhatsApp não abriu automaticamente, toque no botão abaixo ou envie uma mensagem adicional:`
    );
  }

  function handleShowAddressesInChat() {
    if (isTyping) return;

    const nextVisible = !storeInfoVisible;
    setStoreInfoVisible(nextVisible);

    if (nextVisible) {
      const userMsg: ChatMessage = {
        id: `user-addr-${Date.now()}`,
        sender: 'user',
        text: '📍 Endereço e horários',
        time: getFormattedTime(),
      };
      setMessages((prev) => [...prev, userMsg]);
    }
  }

  function handleSendCustomMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = customMessageText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-custom-${Date.now()}`,
      sender: 'user',
      text,
      time: getFormattedTime(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    const activePhone = selectedStore.whatsappDigits || whatsappDigits;
    const bodyText = customerName
      ? `Olá, equipe Comercial do Norte (${selectedStore.shortTitle})! Meu nome é ${customerName} (${customerPhone}). ${text}`
      : text;

    const url = buildWhatsAppLink(activePhone, bodyText);
    if (typeof window !== 'undefined' && typeof window.open === 'function') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    setCustomMessageText('');
  }

  function handleStepBack() {
    if (step === 'UNIT_MODE') {
      setStep('IDENTIFY');
    } else if (step === 'UNIT_LIST' || step === 'UNIT_CEP') {
      setStep('UNIT_MODE');
    } else if (step === 'SERVICE') {
      setStep('UNIT_MODE');
    } else if (step === 'FINISHED') {
      setStep('SERVICE');
    }
  }

  function handleRestartChat() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    setStep('IDENTIFY');
    setCustomerName('');
    setCustomerPhone('');
    setFormError('');
    setCepInput('');
    setCepError('');
    setSelectedStore(DEFAULT_STORE);
    setPendingStoreId(DEFAULT_STORE.id);
    setChosenSubject('');
    setCustomMessageText('');
    setStoreInfoVisible(false);
    setIsTyping(false);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: INITIAL_BOT_MESSAGE,
        time: getFormattedTime(),
      },
    ]);
  }

  const finalWhatsAppUrl = buildWhatsAppLink(
    selectedStore.whatsappDigits || whatsappDigits,
    `Olá, equipe Comercial do Norte (${selectedStore.name})!\nMeu nome é: ${customerName || 'Cliente'}\nWhatsApp: ${customerPhone || 'Informado no site'}\nAssunto: ${chosenSubject || 'Atendimento geral'}\nUnidade: ${selectedStore.shortTitle}`
  );

  return (
    <>
      {/* 1. BALÃO FLUTUANTE DE PRÉVIA / CONVITE DO NORT (SEM GRADIENTES) */}
      {!isOpen && !bubbleDismissed && (
        <aside
          aria-label="Convite de atendimento do Norti"
          className="fixed bottom-20 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-[290px] sm:max-w-[320px]"
        >
          <div className="relative flex items-start gap-2.5 rounded-[12px] bg-[#FFFFFF] p-3 shadow-[0_4px_16px_rgba(17,27,33,0.18)] border border-[#D1D7DB]">
            <NortAvatar alt="Nort Atendente" size={38} />

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
                <span className="text-xs font-bold text-[#111B21]">
                  Nort | Comercial do Norte
                </span>
                <span className="size-2 rounded-full bg-[#00A884]" />
              </div>
              <p className="mt-0.5 text-xs text-[#667781] leading-snug">
                Oi! Precisa de ajuda com cotação ou produtos? Fala comigo! 👋
              </p>
            </div>

            <button
              aria-label="Dispensar aviso do Norti"
              className="text-[#667781] hover:text-[#111B21] transition -mr-1 -mt-1 p-1 rounded"
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

      {/* 2. BOTÃO FLUTUANTE PRINCIPAL (COR SÓLIDA #00A884, SEM GRADIENTE) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          aria-controls={id}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={isOpen ? 'Fechar chat do Norti' : 'Abrir chat com o Norti no WhatsApp'}
          className="group relative flex size-14 sm:size-15 items-center justify-center rounded-full bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] shadow-[0_4px_14px_rgba(17,27,33,0.28)] transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer border-2 border-[#FFFFFF]"
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
        >
          {isOpen ? (
            <X className="size-6 text-[#FFFFFF]" />
          ) : (
            <>
              <svg
                aria-hidden="true"
                className="size-7.5 fill-current text-[#FFFFFF]"
                viewBox="0 0 24 24"
              >
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.31" />
              </svg>
              <div className="absolute -top-1.5 -left-1.5 size-7 rounded-full bg-[#FFFFFF] p-0.5 border border-[#075844] overflow-hidden">
                <Image
                  alt="Nort Avatar"
                  className="size-full object-contain"
                  height={28}
                  src="/assets/nort-avatar.png"
                  unoptimized
                  width={28}
                />
              </div>
            </>
          )}
        </button>
      </div>

      {/* 3. JANELA DE CONVERSA WHATSAPP (CORES SÓLIDAS + WALLPAPER CLÁSSICO) */}
      {isOpen && (
        <section
          id={id}
          aria-label="Chat de atendimento com o mascote Norti"
          className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-22 sm:right-6 z-50 w-full sm:w-[395px] h-[100dvh] sm:h-[580px] sm:max-h-[calc(100vh-105px)] bg-[#E4D8D3] sm:rounded-[14px] shadow-[0_12px_36px_rgba(17,27,33,0.28)] border border-[#D1D7DB] overflow-hidden flex flex-col animate-in fade-in duration-150"
          role="dialog"
        >
          {/* CABEÇALHO SÓLIDO #075844 — PADRÃO WHATSAPP (ANEXOS 2 E 3) */}
          <header className="bg-[#075844] text-[#FFFFFF] px-3 py-2.5 flex items-center justify-between shrink-0 border-b border-[#075844]">
            <div className="flex items-center gap-2 min-w-0">
              <button
                aria-label={step !== 'IDENTIFY' ? 'Voltar etapa anterior' : 'Minimizar chat'}
                className="flex size-7 items-center justify-center rounded-full text-[#FFFFFF] hover:bg-[#0B8E69] transition cursor-pointer shrink-0"
                onClick={() => {
                  if (step !== 'IDENTIFY') {
                    handleStepBack();
                  } else {
                    setIsOpen(false);
                  }
                }}
                type="button"
              >
                <ArrowLeft className="size-4.5" />
              </button>

              <NortAvatar alt="Nort | Comercial do Norte" size={38} />

              <div className="min-w-0 leading-tight ml-0.5">
                <div className="flex items-center gap-1">
                  <h2 className="text-[14px] font-bold text-[#FFFFFF] truncate">
                    Nort | Comercial do Norte
                  </h2>
                  <VerifiedBadge />
                </div>
                <p className="text-[11.5px] text-[#FFFFFF]/90 font-normal truncate mt-0.5">
                  {isTyping ? 'digitando...' : 'online'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                aria-label="Reiniciar conversa"
                className="flex size-8 items-center justify-center rounded-full text-[#FFFFFF] hover:bg-[#0B8E69] transition cursor-pointer"
                onClick={handleRestartChat}
                title="Reiniciar conversa"
                type="button"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                aria-label="Minimizar chat"
                className="hidden sm:flex size-8 items-center justify-center rounded-full text-[#FFFFFF] hover:bg-[#0B8E69] transition cursor-pointer"
                onClick={() => setIsOpen(false)}
                title="Minimizar"
                type="button"
              >
                <Minimize2 className="size-4" />
              </button>
              <button
                aria-label="Fechar chat do Norti"
                className="flex size-8 items-center justify-center rounded-full text-[#FFFFFF] hover:bg-[#0B8E69] transition cursor-pointer"
                onClick={() => setIsOpen(false)}
                title="Fechar"
                type="button"
              >
                <X className="size-4.5" />
              </button>
            </div>
          </header>

          {/* ÁREA DE MENSAGENS COM WALLPAPER CLÁSSICO DO WHATSAPP (#E4D8D3 + TEXTURA) */}
          <div
            ref={chatBodyRef}
            className="relative flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-[#E4D8D3]"
            style={{
              backgroundColor: 'var(--chat-background, #E4D8D3)',
              backgroundImage: "url('/assets/whatsapp-wallpaper.jpg')",
              backgroundRepeat: 'repeat',
              backgroundSize: '340px auto',
              backgroundAttachment: 'local',
              backgroundBlendMode: 'multiply',
            }}
          >
            {/* Tag "Hoje" igual ao Anexo 1 */}
            <div className="flex justify-center">
              <span className="rounded-[7px] bg-[#FFFFFF] px-2.5 py-0.5 text-[11px] font-medium text-[#667781] shadow-[0_1px_1px_rgba(17,27,33,0.1)] border border-[#D1D7DB]/60">
                Hoje
              </span>
            </div>

            {/* Aviso de criptografia / privacidade LGPD no estilo clássico do WhatsApp (Anexo 1) */}
            <div className="flex justify-center">
              <div className="rounded-[8px] bg-[#FFF5C4] border border-[#E6DA9E] px-3 py-1.5 text-[11px] text-[#54656F] text-center max-w-[94%] leading-snug shadow-[0_1px_1px_rgba(17,27,33,0.08)]">
                🔒 Suas informações (nome, WhatsApp e localização) são protegidas e usadas apenas para direcionar seu atendimento na Comercial do Norte.
              </div>
            </div>

            {/* HISTÓRICO DE MENSAGENS */}
            {messages.map((msg, idx) => {
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const showAvatar = msg.sender === 'bot' && (!prevMsg || prevMsg.sender !== 'bot');
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  showAvatar={showAvatar}
                />
              );
            })}

            {/* INDICADOR DE DIGITAÇÃO (ANEXO 2) */}
            {isTyping && <TypingIndicatorBubble />}

            {/* =================================================================
             * INTERAÇÃO 1 — FORMULÁRIO INTEGRADO À CONVERSA (NOME + WHATSAPP)
             * ================================================================= */}
            {step === 'IDENTIFY' && !isTyping && (
              <div className="pl-[38px] pr-1 pt-0.5 animate-in fade-in duration-150">
                <form
                  aria-label="Identificação rápida para atendimento"
                  className="rounded-[10px] bg-[#FFFFFF] p-3 border border-[#D1D7DB] shadow-[0_1px_2px_rgba(17,27,33,0.12)] space-y-2"
                  onSubmit={handleIdentifySubmit}
                >
                  <div>
                    <label
                      className="block text-[11px] font-semibold text-[#111B21] mb-0.5"
                      htmlFor={`${id}-name`}
                    >
                      Seu nome
                    </label>
                    <input
                      ref={nameInputRef}
                      id={`${id}-name`}
                      aria-label="Seu nome"
                      className="w-full rounded-[8px] bg-[#FFFFFF] px-2.5 py-1.5 text-[13px] text-[#111B21] placeholder-[#667781] border border-[#D1D7DB] focus:outline-none focus:border-[#00A884]"
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder="Como posso te chamar?"
                      type="text"
                      value={customerName}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[11px] font-semibold text-[#111B21] mb-0.5"
                      htmlFor={`${id}-phone`}
                    >
                      WhatsApp
                    </label>
                    <input
                      id={`${id}-phone`}
                      aria-label="WhatsApp"
                      className="w-full rounded-[8px] bg-[#FFFFFF] px-2.5 py-1.5 text-[13px] text-[#111B21] placeholder-[#667781] border border-[#D1D7DB] focus:outline-none focus:border-[#00A884]"
                      inputMode="tel"
                      onChange={(e) => {
                        setCustomerPhone(formatBrazilPhoneMask(e.target.value));
                        if (formError) setFormError('');
                      }}
                      placeholder="(91) 99999-9999"
                      type="tel"
                      value={customerPhone}
                    />
                  </div>

                  {formError && (
                    <p className="text-[11px] text-[#B91C1C] font-medium" role="alert">
                      {formError}
                    </p>
                  )}

                  <button
                    className="w-full rounded-[8px] bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] font-semibold text-[13px] py-2 px-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    type="submit"
                  >
                    <span>Continuar no chat</span>
                    <Send className="size-3.5" />
                  </button>
                </form>

                {/* Botões de resposta rápida do WhatsApp (Anexo 1) */}
                <div className="mt-2 space-y-1.5">
                  <QuickReplyButton
                    onClick={() => {
                      const activePhone = selectedStore.whatsappDigits || whatsappDigits;
                      const url = buildWhatsAppLink(
                        activePhone,
                        'Olá! Gostaria de falar com vendas da Comercial do Norte para tirar dúvidas sobre produtos e preços.'
                      );
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    💬 Falar com Vendas no WhatsApp
                  </QuickReplyButton>

                  <QuickReplyButton
                    onClick={() => {
                      const activePhone = selectedStore.whatsappDigits || whatsappDigits;
                      const url = buildWhatsAppLink(
                        activePhone,
                        'Olá! Preciso de ajuda com a minha lista de cotação de produtos na Comercial do Norte.'
                      );
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    📋 Ajuda com Lista de Cotação
                  </QuickReplyButton>

                  <QuickReplyButton
                    onClick={() => {
                      setIsOpen(false);
                      startTour();
                    }}
                  >
                    🧭 Fazer Tour Guiado na Loja
                  </QuickReplyButton>

                  <QuickReplyButton onClick={handleShowAddressesInChat}>
                    📍 Endereços e Horários das Lojas
                  </QuickReplyButton>

                  <QuickReplyButton
                    onClick={() => {
                      const activePhone = selectedStore.whatsappDigits || whatsappDigits;
                      const url = buildWhatsAppLink(
                        activePhone,
                        'Olá! Preciso de atendimento de suporte e pós-venda da Comercial do Norte.'
                      );
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    🎧 Suporte e Pós-Venda CRM
                  </QuickReplyButton>
                </div>
              </div>
            )}

            {/* =================================================================
             * INTERAÇÃO 2 — ESCOLHA DA UNIDADE (BOTÕES DE RESPOSTA RÁPIDA)
             * ================================================================= */}
            {step === 'UNIT_MODE' && !isTyping && (
              <div className="pl-[38px] pr-1 space-y-1.5 pt-0.5 animate-in fade-in duration-150">
                <QuickReplyButton onClick={handleFindNearestUnit}>
                  📍 Encontrar a mais próxima de mim
                </QuickReplyButton>
                <QuickReplyButton onClick={handleShowUnitList}>
                  🏬 Escolher uma unidade
                </QuickReplyButton>
              </div>
            )}

            {/* SUB-FLUXO 2A — INFORMAR CEP QUANDO GEOLOCALIZAÇÃO NÃO ESTÁ AUTORIZADA */}
            {step === 'UNIT_CEP' && !isTyping && (
              <div className="pl-[38px] pr-1 pt-0.5 space-y-1.5 animate-in fade-in duration-150">
                <form
                  aria-label="Buscar unidade por CEP"
                  className="rounded-[10px] bg-[#FFFFFF] p-3 border border-[#D1D7DB] shadow-[0_1px_2px_rgba(17,27,33,0.12)] space-y-2"
                  onSubmit={handleCepSubmit}
                >
                  <label
                    className="block text-[11px] font-semibold text-[#111B21]"
                    htmlFor={`${id}-cep`}
                  >
                    Informe seu CEP
                  </label>
                  <input
                    ref={cepInputRef}
                    id={`${id}-cep`}
                    aria-label="Informe seu CEP"
                    className="w-full rounded-[8px] bg-[#FFFFFF] px-2.5 py-1.5 text-[13px] text-[#111B21] placeholder-[#667781] border border-[#D1D7DB] focus:outline-none focus:border-[#00A884]"
                    inputMode="numeric"
                    onChange={(e) => {
                      setCepInput(formatCepMask(e.target.value));
                      if (cepError) setCepError('');
                    }}
                    placeholder="Informe seu CEP..."
                    type="text"
                    value={cepInput}
                  />
                  {cepError && (
                    <p className="text-[11px] text-[#B91C1C] font-medium" role="alert">
                      {cepError}
                    </p>
                  )}
                  <button
                    className="w-full rounded-[8px] bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] font-semibold text-[13px] py-2 px-3 text-center transition-colors cursor-pointer"
                    type="submit"
                  >
                    Localizar unidade mais próxima
                  </button>
                </form>

                <QuickReplyButton onClick={() => setStep('UNIT_LIST')}>
                  🏬 Ver lista de todas as unidades
                </QuickReplyButton>
              </div>
            )}

            {/* SUB-FLUXO 2B — LISTA INTERATIVA DE UNIDADES REAIS CADASTRADAS */}
            {step === 'UNIT_LIST' && !isTyping && (
              <div className="pl-[38px] pr-1 pt-0.5 animate-in fade-in duration-150">
                <div className="rounded-[10px] bg-[#FFFFFF] border border-[#D1D7DB] shadow-[0_1px_2px_rgba(17,27,33,0.12)] overflow-hidden">
                  <div className="px-3 py-2 border-b border-[#D1D7DB] bg-[#F1F3F4]">
                    <span className="text-[12px] font-bold text-[#111B21]">
                      Selecione a unidade Comercial do Norte:
                    </span>
                  </div>
                  <div className="divide-y divide-[#D1D7DB]">
                    {COMMERCIAL_STORES.map((store) => {
                      const isSelected = pendingStoreId === store.id;
                      return (
                        <label
                          key={store.id}
                          className="flex items-start gap-2.5 px-3 py-2 cursor-pointer hover:bg-[#F1F3F4]/60 transition-colors"
                        >
                          <input
                            checked={isSelected}
                            className="mt-1 accent-[#00A884] cursor-pointer"
                            name="nort-store-choice"
                            onChange={() => setPendingStoreId(store.id)}
                            type="radio"
                            value={store.id}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="block text-[12.5px] font-semibold text-[#111B21]">
                              {store.shortTitle}
                            </span>
                            <span className="block text-[11px] text-[#667781] truncate">
                              {store.address}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <div className="p-2.5 border-t border-[#D1D7DB] bg-[#FFFFFF]">
                    <button
                      className="w-full rounded-[8px] bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] font-semibold text-[13px] py-2 px-3 text-center transition-colors cursor-pointer"
                      onClick={() => {
                        const chosen =
                          COMMERCIAL_STORES.find((s) => s.id === pendingStoreId) ||
                          DEFAULT_STORE;
                        confirmStoreSelection(chosen);
                      }}
                      type="button"
                    >
                      Confirmar unidade selecionada
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================
             * INTERAÇÃO 3 — COMO PODEMOS AJUDAR HOJE? (BOTÕES ESTILO WHATSAPP)
             * ================================================================= */}
            {step === 'SERVICE' && !isTyping && (
              <div className="pl-[38px] pr-1 space-y-1.5 pt-0.5 animate-in fade-in duration-150">
                <QuickReplyButton
                  onClick={() =>
                    handleSelectService(
                      '🛍️ Consultar produtos',
                      'Gostaria de consultar a disponibilidade e informações de produtos no catálogo.'
                    )
                  }
                >
                  🛍️ Consultar produtos
                </QuickReplyButton>

                <QuickReplyButton
                  onClick={() =>
                    handleSelectService(
                      '📋 Solicitar uma cotação',
                      'Gostaria de solicitar uma cotação de produtos na loja.'
                    )
                  }
                >
                  📋 Solicitar uma cotação
                </QuickReplyButton>

                <QuickReplyButton onClick={handleShowAddressesInChat}>
                  📍 Endereço e horários
                </QuickReplyButton>

                <QuickReplyButton
                  onClick={() =>
                    handleSelectService(
                      '💬 Falar com um atendente',
                      'Gostaria de falar com um atendente da unidade.'
                    )
                  }
                >
                  💬 Falar com um atendente
                </QuickReplyButton>

                <QuickReplyButton
                  onClick={() => {
                    setIsOpen(false);
                    startTour();
                  }}
                >
                  🧭 Fazer Tour Guiado na Loja
                </QuickReplyButton>
              </div>
            )}

            {/* =================================================================
             * INTERAÇÃO 4 — FINALIZADO / CONTINUAR NO WHATSAPP DA UNIDADE
             * ================================================================= */}
            {step === 'FINISHED' && !isTyping && (
              <div className="pl-[38px] pr-1 space-y-1.5 pt-0.5 animate-in fade-in duration-150">
                <a
                  className="w-full rounded-[10px] bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] font-semibold text-[13px] py-2.5 px-3 text-center shadow-[0_1px_2px_rgba(17,27,33,0.16)] transition-colors cursor-pointer flex items-center justify-center gap-2"
                  href={finalWhatsAppUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span>Abrir WhatsApp — {selectedStore.shortTitle}</span>
                </a>

                <QuickReplyButton onClick={() => setStep('UNIT_LIST')}>
                  🏬 Alterar unidade selecionada
                </QuickReplyButton>
              </div>
            )}

            {/* PAINEL DE ENDEREÇOS E HORÁRIOS REAIS INTEGRADO À CONVERSA */}
            {storeInfoVisible && (
              <div className="flex items-start gap-2 max-w-[92%] animate-in fade-in duration-150">
                <NortAvatar alt="Nort" size={30} />
                <div className="relative rounded-[10px] rounded-tl-none bg-[#F1F3F4] p-3 text-[12px] text-[#111B21] shadow-[0_1px_1px_rgba(17,27,33,0.12)] border border-[#D1D7DB]/60 leading-relaxed">
                  <p className="font-bold text-[#075844] mb-1">
                    📍 Nossas Unidades em Belém e Região:
                  </p>
                  <ul className="space-y-1.5 text-[11.5px] text-[#111B21]">
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
                  <p className="mt-2 text-[11px] text-[#667781]">
                    Segunda a Sexta: 07h às 19h | Sábado: 07h às 13h
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RODAPÉ ADAPTATIVO CONFORME A ETAPA DA CONVERSA (SEÇÃO 7) */}
          <footer className="bg-[#F1F3F4] px-2.5 py-2 border-t border-[#D1D7DB] shrink-0">
            {step === 'UNIT_MODE' || step === 'UNIT_LIST' || step === 'SERVICE' ? (
              <div className="flex items-center justify-between rounded-full bg-[#FFFFFF] px-3.5 py-2 border border-[#D1D7DB] text-[12px] text-[#667781]">
                <span>Selecione uma das opções acima na conversa</span>
                <button
                  className="text-[11px] font-semibold text-[#00A884] hover:underline cursor-pointer ml-2"
                  onClick={handleStepBack}
                  type="button"
                >
                  Voltar
                </button>
              </div>
            ) : (
              <form className="flex items-center gap-2" onSubmit={handleSendCustomMessage}>
                <input
                  ref={customInputRef}
                  aria-label="Digite sua mensagem para o atendimento"
                  className="flex-1 rounded-full bg-[#FFFFFF] px-4 py-2 text-[13px] text-[#111B21] placeholder-[#667781] border border-[#D1D7DB] focus:outline-none focus:border-[#00A884]"
                  onChange={(e) => setCustomMessageText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  type="text"
                  value={customMessageText}
                />
                <button
                  aria-label="Enviar mensagem no WhatsApp"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] transition-colors cursor-pointer disabled:opacity-50"
                  disabled={!customMessageText.trim()}
                  type="submit"
                >
                  <Send className="size-4 ml-0.5" />
                </button>
              </form>
            )}
          </footer>
        </section>
      )}
    </>
  );
}
