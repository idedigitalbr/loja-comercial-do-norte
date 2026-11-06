'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock,
  HelpCircle,
  History,
  MessageSquare,
  PlusCircle,
  Search,
  Send,
  Settings,
  User,
  X,
} from 'lucide-react';
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
import {
  NortTicket,
  TicketEvent,
  TicketEventType,
  formatTicketDateTime,
  formatTicketNumber,
  generateTicketTitle,
  getActiveTicketId,
  groupTicketsChronologically,
  loadStoredTickets,
  saveStoredTickets,
  setActiveTicketId,
} from '../lib/nort-tickets';
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
      role="status"
      aria-label="Nort está digitando"
      className="flex items-end gap-2 max-w-[85%] animate-in fade-in duration-200"
    >
      <NortAvatar alt="Nort digitando" size={30} />
      <div className="relative rounded-[10px] rounded-tl-none bg-[#F1F3F4] px-3.5 py-2.5 shadow-[0_1px_1px_rgba(17,27,33,0.12)] border border-[#D1D7DB]/60">
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

function BotMessageBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="flex items-end gap-2 max-w-[85%] animate-in fade-in duration-150">
      <NortAvatar alt="Nort" size={30} />
      <div className="relative rounded-[10px] rounded-tl-none bg-[#F1F3F4] px-3.5 py-2 text-[13px] text-[#111B21] shadow-[0_1px_1px_rgba(17,27,33,0.12)] border border-[#D1D7DB]/60 leading-relaxed break-words">
        <span
          aria-hidden="true"
          className="absolute -left-[6px] top-0 w-0 h-0 border-t-[8px] border-t-[#F1F3F4] border-l-[6px] border-l-transparent"
        />
        {message.quotedText && (
          <div className="mb-1.5 rounded-[6px] border-l-4 border-l-[#00A884] bg-[#FFFFFF] px-2.5 py-1 text-[11px] text-[#667781]">
            <span className="block font-semibold text-[#00A884]">
              {message.quotedTitle || 'Nort'}
            </span>
            <span className="line-clamp-2">{message.quotedText}</span>
          </div>
        )}
        <p className="whitespace-pre-wrap break-words pr-12">{message.text}</p>
        <span className="block text-right text-[10px] text-[#667781] -mt-1 select-none">
          {message.time}
        </span>
      </div>
    </div>
  );
}

function UserMessageBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end animate-in fade-in duration-150">
      <div className="relative max-w-[85%] rounded-[10px] rounded-tr-none bg-[#E0FBD4] px-3.5 py-2 text-[13px] text-[#111B21] shadow-[0_1px_1px_rgba(17,27,33,0.12)] border border-[#C6EDB9]/80 leading-relaxed break-words">
        <span
          aria-hidden="true"
          className="absolute -right-[6px] top-0 w-0 h-0 border-t-[8px] border-t-[#E0FBD4] border-r-[6px] border-r-transparent"
        />
        {message.quotedText && (
          <div className="mb-1.5 rounded-[6px] border-l-4 border-l-[#00A884] bg-[#D1F4C9] px-2.5 py-1 text-[11px] text-[#54656F]">
            <span className="block font-semibold text-[#075844]">
              {message.quotedTitle || 'Nort'}
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
 * CÁLCULO DE TEMPO DINÂMICO DE DIGITAÇÃO CONFORME A TABELA DA SEÇÃO 9
 * - Muito curta (< 25 chars): 0,8 a 1,5 segundo
 * - Curta (25 a 60 chars): 1,5 a 2,0 segundos
 * - Média (60 a 120 chars): 2,0 a 3,0 segundos
 * - Longa (> 120 chars): 3,0 a 4,0 segundos (teto de 4s)
 * ============================================================================ */

export function calculateHumanTypingMs(text: string, index = 0): number {
  const chars = text.trim().length;
  const jitter = (chars * 37 + index * 90) % 140;

  if (chars < 25) {
    const base = 850 + chars * 24;
    return Math.min(1500, Math.max(800, base + jitter));
  } else if (chars < 60) {
    const base = 1500 + (chars - 25) * 14;
    return Math.min(2000, Math.max(1500, base + jitter));
  } else if (chars < 120) {
    const base = 2050 + (chars - 60) * 15;
    return Math.min(3000, Math.max(2000, base + jitter));
  } else {
    const base = 3050 + (chars - 120) * 10;
    return Math.min(4000, Math.max(3000, base + jitter));
  }
}

/* ============================================================================
 * COMPONENTE PRINCIPAL — CENTRAL DE ATENDIMENTO NORT (AMPLIADA & CENTRALIZADA)
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

  // Gestão de Tickets & Histórico
  const [tickets, setTickets] = useState<NortTicket[]>([]);
  const [activeTicketId, setActiveTicketIdState] = useState<string | null>(null);

  // Navegação da Sidebar de Configurações
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<
    'menu' | 'new_ticket' | 'history' | 'ticket_detail' | 'profile' | 'help'
  >('menu');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketSearchTerm, setTicketSearchTerm] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Dados do cliente e escolhas
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
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
   * Registro Estruturado de Eventos do Cliente (Audit Trail / CRM Trail — Seção 7).
   */
  function recordTicketEvent(
    type: TicketEventType,
    actionText: string,
    details?: string,
    overrideStep?: BotStep
  ) {
    const curStep = overrideStep || step;
    const now = Date.now();
    const timeFormatted = getFormattedTime();

    setTickets((prev) => {
      let current = prev.find((t) => t.id === activeTicketId);
      let nextTickets = [...prev];

      if (!current) {
        const nextNum = 101 + prev.length;
        current = {
          id: formatTicketNumber(nextNum),
          numericId: nextNum,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          storeId: selectedStore.id,
          storeName: selectedStore.shortTitle,
          title: 'Novo atendimento',
          category: 'Atendimento Geral',
          status: 'in_progress',
          step: curStep,
          createdAt: now,
          updatedAt: now,
          messages,
          events: [],
          origin: 'chat-nort-site',
        };
        setActiveTicketIdState(current.id);
        setActiveTicketId(current.id);
        nextTickets = [current, ...prev];
      }

      const newEvent: TicketEvent = {
        id: `ev-${now}-${Math.random().toString(36).slice(2, 6)}`,
        ticketId: current.id,
        timestamp: now,
        timeFormatted,
        type,
        actionText,
        details,
        step: curStep,
      };

      const updatedEvents = [...current.events, newEvent];
      const { title: autoTitle, category: autoCategory } = generateTicketTitle(
        updatedEvents,
        current.title
      );

      const updatedTicket: NortTicket = {
        ...current,
        customerName: customerName.trim() || current.customerName,
        customerPhone: customerPhone.trim() || current.customerPhone,
        customerEmail: customerEmail.trim() || current.customerEmail,
        storeId: selectedStore.id || current.storeId,
        storeName: selectedStore.shortTitle || current.storeName,
        title: autoTitle,
        category: autoCategory,
        step: curStep,
        updatedAt: now,
        finishedAt: type === 'finish' ? now : current.finishedAt,
        status: type === 'finish' ? 'finished' : current.status,
        events: updatedEvents,
        messages,
      };

      const finalTickets = nextTickets.map((t) => (t.id === current?.id ? updatedTicket : t));
      saveStoredTickets(finalTickets);
      return finalTickets;
    });
  }

  function updateActiveTicketMessages(newMessages: ChatMessage[]) {
    setTickets((prev) => {
      const current = prev.find((t) => t.id === activeTicketId);
      if (!current) return prev;
      const updated: NortTicket = {
        ...current,
        messages: newMessages,
        updatedAt: Date.now(),
      };
      const finalTickets = prev.map((t) => (t.id === current.id ? updated : t));
      saveStoredTickets(finalTickets);
      return finalTickets;
    });
  }

  function handleStartTourFromChat() {
    recordTicketEvent(
      'select_service',
      'Tour guiado iniciado',
      'Solicitado pelo cliente no chat do Nort'
    );
    setIsOpen(false);
    setIsSidebarOpen(false);
    startTour();
  }

  /**
   * Simulação realista de digitação humana com cálculo de tamanho proporcional (Seção 9).
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
    setIsTyping(true);

    let elapsed = 0;

    texts.forEach((text, index) => {
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
        setMessages((prev) => {
          const newMsg: ChatMessage = {
            id: `bot-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
            sender: 'bot',
            text,
            time: getFormattedTime(),
          };
          const updated = [...prev, newMsg];
          updateActiveTicketMessages(updated);
          return updated;
        });
      }, elapsed);
      timersRef.current.push(deliverMsgTimer);
    });

    if (options?.withInteractiveWidget !== false) {
      const pauseBeforeWidgetTyping = 700;
      elapsed += pauseBeforeWidgetTyping;

      const startWidgetTypingTimer = window.setTimeout(() => {
        setIsTyping(true);
      }, elapsed);
      timersRef.current.push(startWidgetTypingTimer);

      const widgetTypingDuration = 2200;
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

  // Inicialização e recuperação de sessão e tickets
  useEffect(() => {
    const pubId = getOrCreateVisitorPublicId();
    setVisitorPublicId(pubId);

    const storedTickets = loadStoredTickets();
    const storedActiveId = getActiveTicketId();

    setTickets(storedTickets);

    let active = storedTickets.find((t) => t.id === storedActiveId);
    if (!active && storedTickets.length > 0) {
      active = storedTickets[0];
    }

    if (active) {
      setActiveTicketIdState(active.id);
      setActiveTicketId(active.id);
      setCustomerName(active.customerName || '');
      setCustomerPhone(active.customerPhone || '');
      setCustomerEmail(active.customerEmail || '');
      setSelectedStore(findStoreById(active.storeId));
      setPendingStoreId(active.storeId || DEFAULT_STORE.id);
      setChosenSubject(active.title || '');
      setMessages(active.messages || []);
      setStep(active.step || 'IDENTIFY');
      setHasRestoredSession(true);

      setPreviousSession({
        publicId: pubId,
        step: active.step,
        customerName: active.customerName,
        customerPhone: active.customerPhone,
        selectedStoreId: active.storeId,
        chosenSubject: active.title,
        messages: active.messages,
        updatedAt: active.updatedAt,
      });
      return;
    }

    // Fallback legado de sessão localStorage
    const localSession = loadStoredNortSession();
    if (localSession && localSession.customerName?.trim().length >= 2) {
      setPreviousSession(localSession);
      setCustomerName(localSession.customerName);
      setCustomerPhone(localSession.customerPhone || '');
      setSelectedStore(findStoreById(localSession.selectedStoreId));
      setPendingStoreId(localSession.selectedStoreId || DEFAULT_STORE.id);
      setChosenSubject(localSession.chosenSubject || '');
      setHasRestoredSession(true);

      // Migra sessão antiga para o primeiro Ticket
      const legacyTicket: NortTicket = {
        id: '#000101',
        numericId: 101,
        customerName: localSession.customerName,
        customerPhone: localSession.customerPhone || '',
        storeId: localSession.selectedStoreId || DEFAULT_STORE.id,
        storeName: findStoreById(localSession.selectedStoreId).shortTitle,
        title: localSession.chosenSubject || 'Atendimento geral',
        category: 'Atendimento Geral',
        status: 'in_progress',
        step: localSession.step,
        createdAt: localSession.updatedAt || Date.now(),
        updatedAt: localSession.updatedAt || Date.now(),
        messages: localSession.messages || [],
        events: [
          {
            id: 'ev-legacy-start',
            ticketId: '#000101',
            timestamp: localSession.updatedAt || Date.now(),
            timeFormatted: getFormattedTime(),
            type: 'start',
            actionText: 'Atendimento migrado da sessão anterior',
            step: localSession.step,
          },
        ],
        origin: 'chat-nort-site',
      };
      setTickets([legacyTicket]);
      setActiveTicketIdState(legacyTicket.id);
      setActiveTicketId(legacyTicket.id);
      saveStoredTickets([legacyTicket]);
      return;
    }

    // Backend CRM restore fallback
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

            setCustomerName(lead.customerName);
            setCustomerPhone(lead.customerPhone || '');
            setSelectedStore(restoredStore);
            setPendingStoreId(restoredStore.id);
            setChosenSubject(lead.subject || '');
            setHasRestoredSession(true);

            const crmTicket: NortTicket = {
              id: '#000101',
              numericId: 101,
              customerName: lead.customerName,
              customerPhone: lead.customerPhone || '',
              storeId: restoredStore.id,
              storeName: restoredStore.shortTitle,
              title: lead.subject || 'Atendimento CRM',
              category: 'Atendimento Geral',
              status: 'in_progress',
              step: 'SERVICE',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              messages: mappedMessages,
              events: [
                {
                  id: 'ev-crm-restore',
                  ticketId: '#000101',
                  timestamp: Date.now(),
                  timeFormatted: getFormattedTime(),
                  type: 'start',
                  actionText: 'Sessão recuperada do banco de dados CRM',
                  step: 'SERVICE',
                },
              ],
              origin: 'chat-nort-site',
            };

            setTickets([crmTicket]);
            setActiveTicketIdState(crmTicket.id);
            setActiveTicketId(crmTicket.id);
            saveStoredTickets([crmTicket]);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Salva automaticamente o progresso no localStorage
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
    recordTicketEvent('start', 'Atendimento iniciado', 'Canal web Comercial do Norte', 'IDENTIFY');
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
  }, [isOpen, messages, isTyping, interactiveReady, step, storeInfoVisible, isSidebarOpen]);

  async function registerLeadToCRM(leadData: {
    name: string;
    phone: string;
    store: CommercialStore;
    subject: string;
    allMessages: ChatMessage[];
  }) {
    const activePublicId = visitorPublicId || getOrCreateVisitorPublicId();
    try {
      const curTicket = tickets.find((t) => t.id === activeTicketId);
      await fetch('/api/v1/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicId: activePublicId,
          customerName: leadData.name,
          customerPhone: leadData.phone,
          customerEmail: customerEmail.trim() || undefined,
          preferredStore: leadData.store.name,
          storeId: leadData.store.id,
          subject: leadData.subject,
          conversationLog: {
            ticketId: curTicket?.id || '#000101',
            title: curTicket?.title || leadData.subject,
            category: curTicket?.category || 'Atendimento Geral',
            status: curTicket?.status || 'in_progress',
            events: curTicket?.events || [],
            messages: leadData.allMessages.map((m) => ({
              id: m.id,
              sender: m.sender,
              text: m.text,
              timestamp: m.time,
            })),
          },
        }),
      });
    } catch {
      // Ignora falha de rede
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
    updateActiveTicketMessages(nextMessages);
    setStep('UNIT_MODE');

    recordTicketEvent(
      'identify',
      'Cliente identificado',
      `${cleanName} (${formattedPhone})`,
      'UNIT_MODE'
    );

    void registerLeadToCRM({
      name: cleanName,
      phone: formattedPhone,
      store: selectedStore,
      subject: 'Identificação inicial no chat',
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
   * RETORNO DO VISITANTE (SEÇÃO 10)
   * ============================================================================ */
  function handleResumePreviousConversation() {
    if (isTyping || !previousSession) return;
    const restoredStore = findStoreById(previousSession.selectedStoreId);
    setSelectedStore(restoredStore);
    setPendingStoreId(restoredStore.id);
    setChosenSubject(previousSession.chosenSubject || '');
    setMessages(previousSession.messages);
    updateActiveTicketMessages(previousSession.messages);
    const targetStep =
      previousSession.step === 'IDENTIFY' || previousSession.step === 'RESUME_PROMPT'
        ? 'SERVICE'
        : previousSession.step;
    setStep(targetStep);
    setIsTyping(false);
    setInteractiveReady(true);
    setExpandedCategory(null);
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
    updateActiveTicketMessages([userMsg]);
    setStep('UNIT_MODE');
    setExpandedCategory(null);

    recordTicketEvent('start', 'Novo atendimento iniciado via boas-vindas', name, 'UNIT_MODE');

    scheduleBotSequence(
      [
        `Combinado, ${name}! 😊`,
        'Em qual unidade da Comercial do Norte você prefere ser atendido hoje?',
      ],
      { withInteractiveWidget: true }
    );
  }

  /* ============================================================================
   * SIDEBAR — CONFIRMAÇÃO DE NOVO ATENDIMENTO (SEÇÃO 4.1)
   * ============================================================================ */
  function handleConfirmNewTicketFromSidebar() {
    clearScheduledTimers();
    setIsSidebarOpen(false);

    const now = Date.now();
    const nextNum = 101 + tickets.length;
    const newId = formatTicketNumber(nextNum);

    const newTicket: NortTicket = {
      id: newId,
      numericId: nextNum,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      storeId: selectedStore.id,
      storeName: selectedStore.shortTitle,
      title: 'Novo atendimento',
      category: 'Atendimento Geral',
      status: 'in_progress',
      step: customerName ? 'UNIT_MODE' : 'IDENTIFY',
      createdAt: now,
      updatedAt: now,
      messages: [],
      events: [
        {
          id: `ev-${now}-start`,
          ticketId: newId,
          timestamp: now,
          timeFormatted: getFormattedTime(),
          type: 'start',
          actionText: 'Novo atendimento criado via menu de configurações',
          details: customerName ? `Cliente: ${customerName}` : 'Visitante',
          step: customerName ? 'UNIT_MODE' : 'IDENTIFY',
        },
      ],
      origin: 'chat-nort-site',
    };

    setTickets((prev) => {
      const updated = prev.map((t) =>
        t.id === activeTicketId ? { ...t, status: 'finished' as const, finishedAt: now } : t
      );
      const finalTickets = [newTicket, ...updated];
      saveStoredTickets(finalTickets);
      return finalTickets;
    });

    setActiveTicketIdState(newId);
    setActiveTicketId(newId);
    setMessages([]);
    setChosenSubject('');
    setCustomMessageText('');
    setStoreInfoVisible(false);
    setExpandedCategory(null);

    if (customerName && customerName.trim().length >= 2) {
      setStep('UNIT_MODE');
      scheduleBotSequence(
        [
          `Olá novamente, ${customerName}! 👋 Iniciamos um novo atendimento.`,
          'Em qual unidade da Comercial do Norte você prefere ser atendido?',
        ],
        { withInteractiveWidget: true }
      );
    } else {
      setStep('IDENTIFY');
      scheduleBotSequence([WELCOME_MSG_1, WELCOME_MSG_2], { withInteractiveWidget: true });
    }
  }

  function handleResumeTicketFromHistory(ticket: NortTicket) {
    clearScheduledTimers();
    setActiveTicketIdState(ticket.id);
    setActiveTicketId(ticket.id);
    setSelectedStore(findStoreById(ticket.storeId));
    setPendingStoreId(ticket.storeId || DEFAULT_STORE.id);
    setCustomerName(ticket.customerName || '');
    setCustomerPhone(ticket.customerPhone || '');
    setCustomerEmail(ticket.customerEmail || '');
    setMessages(ticket.messages || []);
    setStep(ticket.step === 'IDENTIFY' && ticket.customerName ? 'UNIT_MODE' : ticket.step);
    setIsTyping(false);
    setInteractiveReady(true);
    setIsSidebarOpen(false);
  }

  function handleSaveProfileInSidebar(e: React.FormEvent) {
    e.preventDefault();
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

    setTickets((prev) => {
      const updated = prev.map((t) =>
        t.id === activeTicketId
          ? {
              ...t,
              customerName: cleanName,
              customerPhone: formattedPhone,
              customerEmail: customerEmail.trim() || t.customerEmail,
              updatedAt: Date.now(),
            }
          : t
      );
      saveStoredTickets(updated);
      return updated;
    });

    recordTicketEvent(
      'edit_data',
      'Dados cadastrais atualizados via Configurações',
      `${cleanName} (${formattedPhone})${customerEmail ? ` · ${customerEmail}` : ''}`
    );

    setProfileSuccessMsg(true);
    window.setTimeout(() => setProfileSuccessMsg(false), 3500);
  }

  /* ============================================================================
   * ETAPA 2 — ESCOLHA DA UNIDADE COM KM E PROXIMIDADE (SEÇÃO 10)
   * ============================================================================ */
  function syncHeaderLocation(loc: UserLocation) {
    saveStoredLocation(loc);
    if (optionalLocationCtx?.setLocation) {
      optionalLocationCtx.setLocation(loc);
    }
  }

  async function handleFindNearestUnit() {
    if (isTyping) return;

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
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    updateActiveTicketMessages(nextMessages);

    recordTicketEvent(
      'select_unit',
      'Solicitou busca da unidade mais próxima por proximidade',
      locationText || 'Localização padrão'
    );

    const waitMsg: ChatMessage = {
      id: `bot-wait-${Date.now()}`,
      sender: 'bot',
      text: 'Ah sim! Deixa eu verificar um momentinho... 🔍',
      time: getFormattedTime(),
    };
    const waitMessages = [...nextMessages, waitMsg];
    setMessages(waitMessages);
    updateActiveTicketMessages(waitMessages);
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

    const topStores = findTopNearestStores(targetLat, targetLng, 2);
    setNearbyStores(topStores);

    window.setTimeout(() => {
      setIsTyping(false);
      setStep('UNIT_NEARBY_CHOICE');

      const introText = neighborhoodName
        ? `Olha, a unidade mais próxima de você tem estas opções aqui perto do bairro ${neighborhoodName}:`
        : 'Olha, a unidade mais próxima de você tem estas opções:';

      scheduleBotSequence([introText], { withInteractiveWidget: true });
    }, 2200);
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
    updateActiveTicketMessages(nextMessages);
    setStep('SERVICE');
    setExpandedCategory(null);

    recordTicketEvent(
      'select_unit',
      'Unidade confirmada por proximidade',
      store.shortTitle,
      'SERVICE'
    );

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
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    updateActiveTicketMessages(nextMessages);
    setStep('UNIT_LIST');

    recordTicketEvent('select_unit', 'Abriu lista manual de unidades', undefined, 'UNIT_LIST');

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
        .catch(() => {});
    }

    const userMsg: ChatMessage = {
      id: `user-cep-${Date.now()}`,
      sender: 'user',
      text: `CEP: ${formattedCep} (${nearest.shortTitle})`,
      time: getFormattedTime(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    updateActiveTicketMessages(nextMessages);
    setSelectedStore(nearest);
    setStep('SERVICE');
    setExpandedCategory(null);

    recordTicketEvent(
      'select_unit',
      'Unidade localizada por CEP',
      `${formattedCep} (${nearest.shortTitle})`,
      'SERVICE'
    );

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
    updateActiveTicketMessages(nextMessages);
    setStep('SERVICE');
    setExpandedCategory(null);

    recordTicketEvent(
      'select_unit',
      'Unidade selecionada da lista',
      store.shortTitle,
      'SERVICE'
    );

    void registerLeadToCRM({
      name: customerName || 'Cliente Site',
      phone: customerPhone || '(91) 98344-0880',
      store,
      subject: `Unidade selecionada (${store.shortTitle})`,
      allMessages: nextMessages,
    });

    scheduleBotSequence(
      customPrefix
        ? [customPrefix, `Perfeito, ${customerName || 'visitante'}! 💙`, 'Agora me conta, como posso te ajudar hoje?']
        : [`Perfeito, ${customerName || 'visitante'}! 💙`, 'Agora me conta, como posso te ajudar hoje?'],
      { withInteractiveWidget: true }
    );
  }

  /* ============================================================================
   * ETAPA 3 — SERVIÇOS E REDIRECIONAMENTO COM REGISTRO DE TICKETS
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
    updateActiveTicketMessages(updatedMessages);
    setStep('FINISHED');

    recordTicketEvent(
      'select_service',
      serviceLabel,
      topicDetail,
      'FINISHED'
    );

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
      const updated = [...messages, userMsg];
      setMessages(updated);
      updateActiveTicketMessages(updated);
      recordTicketEvent(
        'select_service',
        'Consulta de endereços e horários de lojas',
        selectedStore.shortTitle
      );
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
    const updated = [...messages, userMsg];
    setMessages(updated);
    updateActiveTicketMessages(updated);
    setStep('UNIT_CEP');

    recordTicketEvent(
      'select_service',
      'Ajuda para alteração de CEP e entrega',
      undefined,
      'UNIT_CEP'
    );

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
    const updated = [...messages, userMsg];
    setMessages(updated);
    updateActiveTicketMessages(updated);
    setStep('FINISHED');
    setChosenSubject('Recuperação de login e senha');

    recordTicketEvent(
      'select_service',
      'Recuperação de login e senha da conta',
      undefined,
      'FINISHED'
    );

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
    const updated = [...messages, userMsg];
    setMessages(updated);
    updateActiveTicketMessages(updated);
    setStep('FINISHED');
    setChosenSubject('Consulta de produtos no catálogo');

    recordTicketEvent(
      'select_service',
      'Consulta de produtos e navegação no catálogo',
      undefined,
      'FINISHED'
    );

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
    const updated = [...messages, userMsg];
    setMessages(updated);
    updateActiveTicketMessages(updated);
    setStep('FINISHED');
    setChosenSubject('Dúvidas com Lista de Cotação');

    recordTicketEvent(
      'select_service',
      'Problemas ou dúvidas ao adicionar itens à cotação',
      undefined,
      'FINISHED'
    );

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
    updateActiveTicketMessages(updatedMessages);

    recordTicketEvent('finish', 'Mensagem enviada pelo cliente', text, 'FINISHED');

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
    updateActiveTicketMessages(nextMessages);
    setStep('SERVICE');

    recordTicketEvent(
      'edit_data',
      'Dados cadastrais atualizados no chat',
      `${cleanName} (${formattedPhone})`,
      'SERVICE'
    );

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
    setCustomerEmail('');
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
    setIsSidebarOpen(false);

    const now = Date.now();
    const nextNum = 101 + tickets.length;
    const newId = formatTicketNumber(nextNum);
    const newTicket: NortTicket = {
      id: newId,
      numericId: nextNum,
      customerName: '',
      customerPhone: '',
      storeId: DEFAULT_STORE.id,
      storeName: DEFAULT_STORE.shortTitle,
      title: 'Novo atendimento',
      category: 'Atendimento Geral',
      status: 'in_progress',
      step: 'IDENTIFY',
      createdAt: now,
      updatedAt: now,
      messages: [],
      events: [
        {
          id: `ev-${now}-restart`,
          ticketId: newId,
          timestamp: now,
          timeFormatted: getFormattedTime(),
          type: 'start',
          actionText: 'Atendimento reiniciado desde o início',
          step: 'IDENTIFY',
        },
      ],
      origin: 'chat-nort-site',
    };
    setTickets((prev) => [newTicket, ...prev]);
    setActiveTicketIdState(newId);
    setActiveTicketId(newId);
    saveStoredTickets([newTicket, ...tickets]);

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
          onClick: handleStartTourFromChat,
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

  // Filtro de tickets no histórico
  const filteredTickets = tickets.filter((t) => {
    if (!ticketSearchTerm.trim()) return true;
    const term = ticketSearchTerm.toLowerCase();
    return (
      t.id.toLowerCase().includes(term) ||
      t.title.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term) ||
      t.storeName.toLowerCase().includes(term)
    );
  });

  const groupedTickets = groupTicketsChronologically(filteredTickets);
  const activeTicket = tickets.find((t) => t.id === activeTicketId) || tickets[0];
  const viewedTicket = tickets.find((t) => t.id === selectedTicketId) || activeTicket;

  function handleSidebarBack() {
    if (sidebarView === 'ticket_detail') {
      setSidebarView('history');
    } else if (sidebarView !== 'menu') {
      setSidebarView('menu');
    } else {
      setIsSidebarOpen(false);
    }
  }

  function getSidebarTitle() {
    switch (sidebarView) {
      case 'new_ticket':
        return 'Novo Atendimento';
      case 'history':
        return 'Histórico de Atendimentos';
      case 'ticket_detail':
        return viewedTicket ? `Ticket ${viewedTicket.id}` : 'Detalhes do Ticket';
      case 'profile':
        return 'Meus Dados';
      case 'help':
        return 'Ajuda e Suporte';
      default:
        return 'Configurações';
    }
  }

  return (
    <>
      {/* 0. OVERLAY ESCURO E PROFUNDO NO FUNDO DA PÁGINA (95% DE ESCURIDÃO COM BACKDROP BLUR) */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[9990] bg-[#000000]/95 backdrop-blur-[3px] animate-in fade-in duration-200 cursor-pointer"
          data-testid="nort-chat-backdrop"
          onClick={() => setIsOpen(false)}
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
                  Nort
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

      {/* 2. BOTÃO FLUTUANTE DE ABERTURA NO CANTO INFERIOR DIREITO (QUANDO FECHADO) */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]">
          <button
            aria-controls={id}
            aria-expanded={false}
            aria-haspopup="dialog"
            aria-label="Abrir chat com o Norti no WhatsApp"
            className="group relative flex size-14 sm:size-15 items-center justify-center rounded-full bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] shadow-[0_4px_14px_rgba(17,27,33,0.28)] transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer border-2 border-[#FFFFFF]"
            onClick={() => setIsOpen(true)}
            type="button"
          >
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
          </button>
        </div>
      )}

      {/* 3. JANELA CENTRALIZADA E AMPLIADA COM BOTÃO FLUTUANTE (X) EXTERNO DO LADO DE FORA */}
      {isOpen && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden pointer-events-none">
          <div className="relative w-[calc(100%-64px)] sm:w-[540px] md:w-[580px] h-[92vh] sm:h-[660px] sm:max-h-[88vh] pointer-events-auto animate-in zoom-in-95 fade-in duration-200 flex flex-col">
            {/* BOTÃO FLUTUANTE DE FECHAR (X) EXTERNO DO LADO DIREITO (SEM COBRIR A JANELA OU O ÍCONE DE CONFIGURAÇÕES) */}
            <button
              aria-label="Fechar chat do Norti"
              className="absolute top-1 sm:top-2 left-[calc(100%+12px)] sm:left-[calc(100%+16px)] z-[9999] flex size-11 sm:size-12 items-center justify-center rounded-full bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] shadow-[0_6px_20px_rgba(0,0,0,0.6)] border-2 border-[#FFFFFF] transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto shrink-0"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="size-5.5 sm:size-6 text-[#FFFFFF]" strokeWidth={2.5} />
            </button>

            {/* CONTAINER PRINCIPAL DO CHAT */}
            <section
              id={id}
              aria-label="Chat de atendimento com o mascote Norti"
              className="size-full bg-[#E4D8D3] rounded-[18px] sm:rounded-[22px] shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-[#D1D7DB] overflow-hidden flex flex-col relative"
              role="dialog"
            >
              {/* CABEÇALHO LIMPO E MINIMALISTA — EXCLUSIVAMENTE 'NORT' + ENGRENAGEM DE CONFIGURAÇÕES (SEÇÃO 3) */}
              <header className="bg-[#075844] text-[#FFFFFF] px-3.5 py-2.5 flex items-center justify-between shrink-0 border-b border-[#075844] relative z-10">
                <div className="flex items-center gap-2 min-w-0">
                  <NortAvatar alt="Nort" size={38} />

                  <div className="min-w-0 leading-tight ml-0.5">
                    <div className="flex items-center gap-1">
                      <h2 className="text-[15px] font-bold text-[#FFFFFF] truncate">
                        Nort
                      </h2>
                      <VerifiedBadge />
                    </div>
                    <p className="text-[11.5px] text-[#FFFFFF]/90 font-normal truncate mt-0.5">
                      {isTyping ? 'digitando...' : 'online'}
                    </p>
                  </div>
                </div>

                {/* ÚNICO BOTÃO NO CANTO SUPERIOR DIREITO DO CABEÇALHO: CONFIGURAÇÕES E HISTÓRICO (SEÇÃO 3) */}
                <button
                  aria-label="Configurações e atendimentos"
                  className="flex size-8.5 items-center justify-center rounded-full text-[#FFFFFF] hover:bg-[#0B8E69] transition cursor-pointer shrink-0"
                  onClick={() => {
                    setSidebarView('menu');
                    setIsSidebarOpen(true);
                  }}
                  title="Configurações e atendimentos"
                  type="button"
                >
                  <Settings className="size-5" />
                </button>
              </header>

              {/* ÁREA DE MENSAGENS COM WALLPAPER CLÁSSICO DO WHATSAPP */}
              <div
                ref={chatBodyRef}
                className="relative flex-1 overflow-y-auto px-3.5 py-3 space-y-2.5 bg-[#E4D8D3]"
                style={{
                  backgroundColor: 'var(--chat-background, #E4D8D3)',
                  backgroundImage: "url('/assets/whatsapp-wallpaper.jpg')",
                  backgroundRepeat: 'repeat',
                  backgroundSize: '340px auto',
                  backgroundAttachment: 'local',
                  backgroundBlendMode: 'multiply',
                }}
              >
                {/* Tag "Hoje" */}
                <div className="flex justify-center">
                  <span className="rounded-[7px] bg-[#FFFFFF] px-2.5 py-0.5 text-[11px] font-medium text-[#667781] shadow-[0_1px_1px_rgba(17,27,33,0.1)] border border-[#D1D7DB]/60">
                    Hoje
                  </span>
                </div>

                {/* Aviso de privacidade LGPD */}
                <div className="flex justify-center">
                  <div className="rounded-[8px] bg-[#FFF5C4] border border-[#E6DA9E] px-3 py-1.5 text-[11px] text-[#54656F] text-center max-w-[94%] leading-snug shadow-[0_1px_1px_rgba(17,27,33,0.08)]">
                    🔒 Suas informações (nome, WhatsApp e localização) são protegidas e usadas apenas para direcionar seu atendimento na Comercial do Norte.
                  </div>
                </div>

                {/* MENSAGENS TROCADAS */}
                {messages.map((msg) =>
                  msg.sender === 'bot' ? (
                    <BotMessageBubble key={msg.id} message={msg} />
                  ) : (
                    <UserMessageBubble key={msg.id} message={msg} />
                  )
                )}

                {/* INDICADOR DE DIGITAÇÃO COM OS 3 PONTINHOS ONDULANTES */}
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

                {/* INTERAÇÃO 1 — FORMULÁRIO INTEGRADO DE IDENTIFICAÇÃO */}
                {step === 'IDENTIFY' && !isTyping && interactiveReady && (
                  <div className="pt-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <form
                      aria-label="Identificação do cliente"
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
                        className="w-full rounded-[8px] bg-[#00A884] hover:bg-[#075844] active:bg-[#075844] text-[#FFFFFF] font-semibold text-[13px] py-2.5 px-3 text-center shadow-[0_1px_2px_rgba(17,27,33,0.16)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        type="submit"
                      >
                        <span>Continuar no chat</span>
                        <Send className="size-3.5" />
                      </button>
                    </form>
                  </div>
                )}

                {/* INTERAÇÃO 2 — ESCOLHA DA UNIDADE */}
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

                {/* ESCOLHA ENTRE AS UNIDADES MAIS PRÓXIMAS COM DISTÂNCIA EM KM */}
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

                {/* BUSCA DE UNIDADE POR CEP */}
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

                {/* LISTA DE TODAS AS UNIDADES */}
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

                {/* INTERAÇÃO 3 — CATEGORIAS DE ATENDIMENTO ESTILO SANFONA / ACCORDION */}
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
                              aria-expanded={isExpanded}
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-[#F8F9FA] active:bg-[#F1F3F4] transition-colors cursor-pointer select-none"
                              onClick={() => {
                                const nextVal = isExpanded ? null : cat.id;
                                setExpandedCategory(nextVal);
                                if (nextVal) {
                                  recordTicketEvent(
                                    'select_category',
                                    `Categoria expandida: ${cat.title}`,
                                    cat.subtitle
                                  );
                                }
                              }}
                              type="button"
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

                            {isExpanded && (
                              <div className="px-2.5 pb-2.5 pt-1 space-y-1.5 border-t border-[#F1F3F4] bg-[#F8FAFC] animate-in fade-in slide-in-from-top-1 duration-150">
                                {cat.items.map((item) => (
                                  <button
                                    key={item.id}
                                    className="w-full rounded-[8px] bg-[#FFFFFF] hover:bg-[#E0FBD4]/70 active:bg-[#E0FBD4] text-[#111B21] hover:text-[#075844] font-medium text-[12px] py-2 px-2.5 text-left border border-[#E2E8F0] shadow-[0_1px_1px_rgba(0,0,0,0.04)] transition-all cursor-pointer flex items-center justify-between gap-2 group"
                                    onClick={item.onClick}
                                    type="button"
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

                    <div className="pt-0.5">
                      <QuickReplyButton onClick={handleOpenEditData}>
                        ✏️ Alterar meus dados (Nome / WhatsApp)
                      </QuickReplyButton>
                    </div>
                  </div>
                )}

                {/* SUB-FLUXO DE EDIÇÃO DE DADOS */}
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
                        <span className="text-[10px] text-[#667781]">Atualização cadastral</span>
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

                {/* INTERAÇÃO 4 — FINALIZADO */}
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

                {/* PAINEL DE ENDEREÇOS E HORÁRIOS */}
                {storeInfoVisible && (
                  <div className="flex items-end gap-2 max-w-[92%] animate-in fade-in duration-150">
                    <NortAvatar alt="Nort" size={30} />
                    <div className="relative rounded-[10px] rounded-tl-none bg-[#F1F3F4] p-3 text-[12px] text-[#111B21] shadow-[0_1px_1px_rgba(17,27,33,0.12)] border border-[#D1D7DB]/60 leading-relaxed">
                      <p className="font-bold text-[#075844] mb-1">
                        📍 Nossas Unidades em Belém e Região:
                      </p>
                      <ul className="space-y-1.5 text-[11.5px] text-[#111B21]">
                        {COMMERCIAL_STORES.map((st) => (
                          <li
                            key={st.id}
                            className={`p-1.5 rounded-[6px] ${
                              st.id === selectedStore.id
                                ? 'bg-[#E0FBD4] border border-[#00A884]/40 font-medium'
                                : 'bg-[#FFFFFF]/70'
                            }`}
                          >
                            <span className="font-semibold text-[#075844]">{st.shortTitle}</span>
                            <span className="block text-[11px] text-[#54656F]">{st.address}</span>
                            <span className="block text-[10.5px] text-[#667781]">{st.hours}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* INPUT DE MENSAGEM LIVRE COMPLEMENTAR QUANDO FINALIZADO */}
              {step === 'FINISHED' && (
                <form
                  className="bg-[#F0F2F5] px-3 py-2 flex items-center gap-2 border-t border-[#D1D7DB] shrink-0"
                  onSubmit={handleSendCustomMessage}
                >
                  <input
                    ref={customInputRef}
                    aria-label="Mensagem para o WhatsApp"
                    className="flex-1 rounded-[8px] bg-[#FFFFFF] px-3.5 py-2 text-[13px] text-[#111B21] placeholder-[#667781] border border-[#D1D7DB] focus:outline-none focus:border-[#00A884]"
                    onChange={(e) => setCustomMessageText(e.target.value)}
                    placeholder="Digitar mensagem adicional para o vendedor..."
                    type="text"
                    value={customMessageText}
                  />
                  <button
                    aria-label="Enviar mensagem no WhatsApp"
                    className="flex size-9 items-center justify-center rounded-full bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] shadow transition-colors cursor-pointer shrink-0"
                    type="submit"
                  >
                    <Send className="size-4" />
                  </button>
                </form>
              )}

              {/* =================================================================
               * 4. SIDEBAR DE CONFIGURAÇÕES E GESTÃO DE ATENDIMENTOS (SEÇÃO 4)
               * Abre internamente com transição lateral suave sem perder o chat
               * ================================================================= */}
              <div
                aria-label="Painel de configurações e histórico"
                className={`absolute inset-0 z-30 bg-[#FFFFFF] flex flex-col transition-transform duration-300 ease-in-out ${
                  isSidebarOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
                }`}
              >
                {/* HEADER DA SIDEBAR */}
                <div className="bg-[#075844] text-[#FFFFFF] px-3.5 py-3 flex items-center justify-between shrink-0 border-b border-[#075844]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      aria-label="Voltar"
                      className="flex size-7.5 items-center justify-center rounded-full text-[#FFFFFF] hover:bg-[#0B8E69] transition cursor-pointer"
                      onClick={handleSidebarBack}
                      type="button"
                    >
                      <ArrowLeft className="size-4.5" />
                    </button>
                    <h3 className="text-[14.5px] font-bold text-[#FFFFFF] truncate">
                      {getSidebarTitle()}
                    </h3>
                  </div>

                  <button
                    aria-label="Fechar configurações"
                    className="flex size-7.5 items-center justify-center rounded-full text-[#FFFFFF] hover:bg-[#0B8E69] transition cursor-pointer"
                    onClick={() => setIsSidebarOpen(false)}
                    type="button"
                  >
                    <X className="size-4.5" />
                  </button>
                </div>

                {/* CORPO DA SIDEBAR */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC]">
                  {/* VIEW 1: MENU PRINCIPAL DE CONFIGURAÇÕES */}
                  {sidebarView === 'menu' && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      {/* CARD DO CLIENTE / IDENTIFICAÇÃO */}
                      <div className="rounded-[14px] bg-[#FFFFFF] p-3.5 border border-[#E2E8F0] shadow-sm flex items-center gap-3">
                        <NortAvatar alt="Nort" size={42} />
                        <div className="min-w-0 flex-1">
                          <span className="block text-[14px] font-bold text-[#0F172A] truncate">
                            {customerName || 'Visitante Comercial do Norte'}
                          </span>
                          <span className="block text-[12px] text-[#64748B] truncate">
                            {customerPhone || 'Nenhum WhatsApp informado'}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-block size-2 rounded-full bg-[#00A884]" />
                            <span className="text-[11px] text-[#075844] font-medium">
                              🏪 {selectedStore.shortTitle}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ITENS DO MENU */}
                      <div className="rounded-[14px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-[#F1F5F9]">
                        <button
                          className="w-full flex items-center justify-between p-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left group"
                          onClick={() => setSidebarView('new_ticket')}
                          type="button"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex size-9 items-center justify-center rounded-full bg-[#E0FBD4] text-[#075844] shrink-0">
                              <PlusCircle className="size-5" />
                            </span>
                            <div className="min-w-0">
                              <span className="block text-[13px] font-bold text-[#0F172A]">
                                Novo atendimento
                              </span>
                              <span className="block text-[11px] text-[#64748B]">
                                Iniciar uma nova conversa do zero
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="size-4 text-[#94A3B8] group-hover:text-[#00A884] transition-colors" />
                        </button>

                        <button
                          className="w-full flex items-center justify-between p-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left group"
                          onClick={() => setSidebarView('history')}
                          type="button"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex size-9 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0369A1] shrink-0">
                              <History className="size-5" />
                            </span>
                            <div className="min-w-0">
                              <span className="block text-[13px] font-bold text-[#0F172A]">
                                Histórico de atendimentos
                              </span>
                              <span className="block text-[11px] text-[#64748B]">
                                Consulte seus tickets anteriores
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#475569]">
                              {tickets.length}
                            </span>
                            <ChevronRight className="size-4 text-[#94A3B8] group-hover:text-[#00A884] transition-colors" />
                          </div>
                        </button>

                        <button
                          className="w-full flex items-center justify-between p-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left group"
                          onClick={() => {
                            setEditName(customerName);
                            setEditPhone(customerPhone);
                            setFormError('');
                            setSidebarView('profile');
                          }}
                          type="button"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex size-9 items-center justify-center rounded-full bg-[#FEF3C7] text-[#B45309] shrink-0">
                              <User className="size-5" />
                            </span>
                            <div className="min-w-0">
                              <span className="block text-[13px] font-bold text-[#0F172A]">
                                Meus dados
                              </span>
                              <span className="block text-[11px] text-[#64748B]">
                                Nome, WhatsApp e preferências
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="size-4 text-[#94A3B8] group-hover:text-[#00A884] transition-colors" />
                        </button>

                        <button
                          className="w-full flex items-center justify-between p-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left group"
                          onClick={() => setSidebarView('help')}
                          type="button"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex size-9 items-center justify-center rounded-full bg-[#F3E8FF] text-[#7E22CE] shrink-0">
                              <HelpCircle className="size-5" />
                            </span>
                            <div className="min-w-0">
                              <span className="block text-[13px] font-bold text-[#0F172A]">
                                Ajuda e suporte
                              </span>
                              <span className="block text-[11px] text-[#64748B]">
                                Contatos e informações das lojas
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="size-4 text-[#94A3B8] group-hover:text-[#00A884] transition-colors" />
                        </button>
                      </div>

                      {/* BOTÃO PARA VOLTAR AO ATENDIMENTO */}
                      <button
                        className="w-full rounded-[10px] bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] font-semibold text-[13px] py-2.5 px-3 text-center transition-colors cursor-pointer"
                        onClick={() => setIsSidebarOpen(false)}
                        type="button"
                      >
                        Continuar atendimento
                      </button>
                    </div>
                  )}

                  {/* VIEW 2: NOVO ATENDIMENTO COM CONFIRMAÇÃO (SEÇÃO 4.1) */}
                  {sidebarView === 'new_ticket' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="rounded-[16px] bg-[#FFFFFF] p-5 border border-[#E2E8F0] shadow-sm text-center">
                        <span className="inline-flex size-14 items-center justify-center rounded-full bg-[#E0FBD4] text-[#075844] mb-3">
                          <PlusCircle className="size-8" />
                        </span>
                        <h4 className="text-[16px] font-bold text-[#0F172A] mb-1">
                          Iniciar novo atendimento?
                        </h4>
                        <p className="text-[12.5px] text-[#64748B] leading-relaxed mb-4">
                          Sua conversa atual será arquivada com segurança no seu histórico de tickets. Seus dados cadastrais serão mantidos para agilizar seu próximo contato.
                        </p>

                        <div className="space-y-2">
                          <button
                            className="w-full rounded-[10px] bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] font-semibold text-[13px] py-2.5 px-3 transition-colors cursor-pointer"
                            onClick={handleConfirmNewTicketFromSidebar}
                            type="button"
                          >
                            Confirmar e iniciar novo
                          </button>
                          <button
                            className="w-full rounded-[10px] border border-[#CBD5E1] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] font-medium text-[12.5px] py-2 px-3 transition-colors cursor-pointer"
                            onClick={() => setSidebarView('menu')}
                            type="button"
                          >
                            Voltar / Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VIEW 3: HISTÓRICO DE ATENDIMENTOS E BUSCA (SEÇÃO 4.2) */}
                  {sidebarView === 'history' && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      {/* CAMPO DE BUSCA SIMPLES */}
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 size-4 text-[#94A3B8]" />
                        <input
                          aria-label="Buscar atendimentos"
                          className="w-full rounded-[10px] bg-[#FFFFFF] pl-9 pr-3 py-2 text-[12.5px] text-[#0F172A] placeholder-[#94A3B8] border border-[#CBD5E1] focus:outline-none focus:border-[#00A884]"
                          onChange={(e) => setTicketSearchTerm(e.target.value)}
                          placeholder="Buscar por título, ticket ou loja..."
                          type="text"
                          value={ticketSearchTerm}
                        />
                      </div>

                      {/* AGRUPAMENTO CRONOLÓGICO */}
                      {Object.entries(groupedTickets).map(([groupTitle, list]) => {
                        if (list.length === 0) return null;
                        return (
                          <div key={groupTitle} className="space-y-2">
                            <span className="inline-block text-[11px] font-bold text-[#64748B] uppercase tracking-wider px-1">
                              {groupTitle}
                            </span>
                            <div className="space-y-1.5">
                              {list.map((tk) => {
                                const isCurrent = tk.id === activeTicketId;
                                return (
                                  <div
                                    key={tk.id}
                                    className={`rounded-[12px] bg-[#FFFFFF] p-3 border transition-all cursor-pointer hover:border-[#00A884] ${
                                      isCurrent
                                        ? 'border-[#00A884] shadow-sm ring-1 ring-[#00A884]/20'
                                        : 'border-[#E2E8F0]'
                                    }`}
                                    onClick={() => {
                                      setSelectedTicketId(tk.id);
                                      setSidebarView('ticket_detail');
                                    }}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[11.5px] font-bold text-[#075844]">
                                        Ticket {tk.id}
                                      </span>
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                          tk.status === 'in_progress'
                                            ? 'bg-[#E0FBD4] text-[#075844]'
                                            : 'bg-[#F1F5F9] text-[#64748B]'
                                        }`}
                                      >
                                        {tk.status === 'in_progress' ? 'Em andamento' : 'Finalizado'}
                                      </span>
                                    </div>
                                    <span className="block text-[13px] font-semibold text-[#0F172A] truncate">
                                      {tk.title}
                                    </span>
                                    <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1">
                                      <span>{formatTicketDateTime(tk.updatedAt || tk.createdAt)}</span>
                                      <span>🏪 {tk.storeName}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {filteredTickets.length === 0 && (
                        <div className="rounded-[12px] bg-[#FFFFFF] p-6 text-center border border-[#E2E8F0] text-[12px] text-[#64748B]">
                          Nenhum atendimento encontrado para esta busca.
                        </div>
                      )}
                    </div>
                  )}

                  {/* VIEW 4: DETALHES DO TICKET E REGISTRO DE EVENTOS (SEÇÃO 4.2 & SEÇÃO 7) */}
                  {sidebarView === 'ticket_detail' && viewedTicket && (
                    <div className="space-y-3.5 animate-in fade-in duration-150">
                      {/* CARD DO TICKET */}
                      <div className="rounded-[14px] bg-[#FFFFFF] p-3.5 border border-[#E2E8F0] shadow-sm">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[13px] font-bold text-[#075844]">
                            Ticket {viewedTicket.id}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                              viewedTicket.status === 'in_progress'
                                ? 'bg-[#E0FBD4] text-[#075844]'
                                : 'bg-[#F1F5F9] text-[#64748B]'
                            }`}
                          >
                            {viewedTicket.status === 'in_progress' ? 'Em andamento' : 'Finalizado'}
                          </span>
                        </div>
                        <h4 className="text-[14px] font-bold text-[#0F172A] mb-1">
                          {viewedTicket.title}
                        </h4>
                        <div className="space-y-0.5 text-[11.5px] text-[#64748B]">
                          <p>📅 Abertura: {formatTicketDateTime(viewedTicket.createdAt)}</p>
                          <p>🏪 Unidade: {viewedTicket.storeName}</p>
                          {viewedTicket.customerName && (
                            <p>👤 Cliente: {viewedTicket.customerName} ({viewedTicket.customerPhone})</p>
                          )}
                        </div>
                      </div>

                      {/* SEÇÃO 7: CAMINHO PERCORRIDO NO ATENDIMENTO (EVENT TRAIL) */}
                      <div className="rounded-[14px] bg-[#FFFFFF] p-3.5 border border-[#E2E8F0] shadow-sm">
                        <span className="block text-[12px] font-bold text-[#0F172A] mb-2">
                          Caminho percorrido no atendimento:
                        </span>
                        {viewedTicket.events && viewedTicket.events.length > 0 ? (
                          <div className="space-y-2 border-l-2 border-l-[#00A884]/40 ml-2 pl-3">
                            {viewedTicket.events.map((ev) => (
                              <div key={ev.id} className="relative text-[11.5px]">
                                <span className="absolute -left-[19px] top-1.5 size-2 rounded-full bg-[#00A884]" />
                                <span className="font-bold text-[#0F172A]">{ev.timeFormatted}</span>
                                <span className="text-[#334155]"> — {ev.actionText}</span>
                                {ev.details && (
                                  <span className="block text-[10.5px] text-[#64748B]">
                                    {ev.details}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11.5px] text-[#64748B]">
                            Nenhum evento registrado neste atendimento.
                          </p>
                        )}
                      </div>

                      {/* AÇÕES DO TICKET */}
                      <div className="space-y-2 pt-1">
                        {viewedTicket.status === 'in_progress' && (
                          <button
                            className="w-full rounded-[10px] bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] font-semibold text-[13px] py-2.5 px-3 transition-colors cursor-pointer"
                            onClick={() => handleResumeTicketFromHistory(viewedTicket)}
                            type="button"
                          >
                            Continuar este atendimento
                          </button>
                        )}
                        <button
                          className="w-full rounded-[10px] border border-[#CBD5E1] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] font-medium text-[12.5px] py-2 px-3 transition-colors cursor-pointer"
                          onClick={() => setSidebarView('history')}
                          type="button"
                        >
                          ← Voltar à lista de atendimentos
                        </button>
                      </div>
                    </div>
                  )}

                  {/* VIEW 5: MEUS DADOS CADASTRAIS (SEÇÃO 4.3) */}
                  {sidebarView === 'profile' && (
                    <form
                      aria-label="Atualizar dados cadastrais"
                      className="space-y-3.5 animate-in fade-in duration-150"
                      onSubmit={handleSaveProfileInSidebar}
                    >
                      <div className="rounded-[14px] bg-[#FFFFFF] p-4 border border-[#E2E8F0] shadow-sm space-y-3">
                        {profileSuccessMsg && (
                          <div className="rounded-[8px] bg-[#E0FBD4] border border-[#00A884]/40 p-2 text-[11.5px] font-semibold text-[#075844] text-center">
                            ✅ Dados cadastrais atualizados com sucesso!
                          </div>
                        )}

                        <div>
                          <label
                            className="block text-[11.5px] font-semibold text-[#0F172A] mb-1"
                            htmlFor="profile-name"
                          >
                            Seu nome completo
                          </label>
                          <input
                            id="profile-name"
                            className="w-full rounded-[8px] bg-[#FFFFFF] px-3 py-2 text-[12.5px] text-[#0F172A] border border-[#CBD5E1] focus:outline-none focus:border-[#00A884]"
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Como podemos te chamar?"
                            type="text"
                            value={editName}
                          />
                        </div>

                        <div>
                          <label
                            className="block text-[11.5px] font-semibold text-[#0F172A] mb-1"
                            htmlFor="profile-phone"
                          >
                            Número do WhatsApp
                          </label>
                          <input
                            id="profile-phone"
                            className="w-full rounded-[8px] bg-[#FFFFFF] px-3 py-2 text-[12.5px] text-[#0F172A] border border-[#CBD5E1] focus:outline-none focus:border-[#00A884]"
                            inputMode="tel"
                            onChange={(e) => setEditPhone(formatBrazilPhoneMask(e.target.value))}
                            placeholder="(91) 99999-9999"
                            type="tel"
                            value={editPhone}
                          />
                        </div>

                        <div>
                          <label
                            className="block text-[11.5px] font-semibold text-[#0F172A] mb-1"
                            htmlFor="profile-email"
                          >
                            E-mail (opcional)
                          </label>
                          <input
                            id="profile-email"
                            className="w-full rounded-[8px] bg-[#FFFFFF] px-3 py-2 text-[12.5px] text-[#0F172A] border border-[#CBD5E1] focus:outline-none focus:border-[#00A884]"
                            inputMode="email"
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="seuemail@exemplo.com"
                            type="email"
                            value={customerEmail}
                          />
                        </div>

                        <div>
                          <label
                            className="block text-[11.5px] font-semibold text-[#0F172A] mb-1"
                            htmlFor="profile-store"
                          >
                            Unidade preferida
                          </label>
                          <select
                            id="profile-store"
                            className="w-full rounded-[8px] bg-[#FFFFFF] px-3 py-2 text-[12.5px] text-[#0F172A] border border-[#CBD5E1] focus:outline-none focus:border-[#00A884]"
                            onChange={(e) => {
                              const chosen = findStoreById(e.target.value);
                              setSelectedStore(chosen);
                              setPendingStoreId(chosen.id);
                            }}
                            value={selectedStore.id}
                          >
                            {COMMERCIAL_STORES.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.shortTitle} — {st.address}
                              </option>
                            ))}
                          </select>
                        </div>

                        {formError && (
                          <p className="text-[11px] text-[#B91C1C] font-medium" role="alert">
                            {formError}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <button
                          className="w-full rounded-[10px] bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] font-semibold text-[13px] py-2.5 px-3 transition-colors cursor-pointer"
                          type="submit"
                        >
                          Salvar dados cadastrais
                        </button>
                        <button
                          className="w-full rounded-[10px] border border-[#CBD5E1] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] font-medium text-[12.5px] py-2 px-3 transition-colors cursor-pointer"
                          onClick={() => setSidebarView('menu')}
                          type="button"
                        >
                          Voltar ao menu
                        </button>
                      </div>
                    </form>
                  )}

                  {/* VIEW 6: AJUDA E SUPORTE (SEÇÃO 4.4) */}
                  {sidebarView === 'help' && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div className="rounded-[14px] bg-[#FFFFFF] p-3.5 border border-[#E2E8F0] shadow-sm space-y-2.5">
                        <span className="block text-[13px] font-bold text-[#0F172A]">
                          Canais de Atendimento
                        </span>

                        <div className="rounded-[10px] bg-[#F8FAFC] p-2.5 border border-[#E2E8F0] text-[12px] space-y-1">
                          <p className="font-semibold text-[#075844]">📞 Central Comercial do Norte:</p>
                          <p className="text-[#334155]">(91) 4042-0513 · WhatsApp Vendas</p>
                          <p className="text-[11px] text-[#64748B]">Seg a Sex: 07h às 18h | Sáb: 07h às 12h30</p>
                        </div>

                        <div className="rounded-[10px] bg-[#F8FAFC] p-2.5 border border-[#E2E8F0] text-[12px] space-y-1">
                          <p className="font-semibold text-[#075844]">🏢 Matriz São Brás:</p>
                          <p className="text-[#334155]">Av. Rômulo Maiorana, 115 — São Brás, Belém - PA</p>
                        </div>

                        <div className="rounded-[10px] bg-[#F8FAFC] p-2.5 border border-[#E2E8F0] text-[12px] space-y-1">
                          <p className="font-semibold text-[#075844]">🏪 Filial Mauriti Pedreira:</p>
                          <p className="text-[#334155]">Tv. Mauriti, 1124 — Pedreira, Belém - PA</p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <button
                          className="w-full rounded-[10px] bg-[#00A884] hover:bg-[#075844] text-[#FFFFFF] font-semibold text-[13px] py-2.5 px-3 transition-colors cursor-pointer"
                          onClick={handleStartTourFromChat}
                          type="button"
                        >
                          🧭 Fazer Tour Guiado na Loja
                        </button>
                        <button
                          className="w-full rounded-[10px] border border-[#CBD5E1] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] font-medium text-[12.5px] py-2 px-3 transition-colors cursor-pointer"
                          onClick={() => setIsSidebarOpen(false)}
                          type="button"
                        >
                          Voltar ao atendimento
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
