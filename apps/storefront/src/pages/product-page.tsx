import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addCartItem, getOrCreateCart } from '../features/cart/cart-client';
import { StoreProduct } from '../features/catalog/product-card';
import { normalizeStoreProduct } from '../features/catalog/catalog-adapter';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!slug) return;
    void fetch(`/api/v1/catalog/products/${slug}`)
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => setProduct(normalizeStoreProduct(payload)))
      .catch(() => setProduct(null));
  }, [slug]);

  async function handleAddToCart() {
    if (!product?.variantId) return;
    setAdding(true);
    setMessage('');
    try {
      const publicId = await getOrCreateCart();
      await addCartItem(publicId, product.variantId);
      setMessage('Produto adicionado ao carrinho.');
    } catch {
      setMessage('Não foi possível adicionar o produto ao carrinho.');
    } finally {
      setAdding(false);
    }
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

  const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.price.currency }).format(product.price.amount / 100);

  return (
    <main className="page-section">
      <div className="site-container">
        <article className="product-detail">
          <div className="product-detail__gallery">
            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span className="product-card__placeholder">Imagem do produto</span>}
          </div>
          <div className="product-detail__info">
            <p className="eyebrow">{product.brandName ?? 'Linha profissional'}</p>
            <h1>{product.name}</h1>
            <p className="product-detail__price">{price}</p>
            <p className="product-detail__description">Produto profissional selecionado para a rotina de cuidado dos seus fios.</p>
            <p className={`product-card__status${product.available ? '' : ' product-card__status--unavailable'}`}>
              {product.available ? 'Disponível para envio' : 'Indisponível no momento'}
            </p>
            <button className="button button--primary" type="button" disabled={!product.available || !product.variantId || adding} onClick={() => void handleAddToCart()}>
              {adding ? 'Adicionando…' : 'Adicionar ao carrinho'}
            </button>
            {message ? <p className="form-success" role="status">{message}</p> : null}
            {!product.variantId ? <small className="product-detail__note">A opção de compra ficará disponível após a publicação da variação.</small> : null}
          </div>
        </article>
      </div>
    </main>
  );
}
