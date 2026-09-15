import { Link } from 'react-router-dom';

export type StoreProduct = {
  publicId: string;
  slug: string;
  name: string;
  brandName: string | null;
  price: { amount: number; currency: 'BRL' };
  available: boolean;
  imageUrl?: string | null;
  variantId?: string;
};

export function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <article className="product-card">
      <Link className="product-card__image" to={`/produto/${product.slug}`} aria-label={`Ver ${product.name}`}>
        <span className={`product-card__badge${product.available ? '' : ' product-card__badge--unavailable'}`}>{product.available ? 'Disponível' : 'Indisponível'}</span>
        {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span className="product-card__placeholder">Imagem do produto</span>}
      </Link>
      <div className="product-card__body">
        {product.brandName ? <span className="product-card__brand">{product.brandName}</span> : null}
        <h2>{product.name}</h2>
        <p className="product-card__price">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.price.currency }).format(product.price.amount / 100)}</p>
        <div className="product-card__actions">
          <Link className="button button--primary" to={`/produto/${product.slug}`}>Ver produto</Link>
        </div>
      </div>
    </article>
  );
}
