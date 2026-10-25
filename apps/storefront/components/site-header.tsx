'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  HelpCircle,
  Home,
  Info,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  Store,
  Tag,
  Truck,
  User,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuoteCart } from './quote-cart-provider';
import type { ApiBrand, ApiCategory } from '@/lib/types';

export type SiteHeaderProps = {
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
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Efeito inteligente de auto-hide no scroll conforme a referência oficial
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const SCROLL_THRESHOLD = 10;
    const TOP_OFFSET = 60;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY);

          if (mobileMenuOpen) {
            setIsHeaderHidden(false);
            lastScrollY = currentScrollY;
            ticking = false;
            return;
          }

          if (currentScrollY <= TOP_OFFSET) {
            setIsHeaderHidden(false);
            setIsScrolled(false);
            lastScrollY = currentScrollY;
            ticking = false;
            return;
          }

          setIsScrolled(true);
          const diff = currentScrollY - lastScrollY;

          if (Math.abs(diff) >= SCROLL_THRESHOLD) {
            if (diff > 0 && currentScrollY > TOP_OFFSET) {
              setIsHeaderHidden(true);
            } else if (diff < 0) {
              setIsHeaderHidden(false);
            }
            lastScrollY = currentScrollY;
          }

          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobileMenuOpen]);

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
        className={`sticky top-0 z-50 w-full transition-transform duration-300 ease-in-out ${
          isHeaderHidden ? '-translate-y-full' : 'translate-y-0'
        } ${isScrolled ? 'shadow-lg' : ''}`}
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
            <a
              className="flex items-center gap-1.5 pl-2 font-bold whitespace-nowrap text-white transition hover:underline"
              href={`https://wa.me/${whatsappDigits}?text=Ol%C3%A1!%20Vim%20pelo%20site%20Comercial%20do%20Norte%20e%20gostaria%20de%20atendimento.`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Phone aria-hidden className="size-3.5 fill-current flex-shrink-0" />
              <span>{whatsappDisplay} · WhatsApp Vendas</span>
            </a>
          </div>
        </div>

        {/* BARRA 02: NAVBAR PRINCIPAL AZUL COM MASCOTE, LOGO, CEP, BUSCA E AÇÕES */}
        <div className="relative bg-[#004CB1] py-2 text-white md:h-[72px] md:py-0">
          <div className="cn-container relative flex h-full flex-col justify-between gap-2 md:flex-row md:items-center md:gap-4 lg:gap-6">
            {/* Lado Esquerdo: Mascote + Toggle Mobile + Logo + CEP */}
            <div className="flex flex-shrink-0 items-center justify-between gap-2 sm:gap-3 md:justify-start lg:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Botão Mobile Toggle */}
                <button
                  aria-controls="mobileMenu"
                  aria-expanded={mobileMenuOpen}
                  aria-label="Abrir Menu de Navegação"
                  className="cursor-pointer p-1.5 text-white focus:outline-none md:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                  type="button"
                >
                  <Menu aria-hidden className="size-6 stroke-[2.2]" />
                </button>

                {/* Mascote 3D James Oficial (Apoiado na base da barra azul, subindo para a vermelha) */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-2.5 z-30 hidden h-[98px] w-[74px] items-end leading-none md:flex"
                >
                  <img
                    alt="Mascote James Oficial Comercial do Norte"
                    className="block h-[98px] w-auto flex-shrink-0 object-contain object-bottom filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.28)]"
                    height={98}
                    loading="eager"
                    src="/assets/imgs/Mascote-3D-James-em-pe/principais/1-james-3d-principal.png"
                    width={74}
                  />
                </div>

                {/* Logo Oficial Comercial do Norte (Branca com recuo para acomodar o mascote em desktop) */}
                <Link
                  aria-label="Comercial do Norte - Início"
                  className="flex items-center pr-2 pl-0 md:pl-[84px] lg:pl-[90px]"
                  href="/"
                >
                  <img
                    alt={siteName}
                    className="h-7 w-auto object-contain sm:h-8 md:h-10 lg:h-11"
                    fetchPriority="high"
                    height={44}
                    src="/assets/Logos/logo-comercial-do-norte-branca.png"
                    width={180}
                  />
                </Link>

                {/* Divisória vertical | idêntica ao Figma */}
                <span className="hidden h-7 w-px bg-white/25 md:inline-block sm:mx-1.5 lg:mx-2.5 flex-shrink-0" />

                {/* Widget CEP / Localização */}
                <div className="hidden flex-shrink-0 items-center gap-2 text-left md:flex">
                  <MapPin aria-hidden className="size-5 flex-shrink-0 text-white/90" />
                  <div className="flex flex-col leading-tight whitespace-nowrap">
                    <span className="text-[10px] font-normal text-white/75">Enviar para</span>
                    <span className="text-[12px] font-bold text-white">Belém 66020-600</span>
                  </div>
                </div>
              </div>

              {/* Ação Mobile: Carrinho com Badge */}
              <div className="flex items-center gap-2 md:hidden">
                <button
                  aria-label="Abrir Carrinho de Cotação"
                  className="relative cursor-pointer p-1.5 text-white/90 hover:text-white"
                  onClick={openDrawer}
                  type="button"
                >
                  <ShoppingBag aria-hidden className="size-6 stroke-[1.8]" />
                  <span className="absolute top-0 right-0 flex size-4 items-center justify-center rounded-full border-2 border-[#004CB1] bg-[#E33C34] text-[9.5px] font-black text-white">
                    {count}
                  </span>
                </button>
              </div>
            </div>

            {/* Centro: Barra de Busca com Botão Circular Figma */}
            <div className="w-full flex-1 md:mx-2 md:max-w-[540px] lg:mx-4">
              <form
                className="flex w-full items-center rounded-full bg-white px-2 py-1 shadow-sm transition focus-within:ring-2 focus-within:ring-white/40"
                onSubmit={submitSearch}
                role="search"
              >
                <input
                  aria-label="Buscar produtos no catálogo"
                  className="w-full min-w-0 border-none bg-transparent pl-4 text-[13.5px] text-[#1D2433] outline-none placeholder:text-[#71717A]"
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar embalagens, copos descartáveis, caixas de pizza, sacolas..."
                  type="search"
                  value={query}
                />
                <button
                  aria-label="Pesquisar"
                  className="flex size-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#004CB1] text-white transition hover:scale-105 hover:bg-[#003b8a]"
                  type="submit"
                >
                  <Search aria-hidden className="size-4 stroke-[2.5]" />
                </button>
              </form>
            </div>

            {/* Lado Direito Desktop: Favoritos, Carrinho/Cotação e Conta */}
            <div className="hidden flex-shrink-0 items-center gap-4 md:flex lg:gap-6">
              {/* Favoritos */}
              <Link
                className="group flex cursor-pointer flex-col items-center justify-center text-white/90 transition hover:text-white"
                href="/loja"
                title="Meus Favoritos"
              >
                <Heart aria-hidden className="size-5 stroke-[1.8] transition-transform group-hover:scale-105" />
                <span className="mt-0.5 text-[11px] font-medium tracking-tight">Favoritos</span>
              </Link>

              {/* Carrinho / Cotação com Badge Oficial */}
              <button
                aria-label="Abrir Minha Cotação"
                className="group relative flex cursor-pointer flex-col items-center justify-center text-white/90 transition hover:text-white focus:outline-none"
                onClick={openDrawer}
                title="Carrinho de Cotação"
                type="button"
              >
                <div className="relative">
                  <ShoppingBag aria-hidden className="size-5 stroke-[1.8] transition-transform group-hover:scale-105" />
                  <span className="absolute -top-1 -right-2 flex size-4 items-center justify-center rounded-full border-2 border-[#004CB1] bg-[#E33C34] text-[10px] font-extrabold text-white shadow-xs">
                    {count}
                  </span>
                </div>
                <span className="mt-0.5 text-center text-[10.5px] font-medium leading-[1.1]">
                  Minha<br />Cotação
                </span>
              </button>

              {/* Conta / Acesso */}
              <Link
                className="group flex cursor-pointer items-center gap-1.5 text-left text-white/90 transition hover:text-white sm:gap-2"
                href="/cotacao"
                title="Minha Conta ou Cotações"
              >
                <User aria-hidden="true" className="size-6 stroke-[1.8] flex-shrink-0 transition-transform group-hover:scale-105" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[10.5px] font-normal text-white/80">Entre</span>
                  <span className="text-[11.5px] font-bold text-white">ou Cotar</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* BARRA 03: SUB-BARRA DE DEPARTAMENTOS AZUL ESCURO (#00357B) */}
        <nav
          aria-label="Departamentos Comercial do Norte"
          className="w-full border-t border-white/10 bg-[#00357B] text-white"
        >
          <div className="cn-container no-scrollbar flex items-center justify-between gap-4 overflow-x-auto py-2 text-[12.5px] font-medium whitespace-nowrap sm:gap-6 lg:text-[13px]">
            {/* Tem no Comercial do Norte */}
            <Link
              className="flex flex-shrink-0 items-center gap-2 font-bold text-white transition hover:text-white/80"
              href="/loja"
            >
              <Menu aria-hidden className="size-4 stroke-[2.2]" />
              <span>Tem no Comercial do Norte</span>
            </Link>

            <span className="hidden h-4 w-px flex-shrink-0 bg-white/20 sm:inline-block sm:mx-1" />

            {/* Ofertas do Dia NOVO */}
            <Link
              className="flex flex-shrink-0 items-center gap-1.5 transition hover:text-white/80"
              href="/loja"
            >
              <span>Ofertas do Dia</span>
              <span className="rounded-full bg-[#E33C34] px-1.5 py-0.5 text-[9.5px] font-black uppercase leading-none tracking-wider text-white shadow-xs">
                NOVO
              </span>
            </Link>

            {/* Departamentos Canônicos */}
            {rootCategories.slice(0, 6).map((cat) => (
              <Link
                className="flex flex-shrink-0 items-center gap-1 transition hover:text-white/80"
                href={`/categoria/${cat.slug}`}
                key={cat.id}
              >
                <span>{cat.name}</span>
              </Link>
            ))}

            <Link
              className="flex-shrink-0 font-medium transition hover:text-white/80"
              href="/loja"
            >
              Mais Vendidos
            </Link>
          </div>
        </nav>
      </header>

      {/* MOBILE MENU DRAWER (OFF-CANVAS FIDELIDADE À REFERÊNCIA) */}
      {mobileMenuOpen ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      ) : null}

      <aside
        aria-hidden={!mobileMenuOpen}
        aria-label="Menu Mobile"
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-[320px] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line p-4">
          <img
            alt={siteName}
            className="h-8 w-auto object-contain"
            height={32}
            src="/assets/Logos/logo-comercial-do-norte.png"
            width={140}
          />
          <button
            aria-label="Fechar Menu"
            className="cursor-pointer rounded-lg p-1 text-muted hover:bg-surface-soft hover:text-ink"
            onClick={() => setMobileMenuOpen(false)}
            type="button"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
              Navegação Principal
            </span>
            <nav className="flex flex-col gap-1">
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-soft"
                href="/"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home aria-hidden className="size-4 text-brand" />
                <span>Início</span>
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-soft"
                href="/loja"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Tag aria-hidden className="size-4 text-promo" />
                <span>Ofertas da Semana</span>
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-soft"
                href="/cotacao"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingBag aria-hidden className="size-4 text-brand" />
                <span>Minha Cotação</span>
              </Link>
            </nav>
          </div>

          <div className="mb-6">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
              Departamentos
            </span>
            <div className="flex flex-col gap-1">
              {rootCategories.map((cat) => (
                <Link
                  className="rounded-lg px-3 py-2 text-sm font-medium text-body hover:bg-surface-soft hover:text-ink"
                  href={`/categoria/${cat.slug}`}
                  key={cat.id}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
              Atendimento
            </span>
            <div className="flex flex-col gap-2 text-xs text-body">
              <p className="font-semibold text-ink">Horário de Funcionamento:</p>
              <p>Segunda a Sexta: 06:30 às 18:00</p>
              <p>Sábado: 06:30 às 12:30</p>
              <a
                className="mt-2 inline-flex items-center gap-1.5 font-bold text-brand hover:underline"
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone aria-hidden className="size-3.5" />
                Falar com Vendas: {whatsappDisplay}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-line p-4">
          <button
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-promo py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-promo-hover"
            onClick={() => {
              setMobileMenuOpen(false);
              openDrawer();
            }}
            type="button"
          >
            <ShoppingBag aria-hidden className="size-4" />
            <span>Ver Cotação ({count})</span>
          </button>
        </div>
      </aside>
    </>
  );
}
