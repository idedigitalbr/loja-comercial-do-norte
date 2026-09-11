import { Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/account/login-page';
import { BrandPage } from '../pages/brand-page';
import { CartPage } from '../pages/cart-page';
import { CheckoutPage } from '../pages/checkout-page';
import { TrainingPage } from '../pages/training-page';
import { AccountOrdersPage } from '../pages/account-orders-page';
import { CategoryPage } from '../pages/category-page';
import { ProductPage } from '../pages/product-page';
import { ShopPage } from '../pages/shop-page';

export function StorefrontRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/loja" element={<ShopPage />} />
      <Route path="/carrinho" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/treinamento/:publicId" element={<TrainingRoute />} />
      <Route path="/conta/pedidos" element={<AccountOrdersPage />} />
      <Route path="/categoria/:slug" element={<CategoryPage />} />
      <Route path="/marca/:slug" element={<BrandPage />} />
      <Route path="/produto/:slug" element={<ProductPage />} />
    </Routes>
  );
}

function TrainingRoute() {
  const publicId = window.location.pathname.split('/').pop() ?? '';
  return <TrainingPage publicId={publicId} />;
}
