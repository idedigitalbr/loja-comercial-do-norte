'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Heart,
  LogOut,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useFavorites } from '@/components/favorites-provider';
import { useQuoteCart } from '@/components/quote-cart-provider';
import { AuthFlowCard } from '@/components/auth-flow-card';

function AccountDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout, ready } = useAuth();
  const { count: favCount } = useFavorites();
  const { count: cartCount } = useQuoteCart();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.push('/login?redirect=/conta');
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16 text-slate-400 text-sm">
        Carregando seus dados…
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] bg-[#F4F7FB] pb-16 pt-8">
      <div className="cn-container">
        {/* CABEÇALHO DO PAINEL DO CLIENTE */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#004CB1] text-xl font-black text-white shadow-sm">
                {user.firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#004CB1]">
                  Painel do Cliente
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1D2433]">
                  Olá, {user.fullName}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">{user.email}</p>
              </div>
            </div>

            <button
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 cursor-pointer self-start sm:self-auto"
              onClick={logout}
              type="button"
            >
              <LogOut className="size-4" />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>

        {/* CARDS DE RESUMO E ACESSO RÁPIDO */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* CARD 01: FAVORITOS */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#004CB1]/40 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-[#E2091E]">
                  <Heart className="size-5 fill-[#E2091E]" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {favCount} {favCount === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <h2 className="mt-3 text-base font-bold text-slate-900">Meus Favoritos</h2>
              <p className="mt-1 text-xs text-slate-500">
                Produtos salvos para agilizar suas cotações recorrentes e reposições.
              </p>
            </div>
            <Link
              className="mt-4 flex items-center justify-between text-xs font-bold text-[#004CB1] hover:underline pt-2 border-t border-slate-100"
              href="/favoritos"
            >
              <span>Acessar lista de favoritos</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* CARD 02: COTAÇÕES E COMPRAS */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#004CB1]/40 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-[#004CB1]">
                  <ShoppingBag className="size-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {cartCount} {cartCount === 1 ? 'item ativo' : 'itens ativos'}
                </span>
              </div>
              <h2 className="mt-3 text-base font-bold text-slate-900">Minhas Cotações</h2>
              <p className="mt-1 text-xs text-slate-500">
                Consulte sua lista de itens para negociar descontos no atacado e varejo.
              </p>
            </div>
            <Link
              className="mt-4 flex items-center justify-between text-xs font-bold text-[#004CB1] hover:underline pt-2 border-t border-slate-100"
              href="/compras"
            >
              <span>Ver sacola e histórico</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* CARD 03: DADOS CADASTRAIS */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#004CB1]/40 hover:shadow-md sm:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="size-5" />
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  Conta Ativa
                </span>
              </div>
              <h2 className="mt-3 text-base font-bold text-slate-900">Dados da Conta</h2>
              <p className="mt-1 text-xs text-slate-500">
                Cadastro simplificado ativo. Endereço e faturamento são confirmados na cotação.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
              <div><strong>Nome:</strong> {user.fullName}</div>
              <div className="truncate"><strong>E-mail:</strong> {user.email}</div>
            </div>
          </div>
        </div>

        {/* INFORMAÇÕES DE SUPORTE E UNIDADES FÍSICAS */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Canais de Atendimento Oficial
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <Phone className="size-5 text-[#004CB1] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-slate-900">WhatsApp Vendas</strong>
                <span className="block text-xs text-slate-500">(91) 98344-0880</span>
                <a
                  className="mt-1 inline-block text-xs font-bold text-[#004CB1] hover:underline"
                  href="https://wa.me/5591983440880"
                  rel="noreferrer"
                  target="_blank"
                >
                  Falar com consultor agora &rarr;
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <Store className="size-5 text-[#E2091E] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-slate-900">Nossas Unidades em Belém</strong>
                <span className="block text-xs text-slate-500">
                  Bernardo Sayão &amp; Jurunas (Pronta-entrega e retirada)
                </span>
                <Link
                  className="mt-1 inline-block text-xs font-bold text-[#004CB1] hover:underline"
                  href="/loja"
                >
                  Explorar catálogo completo &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center py-16 text-slate-400 text-sm">
          Carregando...
        </div>
      }
    >
      <AccountDashboard />
    </Suspense>
  );
}
