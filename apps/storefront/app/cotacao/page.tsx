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
import { API_URL, mediaUrl } from '@/lib/api';
import { formatMoney } from '@/lib/format';

type FieldErrors = Record<string, string[]>;

export default function QuoteFormPage() {
  const { items, subtotalCents, count, updateQuantity, remove, clear, ready } = useQuoteCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [idempotencyKey] = useState(() => `quote-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length || submitting) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await fetch(`${API_URL}/api/v1/quotes`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customerName: String(form.get('customerName') ?? ''),
          customerPhone: String(form.get('customerPhone') ?? ''),
          customerEmail: String(form.get('customerEmail') ?? '') || undefined,
          companyName: String(form.get('companyName') ?? '') || undefined,
          notes: String(form.get('notes') ?? '') || undefined,
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
      clear();
      router.push(`/cotacao/${payload.publicId}`);
    } catch {
      setError('Falha de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) return <div className="cn-container py-16 text-sm text-muted">Carregando sua lista…</div>;

  if (!items.length) {
    return (
      <div className="cn-container py-16">
        <WebEmptyState
          action={
            <Link className="inline-block rounded-pill bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover" href="/loja">
              Ver catálogo
            </Link>
          }
          className="mx-auto max-w-xl"
          description="Adicione produtos do catálogo para montar sua lista."
          title="Sua cotação está vazia"
        />
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
          </form>
        </WebCard>

        <WebCard className="h-fit">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Itens ({count})</h2>
          <ul className="mt-3 divide-y divide-line">
            {items.map((item) => {
              const image = mediaUrl(item.imagePath);
              return (
                <li className="flex gap-3 py-3" key={item.variantId}>
                  <div className="size-14 shrink-0 overflow-hidden rounded bg-surface-soft">
                    {image ? <Image alt={item.name} className="size-full object-cover" height={56} src={image} width={56} /> : null}
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
