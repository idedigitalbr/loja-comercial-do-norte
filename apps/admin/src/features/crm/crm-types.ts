import type { QuoteStatus } from '../quotes/quotes-utils';

export type LeadStage = 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'WON' | 'LOST';
export type CrmOriginFilter = 'ALL' | 'QUOTE' | 'CHAT';
export type CrmViewMode = 'kanban' | 'list';

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  NEW: 'Novos Leads',
  CONTACTED: 'Em Atendimento',
  IN_PROGRESS: 'Cotação / Negociação',
  WON: 'Convertido / Ganho',
  LOST: 'Perdido / Arquivado',
};

export const LEAD_STAGE_COLORS: Record<LeadStage, { bg: string; text: string; border: string; dot: string }> = {
  NEW: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', dot: '#2563EB' },
  CONTACTED: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', dot: '#D97706' },
  IN_PROGRESS: { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF', dot: '#9333EA' },
  WON: { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0', dot: '#16A34A' },
  LOST: { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', dot: '#64748B' },
};

export type ChatMessage = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
};

export type ConversationLogPayload =
  | ChatMessage[]
  | {
      ticketId?: string;
      title?: string;
      category?: string;
      status?: string;
      messages?: ChatMessage[];
    }
  | null;

export type LeadQuoteItem = {
  id: string;
  productName: string;
  productSlug?: string;
  sku: string;
  imagePath?: string | null;
  quantity: number;
  unitPriceCents: number | null;
  totalCents: number | null;
};

export type LeadQuote = {
  id: string;
  publicId: string;
  status: QuoteStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  companyName?: string | null;
  document?: string | null;
  notes?: string | null;
  itemsCount: number;
  subtotalCents: number;
  createdAt: string;
  answeredAt?: string | null;
  closedAt?: string | null;
  items: LeadQuoteItem[];
};

export type CrmLead = {
  id: string;
  publicId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  preferredStore: string;
  storeId?: string | null;
  subject: string;
  stage: LeadStage;
  origin: string;
  conversationLog?: ConversationLogPayload;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  quotes?: LeadQuote[];
  leadNotes?: Array<{
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
  }>;
};

export const STORE_OPTIONS = [
  { id: 'ALL', name: 'Todas as Lojas' },
  { id: 'loja-jurunas', name: 'Bernardo Sayão (Jurunas)' },
  { id: 'loja-sao-bras', name: 'Matriz São Brás' },
  { id: 'loja-pedreira-mauriti', name: 'Filial Mauriti (Pedreira)' },
  { id: 'loja-guama', name: 'Filial Guamá' },
  { id: 'loja-cidade-nova', name: 'Filial Cidade Nova (Ananindeua)' },
  { id: 'loja-atacado-delivery', name: 'Vendas Online & Delivery' },
];

export function extractChatMessages(log: ConversationLogPayload | undefined): {
  messages: ChatMessage[];
  ticketId?: string;
  category?: string;
} {
  if (!log) return { messages: [] };
  if (Array.isArray(log)) return { messages: log };
  if (typeof log === 'object') {
    return {
      messages: Array.isArray(log.messages) ? log.messages : [],
      ticketId: log.ticketId,
      category: log.category,
    };
  }
  return { messages: [] };
}

export function getLeadOriginMeta(lead: CrmLead): {
  hasQuote: boolean;
  hasChat: boolean;
  kind: 'QUOTE' | 'CHAT' | 'HYBRID';
  label: string;
} {
  const quotes = lead.quotes ?? [];
  const chat = extractChatMessages(lead.conversationLog);
  const hasQuote = quotes.length > 0 || lead.origin === 'cotacao-site';
  const hasChat = chat.messages.length > 0 || lead.origin === 'chat-norti';

  if (quotes.length > 0 && chat.messages.length > 0) {
    return { hasQuote: true, hasChat: true, kind: 'HYBRID', label: 'Chat + Cotação' };
  }
  if (hasQuote) {
    return { hasQuote: true, hasChat: false, kind: 'QUOTE', label: 'Cotação do Site' };
  }
  return { hasQuote: false, hasChat: true, kind: 'CHAT', label: 'Chat Norti' };
}
