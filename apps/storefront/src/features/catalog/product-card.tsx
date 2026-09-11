import { Link } from 'react-router-dom';

export type StoreProduct = {
  publicId: string;
  slug: string;
  name: string;
  brandName: string | null;
  price: { amount: number; currency: 'BRL' };
  available: boolean;
};

export function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <article>
      <Link to={`/produto/${product.slug}`}>
        <div aria-hidden="true">Imagem do produto</div>
        {product.brandName ? <small>{product.brandName}</small> : null}
        <h2>{product.name}</h2>
        <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.price.currency }).format(product.price.amount / 100)}</p>
        <span>{product.available ? 'Disponível' : 'Indisponível'}</span>
      </Link>
    </article>
  );
}
