import { useEffect, useState } from 'react';
import { Icon } from '@commerce/ui';
import { Link } from 'react-router-dom';
import { AccountFavorite, accountApi } from '../features/account/account-client';
import { AccountEmptyState } from '../features/account/account-components';
import { readFavoriteProductSlugs, setFavoriteProduct } from '../features/catalog/favorites';
import { formatAccountCurrency } from '../features/account/account-presenters';

export function AccountFavoritesPage() {
  const [favorites, setFavorites] = useState<AccountFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState('');

  async function loadFavorites() {
    setLoading(true); setError('');
    try {
      let current = await accountApi.favorites();
      const remoteKeys = new Set(current.map((favorite) => favorite.product.slug));
      const localSlugs = readFavoriteProductSlugs().filter((slug) => !remoteKeys.has(slug));
      if (localSlugs.length) {
        await Promise.all(localSlugs.map((slug) => accountApi.addFavorite(slug).catch(() => null)));
        localSlugs.forEach((slug) => setFavoriteProduct(slug, false));
        current = await accountApi.favorites();
      }
      setFavorites(current);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível carregar seus favoritos.'); } finally { setLoading(false); }
  }
  useEffect(() => { void loadFavorites(); }, []);
  async function removeFavorite(favorite: AccountFavorite) { setRemoving(favorite.product.publicId); try { await accountApi.removeFavorite(favorite.product.publicId); setFavoriteProduct(favorite.product.slug, false); setFavorites((current) => current.filter((item) => item.id !== favorite.id)); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível remover este favorito.'); } finally { setRemoving(''); } }

  return <div className="account-page-content"><div className="account-content-heading"><div><p className="eyebrow">Sua curadoria</p><h2>Meus favoritos</h2><p>Guarde produtos para consultar depois e montar sua próxima rotina.</p></div></div>{loading ? <div className="account-state account-state--inline" role="status"><span className="account-spinner" aria-hidden="true" />Carregando favoritos…</div> : error ? <div className="account-state account-state--error" role="alert"><Icon name="circle-alert" size={21} strokeWidth={1.8} /><div><strong>Não foi possível carregar seus favoritos</strong><p>{error}</p><button className="button button--secondary" type="button" onClick={() => void loadFavorites()}>Tentar novamente</button></div></div> : favorites.length ? <div className="account-favorite-grid">{favorites.map((favorite) => { const variant = favorite.product.variants[0]; const image = favorite.product.images[0]; return <article className="account-favorite-card" key={favorite.id}><div className="account-favorite-card__media"><Link to={`/produto/${favorite.product.slug}`} aria-label={`Ver ${favorite.product.name}`}>{image ? <img src={image.path} alt={image.altText || ''} /> : <span>Imagem do produto</span>}</Link><button type="button" aria-label={`Remover ${favorite.product.name} dos favoritos`} onClick={() => void removeFavorite(favorite)} disabled={removing === favorite.product.publicId}><Icon name="heart" size={18} strokeWidth={1.8} fill="currentColor" /></button></div><div className="account-favorite-card__body">{favorite.product.brand ? <span className="product-card__brand">{favorite.product.brand.name}</span> : null}<h3>{favorite.product.name}</h3>{variant ? <div className="account-favorite-card__price">{variant.compareAtPriceCents && variant.compareAtPriceCents > variant.priceCents ? <del>{formatAccountCurrency(variant.compareAtPriceCents)}</del> : null}<strong>{formatAccountCurrency(variant.priceCents)}</strong></div> : <span className="account-muted">Preço sob consulta</span>}<Link className="button button--secondary" to={`/produto/${favorite.product.slug}`}>Ver produto <Icon name="arrow-up-right" size={15} strokeWidth={1.8} /></Link></div></article>; })}</div> : <AccountEmptyState icon="heart" title="Sua lista está esperando por você" description="Toque no coração dos produtos que você quer guardar para depois." action={<Link className="button button--primary" to="/loja">Explorar a loja</Link>} />}</div>;
}
