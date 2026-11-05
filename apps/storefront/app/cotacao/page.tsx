'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import {
  WebAlert,
  WebButton,
  WebCard,
  WebEmptyState,
  WebField,
  WebInput,
  WebTextarea,
} from '@commerce/ui/web';
import { useQuoteCart } from '@/components/quote-cart-provider';
import { useAuth } from '@/components/auth-provider';
import { ShoppingBag, MessageCircle } from 'lucide-react';
import { API_URL, mediaUrl } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import { resolveProductImage } from '@/lib/product-placeholders';
import { COMMERCIAL_STORES, findStoreById, buildWhatsAppLink } from '@/lib/stores-data';

type FieldErrors = Record<string, string[]>;

export default function QuoteFormPage() {
  const { items, subtotalCents, count, updateQuantity, remove, clear, ready } = useQuoteCart();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [selectedStoreId, setSelectedStoreId] = useState('loja-jurunas');
  const [idempotencyKey] = useState(() => `quote-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length || submitting) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const selectedStore = findStoreById(selectedStoreId);
    const rawNotes = String(form.get('notes') ?? '').trim();
    const finalNotes = `[Unidade/Loja mais próxima: ${selectedStore.name}]\n${rawNotes}`.trim();

    try {
      const response = await fetch(`${API_URL}/api/v1/quotes`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customerName: String(form.get('customerName') ?? ''),
          customerPhone: String(form.get('customerPhone') ?? ''),
          customerEmail: String(form.get('customerEmail') ?? '') || undefined,
          companyName: String(form.get('companyName') ?? '') || undefined,
          notes: finalNotes || undefined,
          idempotencyKey,
          items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        }),
      });

      const payload = await response.json().catch(() => null) as
        | { publicId?: string; error?: { code?: string; message?: string; fieldErrors?: FieldErrors } }
        | null;

      if (!response.ok) {
        setFieldErrors(payload?.error?.fieldErrors ?? {});
        setError(payload?.error?.message ?? 'Não foi possível enviar a cotação. Tente novamente.');
        return;
      }
      if (!payload?.publicId) {
        setError('Resposta inesperada da API. Tente novamente.');
        return;
      }

      if (typeof window !== 'undefined') {
        try {
          const stored = window.localStorage.getItem('cn.user_quotes');
          const existing = stored ? JSON.parse(stored) : [];
          const newQuote = {
            publicId: payload.publicId,
            createdAt: new Date().toISOString(),
            status: 'ANALYSIS',
            statusLabel: 'Em Análise Comercial',
            storeId: selectedStore.id,
            storeName: selectedStore.shortTitle,
            itemsCount: items.length,
            subtotalCents,
            items: items.map((i) => ({
              variantId: i.variantId,
              name: i.name,
              productSlug: i.productSlug,
              quantity: i.quantity,
              unitPriceCents: i.unitPriceCents,
            })),
          };
          window.localStorage.setItem('cn.user_quotes', JSON.stringify([newQuote, ...existing]));
          window.localStorage.setItem('cn.last_quote_store', selectedStore.id);
        } catch {
          // Silencioso em caso de restrição de storage
        }
      }

      clear();
      router.push(`/cotacao/${payload.publicId}?storeId=${selectedStore.id}`);
    } catch {
      setError('Falha de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDirectWhatsAppQuote() {
    const store = findStoreById(selectedStoreId);
    const itemsList = items.map((i) => `• ${i.quantity}x ${i.name} (SKU: ${i.sku})`).join('\n');
    const msg = `Olá, equipe Comercial do Norte (${store.shortTitle})!\nGostaria de solicitar uma cotação rápida para os seguintes itens:\n\n${itemsList}\n\nTotal de referência: ${formatMoney(subtotalCents)}\nQual a disponibilidade e prazo de retirada/entrega?`;
    const url = buildWhatsAppLink(store.whatsappDigits, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  if (!ready) return <div className="cn-container py-16 text-sm text-muted">Carregando sua lista…</div>;

  if (!items.length) {
    return (
      <div className="cn-container py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="relative mb-6 mx-auto flex size-20 items-center justify-center rounded-full bg-blue-50">
            <ShoppingBag className="size-10 text-[#004CB1]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1D2433]">Sua cotação está vazia</h2>
          <p className="mt-2 text-sm text-slate-500">
            {isAuthenticated
              ? 'Adicione produtos do catálogo para montar sua lista de cotação.'
              : 'Entre na sua conta para consultar cotações anteriores ou explore nosso catálogo.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {!isAuthenticated && (
              <Link
                className="inline-block rounded-lg bg-[#004CB1] px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#003882] transition"
                href="/login"
              >
                Entrar
              </Link>
            )}
            <Link
              className="inline-block rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              href="/loja"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cn-container py-8">
      <h1 className="text-2xl font-extrabold text-ink">Enviar cotação</h1>
      <p className="text-sm text-muted">Sem pagamento online. A equipe comercial responde pelo contato informado.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <WebCard>
          <form noValidate onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <WebField
                className="sm:col-span-2"
                error={fieldErrors.customerName?.join(' ')}
                id="customerName"
                label="Nome completo"
                required
              >
                <WebInput
                  aria-describedby={fieldErrors.customerName ? 'customerName-error' : undefined}
                  id="customerName"
                  invalid={Boolean(fieldErrors.customerName)}
                  name="customerName"
                  defaultValue={user?.fullName || ""}
                  required
                />
              </WebField>

              <WebField
                error={fieldErrors.customerPhone?.join(' ')}
                id="customerPhone"
                label="WhatsApp"
                required
              >
                <WebInput
                  aria-describedby={fieldErrors.customerPhone ? 'customerPhone-error' : undefined}
                  id="customerPhone"
                  inputMode="tel"
                  invalid={Boolean(fieldErrors.customerPhone)}
                  name="customerPhone"
                  placeholder="(91) 90000-0000"
                  required
                />
              </WebField>

              {/* SELEÇÃO DA LOJA MAIS PRÓXIMA (MULTI-LOJAS) */}
              <div className="sm:col-span-2 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-1" htmlFor="preferredStoreId">
                  📍 Qual a loja mais próxima de você? <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-3 leading-snug">
                  Selecione a unidade responsável por atender sua cotação, garantir melhores preços de atacado e separar os itens para pronta-entrega ou retirada:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMERCIAL_STORES.map((st) => (
                    <label
                      key={st.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        selectedStoreId === st.id
                          ? 'border-[#004CB1] bg-blue-50/70 ring-2 ring-[#004CB1]/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="preferredStoreId"
                        value={st.id}
                        checked={selectedStoreId === st.id}
                        onChange={() => setSelectedStoreId(st.id)}
                        className="mt-0.5 text-[#004CB1] focus:ring-[#004CB1]"
                      />
                      <div className="min-w-0">
                        <strong className="block text-slate-900 font-bold">{st.shortTitle}</strong>
                        <span className="block text-[11px] text-slate-500 leading-tight mt-0.5">{st.address}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <WebField
                error={fieldErrors.customerEmail?.join(' ')}
                id="customerEmail"
                label="E-mail (opcional)"
              >
                <WebInput
                  aria-describedby={fieldErrors.customerEmail ? 'customerEmail-error' : undefined}
                  id="customerEmail"
                  invalid={Boolean(fieldErrors.customerEmail)}
                  name="customerEmail"
                  type="email"
                />
              </WebField>

              <WebField className="sm:col-span-2" id="companyName" label="Empresa (opcional)">
                <WebInput id="companyName" name="companyName" />
              </WebField>

              <WebField className="sm:col-span-2" id="notes" label="Observações">
                <WebTextarea
                  id="notes"
                  name="notes"
                  placeholder="Prazo, endereço de entrega, condições..."
                  rows={4}
                />
              </WebField>
            </div>

            {error ? (
              <WebAlert className="mt-4" tone="error">
                {error}
              </WebAlert>
            ) : null}

            <WebButton
              className="mt-5 py-3 text-sm font-bold"
              disabled={submitting}
              fullWidth
              loading={submitting}
              type="submit"
              variant="promo"
            >
              {submitting ? 'Enviando…' : 'Enviar cotação'}
            </WebButton>
            <p className="mt-2 text-center text-xs text-muted">
              Ao enviar, você concorda com o contato da equipe comercial sobre esta cotação.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500 mb-2 font-medium">Prefere fechar agora pelo WhatsApp da loja?</p>
              <button
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#128C7E] px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition shadow-sm cursor-pointer"
                onClick={handleDirectWhatsAppQuote}
                type="button"
              >
                <MessageCircle className="size-4" />
                Cotar direto no WhatsApp da {findStoreById(selectedStoreId).shortTitle}
              </button>
            </div>
          </form>
        </WebCard>

        <WebCard className="h-fit">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Itens ({count})</h2>
          <ul className="mt-3 divide-y divide-line">
            {items.map((item) => {
              const image = resolveProductImage(item.productSlug || item.variantId);
              return (
                <li className="flex gap-3 py-3" key={item.variantId}>
                  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-100 bg-white p-1">
                    <Image alt={`${item.name} (Imagem ilustrativa)`} className="size-full object-contain" height={56} src={image} unoptimized width={56} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-muted">{formatMoney(item.unitPriceCents)} · SKU {item.sku}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center rounded-pill border border-line">
                        <button aria-label="Diminuir" className="p-1 hover:bg-surface-soft" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} type="button"><Minus aria-hidden className="size-3" /></button>
                        <span className="min-w-7 text-center text-xs">{item.quantity}</span>
                        <button aria-label="Aumentar" className="p-1 hover:bg-surface-soft" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} type="button"><Plus aria-hidden className="size-3" /></button>
                      </div>
                      <button aria-label={`Remover ${item.name}`} className="p-1 text-muted hover:text-promo" onClick={() => remove(item.variantId)} type="button"><Trash2 aria-hidden className="size-3.5" /></button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-ink">{formatMoney(item.unitPriceCents * item.quantity)}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
            <span className="text-muted">Total de referência</span>
            <strong className="text-ink">{formatMoney(subtotalCents)}</strong>
          </div>
          <p className="mt-2 text-xs text-muted">Valores de referência; a proposta final é enviada pela equipe comercial.</p>
        </WebCard>
      </div>
    </div>
  );
}
