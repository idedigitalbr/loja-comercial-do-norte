import { LeadStage, QuoteStatus } from '@prisma/client';

const STORE_DIRECTORY: Array<{ id: string; name: string; keywords: string[] }> = [
  { id: 'loja-jurunas', name: 'Bernardo Sayão (Jurunas)', keywords: ['jurunas', 'bernardo say'] },
  { id: 'loja-sao-bras', name: 'Matriz São Brás', keywords: ['são brás', 'sao bras', 'matriz', 'rômulo maiorana', 'romulo maiorana'] },
  { id: 'loja-pedreira-mauriti', name: 'Filial Mauriti (Pedreira)', keywords: ['pedreira', 'mauriti'] },
  { id: 'loja-guama', name: 'Filial Guamá', keywords: ['guamá', 'guama', 'josé bonifácio', 'jose bonifacio'] },
  { id: 'loja-cidade-nova', name: 'Filial Cidade Nova (Ananindeua)', keywords: ['cidade nova', 'ananindeua', 'we-59'] },
  { id: 'loja-atacado-delivery', name: 'Vendas Online & Delivery', keywords: ['online', 'delivery', 'central'] },
];

const DEFAULT_STORE = {
  storeId: 'loja-atacado-delivery',
  preferredStore: 'Vendas Online & Delivery',
};

/**
 * Resolve loja preferencial e storeId a partir dos campos explícitos ou das tags em `notes`.
 */
export function resolveStoreFromQuote(input: {
  storeId?: string | null;
  preferredStore?: string | null;
  notes?: string | null;
}): { storeId: string; preferredStore: string } {
  const explicitId = input.storeId?.trim();
  const explicitName = input.preferredStore?.trim();

  if (explicitId) {
    const byId = STORE_DIRECTORY.find((item) => item.id === explicitId);
    if (byId) {
      return { storeId: byId.id, preferredStore: explicitName || byId.name };
    }
    return { storeId: explicitId, preferredStore: explicitName || explicitId };
  }

  const tagMatch = input.notes?.match(/\[Unidade\/Loja mais próxima:\s*([^\]]+)\]/i);
  const rawLabel = explicitName || tagMatch?.[1]?.trim() || '';
  if (rawLabel) {
    const normalized = rawLabel.toLowerCase();
    const matched = STORE_DIRECTORY.find((item) =>
      item.keywords.some((keyword) => normalized.includes(keyword)),
    );
    if (matched) {
      return { storeId: matched.id, preferredStore: matched.name };
    }
    return { storeId: DEFAULT_STORE.storeId, preferredStore: rawLabel.slice(0, 100) };
  }

  return DEFAULT_STORE;
}

/**
 * Converte o status da máquina de estados da cotação para o estágio do Kanban no CRM.
 */
export function mapQuoteStatusToLeadStage(status: QuoteStatus): LeadStage {
  switch (status) {
    case QuoteStatus.REQUESTED:
      return LeadStage.NEW;
    case QuoteStatus.IN_REVIEW:
    case QuoteStatus.ANSWERED:
      return LeadStage.IN_PROGRESS;
    case QuoteStatus.WON:
      return LeadStage.WON;
    case QuoteStatus.LOST:
    case QuoteStatus.CANCELLED:
    case QuoteStatus.EXPIRED:
      return LeadStage.LOST;
    default:
      return LeadStage.NEW;
  }
}

/**
 * Gera um assunto legível no Kanban para leads originados de cotação.
 */
export function formatQuoteLeadSubject(itemsCount: number, firstProductName?: string | null): string {
  const cleanProduct = firstProductName?.trim();
  const base = cleanProduct
    ? itemsCount > 1
      ? `Cotação: ${cleanProduct} (+${itemsCount - 1} un.)`
      : `Cotação: ${cleanProduct}`
    : `Solicitação de Cotação (${itemsCount} ${itemsCount === 1 ? 'item' : 'itens'})`;
  return base.slice(0, 200);
}
