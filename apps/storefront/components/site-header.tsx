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
import { useUserLocation } from './location-provider';
import { useFavorites } from './favorites-provider';
import { useAuth } from './auth-provider';
import { UserMenuDropdown } from './user-menu-dropdown';
import { MegaMenu } from './mega-menu';
import { CategoryMegaMenu, CATEGORY_MENUS_DATA } from './category-mega-menu';
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
  const { location, openModal } = useUserLocation();
  const { count: favCount } = useFavorites();
  const { user, isAuthenticated } = useAuth();
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
            {/* Benefícios (Esquerda) com recuo para não sobrepor o Mascote NORT em desktop */}
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

        {/* BARRA 02: PRINCIPAL AZUL (#004CB1) COM LOGO, MASCOTE NORT 3D, BUSCA E COTAÇÃO */}
        <div className="relative bg-[#004CB1] px-3 py-2 text-white sm:px-4 sm:py-3 md:px-6">
          {/* MASCOTE NORT 3D OFICIAL (Vazando para cima sobre a barra vermelha - Clicável, redireciona para a vitrine inicial) */}
          <Link
            aria-label={`${siteName} - Ir para a Página Inicial`}
            className="group/mascot absolute -top-4 left-3 z-30 hidden md:block lg:left-6 cursor-pointer"
            href="/"
          >
            <div className="relative h-[84px] w-[72px] transition-transform duration-200 group-hover/mascot:scale-105 group-active/mascot:scale-95 lg:h-[92px] lg:w-[80px]">
              <Image
                alt="Mascote NORT 3D Comercial do Norte - Ir para a Página Inicial"
                className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] object-contain object-bottom"
                fill
                priority
                sizes="80px"
                src="/assets/HOME Vitrine/S0-HEADER/Mascote-3D-NORT/principais/nort-01-principal.png"
              />
            </div>
          </Link>

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
                    src={
                      logoUrl && !logoUrl.includes('seed-brand')
                        ? logoUrl
                        : '/logo-comercial-do-norte-branca.png'
                    }
                  />
                </div>
              </Link>
            </div>

            {/* SELETOR DE CEP / LOCALIZAÇÃO INTERATIVO (ESTILO MAGALU) */}
            <button
              aria-haspopup="dialog"
              aria-label={`Enviar para ${location.shortLabel}. Clique para alterar CEP ou endereço.`}
              className="hidden items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 text-xs text-white xl:flex transition cursor-pointer text-left group shadow-xs"
              onClick={openModal}
              type="button"
            >
              <MapPin className="size-4 shrink-0 text-amber-300 transition-transform group-hover:scale-110" />
              <div className="leading-tight min-w-0 max-w-[170px]">
                <span className="block text-[10px] text-white/75 font-medium">Enviar para</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold truncate text-white">{location.shortLabel}</span>
                  <ChevronDown className="size-3 text-white/70 transition-transform group-hover:translate-y-0.5 shrink-0" />
                </div>
              </div>
            </button>

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
            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
              {/* Favoritos (Fidelidade ao ícone Magalu) */}
              <Link
                aria-label={favCount > 0 ? `Meus Favoritos (${favCount} itens)` : 'Meus Favoritos'}
                className="relative flex flex-col items-center justify-center text-white transition hover:opacity-90"
                href="/favoritos"
              >
                <div className="relative">
                  <Heart className="size-6 stroke-[1.8]" />
                  {favCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex size-4.5 items-center justify-center rounded-full bg-[#E2091E] font-black text-[10px] text-white shadow-sm ring-2 ring-[#004CB1]">
                      {favCount > 99 ? '99+' : favCount}
                    </span>
                  )}
                </div>
                <span className="mt-0.5 hidden text-[10px] font-medium lg:block">Favoritos</span>
              </Link>

              {/* Botão de Cotação (Sacola com badge verde/vermelho idêntico à referência) */}
              <button
                aria-label={`Ver lista de cotação com ${count} itens`}
                className="relative flex flex-col items-center justify-center text-white transition hover:opacity-90 cursor-pointer"
                onClick={openDrawer}
                type="button"
              >
                <div className="relative">
                  <ShoppingBag className="size-6 stroke-[1.8]" />
                  {count > 0 ? (
                    <span className="absolute -top-1.5 -right-2 flex size-4.5 items-center justify-center rounded-full bg-[#E2091E] font-black text-[10px] text-white shadow-sm ring-2 ring-[#004CB1]">
                      {count > 99 ? '99+' : count}
                    </span>
                  ) : (
                    <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-emerald-500 font-bold text-[9px] text-white shadow-xs ring-1 ring-[#004CB1]">
                      0
                    </span>
                  )}
                </div>
                <span className="mt-0.5 hidden text-[10px] font-medium lg:block">
                  Minha Cotação
                </span>
              </button>

              {/* Minha Conta / Login (Dropdown interativo com primeiro nome e badges de status) */}
              <UserMenuDropdown />
            </div>
          </div>
        </div>

        {/* BARRA MOBILE/TABLET: LOCALIZAÇÃO & CEP COMPACTO (ESTILO MAGALU) */}
        <div className="flex xl:hidden items-center justify-between border-t border-white/10 bg-[#00357B]/90 px-3 py-1.5 text-xs text-white">
          <button
            aria-haspopup="dialog"
            aria-label={`Enviar para: ${location.shortLabel}. Clique para alterar.`}
            className="flex items-center gap-1.5 text-white/95 hover:text-white transition cursor-pointer text-left min-w-0 flex-1 mr-2"
            onClick={openModal}
            type="button"
          >
            <MapPin className="size-3.5 shrink-0 text-amber-300" />
            <span className="truncate text-[11px]">
              Enviar para:{' '}
              <strong className="underline decoration-white/40 font-semibold">{location.shortLabel}</strong>
            </span>
            <ChevronDown className="size-3 opacity-75 shrink-0" />
          </button>
          <button
            className="shrink-0 text-[10px] font-bold text-amber-300 hover:text-amber-200 uppercase tracking-wide cursor-pointer py-0.5 px-2 rounded-md bg-white/10 hover:bg-white/20 transition"
            onClick={openModal}
            type="button"
          >
            Trocar CEP
          </button>
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
              <div className="flex items-center gap-1 pl-1">
                {/* Ofertas do Dia */}
                <Link
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-white/95 hover:bg-white/10 hover:text-white transition"
                  href="/loja?oferta=1"
                >
                  <Sparkles className="size-3.5 text-amber-300" />
                  <span>Ofertas do Dia</span>
                  <span className="rounded bg-[#E2091E] px-1.5 py-0.2 text-[9px] font-black uppercase text-white">
                    NOVO
                  </span>
                </Link>

                {/* Mega Menu: Embalagens (Estilo Magalu) */}
                <div className="group/cat relative">
                  <Link
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-white/90 transition hover:bg-white/10 hover:text-white group-hover/cat:border group-hover/cat:border-white/40 group-hover/cat:bg-white/10 group-hover/cat:text-white"
                    href="/categoria/embalagens"
                  >
                    <span>Embalagens</span>
                    <ChevronDown className="size-3 text-white/60 transition-transform duration-150 group-hover/cat:rotate-180" />
                  </Link>
                  <div className="invisible absolute top-full left-0 z-50 pt-2 opacity-0 transition-all duration-150 group-hover/cat:visible group-hover/cat:opacity-100">
                    <CategoryMegaMenu config={CATEGORY_MENUS_DATA.embalagens} />
                  </div>
                </div>

                {/* Mega Menu: Descartáveis (Estilo Magalu) */}
                <div className="group/cat relative">
                  <Link
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-white/90 transition hover:bg-white/10 hover:text-white group-hover/cat:border group-hover/cat:border-white/40 group-hover/cat:bg-white/10 group-hover/cat:text-white"
                    href="/categoria/descartaveis"
                  >
                    <span>Descartáveis</span>
                    <ChevronDown className="size-3 text-white/60 transition-transform duration-150 group-hover/cat:rotate-180" />
                  </Link>
                  <div className="invisible absolute top-full -left-20 z-50 pt-2 opacity-0 transition-all duration-150 group-hover/cat:visible group-hover/cat:opacity-100">
                    <CategoryMegaMenu config={CATEGORY_MENUS_DATA.descartaveis} />
                  </div>
                </div>

                {/* Mega Menu: Artigos para Festa (Estilo Magalu) */}
                <div className="group/cat relative">
                  <Link
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-white/90 transition hover:bg-white/10 hover:text-white group-hover/cat:border group-hover/cat:border-white/40 group-hover/cat:bg-white/10 group-hover/cat:text-white"
                    href="/categoria/artigos-festa"
                  >
                    <span>Artigos para Festa</span>
                    <ChevronDown className="size-3 text-white/60 transition-transform duration-150 group-hover/cat:rotate-180" />
                  </Link>
                  <div className="invisible absolute top-full -left-36 z-50 pt-2 opacity-0 transition-all duration-150 group-hover/cat:visible group-hover/cat:opacity-100">
                    <CategoryMegaMenu config={CATEGORY_MENUS_DATA.festa} />
                  </div>
                </div>

                {/* Mega Menu: Doces & Confeitaria (Estilo Magalu) */}
                <div className="group/cat relative hidden xl:block">
                  <Link
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-white/90 transition hover:bg-white/10 hover:text-white group-hover/cat:border group-hover/cat:border-white/40 group-hover/cat:bg-white/10 group-hover/cat:text-white"
                    href="/categoria/confeitaria"
                  >
                    <span>Doces &amp; Confeitaria</span>
                    <ChevronDown className="size-3 text-white/60 transition-transform duration-150 group-hover/cat:rotate-180" />
                  </Link>
                  <div className="invisible absolute top-full -left-48 z-50 pt-2 opacity-0 transition-all duration-150 group-hover/cat:visible group-hover/cat:opacity-100">
                    <CategoryMegaMenu config={CATEGORY_MENUS_DATA.confeitaria} />
                  </div>
                </div>

                {/* Mega Menu: Limpeza Profissional (Estilo Magalu) */}
                <div className="group/cat relative hidden lg:block">
                  <Link
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-white/90 transition hover:bg-white/10 hover:text-white group-hover/cat:border group-hover/cat:border-white/40 group-hover/cat:bg-white/10 group-hover/cat:text-white"
                    href="/categoria/limpeza"
                  >
                    <span>Limpeza Profissional</span>
                    <ChevronDown className="size-3 text-white/60 transition-transform duration-150 group-hover/cat:rotate-180" />
                  </Link>
                  <div className="invisible absolute top-full right-0 z-50 pt-2 opacity-0 transition-all duration-150 group-hover/cat:visible group-hover/cat:opacity-100">
                    <CategoryMegaMenu align="right" config={CATEGORY_MENUS_DATA.limpeza} />
                  </div>
                </div>

                {/* Mais Vendidos */}
                <Link
                  className="rounded-full px-2.5 py-1 text-white/90 hover:bg-white/10 hover:text-white transition"
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

            {/* Saudação de Usuário no Mobile (Boas vindas / Minha Conta) */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#004CB1] text-white font-bold text-xs">
                  {isAuthenticated && user ? user.firstName.charAt(0).toUpperCase() : <User className="size-4" />}
                </div>
                <div className="min-w-0 leading-tight">
                  {isAuthenticated && user ? (
                    <>
                      <span className="block text-[11px] text-slate-500">Olá, {user.firstName} :)</span>
                      <Link
                        href="/conta"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs font-bold text-[#004CB1] hover:underline"
                      >
                        Minha Conta
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="block text-[11px] text-slate-500">Boas vindas :)</span>
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs font-bold text-[#004CB1] hover:underline"
                      >
                        Entre ou Cadastre-se
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Card de Região/CEP Mobile Interativo */}
            <div className="m-4 mb-2 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="size-4 shrink-0 text-[#004CB1]" />
                  <div className="min-w-0 leading-tight">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Enviar para
                    </span>
                    <span className="block truncate text-xs font-bold text-slate-900">
                      {location.shortLabel}
                    </span>
                    {location.cep && (
                      <span className="block text-[10px] text-slate-500 font-mono">
                        CEP {location.cep}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="rounded-lg bg-[#004CB1] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#00357B] transition shrink-0 cursor-pointer"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openModal();
                  }}
                  type="button"
                >
                  Alterar
                </button>
              </div>
            </div>

            {/* Lista de Navegação Mobile */}
            <div className="flex-1 overflow-y-auto p-4 pt-2">
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
                    href="/loja?oferta=1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Flame className="size-4 text-[#E2091E]" />
                    <span>Ofertas do Dia</span>
                  </Link>
                  <Link
                    className="flex items-center justify-between py-1.5 text-slate-700"
                    href="/favoritos"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="size-4 text-slate-500" />
                      <span>Meus Favoritos</span>
                    </div>
                    {favCount > 0 && (
                      <span className="rounded-full bg-[#E2091E] px-2 py-0.5 text-[10px] font-black text-white">
                        {favCount}
                      </span>
                    )}
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
