import { createElement, Fragment, type ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@commerce/ui';
import { addCartItem, getOrCreateCart } from '../features/cart/cart-client';
import { readFavoriteProductSlugs, setFavoriteProduct } from '../features/catalog/favorites';
import { ProductCard, StoreProduct } from '../features/catalog/product-card';
import { normalizeStoreProduct } from '../features/catalog/catalog-adapter';

const originalRelatedSlugs: Record<string, string[]> = {
  'acidificante-redutor-de-ph-500ml-extrato-de-acai-e-oleo-de-pracaxi': [
    'maxi-liss-intense-defrizz-480g',
    'mascara-capilar-reparador-de-danos-de-progressiva-120g',
    'hidratacao-ouse-300-ml',
    'btx-1-l',
  ],
};

function renderDescriptionNode(node: Node, key: string): ReactNode {
  if (node.nodeType === 3) return node.nodeValue;
  if (node.nodeType !== 1) return null;

  const element = node as Element;
  const tag = element.tagName.toLowerCase();
  if (tag === 'script' || tag === 'style' || tag === 'iframe' || tag === 'object' || tag === 'svg') return null;
  const children = Array.from(element.childNodes).map((child, index) => renderDescriptionNode(child, `${key}-${index}`));
  const safeTags = new Set(['p', 'strong', 'b', 'em', 'i', 'br', 'ul', 'ol', 'li', 'h2', 'h3', 'h4']);
  if (safeTags.has(tag)) return createElement(tag === 'b' ? 'strong' : tag === 'i' ? 'em' : tag, { key }, ...children);
  if (tag === 'a') {
    const href = element.getAttribute('href') ?? '';
    if (/^(https?:\/\/|mailto:|\/)/i.test(href)) return createElement('a', { key, href, rel: 'noreferrer' }, ...children);
  }
  return createElement(Fragment, { key }, ...children);
}

function renderProductDescription(descriptionHtml: string): ReactNode {
  if (typeof document === 'undefined') return descriptionHtml;
  const template = document.createElement('template');
  template.innerHTML = descriptionHtml;
  return Array.from(template.content.childNodes).map((node, index) => renderDescriptionNode(node, `description-${index}`));
}

function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amountCents / 100);
}

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setProduct(null);
    setRelatedProducts([]);
    setPaymentOpen(false);
    setMessage('');
    setActiveTab('description');
    setQuantity(1);
    void fetch(`/api/v1/catalog/products/${slug}`)
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
        const nextProduct = normalizeStoreProduct(payload);
        if (!active) return;
        setProduct(nextProduct);
        if (!nextProduct) return;

        const preferredSlugs = originalRelatedSlugs[nextProduct.slug];
        const categorySlug = nextProduct.categories?.[0]?.slug;
        if (preferredSlugs?.length) {
          void Promise.all(preferredSlugs.map(async (relatedSlug) => {
            const response = await fetch(`/api/v1/catalog/products/${encodeURIComponent(relatedSlug)}`);
            return response.ok ? response.json() as Promise<unknown> : null;
          }))
            .then((relatedPayloads) => {
              if (active) setRelatedProducts(relatedPayloads.map(normalizeStoreProduct).filter((item): item is StoreProduct => item !== null));
            })
            .catch(() => { if (active) setRelatedProducts([]); });
          return;
        }

        if (categorySlug) {
          void fetch(`/api/v1/catalog/products?category=${encodeURIComponent(categorySlug)}`)
            .then(async (response) => (response.ok ? response.json() as Promise<unknown> : []))
            .then((relatedPayload) => {
              if (!active) return;
              const records = Array.isArray(relatedPayload) ? relatedPayload : [];
              const related = records
                .map(normalizeStoreProduct)
                .filter((item): item is StoreProduct => item !== null && item.slug !== nextProduct.slug)
                .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))
                .slice(0, 4);
              setRelatedProducts(related);
            })
            .catch(() => { if (active) setRelatedProducts([]); });
        }
      })
      .catch(() => setProduct(null));
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    setIsFavorite(Boolean(slug && readFavoriteProductSlugs().includes(slug)));
  }, [slug]);

  async function handleAddToCart(buyNow = false) {
    if (!product?.variantId) return;
    setAdding(true);
    setMessage('');
    try {
      const publicId = await getOrCreateCart();
      await addCartItem(publicId, product.variantId, quantity);
      if (buyNow) {
        navigate('/checkout');
      } else {
        setMessage('Produto adicionado ao carrinho.');
      }
    } catch {
      setMessage('Não foi possível adicionar o produto ao carrinho.');
    } finally {
      setAdding(false);
    }
  }

  function toggleFavorite() {
    if (!product) return;
    const nextIsFavorite = !isFavorite;
    setFavoriteProduct(product.slug, nextIsFavorite);
    setIsFavorite(nextIsFavorite);
    setMessage(nextIsFavorite ? 'Produto salvo nos favoritos.' : 'Produto removido dos favoritos.');
  }

  if (!product) {
    return (
      <main className="page-section">
        <div className="site-container">
          <p className="empty-state" role="status">Carregando produto…</p>
        </div>
      </main>
    );
  }

  const price = formatCurrency(product.price.amount);
  const installment = formatCurrency(Math.ceil(product.price.amount / 3));
  const rating = product.rating;
  const category = product.categories?.[0];
  const reviewsCount = rating?.count ?? 0;
  const isLowStock = product.available
    && product.stockQuantity !== null
    && product.stockQuantity !== undefined
    && product.stockQuantity > 0
    && product.stockQuantity <= (product.lowStockThreshold ?? 5);
  const stockMessage = product.stockStatus === 'ON_BACKORDER'
    ? 'Disponível sob encomenda'
    : !product.available
      ? 'Indisponível no momento'
      : isLowStock
        ? `Restam apenas ${product.stockQuantity} ${product.stockQuantity === 1 ? 'unidade' : 'unidades'}`
        : 'Disponível para envio';
  const shareHref = `https://wa.me/?text=${encodeURIComponent(`Confira ${product.name}: ${window.location.href}`)}`;

  return (
    <main className="page-section">
      <div className="site-container">
        <nav className="product-breadcrumb" aria-label="Navegação estrutural">
          <ol>
            <li><Link to="/">Início</Link></li>
            <li>{category ? <Link to={`/categoria/${category.slug}`}>{category.name}</Link> : <Link to="/loja">Loja</Link>}</li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>
        <article className="product-detail">
          <div className="product-detail__gallery">
            <button
              className={`product-detail__favorite${isFavorite ? ' is-active' : ''}`}
              type="button"
              aria-label={isFavorite ? 'Remover produto dos favoritos' : 'Favoritar produto'}
              aria-pressed={isFavorite}
              onClick={toggleFavorite}
            >
              <Icon name="heart" size={21} strokeWidth={1.8} fill={isFavorite ? 'currentColor' : undefined} />
            </button>
            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span className="product-card__placeholder">Imagem do produto</span>}
          </div>
          <div className="product-detail__info">
            <h1>{product.name}</h1>
            {rating ? (
              <div className="product-detail__rating" aria-label={`Avaliação ${rating.value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} de 5 estrelas com ${rating.count} avaliações`}>
                <span className="product-detail__rating-stars" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((star) => <Icon key={star} name="star" size={16} strokeWidth={1.6} fill="currentColor" data-testid="product-rating-star" />)}
                </span>
                <strong>{rating.value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong>
                <span className="product-detail__rating-count">({rating.count})</span>
              </div>
            ) : null}
            <p className="product-detail__price">{price}</p>
            <p className="product-detail__payment-summary">À vista no Pix ou até 3x de {installment} no cartão</p>
            <label className="product-detail__quantity" htmlFor="product-quantity">Quantidade
              <input id="product-quantity" type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number.parseInt(event.target.value, 10) || 1))} />
            </label>
            <p className={`product-detail__stock${isLowStock ? ' product-detail__stock--low' : ''}${product.available ? '' : ' product-detail__stock--unavailable'}`}>
              {stockMessage}
            </p>
            <div className="product-detail__payment">
              <div className="product-detail__payment-heading">
                <span><Icon name="credit-card" size={17} strokeWidth={1.8} /> Formas de pagamento</span>
                <strong>{price}</strong>
              </div>
              <button className="product-detail__payment-trigger" type="button" aria-expanded={paymentOpen} aria-controls="product-payment-options" onClick={() => setPaymentOpen((current) => !current)}>
                {paymentOpen ? 'Ocultar opções de pagamento' : 'Ver opções de pagamento'}
                <Icon name={paymentOpen ? 'arrow-up' : 'arrow-right'} size={16} strokeWidth={2} />
              </button>
              {paymentOpen ? (
                <div id="product-payment-options" className="product-detail__payment-options" role="region" aria-label="Opções de pagamento">
                  <div><span>Pix</span><strong>À vista • {price}</strong></div>
                  <div><span>Cartão de crédito</span><strong>Até 3x de {installment}</strong></div>
                  <small>Condições finais exibidas no checkout.</small>
                </div>
              ) : null}
            </div>
            <div className="product-detail__actions">
              <button className="button button--primary" type="button" disabled={!product.available || !product.variantId || adding} onClick={() => void handleAddToCart()}>
                {adding ? 'Adicionando…' : 'Adicionar ao carrinho'}
              </button>
              <button className="button button--secondary" type="button" disabled={!product.available || !product.variantId || adding} onClick={() => void handleAddToCart(true)}>
                Comprar agora
              </button>
            </div>
            <a className="product-detail__share" href={shareHref} target="_blank" rel="noreferrer" aria-label="Compartilhar no WhatsApp">
              <Icon name="message-circle" size={17} strokeWidth={1.8} /> Compartilhar no WhatsApp
            </a>
            {message ? <p className="form-success" role="status">{message}</p> : null}
            {!product.variantId ? <small className="product-detail__note">A opção de compra ficará disponível após a publicação da variação.</small> : null}
          </div>
        </article>

        <section className="product-detail__content" aria-labelledby="product-content-title">
          <h2 id="product-content-title" className="product-detail__repeat-title">{product.name}</h2>
          <div className="product-detail__metadata">
            {product.sku ? <p><strong>SKU</strong> <span>{product.sku}</span></p> : null}
            {category ? <p><strong>Category</strong> <Link to={`/categoria/${category.slug}`}>{category.name}</Link></p> : null}
            {product.brandName ? <p><strong>Marca:</strong> <Link to={product.brandSlug ? `/marca/${product.brandSlug}` : '/loja'}>{product.brandName}</Link></p> : null}
          </div>
          <div className="product-tabs">
            <div className="product-tabs__list" role="tablist" aria-label="Informações do produto">
              <button id="product-description-tab" type="button" role="tab" aria-selected={activeTab === 'description'} aria-controls="product-description-panel" onClick={() => setActiveTab('description')}>Descrição</button>
              <button id="product-reviews-tab" type="button" role="tab" aria-selected={activeTab === 'reviews'} aria-controls="product-reviews-panel" onClick={() => setActiveTab('reviews')}>Avaliações ({reviewsCount})</button>
            </div>
            {activeTab === 'description' ? (
              <section id="product-description-panel" className="product-tabs__panel" role="tabpanel" aria-labelledby="product-description-tab">
                <h3>Descrição</h3>
                {product.descriptionHtml ? <div className="product-description-copy">{renderProductDescription(product.descriptionHtml)}</div> : <p className="product-description-copy--missing">Descrição não informada para este produto.</p>}
              </section>
            ) : (
              <section id="product-reviews-panel" className="product-tabs__panel" role="tabpanel" aria-labelledby="product-reviews-tab" aria-label="Avaliações">
                <h3>Avaliações</h3>
                {rating?.count ? <p>{rating.count} avaliações com nota média {rating.value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} de 5.</p> : <p>Ainda não há avaliações para este produto.</p>}
              </section>
            )}
          </div>
        </section>

        {relatedProducts.length ? (
          <section className="related-products" aria-labelledby="related-products-title">
            <p className="eyebrow">Related Products</p>
            <h2 id="related-products-title">Produtos relacionados</h2>
            <div className="product-grid">{relatedProducts.map((relatedProduct) => <ProductCard key={relatedProduct.slug} product={relatedProduct} catalogAppearance />)}</div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
