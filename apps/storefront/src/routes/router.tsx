import { Navigate, Route, Routes } from 'react-router-dom';
import { AboutPage } from '../pages/about-page';
import { LoginPage } from '../features/account/login-page';
import { AccountLayout } from '../features/account/account-layout';
import { BrandPage } from '../pages/brand-page';
import { CartPage } from '../pages/cart-page';
import { CheckoutPage } from '../pages/checkout-page';
import { CertificationPage } from '../pages/certification-page';
import { TrainingPage } from '../pages/training-page';
import { AccountOrdersPage } from '../pages/account-orders-page';
import { AccountDashboardPage } from '../pages/account-dashboard-page';
import { AccountOrderDetailPage } from '../pages/account-order-detail-page';
import { AccountProfilePage } from '../pages/account-profile-page';
import { AccountAddressesPage } from '../pages/account-addresses-page';
import { AccountFavoritesPage } from '../pages/account-favorites-page';
import { AccountSecurityPage } from '../pages/account-security-page';
import { AdminAppRedirect } from './admin-app-redirect';
import { CategoryPage } from '../pages/category-page';
import { HomePage } from '../pages/home-page';
import { ProductPage } from '../pages/product-page';
import { OrderConfirmationPage } from '../pages/order-confirmation-page';
import { ServiceDetailPage } from '../pages/service-detail-page';
import { ShopPage } from '../pages/shop-page';

export function StorefrontRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/entrar" element={<LoginPage />} />
      <Route path="/admin/*" element={<AdminAppRedirect />} />
      <Route path="/sobre-nos" element={<AboutPage />} />
      <Route path="/servicos" element={<Navigate replace to="/" />} />
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
      <Route path="/conta" element={<AccountLayout title="Minha conta" description="Acompanhe seus pedidos e mantenha seus dados sempre atualizados."><AccountDashboardPage /></AccountLayout>} />
      <Route path="/conta/pedidos" element={<AccountLayout title="Meus pedidos" description="Consulte o andamento e os detalhes de cada compra."><AccountOrdersPage /></AccountLayout>} />
      <Route path="/conta/pedidos/:publicId" element={<AccountLayout title="Detalhes do pedido" description="Veja os itens, o pagamento e o andamento da sua compra."><AccountOrderDetailPage /></AccountLayout>} />
      <Route path="/conta/dados" element={<AccountLayout title="Meus dados" description="Mantenha suas informações atualizadas para uma experiência mais simples."><AccountProfilePage /></AccountLayout>} />
      <Route path="/conta/enderecos" element={<AccountLayout title="Meus endereços" description="Salve seus endereços para agilizar suas próximas compras."><AccountAddressesPage /></AccountLayout>} />
      <Route path="/conta/favoritos" element={<AccountLayout title="Meus favoritos" description="Guarde produtos para consultar depois e montar sua próxima rotina."><AccountFavoritesPage /></AccountLayout>} />
      <Route path="/conta/seguranca" element={<AccountLayout title="Segurança" description="Cuide do acesso à sua conta com uma senha sempre atualizada."><AccountSecurityPage /></AccountLayout>} />
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
