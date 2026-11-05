export type LeadStage = 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'WON' | 'LOST';

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  NEW: 'Novos Leads',
  CONTACTED: 'Em Atendimento',
  IN_PROGRESS: 'Cotação / Negociação',
  WON: 'Convertido / Ganho',
  LOST: 'Perdido / Arquivado',
};

export const LEAD_STAGE_COLORS: Record<LeadStage, { bg: string; text: string; border: string }> = {
  NEW: { bg: '#EFF6FF', text: '#1D4ED8', border: '#93C5FD' },
  CONTACTED: { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D' },
  IN_PROGRESS: { bg: '#F3E8FF', text: '#7E22CE', border: '#D8B4FE' },
  WON: { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  LOST: { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },
};

export type ChatMessage = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
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
  conversationLog?: ChatMessage[] | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
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
