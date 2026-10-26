'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  ChevronRight,
  Coffee,
  Layers,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Truck,
  Utensils,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import type { ApiCategory } from '@/lib/types';

export type MegaMenuGroup = {
  title: string;
  subtitle: string;
  items: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
};

const DEFAULT_MEGA_MENU_GROUPS: MegaMenuGroup[] = [
  {
    title: 'EMBALAGENS & FOOD SERVICE',
    subtitle: 'Soluções térmicas, delivery e transporte seguro.',
    items: [
      { name: 'Caixas de Pizza & Salgados', href: '/loja?q=pizza', icon: Box },
      { name: 'Marmitas & Potes Térmicos', href: '/loja?q=marmita', icon: Package },
      { name: 'Bandejas & Embalagens Kraft', href: '/loja?q=kraft', icon: Layers },
      { name: 'Sacos, Sacolas & Bobinas', href: '/loja?q=sacolas', icon: ShoppingBag, badge: 'ATACADO' },
    ],
  },
  {
    title: 'FESTAS & EVENTOS',
    subtitle: 'Itens essenciais para festas, bares e buffets.',
    items: [
      { name: 'Copos Plásticos & Térmicos', href: '/loja?q=copo', icon: Coffee },
      { name: 'Pratos, Garfos & Facas', href: '/loja?q=talheres', icon: Utensils },
      { name: 'Guardanapos & Canudos Bio', href: '/loja?q=guardanapo', icon: ShieldCheck },
      { name: 'Artigos para Festas & Eventos', href: '/loja?q=festa', icon: Sparkles, badge: 'NOVO' },
    ],
  },
  {
    title: 'HIGIENE, LIMPEZA & CONFEITARIA',
    subtitle: 'Produtos profissionais de alto rendimento.',
    items: [
      { name: 'Detergentes & Desinfetantes 5L', href: '/loja?q=detergente', icon: Wrench },
      { name: 'Papel Toalha & Dispenser', href: '/loja?q=papel-toalha', icon: Store },
      { name: 'Sacos de Lixo Reforçados', href: '/loja?q=lixo', icon: Truck },
      { name: 'Doces, Coberturas & Formas', href: '/loja?q=confeitaria', icon: Tag },
    ],
  },
];

type MegaMenuProps = {
  categories?: ApiCategory[];
  whatsappPhone?: string;
  onClose?: () => void;
};

export function MegaMenu({ categories = [], whatsappPhone = '5596981001897', onClose }: MegaMenuProps) {
  return (
    <div
      role="menu"
      aria-label="Menu principal de departamentos e soluções"
      className="w-[960px] max-w-[calc(100vw-32px)] rounded-3xl border border-slate-200/90 bg-white p-6 text-slate-800 shadow-[0_25px_70px_-15px_rgba(0,53,123,0.25)] ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-200"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* 3 Colunas de Departamentos e Soluções (Estilo do Print e 21st.dev) */}
        <div className="col-span-3 grid grid-cols-1 gap-6 md:grid-cols-3">
          {DEFAULT_MEGA_MENU_GROUPS.map((group) => (
            <div className="flex flex-col" key={group.title}>
              {/* Cabeçalho da Coluna: Título Uppercase + Subtítulo */}
              <div className="mb-4">
                <h3 className="text-[11px] font-black tracking-wider text-slate-900 uppercase">
                  {group.title}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                  {group.subtitle}
                </p>
              </div>

              {/* Lista de Itens com Ícone em Container Arredondado */}
              <ul className="space-y-1.5">
                {group.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        className="group flex items-center gap-3 rounded-xl p-2 transition-all duration-150 hover:bg-slate-50 hover:shadow-xs"
                        href={item.href}
                        onClick={onClose}
                      >
                        {/* Container do Ícone (Borda, fundo sutil e animação de hover) */}
                        <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50/70 text-[#004CB1] transition-all duration-200 group-hover:border-[#004CB1] group-hover:bg-[#004CB1] group-hover:text-white">
                          <IconComponent className="size-4" />
                        </div>

                        {/* Texto e Badge */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-800 transition-colors group-hover:text-[#004CB1]">
                              {item.name}
                            </span>
                            {item.badge && (
                              <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-[#E2091E]">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="size-3.5 text-slate-300 opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-[#004CB1]" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Rodapé Interno com Atalho para Todos os Departamentos */}
          <div className="col-span-3 mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-[11px] font-medium text-slate-500">
              Mais de 1.500 produtos a pronta entrega em Belém e Região Metropolitana.
            </span>
            <Link
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004CB1] hover:text-[#00357B] hover:underline"
              href="/loja"
              onClick={onClose}
            >
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* 1 Coluna em Destaque à Direita (Featured Callout Card com Foto/Gradiente) */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#002B66] via-[#004CB1] to-[#00357B] p-5 text-white shadow-lg">
          {/* Efeito sutil de brilho no fundo */}
          <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-white/10 blur-2xl" />

          {/* Conteúdo Superior */}
          <div className="relative z-10">
            <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-200 backdrop-blur-xs">
              ENCONTRE A SOLUÇÃO CERTA
            </span>

            <h4 className="mt-3 text-sm font-bold leading-snug text-white">
              Precisa de embalagens ou cotação no atacado?
            </h4>

            <p className="mt-2 text-[11px] leading-relaxed text-white/80">
              Fale com nossos consultores técnicos para calcular o melhor volume, medidas sob encomenda e prazos de entrega para o seu negócio.
            </p>
          </div>

          {/* Imagem do Mascote James ou Loja */}
          <div className="relative my-3 flex items-center justify-center">
            <Link
              aria-label="Ir para a Página Inicial da Comercial do Norte"
              className="relative block h-28 w-24 cursor-pointer transition-transform hover:scale-105 active:scale-95"
              href="/"
            >
              <Image
                alt="Mascote James 3D Comercial do Norte"
                className="object-contain drop-shadow-md"
                fill
                sizes="96px"
                src="/assets/imgs/Mascote-3D-James-em-pe/principais/1-james-3d-principal.png"
              />
            </Link>
          </div>

          {/* Ação Inferior (CTA) */}
          <div className="relative z-10 space-y-2">
            <a
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E2091E] px-3.5 py-2 text-center text-xs font-bold text-white shadow-md transition hover:bg-[#c40819] hover:shadow-lg active:scale-98"
              href={`https://wa.me/${whatsappPhone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de falar com um especialista sobre embalagens e cotação no atacado.')}`}
              rel="noreferrer"
              target="_blank"
            >
              <Phone className="size-3.5" />
              <span>Falar com Especialista</span>
            </a>

            <Link
              className="block w-full text-center text-[10px] font-semibold text-white/70 hover:text-white hover:underline"
              href="/cotacao"
              onClick={onClose}
            >
              Ou monte sua lista online aqui
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
