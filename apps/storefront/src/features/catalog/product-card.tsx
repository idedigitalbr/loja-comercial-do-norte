import { useEffect, useState } from 'react';
import { Icon } from '@commerce/ui';
import { Link } from 'react-router-dom';
import { FAVORITES_UPDATED_EVENT, readFavoriteProductSlugs, setFavoriteProduct } from './favorites';

export type StoreProduct = {
  publicId: string;
  slug: string;
  name: string;
  brandName: string | null;
  brandSlug?: string | null;
  sku?: string | null;
  descriptionHtml?: string | null;
  categories?: Array<{ name: string; slug: string }>;
  price: { amount: number; currency: 'BRL' };
  available: boolean;
  imageUrl?: string | null;
  variantId?: string;
  compareAtPriceCents?: number | null;
  stockQuantity?: number | null;
  lowStockThreshold?: number | null;
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER';
  rating?: { value: number; count: number };
  isNew?: boolean;
  isTrending?: boolean;
};

export function ProductCard({ product, catalogAppearance = false }: { product: StoreProduct; catalogAppearance?: boolean }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const rating = product.rating;
  const compareAtPrice = product.compareAtPriceCents !== null && product.compareAtPriceCents !== undefined && product.compareAtPriceCents > product.price.amount
    ? product.compareAtPriceCents
    : null;
  const discountPercentage = compareAtPrice ? Math.round(((compareAtPrice - product.price.amount) / compareAtPrice) * 100) : null;
  const isLowStock = product.available
    && product.stockQuantity !== null
    && product.stockQuantity !== undefined
    && product.stockQuantity > 0
    && product.stockQuantity <= (product.lowStockThreshold ?? 5);
  const badges = [
    discountPercentage ? { label: `${discountPercentage}% OFF`, modifier: 'product-card__badge--sale' } : null,
    product.isNew ? { label: 'Novidade', modifier: 'product-card__badge--new' } : null,
    isLowStock ? { label: 'Quase acabando', modifier: 'product-card__badge--low' } : null,
    product.isTrending ? { label: 'Em alta', modifier: 'product-card__badge--trending' } : null,
  ].filter((badge): badge is { label: string; modifier: string } => badge !== null);
  const visibleBadges = catalogAppearance ? badges.filter((badge) => badge.modifier === 'product-card__badge--sale') : badges;

  useEffect(() => {
    const syncFavorite = () => setIsFavorite(readFavoriteProductSlugs().includes(product.slug));
    syncFavorite();
    window.addEventListener(FAVORITES_UPDATED_EVENT, syncFavorite);
    return () => window.removeEventListener(FAVORITES_UPDATED_EVENT, syncFavorite);
  }, [product.slug]);

  function toggleFavorite() {
    setIsFavorite((current) => setFavoriteProduct(product.slug, !current));
  }

  return (
    <article className="product-card">
      <div className="product-card__media">
        <Link className="product-card__image" to={`/produto/${product.slug}`} aria-label={`Ver ${product.name}`}>
          <img src={product.imageUrl ?? '/woocommerce-placeholder.png'} alt="" />
        </Link>
        {visibleBadges.length ? <div className="product-card__badges" aria-label="Destaques do produto">{visibleBadges.map((badge) => <span className={`product-card__badge ${badge.modifier}`} key={badge.label}>{catalogAppearance && badge.modifier === 'product-card__badge--sale' ? 'Oferta!' : badge.label}</span>)}</div> : null}
        {!catalogAppearance ? <button className={`product-card__favorite${isFavorite ? ' is-active' : ''}`} type="button" aria-label={isFavorite ? 'Remover produto dos favoritos' : 'Favoritar produto'} aria-pressed={isFavorite} onClick={toggleFavorite}>
          <Icon name="heart" size={18} strokeWidth={1.8} fill={isFavorite ? 'currentColor' : undefined} />
        </button> : null}
      </div>
      <div className="product-card__body">
        {!catalogAppearance && product.brandName ? <span className="product-card__brand">{product.brandName}</span> : null}
        <div className="product-card__title">
          <h2><Link to={`/produto/${product.slug}`} aria-describedby={`product-card-tooltip-${product.slug}`}>{product.name}</Link></h2>
          <span className="product-card__tooltip" id={`product-card-tooltip-${product.slug}`} role="tooltip">{product.name}</span>
        </div>
        {catalogAppearance ? null : rating ? (
          <div className="product-card__rating" aria-label={`Avaliação ${rating.value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} de 5 estrelas com ${rating.count} avaliações`}>
            <span className="product-card__rating-stars" aria-hidden="true">{[0, 1, 2, 3, 4].map((star) => <Icon key={star} name="star" size={13} strokeWidth={1.6} fill="currentColor" data-testid="product-card-rating-star" />)}</span>
            <strong>{rating.value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong>
            <span className="product-card__rating-count">({rating.count})</span>
          </div>
        ) : (
          <div className="product-card__rating product-card__rating--empty" aria-label="Ainda sem avaliações">Ainda sem avaliações</div>
        )}
        <div className="product-card__price-group">
          {compareAtPrice ? <div className="product-card__price-before"><del>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.price.currency }).format(compareAtPrice / 100)}</del></div> : null}
          <p className="product-card__price">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.price.currency }).format(product.price.amount / 100)}</p>
        </div>
        <div className="product-card__actions">
          <Link className="button button--primary product-card__view" to={`/produto/${product.slug}`} aria-label={`Ver produto: ${product.name}`}>
            <Icon name="eye" size={16} strokeWidth={1.9} />
            <span>Ver produto</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
