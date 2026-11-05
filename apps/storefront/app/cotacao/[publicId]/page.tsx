import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { WebAlert, WebBadge, WebCard } from '@commerce/ui/web';
import { getQuote, mediaUrl } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/format';
import { resolveProductImage } from '@/lib/product-placeholders';
import { QUOTE_STATUS_LABELS } from '@/lib/types';
import { COMMERCIAL_STORES, findStoreById, buildWhatsAppLink } from '@/lib/stores-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cotação enviada | Comercial do Norte',
  robots: { index: false, follow: false },
};

type Params = Promise<{ publicId: string }>;
type SearchParams = Promise<{ storeId?: string }>;

export default async function QuoteConfirmationPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { publicId } = await params;
  const query = searchParams ? await searchParams : {};
  const quote = await getQuote(publicId);
  if (!quote) notFound();

  let store = findStoreById(query.storeId);
  if (quote.notes) {
    const match = quote.notes.match(/\[Unidade\/Loja mais próxima:\s*([^\]]+)\]/i);
    if (match) {
      const found = COMMERCIAL_STORES.find(
        (s) => s.name.toLowerCase().includes(match[1].toLowerCase()) || s.shortTitle.toLowerCase().includes(match[1].toLowerCase())
      );
      if (found) store = found;
    }
  }

  const itemsList = quote.items.map((i) => `• ${i.quantity}x ${i.productName} (SKU: ${i.sku})`).join('\n');
  const whatsappMsg = `Olá, equipe Comercial do Norte (Loja ${store.shortTitle})!\nAcabei de registrar uma cotação pelo site.\n\nProtocolo: #${quote.publicId}\nCliente: ${quote.customerName}\nWhatsApp: ${quote.customerPhone}\nTotal de referência: ${formatMoney(quote.subtotalCents)} (${quote.itemsCount} itens)\n\nItens solicitados:\n${itemsList}\n\nGostaria de confirmar a disponibilidade e prazo de retirada/entrega!`;
  const whatsappUrl = buildWhatsAppLink(store.whatsappDigits, whatsappMsg);

  return (
    <div className="cn-container py-10">
      <div className="mx-auto max-w-3xl">
        <WebCard className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 aria-hidden className="mt-0.5 size-7 text-ok" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-ink">Cotação enviada com sucesso</h1>
                <WebBadge tone="success">{QUOTE_STATUS_LABELS[quote.status] ?? quote.status}</WebBadge>
              </div>
              <p className="mt-1 text-sm text-muted">
                Protocolo <strong className="text-ink">{quote.publicId}</strong>
              </p>
              <p className="mt-1 text-xs text-muted">Solicitada em {formatDate(quote.createdAt)}</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-surface-soft px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-muted">Solicitante</dt>
              <dd className="text-sm font-semibold text-ink">{quote.customerName}</dd>
            </div>
            <div className="rounded-md bg-surface-soft px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-muted">WhatsApp</dt>
              <dd className="text-sm font-semibold text-ink">{quote.customerPhone}</dd>
            </div>
            {quote.companyName ? (
              <div className="rounded-md bg-surface-soft px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-muted">Empresa</dt>
                <dd className="text-sm font-semibold text-ink">{quote.companyName}</dd>
              </div>
            ) : null}
            <div className="rounded-md bg-surface-soft px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-muted">Loja de Atendimento</dt>
              <dd className="text-sm font-semibold text-[#004CB1]">📍 {store.shortTitle}</dd>
            </div>
            <div className="rounded-md bg-surface-soft px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-muted">Itens</dt>
              <dd className="text-sm font-semibold text-ink">{quote.itemsCount}</dd>
            </div>
          </dl>

          <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-ink">Itens solicitados</h2>
          <ul className="mt-2 divide-y divide-line">
            {quote.items.map((item) => {
              const image = resolveProductImage(item.productSlug || item.sku);
              return (
                <li className="flex items-center gap-3 py-3" key={`${item.sku}-${item.productSlug}`}>
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-100 bg-white p-1">
                    <Image alt={`${item.productName} (Imagem ilustrativa)`} className="size-full object-contain" height={48} src={image} unoptimized width={48} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link className="truncate text-sm font-semibold text-ink hover:text-brand" href={`/produto/${item.productSlug}`}>
                      {item.productName}
                    </Link>
                    <p className="text-xs text-muted">SKU {item.sku} · {item.quantity} un.</p>
                  </div>
                  <p className="text-sm font-semibold text-ink">{formatMoney(item.totalCents)}</p>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm text-muted">Total de referência</span>
            <strong className="text-lg font-extrabold text-brand">{formatMoney(quote.subtotalCents)}</strong>
          </div>

          {/* CARD DE AÇÃO RÁPIDA WHATSAPP COM A LOJA SELECIONADA */}
          <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <strong className="text-sm font-bold text-emerald-950">
                  Agilize seu atendimento no WhatsApp da Loja
                </strong>
              </div>
              <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                Envie a lista de cotação diretamente para a equipe da <strong>{store.shortTitle}</strong> ({store.address}) para fechar condições de atacado e entrega.
              </p>
            </div>
            <a
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#128C7E] px-5 py-3 text-sm font-bold text-white shadow-sm transition whitespace-nowrap shrink-0"
              href={whatsappUrl}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle className="size-4.5" />
              Enviar pelo WhatsApp da Loja
            </a>
          </div>

          <WebAlert className="mt-6" title="Próximos passos" tone="info">
            A equipe comercial entra em contato pelo WhatsApp informado com a proposta. Nenhum pagamento foi feito
            pelo site: a negociação e o fechamento acontecem com a loja.
          </WebAlert>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-pill bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover" href="/loja">
              Continuar no catálogo
            </Link>
            <Link className="rounded-pill border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-brand" href="/cotacao">
              Enviar nova cotação
            </Link>
          </div>
        </WebCard>

        <p className="mt-4 text-center text-xs text-muted">
          Guarde o protocolo <strong>{quote.publicId}</strong> para acompanhar o atendimento.
        </p>
      </div>
    </div>
  );
}
