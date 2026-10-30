"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Flame,
  Heart,
  MapPin,
  Menu,
  PanelLeft,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Truck,
  User,
  X,
} from "lucide-react";
import { useQuoteCart } from "./quote-cart-provider";
import { useUserLocation } from "./location-provider";
import { useFavorites } from "./favorites-provider";
import { useAuth } from "./auth-provider";
import { UserMenuDropdown } from "./user-menu-dropdown";
import { NortHeader } from "./nort-header";
import { CategoryMegaMenu, CATEGORY_MENUS_DATA } from "./category-mega-menu";
import { CategorySidebarDrawer } from "./category-sidebar-drawer";
import type { ApiBrand, ApiCategory, ApiSegment, ApiTag } from "@/lib/types";

type SiteHeaderProps = {
  siteName: string;
  logoUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  categories: ApiCategory[];
  brands: ApiBrand[];
  segments?: ApiSegment[];
  tags?: ApiTag[];
};

export function SiteHeader({
  siteName,
  logoUrl,
  phone,
  whatsapp,
  categories,
  brands,
  segments,
  tags,
}: SiteHeaderProps) {
  const router = useRouter();
  const { count, openDrawer } = useQuoteCart();
  const { location, openModal } = useUserLocation();
  const { count: favCount } = useFavorites();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [query, setQuery] = useState("");

  // O botão flutuante só aparece após o usuário rolar a página além do 1º slide (hero banner)
  useEffect(() => {
    function handleScroll() {
      const heroSection =
        document.getElementById("section-s01-hero-full-width") ||
        document.querySelector('section[aria-label="Carrossel Principal de Banners"]') ||
        document.querySelector('[data-widget-type="hero-carousel"]');

      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        // O primeiro slide fica na frente / visível:
        // O botão só aparece após o usuário rolar além desse primeiro slide (quando o fundo dele atinge o topo)
        setShowFloatingButton(rect.bottom <= 50);
      } else {
        // Em outras páginas que não possuem o hero banner (ex: /categoria, /loja, etc.),
        // exibe assim que rolar além do cabeçalho
        const headerEl = document.getElementById("siteHeader");
        const threshold = headerEl ? headerEl.offsetHeight : 140;
        setShowFloatingButton(window.scrollY > threshold);
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/loja?q=${encodeURIComponent(term)}` : "/loja");
    setMobileMenuOpen(false);
  }

  const rootCategories = categories.filter((c) => !c.parentId);
  const activeWhatsapp = whatsapp || "5591983440880";
  const whatsappDigits = activeWhatsapp.replace(/\D+/g, "");
  const whatsappDisplay = phone || "(91) 98344-0880";

  return (
    <>
      <header
        id="siteHeader"
        className="relative w-full shadow-md z-[60] bg-[#004CB1]"
        style={{ position: "relative", zIndex: 60 }}
      >
        {/* BARRA 01: FAIXA SUPERIOR VERMELHA DE BENEFÍCIOS (FIGMA OFICIAL) */}
        <div className="bg-[#E2091E] py-1 sm:py-1.5 text-white w-full">
          <div className="w-full px-3 sm:px-4 md:px-6 flex items-center justify-between text-[11px] sm:text-xs">
            {/* Benefícios (Esquerda) com recuo para não sobrepor o Mascote NORT em desktop */}
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-0.5 pl-0 font-medium sm:gap-4 md:pl-[70px] lg:gap-5 lg:pl-[74px]">
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
                id="tour-header-whatsapp"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#B80617] hover:bg-[#9E0514] px-3 py-0.5 font-bold text-white transition text-[11px]"
                href={`https://wa.me/${whatsappDigits}`}
                rel="noreferrer"
                target="_blank"
              >
                <Phone aria-hidden className="size-3 flex-shrink-0" />
                <span>{whatsappDisplay} • WhatsApp Vendas</span>
              </a>
            </div>
          </div>
        </div>

        {/* BARRA 02: PRINCIPAL AZUL (#004CB1) COM LOGO, MASCOTE NORT 3D, BUSCA E COTAÇÃO */}
        <div className="relative bg-[#004CB1] text-white min-h-[68px] sm:min-h-[72px] flex items-center w-full">
          <div className="w-full px-3 sm:px-4 md:px-6 relative flex items-center justify-between gap-3 md:gap-4 py-2.5 sm:py-3 md:py-3.5">
            {/* MASCOTE NORT 3D OFICIAL (Ancorado na base da Barra 02 sem invadir a Barra 03, subindo até quase o teto da Barra 01) */}
            <NortHeader />

            {/* LADO ESQUERDO: HAMBURGER (MOBILE) + LOGO COM C VERMELHO E TEXTO BRANCO */}
            <div className="flex items-center gap-2 sm:gap-3 md:pl-[88px] lg:pl-[94px]">
              {/* Botão Menu Hamburger Mobile */}
              <button
                aria-label="Abrir menu principal"
                className="flex size-9 items-center justify-center rounded-lg text-white hover:bg-white/10 md:hidden cursor-pointer"
                onClick={() => setMobileMenuOpen(true)}
                type="button"
              >
                <Menu className="size-6" />
              </button>

              {/* Logo Oficial com Centro Vermelho e Texto Branco */}
              <Link
                aria-label={`${siteName} - Página Inicial`}
                className="flex items-center shrink-0"
                href="/"
              >
                <div className="relative h-10 w-[170px] sm:h-11 sm:w-[185px] lg:h-11.5 lg:w-[195px]">
                  <Image
                    alt={siteName}
                    className="object-contain object-left"
                    fill
                    priority
                    sizes="(max-width: 640px) 170px, (max-width: 1024px) 185px, 195px"
                    src="/logo-comercial-do-norte-header.png"
                  />
                </div>
              </Link>

              {/* Divisor vertical sutil entre Logo e Localização (fidelidade Anexo 2) */}
              <span className="hidden h-6 w-px bg-white/20 lg:inline-block shrink-0 mx-1" />
            </div>

            {/* SELETOR DE CEP / LOCALIZAÇÃO INTERATIVO (ESTILO MAGALU) */}
            <button
              id="tour-header-location"
              aria-haspopup="dialog"
              aria-label={`Enviar para ${location.shortLabel}. Clique para alterar CEP ou endereço.`}
              className="hidden items-center gap-2 px-2 py-1 text-xs text-white lg:flex transition cursor-pointer text-left hover:opacity-90 shrink-0 group"
              onClick={openModal}
              type="button"
            >
              <MapPin className="size-4 shrink-0 text-white transition-transform group-hover:scale-110" />
              <div className="leading-tight">
                <span className="block text-[10.5px] text-white/80 font-normal">
                  Enviar para
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-bold truncate text-white max-w-[145px]">
                    {location.shortLabel}
                  </span>
                  <ChevronDown className="size-3 text-white/70 transition-transform group-hover:translate-y-0.5 shrink-0" />
                </div>
              </div>
            </button>

            {/* BARRA DE BUSCA CENTRAL COM BOTÃO CIRCULAR AZUL */}
            <div id="tour-header-search" className="flex-1 max-w-2xl xl:max-w-3xl">
              <form
                className="relative flex items-center w-full"
                onSubmit={submitSearch}
              >
                <input
                  aria-label="Buscar produtos, categorias ou marcas"
                  className="w-full rounded-full bg-white py-2.5 sm:py-3 pr-14 pl-5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#00357B] transition-all"
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar embalagens, copos descartáveis, caixas de pizza, sacolas..."
                  type="search"
                  value={query}
                />
                <button
                  aria-label="Pesquisar"
                  className="absolute right-1.5 flex size-9 cursor-pointer items-center justify-center rounded-full bg-[#004CB1] text-white transition hover:bg-[#00357B] hover:scale-105 active:scale-95 shadow-sm"
                  type="submit"
                >
                  <Search className="size-4 stroke-[2.5]" />
                </button>
              </form>
            </div>

            {/* AÇÕES À DIREITA: FAVORITOS, MINHA COTAÇÃO (DRAWER) E MINHA CONTA */}
            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
              {/* Favoritos (Fidelidade ao ícone Magalu) */}
              <Link
                aria-label={
                  favCount > 0
                    ? `Meus Favoritos (${favCount} itens)`
                    : "Meus Favoritos"
                }
                className="relative flex flex-col items-center justify-center text-white transition hover:opacity-90"
                href="/favoritos"
              >
                <div className="relative">
                  <Heart className="size-6 stroke-[1.8]" />
                  {favCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex size-4.5 items-center justify-center rounded-full bg-[#E2091E] font-black text-[10px] text-white shadow-sm ring-2 ring-[#004CB1]">
                      {favCount > 99 ? "99+" : favCount}
                    </span>
                  )}
                </div>
                <span className="mt-0.5 hidden text-[10px] font-medium lg:block">
                  Favoritos
                </span>
              </Link>

              {/* Botão de Cotação (Sacola com badge verde/vermelho idêntico à referência) */}
              <button
                id="tour-header-quote"
                aria-label={`Ver lista de cotação com ${count} itens`}
                className="relative flex flex-col items-center justify-center text-white transition hover:opacity-90 cursor-pointer"
                onClick={openDrawer}
                type="button"
              >
                <div className="relative">
                  <ShoppingBag className="size-6 stroke-[1.8]" />
                  {count > 0 ? (
                    <span className="absolute -top-1.5 -right-2 flex size-4.5 items-center justify-center rounded-full bg-[#E2091E] font-black text-[10px] text-white shadow-sm ring-2 ring-[#004CB1]">
                      {count > 99 ? "99+" : count}
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
        <div className="flex lg:hidden items-center justify-between border-t border-white/10 bg-[#00357B]/90 px-3 py-1.5 text-xs text-white">
          <button
            aria-haspopup="dialog"
            aria-label={`Enviar para: ${location.shortLabel}. Clique para alterar.`}
            className="flex items-center gap-1.5 text-white/95 hover:text-white transition cursor-pointer text-left min-w-0 flex-1 mr-2"
            onClick={openModal}
            type="button"
          >
            <MapPin className="size-3.5 shrink-0 text-amber-300" />
            <span className="truncate text-[11px]">
              Enviar para:{" "}
              <strong className="underline decoration-white/40 font-semibold">
                {location.shortLabel}
              </strong>
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

        {/* BARRA 03: SUBNORMAL AZUL ESCURO (#00357B) - NAVEGAÇÃO DIVIDIDA ESQUERDA / DIREITA */}
        <div className="hidden border-t border-white/10 bg-[#00357B] font-semibold text-white md:block w-full">
          <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 flex items-center justify-between flex-nowrap py-1 text-[10.5px] lg:text-[11.5px] xl:text-[12px]">
            {/* LADO ESQUERDO: CATEGORIAS | SEGMENTOS, EVENTOS, CONTEÚDOS E WORKSHOPS */}
            <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
              {/* 1. Botão Menu: Categorias | Segmentos */}
              <button
                id="tour-header-categories"
                aria-expanded={sidebarOpen}
                aria-haspopup="dialog"
                aria-label={
                  sidebarOpen
                    ? "Fechar menu de categorias e segmentos"
                    : "Abrir menu de categorias e segmentos"
                }
                className="flex items-center gap-1 sm:gap-1.5 py-1 px-1.5 sm:px-2 text-white hover:bg-white/10 rounded-sm transition-colors cursor-pointer whitespace-nowrap font-bold"
                onClick={() => setSidebarOpen((prev) => !prev)}
                type="button"
              >
                <Menu className="size-3.5 sm:size-4 shrink-0" />
                <span className="tracking-wide">
                  Categorias | Segmentos
                </span>
                <ChevronDown className={`size-2.5 sm:size-3 text-white/70 transition-transform duration-200 shrink-0 ${sidebarOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Divisor vertical */}
              <span className="inline-block h-3.5 w-px bg-white/25 shrink-0 mx-0.5 sm:mx-1" />

              {/* Bloco de Conteúdos & Workshops (Explica Aí Nort + Aulas Confeitaria) */}
              <div id="tour-header-content" className="flex items-center gap-1 sm:gap-1.5">
                {/* Eventos */}
                <Link
                  className="rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                  href="/eventos"
                >
                  Eventos
                </Link>

                {/* Conteúdos */}
                <Link
                  className="flex items-center gap-1 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                  href="/post"
                >
                  <span>Conteúdos</span>
                  <span className="rounded-full bg-[#E2091E] px-1.5 py-0.5 text-[8px] sm:text-[8.5px] font-black uppercase text-white leading-none tracking-tight">
                    EXPLICA AÍ NORT
                  </span>
                </Link>

                {/* Workshops */}
                <Link
                  className="flex items-center gap-1 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                  href="/eventos/workshops/aulas-confeitaria"
                >
                  <span>Workshops</span>
                  <span className="rounded-full bg-[#B45309] px-1.5 py-0.5 text-[8px] sm:text-[8.5px] font-black uppercase text-white leading-none tracking-tight">
                    AULAS CONFEITARIA
                  </span>
                </Link>
              </div>

              {/* Divisor vertical após Workshops */}
              <span className="inline-block h-3.5 w-px bg-white/25 shrink-0 mx-0.5 sm:mx-1" />
            </div>

            {/* LADO DIREITO (SÓ OS 6 ITENS DEFINIDOS: MAIS VENDIDOS, OFERTAS DO DIA, EMBALAGENS, DESCARTÁVEIS, SACOS & SACOLAS E VER TODOS) */}
            <div className="ml-auto flex items-center gap-0.5 sm:gap-1 lg:gap-1.5 xl:gap-2 shrink-0">
              {/* Divisor vertical antes do grupo direito */}
              <span className="inline-block h-3.5 w-px bg-white/25 shrink-0 mx-0.5 sm:mx-1" />

              {/* Bloco de Mais Vendidos & Ofertas do Dia */}
              <div id="tour-header-deals" className="flex items-center gap-0.5 sm:gap-1">
                {/* 1. Mais Vendidos */}
                <Link
                  className="rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-white/95 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap shrink-0"
                  href="/loja?ordem=mais_vendidos"
                >
                  Mais Vendidos
                </Link>

                {/* 2. Ofertas do Dia */}
                <Link
                  className="flex items-center gap-1 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                  href="/loja?oferta=1"
                >
                  <span>Ofertas do Dia</span>
                  <span className="rounded-full bg-[#E2091E] px-1.5 py-0.5 text-[8px] sm:text-[8.5px] font-black uppercase text-white leading-none">
                    NOVO
                  </span>
                </Link>
              </div>

              {/* 3. Mega Menu: Embalagens (ancorado right-0 com align="right" para não vazar a tela nem tremer no hover) */}
              <div className="group/cat relative shrink-0">
                <Link
                  className="flex items-center gap-0.5 sm:gap-1 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-white/95 transition-colors hover:bg-white/10 hover:text-white group-hover/cat:bg-white/10 group-hover/cat:text-white whitespace-nowrap"
                  href="/categoria/embalagens"
                >
                  <span>Embalagens</span>
                  <ChevronDown className="size-2.5 sm:size-3 text-white/70 transition-transform duration-150 group-hover/cat:rotate-180" />
                </Link>
                <div className="invisible absolute top-full right-0 z-50 pt-1.5 opacity-0 pointer-events-none group-hover/cat:pointer-events-auto transition-all duration-150 group-hover/cat:visible group-hover/cat:opacity-100">
                  <CategoryMegaMenu align="right" config={CATEGORY_MENUS_DATA.embalagens} />
                </div>
              </div>

              {/* 4. Mega Menu: Descartáveis (ancorado right-0 com align="right") */}
              <div className="group/cat relative shrink-0">
                <Link
                  className="flex items-center gap-0.5 sm:gap-1 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-white/95 transition-colors hover:bg-white/10 hover:text-white group-hover/cat:bg-white/10 group-hover/cat:text-white whitespace-nowrap"
                  href="/categoria/descartaveis"
                >
                  <span>Descartáveis</span>
                  <ChevronDown className="size-2.5 sm:size-3 text-white/70 transition-transform duration-150 group-hover/cat:rotate-180" />
                </Link>
                <div className="invisible absolute top-full right-0 z-50 pt-1.5 opacity-0 pointer-events-none group-hover/cat:pointer-events-auto transition-all duration-150 group-hover/cat:visible group-hover/cat:opacity-100">
                  <CategoryMegaMenu
                    align="right"
                    config={CATEGORY_MENUS_DATA.descartaveis}
                  />
                </div>
              </div>

              {/* 5. Mega Menu: Sacos & Sacolas (ancorado right-0 com align="right") */}
              <div className="group/cat relative shrink-0">
                <Link
                  className="flex items-center gap-0.5 sm:gap-1 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-white/95 transition-colors hover:bg-white/10 hover:text-white group-hover/cat:bg-white/10 group-hover/cat:text-white whitespace-nowrap"
                  href="/categoria/sacos-e-sacolas"
                >
                  <span>Sacos &amp; Sacolas</span>
                  <ChevronDown className="size-2.5 sm:size-3 text-white/70 transition-transform duration-150 group-hover/cat:rotate-180" />
                </Link>
                <div className="invisible absolute top-full right-0 z-50 pt-1.5 opacity-0 pointer-events-none group-hover/cat:pointer-events-auto transition-all duration-150 group-hover/cat:visible group-hover/cat:opacity-100">
                  <CategoryMegaMenu
                    align="right"
                    config={CATEGORY_MENUS_DATA.sacolas}
                  />
                </div>
              </div>

              {/* 6. Ver todos */}
              <Link
                className="rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-white/95 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap shrink-0"
                href="/loja"
              >
                Ver todos
              </Link>
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
                  {isAuthenticated && user ? (
                    user.firstName.charAt(0).toUpperCase()
                  ) : (
                    <User className="size-4" />
                  )}
                </div>
                <div className="min-w-0 leading-tight">
                  {isAuthenticated && user ? (
                    <>
                      <span className="block text-[11px] text-slate-500">
                        Olá, {user.firstName} :)
                      </span>
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
                      <span className="block text-[11px] text-slate-500">
                        Boas vindas :)
                      </span>
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
              {/* Botão de Destaque Categorias | Segmentos no Mobile */}
              <button
                className="mb-4 flex w-full cursor-pointer items-center justify-between rounded-xl bg-blue-50/80 border border-blue-100 p-2.5 text-xs font-bold text-[#004CB1] transition hover:bg-blue-100/80 active:scale-98"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSidebarOpen(true);
                }}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-[#004CB1] text-white">
                    <Menu className="size-4" />
                  </div>
                  <span className="font-extrabold text-[12.5px]">Categorias | Segmentos</span>
                </div>
                <ChevronRight className="size-4 text-[#004CB1]" />
              </button>

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
                    className="flex items-center gap-2 py-1.5 text-slate-700"
                    href="/loja?ordem=mais_vendidos"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingBag className="size-4 text-[#004CB1]" />
                    <span>Mais Vendidos</span>
                  </Link>
                  <Link
                    className="flex items-center gap-2 py-1.5 text-slate-700"
                    href="/eventos"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Sparkles className="size-4 text-blue-600" />
                    <span>Nossos Eventos</span>
                  </Link>
                  <Link
                    className="flex items-center gap-2 py-1.5 text-slate-700"
                    href="/eventos/workshops/aulas-confeitaria"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Sparkles className="size-4 text-[#B45309]" />
                    <span>Workshops — Aulas Confeitaria</span>
                  </Link>
                  <Link
                    className="flex items-center gap-2 py-1.5 text-slate-700"
                    href="/post"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Sparkles className="size-4 text-[#E2091E]" />
                    <span>Conteúdos — Explica Aí Nort!</span>
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

      {/* 
        Botão flutuante para abrir o menu lateral:
        - Posicionado no canto superior esquerdo (fixed left-3 top-4 md:left-4 md:top-5).
        - O primeiro slide (hero banner) fica na frente dele (oculto até rolar além dele).
        - Animação suave deslizando da esquerda para a direita ao entrar.
        - Tooltip "Ver menu produtos" exibido ao passar o mouse.
      */}
      <div
        className={`fixed left-3 top-4 md:left-4 md:top-5 z-40 transition-all duration-300 ease-out ${
          showFloatingButton && !sidebarOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "-translate-x-14 opacity-0 pointer-events-none"
        }`}
      >
        <div className="group/floating-toggle relative flex items-center">
          <button
            aria-label="Ver menu produtos"
            className="flex size-9 md:size-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-md transition-all duration-200 hover:border-[#004CB1] hover:bg-slate-50 hover:text-[#004CB1] hover:shadow-lg active:scale-95"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <PanelLeft className="size-5 stroke-[1.8]" />
          </button>

          {/* Tooltip shadcn style: "Ver menu produtos" com indicador visual */}
          <div
            role="tooltip"
            className="pointer-events-none absolute left-full top-1/2 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl opacity-0 scale-95 transition-all duration-150 group-hover/floating-toggle:opacity-100 group-hover/floating-toggle:scale-100 z-50"
          >
            Ver menu produtos
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[4px] border-transparent border-r-slate-900" />
          </div>
        </div>
      </div>

      {/* Sidebar Drawer Lateral de Categorias, Segmentos e Tags */}
      <CategorySidebarDrawer
        categories={categories}
        onClose={() => setSidebarOpen(false)}
        open={sidebarOpen}
        segments={segments}
        tags={tags}
      />
    </>
  );
}
