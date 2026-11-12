import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Store,
  Truck,
} from 'lucide-react';
import { WebAlert, WebBadge } from '@commerce/ui/web';
import { QuoteFlowStepper } from '@/components/quote-flow-stepper';
import { getQuote } from '@/lib/api';
import { formatDate, formatMoneyOrQuote } from '@/lib/format';
import { resolveProductImage } from '@/lib/product-placeholders';
import { QUOTE_STATUS_LABELS } from '@/lib/types';
import {
  COMMERCIAL_STORES,
  buildWhatsAppLink,
  findStoreById,
} from '@/lib/stores-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cotação enviada | Comercial do Norte',
  robots: { index: false, follow: false },
};

type Params = Promise<{ publicId: string }>;
type SearchParams = Promise<{ storeId?: string }>;

function parseQuoteNotesMetadata(notes: string | null | undefined) {
  if (!notes) {
    return {
      storeHint: null as string | null,
      modality: null as string | null,
      distanceHint: null as string | null,
      cleanNotes: '',
    };
  }

  let storeHint: string | null = null;
  let modality: string | null = null;
  let distanceHint: string | null = null;
  const remainingLines: string[] = [];

  for (const rawLine of notes.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const storeMatch = line.match(/^\[Unidade\/Loja mais próxima:\s*([^\]]+)\]$/i);
    if (storeMatch) {
      storeHint = storeMatch[1].trim();
      continue;
    }

    const modalityMatch = line.match(/^\[Modalidade:\s*([^\]]+)\]$/i);
    if (modalityMatch) {
      modality = modalityMatch[1].trim();
      continue;
    }

    const distanceMatch = line.match(/^\[Distância estimada:\s*([^\]]+)\]$/i);
    if (distanceMatch) {
      distanceHint = distanceMatch[1].trim();
      continue;
    }

    remainingLines.push(rawLine);
  }

  return {
    storeHint,
    modality,
    distanceHint,
    cleanNotes: remainingLines.join('\n').trim(),
  };
}

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

  const parsedNotes = parseQuoteNotesMetadata(quote.notes);

  let store = findStoreById(query.storeId);
  if (!query.storeId && parsedNotes.storeHint) {
    const hint = parsedNotes.storeHint.toLowerCase();
    const found = COMMERCIAL_STORES.find(
      (s) => s.name.toLowerCase().includes(hint) || s.shortTitle.toLowerCase().includes(hint),
    );
    if (found) store = found;
  }

  const itemsList = quote.items.map((i) => `• ${i.quantity}x ${i.productName} (SKU: ${i.sku})`).join('\n');
  const modalityLine = parsedNotes.modality ? `\nModalidade: ${parsedNotes.modality}` : '';
  const whatsappMsg = `Olá, equipe Comercial do Norte (Loja ${store.shortTitle})!\nAcabei de registrar uma cotação pelo site.\n\nProtocolo: #${quote.publicId}\nCliente: ${quote.customerName}\nWhatsApp: ${quote.customerPhone}${modalityLine}\nTotal de referência: ${formatMoneyOrQuote(quote.subtotalCents)} (${quote.itemsCount} itens)\n\nItens solicitados:\n${itemsList}\n\nGostaria de confirmar a disponibilidade e prazo de retirada/entrega!`;
  const whatsappUrl = buildWhatsAppLink(store.whatsappDigits, whatsappMsg);

  const isDelivery = parsedNotes.modality?.toLowerCase().includes('entrega');

  return (
    <div className="min-h-[75vh] bg-[#F4F7FB] py-8 sm:py-10">
      <div className="cn-container">
        <div className="mx-auto max-w-3xl space-y-5">
          {/* Trilha de Etapas Concluída */}
          <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] sm:px-5 sm:py-4">
            <QuoteFlowStepper currentStep={3} itemsCount={quote.itemsCount} />
          </div>

          {/* Card Principal de Confirmação */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_6px_28px_rgba(15,23,42,0.06)]">
            {/* Banner Superior de Sucesso */}
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-white to-blue-50/50 p-6">
              <div className="flex items-start gap-3.5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 aria-hidden className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-extrabold text-[#1D2433] sm:text-2xl">
                      Sua cotação foi enviada com sucesso
                    </h1>
                    <WebBadge tone="success">{QUOTE_STATUS_LABELS[quote.status] ?? quote.status}</WebBadge>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-emerald-900">
                    Aguarde para que nossos atendentes entrem em contato com você por WhatsApp!
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Protocolo <strong className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[#1D2433]">{quote.publicId}</strong>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Solicitada em {formatDate(quote.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Resumo do Solicitante e Unidade */}
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Solicitante</dt>
                  <dd className="mt-0.5 text-sm font-bold text-[#1D2433]">{quote.customerName}</dd>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">WhatsApp</dt>
                  <dd className="mt-0.5 text-sm font-bold text-[#1D2433]">{quote.customerPhone}</dd>
                </div>
                {quote.companyName ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Empresa</dt>
                    <dd className="mt-0.5 text-sm font-bold text-[#1D2433]">{quote.companyName}</dd>
                  </div>
                ) : null}
                {parsedNotes.modality ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Modalidade</dt>
                    <dd className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-bold text-[#1D2433]">
                      {isDelivery ? (
                        <Truck className="size-4 text-[#004CB1]" />
                      ) : (
                        <Store className="size-4 text-[#004CB1]" />
                      )}
                      <span>{parsedNotes.modality}</span>
                    </dd>
                  </div>
                ) : null}
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2.5 sm:col-span-2">
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-[#004CB1]">
                    Loja de Atendimento
                  </dt>
                  <dd className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#004CB1]">
                        <MapPin className="size-4 shrink-0" />
                        <span>{store.shortTitle}</span>
                      </span>
                      <p className="text-xs text-slate-600">{store.address}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5 text-slate-400" />
                        {store.hours.split('|')[0]?.trim()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-3.5 text-slate-400" />
                        {store.phone}
                      </span>
                    </div>
                  </dd>
                  {parsedNotes.distanceHint ? (
                    <p className="mt-1 text-[11px] font-semibold text-[#004CB1]">
                      Distância informada: {parsedNotes.distanceHint}
                    </p>
                  ) : null}
                </div>
              </dl>

              {parsedNotes.cleanNotes ? (
                <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Observações enviadas
                  </p>
                  <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-700">
                    {parsedNotes.cleanNotes}
                  </p>
                </div>
              ) : null}

              {/* Itens Solicitados */}
              <div className="mt-6 flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#1D2433]">
                  Itens solicitados
                </h2>
                <span className="text-xs font-bold text-slate-500">{quote.itemsCount} un.</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {quote.items.map((item) => {
                  const image = resolveProductImage({ slug: item.productSlug || item.sku, imagePath: item.imagePath });
                  return (
                    <li className="flex items-center gap-3 py-3.5" key={`${item.sku}-${item.productSlug}`}>
                      <div className="flex size-13 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1">
                        <Image alt={item.productName} className="size-full object-contain" height={52} src={image} unoptimized width={52} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link className="block truncate text-sm font-bold text-[#1D2433] transition hover:text-[#004CB1]" href={`/produto/${item.productSlug}`}>
                          {item.productName}
                        </Link>
                        <p className="text-xs text-slate-500">SKU {item.sku} · {item.quantity} un.</p>
                      </div>
                      <p className="text-sm font-extrabold text-[#1D2433]">{formatMoneyOrQuote(item.totalCents)}</p>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-600">Total de referência</span>
                <strong className="text-lg font-extrabold text-[#004CB1]">
                  {formatMoneyOrQuote(quote.subtotalCents)}
                </strong>
              </div>

              <WebAlert className="mt-5" title="Próximos passos" tone="info">
                A equipe comercial entra em contato pelo WhatsApp informado com a proposta. Nenhum pagamento foi feito
                pelo site: a negociação e o fechamento acontecem diretamente com a loja.
              </WebAlert>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="rounded-pill bg-[#004CB1] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#003882]" href="/loja">
                  Continuar no catálogo
                </Link>
                <Link className="rounded-pill border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#004CB1] hover:text-[#004CB1]" href="/cotacao">
                  Enviar nova cotação
                </Link>
              </div>
            </div>
          </div>

          {/* Aviso Opcional lá embaixo: Adiantar no WhatsApp */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/85 p-5 shadow-xs sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <strong className="text-sm font-extrabold text-emerald-950">
                  Quer adiantar a conversa no WhatsApp?
                </strong>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-emerald-900/90">
                Envie também esta cotação (protocolo <strong>#{quote.publicId}</strong>) via WhatsApp para a{' '}
                <strong>{store.shortTitle}</strong> — pode ser que você fure a fila e agilize ainda mais o seu atendimento!
              </p>
            </div>
            <a
              className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#25D366] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#128C7E]"
              href={whatsappUrl}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle className="size-4.5" />
              <span>Enviar cotação via WhatsApp</span>
            </a>
          </div>

          <p className="text-center text-xs text-slate-500">
            Guarde o protocolo <strong>{quote.publicId}</strong> para acompanhar o atendimento.
          </p>
        </div>
      </div>
    </div>
  );
}
