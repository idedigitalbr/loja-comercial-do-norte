'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Menu, Phone, Search, ShoppingBasket, X } from 'lucide-react';
import { useState } from 'react';
import { useQuoteCart } from './quote-cart-provider';
import type { ApiBrand, ApiCategory } from '@/lib/types';

type SiteHeaderProps = {
  siteName: string;
  logoUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  categories: ApiCategory[];
  brands: ApiBrand[];
};

/** Cabeçalho S0: barra de utilidades, busca grande, mega menu e cotação. */
export function SiteHeader({ siteName, logoUrl, phone, whatsapp, categories, brands }: SiteHeaderProps) {
  const router = useRouter();
  const { count, openDrawer } = useQuoteCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootCategories = categories.filter((category) => !category.parentId);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/loja?q=${encodeURIComponent(term)}` : '/loja');
    setMobileOpen(false);
  }

  return (
    <header className="bg-brand text-white">
      <div className="bg-brand-hover">
        <div className="cn-container flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
          <p className="font-medium">Ofertas do dia · Atacado e varejo</p>
          <div className="flex items-center gap-4">
            {whatsapp ? (
              <a className="inline-flex items-center gap-1 hover:underline" href={`https://wa.me/${whatsapp.replace(/\D+/g, '')}`} rel="noreferrer" target="_blank">
                <Phone aria-hidden className="size-3.5" /> Compre pelo WhatsApp
              </a>
            ) : null}
            <span className="hidden sm:inline">Retire na loja</span>
          </div>
        </div>
      </div>

      <div className="cn-container flex items-center gap-4 py-4">
        <Link className="flex items-center gap-2" href="/">
          {logoUrl ? (
            <Image alt={siteName} className="h-10 w-auto rounded bg-white p-1" height={48} priority src={logoUrl} width={160} />
          ) : (
            <span className="text-lg font-extrabold tracking-tight">{siteName}</span>
          )}
        </Link>

        <form className="hidden flex-1 md:block" onSubmit={submitSearch} role="search">
          <label className="sr-only" htmlFor="site-search">Buscar produtos</label>
          <div className="flex items-center gap-2 rounded-pill bg-white px-4 py-2 text-body">
            <Search aria-hidden className="size-4 text-muted" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              id="site-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar embalagem, descartável, marca..."
              type="search"
              value={query}
            />
            <button className="rounded-pill bg-promo px-3 py-1 text-xs font-semibold text-white hover:bg-promo-hover" type="submit">
              Buscar
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label="Abrir carrinho de cotação"
            className="relative inline-flex items-center gap-2 rounded-pill bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
            onClick={openDrawer}
            type="button"
          >
            <ShoppingBasket aria-hidden className="size-5" />
            <span className="hidden sm:inline">Minha cotação</span>
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-pill bg-promo px-1 text-center text-[11px] font-bold leading-5">
                {count}
              </span>
            ) : null}
          </button>
          <button
            aria-controls="mobile-menu"
            aria-expanded={mobileOpen}
            aria-label="Abrir menu de categorias"
            className="inline-flex items-center rounded-pill bg-white/10 p-2 hover:bg-white/20 lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            type="button"
          >
            {mobileOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </div>

      <nav aria-label="Categorias" className="hidden border-t border-white/15 lg:block">
        <div className="cn-container flex flex-wrap items-center gap-1 py-2 text-sm">
          <Link className="rounded px-3 py-2 font-semibold hover:bg-white/10" href="/loja">Todas as categorias</Link>
          {rootCategories.slice(0, 8).map((category) => (
            <div className="group relative" key={category.id}>
              <Link
                aria-haspopup={category.children?.length ? 'true' : undefined}
                className="inline-flex items-center gap-1 rounded px-3 py-2 hover:bg-white/10 focus:bg-white/10"
                href={`/categoria/${category.slug}`}
              >
                {category.name}
                {category.children?.length ? <ChevronDown aria-hidden className="size-3.5 opacity-70" /> : null}
              </Link>
              {category.children?.length ? (
                <div className="invisible absolute left-0 top-full z-40 w-64 rounded-card border border-line bg-surface p-2 text-body opacity-0 shadow-elevated transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="grid gap-0.5">
                    {category.children.map((child) => (
                      <li key={child.id}>
                        <Link className="block rounded px-3 py-2 text-sm hover:bg-brand-soft hover:text-brand" href={`/categoria/${child.slug}`}>
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
          {brands.length ? (
            <Link className="rounded px-3 py-2 hover:bg-white/10" href="/marcas">Marcas</Link>
          ) : null}
        </div>
      </nav>

      {mobileOpen ? (
        <nav aria-label="Categorias (mobile)" className="border-t border-white/15 bg-brand px-4 py-3 lg:hidden" id="mobile-menu">
          <ul className="grid gap-1 text-sm">
            <li><Link className="block rounded px-2 py-2 font-semibold hover:bg-white/10" href="/loja" onClick={() => setMobileOpen(false)}>Todas as categorias</Link></li>
            {rootCategories.map((category) => (
              <li key={category.id}>
                <Link className="block rounded px-2 py-2 font-medium hover:bg-white/10" href={`/categoria/${category.slug}`} onClick={() => setMobileOpen(false)}>
                  {category.name}
                </Link>
                {category.children?.length ? (
                  <ul className="ml-3 grid gap-0.5 border-l border-white/20 pl-2">
                    {category.children.map((child) => (
                      <li key={child.id}>
                        <Link className="block rounded px-2 py-1.5 text-white/85 hover:bg-white/10" href={`/categoria/${child.slug}`} onClick={() => setMobileOpen(false)}>
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
            {phone ? <li><a className="block rounded px-2 py-2 hover:bg-white/10" href={`tel:${phone.replace(/\D+/g, '')}`}>{phone}</a></li> : null}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
