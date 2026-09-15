import { Route, Routes } from 'react-router-dom';
import { AboutPage } from '../pages/about-page';
import { LoginPage } from '../features/account/login-page';
import { BrandPage } from '../pages/brand-page';
import { CartPage } from '../pages/cart-page';
import { CheckoutPage } from '../pages/checkout-page';
import { CertificationPage } from '../pages/certification-page';
import { TrainingPage } from '../pages/training-page';
import { AccountOrdersPage } from '../pages/account-orders-page';
import { CategoryPage } from '../pages/category-page';
import { HomePage } from '../pages/home-page';
import { ProductPage } from '../pages/product-page';
import { OrderConfirmationPage } from '../pages/order-confirmation-page';
import { ServicesPage } from '../pages/services-page';
import { ServiceDetailPage } from '../pages/service-detail-page';
import { ShopPage } from '../pages/shop-page';

export function StorefrontRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/entrar" element={<LoginPage />} />
      <Route path="/sobre-nos" element={<AboutPage />} />
      <Route path="/servicos" element={<ServicesPage />} />
      <Route path="/cabelos-e-penteados" element={<ServiceDetailPage slug="cabelos-e-penteados" />} />
      <Route path="/maquiagem" element={<ServiceDetailPage slug="maquiagem" />} />
      <Route path="/manicure-pedicure" element={<ServiceDetailPage slug="manicure-pedicure" />} />
      <Route path="/terapia-capilar" element={<ServiceDetailPage slug="terapia-capilar" />} />
      <Route path="/certificacao-internacional" element={<CertificationPage />} />
      <Route path="/loja" element={<ShopPage />} />
      <Route path="/carrinho" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/pedido/:publicId" element={<OrderConfirmationPage />} />
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
