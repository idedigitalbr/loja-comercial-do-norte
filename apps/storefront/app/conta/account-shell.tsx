'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AtSign,
  ChevronRight,
  Crown,
  ExternalLink,
  Gem,
  Heart,
  Home,
  LogOut,
  MessageSquare,
  Package,
  RefreshCw,
  ShoppingBag,
  Star,
  User,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

const NAV_TABS = [
  {
    href: '/conta',
    label: 'Visão geral',
    icon: Home,
    exact: true,
  },
  {
    href: '/conta/dados-pessoais',
    label: 'Dados pessoais',
    icon: User,
  },
  {
    href: '/conta/contato',
    label: 'E-mail, telefone & segurança',
    icon: AtSign,
  },
  {
    href: '/conta/pedidos',
    label: 'Meus pedidos & cotações',
    icon: Package,
  },
  {
    href: '/conta/trocas',
    label: 'Trocas e cancelamentos',
    icon: RefreshCw,
  },
  {
    href: '/conta/atendimento',
    label: 'Fale com o lojista',
    icon: MessageSquare,
  },
  {
    href: '/conta/fidelidade',
    label: 'Clube Ouro & Pontos',
    icon: Star,
  },
];

export function AccountShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, ready } = useAuth();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/conta')}`);
    }
  }, [ready, isAuthenticated, router, pathname]);

  if (!ready || !isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 text-slate-500 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-3 border-[#004CB1] border-t-transparent" />
          <span>Carregando sua conta…</span>
        </div>
      </div>
    );
  }

  const initial = (user.firstName || user.fullName || 'C').charAt(0).toUpperCase();

  return (
    <div className="min-h-[80vh] bg-[#F4F7FB] pb-16 pt-6 sm:pt-8">
      <div className="cn-container">
        {/* BREADCRUMB */}
        <nav aria-label="Navegação da conta" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
          <Link className="hover:text-[#004CB1] transition" href="/">
            Início
          </Link>
          <ChevronRight className="size-3.5 text-slate-400" />
          <Link className="hover:text-[#004CB1] transition" href="/conta">
            Minha Conta
          </Link>
          {pathname !== '/conta' && (
            <>
              <ChevronRight className="size-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">
                {NAV_TABS.find((t) => !t.exact && pathname.startsWith(t.href))?.label || 'Detalhes'}
              </span>
            </>
          )}
        </nav>

        {/* HERO CARD DO USUÁRIO */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#004CB1] to-[#002D6E] text-2xl font-black text-white shadow-md">
                {initial}
                {user.isAdmin && (
                  <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-xs" title="Administrador">
                    <Crown className="size-3 fill-slate-900" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#004CB1]">
                    Painel do Cliente
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Conta Ativa
                  </span>
                </div>
                <h1 className="truncate text-xl sm:text-2xl font-black text-[#1D2433]">
                  Olá, {user.fullName || user.firstName}!
                </h1>
                <p className="truncate text-xs sm:text-sm text-slate-500">
                  {user.email} {user.phone ? `· ${user.phone}` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* BADGES OFICIAIS */}
              {user.isAdmin && (
                <a
                  className="flex items-center gap-1.5 rounded-full bg-[#E8F0FE] border border-blue-200/80 px-3 py-1.5 text-xs font-bold text-[#1D4ED8] hover:bg-blue-100 transition shadow-2xs"
                  href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5174/admin/'}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Crown className="size-3.5 fill-[#1D4ED8]" />
                  <span>ADM EDITOR</span>
                  <ExternalLink className="size-3 opacity-70" />
                </a>
              )}

              <Link
                className="flex items-center gap-1.5 rounded-full bg-[#FEF3C7] border border-amber-200/80 px-3 py-1.5 text-xs font-bold text-[#B45309] hover:bg-amber-100 transition shadow-2xs"
                href="/conta/fidelidade"
              >
                <Gem className="size-3.5 fill-[#B45309]" />
                <span>CLIENTE OURO</span>
              </Link>

              <Link
                className="flex items-center gap-1.5 rounded-full bg-[#F3E8FF] border border-purple-200/80 px-3 py-1.5 text-xs font-bold text-[#7E22CE] hover:bg-purple-100 transition shadow-2xs"
                href="/conta/fidelidade"
              >
                <Star className="size-3.5 fill-[#7E22CE]" />
                <span>9.2100 PTS</span>
              </Link>

              <button
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
                onClick={logout}
                type="button"
              >
                <LogOut className="size-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {/* BARRA DE NAVEGAÇÃO / TABS RESPONSIVA */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {NAV_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.exact
                  ? pathname === tab.href
                  : pathname.startsWith(tab.href);

                return (
                  <Link
                    key={tab.href}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[#004CB1] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    href={tab.href}
                  >
                    <Icon className={`size-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* CONTEÚDO DA SUBPÁGINA */}
        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}
