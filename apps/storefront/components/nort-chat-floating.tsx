'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, CheckCheck, ChevronDown, Minimize2, RotateCcw, Send, X } from 'lucide-react';
import {
  COMMERCIAL_STORES,
  CommercialStore,
  DEFAULT_STORE,
  buildWhatsAppLink,
  findNearestStoreByCep,
  findNearestStoreByCoords,
  findStoreById,
  findTopNearestStores,
  formatBrazilPhoneMask,
  formatCepMask,
  type StoreWithDistance,
} from '../lib/stores-data';
import {
  DEFAULT_LOCATION,
  cleanCep,
  detectLocationByIp,
  getStoredLocation,
  lookupLocationByCep,
  reverseGeocodeCoordinates,
  saveStoredLocation,
  type UserLocation,
} from '../lib/location';
import { useOptionalUserLocation } from './location-provider';
import { useNortTour } from './tour';

export type NortChatFloatingProps = {
  whatsapp?: string | null;
  phone?: string | null;
  previewDelayMs?: number;
  previewDurationMs?: number;
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
  | 'RESUME_PROMPT'
  | 'UNIT_MODE'
  | 'UNIT_NEARBY_CHOICE'
  | 'UNIT_CEP'
  | 'UNIT_LIST'
  | 'SERVICE'
  | 'FINISHED'
  | 'EDIT_DATA';

export const NORT_SESSION_STORAGE_KEY = 'cn_nort_chat_session_v1';
export const NORT_VISITOR_COOKIE_KEY = 'cn_nort_visitor_id';

export type StoredNortSession = {
  publicId: string;
  step: BotStep;
  customerName: string;
  customerPhone: string;
  selectedStoreId: string;
  chosenSubject: string;
  messages: ChatMessage[];
  updatedAt: number;
};

function getOrCreateVisitorPublicId(): string {
  if (typeof window === 'undefined') return 'lead-ssr';
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${NORT_VISITOR_COOKIE_KEY}=([^;]*)`));
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    const existingRaw = window.localStorage.getItem(NORT_SESSION_STORAGE_KEY);
    if (existingRaw) {
      const parsed = JSON.parse(existingRaw);
      if (parsed && typeof parsed.publicId === 'string' && parsed.publicId) {
        return parsed.publicId;
      }
    }
  } catch {
    // Ignora erro de leitura
  }

  const generated = `lead-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  try {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${NORT_VISITOR_COOKIE_KEY}=${encodeURIComponent(generated)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    // Ignora erro de cookie
  }
  return generated;
}

function loadStoredNortSession(): StoredNortSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(NORT_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredNortSession;
    if (
      parsed &&
      Array.isArray(parsed.messages) &&
      parsed.messages.length > 0 &&
      typeof parsed.customerName === 'string' &&
      parsed.customerName.trim().length >= 2
    ) {
      return parsed;
    }
  } catch {
    // Ignora erro de JSON
  }
  return null;
}

function saveStoredNortSession(session: StoredNortSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NORT_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignora erro de quota
  }
  if (session.publicId) {
    try {
      const maxAge = 60 * 60 * 24 * 365;
      document.cookie = `${NORT_VISITOR_COOKIE_KEY}=${encodeURIComponent(session.publicId)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } catch {
      // Ignora erro de cookie
    }
  }
}

function clearStoredNortSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(NORT_SESSION_STORAGE_KEY);
  } catch {
    // Ignora
  }
}

const WELCOME_MSG_1 = 'Olá! 👋 Eu sou o Nort, assistente virtual da Comercial do Norte!';
const WELCOME_MSG_2 = 'Para começar, me conta: qual é o seu nome e número do WhatsApp?';

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
      className="flex items-end gap-2 max-w-[85%] animate-in fade-in duration-200"
    >
      <NortAvatar alt="Nort digitando" size={30} />
      <div className="relative rounded-[10px] rounded-tl-none bg-[#F1F3F4] px-3.5 py-2.5 shadow-[0_1px_1px_rgba(17,27,33,0.12)] border border-[#D1D7DB]/60">
        {/* Rabicho superior esquerdo no padrão WhatsApp */}
        <span
          aria-hidden="true"
          className="absolute -left-[6px] top-0 w-0 h-0 border-t-[8px] border-t-[#F1F3F4] border-l-[6px] border-l-transparent"
        />
        <div className="flex items-center gap-1.5 py-1 px-0.5">
          <span className="wa-typing-dot" />
          <span className="wa-typing-dot" />
          <span className="wa-typing-dot" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  showAvatar,
  showTail,
}: {
  message: ChatMessage;
  showAvatar: boolean;
  showTail: boolean;
}) {
  const isBot = message.sender === 'bot';

  if (isBot) {
    return (
      <div className="flex items-end gap-2 max-w-[90%] animate-in fade-in duration-200">
        {showAvatar ? (
          <NortAvatar alt="Nort" size={30} />
        ) : (
          <div aria-hidden="true" className="w-[30px] shrink-0" />
        )}
        <div
          className={`relative bg-[#F1F3F4] text-[#111B21] rounded-[10px] ${
            showTail ? 'rounded-tl-none' : ''
          } px-3 pt-2 pb-1.5 shadow-[0_1px_1px_rgba(17,27,33,0.12)] border border-[#D1D7DB]/50 text-[13px] leading-[1.42]`}
        >
          {showTail && (
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
    <div className="flex justify-end w-full animate-in fade-in duration-200">
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
 * CÁLCULO DE TEMPO DE DIGITAÇÃO HUMANO, LENTO E NATURAL (2 A 4 SEGUNDOS)
 * ============================================================================ */

function calculateHumanTypingMs(text: string, index: number): number {
  // Ritmo humano realista, calmo e lento (estritamente entre 2.4s e 3.8s por mensagem)
  const charCount = text.trim().length;
  const baseMs = 2350 + Math.min(1000, charCount * 16);
  const naturalCadence = ((charCount * 41 + index * 170) % 380);
  return Math.min(3850, Math.max(2400, baseMs + naturalCadence));
}

/* ============================================================================
 * COMPONENTE PRINCIPAL — CHAT DO NORT (ESTILO WHATSAPP CONVERSACIONAL GUIADO)
 * ============================================================================ */

export function NortChatFloating({
  whatsapp,
  phone,
  previewDelayMs,
  previewDurationMs,
}: NortChatFloatingProps) {
  const { startTour } = useNortTour();
  const optionalLocationCtx = useOptionalUserLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTypedText, setPreviewTypedText] = useState('');
  const [isPreviewTyping, setIsPreviewTyping] = useState(false);

  const previewDelay = previewDelayMs ?? 15000;
  const previewDuration = previewDurationMs ?? 10000;
  const PREVIEW_FULL_TEXT =
    'Oi! Precisa de ajuda com cotação ou produtos? Fala comigo! 👋';

  // Etapas e estado do atendimento
  const [visitorPublicId, setVisitorPublicId] = useState<string>('lead-init');
  const [step, setStep] = useState<BotStep>('IDENTIFY');
  const [isTyping, setIsTyping] = useState(false);
  const [interactiveReady, setInteractiveReady] = useState(false);
  const [hasInitializedIntro, setHasInitializedIntro] = useState(false);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);

  // Dados do cliente e escolhas
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [cepInput, setCepInput] = useState('');
  const [cepError, setCepError] = useState('');
  const [pendingStoreId, setPendingStoreId] = useState<string>(DEFAULT_STORE.id);
  const [selectedStore, setSelectedStore] = useState<CommercialStore>(DEFAULT_STORE);
  const [autoSuggestedStore, setAutoSuggestedStore] = useState<CommercialStore>(DEFAULT_STORE);
  const [nearbyStores, setNearbyStores] = useState<StoreWithDistance[]>([]);
  const [previousSession, setPreviousSession] = useState<StoredNortSession | null>(null);
  const [chosenSubject, setChosenSubject] = useState('');
  const [customMessageText, setCustomMessageText] = useState('');
  const [storeInfoVisible, setStoreInfoVisible] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Histórico de mensagens
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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

  function clearScheduledTimers() {
    timersRef.current.forEach((t) => {
      window.clearTimeout(t);
      window.clearInterval(t);
    });
    timersRef.current = [];
  }

  // Popup do balão do Nort após 15s com efeito digitando e fechamento automático em 10s
  useEffect(() => {
    if (isOpen || bubbleDismissed) {
      setPreviewVisible(false);
      setIsPreviewTyping(false);
      return;
    }

    const popTimer = window.setTimeout(() => {
      if (isOpen || bubbleDismissed) return;
      setPreviewVisible(true);
      setIsPreviewTyping(true);
      setPreviewTypedText('');

      let charIndex = 0;
      const typeInterval = window.setInterval(() => {
        charIndex += 2;
        if (charIndex >= PREVIEW_FULL_TEXT.length) {
          setPreviewTypedText(PREVIEW_FULL_TEXT);
          setIsPreviewTyping(false);
          window.clearInterval(typeInterval);
        } else {
          setPreviewTypedText(PREVIEW_FULL_TEXT.slice(0, charIndex));
        }
      }, 35);

      timersRef.current.push(typeInterval as unknown as number);

      const autoCloseTimer = window.setTimeout(() => {
        setPreviewVisible(false);
        setBubbleDismissed(true);
      }, previewDuration);

      timersRef.current.push(autoCloseTimer as unknown as number);
    }, previewDelay);

    timersRef.current.push(popTimer as unknown as number);

    return () => {
      window.clearTimeout(popTimer);
    };
  }, [isOpen, bubbleDismissed, previewDelay, previewDuration]);

  useEffect(() => {
    return () => {
      clearScheduledTimers();
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

  // Trava a rolagem (scroll) da página inteira enquanto o chat estiver aberto
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!isOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isOpen]);

  function getFormattedTime() {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Simulação realista e lenta de digitação humana (2 a 4 segundos por mensagem):
   * - O indicador de digitação (...) e status "digitando..." ativam IMEDIATAMENTE no início.
   * - Cada mensagem permanece em digitação por 2.4s a 3.8s.
   * - Ao entregar a mensagem, ocorre pausa natural de respiração (750ms).
   * - Antes de exibir o formulário ou botões interativos, o indicador de digitação volta por ~2.0s.
   */
  function scheduleBotSequence(
    texts: string[],
    options?: {
      withInteractiveWidget?: boolean;
      onSequenceComplete?: () => void;
    }
  ) {
    clearScheduledTimers();
    setInteractiveReady(false);
    // Ativa status "digitando..." e o balão dos três pontinhos IMEDIATAMENTE
    setIsTyping(true);

    let elapsed = 0;

    texts.forEach((text, index) => {
      // Se for a partir da 2ª mensagem, há uma pausa de respiração antes de retomar a digitação
      if (index > 0) {
        const pauseBeforeTyping = 750;
        elapsed += pauseBeforeTyping;

        const startTypingTimer = window.setTimeout(() => {
          setIsTyping(true);
        }, elapsed);
        timersRef.current.push(startTypingTimer);
      }

      const typingDuration = calculateHumanTypingMs(text, index);
      elapsed += typingDuration;

      const deliverMsgTimer = window.setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
            sender: 'bot',
            text,
            time: getFormattedTime(),
          },
        ]);
      }, elapsed);
      timersRef.current.push(deliverMsgTimer);
    });

    // Antes de exibir o bloco interativo (formulário ou opções), mostra digitação por ~2s
    if (options?.withInteractiveWidget !== false) {
      const pauseBeforeWidgetTyping = 600;
      elapsed += pauseBeforeWidgetTyping;

      const startWidgetTypingTimer = window.setTimeout(() => {
        setIsTyping(true);
      }, elapsed);
      timersRef.current.push(startWidgetTypingTimer);

      const widgetTypingDuration = 2000;
      elapsed += widgetTypingDuration;

      const showWidgetTimer = window.setTimeout(() => {
        setIsTyping(false);
        setInteractiveReady(true);
        options?.onSequenceComplete?.();
      }, elapsed);
      timersRef.current.push(showWidgetTimer);
    } else {
      const completeTimer = window.setTimeout(() => {
        setInteractiveReady(true);
        options?.onSequenceComplete?.();
      }, elapsed);
      timersRef.current.push(completeTimer);
    }
  }

  // Restaura sessão salva do cliente (localStorage / cookie / banco CRM) ao montar no navegador
  useEffect(() => {
    const pubId = getOrCreateVisitorPublicId();
    setVisitorPublicId(pubId);

    const localSession = loadStoredNortSession();
    if (localSession && localSession.customerName?.trim().length >= 2) {
      setPreviousSession(localSession);
      setCustomerName(localSession.customerName);
      setCustomerPhone(localSession.customerPhone || '');
      setSelectedStore(findStoreById(localSession.selectedStoreId));
      setPendingStoreId(localSession.selectedStoreId || DEFAULT_STORE.id);
      setChosenSubject(localSession.chosenSubject || '');
      setHasRestoredSession(true);
      return;
    }

    // Caso o localStorage tenha sido limpo mas o cookie da sessão (publicId) exista no banco CRM, restaura do backend!
    if (typeof window !== 'undefined' && document.cookie.includes(NORT_VISITOR_COOKIE_KEY)) {
      void fetch(`/api/v1/crm/leads/session?publicId=${encodeURIComponent(pubId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.found && data.lead && data.lead.customerName) {
            const lead = data.lead;
            const restoredStore = findStoreById(lead.storeId);
            const rawLog = Array.isArray(lead.conversationLog) ? lead.conversationLog : [];
            const mappedMessages: ChatMessage[] =
              rawLog.length > 0
                ? rawLog.map((m: any, idx: number) => ({
                    id: m.id || `restored-${idx}`,
                    sender: m.sender === 'user' ? 'user' : 'bot',
                    text: String(m.text || ''),
                    time: String(m.timestamp || m.time || 'Agora'),
                  }))
                : [];

            const backendSession: StoredNortSession = {
              publicId: lead.publicId || pubId,
              step: 'SERVICE',
              customerName: lead.customerName,
              customerPhone: lead.customerPhone || '',
              selectedStoreId: restoredStore.id,
              chosenSubject: lead.subject || '',
              messages: mappedMessages,
              updatedAt: Date.now(),
            };

            setPreviousSession(backendSession);
            setCustomerName(lead.customerName);
            setCustomerPhone(lead.customerPhone || '');
            setSelectedStore(restoredStore);
            setPendingStoreId(restoredStore.id);
            setChosenSubject(lead.subject || '');
            setHasRestoredSession(true);
          }
        })
        .catch(() => {
          // Ignora falha de rede
        });
    }
  }, []);

  // Salva automaticamente o histórico e progresso da conversa no localStorage sempre que o usuário já se identificou
  useEffect(() => {
    if (!customerName || customerName.trim().length < 2) return;
    if (messages.length === 0 || step === 'RESUME_PROMPT') return;

    saveStoredNortSession({
      publicId: visitorPublicId || getOrCreateVisitorPublicId(),
      step,
      customerName: customerName.trim(),
      customerPhone,
      selectedStoreId: selectedStore.id,
      chosenSubject,
      messages,
      updatedAt: Date.now(),
    });
  }, [visitorPublicId, step, customerName, customerPhone, selectedStore, chosenSubject, messages]);

  // Ao abrir o chat pela primeira vez:
  // Se for visitante de retorno: abre limpo com boas-vindas acolhedora e opções de continuar ou novo atendimento!
  // Se for novo visitante: inicia identificação guiada
  useEffect(() => {
    if (!isOpen || hasInitializedIntro) return;

    setHasInitializedIntro(true);

    const saved = previousSession || loadStoredNortSession();
    if (saved && saved.customerName?.trim().length >= 2 && saved.messages?.length > 0) {
      setPreviousSession(saved);
      setCustomerName(saved.customerName);
      setCustomerPhone(saved.customerPhone || '');
      setStep('RESUME_PROMPT');
      setMessages([]);
      scheduleBotSequence(
        [
          `Oi, ${saved.customerName}! 👋 Bem-vindo(a) de volta!`,
          'Como posso te ajudar agora?',
        ],
        { withInteractiveWidget: true }
      );
      return;
    }

    setStep('IDENTIFY');
    setMessages([]);
    scheduleBotSequence([WELCOME_MSG_1, WELCOME_MSG_2], { withInteractiveWidget: true });
  }, [isOpen, hasInitializedIntro, previousSession]);

  useEffect(() => {
    if (isOpen) {
      const scrollTimer = window.setTimeout(() => {
        if (chatBodyRef.current && typeof chatBodyRef.current.scrollTo === 'function') {
          chatBodyRef.current.scrollTo({
            top: chatBodyRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
        if (!isTyping && interactiveReady) {
          if (step === 'IDENTIFY') {
            nameInputRef.current?.focus();
          } else if (step === 'UNIT_CEP') {
            cepInputRef.current?.focus();
          } else if (step === 'FINISHED') {
            customInputRef.current?.focus();
          }
        }
      }, 60);
      return () => window.clearTimeout(scrollTimer);
    }
  }, [isOpen, messages, isTyping, interactiveReady, step, storeInfoVisible]);

  async function registerLeadToCRM(leadData: {
    name: string;
    phone: string;
    store: CommercialStore;
    subject: string;
    allMessages: ChatMessage[];
  }) {
    const activePublicId = visitorPublicId || getOrCreateVisitorPublicId();
    try {
      await fetch('/api/v1/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicId: activePublicId,
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
      quotedText: WELCOME_MSG_2,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setStep('UNIT_MODE');

    // Já registra a identificação inicial do lead na sessão do CRM para nunca perder o contato
    void registerLeadToCRM({
      name: cleanName,
      phone: formattedPhone,
      store: selectedStore,
      subject: 'Em atendimento inicial no chat',
      allMessages: nextMessages,
    });

    scheduleBotSequence(
      [
        `Prazer, ${cleanName}! 😊`,
        'Agora me diz: em qual unidade da Comercial do Norte você gostaria de ser atendido?',
      ],
      { withInteractiveWidget: true }
    );
  }

  /* ============================================================================
   * ETAPA 2 — ESCOLHA DA UNIDADE (LOCALIZAÇÃO AUTOMÁTICA GPS + IP MAGALU, CEP OU LISTA)
   * ============================================================================ */
  function syncHeaderLocation(loc: UserLocation) {
    if (optionalLocationCtx) {
      optionalLocationCtx.setLocation(loc);
    } else {
      saveStoredLocation(loc);
    }
  }

  async function resolveSmartFallbackLocation(): Promise<{
    store: CommercialStore;
    regionLabel: string;
    hasSpecificLocation: boolean;
  }> {
    // 1. Verifica se o usuário já possui uma localização salva no cabeçalho / localStorage
    const currentHeaderLoc = optionalLocationCtx?.location || getStoredLocation();
    if (currentHeaderLoc && currentHeaderLoc.source && currentHeaderLoc.source !== 'default') {
      const store =
        typeof currentHeaderLoc.lat === 'number' && typeof currentHeaderLoc.lng === 'number'
          ? findNearestStoreByCoords(currentHeaderLoc.lat, currentHeaderLoc.lng)
          : findNearestStoreByCep(currentHeaderLoc.cep || '66020-600');
      const regionLabel =
        currentHeaderLoc.neighborhood && currentHeaderLoc.city
          ? `${currentHeaderLoc.neighborhood}, ${currentHeaderLoc.city}/${currentHeaderLoc.state}`
          : currentHeaderLoc.shortLabel || `${currentHeaderLoc.city}/${currentHeaderLoc.state}`;
      return { store, regionLabel, hasSpecificLocation: true };
    }

    // 2. Consulta automaticamente a localização por IP (igual Magazine Luiza quando abre o site)
    const ipLoc = await detectLocationByIp();
    if (ipLoc) {
      syncHeaderLocation(ipLoc);
      const store =
        typeof ipLoc.lat === 'number' && typeof ipLoc.lng === 'number'
          ? findNearestStoreByCoords(ipLoc.lat, ipLoc.lng)
          : findNearestStoreByCep(ipLoc.cep || '66020-600');
      return {
        store,
        regionLabel: ipLoc.shortLabel || `Região de ${ipLoc.city}/${ipLoc.state}`,
        hasSpecificLocation: true,
      };
    }

    // 3. Fallback usando a localização padrão do cabeçalho (Belém/PA)
    const fallbackLoc = currentHeaderLoc || DEFAULT_LOCATION;
    const store = findNearestStoreByCep(fallbackLoc.cep || '66093-005');
    return {
      store,
      regionLabel: fallbackLoc.shortLabel || 'Região de Belém/PA',
      hasSpecificLocation: Boolean(currentHeaderLoc),
    };
  }

  function handleResumePreviousConversation() {
    if (!previousSession) return;
    const restoredStore = findStoreById(previousSession.selectedStoreId);
    setSelectedStore(restoredStore);
    setPendingStoreId(restoredStore.id);
    setChosenSubject(previousSession.chosenSubject || '');
    setMessages(previousSession.messages);
    const targetStep =
      previousSession.step === 'IDENTIFY' || previousSession.step === 'RESUME_PROMPT'
        ? 'SERVICE'
        : previousSession.step;
    setStep(targetStep);
    setIsTyping(false);
    setInteractiveReady(true);
  }

  function handleStartNewAttendance() {
    if (isTyping) return;
    const name = customerName || previousSession?.customerName || 'visitante';
    const userMsg: ChatMessage = {
      id: `user-new-att-${Date.now()}`,
      sender: 'user',
      text: '🆕 Iniciar novo atendimento',
      time: getFormattedTime(),
      quotedText: 'Como posso te ajudar agora?',
    };
    setMessages([userMsg]);
    setStep('UNIT_MODE');

    scheduleBotSequence(
      [
        `Combinado, ${name}! 😊`,
        'Em qual unidade da Comercial do Norte você prefere ser atendido hoje?',
      ],
      { withInteractiveWidget: true }
    );
  }

  async function handleFindNearestUnit() {
    if (isTyping) return;

    // Detecta rótulo de localização para a mensagem do usuário (ex: Pedreira, Belém - PA)
    const currentLoc = optionalLocationCtx?.location || getStoredLocation();
    let locationText = '';
    if (currentLoc?.neighborhood && currentLoc?.city) {
      locationText = ` (estou no bairro da ${currentLoc.neighborhood}, ${currentLoc.city} - ${currentLoc.state})`;
    } else if (currentLoc?.city) {
      locationText = ` (estou em ${currentLoc.city}/${currentLoc.state})`;
    }

    const userMsg: ChatMessage = {
      id: `user-near-${Date.now()}`,
      sender: 'user',
      text: `📍 A mais próxima de mim${locationText}`,
      time: getFormattedTime(),
      quotedText: 'Agora me diz: em qual unidade da Comercial do Norte você gostaria de ser atendido?',
    };
    setMessages((prev) => [...prev, userMsg]);

    // Resposta imediata do Nort dizendo que vai verificar
    const waitMsg: ChatMessage = {
      id: `bot-wait-${Date.now()}`,
      sender: 'bot',
      text: 'Ah sim! Deixa eu verificar um momentinho... 🔍',
      time: getFormattedTime(),
    };
    setMessages((prev) => [...prev, waitMsg]);
    setIsTyping(true);
    setInteractiveReady(false);

    let targetLat = currentLoc?.lat ?? DEFAULT_LOCATION.lat ?? -1.4558;
    let targetLng = currentLoc?.lng ?? DEFAULT_LOCATION.lng ?? -48.4902;
    let neighborhoodName = currentLoc?.neighborhood || '';

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition | null>((resolve) => {
          const timeoutFallback = window.setTimeout(() => resolve(null), 1200);
          try {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                window.clearTimeout(timeoutFallback);
                resolve(pos);
              },
              () => {
                window.clearTimeout(timeoutFallback);
                resolve(null);
              },
              { timeout: 3000, enableHighAccuracy: false }
            );
          } catch {
            window.clearTimeout(timeoutFallback);
            resolve(null);
          }
        });

        if (position) {
          targetLat = position.coords.latitude;
          targetLng = position.coords.longitude;
          const reverse = await reverseGeocodeCoordinates(targetLat, targetLng);
          if (reverse) {
            syncHeaderLocation(reverse);
            if (reverse.neighborhood) {
              neighborhoodName = reverse.neighborhood;
            }
          }
        }
      } catch {
        // Fallback
      }
    }

    // Calcula as 2 lojas mais próximas com a distância em km!
    const topStores = findTopNearestStores(targetLat, targetLng, 2);
    setNearbyStores(topStores);

    // Delay humano e natural de verificação (2.6s)
    window.setTimeout(() => {
      setIsTyping(false);
      setStep('UNIT_NEARBY_CHOICE');

      const introText = neighborhoodName
        ? `Olha, a unidade mais próxima de você tem estas opções aqui perto do bairro ${neighborhoodName}:`
        : 'Olha, a unidade mais próxima de você tem estas opções:';

      scheduleBotSequence([introText], { withInteractiveWidget: true });
    }, 2600);
  }

  function handleSelectNearbyStore(store: StoreWithDistance | CommercialStore) {
    if (isTyping) return;
    setSelectedStore(store);

    const userMsg: ChatMessage = {
      id: `user-choose-${Date.now()}`,
      sender: 'user',
      text: `🏪 ${store.shortTitle}`,
      time: getFormattedTime(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setStep('SERVICE');

    void registerLeadToCRM({
      name: customerName || 'Cliente Site',
      phone: customerPhone || '(91) 98344-0880',
      store,
      subject: `Atendimento direcionado para ${store.shortTitle}`,
      allMessages: nextMessages,
    });

    scheduleBotSequence(
      [
        `Bacana, ${customerName || 'visitante'}! 💙 A partir daqui o seu atendimento é direcionado para a ${store.shortTitle} (${store.address}).`,
        'Agora me conta: como podemos te ajudar hoje?',
      ],
      { withInteractiveWidget: true }
    );
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

    scheduleBotSequence(
      ['Claro! Selecione abaixo em qual das nossas unidades você prefere ser atendido:'],
      { withInteractiveWidget: true }
    );
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

    if (digits.length === 8) {
      void lookupLocationByCep(digits)
        .then((loc) => syncHeaderLocation(loc))
        .catch(() => {
          // Ignora falha de CEP externo
        });
    }

    const userMsg: ChatMessage = {
      id: `user-cep-${Date.now()}`,
      sender: 'user',
      text: `CEP: ${formattedCep} (${nearest.shortTitle})`,
      time: getFormattedTime(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setSelectedStore(nearest);
    setStep('SERVICE');

    void registerLeadToCRM({
      name: customerName || 'Cliente Site',
      phone: customerPhone || '(91) 98344-0880',
      store: nearest,
      subject: `Unidade escolhida por CEP (${formattedCep})`,
      allMessages: nextMessages,
    });

    scheduleBotSequence(
      [
        `Perfeito, ${customerName || 'visitante'}! 💙 Identifiquei a ${nearest.shortTitle} como a mais próxima.`,
        'Agora me conta, como posso te ajudar hoje?',
      ],
      { withInteractiveWidget: true }
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
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setStep('SERVICE');

    void registerLeadToCRM({
      name: customerName || 'Cliente Site',
      phone: customerPhone || '(91) 98344-0880',
      store,
      subject: `Unidade selecionada (${store.shortTitle})`,
      allMessages: nextMessages,
    });

    if (customPrefix) {
      scheduleBotSequence(
        [
          customPrefix,
          `Perfeito, ${customerName || 'visitante'}! 💙`,
          'Agora me conta, como posso te ajudar hoje?',
        ],
        { withInteractiveWidget: true }
      );
    } else {
      scheduleBotSequence(
        [
          `Perfeito, ${customerName || 'visitante'}! 💙`,
          'Agora me conta, como posso te ajudar hoje?',
        ],
        { withInteractiveWidget: true }
      );
    }
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

    scheduleBotSequence(
      [
        `Tudo certo, ${customerName || 'visitante'}! Já preparei seu atendimento para a ${selectedStore.shortTitle}.`,
        'Se a janela do WhatsApp não abriu automaticamente, toque no botão abaixo ou envie uma mensagem adicional:',
      ],
      { withInteractiveWidget: true }
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
        text: '📍 Ver endereço e horários de funcionamento',
        time: getFormattedTime(),
      };
      setMessages((prev) => [...prev, userMsg]);
    }
  }

  function handleSiteCepHelp() {
    if (isTyping) return;
    const userMsg: ChatMessage = {
      id: `user-cep-help-${Date.now()}`,
      sender: 'user',
      text: '📍 Quero ajuda para mudar meu CEP de entrega',
      time: getFormattedTime(),
      quotedText: 'Agora me conta: como podemos te ajudar hoje?',
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('UNIT_CEP');

    scheduleBotSequence(
      [
        'Com certeza! Você pode atualizar seu CEP a qualquer momento para recalcularmos prazos e entregas para a sua região.',
        'Informe seu CEP abaixo ou continue navegando com a unidade atual:',
      ],
      { withInteractiveWidget: true }
    );
  }

  function handleSiteLoginHelp() {
    if (isTyping) return;
    const userMsg: ChatMessage = {
      id: `user-login-help-${Date.now()}`,
      sender: 'user',
      text: '🔑 Esqueci meu login ou senha da minha conta',
      time: getFormattedTime(),
      quotedText: 'Agora me conta: como podemos te ajudar hoje?',
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('FINISHED');
    setChosenSubject('Recuperação de login e senha');

    scheduleBotSequence(
      [
        'Sem problemas! Para recuperar sua senha, acesse "Entre ou Cadastre-se" no topo do site e clique em "Esqueci minha senha" informando seu e-mail cadastrado.',
        'Se você preferir que nossa equipe verifique seu cadastro manualmente, toque no botão do WhatsApp abaixo!',
      ],
      { withInteractiveWidget: true }
    );
  }

  function handleCatalogHelp() {
    if (isTyping) return;
    const userMsg: ChatMessage = {
      id: `user-catalog-help-${Date.now()}`,
      sender: 'user',
      text: '🛍️ Como faço para consultar produtos no catálogo?',
      time: getFormattedTime(),
      quotedText: 'Agora me conta: como podemos te ajudar hoje?',
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('FINISHED');
    setChosenSubject('Consulta de produtos no catálogo');

    scheduleBotSequence(
      [
        'Você pode navegar pelos departamentos no menu superior (Confeitaria, Descartáveis, Embalagens, etc.) ou buscar pelo nome do produto na barra de pesquisa no topo.',
        'Todos os itens possuem botão direto "Adicionar à Cotação". Se preferir, nosso vendedor no WhatsApp pode montar o pedido para você!',
      ],
      { withInteractiveWidget: true }
    );
  }

  function handleQuoteIssueHelp() {
    if (isTyping) return;
    const userMsg: ChatMessage = {
      id: `user-quote-issue-${Date.now()}`,
      sender: 'user',
      text: '⚠️ Não consigo adicionar itens à cotação',
      time: getFormattedTime(),
      quotedText: 'Agora me conta: como podemos te ajudar hoje?',
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('FINISHED');
    setChosenSubject('Dúvidas com Lista de Cotação');

    scheduleBotSequence(
      [
        'Poxa, vamos resolver isso já! Verifique se seu navegador está com cookies habilitados ou se a quantidade mínima do item foi selecionada.',
        'Se preferir, envie os produtos diretamente para a equipe da loja pelo WhatsApp:',
      ],
      { withInteractiveWidget: true }
    );
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
      setInteractiveReady(true);
    } else if (step === 'UNIT_LIST' || step === 'UNIT_CEP') {
      setStep('UNIT_MODE');
      setInteractiveReady(true);
    } else if (step === 'SERVICE') {
      setExpandedCategory(null);
      setStep('UNIT_MODE');
      setInteractiveReady(true);
    } else if (step === 'FINISHED') {
      setExpandedCategory(null);
      setStep('SERVICE');
      setInteractiveReady(true);
    } else if (step === 'EDIT_DATA') {
      setExpandedCategory(null);
      setStep('SERVICE');
      setInteractiveReady(true);
    }
  }

  function handleOpenEditData() {
    if (isTyping) return;
    setEditName(customerName);
    setEditPhone(customerPhone);
    setFormError('');
    setStep('EDIT_DATA');
    setInteractiveReady(true);
  }

  function handleSaveEditedData(e: React.FormEvent) {
    e.preventDefault();
    if (isTyping) return;

    const cleanName = editName.trim();
    const phoneDigits = editPhone.replace(/\D/g, '');

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
      id: `user-edit-${Date.now()}`,
      sender: 'user',
      text: `✏️ Dados atualizados:\n${cleanName}\n📱 ${formattedPhone}`,
      time: getFormattedTime(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setStep('SERVICE');

    // Atualiza o MESMO lead no MiniCRM pelo visitorPublicId (não duplica no Kanban!)
    void registerLeadToCRM({
      name: cleanName,
      phone: formattedPhone,
      store: selectedStore,
      subject: chosenSubject || 'Atualização cadastral no chat',
      allMessages: nextMessages,
    });

    scheduleBotSequence(
      [
        `Prontinho, ${cleanName}! Seus dados foram atualizados com sucesso. 😊`,
        'Como posso te ajudar agora?',
      ],
      { withInteractiveWidget: true }
    );
  }

  function handleRestartChat() {
    clearScheduledTimers();
    clearStoredNortSession();
    setStep('IDENTIFY');
    setExpandedCategory(null);
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
    setMessages([]);
    setInteractiveReady(false);
    setHasInitializedIntro(true);
    setHasRestoredSession(false);
    scheduleBotSequence([WELCOME_MSG_1, WELCOME_MSG_2], { withInteractiveWidget: true });
  }

  const finalWhatsAppUrl = buildWhatsAppLink(
    selectedStore.whatsappDigits || whatsappDigits,
    `Olá, equipe Comercial do Norte (${selectedStore.name})!\nMeu nome é: ${customerName || 'Cliente'}\nWhatsApp: ${customerPhone || 'Informado no site'}\nAssunto: ${chosenSubject || 'Atendimento geral'}\nUnidade: ${selectedStore.shortTitle}`
  );

  const serviceCategories = [
    {
      id: 'atendimento',
      icon: '💬',
      title: 'Atendimento & Setores',
      subtitle: 'Atendente humano, setor jurídico, horários',
      items: [
        {
          id: 'atendente-humano',
          label: 'Quero falar com um atendente humano (WhatsApp)',
          icon: '👤',
          onClick: () =>
            handleSelectService(
              '👤 Falar com um atendente',
              'Gostaria de falar com um atendente da Comercial do Norte para tirar dúvidas gerais.'
            ),
        },
        {
          id: 'setor-juridico',
          label: 'Quero falar com o Setor Jurídico (WhatsApp)',
          icon: '⚖️',
          onClick: () =>
            handleSelectService(
              '⚖️ Falar com Setor Jurídico',
              'Preciso de contato com o setor jurídico ou corporativo da Comercial do Norte.'
            ),
        },
        {
          id: 'vendas-whatsapp',
          label: 'Quero falar com Vendas no WhatsApp',
          icon: '💬',
          onClick: () =>
            handleSelectService(
              '💬 Falar com Vendas no WhatsApp',
              'Gostaria de falar com a equipe de vendas da Comercial do Norte para consultar produtos e preços.'
            ),
        },
        {
          id: 'endereco-horarios',
          label: 'Ver endereço e horários de funcionamento',
          icon: '📍',
          onClick: handleShowAddressesInChat,
        },
      ],
    },
    {
      id: 'produtos',
      icon: '📦',
      title: 'Produtos & Cotação',
      subtitle: 'Solicitar cotação, catálogo, pagamento',
      items: [
        {
          id: 'solicitar-cotacao',
          label: 'Quero solicitar uma cotação de produtos',
          icon: '📋',
          onClick: () =>
            handleSelectService(
              '📋 Solicitar uma cotação',
              'Gostaria de solicitar uma cotação de produtos (embalagens, descartáveis, confeitaria).'
            ),
        },
        {
          id: 'como-consultar-produtos',
          label: 'Como faço para consultar produtos no catálogo?',
          icon: '🛍️',
          onClick: handleCatalogHelp,
        },
        {
          id: 'problema-cotacao',
          label: 'Não consigo adicionar itens à cotação',
          icon: '⚠️',
          onClick: handleQuoteIssueHelp,
        },
        {
          id: 'duvidas-pagamento',
          label: 'Preciso tirar dúvidas de faturamento e pagamento',
          icon: '💳',
          onClick: () =>
            handleSelectService(
              '💳 Dúvidas de Faturamento e Pagamento',
              'Gostaria de tirar dúvidas sobre faturamento PJ, prazos de boleto ou formas de pagamento.'
            ),
        },
      ],
    },
    {
      id: 'site',
      icon: '🌐',
      title: 'Site / Loja Virtual',
      subtitle: 'Alterar CEP, login e senha, tour guiado',
      items: [
        {
          id: 'mudar-cep',
          label: 'Quero ajuda para mudar meu CEP de entrega',
          icon: '📍',
          onClick: handleSiteCepHelp,
        },
        {
          id: 'esqueci-login-senha',
          label: 'Esqueci meu login e senha (como recuperar)',
          icon: '🔑',
          onClick: handleSiteLoginHelp,
        },
        {
          id: 'tour-guiado',
          label: 'Fazer tour guiado interativo pela loja',
          icon: '🧭',
          onClick: () => {
            setIsOpen(false);
            startTour();
          },
        },
        {
          id: 'suporte-site',
          label: 'Suporte técnico sobre erro ou navegação no site',
          icon: '🎧',
          onClick: () =>
            handleSelectService(
              '🎧 Suporte da Loja Virtual',
              'Estou precisando de suporte técnico com erro ou navegação na loja virtual.'
            ),
        },
      ],
    },
  ];

  return (
    <>
      {/* 0. BACKDROP ULTRA ESCURO (97%) EM TODA A PÁGINA QUANDO O CHAT ESTÁ ABERTO (FOCO TOTAL NO CHAT E ACIMA DO HEADER) */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[9990] bg-[#01030A]/[0.97] animate-in fade-in duration-200 cursor-pointer"
          data-testid="nort-chat-backdrop"
          onClick={() => setIsOpen(false)}
          style={{ backgroundColor: 'rgba(1, 3, 10, 0.97)' }}
        />
      )}

      {/* 1. BALÃO FLUTUANTE DE PRÉVIA / CONVITE DO NORT (SURGE APÓS 15s COM EFEITO DIGITANDO E FECHA EM 10s) */}
      {!isOpen && !bubbleDismissed && previewVisible && (
        <aside
          aria-label="Convite de atendimento do Norti"
          className="fixed bottom-20 right-4 sm:right-6 z-50 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 max-w-[290px] sm:max-w-[320px]"
        >
          <div className="relative flex items-start gap-2.5 rounded-[12px] bg-[#FFFFFF] p-3 shadow-[0_4px_16px_rgba(17,27,33,0.18)] border border-[#D1D7DB]">
            <NortAvatar alt="Nort Atendente" size={38} />

            <div
              className="flex-1 min-w-0 cursor-pointer text-left"
              onClick={() => {
                setIsOpen(true);
                setPreviewVisible(false);
                setBubbleDismissed(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setIsOpen(true);
                  setPreviewVisible(false);
                  setBubbleDismissed(true);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#111B21]">
                  Nort | Comercial do Norte
                </span>
                <span className="size-2 rounded-full bg-[#00A884] animate-pulse" />
              </div>
              <p className="mt-0.5 text-xs text-[#667781] leading-snug">
                {previewTypedText}
                {isPreviewTyping && (
                  <span
                    aria-hidden="true"
                    className="inline-block w-1 h-3.5 bg-[#00A884] ml-0.5 animate-pulse align-middle"
                  />
                )}
              </p>
            </div>

            <button
              aria-label="Dispensar aviso do Norti"
              className="text-[#667781] hover:text-[#111B21] transition -mr-1 -mt-1 p-1 rounded cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewVisible(false);
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
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]">
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

      {/* 3. JANELA DE CONVERSA WHATSAPP (CORES SÓLIDAS + WALLPAPER CLÁSSICO, ACIMA DE QUALQUER HEADER) */}
      {isOpen && (
        <section
          id={id}
          aria-label="Chat de atendimento com o mascote Norti"
          className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-22 sm:right-6 z-[9995] w-full sm:w-[395px] h-[100dvh] sm:h-[580px] sm:max-h-[calc(100vh-105px)] bg-[#E4D8D3] sm:rounded-[14px] shadow-[0_20px_50px_rgba(0,0,0,0.65)] border border-[#D1D7DB] overflow-hidden flex flex-col animate-in fade-in duration-150"
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
            {/* Tag "Hoje" igual ao Anexo 1 & 2 */}
            <div className="flex justify-center">
              <span className="rounded-[7px] bg-[#FFFFFF] px-2.5 py-0.5 text-[11px] font-medium text-[#667781] shadow-[0_1px_1px_rgba(17,27,33,0.1)] border border-[#D1D7DB]/60">
                Hoje
              </span>
            </div>

            {/* Aviso de criptografia / privacidade LGPD no estilo clássico do WhatsApp */}
            <div className="flex justify-center">
              <div className="rounded-[8px] bg-[#FFF5C4] border border-[#E6DA9E] px-3 py-1.5 text-[11px] text-[#54656F] text-center max-w-[94%] leading-snug shadow-[0_1px_1px_rgba(17,27,33,0.08)]">
                🔒 Suas informações (nome, WhatsApp e localização) são protegidas e usadas apenas para direcionar seu atendimento na Comercial do Norte.
              </div>
            </div>

            {/* HISTÓRICO DE MENSAGENS (COM AGRUPAMENTO ESTILO ANEXOS 2, 3 E 4) */}
            {messages.map((msg, idx) => {
              const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;
              // Avatar aparece na última mensagem consecutiva do Nort (quando não está digitando outra em seguida), igual aos Anexos 2 e 4
              const isLastInBotGroup =
                msg.sender === 'bot' && (!nextMsg || nextMsg.sender !== 'bot') && !isTyping;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  showAvatar={isLastInBotGroup}
                  showTail={msg.sender === 'bot'}
                />
              );
            })}

            {/* INDICADOR DE DIGITAÇÃO (TRÊS PONTINHOS ANIMADOS) */}
            {isTyping && <TypingIndicatorBubble />}

            {/* RETORNO DO CLIENTE — OPÇÕES DE CONTINUAR CONVERSA OU INICIAR NOVO ATENDIMENTO */}
            {step === 'RESUME_PROMPT' && !isTyping && interactiveReady && (
              <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <QuickReplyButton onClick={handleResumePreviousConversation}>
                  💬 Continuar conversa anterior
                </QuickReplyButton>
                <QuickReplyButton onClick={handleStartNewAttendance}>
                  🆕 Iniciar novo atendimento
                </QuickReplyButton>
              </div>
            )}

            {/* =================================================================
             * INTERAÇÃO 1 — FORMULÁRIO INTEGRADO (ANEXO 2 & ANEXO 5)
             * Ocupa a largura limpa da conversa como no Anexo 2, sem barra cinza embaixo!
             * ================================================================= */}
            {step === 'IDENTIFY' && !isTyping && interactiveReady && (
              <div className="pt-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <form
                  aria-label="Identificação rápida para atendimento"
                  className="rounded-[12px] bg-[#FFFFFF] p-3.5 border border-[#D1D7DB] shadow-[0_2px_6px_rgba(17,27,33,0.12)] space-y-2.5"
                  onSubmit={handleIdentifySubmit}
                >
                  <div>
                    <label
                      className="block text-[11.5px] font-semibold text-[#111B21] mb-1"
                      htmlFor={`${id}-name`}
                    >
                      Seu nome
                    </label>
                    <input
                      ref={nameInputRef}
                      id={`${id}-name`}
                      aria-label="Seu nome"
                      className="w-full rounded-[8px] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111B21] placeholder-[#667781] border border-[#D1D7DB] focus:outline-none focus:border-[#00A884]"
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
                      className="block text-[11.5px] font-semibold text-[#111B21] mb-1"
                      htmlFor={`${id}-phone`}
                    >
                      WhatsApp
                    </label>
                    <input
                      id={`${id}-phone`}
                      aria-label="WhatsApp"
                      className="w-full rounded-[8px] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111B21] placeholder-[#667781] border border-[#D1D7DB] focus:outline-none focus:border-[#00A884]"
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
                    className="w-full rounded-[8px] bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] font-semibold text-[13px] py-2.5 px-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    type="submit"
                  >
                    <span>Continuar no chat</span>
                    <Send className="size-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* =================================================================
             * INTERAÇÃO 2 — ESCOLHA DA UNIDADE (BOTÕES DE RESPOSTA RÁPIDA)
             * ================================================================= */}
            {step === 'UNIT_MODE' && !isTyping && interactiveReady && (
              <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <QuickReplyButton onClick={handleFindNearestUnit}>
                  📍 Encontrar a mais próxima de mim
                </QuickReplyButton>
                <QuickReplyButton onClick={handleShowUnitList}>
                  🏬 Escolher uma unidade
                </QuickReplyButton>
              </div>
            )}

            {/* ESCOLHA ENTRE AS UNIDADES MAIS PRÓXIMAS (COM DISTÂNCIA EM KM/METROS) */}
            {step === 'UNIT_NEARBY_CHOICE' && !isTyping && interactiveReady && (
              <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {nearbyStores.map((st) => (
                  <QuickReplyButton
                    key={st.id}
                    onClick={() => handleSelectNearbyStore(st)}
                  >
                    🏪 {st.shortTitle} · a {st.formattedDistance}
                  </QuickReplyButton>
                ))}

                <QuickReplyButton onClick={handleShowUnitList}>
                  🏬 Ver lista completa de todas as unidades
                </QuickReplyButton>

                <QuickReplyButton onClick={() => setStep('UNIT_CEP')}>
                  📮 Digitar outro CEP
                </QuickReplyButton>
              </div>
            )}

            {/* SUB-FLUXO 2A — UNIDADE SUGERIDA AUTOMATICAMENTE (ESTILO MAGALU) + OPÇÃO DE CEP EXATO */}
            {step === 'UNIT_CEP' && !isTyping && interactiveReady && (
              <div className="pt-1 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <QuickReplyButton
                  ariaLabel={`Continuar na ${autoSuggestedStore.shortTitle}`}
                  onClick={() => confirmStoreSelection(autoSuggestedStore)}
                >
                  ✅ Continuar na {autoSuggestedStore.shortTitle}
                </QuickReplyButton>

                <form
                  aria-label="Buscar unidade por CEP"
                  className="rounded-[12px] bg-[#FFFFFF] p-3.5 border border-[#D1D7DB] shadow-[0_2px_6px_rgba(17,27,33,0.12)] space-y-2"
                  onSubmit={handleCepSubmit}
                >
                  <label
                    className="block text-[11.5px] font-semibold text-[#111B21]"
                    htmlFor={`${id}-cep`}
                  >
                    Ou informe seu CEP para localizar pela sua rua exata
                  </label>
                  <input
                    ref={cepInputRef}
                    id={`${id}-cep`}
                    aria-label="Informe seu CEP"
                    className="w-full rounded-[8px] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111B21] placeholder-[#667781] border border-[#D1D7DB] focus:outline-none focus:border-[#00A884]"
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
            {step === 'UNIT_LIST' && !isTyping && interactiveReady && (
              <div className="pt-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="rounded-[12px] bg-[#FFFFFF] border border-[#D1D7DB] shadow-[0_2px_6px_rgba(17,27,33,0.12)] overflow-hidden">
                  <div className="px-3.5 py-2 border-b border-[#D1D7DB] bg-[#F1F3F4]">
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
                          className="flex items-start gap-2.5 px-3.5 py-2 cursor-pointer hover:bg-[#F1F3F4]/60 transition-colors"
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
             * INTERAÇÃO 3 — CATEGORIAS DE ATENDIMENTO ESTILO SANFONA / ACCORDION
             * Reduz a poluição visual: 3 categorias expansíveis (Atendimento, Produtos, Site)
             * ================================================================= */}
            {step === 'SERVICE' && !isTyping && interactiveReady && (
              <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="px-1 text-[11px] font-semibold text-[#54656F] flex items-center justify-between">
                  <span>Sobre o que você precisa de ajuda?</span>
                  <span className="text-[10px] text-[#667781] font-normal">Toque para ver opções</span>
                </div>

                <div className="space-y-1.5">
                  {serviceCategories.map((cat) => {
                    const isExpanded = expandedCategory === cat.id;
                    return (
                      <div
                        key={cat.id}
                        className="rounded-[12px] bg-[#FFFFFF] border border-[#D1D7DB] shadow-[0_1px_2px_rgba(17,27,33,0.08)] overflow-hidden transition-all duration-200"
                      >
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-[#F8F9FA] active:bg-[#F1F3F4] transition-colors cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex size-8 items-center justify-center rounded-full bg-[#E0FBD4] text-[15px] shrink-0 border border-[#C6EDB9]">
                              {cat.icon}
                            </span>
                            <div className="min-w-0">
                              <span className="block text-[13px] font-bold text-[#111B21] truncate">
                                {cat.title}
                              </span>
                              <span className="block text-[11px] text-[#667781] truncate">
                                {cat.subtitle}
                              </span>
                            </div>
                          </div>
                          <ChevronDown
                            className={`size-4.5 text-[#667781] shrink-0 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-[#00A884]' : ''
                            }`}
                          />
                        </button>

                        {/* Subitens da sanfona expandida */}
                        {isExpanded && (
                          <div className="px-2.5 pb-2.5 pt-1 space-y-1.5 border-t border-[#F1F3F4] bg-[#F8FAFC] animate-in fade-in slide-in-from-top-1 duration-150">
                            {cat.items.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={item.onClick}
                                className="w-full rounded-[8px] bg-[#FFFFFF] hover:bg-[#E0FBD4]/70 active:bg-[#E0FBD4] text-[#111B21] hover:text-[#075844] font-medium text-[12px] py-2 px-2.5 text-left border border-[#E2E8F0] shadow-[0_1px_1px_rgba(0,0,0,0.04)] transition-all cursor-pointer flex items-center justify-between gap-2 group"
                              >
                                <span className="flex items-center gap-2 min-w-0">
                                  <span className="text-[13px] shrink-0">{item.icon}</span>
                                  <span className="truncate">{item.label}</span>
                                </span>
                                <span className="text-[10px] text-[#667781] group-hover:text-[#00A884] font-semibold shrink-0">
                                  Acessar ›
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Opção rápida e discreta no rodapé para alterar dados cadastrados */}
                <div className="pt-0.5">
                  <QuickReplyButton onClick={handleOpenEditData}>
                    ✏️ Alterar meus dados (Nome / WhatsApp)
                  </QuickReplyButton>
                </div>
              </div>
            )}

            {/* SUB-FLUXO — EDIÇÃO DE DADOS CADASTRADOS (ATUALIZA O MESMO LEAD NO CRM SEM DUPLICAR) */}
            {step === 'EDIT_DATA' && !isTyping && interactiveReady && (
              <div className="pt-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <form
                  aria-label="Alterar meus dados"
                  className="rounded-[12px] bg-[#FFFFFF] p-3.5 border border-[#D1D7DB] shadow-[0_2px_6px_rgba(17,27,33,0.12)] space-y-2.5"
                  onSubmit={handleSaveEditedData}
                >
                  <div className="flex items-center justify-between border-b border-[#D1D7DB] pb-1.5 mb-1">
                    <span className="text-[12px] font-bold text-[#111B21]">
                      Alterar meus dados
                    </span>
                    <button
                      className="text-[11px] text-[#00A884] font-medium hover:underline cursor-pointer"
                      onClick={() => setStep('SERVICE')}
                      type="button"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div>
                    <label
                      className="block text-[11.5px] font-semibold text-[#111B21] mb-1"
                      htmlFor={`${id}-edit-name`}
                    >
                      Seu nome
                    </label>
                    <input
                      id={`${id}-edit-name`}
                      aria-label="Seu nome"
                      className="w-full rounded-[8px] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111B21] placeholder-[#667781] border border-[#D1D7DB] focus:outline-none focus:border-[#00A884]"
                      onChange={(e) => {
                        setEditName(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder="Como posso te chamar?"
                      type="text"
                      value={editName}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[11.5px] font-semibold text-[#111B21] mb-1"
                      htmlFor={`${id}-edit-phone`}
                    >
                      WhatsApp
                    </label>
                    <input
                      id={`${id}-edit-phone`}
                      aria-label="WhatsApp"
                      className="w-full rounded-[8px] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111B21] placeholder-[#667781] border border-[#D1D7DB] focus:outline-none focus:border-[#00A884]"
                      inputMode="tel"
                      onChange={(e) => {
                        setEditPhone(formatBrazilPhoneMask(e.target.value));
                        if (formError) setFormError('');
                      }}
                      placeholder="(91) 99999-9999"
                      type="tel"
                      value={editPhone}
                    />
                  </div>

                  {formError && (
                    <p className="text-[11px] text-[#B91C1C] font-medium" role="alert">
                      {formError}
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      className="flex-1 rounded-[8px] bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] font-semibold text-[13px] py-2 px-3 text-center transition-colors cursor-pointer"
                      type="submit"
                    >
                      Salvar alterações
                    </button>
                    <button
                      className="rounded-[8px] border border-[#D1D7DB] bg-[#F1F3F4] hover:bg-[#E4D8D3] text-[#111B21] text-[12px] font-medium py-2 px-3 transition-colors cursor-pointer"
                      onClick={() => setStep('SERVICE')}
                      type="button"
                    >
                      Voltar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* =================================================================
             * INTERAÇÃO 4 — FINALIZADO / CONTINUAR NO WHATSAPP DA UNIDADE
             * ================================================================= */}
            {step === 'FINISHED' && !isTyping && interactiveReady && (
              <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
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

                <QuickReplyButton onClick={handleOpenEditData}>
                  ✏️ Alterar meus dados (Nome / WhatsApp)
                </QuickReplyButton>
              </div>
            )}

            {/* PAINEL DE ENDEREÇOS E HORÁRIOS REAIS INTEGRADO À CONVERSA */}
            {storeInfoVisible && (
              <div className="flex items-end gap-2 max-w-[92%] animate-in fade-in duration-150">
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

          {/* RODAPÉ: SÓ APARECE NA ETAPA FINAL DE ATENDIMENTO LIVRE (REMOVIDA A BARRA DO ANEXO 1) */}
          {step === 'FINISHED' && !isTyping && interactiveReady && (
            <footer className="bg-[#F1F3F4] px-2.5 py-2 border-t border-[#D1D7DB] shrink-0">
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
            </footer>
          )}
        </section>
      )}
    </>
  );
}
