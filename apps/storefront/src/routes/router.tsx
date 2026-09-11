import { Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/account/login-page';
import { BrandPage } from '../pages/brand-page';
import { CartPage } from '../pages/cart-page';
import { CategoryPage } from '../pages/category-page';
import { ProductPage } from '../pages/product-page';
import { ShopPage } from '../pages/shop-page';

export function StorefrontRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/loja" element={<ShopPage />} />
      <Route path="/carrinho" element={<CartPage />} />
      <Route path="/categoria/:slug" element={<CategoryPage />} />
      <Route path="/marca/:slug" element={<BrandPage />} />
      <Route path="/produto/:slug" element={<ProductPage />} />
    </Routes>
  );
}
