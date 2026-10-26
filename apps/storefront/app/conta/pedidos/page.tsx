'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { formatMoney } from '@/lib/format';
import { resolveProductImage } from '@/lib/product-placeholders';

type QuoteItem = {
  variantId: string;
  name: string;
  productSlug?: string;
  sku?: string;
  quantity: number;
  unitPriceCents: number;
};

type UserQuote = {
  publicId: string;
  createdAt: string;
  status: 'PENDING' | 'ANALYSIS' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  statusLabel: string;
  itemsCount: number;
  subtotalCents: number;
  items: QuoteItem[];
};

const DEFAULT_SEED_QUOTES: UserQuote[] = [
  {
    publicId: 'CN-2026-8491',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: 'ANALYSIS',
    statusLabel: 'Em Análise Comercial',
    itemsCount: 3,
    subtotalCents: 18450,
    items: [
      {
        variantId: 'var-1',
        name: 'Detergente Neutro 5L Uso Profissional',
        productSlug: 'detergente-neutro-5l',
        sku: 'DET-001',
        quantity: 4,
        unitPriceCents: 2490,
      },
      {
        variantId: 'var-2',
        name: 'Filme PVC Transparente 30cm x 300m',
        productSlug: 'filme-pvc-30cm',
        sku: 'PVC-300',
        quantity: 2,
        unitPriceCents: 3890,
      },
      {
        variantId: 'var-3',
        name: 'Copo Descartável 200ml (Caixa com 2500 unidades)',
        productSlug: 'copo-200ml',
        sku: 'COP-200',
        quantity: 1,
        unitPriceCents: 4790,
      },
    ],
  },
  {
    publicId: 'CN-2026-7210',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    status: 'COMPLETED',
    statusLabel: 'Concluído / Entregue',
    itemsCount: 2,
    subtotalCents: 12900,
    items: [
      {
        variantId: 'var-4',
        name: 'Forminha para Docinhos Nº 5 Branca (Milheiro)',
        productSlug: 'forminha-docinho-n5',
        sku: 'FOR-005',
        quantity: 5,
        unitPriceCents: 1490,
      },
      {
        variantId: 'var-5',
        name: 'Velas de Aniversário Coloridas Sortidas',
        productSlug: 'velas-aniversario-coloridas',
        sku: 'VEL-010',
        quantity: 10,
        unitPriceCents: 545,
      },
    ],
  },
];

export default function PedidosPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<UserQuote[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ANALYSIS' | 'COMPLETED'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Carrega cotações salvas localmente
    try {
      const storedRaw = window.localStorage.getItem('cn.user_quotes');
      let customQuotes: UserQuote[] = [];
      if (storedRaw) {
        customQuotes = JSON.parse(storedRaw);
      }
      setQuotes([...customQuotes, ...DEFAULT_SEED_QUOTES]);
    } catch {
      setQuotes(DEFAULT_SEED_QUOTES);
    }
  }, []);

  const filteredQuotes = quotes.filter((q) => {
    if (filter === 'ANALYSIS' && q.status !== 'ANALYSIS' && q.status !== 'PENDING') return false;
    if (filter === 'COMPLETED' && q.status !== 'COMPLETED') return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      const matchId = q.publicId.toLowerCase().includes(s);
      const matchItems = q.items.some((i) => i.name.toLowerCase().includes(s));
      return matchId || matchItems;
    }
    return true;
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="size-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Meus Pedidos &amp; Cotações</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Acompanhe o andamento de orçamentos, propostas de atacado e pedidos anteriores.
              </p>
            </div>
          </div>

          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#004CB1] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#003882] transition"
            href="/loja"
          >
            <ShoppingBag className="size-4" />
            <span>Fazer nova cotação</span>
          </Link>
        </div>

        {/* FILTROS E BUSCA */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => setFilter('ALL')}
              type="button"
            >
              Todos ({quotes.length})
            </button>
            <button
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                filter === 'ANALYSIS'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => setFilter('ANALYSIS')}
              type="button"
            >
              Em análise
            </button>
            <button
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                filter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => setFilter('COMPLETED')}
              type="button"
            >
              Concluídos
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#004CB1] focus:bg-white focus:outline-hidden transition"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por protocolo ou item…"
              type="text"
              value={search}
            />
            <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* LISTA DE COTAÇÕES E PEDIDOS */}
      {filteredQuotes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Package className="size-8 stroke-[1.5]" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">Nenhum pedido ou cotação encontrado</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? 'Nenhum resultado corresponde à sua pesquisa. Tente outros termos.'
              : 'Você ainda não enviou cotações com este filtro. Explore nosso catálogo de produtos!'}
          </p>
          <div className="mt-6">
            <Link
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#004CB1] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#003882] transition"
              href="/loja"
            >
              <span>Explorar catálogo completo</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => {
            const isCompleted = quote.status === 'COMPLETED';
            const whatsappText = encodeURIComponent(
              `Olá, sou ${user.fullName || user.firstName} e gostaria de acompanhar minha cotação protocolo ${quote.publicId} na Comercial do Norte.`,
            );
            const whatsappUrl = `https://wa.me/5591983440880?text=${whatsappText}`;

            return (
              <div
                key={quote.publicId}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition hover:border-[#004CB1]/30 hover:shadow-md"
              >
                {/* CABEÇALHO DO CARD */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Protocolo: <span className="text-[#004CB1] font-mono">{quote.publicId}</span>
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="size-3.5" />
                      {new Date(quote.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>{quote.statusLabel}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-bold text-amber-800">
                        <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>{quote.statusLabel}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* ITENS DA COTAÇÃO */}
                <div className="p-4 sm:p-6 divide-y divide-slate-100">
                  {quote.items.map((item) => {
                    const img = resolveProductImage(item.productSlug || item.sku || '');
                    return (
                      <div className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0" key={item.variantId}>
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white p-1">
                          <Image
                            alt={item.name}
                            className="size-full object-contain"
                            fill
                            sizes="56px"
                            src={img}
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="truncate text-xs sm:text-sm font-bold text-slate-800">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Qtd: <strong>{item.quantity}</strong> un. · Valor ref: {formatMoney(item.unitPriceCents)}
                          </p>
                        </div>
                        <div className="text-right">
                          <strong className="block text-xs sm:text-sm font-bold text-slate-900">
                            {formatMoney(item.unitPriceCents * item.quantity)}
                          </strong>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* RODAPÉ DO CARD: TOTAL E AÇÕES */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 p-4 sm:px-6">
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-slate-500">
                      Total de referência:
                    </span>
                    <strong className="text-base sm:text-lg font-black text-[#004CB1]">
                      {formatMoney(quote.subtotalCents)}
                    </strong>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition"
                      href={whatsappUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <MessageSquare className="size-3.5" />
                      <span>Acompanhar no WhatsApp</span>
                    </a>

                    <Link
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                      href={`/conta/trocas?protocolo=${quote.publicId}`}
                    >
                      <RefreshCw className="size-3.5" />
                      <span>Troca / Devolução</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
