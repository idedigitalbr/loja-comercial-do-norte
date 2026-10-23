import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/account/login-page';
import { AccountLayout } from '../features/account/account-layout';
import { BrandPage } from '../pages/brand-page';
import { CartPage } from '../pages/cart-page';
import { CheckoutPage } from '../pages/checkout-page';
import { AccountOrdersPage } from '../pages/account-orders-page';
import { AccountDashboardPage } from '../pages/account-dashboard-page';
import { AccountOrderDetailPage } from '../pages/account-order-detail-page';
import { AccountProfilePage } from '../pages/account-profile-page';
import { AccountAddressesPage } from '../pages/account-addresses-page';
import { AccountFavoritesPage } from '../pages/account-favorites-page';
import { AccountSecurityPage } from '../pages/account-security-page';
import { AdminAppRedirect } from './admin-app-redirect';
import { CategoryPage } from '../pages/category-page';
import { ProductPage } from '../pages/product-page';
import { OrderConfirmationPage } from '../pages/order-confirmation-page';
import { ShopPage } from '../pages/shop-page';

export function StorefrontRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ShopPage />} />
      <Route path="/loja" element={<Navigate replace to="/" />} />
      <Route path="/entrar" element={<LoginPage />} />
      <Route path="/admin/*" element={<AdminAppRedirect />} />
      <Route path="/carrinho" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/pedido/:publicId" element={<OrderConfirmationPage />} />
      <Route path="/conta" element={<AccountLayout title="Minha conta" description="Acompanhe seus pedidos e cotações."><AccountDashboardPage /></AccountLayout>} />
      <Route path="/conta/pedidos" element={<AccountLayout title="Meus pedidos" description="Consulte o andamento e os detalhes de cada pedido."><AccountOrdersPage /></AccountLayout>} />
      <Route path="/conta/pedidos/:publicId" element={<AccountLayout title="Detalhes do pedido" description="Veja os itens e o andamento da sua solicitação."><AccountOrderDetailPage /></AccountLayout>} />
      <Route path="/conta/dados" element={<AccountLayout title="Meus dados" description="Mantenha suas informações cadastrais atualizadas."><AccountProfilePage /></AccountLayout>} />
      <Route path="/conta/enderecos" element={<AccountLayout title="Meus endereços" description="Endereços de entrega cadastrados."><AccountAddressesPage /></AccountLayout>} />
      <Route path="/conta/favoritos" element={<AccountLayout title="Meus favoritos" description="Produtos salvos para consulta rápida."><AccountFavoritesPage /></AccountLayout>} />
      <Route path="/conta/seguranca" element={<AccountLayout title="Segurança" description="Atualização de senha e credenciais de acesso."><AccountSecurityPage /></AccountLayout>} />
      <Route path="/categoria/:slug" element={<CategoryPage />} />
      <Route path="/marca/:slug" element={<BrandPage />} />
      <Route path="/produto/:slug" element={<ProductPage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
