import { useEffect, useMemo, useState } from 'react';
import { PaymentStep } from '../features/checkout/payment-step';

type Step = 'contact' | 'address' | 'shipping' | 'review' | 'payment';
type CartSnapshot = { id: string; publicId: string; subtotalCents: number; items: Array<{ id: string; quantity: number; unitPriceCents: number; variant: { product: { name: string } } }> };
type PreparedCheckout = { orderPublicId: string; amountCents: number; expiresAt?: string };
type ShippingOption = { code: string; provider: string; label: string; priceCents: number; deliveryDays: number };

const steps: Array<{ id: Step; label: string }> = [
  { id: 'contact', label: 'Contato' },
  { id: 'address', label: 'Endereço' },
  { id: 'shipping', label: 'Entrega' },
  { id: 'review', label: 'Revisão' },
  { id: 'payment', label: 'Pagamento' },
];

export function CheckoutPage() {
  const [step, setStep] = useState<Step>('contact');
  const [cart, setCart] = useState<CartSnapshot | null>(null);
  const [email, setEmail] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [shippingCents, setShippingCents] = useState(0);
  const [shippingCode, setShippingCode] = useState('');
  const [shippingDays, setShippingDays] = useState(0);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [quotingShipping, setQuotingShipping] = useState(false);
  const [prepared, setPrepared] = useState<PreparedCheckout | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const publicId = window.localStorage.getItem('je_cart_public_id');
    if (!publicId) return;
    void fetch(`/api/v1/carts/${publicId}`, { credentials: 'include' })
      .then(async (response) => (response.ok ? response.json() as Promise<CartSnapshot> : null))
      .then(setCart)
      .catch(() => setCart(null));
  }, []);

  const totalCents = useMemo(() => (cart?.subtotalCents ?? 0) + shippingCents, [cart?.subtotalCents, shippingCents]);

  async function quoteShipping() {
    if (!cart) return;
    const normalizedPostalCode = postalCode.replace(/\D/g, '');
    if (normalizedPostalCode.length !== 8) {
      setError('Informe um CEP válido para calcular a entrega.');
      return;
    }
    setError('');
    setQuotingShipping(true);
    try {
      const response = await fetch('/api/v1/shipping/quote', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postalCode: normalizedPostalCode, totalCents: cart.subtotalCents }),
      });
      if (!response.ok) throw new Error('SHIPPING_QUOTE_FAILED');
      const options = await response.json() as ShippingOption[];
      if (!Array.isArray(options) || !options.length) throw new Error('SHIPPING_OPTIONS_EMPTY');
      const firstOption = options[0];
      setShippingOptions(options);
      setShippingCode(firstOption.code);
      setShippingCents(firstOption.priceCents);
      setShippingDays(firstOption.deliveryDays);
      setStep('shipping');
    } catch {
      setError('Não foi possível calcular as opções de entrega.');
    } finally {
      setQuotingShipping(false);
    }
  }

  async function prepare() {
    if (!cart) return;
    setError('');
    const response = await fetch('/api/v1/checkout/prepare', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `checkout-${cart.publicId}` },
      body: JSON.stringify({ cartId: cart.publicId, contactEmail: email, shippingCents, shippingMethodCode: shippingCode, shippingDays, shippingAddress: { postalCode: postalCode.replace(/\D/g, '') } }),
    });
    if (!response.ok) {
      setError('Não foi possível preparar o pedido.');
      return;
    }
    setPrepared(await response.json() as PreparedCheckout);
    setStep('payment');
  }

  if (!cart) {
    return (
      <main className="page-section checkout-page">
        <div className="site-container">
          <div className="empty-state" role="status">
            <h2>Checkout</h2>
            <p>Carrinho vazio ou indisponível.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-section checkout-page">
      <div className="site-container">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Compra segura</p>
            <h1>Finalizar pedido</h1>
          </div>
          <p>Preencha os dados abaixo. Você poderá revisar tudo antes de confirmar o pagamento.</p>
        </div>
        <nav className="checkout-stepper" aria-label="Etapas do checkout"><ol>{steps.map((item) => <li key={item.id} aria-current={step === item.id ? 'step' : undefined}>{item.label}</li>)}</ol></nav>
        {step === 'contact' ? <section className="form-panel checkout-panel"><h2>Contato</h2><label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button className="button button--primary" disabled={!email} onClick={() => setStep('address')}>Continuar</button></section> : null}
        {step === 'address' ? <section className="form-panel checkout-panel"><h2>Endereço</h2><label>CEP<input inputMode="numeric" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} /></label><button className="button button--primary" disabled={quotingShipping} onClick={() => void quoteShipping()}>{quotingShipping ? 'Calculando…' : 'Calcular entrega'}</button></section> : null}
        {step === 'shipping' ? <section className="form-panel checkout-panel"><h2>Entrega</h2>{shippingOptions.map((option) => <label className="choice-row" key={option.code}><input type="radio" name="shipping" checked={shippingCode === option.code} onChange={() => { setShippingCode(option.code); setShippingCents(option.priceCents); setShippingDays(option.deliveryDays); }} /> {option.label} — {option.priceCents ? `R$ ${(option.priceCents / 100).toFixed(2).replace('.', ',')}` : 'Grátis'} · até {option.deliveryDays} dia(s)</label>)}<button className="button button--primary" disabled={!shippingCode} onClick={() => setStep('review')}>Continuar</button></section> : null}
        {step === 'review' ? <section className="form-panel checkout-panel"><h2>Revisão</h2><p>Entrega: {shippingOptions.find((option) => option.code === shippingCode)?.label ?? 'Não selecionada'}</p><p className="checkout-total">Total: R$ {(totalCents / 100).toFixed(2).replace('.', ',')}</p><button className="button button--primary" onClick={() => void prepare()}>Preparar pedido</button></section> : null}
      {step === 'payment' && prepared ? <PaymentStep orderId={prepared.orderPublicId} amountCents={prepared.amountCents} /> : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </div>
    </main>
  );
}
