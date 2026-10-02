import { useParams } from 'react-router-dom';
import { ShopPage } from './shop-page';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  return <ShopPage scope={slug ? { key: 'category', value: slug } : undefined} />;
}
