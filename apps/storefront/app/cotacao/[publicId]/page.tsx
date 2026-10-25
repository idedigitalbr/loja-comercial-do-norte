import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { WebAlert, WebBadge, WebCard } from '@commerce/ui/web';
import { getQuote, mediaUrl } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/format';
import { QUOTE_STATUS_LABELS } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cotação enviada | Comercial do Norte',
  robots: { index: false, follow: false },
};

type Params = Promise<{ publicId: string }>;

export default async function QuoteConfirmationPage({ params }: { params: Params }) {
  const { publicId } = await params;
  const quote = await getQuote(publicId);
  if (!quote) notFound();

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
              <dt className="text-xs uppercase tracking-wide text-muted">Itens</dt>
              <dd className="text-sm font-semibold text-ink">{quote.itemsCount}</dd>
            </div>
          </dl>

          <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-ink">Itens solicitados</h2>
          <ul className="mt-2 divide-y divide-line">
            {quote.items.map((item) => {
              const image = mediaUrl(item.imagePath);
              return (
                <li className="flex items-center gap-3 py-3" key={`${item.sku}-${item.productSlug}`}>
                  <div className="size-12 shrink-0 overflow-hidden rounded bg-surface-soft">
                    {image ? (
                      <Image alt={item.productName} className="size-full object-cover" height={48} src={image} width={48} />
                    ) : null}
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
