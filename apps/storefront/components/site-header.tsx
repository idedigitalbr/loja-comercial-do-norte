'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Flame,
  Heart,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Truck,
  User,
  X,
} from 'lucide-react';
import { useQuoteCart } from './quote-cart-provider';
import { MegaMenu } from './mega-menu';
import type { ApiBrand, ApiCategory } from '@/lib/types';

type SiteHeaderProps = {
  siteName: string;
  logoUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  categories: ApiCategory[];
  brands: ApiBrand[];
};

export function SiteHeader({
  siteName,
  logoUrl,
  phone,
  whatsapp,
  categories,
  brands,
}: SiteHeaderProps) {
  const router = useRouter();
  const { count, openDrawer } = useQuoteCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/loja?q=${encodeURIComponent(term)}` : '/loja');
    setMobileMenuOpen(false);
  }

  const rootCategories = categories.filter((c) => !c.parentId);
  const activeWhatsapp = whatsapp || '5591983440880';
  const whatsappDigits = activeWhatsapp.replace(/\D+/g, '');
  const whatsappDisplay = phone || '(91) 98344-0880';

  return (
    <>
      <header
        id="siteHeader"
        className="relative w-full shadow-md z-30 bg-[#004CB1]"
      >
        {/* BARRA 01: FAIXA SUPERIOR VERMELHA DE BENEFÍCIOS (FIGMA OFICIAL) */}
        <div className="bg-[#E2091E] px-3 py-1.5 text-white sm:px-4 md:px-6">
          <div className="cn-container flex items-center justify-between text-[11px] sm:text-xs">
            {/* Benefícios (Esquerda) com recuo para não sobrepor o Mascote James em desktop */}
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-0.5 pl-0 font-medium sm:gap-4 md:pl-[88px] lg:gap-5 lg:pl-[92px]">
              <div className="flex items-center gap-1.5 whitespace-nowrap text-white">
                <Truck aria-hidden className="size-3.5 flex-shrink-0" />
                <span>Entrega em Belém e Região Metropolitana</span>
              </div>
              <span className="inline-block h-3.5 w-px bg-white/30 sm:mx-1" />
              <div className="hidden items-center gap-1.5 whitespace-nowrap text-white sm:flex">
                <Store aria-hidden className="size-3.5 flex-shrink-0" />
                <span>Retire nas Lojas: Bernardo Sayão &amp; Jurunas</span>
              </div>
              <span className="hidden h-3.5 w-px bg-white/30 lg:inline-block lg:mx-1" />
              <div className="hidden items-center gap-1.5 whitespace-nowrap text-white lg:flex">
                <Tag aria-hidden className="size-3.5 flex-shrink-0" />
                <span>Preço Especial de Atacado &amp; Varejo</span>
              </div>
            </div>

            {/* WhatsApp Vendas (Direita) */}
            <div className="flex items-center gap-2 whitespace-nowrap pl-2">
              <a
                className="flex items-center gap-1.5 font-bold text-white transition hover:text-amber-200"
                href={`https://wa.me/${whatsappDigits}`}
                rel="noreferrer"
                target="_blank"
              >
                <Phone aria-hidden className="size-3 flex-shrink-0" />
                <span>{whatsappDisplay} - WhatsApp Vendas</span>
              </a>
            </div>
          </div>
        </div>

        {/* BARRA 02: PRINCIPAL AZUL (#004CB1) COM LOGO, MASCOTE JAMES 3D, BUSCA E COTAÇÃO */}
        <div className="relative bg-[#004CB1] px-3 py-2 text-white sm:px-4 sm:py-3 md:px-6">
          {/* MASCOTE JAMES 3D OFICIAL (Vazando para cima sobre a barra vermelha) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-4 left-3 z-30 hidden md:block lg:left-6"
          >
            <div className="relative h-[84px] w-[72px] lg:h-[92px] lg:w-[80px]">
              <Image
                alt="Mascote James 3D Comercial do Norte"
                className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] object-contain object-bottom"
                fill
                priority
                sizes="80px"
                src="/assets/imgs/Mascote-3D-James-em-pe/principais/1-james-3d-principal.png"
              />
            </div>
          </div>

          <div className="cn-container flex items-center justify-between gap-3 md:gap-4">
            {/* LADO ESQUERDO: HAMBURGER (MOBILE) + LOGO BRANCA */}
            <div className="flex items-center gap-2 sm:gap-3 md:pl-[84px] lg:pl-[88px]">
              {/* Botão Menu Hamburger Mobile */}
              <button
                aria-label="Abrir menu principal"
                className="flex size-9 items-center justify-center rounded-lg text-white hover:bg-white/10 md:hidden cursor-pointer"
                onClick={() => setMobileMenuOpen(true)}
                type="button"
              >
                <Menu className="size-6" />
              </button>

              {/* Logo Oficial Branca */}
              <Link
                aria-label={`${siteName} - Página Inicial`}
                className="flex items-center"
                href="/"
              >
                <div className="relative h-9 w-[150px] sm:h-11 sm:w-[170px] lg:h-12 lg:w-[190px]">
                  <Image
                    alt={siteName}
                    className="object-contain object-left"
                    fill
                    priority
                    sizes="(max-width: 640px) 150px, (max-width: 1024px) 170px, 190px"
                    src={logoUrl || '/assets/Logos/logo-comercial-do-norte-branca.png'}
                  />
                </div>
              </Link>
            </div>

            {/* SELETOR DE CEP / LOCALIZAÇÃO (BELÉM 66020-600) */}
            <div className="hidden items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white xl:flex hover:bg-white/15 transition cursor-pointer">
              <MapPin className="size-4 shrink-0 text-white/90" />
              <div className="leading-tight">
                <span className="block text-[10px] text-white/70">Enviar para</span>
                <span className="font-bold">Belém 66020-600</span>
              </div>
            </div>

            {/* BARRA DE BUSCA CENTRAL COM BOTÃO CIRCULAR AZUL */}
            <div className="flex-1 max-w-2xl">
              <form className="relative flex items-center w-full" onSubmit={submitSearch}>
                <input
                  aria-label="Buscar produtos, categorias ou marcas"
                  className="w-full rounded-full bg-white py-2.5 pr-12 pl-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#00357B] transition-all"
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar embalagens, copos descartáveis, caixas de pizza, sacolas..."
                  type="search"
                  value={query}
                />
                <button
                  aria-label="Pesquisar"
                  className="absolute right-1.5 flex size-8 cursor-pointer items-center justify-center rounded-full bg-[#004CB1] text-white transition hover:bg-[#00357B] hover:scale-105 active:scale-95 shadow-sm"
                  type="submit"
                >
                  <Search className="size-4 stroke-[2.4]" />
                </button>
              </form>
            </div>

            {/* AÇÕES À DIREITA: FAVORITOS, MINHA COTAÇÃO (DRAWER) E MINHA CONTA */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Favoritos */}
              <Link
                aria-label="Meus Favoritos"
                className="hidden flex-col items-center justify-center text-white/90 transition hover:text-white lg:flex"
                href="/favoritos"
              >
                <Heart className="size-5" />
                <span className="mt-0.5 text-[10px] font-medium">Favoritos</span>
              </Link>

              {/* Botão de Cotação com Badge Contador */}
              <button
                aria-label={`Ver lista de cotação com ${count} itens`}
                className="relative flex flex-col items-center justify-center text-white/90 transition hover:text-white cursor-pointer"
                onClick={openDrawer}
                type="button"
              >
                <div className="relative">
                  <ShoppingBag className="size-5 sm:size-6" />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex size-4.5 items-center justify-center rounded-full bg-[#E2091E] font-black text-[10px] text-white shadow-sm ring-2 ring-[#004CB1]">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </div>
                <span className="mt-0.5 hidden text-[10px] font-medium sm:block">
                  Minha Cotação
                </span>
              </button>

              {/* Minha Conta / Login */}
              <Link
                aria-label="Minha Conta ou Fazer Login"
                className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-2.5 py-1.5 text-xs text-white transition hover:bg-white/15"
                href="/conta"
              >
                <User className="size-4.5" />
                <div className="hidden text-left xl:block leading-tight">
                  <span className="block text-[10px] text-white/70">Entre</span>
                  <span className="font-bold">ou Cotar</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* BARRA 03: SUBNORMAL AZUL ESCURO (#00357B) - DEPARTAMENTOS E CATEGORIAS */}
        <div className="hidden border-t border-white/10 bg-[#00357B] px-3 text-xs font-semibold text-white md:block md:px-6">
          <div className="cn-container flex items-center justify-between">
            {/* Menu Departamentos (Dropdown) */}
            <div className="flex items-center gap-1">
              <div className="group relative">
                <button
                  className="flex items-center gap-2 py-2.5 pr-4 pl-2 text-white hover:bg-white/10 rounded-sm transition cursor-pointer"
                  type="button"
                >
                  <Menu className="size-4" />
                  <span className="tracking-wide text-xs font-bold">
                    Tem no Comercial do Norte
                  </span>
                  <ChevronDown className="size-3 text-white/70 transition-transform group-hover:rotate-180" />
                </button>

                {/* Mega Menu Flutuante Estilo shadcn / 21st.dev */}
                <div className="invisible absolute top-full left-0 z-50 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <MegaMenu categories={categories} whatsappPhone={whatsapp ?? undefined} />
                </div>
              </div>

              {/* Links Rápidos em Destaque (site-final) */}
              <div className="flex items-center gap-0.5 pl-1">
                <Link
                  className="flex items-center gap-1.5 rounded-sm px-2.5 py-2 text-white/95 hover:bg-white/10 hover:text-white transition"
                  href="/loja?oferta=1"
                >
                  <Sparkles className="size-3.5 text-amber-300" />
                  <span>Ofertas do Dia</span>
                  <span className="rounded bg-[#E2091E] px-1.5 py-0.2 text-[9px] font-black uppercase text-white">
                    NOVO
                  </span>
                </Link>

                <Link
                  className="rounded-sm px-2.5 py-2 text-white/90 hover:bg-white/10 hover:text-white transition"
                  href="/loja?q=embalagens"
                >
                  Embalagens
                </Link>

                <Link
                  className="rounded-sm px-2.5 py-2 text-white/90 hover:bg-white/10 hover:text-white transition"
                  href="/loja?q=descartaveis"
                >
                  Descartáveis
                </Link>

                <Link
                  className="rounded-sm px-2.5 py-2 text-white/90 hover:bg-white/10 hover:text-white transition"
                  href="/loja?q=festa"
                >
                  Artigos para Festa
                </Link>

                <Link
                  className="hidden xl:inline-block rounded-sm px-2.5 py-2 text-white/90 hover:bg-white/10 hover:text-white transition"
                  href="/loja?q=confeitaria"
                >
                  Doces &amp; Confeitaria
                </Link>

                <Link
                  className="hidden lg:inline-block rounded-sm px-2.5 py-2 text-white/90 hover:bg-white/10 hover:text-white transition"
                  href="/loja?q=sacolas"
                >
                  Sacos &amp; Sacolas
                </Link>

                <Link
                  className="hidden xl:inline-block rounded-sm px-2.5 py-2 text-white/90 hover:bg-white/10 hover:text-white transition"
                  href="/loja?q=limpeza"
                >
                  Limpeza Profissional
                </Link>

                <Link
                  className="rounded-sm px-2.5 py-2 text-white/90 hover:bg-white/10 hover:text-white transition"
                  href="/loja"
                >
                  Mais Vendidos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* DRAWER MOBILE OFF-CANVAS PARA CELULAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs flex-col bg-white text-slate-900 shadow-2xl">
            {/* Topo do Drawer Mobile */}
            <div className="flex items-center justify-between bg-[#004CB1] p-4 text-white">
              <div className="flex items-center gap-2">
                <Store className="size-5" />
                <span className="text-sm font-bold">Comercial do Norte</span>
              </div>
              <button
                aria-label="Fechar menu"
                className="flex size-7 items-center justify-center rounded text-white/80 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Lista de Navegação Mobile */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Departamentos
                </span>
                <div className="mt-2 divide-y divide-slate-100">
                  {rootCategories.map((c) => (
                    <Link
                      className="flex items-center justify-between py-2.5 text-xs font-semibold text-slate-700 hover:text-[#004CB1]"
                      href={`/categoria/${c.slug}`}
                      key={c.id}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{c.name}</span>
                      <ChevronRight className="size-3.5 text-slate-400" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Acesso Rápido
                </span>
                <div className="mt-2 flex flex-col gap-2 text-xs font-medium">
                  <Link
                    className="flex items-center gap-2 py-1.5 text-slate-700"
                    href="/loja?ofertas=true"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Flame className="size-4 text-[#E2091E]" />
                    <span>Ofertas do Dia</span>
                  </Link>
                  <Link
                    className="flex items-center gap-2 py-1.5 text-slate-700"
                    href="/favoritos"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="size-4 text-slate-500" />
                    <span>Meus Favoritos</span>
                  </Link>
                  <Link
                    className="flex items-center gap-2 py-1.5 text-slate-700"
                    href="/sobre"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Store className="size-4 text-slate-500" />
                    <span>Nossas Lojas</span>
                  </Link>
                  <a
                    className="flex items-center gap-2 py-1.5 text-[#004CB1] font-bold"
                    href={`https://wa.me/${whatsappDigits}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Phone className="size-4" />
                    <span>WhatsApp Vendas</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
