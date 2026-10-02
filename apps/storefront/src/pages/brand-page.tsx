import { useParams } from 'react-router-dom';
import { ShopPage } from './shop-page';

export function BrandPage() {
  const { slug } = useParams<{ slug: string }>();
  return <ShopPage scope={slug ? { key: 'brand', value: slug } : undefined} />;
}
