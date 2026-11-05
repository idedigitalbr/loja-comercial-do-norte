import { BotStep, ChatMessage } from '../components/nort-chat-floating';

export type TicketEventType =
  | 'start'
  | 'identify'
  | 'select_unit'
  | 'select_category'
  | 'select_service'
  | 'edit_data'
  | 'change_unit'
  | 'finish';

export type TicketEvent = {
  id: string;
  ticketId: string;
  timestamp: number;
  timeFormatted: string;
  type: TicketEventType;
  actionText: string;
  details?: string;
  step?: BotStep;
};

export type NortTicket = {
  id: string; // Ex: "#000125"
  numericId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  storeId: string;
  storeName: string;
  title: string;
  category: string;
  status: 'in_progress' | 'finished';
  step: BotStep;
  createdAt: number;
  updatedAt: number;
  finishedAt?: number;
  messages: ChatMessage[];
  events: TicketEvent[];
  origin: 'chat-nort-site';
};

export const NORT_TICKETS_STORAGE_KEY = 'cn_nort_tickets_v1';
export const NORT_ACTIVE_TICKET_ID_KEY = 'cn_nort_active_ticket_id';

/**
 * Títulos automáticos e determinísticos baseados nas escolhas reais do cliente (Sem IA).
 */
export function generateTicketTitle(
  events: TicketEvent[],
  currentTitle?: string
): { title: string; category: string } {
  for (let i = events.length - 1; i >= 0; i--) {
    const ev = events[i];
    const text = (ev.actionText || '').toLowerCase();
    const details = (ev.details || '').toLowerCase();
    const combined = `${text} ${details}`;

    if (combined.includes('cotação') || combined.includes('solicitar uma cotação')) {
      return {
        title: 'Solicitação de cotação de produtos',
        category: 'Produtos & Cotação',
      };
    }
    if (combined.includes('catálogo') || combined.includes('consultar produto')) {
      return {
        title: 'Consulta de produtos no catálogo',
        category: 'Produtos & Cotação',
      };
    }
    if (combined.includes('atendente humano') || combined.includes('falar com um atendente')) {
      return {
        title: 'Atendimento com atendente humano',
        category: 'Atendimento & Setores',
      };
    }
    if (combined.includes('jurídico')) {
      return {
        title: 'Contato com o setor jurídico',
        category: 'Atendimento & Setores',
      };
    }
    if (combined.includes('vendas')) {
      return {
        title: 'Atendimento comercial de vendas',
        category: 'Atendimento & Setores',
      };
    }
    if (combined.includes('endereço') || combined.includes('horário')) {
      return {
        title: 'Consulta de endereços e horários',
        category: 'Atendimento & Setores',
      };
    }
    if (combined.includes('cep') || combined.includes('entrega')) {
      return {
        title: 'Consulta sobre entregas e CEP',
        category: 'Site / Loja Virtual',
      };
    }
    if (combined.includes('login') || combined.includes('senha') || combined.includes('recuperar')) {
      return {
        title: 'Recuperação de login e senha',
        category: 'Site / Loja Virtual',
      };
    }
    if (combined.includes('tour')) {
      return {
        title: 'Tour guiado pela loja virtual',
        category: 'Site / Loja Virtual',
      };
    }
    if (combined.includes('faturamento') || combined.includes('pagamento')) {
      return {
        title: 'Dúvidas sobre faturamento e pagamento',
        category: 'Produtos & Cotação',
      };
    }
    if (combined.includes('suporte')) {
      return {
        title: 'Suporte técnico da loja virtual',
        category: 'Site / Loja Virtual',
      };
    }
  }

  // Fallback baseado na unidade
  const unitEvent = events.find((e) => e.type === 'select_unit');
  if (unitEvent && unitEvent.details) {
    return {
      title: `Atendimento — ${unitEvent.details}`,
      category: 'Atendimento Geral',
    };
  }

  if (currentTitle && currentTitle !== 'Novo atendimento') {
    return { title: currentTitle, category: 'Atendimento Geral' };
  }

  return {
    title: 'Novo atendimento',
    category: 'Atendimento Geral',
  };
}

export function formatTicketNumber(num: number): string {
  return `#${String(num).padStart(6, '0')}`;
}

export function loadStoredTickets(): NortTicket[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(NORT_TICKETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as NortTicket[];
    }
  } catch {
    // Fallback
  }
  return [];
}

export function saveStoredTickets(tickets: NortTicket[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NORT_TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // Quota fallback
  }
}

export function getActiveTicketId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(NORT_ACTIVE_TICKET_ID_KEY);
  } catch {
    return null;
  }
}

export function setActiveTicketId(ticketId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (ticketId) {
      window.localStorage.setItem(NORT_ACTIVE_TICKET_ID_KEY, ticketId);
    } else {
      window.localStorage.removeItem(NORT_ACTIVE_TICKET_ID_KEY);
    }
  } catch {
    // Quota fallback
  }
}

/**
 * Agrupamento cronológico: Hoje, Ontem, Esta semana, Datas anteriores.
 */
export function groupTicketsChronologically(
  tickets: NortTicket[]
): Record<string, NortTicket[]> {
  const groups: Record<string, NortTicket[]> = {
    Hoje: [],
    Ontem: [],
    'Esta semana': [],
    'Datas anteriores': [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

  // Ordena por data decrescente
  const sorted = [...tickets].sort((a, b) => b.updatedAt - a.updatedAt);

  sorted.forEach((t) => {
    const time = t.updatedAt || t.createdAt;
    if (time >= todayStart) {
      groups['Hoje'].push(t);
    } else if (time >= yesterdayStart) {
      groups['Ontem'].push(t);
    } else if (time >= weekStart) {
      groups['Esta semana'].push(t);
    } else {
      groups['Datas anteriores'].push(t);
    }
  });

  return groups;
}

export function formatTicketDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} · ${hours}:${mins}`;
}
