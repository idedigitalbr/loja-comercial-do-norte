import { useEffect, useMemo, useState } from 'react';
import { PaymentStep } from '../features/checkout/payment-step';

type Step = 'contact' | 'address' | 'shipping' | 'review' | 'payment';
type CartSnapshot = { id: string; publicId: string; subtotalCents: number; items: Array<{ id: string; quantity: number; unitPriceCents: number; variant: { product: { name: string } } }> };
type PreparedCheckout = { orderPublicId: string; amountCents: number; expiresAt?: string };

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

  async function prepare() {
    if (!cart) return;
    setError('');
    const response = await fetch('/api/v1/checkout/prepare', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `checkout-${cart.publicId}` },
      body: JSON.stringify({ cartId: cart.publicId, contactEmail: email, shippingCents, shippingMethodCode: shippingCents ? 'STANDARD' : 'PICKUP', shippingDays: shippingCents ? 5 : 0, shippingAddress: { postalCode } }),
    });
    if (!response.ok) {
      setError('Não foi possível preparar o pedido.');
      return;
    }
    setPrepared(await response.json() as PreparedCheckout);
    setStep('payment');
  }

  if (!cart) return <main><h1>Checkout</h1><p role="status">Carrinho vazio ou indisponível.</p></main>;

  return (
    <main>
      <h1>Finalizar pedido</h1>
      <nav aria-label="Etapas do checkout"><ol>{steps.map((item) => <li key={item.id} aria-current={step === item.id ? 'step' : undefined}>{item.label}</li>)}</ol></nav>
      {step === 'contact' ? <section><h2>Contato</h2><label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button disabled={!email} onClick={() => setStep('address')}>Continuar</button></section> : null}
      {step === 'address' ? <section><h2>Endereço</h2><label>CEP<input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} /></label><button onClick={() => setStep('shipping')}>Continuar</button></section> : null}
      {step === 'shipping' ? <section><h2>Entrega</h2><label><input type="radio" name="shipping" checked={shippingCents === 0} onChange={() => setShippingCents(0)} /> Retirada gratuita</label><label><input type="radio" name="shipping" checked={shippingCents === 1_500} onChange={() => setShippingCents(1_500)} /> Entrega padrão — R$ 15,00</label><button onClick={() => setStep('review')}>Continuar</button></section> : null}
      {step === 'review' ? <section><h2>Revisão</h2><p>Total: R$ {(totalCents / 100).toFixed(2).replace('.', ',')}</p><button onClick={() => void prepare()}>Preparar pedido</button></section> : null}
      {step === 'payment' && prepared ? <PaymentStep orderId={prepared.orderPublicId} amountCents={prepared.amountCents} /> : null}
      {error ? <p role="alert">{error}</p> : null}
    </main>
  );
}
