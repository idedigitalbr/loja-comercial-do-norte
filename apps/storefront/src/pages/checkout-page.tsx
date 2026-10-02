import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Icon } from '@commerce/ui';
import { PaymentStep } from '../features/checkout/payment-step';
import { addCartItem, emitCartUpdated, getCart, normalizeCart, type CartItem, type CartSnapshot } from '../features/cart/cart-client';
import { normalizeStoreProduct } from '../features/catalog/catalog-adapter';
import type { StoreProduct } from '../features/catalog/product-card';

type Step = 'contact' | 'address' | 'shipping' | 'review' | 'payment';
type AccountMode = 'guest' | 'account';
type PreparedCheckout = { orderPublicId: string; amountCents: number; expiresAt?: string };
type ShippingOption = { code: string; provider: string; label: string; priceCents: number; deliveryDays: number };
type CouponQuote = { couponCode: string; discountCents: number; shippingCents: number; totalCents: number };
type AddressForm = {
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};
type FieldErrors = Record<string, string>;

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const steps: Array<{ id: Step; label: string }> = [
  { id: 'contact', label: 'Contato' },
  { id: 'address', label: 'Endereço' },
  { id: 'shipping', label: 'Entrega' },
  { id: 'review', label: 'Revisão' },
  { id: 'payment', label: 'Pagamento' },
];

function formatCurrency(cents: number) {
  return currency.format(cents / 100);
}

function itemImage(item: CartItem) {
  const images = [...(item.variant.images ?? []), ...(item.variant.product.images ?? [])];
  return images.find((image) => image.isPrimary) ?? images[0] ?? null;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
}

function addressPayload(address: AddressForm, fullName: string, phone: string) {
  return {
    recipientName: fullName.trim(),
    phone: phone.replace(/\D/g, ''),
    postalCode: address.postalCode.replace(/\D/g, ''),
    street: address.street.trim(),
    number: address.number.trim(),
    complement: address.complement.trim() || undefined,
    district: address.district.trim(),
    city: address.city.trim(),
    state: address.state,
    country: 'BR',
  };
}

function FieldMessage({ id, message }: { id: string; message?: string }) {
  return message ? <small id={id} className="checkout-field-error">{message}</small> : null;
}

function CheckoutSummary({
  cart,
  shippingCents,
  totalCents,
  couponQuote,
}: {
  cart: CartSnapshot;
  shippingCents: number;
  totalCents: number;
  couponQuote: CouponQuote | null;
}) {
  return (
    <aside className="checkout-summary" aria-label="Resumo do pedido">
      <div className="checkout-summary__heading">
        <div>
          <p className="eyebrow">Sua seleção</p>
          <h2>Resumo do pedido</h2>
        </div>
        <span className="checkout-summary__count">{cart.items.length} {cart.items.length === 1 ? 'item' : 'itens'}</span>
      </div>
      <ul className="checkout-summary__items">
        {cart.items.map((item) => {
          const image = itemImage(item);
          const name = item.variant.product.name;
          return (
            <li key={item.id}>
              <div className="checkout-summary__image">
                {image ? <img src={image.path} alt="" /> : <Icon name="image" size={18} strokeWidth={1.6} />}
                <span>{item.quantity}</span>
              </div>
              <div className="checkout-summary__product"><strong>{name}</strong><small>{formatCurrency(item.unitPriceCents)} cada</small></div>
              <strong>{formatCurrency(item.unitPriceCents * item.quantity)}</strong>
            </li>
          );
        })}
      </ul>
      <dl className="checkout-summary__totals">
        <div><dt>Subtotal</dt><dd>{formatCurrency(cart.subtotalCents)}</dd></div>
        {couponQuote ? <div className="checkout-summary__discount"><dt>Desconto</dt><dd>− {formatCurrency(couponQuote.discountCents)}</dd></div> : null}
        <div><dt>Entrega</dt><dd>{shippingCents ? formatCurrency(shippingCents) : 'A calcular'}</dd></div>
        <div className="checkout-summary__total"><dt>Total</dt><dd>{formatCurrency(totalCents)}</dd></div>
      </dl>
      <div className="checkout-summary__trust">
        <span><Icon name="shield-check" size={17} strokeWidth={1.8} /> Pagamento protegido</span>
        <span><Icon name="package" size={17} strokeWidth={1.8} /> Envio acompanhado</span>
      </div>
    </aside>
  );
}

export function CheckoutPage() {
  const [step, setStep] = useState<Step>('contact');
  const [cart, setCart] = useState<CartSnapshot | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [accountMode, setAccountMode] = useState<AccountMode>('guest');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [address, setAddress] = useState<AddressForm>({ postalCode: '', street: '', number: '', complement: '', district: '', city: '', state: '' });
  const [shippingCents, setShippingCents] = useState(0);
  const [shippingCode, setShippingCode] = useState('');
  const [shippingDays, setShippingDays] = useState(0);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [quotingShipping, setQuotingShipping] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponQuote, setCouponQuote] = useState<CouponQuote | null>(null);
  const [quotingCoupon, setQuotingCoupon] = useState(false);
  const [orderBump, setOrderBump] = useState<StoreProduct | null>(null);
  const [orderBumpAdded, setOrderBumpAdded] = useState(false);
  const [orderBumpPending, setOrderBumpPending] = useState(false);
  const [prepared, setPrepared] = useState<PreparedCheckout | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [accountPending, setAccountPending] = useState(false);

  useEffect(() => {
    const publicId = window.localStorage.getItem('je_cart_public_id');
    if (!publicId) {
      setCartLoading(false);
      return;
    }
    void getCart(publicId)
      .then((nextCart) => {
        if (nextCart.status && nextCart.status !== 'ACTIVE') {
          window.localStorage.removeItem('je_cart_public_id');
          emitCartUpdated();
          setCart(null);
          return;
        }
        setCart(nextCart);
      })
      .catch(() => setCart(null))
      .finally(() => setCartLoading(false));
  }, []);

  useEffect(() => {
    if (step !== 'review' || !cart || orderBump) return;
    let active = true;
    void fetch('/api/v1/catalog/products', { credentials: 'same-origin' })
      .then(async (response) => (response?.ok ? response.json() : []))
      .then((payload: unknown) => {
        if (!active || !Array.isArray(payload)) return;
        const cartVariantIds = new Set(cart.items.map((item) => item.variant.id));
        const candidate = payload
          .map(normalizeStoreProduct)
          .find((product): product is StoreProduct => Boolean(product?.available && product.variantId && !cartVariantIds.has(product.variantId)));
        if (candidate) setOrderBump(candidate);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [cart, orderBump, step]);

  const totalCents = useMemo(() => couponQuote?.totalCents ?? (cart?.subtotalCents ?? 0) + shippingCents, [cart?.subtotalCents, couponQuote?.totalCents, shippingCents]);

  function setAddressField(field: keyof AddressForm, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: '' }));
    setError('');
  }

  function validateContact() {
    const nextErrors: FieldErrors = {};
    if (splitName(fullName).lastName.length < 2) nextErrors.fullName = 'Informe seu nome e sobrenome.';
    if (!isValidEmail(email)) nextErrors.email = 'Informe um e-mail válido.';
    if (phone.replace(/\D/g, '').length < 10) nextErrors.phone = 'Informe um WhatsApp válido com DDD.';
    if (accountMode === 'account') {
      if (password.length < 8) nextErrors.password = 'A senha precisa ter pelo menos 8 caracteres.';
      if (password !== passwordConfirmation) nextErrors.passwordConfirmation = 'As senhas precisam ser iguais.';
    }
    setFieldErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) window.requestAnimationFrame(() => document.getElementById(`checkout-${firstError}`)?.focus());
    return Object.keys(nextErrors).length === 0;
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart || !validateContact()) return;
    setError('');
    if (accountMode === 'guest') {
      setStep('address');
      return;
    }
    setAccountPending(true);
    const { firstName, lastName } = splitName(fullName);
    try {
      const registerResponse = await fetch('/api/v1/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, firstName, lastName }),
      });
      if (!registerResponse.ok) throw new Error('ACCOUNT_REGISTER_FAILED');
      const loginResponse = await fetch('/api/v1/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!loginResponse.ok) throw new Error('ACCOUNT_LOGIN_FAILED');
      await fetch(`/api/v1/carts/${cart.publicId}/merge`, { method: 'POST', credentials: 'include' });
      setStep('address');
    } catch {
      setError('Não foi possível criar sua conta agora. Confira os dados ou continue sem conta.');
    } finally {
      setAccountPending(false);
    }
  }

  function validateAddress() {
    const nextErrors: FieldErrors = {};
    if (address.postalCode.replace(/\D/g, '').length !== 8) nextErrors.postalCode = 'Informe um CEP válido.';
    if (address.street.trim().length < 3) nextErrors.street = 'Informe a rua ou avenida.';
    if (!address.number.trim()) nextErrors.number = 'Informe o número.';
    if (address.district.trim().length < 2) nextErrors.district = 'Informe o bairro.';
    if (address.city.trim().length < 2) nextErrors.city = 'Informe a cidade.';
    if (!address.state) nextErrors.state = 'Selecione o estado.';
    setFieldErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) window.requestAnimationFrame(() => document.getElementById(`checkout-${firstError}`)?.focus());
    return Object.keys(nextErrors).length === 0;
  }

  async function quoteShipping() {
    if (!cart || !validateAddress()) return;
    setError('');
    setQuotingShipping(true);
    try {
      const response = await fetch('/api/v1/shipping/quote', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postalCode: address.postalCode.replace(/\D/g, ''), totalCents: cart.subtotalCents }),
      });
      if (!response.ok) throw new Error('SHIPPING_QUOTE_FAILED');
      const options = await response.json() as ShippingOption[];
      if (!Array.isArray(options) || !options.length) throw new Error('SHIPPING_OPTIONS_EMPTY');
      const firstOption = options[0];
      setShippingOptions(options);
      setShippingCode(firstOption.code);
      setShippingCents(firstOption.priceCents);
      setCouponQuote(null);
      setShippingDays(firstOption.deliveryDays);
      setStep('shipping');
    } catch {
      setError('Não foi possível calcular as opções de entrega. Tente novamente.');
    } finally {
      setQuotingShipping(false);
    }
  }

  async function toggleOrderBump(checked: boolean) {
    if (!cart || !orderBump?.variantId || orderBumpPending) return;
    setError('');
    setOrderBumpPending(true);
    try {
      if (checked) {
        const nextCart = await addCartItem(cart.publicId!, orderBump.variantId);
        setCart(nextCart);
        setOrderBumpAdded(true);
      } else {
        const response = await fetch(`/api/v1/carts/${cart.publicId}/items/${orderBump.variantId}`, { method: 'DELETE', credentials: 'include' });
        if (!response.ok) throw new Error('ORDER_BUMP_REMOVE_FAILED');
        setCart(normalizeCart(await response.json()));
        setOrderBumpAdded(false);
      }
      setCouponQuote(null);
    } catch {
      setError('Não foi possível atualizar a oferta complementar. Tente novamente.');
    } finally {
      setOrderBumpPending(false);
    }
  }

  async function applyCoupon() {
    if (!cart || !couponCode.trim()) return;
    setError('');
    setQuotingCoupon(true);
    try {
      const response = await fetch('/api/v1/checkout/quote', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: cart.publicId, contactEmail: email, couponCode: couponCode.trim().toUpperCase(), shippingCents }),
      });
      if (!response.ok) throw new Error('COUPON_QUOTE_FAILED');
      const quote = await response.json() as CouponQuote;
      setCouponCode(quote.couponCode);
      setCouponQuote(quote);
    } catch {
      setCouponQuote(null);
      setError('Não foi possível aplicar este cupom. Verifique o código e as regras da campanha.');
    } finally {
      setQuotingCoupon(false);
    }
  }

  async function prepare() {
    if (!cart || !validateAddress() || !shippingCode) return;
    setError('');
    const deliveryAddress = addressPayload(address, fullName, phone);
    try {
      const response = await fetch('/api/v1/checkout/prepare', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `checkout-${cart.publicId}` },
        body: JSON.stringify({ cartId: cart.publicId, contactEmail: email, couponCode: couponCode.trim().toUpperCase() || undefined, shippingCents, shippingMethodCode: shippingCode, shippingDays, shippingAddress: deliveryAddress, billingAddress: deliveryAddress }),
      });
      if (!response.ok) throw new Error('CHECKOUT_PREPARE_FAILED');
      setPrepared(await response.json() as PreparedCheckout);
      window.localStorage.removeItem('je_cart_public_id');
      emitCartUpdated();
      setStep('payment');
    } catch {
      setError('Não foi possível preparar o pedido. Revise os dados e tente novamente.');
    }
  }

  if (cartLoading) {
    return <main className="page-section checkout-page"><div className="site-container"><p className="empty-state" role="status">Carregando seu pedido…</p></div></main>;
  }

  if (!cart || !cart.publicId || !cart.items.length) {
    return <main className="page-section checkout-page"><div className="site-container"><div className="empty-state" role="status"><h2>Checkout</h2><p>Carrinho vazio ou indisponível.</p><a className="button button--primary" href="/loja">Voltar para a loja</a></div></div></main>;
  }

  return (
    <main className="page-section checkout-page">
      <div className="site-container checkout-container">
        <div className="page-heading checkout-heading"><div><p className="eyebrow">Compra segura</p><h1>Finalizar pedido</h1></div><p>Uma experiência simples, segura e transparente para receber seus produtos profissionais.</p></div>
        <div className="checkout-layout">
          <div className="checkout-main">
            <nav className="checkout-stepper" aria-label="Etapas do checkout"><ol>{steps.map((item, index) => <li key={item.id} className={step === item.id ? 'is-current' : index < steps.findIndex((current) => current.id === step) ? 'is-complete' : undefined} aria-current={step === item.id ? 'step' : undefined}><span>{index + 1}</span><strong>{item.label}</strong></li>)}</ol></nav>

            {step === 'contact' ? (
              <form className="form-panel checkout-panel" noValidate onSubmit={(event) => void handleContactSubmit(event)}>
                <div className="checkout-panel__intro"><div><p className="eyebrow">Passo 1 de 5</p><h2>Contato</h2></div><Icon name="users" size={25} strokeWidth={1.7} /></div>
                <p className="checkout-panel__lead">Como você quer continuar?</p>
                <p className="checkout-panel__hint">Você pode criar uma conta para acompanhar pedidos ou finalizar agora sem senha.</p>
                <fieldset className="checkout-mode-selector"><legend className="sr-only">Escolha como continuar</legend>
                  <label className={`checkout-mode-card${accountMode === 'account' ? ' is-selected' : ''}`}><input type="radio" name="checkout-mode" value="account" aria-label="Criar uma conta" checked={accountMode === 'account'} onChange={() => { setAccountMode('account'); setError(''); }} /><span><strong>Criar uma conta</strong><small>Guarde seus dados e acompanhe seus pedidos com facilidade.</small></span><Icon name="users" size={20} strokeWidth={1.8} /></label>
                  <label className={`checkout-mode-card${accountMode === 'guest' ? ' is-selected' : ''}`}><input type="radio" name="checkout-mode" value="guest" aria-label="Comprar sem conta" checked={accountMode === 'guest'} onChange={() => { setAccountMode('guest'); setError(''); }} /><span><strong>Comprar sem conta</strong><small>Finalize como convidado usando apenas os dados desta compra.</small></span><Icon name="arrow-right" size={20} strokeWidth={1.8} /></label>
                </fieldset>
                <div className="checkout-form-grid">
                  <label htmlFor="checkout-fullName" className="checkout-field checkout-field--wide">Nome completo<input id="checkout-fullName" type="text" value={fullName} onChange={(event) => { setFullName(event.target.value); setFieldErrors((current) => ({ ...current, fullName: '' })); }} autoComplete="name" aria-invalid={Boolean(fieldErrors.fullName)} aria-describedby={fieldErrors.fullName ? 'checkout-fullName-error' : undefined} /><FieldMessage id="checkout-fullName-error" message={fieldErrors.fullName} /></label>
                  <label htmlFor="checkout-email" className="checkout-field">E-mail<input id="checkout-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setFieldErrors((current) => ({ ...current, email: '' })); }} autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'checkout-email-error' : undefined} /><FieldMessage id="checkout-email-error" message={fieldErrors.email} /></label>
                  <label htmlFor="checkout-phone" className="checkout-field">WhatsApp<input id="checkout-phone" type="tel" inputMode="tel" value={phone} onChange={(event) => { setPhone(event.target.value); setFieldErrors((current) => ({ ...current, phone: '' })); }} autoComplete="tel" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'checkout-phone-error' : undefined} /><FieldMessage id="checkout-phone-error" message={fieldErrors.phone} /></label>
                  {accountMode === 'account' ? <><label htmlFor="checkout-password" className="checkout-field">Senha<input id="checkout-password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: '' })); }} autoComplete="new-password" aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'checkout-password-error' : 'checkout-password-help'} /><FieldMessage id="checkout-password-error" message={fieldErrors.password} /></label><small id="checkout-password-help" className="checkout-field-help">Mínimo de 8 caracteres.</small><label htmlFor="checkout-passwordConfirmation" className="checkout-field">Confirmar senha<input id="checkout-passwordConfirmation" type="password" value={passwordConfirmation} onChange={(event) => { setPasswordConfirmation(event.target.value); setFieldErrors((current) => ({ ...current, passwordConfirmation: '' })); }} autoComplete="new-password" aria-invalid={Boolean(fieldErrors.passwordConfirmation)} aria-describedby={fieldErrors.passwordConfirmation ? 'checkout-passwordConfirmation-error' : undefined} /><FieldMessage id="checkout-passwordConfirmation-error" message={fieldErrors.passwordConfirmation} /></label></> : null}
                </div>
                <div className="checkout-panel__footer"><span><Icon name="shield" size={16} strokeWidth={1.8} /> Seus dados são usados somente para processar o pedido.</span><button className="button button--primary" type="submit" disabled={accountPending}>{accountPending ? 'Criando conta…' : 'Continuar'}</button></div>
              </form>
            ) : null}

            {step === 'address' ? (
              <form className="form-panel checkout-panel" noValidate onSubmit={(event) => { event.preventDefault(); void quoteShipping(); }}>
                <div className="checkout-panel__intro"><div><p className="eyebrow">Passo 2 de 5</p><h2>Endereço de entrega</h2></div><Icon name="map-pin" size={25} strokeWidth={1.7} /></div>
                <p className="checkout-panel__hint">Precisamos destes dados para calcular o frete e entregar seu pedido corretamente.</p>
                <div className="checkout-form-grid">
                  <label htmlFor="checkout-postalCode" className="checkout-field">CEP<input id="checkout-postalCode" inputMode="numeric" value={address.postalCode} onChange={(event) => setAddressField('postalCode', event.target.value)} autoComplete="postal-code" aria-invalid={Boolean(fieldErrors.postalCode)} aria-describedby={fieldErrors.postalCode ? 'checkout-postalCode-error' : undefined} /><FieldMessage id="checkout-postalCode-error" message={fieldErrors.postalCode} /></label>
                  <label htmlFor="checkout-street" className="checkout-field checkout-field--wide">Rua<input id="checkout-street" type="text" value={address.street} onChange={(event) => setAddressField('street', event.target.value)} autoComplete="street-address" aria-invalid={Boolean(fieldErrors.street)} aria-describedby={fieldErrors.street ? 'checkout-street-error' : undefined} /><FieldMessage id="checkout-street-error" message={fieldErrors.street} /></label>
                  <label htmlFor="checkout-number" className="checkout-field">Número<input id="checkout-number" type="text" value={address.number} onChange={(event) => setAddressField('number', event.target.value)} autoComplete="address-line2" aria-invalid={Boolean(fieldErrors.number)} aria-describedby={fieldErrors.number ? 'checkout-number-error' : undefined} /><FieldMessage id="checkout-number-error" message={fieldErrors.number} /></label>
                  <label htmlFor="checkout-complement" className="checkout-field">Complemento <span className="checkout-optional">opcional</span><input id="checkout-complement" type="text" value={address.complement} onChange={(event) => setAddressField('complement', event.target.value)} autoComplete="address-line2" /></label>
                  <label htmlFor="checkout-district" className="checkout-field">Bairro<input id="checkout-district" type="text" value={address.district} onChange={(event) => setAddressField('district', event.target.value)} autoComplete="address-level3" aria-invalid={Boolean(fieldErrors.district)} aria-describedby={fieldErrors.district ? 'checkout-district-error' : undefined} /><FieldMessage id="checkout-district-error" message={fieldErrors.district} /></label>
                  <label htmlFor="checkout-city" className="checkout-field">Cidade<input id="checkout-city" type="text" value={address.city} onChange={(event) => setAddressField('city', event.target.value)} autoComplete="address-level2" aria-invalid={Boolean(fieldErrors.city)} aria-describedby={fieldErrors.city ? 'checkout-city-error' : undefined} /><FieldMessage id="checkout-city-error" message={fieldErrors.city} /></label>
                  <label htmlFor="checkout-state" className="checkout-field">Estado<select id="checkout-state" value={address.state} onChange={(event) => setAddressField('state', event.target.value)} autoComplete="address-level1" aria-invalid={Boolean(fieldErrors.state)} aria-describedby={fieldErrors.state ? 'checkout-state-error' : undefined}><option value="">Selecione</option><option value="AP">Amapá</option><option value="AC">Acre</option><option value="AL">Alagoas</option><option value="AM">Amazonas</option><option value="BA">Bahia</option><option value="CE">Ceará</option><option value="DF">Distrito Federal</option><option value="ES">Espírito Santo</option><option value="GO">Goiás</option><option value="MA">Maranhão</option><option value="MG">Minas Gerais</option><option value="MS">Mato Grosso do Sul</option><option value="MT">Mato Grosso</option><option value="PA">Pará</option><option value="PB">Paraíba</option><option value="PE">Pernambuco</option><option value="PI">Piauí</option><option value="PR">Paraná</option><option value="RJ">Rio de Janeiro</option><option value="RN">Rio Grande do Norte</option><option value="RO">Rondônia</option><option value="RR">Roraima</option><option value="RS">Rio Grande do Sul</option><option value="SC">Santa Catarina</option><option value="SE">Sergipe</option><option value="SP">São Paulo</option><option value="TO">Tocantins</option></select><FieldMessage id="checkout-state-error" message={fieldErrors.state} /></label>
                </div>
                <div className="checkout-panel__footer"><button className="button button--secondary" type="button" onClick={() => setStep('contact')}>Voltar</button><button className="button button--primary" type="submit" disabled={quotingShipping}>{quotingShipping ? 'Calculando…' : 'Calcular entrega'}</button></div>
              </form>
            ) : null}

            {step === 'shipping' ? <section className="form-panel checkout-panel"><div className="checkout-panel__intro"><div><p className="eyebrow">Passo 3 de 5</p><h2>Escolha sua entrega</h2></div><Icon name="package" size={25} strokeWidth={1.7} /></div><p className="checkout-panel__hint">Selecione a opção que melhor atende à sua rotina.</p><fieldset className="checkout-options"><legend className="sr-only">Opções de entrega</legend>{shippingOptions.map((option) => <label className={`checkout-option${shippingCode === option.code ? ' is-selected' : ''}`} key={option.code}><input type="radio" name="shipping" checked={shippingCode === option.code} onChange={() => { setShippingCode(option.code); setShippingCents(option.priceCents); setShippingDays(option.deliveryDays); setCouponQuote(null); }} /><span><strong>{option.label}</strong><small>Entrega em até {option.deliveryDays} dia(s)</small></span><b>{option.priceCents ? formatCurrency(option.priceCents) : 'Grátis'}</b></label>)}</fieldset><div className="checkout-panel__footer"><button className="button button--secondary" type="button" onClick={() => setStep('address')}>Voltar</button><button className="button button--primary" type="button" disabled={!shippingCode} onClick={() => setStep('review')}>Continuar</button></div></section> : null}

            {step === 'review' ? <section className="form-panel checkout-panel"><div className="checkout-panel__intro"><div><p className="eyebrow">Passo 4 de 5</p><h2>Revise seu pedido</h2></div><Icon name="clipboard-check" size={25} strokeWidth={1.7} /></div><div className="checkout-review__address"><div><span className="checkout-review__label">Entrega para</span><strong>{fullName}</strong><p>{address.street}, {address.number}{address.complement ? ` · ${address.complement}` : ''}<br />{address.district} · {address.city}/{address.state} · CEP {address.postalCode}</p></div><button className="button button--secondary" type="button" onClick={() => setStep('address')}>Editar</button></div>{orderBump ? <label className={`checkout-bump${orderBumpAdded ? ' is-added' : ''}`}><input type="checkbox" checked={orderBumpAdded} disabled={orderBumpPending} onChange={(event) => void toggleOrderBump(event.target.checked)} aria-label={`Adicionar ${orderBump.name}`} /><span className="checkout-bump__image">{orderBump.imageUrl ? <img src={orderBump.imageUrl} alt="" /> : <Icon name="sparkles" size={20} strokeWidth={1.7} />}</span><span><strong>Oferta complementar</strong><b>Adicionar {orderBump.name}</b><small>Complete sua rotina por apenas {formatCurrency(orderBump.price.amount)}.</small></span><em>{formatCurrency(orderBump.price.amount)}</em></label> : null}<form className="checkout-coupon" noValidate onSubmit={(event) => { event.preventDefault(); void applyCoupon(); }}><label htmlFor="checkout-coupon">Cupom de desconto</label><div><input id="checkout-coupon" value={couponCode} onChange={(event) => { setCouponCode(event.target.value.toUpperCase()); setCouponQuote(null); }} placeholder="Ex.: BEMVINDO10" autoComplete="off" /><button className="button button--secondary" type="submit" disabled={quotingCoupon || !couponCode.trim()}>{quotingCoupon ? 'Verificando…' : 'Aplicar cupom'}</button></div></form>{couponQuote ? <p className="checkout-discount" role="status"><span>Desconto aplicado</span><strong>− {formatCurrency(couponQuote.discountCents)}</strong>{couponQuote.shippingCents === 0 ? <small>Frete grátis</small> : null}</p> : null}<div className="checkout-review__total"><span>Total do pedido</span><strong>{formatCurrency(totalCents)}</strong></div><div className="checkout-panel__footer"><button className="button button--secondary" type="button" onClick={() => setStep('shipping')}>Voltar</button><button className="button button--primary" type="button" onClick={() => void prepare()}>Ir para pagamento</button></div></section> : null}

            {step === 'payment' && prepared ? <section className="form-panel checkout-panel checkout-payment-panel"><div className="checkout-panel__intro"><div><p className="eyebrow">Passo 5 de 5</p><h2>Pagamento seguro</h2></div><Icon name="shield-check" size={25} strokeWidth={1.7} /></div><PaymentStep orderId={prepared.orderPublicId} amountCents={prepared.amountCents} /></section> : null}
            {error ? <p className="form-error checkout-form-error" role="alert">{error}</p> : null}
          </div>
          <CheckoutSummary cart={cart} shippingCents={shippingCents} totalCents={totalCents} couponQuote={couponQuote} />
        </div>
      </div>
    </main>
  );
}
