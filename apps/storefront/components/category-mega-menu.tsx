'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight } from 'lucide-react';

export type CategoryMenuConfig = {
  id: string;
  name: string;
  allLabel: string;
  allHref: string;
  columns: [
    Array<{ name: string; href: string; badge?: string }>,
    Array<{ name: string; href: string; badge?: string }>,
  ];
  banner: {
    tag: string;
    title: string;
    description: string;
    imageUrl: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

export const CATEGORY_MENUS_DATA: Record<string, CategoryMenuConfig> = {
  embalagens: {
    id: 'embalagens',
    name: 'Embalagens',
    allLabel: 'Tudo de Embalagens',
    allHref: '/categoria/embalagens',
    columns: [
      [
        { name: 'Caixas de Pizza Oitavadas', href: '/loja?q=pizza' },
        { name: 'Marmitas Térmicas de Isopor', href: '/loja?q=marmita', badge: 'POPULAR' },
        { name: 'Potes Plásticos com Tampa', href: '/loja?q=pote' },
        { name: 'Embalagens Kraft para Delivery', href: '/loja?q=kraft' },
        { name: 'Bandejas de Isopor para Alimentos', href: '/loja?q=bandeja' },
        { name: 'Caixas de Lanche & Hambúrguer', href: '/loja?q=lanche' },
        { name: 'Formas de Alumínio Descartáveis', href: '/loja?q=aluminio' },
        { name: 'Potes para Molho & Sobremesa', href: '/loja?q=molho' },
      ],
      [
        { name: 'Sacolas Plásticas Reforçadas', href: '/loja?q=sacolas', badge: 'ATACADO' },
        { name: 'Sacolas Kraft com Alça', href: '/loja?q=kraft' },
        { name: 'Bobinas Plásticas Picotadas', href: '/loja?q=bobina' },
        { name: 'Filme PVC & Papel Alumínio 100m', href: '/loja?q=filme-pvc' },
        { name: 'Fitas Adesivas & Aplicadores', href: '/loja?q=fita' },
        { name: 'Seladoras de Embalagens Manuais', href: '/loja?q=seladora' },
        { name: 'Caixas de Papelão para Envio', href: '/loja?q=caixa-papelao' },
        { name: '+ Outras Embalagens Especiais', href: '/categoria/embalagens' },
      ],
    ],
    banner: {
      tag: 'ATACADO & DELIVERY',
      title: 'Embalagens Térmicas para Restaurantes e Delivery',
      description: 'Caixas master com desconto progressivo para compras no atacado em Belém.',
      imageUrl: '/assets/HOME Vitrine/S3-CARDS-Categorias/cat-embalagens.jpg',
      ctaLabel: 'Explorar Embalagens',
      ctaHref: '/categoria/embalagens',
    },
  },
  descartaveis: {
    id: 'descartaveis',
    name: 'Descartáveis',
    allLabel: 'Tudo de Descartáveis',
    allHref: '/categoria/descartaveis',
    columns: [
      [
        { name: 'Copos Plásticos 200ml (C/ 2.500)', href: '/loja?q=copo-200ml', badge: 'LÍDER' },
        { name: 'Copos Plásticos 300ml e 500ml', href: '/loja?q=copo-300ml' },
        { name: 'Copos Térmicos de Isopor para Café', href: '/loja?q=copo-termico' },
        { name: 'Pratos Plásticos Redondos e Fundos', href: '/loja?q=prato' },
        { name: 'Garfos, Facas & Colheres Reforçados', href: '/loja?q=talheres' },
        { name: 'Talheres Embalados Individualmente', href: '/loja?q=sache' },
        { name: 'Guardanapos de Papel (Pacotão)', href: '/loja?q=guardanapo' },
        { name: 'Canudos Biodegradáveis e de Papel', href: '/loja?q=canudo' },
      ],
      [
        { name: 'Potes para Sobremesa com Tampa', href: '/loja?q=sobremesa' },
        { name: 'Mexedores de Café & Bebidas', href: '/loja?q=mexedor' },
        { name: 'Toalhas de Papel em Rolo', href: '/loja?q=toalha-papel' },
        { name: 'Forminhas de Doces & Brigadeiro', href: '/loja?q=forminha' },
        { name: 'Canecas & Taças Acrílicas', href: '/loja?q=taca' },
        { name: 'Espetos de Madeira para Petisco', href: '/loja?q=espeto' },
        { name: 'Luvas Plásticas Descartáveis', href: '/loja?q=luva-plastica' },
        { name: '+ Outros Descartáveis Essenciais', href: '/categoria/descartaveis' },
      ],
    ],
    banner: {
      tag: 'DESCARTÁVEIS',
      title: 'Copos e Pratos Descartáveis por Caixa Fechada',
      description: 'Abasteça lanchonetes, eventos e hospitais com entrega expressa.',
      imageUrl: '/assets/HOME Vitrine/S3-CARDS-Categorias/cat-descartaveis.jpg',
      ctaLabel: 'Explorar Descartáveis',
      ctaHref: '/categoria/descartaveis',
    },
  },
  festa: {
    id: 'festa',
    name: 'Festas & Eventos',
    allLabel: 'Tudo de Festas & Eventos',
    allHref: '/categoria/artigos-festa',
    columns: [
      [
        { name: 'Forminhas para Doces Finos', href: '/loja?q=forminha-fina', badge: 'NOVO' },
        { name: 'Pratos & Copos Temáticos de Festa', href: '/loja?q=festa-tema' },
        { name: 'Guardanapos Coloridos & Estampados', href: '/loja?q=guardanapo-festa' },
        { name: 'Garfinhos de Sobremesa Coloridos', href: '/loja?q=garfinho' },
        { name: 'Toalhas de Mesa Descartáveis', href: '/loja?q=toalha-mesa' },
        { name: 'Sacolas para Lembrancinhas', href: '/loja?q=sacola-lembranca' },
        { name: 'Velas de Aniversário & Faíscas', href: '/loja?q=vela' },
        { name: 'Bexigas & Balões Metalizados', href: '/loja?q=baloes' },
      ],
      [
        { name: 'Embalagens Transparentes para Doces', href: '/loja?q=acetato' },
        { name: 'Caixas de Brigadeiro Gourmet', href: '/loja?q=caixa-brigadeiro' },
        { name: 'Tubetes & Garrafinhas Plásticas', href: '/loja?q=tubete' },
        { name: 'Painéis & Suportes de Balão', href: '/loja?q=suporte-balao' },
        { name: 'Fitas Decorativas & Laços Prontos', href: '/loja?q=laco' },
        { name: 'Picks & Enfeites de Cupcake', href: '/loja?q=pick' },
        { name: 'Cestas e Cachepôs de Festa', href: '/loja?q=cesta' },
        { name: '+ Todos os Artigos de Decoração', href: '/categoria/artigos-festa' },
      ],
    ],
    banner: {
      tag: 'FESTAS & EVENTOS',
      title: 'Decoração e Descartáveis para Festas & Eventos',
      description: 'Variedade completa para aniversários, casamentos e confraternizações.',
      imageUrl: '/assets/HOME Vitrine/S3-CARDS-Categorias/cat-festas.jpg',
      ctaLabel: 'Explorar Festas & Eventos',
      ctaHref: '/categoria/artigos-festa',
    },
  },
  confeitaria: {
    id: 'confeitaria',
    name: 'Doces & Confeitaria',
    allLabel: 'Tudo de Confeitaria & Doces',
    allHref: '/categoria/confeitaria',
    columns: [
      [
        { name: 'Formas para Bolos, Tortas & Pudim', href: '/loja?q=forma-bolo' },
        { name: 'Embalagens para Bolos com Tampa Alta', href: '/loja?q=tampa-alta', badge: 'TOP' },
        { name: 'Caixas para Doces & Macarons', href: '/loja?q=caixa-doce' },
        { name: 'Pratos Laminados para Bolos', href: '/loja?q=prato-laminado' },
        { name: 'Bicos & Sacos de Confeitar', href: '/loja?q=bico-confeitar' },
        { name: 'Chantilly em Caixa & Pós', href: '/loja?q=chantilly' },
        { name: 'Chocolates em Barra & Gotas', href: '/loja?q=chocolate' },
        { name: 'Coberturas & Granulados', href: '/loja?q=granulado' },
      ],
      [
        { name: 'Corantes Alimentícios em Gel', href: '/loja?q=corante' },
        { name: 'Desmoldantes em Spray', href: '/loja?q=desmoldante' },
        { name: 'Tapetes de Silicone & Rolos', href: '/loja?q=tapete-silicone' },
        { name: 'Espátulas Inox & Alisadores', href: '/loja?q=espatula' },
        { name: 'Acetato em Rolo para Bolos', href: '/loja?q=acetato-rolo' },
        { name: 'Embalagens Individuais para Fatias', href: '/loja?q=fatia-bolo' },
        { name: 'Potes de Vidro & Acrílico para Sobremesa', href: '/loja?q=pote-bolo' },
        { name: '+ Outros Ingredientes e Acessórios', href: '/categoria/confeitaria' },
      ],
    ],
    banner: {
      tag: 'CONFEITARIA ARTESANAL',
      title: 'Embalagens Premium para Bolos e Doces Gourmet',
      description: 'Valorize seu produto final com tampas cristalinas e caixas estruturadas.',
      imageUrl: '/assets/HOME Vitrine/S3-CARDS-Categorias/cat-confeitaria.jpg',
      ctaLabel: 'Explorar Confeitaria',
      ctaHref: '/categoria/confeitaria',
    },
  },
  limpeza: {
    id: 'limpeza',
    name: 'Limpeza Profissional',
    allLabel: 'Tudo de Limpeza Profissional',
    allHref: '/categoria/limpeza',
    columns: [
      [
        { name: 'Detergentes Concentrados 5 Litros', href: '/loja?q=detergente-5l', badge: 'ATACADO' },
        { name: 'Desinfetantes e Cloros 5 Litros', href: '/loja?q=desinfetante' },
        { name: 'Desengraxantes & Multiuso 5L', href: '/loja?q=desengraxante' },
        { name: 'Sabonetes Líquidos Refil 5L', href: '/loja?q=sabonete-5l' },
        { name: 'Álcool 70% Líquido & Gel', href: '/loja?q=alcool-70' },
        { name: 'Alvejantes sem Cloro & Amaciantes', href: '/loja?q=amaciante' },
        { name: 'Limpadores de Piso e Porcelanato', href: '/loja?q=limpa-piso' },
        { name: 'Limpa Vidros de Alta Performance', href: '/loja?q=limpa-vidro' },
      ],
      [
        { name: 'Sacos de Lixo 50L, 100L e 200L', href: '/loja?q=saco-lixo', badge: 'REFORÇADO' },
        { name: 'Sacos de Lixo Hospitalar (Infectante)', href: '/loja?q=lixo-hospitalar' },
        { name: 'Papel Toalha Interfolha 100% Celulose', href: '/loja?q=papel-toalha' },
        { name: 'Papel Higiênico Rolão 300m', href: '/loja?q=papel-rolao' },
        { name: 'Dispensers de Parede para Papel e Sabonete', href: '/loja?q=dispenser' },
        { name: 'Luvas de Látex & Nitrílicas', href: '/loja?q=luva-latex' },
        { name: 'Rodos, MOPs & Carros de Limpeza', href: '/loja?q=mop' },
        { name: '+ Outros Produtos Institucionais', href: '/categoria/limpeza' },
      ],
    ],
    banner: {
      tag: 'LIMPEZA PROFISSIONAL',
      title: 'Galões de 5L e Linha Institucional com Alto Rendimento',
      description: 'Ideal para condomínios, clínicas, escolas e restaurantes.',
      imageUrl: '/assets/HOME Vitrine/S3-CARDS-Categorias/cat-limpeza.jpg',
      ctaLabel: 'Explorar Limpeza',
      ctaHref: '/categoria/limpeza',
    },
  },
};

type CategoryMegaMenuProps = {
  config: CategoryMenuConfig;
  onClose?: () => void;
  align?: 'left' | 'center' | 'right';
};

export function CategoryMegaMenu({ config, onClose, align = 'left' }: CategoryMegaMenuProps) {
  const [col1, col2] = config.columns;

  const alignmentClass =
    align === 'center'
      ? '-left-48 md:-left-64'
      : align === 'right'
        ? 'right-0'
        : 'left-0';

  return (
    <div
      role="menu"
      aria-label={`Menu expandido de ${config.name}`}
      className={`w-[780px] max-w-[calc(100vw-32px)] rounded-2xl border border-slate-200/95 bg-white p-5 text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.18)] ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150 ${alignmentClass}`}
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* Colunas 1 e 2: Lista de Subcategorias com Link Principal no Topo */}
        <div className="col-span-2 flex flex-col">
          {/* Link Principal no Topo: "Tudo de [Categoria] →" */}
          <div className="mb-3 border-b border-slate-100 pb-2.5">
            <Link
              className="group flex items-center justify-between rounded-xl bg-slate-50/90 px-3.5 py-2.5 text-xs font-bold text-slate-900 transition hover:bg-blue-50 hover:text-[#004CB1]"
              href={config.allHref}
              onClick={onClose}
            >
              <span>{config.allLabel}</span>
              <ArrowRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#004CB1]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {/* Coluna 1 */}
            <div className="flex flex-col space-y-0.5">
              {col1.map((item) => (
                <Link
                  className="group/item flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#004CB1]"
                  href={item.href}
                  key={item.name}
                  onClick={onClose}
                >
                  <span className="truncate pr-2">{item.name}</span>
                  <div className="flex items-center gap-1">
                    {item.badge && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 uppercase">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="size-3.5 text-slate-300 transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-[#004CB1]" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Coluna 2 */}
            <div className="flex flex-col space-y-0.5">
              {col2.map((item) => (
                <Link
                  className="group/item flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#004CB1]"
                  href={item.href}
                  key={item.name}
                  onClick={onClose}
                >
                  <span className="truncate pr-2">{item.name}</span>
                  <div className="flex items-center gap-1">
                    {item.badge && (
                      <span className="rounded bg-red-100 px-1.5 py-0.2 text-[9px] font-bold text-[#E2091E] uppercase">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="size-3.5 text-slate-300 transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-[#004CB1]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          </div>

        {/* Coluna 3: Card Promocional com Foto no Topo Preenchendo toda a Largura */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition hover:shadow-md">
          {/* Foto no topo preenchendo toda a largura da seção com cantos arredondados no topo */}
          <div className="relative h-32 w-full overflow-hidden bg-slate-100">
            <Image
              alt={config.banner.title}
              className="object-cover transition-transform duration-500 hover:scale-105"
              fill
              sizes="260px"
              src={config.banner.imageUrl}
            />
          </div>

          {/* Conteúdo com espaçamento interno */}
          <div className="flex flex-1 flex-col justify-between p-3.5">
            <div>
              <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-[9.5px] font-extrabold tracking-wider text-[#004CB1] uppercase">
                {config.banner.tag}
              </span>

              <h4 className="mt-2 text-xs font-bold leading-tight text-slate-900">
                {config.banner.title}
              </h4>

              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                {config.banner.description}
              </p>
            </div>

            {/* Botão de Ação no Rodapé */}
            <Link
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#004CB1] px-3 py-2 text-center text-xs font-bold text-white shadow-sm transition hover:bg-[#00357B] active:scale-98"
              href={config.banner.ctaHref}
              onClick={onClose}
            >
              <span>{config.banner.ctaLabel}</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}