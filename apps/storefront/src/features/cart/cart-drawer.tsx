import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@commerce/ui';
import { Link } from 'react-router-dom';
import { addCartItem, emitCartUpdated, getCart, normalizeCart, type CartItem, type CartSnapshot } from './cart-client';
import { normalizeStoreProduct } from '../catalog/catalog-adapter';
import type { StoreProduct } from '../catalog/product-card';

type CartDrawerProps = {
  publicId: string;
  mode?: 'page' | 'drawer';
  onClose?: () => void;
};

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatCurrency(cents: number) {
  return currency.format(cents / 100);
}

function itemImage(item: CartItem) {
  const images = [...(item.variant.images ?? []), ...(item.variant.product.images ?? [])];
  return images.find((image) => image.isPrimary) ?? images[0] ?? null;
}

function cartQuantity(cart: CartSnapshot) {
  return cart.items.reduce((total, item) => total + item.quantity, 0);
}

export function CartDrawer({ publicId, mode = 'page', onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<CartSnapshot>({ items: [], subtotalCents: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<StoreProduct[]>([]);
  const [pendingRecommendationId, setPendingRecommendationId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setLoadError(false);
    void getCart(publicId)
      .then((nextCart) => {
        if (nextCart.status && nextCart.status !== 'ACTIVE') throw new Error('CART_NOT_ACTIVE');
        if (active) setCart(nextCart);
      })
      .catch(() => {
        if (active) {
          setLoadError(true);
          setError('Não foi possível carregar o carrinho.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [publicId, reloadKey]);

  useEffect(() => {
    if (mode !== 'drawer') return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const drawer = document.getElementById('storefront-cart-drawer');
      if (!drawer) return;
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [mode, onClose]);

  useEffect(() => {
    if (mode !== 'drawer') return;
    let active = true;
    void fetch('/api/v1/catalog/products', { credentials: 'same-origin' })
      .then(async (response) => (response.ok ? response.json() : []))
      .then((payload: unknown) => {
        if (!active || !Array.isArray(payload)) return;
        const products = payload
          .map(normalizeStoreProduct)
          .filter((product): product is StoreProduct => Boolean(product?.available && product.variantId));
        setRecommendations(products.slice(0, 8));
      })
      .catch(() => {
        if (active) setRecommendations([]);
      });
    return () => { active = false; };
  }, [mode]);

  const recommendedProducts = useMemo(() => {
    const variantIds = new Set(cart.items.map((item) => item.variant.id));
    return recommendations.filter((product) => product.variantId && !variantIds.has(product.variantId)).slice(0, 3);
  }, [cart.items, recommendations]);

  async function updateQuantity(item: CartItem, quantity: number) {
    if (pendingItemId) return;
    setError('');
    setPendingItemId(item.id);
    try {
      const response = quantity < 1
        ? await fetch(`/api/v1/carts/${publicId}/items/${item.variant.id}`, { method: 'DELETE', credentials: 'include' })
        : await fetch(`/api/v1/carts/${publicId}/items/${item.variant.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        });
      if (!response.ok) throw new Error('CART_UPDATE_FAILED');
      setCart(normalizeCart(await response.json()));
      emitCartUpdated();
    } catch {
      setError('Não foi possível atualizar o carrinho. Tente novamente.');
    } finally {
      setPendingItemId(null);
    }
  }

  async function addRecommendation(product: StoreProduct) {
    if (!product.variantId || pendingRecommendationId) return;
    setPendingRecommendationId(product.variantId);
    setError('');
    try {
      setCart(await addCartItem(publicId, product.variantId));
    } catch {
      setError('Não foi possível adicionar esta recomendação.');
    } finally {
      setPendingRecommendationId(null);
    }
  }

  const content = (
    <>
      {loading ? <p className="cart-drawer__status" role="status">Carregando seu carrinho…</p> : null}
      {!loading && !cart.items.length && !loadError ? (
        <div className="cart-drawer__empty">
          <Icon name="shopping-bag" size={34} strokeWidth={1.5} />
          <h3>Seu carrinho está vazio</h3>
          <p>Encontre produtos profissionais para completar sua rotina de cuidado.</p>
          <Link className="button button--primary" to="/loja" onClick={onClose}>Conhecer a loja</Link>
        </div>
      ) : null}
      {!loading && cart.items.length ? (
        <>
          <div className="cart-drawer__shipping-note">
            <Icon name="package" size={19} strokeWidth={1.8} />
            <div><strong>Entrega segura</strong><span>Frete e descontos calculados no checkout.</span></div>
          </div>
          <ul className="cart-drawer__items">
            {cart.items.map((item) => {
              const image = itemImage(item);
              const name = item.variant.product.name;
              const itemPending = pendingItemId === item.id;
              return (
                <li key={item.id} className="cart-drawer__item">
                  <Link className="cart-drawer__thumbnail" to={item.variant.product.slug ? `/produto/${item.variant.product.slug}` : '/loja'} onClick={onClose} aria-label={`Ver ${name}`}>
                    {image ? <img src={image.path} alt={image.altText || name} /> : <Icon name="image" size={22} strokeWidth={1.6} />}
                  </Link>
                  <div className="cart-drawer__item-content">
                    <div className="cart-drawer__item-heading">
                      <Link to={item.variant.product.slug ? `/produto/${item.variant.product.slug}` : '/loja'} onClick={onClose}>{name}</Link>
                      <button className="cart-drawer__remove" type="button" aria-label={`Remover ${name}`} disabled={itemPending} onClick={() => void updateQuantity(item, 0)}><Icon name="trash-2" size={17} strokeWidth={1.8} /></button>
                    </div>
                    <div className="cart-drawer__item-meta">
                      <span>{formatCurrency(item.unitPriceCents)} cada</span>
                      <strong>{formatCurrency(item.quantity * item.unitPriceCents)}</strong>
                    </div>
                    <div className="cart-drawer__quantity" aria-label={`Quantidade de ${name}`}>
                      <button type="button" aria-label={`Diminuir quantidade de ${name}`} disabled={itemPending} onClick={() => void updateQuantity(item, item.quantity - 1)}><Icon name="minus" size={14} strokeWidth={2} /></button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button type="button" aria-label={`Aumentar quantidade de ${name}`} disabled={itemPending} onClick={() => void updateQuantity(item, item.quantity + 1)}><Icon name="plus" size={14} strokeWidth={2} /></button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="cart-drawer__coupon"><Icon name="tag" size={17} strokeWidth={1.8} /><Link to="/checkout" onClick={onClose}>Aplicar cupom no checkout</Link></div>
          <dl className="cart-drawer__totals">
            <div><dt>Subtotal</dt><dd>{formatCurrency(cart.subtotalCents)}</dd></div>
            <div><dt>Frete</dt><dd className="cart-drawer__totals-muted">Calculado no checkout</dd></div>
            <div className="cart-drawer__total"><dt>Total parcial</dt><dd>{formatCurrency(cart.subtotalCents)}</dd></div>
          </dl>
          <div className="cart-drawer__actions">
            <button className="button button--secondary" type="button" onClick={onClose}>Continuar comprando</button>
            <Link className="button button--primary" to="/checkout" onClick={onClose}>Finalizar compra</Link>
          </div>
        </>
      ) : null}
      {mode === 'drawer' && recommendedProducts.length ? (
        <section className="cart-drawer__recommendations" aria-labelledby="cart-recommendations-title">
          <div className="cart-drawer__section-heading"><div><p className="eyebrow">Para completar sua rotina</p><h3 id="cart-recommendations-title">Você também pode gostar</h3></div><Icon name="sparkles" size={20} strokeWidth={1.7} /></div>
          <div className="cart-drawer__recommendation-list">
            {recommendedProducts.map((product) => (
              <article key={product.publicId} className="cart-drawer__recommendation">
                <Link className="cart-drawer__recommendation-image" to={`/produto/${product.slug}`} onClick={onClose} aria-label={`Ver ${product.name}`}>
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <Icon name="image" size={18} strokeWidth={1.6} />}
                </Link>
                <div><Link to={`/produto/${product.slug}`} onClick={onClose}>{product.name}</Link><span>{formatCurrency(product.price.amount)}</span></div>
                <button className="cart-drawer__recommendation-add" type="button" disabled={pendingRecommendationId === product.variantId} onClick={() => void addRecommendation(product)}>{pendingRecommendationId === product.variantId ? 'Adicionando…' : 'Adicionar'}</button>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {error ? <div className="cart-drawer__error" role="alert"><p className="form-error">{error}</p>{loadError ? <button className="button button--secondary cart-drawer__retry" type="button" onClick={() => setReloadKey((key) => key + 1)}>Tentar novamente</button> : null}</div> : null}
    </>
  );

  if (mode === 'page') {
    return <aside className="cart-panel" aria-label="Carrinho"><h2>Seu carrinho</h2>{content}</aside>;
  }

  return (
    <>
      <div className="cart-drawer__backdrop" aria-hidden="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }} />
      <aside id="storefront-cart-drawer" className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <header className="cart-drawer__header">
          <div><p className="eyebrow">Sua seleção</p><h2 id="cart-drawer-title">Seu carrinho <span className="cart-drawer__count">{cartQuantity(cart)}</span></h2></div>
          <button ref={closeButtonRef} className="cart-drawer__close" type="button" aria-label="Fechar carrinho" onClick={onClose}><Icon name="x" size={22} strokeWidth={1.9} /></button>
        </header>
        <div className="cart-drawer__body">{content}</div>
      </aside>
    </>
  );
}
