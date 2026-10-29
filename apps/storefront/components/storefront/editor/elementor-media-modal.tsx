"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Link as LinkIcon,
  Search,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

export interface MediaLibraryItem {
  id: string;
  name: string;
  category: string;
  url: string;
  sectionId?: string;
  sectionTitle?: string;
  slideLabel?: string;
  isIcon?: boolean;
}

export interface MediaSectionGroup {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  items: MediaLibraryItem[];
}

export const availableMediaSections: MediaSectionGroup[] = [
  {
    id: "s01-hero-full-width",
    title: "SEÇÃO S1 — TOPO HERO CARROSSEL (LARGURA TOTAL)",
    subtitle: "Banners panorâmicos de abertura da Home",
    badge: "Hero Full",
    items: [
      {
        id: "ref-s01-pizzaria",
        name: "Tudo para sua Pizzaria — Do Preparo à Entrega",
        category: "Topo Hero Full",
        url: "/assets/HOME Vitrine/S1-TOPO-HERO-largura-total/s1-topo (1).webp",
        sectionId: "s01-hero-full-width",
        sectionTitle: "S1 Topo Hero Largura Total",
        slideLabel: "Banner 1",
      },
      {
        id: "gemini-verao",
        name: "Embalagens para Delivery, Pizzarias e Restaurantes",
        category: "Topo Hero Full",
        url: "/assets/HOME Vitrine/S1-TOPO-HERO-largura-total/s1-topo (2).webp",
        sectionId: "s01-hero-full-width",
        sectionTitle: "S1 Topo Hero Largura Total",
        slideLabel: "Banner 2",
      },
      {
        id: "gemini-paratrigp",
        name: "Artigos para Festas, Confeitaria e Eventos",
        category: "Topo Hero Full",
        url: "/assets/HOME Vitrine/S1-TOPO-HERO-largura-total/s1-topo (3x).webp",
        sectionId: "s01-hero-full-width",
        sectionTitle: "S1 Topo Hero Largura Total",
        slideLabel: "Banner 3",
      },
      {
        id: "gemini-faltam3dias",
        name: "Descartáveis no Atacado — Fardos Fechados com Menor Preço",
        category: "Topo Hero Full",
        url: "/assets/HOME Vitrine/S1-TOPO-HERO-largura-total/s1-topo (4).webp",
        sectionId: "s01-hero-full-width",
        sectionTitle: "S1 Topo Hero Largura Total",
        slideLabel: "Banner 4",
      },
      {
        id: "gemini-fachada",
        name: "Limpeza Profissional e Higienização Comercial",
        category: "Topo Hero Full",
        url: "/assets/HOME Vitrine/S1-TOPO-HERO-largura-total/s1-topo (5).webp",
        sectionId: "s01-hero-full-width",
        sectionTitle: "S1 Topo Hero Largura Total",
        slideLabel: "Banner 5",
      },
      {
        id: "ml-intelbras",
        name: "Semana Intelbras no seu ritmo (Verde ML)",
        category: "Topo Mercado Livre",
        url: "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_nmv06jnmv06jnmv0.jpg",
        sectionId: "s01-hero-full-width",
        sectionTitle: "S1 Topo Hero Largura Total",
        slideLabel: "Banner Extra 1",
      },
      {
        id: "ml-super-ofertas",
        name: "Super Ofertas Comercial do Norte (Azul ML)",
        category: "Topo Mercado Livre",
        url: "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_m54tnlm54tnlm54t.jpg",
        sectionId: "s01-hero-full-width",
        sectionTitle: "S1 Topo Hero Largura Total",
        slideLabel: "Banner Extra 2",
      },
      {
        id: "gemini-copo",
        name: "Super Oferta Copo Descartável Cristalcopo",
        category: "Campanhas",
        url: "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_x5pilwx5pilwx5pi.jpg",
        sectionId: "s01-hero-full-width",
        sectionTitle: "S1 Topo Hero Largura Total",
        slideLabel: "Banner Extra 3",
      },
      {
        id: "gemini-outlet",
        name: "Mega Descontos e Outlet das Embalagens",
        category: "Campanhas",
        url: "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_k46c0pk46c0pk46c.jpg",
        sectionId: "s01-hero-full-width",
        sectionTitle: "S1 Topo Hero Largura Total",
        slideLabel: "Banner Extra 4",
      },
    ],
  },
  {
    id: "s02-contained-hero",
    title: "SEÇÃO S2 — TOPO HERO CARROSSEL CONTIDO (PADRÃO)",
    subtitle: "Banners no grid central com cantos arredondados",
    badge: "Hero Contido",
    items: [
      {
        id: "ref-s02-feirante",
        name: "Semana do Feirante — Copo Descartável 180ml Cristalcopo",
        category: "Referência Oficial",
        url: "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_k93f3kk93f3kk93f.jpg",
        sectionId: "s02-contained-hero",
        sectionTitle: "S2 Hero Contido Padrão",
        slideLabel: "Slide 1",
      },
      {
        id: "contained-slide-2",
        name: "Ofertas de Atacado em Sacolas e Descartáveis",
        category: "Topo Mercado Livre",
        url: "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_m54tnlm54tnlm54t.jpg",
        sectionId: "s02-contained-hero",
        sectionTitle: "S2 Hero Contido Padrão",
        slideLabel: "Slide 2",
      },
      {
        id: "contained-slide-3",
        name: "Linha Kraft & Embalagens Sustentáveis para Delivery",
        category: "Topo Mercado Livre",
        url: "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_nmv06jnmv06jnmv0.jpg",
        sectionId: "s02-contained-hero",
        sectionTitle: "S2 Hero Contido Padrão",
        slideLabel: "Slide 3",
      },
      {
        id: "contained-slide-4",
        name: "Embalagens Térmicas para Marmitex e Lanches",
        category: "Referência Oficial",
        url: "/assets/HOME Vitrine/S4-CARD-ESQ-Promocional/S4-CARD-ESQ-Promocional.webp",
        sectionId: "s02-contained-hero",
        sectionTitle: "S2 Hero Contido Padrão",
        slideLabel: "Slide 4",
      },
    ],
  },
  {
    id: "s03-category-icons",
    title: "SEÇÃO S3 — ÍCONES DE CATEGORIAS E DEPARTAMENTOS",
    subtitle: "Atalhos circulares e cards de departamentos rápidos",
    badge: "Ícones",
    items: [
            {
        id: "3d-icon-ofertas",
        name: "3D — Ofertas do Dia",
        category: "Ícones 3D Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/3d/01-ofertas-do-dia.png",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Ícone 1",
        isIcon: true,
      },
      {
        id: "3d-icon-embalagens",
        name: "3D — Embalagens",
        category: "Ícones 3D Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/3d/02-embalagens.png",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Ícone 2",
        isIcon: true,
      },
      {
        id: "3d-icon-descartaveis",
        name: "3D — Descartáveis",
        category: "Ícones 3D Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/3d/03-descartaveis.png",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Ícone 3",
        isIcon: true,
      },
      {
        id: "3d-icon-artigos-festa",
        name: "3D — Artigos para Festa",
        category: "Ícones 3D Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/3d/04-artigos-para-festa.png",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Ícone 4",
        isIcon: true,
      },
      {
        id: "3d-icon-confeitaria",
        name: "3D — Doces e Confeitaria",
        category: "Ícones 3D Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/3d/05-doces-e-confeitaria.png",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Ícone 5",
        isIcon: true,
      },
      {
        id: "3d-icon-limpeza",
        name: "3D — Limpeza Profissional",
        category: "Ícones 3D Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/3d/06-limpeza-profissional.png",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Ícone 6",
        isIcon: true,
      },
      {
        id: "3d-icon-mais-vendidos",
        name: "3D — Mais Vendidos",
        category: "Ícones 3D Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/3d/07-mais-vendidos.png",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Ícone 7",
        isIcon: true,
      },
      {
        id: "cat-icon-embalagens",
        name: "Ícone — Embalagens",
        category: "Ícones de Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-embalagens.jpg",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Cat 1",
        isIcon: true,
      },
      {
        id: "cat-icon-descartaveis",
        name: "Ícone — Descartáveis",
        category: "Ícones de Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-descartaveis.jpg",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Cat 2",
        isIcon: true,
      },
      {
        id: "cat-icon-limpeza",
        name: "Ícone — Limpeza Profissional",
        category: "Ícones de Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-limpeza.jpg",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Cat 3",
        isIcon: true,
      },
      {
        id: "cat-icon-sacolas",
        name: "Ícone — Sacos e Sacolas",
        category: "Ícones de Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-sacolas.jpg",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Cat 4",
        isIcon: true,
      },
      {
        id: "cat-icon-festas",
        name: "Ícone — Festas & Eventos",
        category: "Ícones de Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-festas.jpg",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Cat 5",
        isIcon: true,
      },
      {
        id: "cat-icon-confeitaria",
        name: "Ícone — Confeitaria",
        category: "Ícones de Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-confeitaria.jpg",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Cat 6",
        isIcon: true,
      },
      {
        id: "cat-icon-foodservice",
        name: "Ícone — Food Service",
        category: "Ícones de Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-foodservice.jpg",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Cat 7",
        isIcon: true,
      },
      {
        id: "cat-icon-ofertas",
        name: "Ícone — Ofertas de Atacado",
        category: "Ícones de Categorias",
        url: "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-ofertas.jpg",
        sectionId: "s03-category-icons",
        sectionTitle: "S3 Ícones Categorias",
        slideLabel: "Cat 8",
        isIcon: true,
      },
    ],
  },
  {
    id: "s04-s05-banners-triplos",
    title: "SEÇÃO S4 / S5 — BANNERS TRIPLOS PROMOCIONAIS & FEIRANTE",
    subtitle: "Grades triplas de campanhas e ofertas promocionais",
    badge: "Banners Triplos",
    items: [
      {
        id: "ref-s04-side",
        name: "Banner Vertical — Semana do Feirante Luva Nitrílica",
        category: "Referência Oficial",
        url: "/assets/HOME Vitrine/S4-CARD-ESQ-Promocional/S4-CARD-ESQ-Promocional.webp",
        sectionId: "s04-s05-banners-triplos",
        sectionTitle: "S4/S5 Banners Triplos",
        slideLabel: "Banner Lateral",
      },
      {
        id: "ref-s05-limpeza",
        name: "Banner Triplo — Produtos de Limpeza até 30% OFF",
        category: "Banners Triplos",
        url: "/assets/HOME Vitrine/S5-MINICARDS-Carrossel/1-mini-card-azul.png.webp",
        sectionId: "s04-s05-banners-triplos",
        sectionTitle: "S4/S5 Banners Triplos",
        slideLabel: "Banner 1",
      },
      {
        id: "ref-s05-feirante",
        name: "Banner Triplo — Semana do Feirante Luva Nitrílica",
        category: "Banners Triplos",
        url: "/assets/HOME Vitrine/S5-MINICARDS-Carrossel/2-mini-card-red.png.webp",
        sectionId: "s04-s05-banners-triplos",
        sectionTitle: "S4/S5 Banners Triplos",
        slideLabel: "Banner 2",
      },
      {
        id: "ref-s05-sacolas",
        name: "Banner Triplo — Sacos e Sacolas até 25% OFF",
        category: "Banners Triplos",
        url: "/assets/HOME Vitrine/S5-MINICARDS-Carrossel/3-mini-card-azul-.png.webp",
        sectionId: "s04-s05-banners-triplos",
        sectionTitle: "S4/S5 Banners Triplos",
        slideLabel: "Banner 3",
      },
      {
        id: "ref-s05-confeitaria",
        name: "Banner Triplo — Confeitaria e Doces até 20% OFF",
        category: "Banners Triplos",
        url: "/assets/HOME Vitrine/S5-MINICARDS-Carrossel/4-mini-card-azul.png.webp",
        sectionId: "s04-s05-banners-triplos",
        sectionTitle: "S4/S5 Banners Triplos",
        slideLabel: "Banner 4",
      },
    ],
  },
  {
    id: "s07-s09-institucionais",
    title: "SEÇÃO S7 / S9 — FAIXAS & BANNERS INSTITUCIONAIS",
    subtitle: "Banners informativos de cotação e condições especiais",
    badge: "Institucional",
    items: [
      {
        id: "s07-cotacao",
        name: "Faixa S7 — Como funciona a cotação online",
        category: "Institucional",
        url: "/assets/HOME Vitrine/S7-BANNER-Cotacao/S7-BANNER-Cotacao.webp",
        sectionId: "s07-s09-institucionais",
        sectionTitle: "Faixas Institucionais",
        slideLabel: "Faixa S7",
      },
      {
        id: "s09-ofertas",
        name: "Faixa S9 — Ofertas Imperdíveis em Embalagens",
        category: "Institucional",
        url: "/assets/HOME Vitrine/S9-BANNERZINHO-Promo/S9-BANNERZINHO-Promo.webp",
        sectionId: "s07-s09-institucionais",
        sectionTitle: "Faixas Institucionais",
        slideLabel: "Faixa S9",
      },
    ],
  },
  {
    id: "s08-segmentos-negocios",
    title: "SEÇÃO S8 — SEGMENTOS DE NEGÓCIOS (TUDO PARA SEU RAMO)",
    subtitle: "Carrossel de ramos de atividade comercial e estabelecimentos",
    badge: "Segmentos",
    items: [
      {
        id: "ref-s08-lanchonete",
        name: "Segmento 1 — Para Lanchonete",
        category: "Segmentos",
        url: "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-01-lanchonete.jpg",
        sectionId: "s08-segmentos-negocios",
        sectionTitle: "S8 Segmentos",
        slideLabel: "Ramo 1",
      },
      {
        id: "ref-s08-pizzaria",
        name: "Segmento 2 — Para Pizzaria",
        category: "Segmentos",
        url: "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-02-pizzaria.jpg",
        sectionId: "s08-segmentos-negocios",
        sectionTitle: "S8 Segmentos",
        slideLabel: "Ramo 2",
      },
      {
        id: "ref-s08-padaria",
        name: "Segmento 3 — Para Padaria",
        category: "Segmentos",
        url: "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-03-padaria.jpg",
        sectionId: "s08-segmentos-negocios",
        sectionTitle: "S8 Segmentos",
        slideLabel: "Ramo 3",
      },
      {
        id: "ref-s08-festas",
        name: "Segmento 4 — Para Loja de Festas",
        category: "Segmentos",
        url: "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-04-festas.jpg",
        sectionId: "s08-segmentos-negocios",
        sectionTitle: "S8 Segmentos",
        slideLabel: "Ramo 4",
      },
      {
        id: "ref-s08-delivery",
        name: "Segmento 5 — Para Delivery",
        category: "Segmentos",
        url: "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-09-delivery.jpg",
        sectionId: "s08-segmentos-negocios",
        sectionTitle: "S8 Segmentos",
        slideLabel: "Ramo 5",
      },
      {
        id: "ref-s08-buffet",
        name: "Segmento 6 — Para Restaurante & Buffet",
        category: "Segmentos",
        url: "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-05-buffet.jpg",
        sectionId: "s08-segmentos-negocios",
        sectionTitle: "S8 Segmentos",
        slideLabel: "Ramo 6",
      },
      {
        id: "ref-s08-confeitaria",
        name: "Segmento 7 — Para Confeitaria & Bolos",
        category: "Segmentos",
        url: "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-06-confeitaria.jpg",
        sectionId: "s08-segmentos-negocios",
        sectionTitle: "S8 Segmentos",
        slideLabel: "Ramo 7",
      },
      {
        id: "ref-s08-sorveteria",
        name: "Segmento 8 — Para Sorveteria & Açaí",
        category: "Segmentos",
        url: "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-07-acai.jpg",
        sectionId: "s08-segmentos-negocios",
        sectionTitle: "S8 Segmentos",
        slideLabel: "Ramo 8",
      },
      {
        id: "ref-s08-bar",
        name: "Segmento 9 — Para Bar & Distribuidora",
        category: "Segmentos",
        url: "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-08-sustentaveis.jpg",
        sectionId: "s08-segmentos-negocios",
        sectionTitle: "S8 Segmentos",
        slideLabel: "Ramo 9",
      },
    ],
  },
  {
    id: "s11-triple-banners-2",
    title: "SEÇÃO S11 — BANNERS TRIPLOS DE OFERTAS & PREÇOS",
    subtitle: "Hamburgueiras, luvas nitrílicas e descartáveis de alta saída",
    badge: "Preço & Oferta",
    items: [
      {
        id: "ref-s11-hamburgueira",
        name: "Oferta 1 — Hamburgueira Isopor R$ 85,95",
        category: "Banners Triplos",
        url: "/assets/HOME Vitrine/S11-MINICARDS-Carrossel/5-mini-ard-azul.png.webp",
        sectionId: "s11-triple-banners-2",
        sectionTitle: "S11 Ofertas e Preços",
        slideLabel: "Oferta 1",
      },
      {
        id: "ref-s11-luva-vermelho",
        name: "Oferta 2 — Luva Nitrílica Vermelho R$ 27,10",
        category: "Banners Triplos",
        url: "/assets/HOME Vitrine/S11-MINICARDS-Carrossel/6-mini-card-red.png.webp",
        sectionId: "s11-triple-banners-2",
        sectionTitle: "S11 Ofertas e Preços",
        slideLabel: "Oferta 2",
      },
      {
        id: "ref-s11-luva-azul",
        name: "Oferta 3 — Luva Nitrílica Azul R$ 27,10",
        category: "Banners Triplos",
        url: "/assets/HOME Vitrine/S11-MINICARDS-Carrossel/7-mini-card-azul.png.webp",
        sectionId: "s11-triple-banners-2",
        sectionTitle: "S11 Ofertas e Preços",
        slideLabel: "Oferta 3",
      },
    ],
  },
  {
    id: "s12-nossos-eventos",
    title: "SEÇÃO S12 — NOSSOS EVENTOS & WORKSHOPS",
    subtitle: "Encontros de empreendedores, workshops e inaugurações",
    badge: "Eventos",
    items: [
      {
        id: "ref-s12-ev1",
        name: "Evento 1 — Encontro James Holanda Empreendedores",
        category: "Eventos",
        url: "/assets/HOME Vitrine/S12-EVENTOS/s12-event-01-empreendedores.jpg",
        sectionId: "s12-nossos-eventos",
        sectionTitle: "S12 Eventos",
        slideLabel: "Evento 1",
      },
      {
        id: "ref-s12-ev2",
        name: "Evento 2 — Grande Reinauguração Loja Pedreira",
        category: "Eventos",
        url: "/assets/HOME Vitrine/S12-EVENTOS/s12-event-02-reinauguracao.jpg",
        sectionId: "s12-nossos-eventos",
        sectionTitle: "S12 Eventos",
        slideLabel: "Evento 2",
      },
      {
        id: "ref-s12-ev3",
        name: "Evento 3 — Workshop de Confeitaria Profissional",
        category: "Eventos",
        url: "/assets/HOME Vitrine/S12-EVENTOS/s12-event-03-workshop-confeitaria.jpg",
        sectionId: "s12-nossos-eventos",
        sectionTitle: "S12 Eventos",
        slideLabel: "Evento 3",
      },
      {
        id: "ref-s12-ev4",
        name: "Evento 4 — Sábado Croquete de Charque Pará Trigo",
        category: "Eventos",
        url: "/assets/HOME Vitrine/S12-EVENTOS/s12-event-04-croquete.jpg",
        sectionId: "s12-nossos-eventos",
        sectionTitle: "S12 Eventos",
        slideLabel: "Evento 4",
      },
      {
        id: "ref-s12-top-thumb",
        name: "Evento Topo — Banner Superior Palco",
        category: "Eventos",
        url: "/assets/HOME Vitrine/S12-EVENTOS/s12-event-top-thumb.jpg",
        sectionId: "s12-nossos-eventos",
        sectionTitle: "S12 Eventos",
        slideLabel: "Banner Palco",
      },
    ],
  },
  {
    id: "s16-instagram-feed",
    title: "SEÇÃO S15/S16 — A LOJA NO INSTAGRAM",
    subtitle: "Bastidores, lançamentos e ações especiais",
    badge: "Instagram",
    items: [
      {
        id: "ref-s16-ig1",
        name: "Instagram 1 — Dia do Cliente",
        category: "Instagram",
        url: "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-01-dia-cliente.jpg",
        sectionId: "s16-instagram-feed",
        sectionTitle: "S16 Instagram",
        slideLabel: "Card 1",
      },
      {
        id: "ref-s16-ig2",
        name: "Instagram 2 — No Balcão",
        category: "Instagram",
        url: "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-02-no-balcao.jpg",
        sectionId: "s16-instagram-feed",
        sectionTitle: "S16 Instagram",
        slideLabel: "Card 2",
      },
      {
        id: "ref-s16-ig3",
        name: "Instagram 3 — 14 Anos de Loja",
        category: "Instagram",
        url: "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-03-14-anos.jpg",
        sectionId: "s16-instagram-feed",
        sectionTitle: "S16 Instagram",
        slideLabel: "Card 3",
      },
      {
        id: "ref-s16-ig4",
        name: "Instagram 4 — Nossa Equipe",
        category: "Instagram",
        url: "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-04-equipe.jpg",
        sectionId: "s16-instagram-feed",
        sectionTitle: "S16 Instagram",
        slideLabel: "Card 4",
      },
      {
        id: "ref-s16-ig5",
        name: "Instagram 5 — Promoções",
        category: "Instagram",
        url: "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-05-promocoes.jpg",
        sectionId: "s16-instagram-feed",
        sectionTitle: "S16 Instagram",
        slideLabel: "Card 5",
      },
      {
        id: "ref-s16-ig6",
        name: "Instagram 6 — Vale-Compras",
        category: "Instagram",
        url: "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-06-vale-compras.jpg",
        sectionId: "s16-instagram-feed",
        sectionTitle: "S16 Instagram",
        slideLabel: "Card 6",
      },
    ],
  },
  {
    id: "branding-mascote",
    title: "BRANDING, FACHADA & MASCOTE 3D JAMES",
    subtitle: "Identidade visual, fachada de lojas e o mascote oficial",
    badge: "Branding",
    items: [
      {
        id: "mascote-james",
        name: "Mascote 3D James Principal Oficial",
        category: "Mascote",
        url: "/assets/HOME Vitrine/S0-HEADER/Mascote-3D-NORT/principais/nort-01-principal.png",
        sectionId: "branding-mascote",
        sectionTitle: "Branding & Identidade",
        slideLabel: "Mascote 3D",
        isIcon: true,
      },
      {
        id: "logo-branca",
        name: "Logo Oficial Comercial do Norte Branca",
        category: "Branding",
        url: "/logo-comercial-do-norte-branca.png",
        sectionId: "branding-mascote",
        sectionTitle: "Branding & Identidade",
        slideLabel: "Logo Branca",
        isIcon: true,
      },
      {
        id: "gemini-fachada-brand",
        name: "Fachada Comercial do Norte — Tudo para quem faz o melhor",
        category: "Institucional",
        url: "/assets/HOME Vitrine/S1-TOPO-HERO-largura-total/s1-topo (5).webp",
        sectionId: "branding-mascote",
        sectionTitle: "Branding & Identidade",
        slideLabel: "Fachada",
      },
    ],
  },
];

// Gera a lista unificada flat preservando retrocompatibilidade total
export const availableMediaLibrary: MediaLibraryItem[] = Array.from(
  new Map(
    availableMediaSections
      .flatMap((s) => s.items)
      .map((item) => [item.url, item]),
  ).values(),
);

interface ElementorMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, altText?: string) => void;
  currentImageUrl?: string;
  slideTitle?: string;
  title?: string;
}

export function ElementorMediaModal({
  isOpen,
  onClose,
  onSelectImage,
  currentImageUrl,
  slideTitle,
  title = "Selecionar ou Enviar Imagem do Banner",
}: ElementorMediaModalProps) {
  // A PRIMEIRA ABA É O UPLOAD conforme pedido do usuário!
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
  const [viewMode, setViewMode] = useState<"sections" | "all">("sections");
  const [sortOrder, setSortOrder] = useState<"recent" | "name">("recent");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [selectedUrl, setSelectedUrl] = useState<string>(
    currentImageUrl || availableMediaLibrary[0]?.url || "",
  );
  const [search, setSearch] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Upload e URL Externa states
  const [uploadedFile, setUploadedFile] = useState<{
    dataUrl: string;
    name: string;
    sizeFormatted: string;
  } | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [selectedSource, setSelectedSource] = useState<"file" | "url" | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);

  // Sanfona / Accordion das seções (expand/collapse)
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    "s01-hero-full-width": true,
    "s02-contained-hero": true,
    "s04-s05-banners-triplos": true,
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  // Reset states ao abrir ou fechar
  useEffect(() => {
    if (isOpen && currentImageUrl) {
      setSelectedUrl(currentImageUrl);
    }
  }, [isOpen, currentImageUrl]);

  // Suporte a colar imagem via clipboard (Ctrl+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            loadFile(file);
            setActiveTab("upload");
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const loadFile = (file: File) => {
    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeFormatted =
      file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setUploadedFile({
          dataUrl: result,
          name: file.name,
          sizeFormatted,
        });
        setSelectedSource("file");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      loadFile(file);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const expandAllSections = () => {
    const next: Record<string, boolean> = {};
    availableMediaSections.forEach((s) => {
      next[s.id] = true;
    });
    setExpandedSections(next);
  };

  const collapseAllSections = () => {
    const next: Record<string, boolean> = {};
    availableMediaSections.forEach((s) => {
      next[s.id] = false;
    });
    setExpandedSections(next);
  };

  // Filtros de busca
  const cleanSearch = search.trim().toLowerCase();

  const filteredSections = availableMediaSections
    .map((section) => {
      const matchesSection =
        section.title.toLowerCase().includes(cleanSearch) ||
        section.subtitle.toLowerCase().includes(cleanSearch);

      const filteredItems = section.items.filter((item) => {
        if (!cleanSearch) return true;
        return (
          item.name.toLowerCase().includes(cleanSearch) ||
          item.category.toLowerCase().includes(cleanSearch) ||
          item.slideLabel?.toLowerCase().includes(cleanSearch) ||
          matchesSection
        );
      });

      return {
        ...section,
        items: filteredItems,
      };
    })
    .filter((section) => section.items.length > 0);

  // Lista plana para a visualização "Todas as Imagens"
  const flatItems = availableMediaLibrary
    .filter((item) => {
      if (selectedCategory !== "Todas" && item.category !== selectedCategory) {
        return false;
      }
      if (!cleanSearch) return true;
      return (
        item.name.toLowerCase().includes(cleanSearch) ||
        item.category.toLowerCase().includes(cleanSearch) ||
        item.sectionTitle?.toLowerCase().includes(cleanSearch) ||
        item.slideLabel?.toLowerCase().includes(cleanSearch)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0; // ordem original (data/id crescente)
    });

  // Categorias únicas para as pílulas de filtro
  const categoriesList = [
    "Todas",
    ...Array.from(new Set(availableMediaLibrary.map((m) => m.category))),
  ];

  // Item selecionado atual na biblioteca
  const selectedItem =
    availableMediaLibrary.find((m) => m.url === selectedUrl) ||
    availableMediaSections
      .flatMap((s) => s.items)
      .find((m) => m.url === selectedUrl);

  const handleConfirm = () => {
    if (activeTab === "upload") {
      if (selectedSource === "file" && uploadedFile) {
        onSelectImage(uploadedFile.dataUrl, uploadedFile.name);
        onClose();
        return;
      }
      if (selectedSource === "url" && customUrl.trim()) {
        onSelectImage(customUrl.trim(), "Imagem Externa");
        onClose();
        return;
      }
      if (uploadedFile) {
        onSelectImage(uploadedFile.dataUrl, uploadedFile.name);
        onClose();
        return;
      }
      if (customUrl.trim()) {
        onSelectImage(customUrl.trim(), "Imagem Externa");
        onClose();
        return;
      }
    } else if (activeTab === "library" && selectedUrl) {
      onSelectImage(selectedUrl, selectedItem?.name);
      onClose();
    }
  };

  const handleCopyUrl = (urlToCopy: string) => {
    if (!urlToCopy) return;
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Verifica se o botão confirmar está habilitado
  const isConfirmDisabled =
    activeTab === "upload" ? !uploadedFile && !customUrl.trim() : !selectedUrl;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          accept="image/*"
          className="hidden"
          id={fileInputId}
          onChange={handleFileChange}
          ref={fileRef}
          type="file"
        />

        {/* 1. CABEÇALHO SHADCN DARK MODE */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-800/80 bg-zinc-950 px-5 sm:px-6 select-none shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-sky-400 font-bold text-xs shadow-xs">
              <ImageIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white">
                {title}
              </h2>
              <span className="text-[10px] text-zinc-400 block sm:hidden">
                Toque para selecionar ou carregar
              </span>
            </div>
          </div>

          <button
            aria-label="Fechar"
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
            onClick={onClose}
            type="button"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* 2. BARRA DE ABAS: PRIMEIRA ABA É O UPLOAD CONFORME O USUÁRIO PEDIU */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-900/40 px-4 sm:px-6 text-xs font-medium select-none shrink-0">
          {/* ABA 1: FAZER UPLOAD (COM URL EXTERNA INTEGRADA EMBAIXO) */}
          <button
            className={`flex items-center gap-2 border-b-2 py-3 px-4 cursor-pointer transition ${
              activeTab === "upload"
                ? "border-emerald-400 text-white font-semibold bg-emerald-500/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
            onClick={() => setActiveTab("upload")}
            type="button"
          >
            <UploadCloud className="size-4 text-emerald-400" />
            <span>Fazer Upload / Enviar Imagem</span>
            {(uploadedFile || customUrl.trim()) && (
              <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* ABA 2: BIBLIOTECA DA LOJA (COM SANFONA POR SEÇÕES E THUMBS CORRIGIDAS) */}
          <button
            className={`flex items-center gap-2 border-b-2 py-3 px-4 cursor-pointer transition ${
              activeTab === "library"
                ? "border-sky-400 text-white font-semibold bg-sky-500/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
            onClick={() => setActiveTab("library")}
            type="button"
          >
            <FolderOpen className="size-4 text-sky-400" />
            <span>Biblioteca da Loja ({availableMediaLibrary.length})</span>
          </button>
        </div>

        {/* 3. ITEM ATUAL SENDO ALTERADO PREVIEW BAR */}
        {(slideTitle || currentImageUrl) && (
          <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/20 px-5 sm:px-6 py-2.5 text-xs shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {currentImageUrl ? (
                <div className="size-8 shrink-0 overflow-hidden rounded-md border border-zinc-800 bg-black">
                  {/* eslint-disable-next-js/next/no-img-element */}
                  <img
                    alt={slideTitle || ""}
                    className="size-full object-cover"
                    src={currentImageUrl}
                  />
                </div>
              ) : null}
              <span className="truncate text-zinc-400">
                Item atual sendo alterado:{" "}
                <strong className="text-white">
                  {slideTitle || "Slide do Banner"}
                </strong>
              </span>
            </div>
            {currentImageUrl ? (
              <span className="text-[11px] text-zinc-500 hidden md:inline shrink-0">
                A nova imagem selecionada substituirá este item
              </span>
            ) : null}
          </div>
        )}

        {/* 4. CORPO DO MODAL */}
        <div className="flex flex-1 overflow-hidden">
          {/* ============================================================== */}
          {/* ABA 1: UPLOAD DO COMPUTADOR + URL EXTERNA LOGO ABAIXO           */}
          {/* ============================================================== */}
          {activeTab === "upload" && (
            <div className="flex flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
                {/* 1. Upload do Computador */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                      <UploadCloud className="size-4 text-emerald-400" />
                      Fazer Upload do Computador
                    </label>
                    <span className="text-[11px] text-zinc-500">
                      PNG, JPG, WebP, GIF ou SVG
                    </span>
                  </div>

                  {!uploadedFile ? (
                    <div
                      className={`group flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition select-none ${
                        isDragging
                          ? "border-emerald-400 bg-emerald-950/20"
                          : "border-zinc-700 bg-zinc-900/30 hover:border-emerald-400/80 hover:bg-zinc-900/60"
                      }`}
                      onClick={() => fileRef.current?.click()}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-emerald-400 mb-3 shadow-md group-hover:scale-105 transition-transform">
                        <UploadCloud className="size-7" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">
                        {isDragging
                          ? "Solte a imagem aqui..."
                          : "Arraste e solte uma imagem aqui"}
                      </h3>
                      <p className="text-xs text-zinc-400 text-center mb-4">
                        ou clique no botão para procurar no seu computador
                      </p>
                      <button
                        className="rounded-xl bg-white px-5 py-2 text-xs font-bold text-zinc-950 shadow-md hover:bg-zinc-200 transition cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileRef.current?.click();
                        }}
                        type="button"
                      >
                        Escolher Arquivo do Computador
                      </button>
                      <span className="mt-3 text-[11px] text-zinc-500">
                        Também aceita colar diretamente com{" "}
                        <kbd className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-300">
                          Ctrl+V
                        </kbd>
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col rounded-2xl border border-emerald-500/40 bg-emerald-950/15 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-sm">
                            <Check className="size-3.5 stroke-[3]" />
                          </div>
                          <span className="text-xs font-semibold text-emerald-400">
                            Arquivo do computador pronto para inserir
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="text-xs font-medium text-sky-400 hover:underline cursor-pointer"
                            onClick={() => fileRef.current?.click()}
                            type="button"
                          >
                            Trocar arquivo
                          </button>
                          <span className="text-zinc-600">•</span>
                          <button
                            className="text-xs font-medium text-rose-400 hover:underline cursor-pointer"
                            onClick={() => {
                              setUploadedFile(null);
                              if (selectedSource === "file")
                                setSelectedSource(null);
                            }}
                            type="button"
                          >
                            Remover
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative aspect-video w-full sm:w-52 min-h-[96px] overflow-hidden rounded-xl border border-zinc-800 bg-black shrink-0">
                          {/* eslint-disable-next-js/next/no-img-element */}
                          <img
                            alt="Pré-visualização do upload"
                            className="absolute inset-0 size-full object-contain"
                            src={uploadedFile.dataUrl}
                          />
                        </div>
                        <div className="flex flex-col gap-1 text-xs text-zinc-300 w-full min-w-0">
                          <span className="font-semibold text-white truncate">
                            {uploadedFile.name}
                          </span>
                          <span className="text-zinc-400 text-[11px]">
                            Tamanho: {uploadedFile.sizeFormatted}
                          </span>
                          <span className="text-emerald-400 text-[11px] font-medium">
                            ✓ Carregado com sucesso
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divisor Elegante "OU" */}
                <div className="relative flex items-center justify-center py-1">
                  <div className="w-full border-t border-zinc-800" />
                  <span className="absolute bg-zinc-950 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    ou insira via link direto (URL Externa)
                  </span>
                </div>

                {/* 2. URL Externa da Imagem (Embaixo do upload conforme pedido) */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                      <LinkIcon className="size-4 text-sky-400" />
                      URL Externa da Imagem (Web)
                    </label>
                    <span className="text-[11px] text-zinc-500">
                      Cole o link direto da imagem
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 focus-within:border-sky-400 transition">
                    <LinkIcon className="size-4 shrink-0 text-zinc-400" />
                    <input
                      className="w-full bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
                      onChange={(e) => {
                        setCustomUrl(e.target.value);
                        if (e.target.value.trim()) setSelectedSource("url");
                      }}
                      placeholder="https://suaimagem.com/banner-promocional.jpg"
                      type="url"
                      value={customUrl}
                    />
                    {customUrl && (
                      <button
                        className="text-zinc-500 hover:text-white text-xs cursor-pointer"
                        onClick={() => {
                          setCustomUrl("");
                          if (selectedSource === "url") setSelectedSource(null);
                        }}
                        type="button"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>

                  {/* Live URL Preview */}
                  {customUrl.trim() && (
                    <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-300">
                          Pré-visualização da Imagem por Link:
                        </span>
                        <span className="text-[11px] text-sky-400 font-medium">
                          URL Externa Ativa
                        </span>
                      </div>
                      <div className="relative aspect-video max-w-md min-h-[100px] overflow-hidden rounded-xl border border-zinc-800 bg-black">
                        {/* eslint-disable-next-js/next/no-img-element */}
                        <img
                          alt="Pré-visualização da URL"
                          className="absolute inset-0 size-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const parent = e.currentTarget.parentElement;
                            if (
                              parent &&
                              !parent.querySelector(".url-error-badge")
                            ) {
                              const badge = document.createElement("div");
                              badge.className =
                                "url-error-badge flex h-full w-full flex-col items-center justify-center p-4 text-center text-xs text-rose-400";
                              badge.innerHTML =
                                '<span class="font-bold mb-1">Aviso: Imagem não encontrada</span><span>Verifique se o link é público e direto.</span>';
                              parent.appendChild(badge);
                            }
                          }}
                          src={customUrl.trim()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 2: BIBLIOTECA DA LOJA (COM SANFONA DE SEÇÕES E THUMBS FIXAS) */}
          {/* ============================================================== */}
          {activeTab === "library" && (
            <>
              <div className="flex flex-1 flex-col overflow-hidden p-4 sm:p-6">
                {/* BARRA SUPERIOR DE BUSCA E VISÕES */}
                <div className="mb-4 flex flex-col gap-3 shrink-0">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Campo de Busca */}
                    <div className="flex flex-1 items-center gap-2 rounded-xl bg-zinc-900/80 px-3.5 py-2.5 border border-zinc-800 focus-within:border-sky-400 transition">
                      <Search className="size-4 shrink-0 text-zinc-400" />
                      <input
                        className="w-full bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nome, seção (S1, S2...) ou categoria..."
                        type="text"
                        value={search}
                      />
                      {search && (
                        <button
                          className="text-zinc-500 hover:text-white text-xs cursor-pointer"
                          onClick={() => setSearch("")}
                          type="button"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    {/* Alternador de Visões: Sanfona por Seções vs Grade Completa */}
                    <div className="flex items-center gap-1 self-end sm:self-auto rounded-xl bg-zinc-900/90 p-1 border border-zinc-800 select-none text-xs">
                      <button
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                          viewMode === "sections"
                            ? "bg-sky-500 text-zinc-950 font-bold shadow-xs"
                            : "text-zinc-400 hover:text-white"
                        }`}
                        onClick={() => setViewMode("sections")}
                        title="Ver organizado por seções da Home com sanfona"
                        type="button"
                      >
                        <Layers className="size-3.5" />
                        <span>Por Seção (Sanfona)</span>
                      </button>

                      <button
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                          viewMode === "all"
                            ? "bg-sky-500 text-zinc-950 font-bold shadow-xs"
                            : "text-zinc-400 hover:text-white"
                        }`}
                        onClick={() => setViewMode("all")}
                        title="Ver todas as imagens em grade corrida"
                        type="button"
                      >
                        <LayoutGrid className="size-3.5" />
                        <span>Todas as Imagens</span>
                      </button>
                    </div>
                  </div>

                  {/* Controles contextuais da visão */}
                  {viewMode === "sections" ? (
                    <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/60 pb-2">
                      <span className="text-[11px] text-zinc-400">
                        {filteredSections.length} seções encontradas na Home
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          className="text-[11px] text-sky-400 hover:underline cursor-pointer"
                          onClick={expandAllSections}
                          type="button"
                        >
                          Expandir todas
                        </button>
                        <span className="text-zinc-700">|</span>
                        <button
                          className="text-[11px] text-zinc-400 hover:underline cursor-pointer"
                          onClick={collapseAllSections}
                          type="button"
                        >
                          Recolher todas
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-2">
                      {/* Pílulas de Categoria */}
                      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-[11px]">
                        {categoriesList.slice(0, 7).map((cat) => (
                          <button
                            className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                              selectedCategory === cat
                                ? "bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40"
                                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                            }`}
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            type="button"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Ordenação */}
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <span>Ordenar:</span>
                        <select
                          className="rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1 text-white outline-none cursor-pointer"
                          onChange={(e) =>
                            setSortOrder(e.target.value as "recent" | "name")
                          }
                          value={sortOrder}
                        >
                          <option value="recent">Data / Ordem padrão</option>
                          <option value="name">Nome (A - Z)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* CONTEÚDO SCROLLÁVEL DA BIBLIOTECA */}
                <div className="flex-1 overflow-y-auto pr-1">
                  {/* VISÃO 1: SANFONA POR SEÇÕES (PEDIDO DO USUÁRIO) */}
                  {viewMode === "sections" && (
                    <div className="flex flex-col gap-3 pb-6">
                      {filteredSections.map((section) => {
                        const isExpanded = !!expandedSections[section.id];

                        return (
                          <div
                            className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30 transition shadow-xs"
                            key={section.id}
                          >
                            {/* CABEÇALHO DA SANFONA COM "V" RETRÁTIL */}
                            <button
                              aria-expanded={isExpanded}
                              className="flex w-full cursor-pointer items-center justify-between bg-zinc-900/80 px-4 py-3 text-left transition hover:bg-zinc-900 border-b border-zinc-800/40 select-none"
                              onClick={() => toggleSection(section.id)}
                              type="button"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-800 text-sky-400 shrink-0">
                                  <ChevronDown
                                    className={`size-4 transition-transform duration-200 ${
                                      isExpanded ? "rotate-0" : "-rotate-90"
                                    }`}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-white tracking-wide">
                                      {section.title}
                                    </span>
                                    <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400 border border-zinc-700">
                                      {section.badge}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-zinc-400 truncate">
                                    {section.subtitle}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="rounded-full bg-zinc-800/90 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                                  {section.items.length}{" "}
                                  {section.items.length === 1
                                    ? "banner"
                                    : "banners"}
                                </span>
                              </div>
                            </button>

                            {/* CORPO EXPANDIDO DA SANFONA: CARDS COM THUMBNAILS FIXAS E NUNCA BUGADAS */}
                            {isExpanded && (
                              <div className="p-3.5 bg-zinc-950/40">
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                  {section.items.map((item) => {
                                    const isSelected = selectedUrl === item.url;

                                    return (
                                      <div
                                        className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border transition shadow-sm ${
                                          isSelected
                                            ? "border-sky-400 ring-2 ring-sky-500/40 bg-zinc-900"
                                            : "border-zinc-800 hover:border-zinc-600 bg-zinc-900/60"
                                        }`}
                                        key={item.id}
                                        onClick={() => setSelectedUrl(item.url)}
                                        onDoubleClick={handleConfirm}
                                      >
                                        {/* THUMBNAIL COM ALTURA MÍNIMA GARANTIDA E ABSOLUTE INSET-0 */}
                                        <div className="relative w-full aspect-[16/9] min-h-[96px] overflow-hidden bg-zinc-950 border-b border-zinc-800/80">
                                          {/* eslint-disable-next-js/next/no-img-element */}
                                          <img
                                            alt={item.name}
                                            className={`absolute inset-0 size-full transition-transform duration-200 group-hover:scale-105 ${
                                              item.isIcon
                                                ? "object-contain p-2.5"
                                                : "object-cover"
                                            }`}
                                            loading="lazy"
                                            onError={(e) => {
                                              e.currentTarget.classList.add(
                                                "opacity-40",
                                              );
                                            }}
                                            src={item.url}
                                          />

                                          {/* Tag do Slide (Banner 1, Banner 2...) */}
                                          {item.slideLabel && (
                                            <span className="absolute top-1.5 left-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-400 border border-sky-500/30 backdrop-blur-xs">
                                              {item.slideLabel}
                                            </span>
                                          )}

                                          {/* Checkmark de Seleção */}
                                          {isSelected && (
                                            <div className="absolute top-1.5 right-1.5 flex size-5.5 items-center justify-center rounded-full bg-sky-500 text-zinc-950 shadow-lg ring-2 ring-white/50">
                                              <Check className="size-3.5 stroke-[3]" />
                                            </div>
                                          )}
                                        </div>

                                        {/* Detalhes do Card */}
                                        <div className="p-2.5 flex flex-col justify-between flex-1">
                                          <span className="block truncate text-xs font-semibold text-zinc-200 group-hover:text-white transition">
                                            {item.name}
                                          </span>
                                          <span className="mt-1 block truncate text-[10px] text-zinc-400">
                                            {item.category}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {filteredSections.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500">
                          <Search className="size-8 text-zinc-600 mb-2" />
                          <p className="text-sm font-semibold text-zinc-300">
                            Nenhum banner encontrado
                          </p>
                          <p className="text-xs text-zinc-500">
                            Tente buscar por outro termo ou limpe o filtro.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* VISÃO 2: TODAS AS IMAGENS EM GRADE */}
                  {viewMode === "all" && (
                    <div className="grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 md:grid-cols-4">
                      {flatItems.map((item) => {
                        const isSelected = selectedUrl === item.url;

                        return (
                          <div
                            className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border transition shadow-sm ${
                              isSelected
                                ? "border-sky-400 ring-2 ring-sky-500/40 bg-zinc-900"
                                : "border-zinc-800 hover:border-zinc-600 bg-zinc-900/60"
                            }`}
                            key={item.id}
                            onClick={() => setSelectedUrl(item.url)}
                            onDoubleClick={handleConfirm}
                          >
                            <div className="relative w-full aspect-[16/9] min-h-[96px] overflow-hidden bg-zinc-950 border-b border-zinc-800/80">
                              {/* eslint-disable-next-js/next/no-img-element */}
                              <img
                                alt={item.name}
                                className={`absolute inset-0 size-full transition-transform duration-200 group-hover:scale-105 ${
                                  item.isIcon
                                    ? "object-contain p-2.5"
                                    : "object-cover"
                                }`}
                                loading="lazy"
                                src={item.url}
                              />
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 flex size-5.5 items-center justify-center rounded-full bg-sky-500 text-zinc-950 shadow-lg ring-2 ring-white/50">
                                  <Check className="size-3.5 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <div className="p-2.5 flex flex-col justify-between flex-1">
                              <span className="block truncate text-xs font-semibold text-zinc-200 group-hover:text-white transition">
                                {item.name}
                              </span>
                              <span className="mt-1 block truncate text-[10px] text-zinc-400">
                                {item.sectionTitle || item.category}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {flatItems.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-zinc-500">
                          <Search className="size-8 text-zinc-600 mb-2" />
                          <p className="text-sm font-semibold text-zinc-300">
                            Nenhum banner encontrado
                          </p>
                          <p className="text-xs text-zinc-500">
                            Tente buscar por outro termo ou limpe o filtro.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* PAINEL DE DETALHES LATERAL (PREVIEW DO BANNER SELECIONADO) */}
              <div className="hidden w-72 flex-col border-l border-zinc-800/80 bg-zinc-950/60 p-5 lg:flex shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center justify-between">
                  <span>Detalhes do Banner</span>
                  {selectedItem && (
                    <span className="text-[10px] text-sky-400 font-mono">
                      ID: {selectedItem.id}
                    </span>
                  )}
                </span>

                {selectedItem ? (
                  <div className="flex flex-col gap-3">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-md">
                      {/* eslint-disable-next-js/next/no-img-element */}
                      <img
                        alt={selectedItem.name}
                        className={`absolute inset-0 size-full ${
                          selectedItem.isIcon
                            ? "object-contain p-3"
                            : "object-cover"
                        }`}
                        src={selectedItem.url}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="text-xs font-bold text-white break-words">
                        {selectedItem.name}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                          {selectedItem.category}
                        </span>
                        {selectedItem.sectionTitle && (
                          <span className="rounded-md bg-sky-950/40 border border-sky-800/50 px-2 py-0.5 text-[10px] text-sky-300">
                            {selectedItem.sectionTitle}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-col gap-1">
                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                          Caminho da Imagem:
                        </span>
                        <div className="flex items-center justify-between rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-[10px] text-zinc-400 font-mono break-all">
                          <span className="truncate pr-1">
                            {selectedItem.url}
                          </span>
                          <button
                            aria-label="Copiar link"
                            className="shrink-0 text-zinc-400 hover:text-white transition cursor-pointer"
                            onClick={() => handleCopyUrl(selectedItem.url)}
                            title="Copiar URL"
                            type="button"
                          >
                            {copiedUrl ? (
                              <CheckCheck className="size-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-zinc-950 shadow-md transition hover:bg-zinc-200"
                        onClick={handleConfirm}
                        type="button"
                      >
                        <Check className="size-4" />
                        <span>Inserir este Banner</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-center text-xs text-zinc-500">
                    Selecione um banner para visualizar detalhes completos.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 5. RODAPÉ SHADCN DARK */}
        <div className="flex h-16 items-center justify-between border-t border-zinc-800/80 bg-zinc-950 px-5 sm:px-6 select-none shrink-0">
          <div className="text-xs text-zinc-400 truncate pr-3">
            {activeTab === "upload" ? (
              uploadedFile ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <Check className="size-3.5" />
                  Upload pronto:{" "}
                  <strong className="text-white">{uploadedFile.name}</strong>
                </span>
              ) : customUrl.trim() ? (
                <span className="text-sky-400 font-medium flex items-center gap-1.5">
                  <LinkIcon className="size-3.5" />
                  URL externa ativa pronta para uso
                </span>
              ) : (
                <span>Faça upload de um arquivo ou cole um link acima</span>
              )
            ) : selectedItem ? (
              <span>
                Selecionado:{" "}
                <strong className="text-white">{selectedItem.name}</strong>
              </span>
            ) : (
              <span>Escolha um banner na biblioteca</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition shadow-md ${
                isConfirmDisabled
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60"
                  : "bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer"
              }`}
              disabled={isConfirmDisabled}
              onClick={handleConfirm}
              type="button"
            >
              <Check className="size-4" />
              <span>Inserir no Banner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
