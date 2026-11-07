'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type {
  ProductCarouselProps,
  PromotionalCampaignOption,
  WidgetContextData,
} from '@/lib/storefront/widget-types';
import type { ApiProduct } from '@/lib/types';

export const DEFAULT_PROMOTIONAL_CAMPAIGNS: PromotionalCampaignOption[] = [
  {
    id: 'camp-semana-feirante',
    label: 'Semana do Feirante',
    title: 'Ofertas',
    subtitle: 'Mês de Outubro',
    imageUrl: '/assets/HOME Vitrine/S4-CARD-ESQ-Promocional/S4-CARD-ESQ-Promocional.webp',
    linkUrl: '/loja?oferta=1',
    altText: 'Semana do Feirante — Luva Nitrílica Comercial do Norte',
    source: 'offers',
  },
  {
    id: 'camp-delivery-kraft',
    label: 'Especial Delivery & Kraft',
    title: 'Ofertas',
    subtitle: 'Linha Delivery',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
    linkUrl: '/segmento/delivery',
    altText: 'Especial Delivery e Embalagens Kraft — Comercial do Norte',
    source: 'category',
    categorySlug: 'embalagens',
    searchKeyword: 'marmita|pizza|hamburgueira|sacola|kraft',
  },
  {
    id: 'camp-descartaveis-atacado',
    label: 'Descartáveis no Atacado',
    title: 'Ofertas',
    subtitle: 'Fardos Fechados',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
    linkUrl: '/categoria/descartaveis',
    altText: 'Descartáveis no Atacado — Copos e Pratos Comercial do Norte',
    source: 'category',
    categorySlug: 'descartaveis',
    searchKeyword: 'copo|prato|descartavel|descartável',
  },
  {
    id: 'camp-confeitaria-doces',
    label: 'Festival de Confeitaria',
    title: 'Ofertas',
    subtitle: 'Doces & Festas',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
    linkUrl: '/segmento/confeitaria-bolos',
    altText: 'Festival de Confeitaria e Doces — Comercial do Norte',
    source: 'featured',
    categorySlug: 'confeitaria',
    searchKeyword: 'doce|bolo|festa|confeitaria|caixa|prato',
  },
];

const FALLBACK_CATALOG_PRODUCTS: ApiProduct[] = [
  {
    id: 'fallback-prod-sacola-40x50',
    publicId: 'fallback-prod-sacola-40x50',
    name: 'Sacola Plástica Reforçada 40 x 50 cm',
    slug: 'sacola-plastica-40x50',
    description: 'Fardo com 1 kg de sacolas. Produto de demonstração do catálogo.',
    status: 'ACTIVE',
    brand: { id: 'b3', name: 'NortePlast', slug: 'norteplast' },
    categories: [{ category: { id: 'c3', name: 'Sacos & Sacolas', slug: 'sacos-e-sacolas' } }],
    images: [{ id: 'img-sacola-40x50', path: '/assets/PRODUTOS/produtos-imgs/sacola-50x60.jpg', altText: 'Sacola Plástica Reforçada 40 x 50 cm', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-sacola-40x50', publicId: 'v-fallback-sacola-40x50', sku: 'DEMO-SAC-4050', priceCents: 1590, compareAtPriceCents: 2035, weightGrams: 1500, widthMm: 400, heightMm: 60, lengthMm: 500, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-1',
    publicId: 'fallback-prod-1',
    name: 'Copo Descartável Transparente 300ml — Pct 100 un.',
    slug: 'copo-descartavel-transparente-300ml',
    description: 'Sai a R$ 0,12 por copo no atacado',
    status: 'ACTIVE',
    brand: { id: 'b1', name: 'Cristalcopo', slug: 'cristalcopo' },
    categories: [{ category: { id: 'c1', name: 'Descartáveis', slug: 'descartaveis' } }],
    images: [{ id: 'img1', path: '/assets/PRODUTOS/produtos-imgs/copo-300ml.png', altText: 'Copo Descartável 300ml', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-1', publicId: 'v-fallback-1', sku: 'COPO-300ML', priceCents: 1229, compareAtPriceCents: 1890, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-2',
    publicId: 'fallback-prod-2',
    name: 'Marmita de Isopor com Tampa 900ml — Pct 50 un.',
    slug: 'marmita-isopor-com-tampa-900ml',
    description: 'Vedação térmica ideal para delivery',
    status: 'ACTIVE',
    brand: { id: 'b2', name: 'Knauf', slug: 'knauf' },
    categories: [{ category: { id: 'c2', name: 'Embalagens', slug: 'embalagens' } }],
    images: [{ id: 'img2', path: '/assets/PRODUTOS/produtos-imgs/marmita-900ml.jpg', altText: 'Marmita de Isopor 900ml', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-2', publicId: 'v-fallback-2', sku: 'MARM-900', priceCents: 2990, compareAtPriceCents: 4150, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-3',
    publicId: 'fallback-prod-3',
    name: 'Sacola Plástica Branca 50×60 — Pct 5kg',
    slug: 'sacola-plastica-branca-50x60',
    description: 'Alta resistência para atacado e comércio',
    status: 'ACTIVE',
    brand: { id: 'b3', name: 'NortePlast', slug: 'norteplast' },
    categories: [{ category: { id: 'c3', name: 'Sacos & Sacolas', slug: 'sacos-e-sacolas' } }],
    images: [{ id: 'img3', path: '/assets/PRODUTOS/produtos-imgs/sacola-50x60.jpg', altText: 'Sacola Plástica 50x60', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-3', publicId: 'v-fallback-3', sku: 'SAC-50X60', priceCents: 6990, compareAtPriceCents: 8990, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },

  {
    id: 'fallback-prod-4',
    publicId: 'fallback-prod-4',
    name: 'Papel Toalha Interfolhado — Pct 1.000 folhas',
    slug: 'papel-toalha-interfolhado-1000-folhas',
    description: 'Uso comercial em banheiros e cozinhas',
    status: 'ACTIVE',
    brand: { id: 'b4', name: 'Mili Profissional', slug: 'mili' },
    categories: [{ category: { id: 'c4', name: 'Limpeza Profissional', slug: 'limpeza-profissional' } }],
    images: [{ id: 'img4', path: '/assets/PRODUTOS/produtos-imgs/papel-toalha.jpg', altText: 'Papel Toalha Interfolhado', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-4', publicId: 'v-fallback-4', sku: 'PAPEL-1000', priceCents: 1999, compareAtPriceCents: 2440, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-5',
    publicId: 'fallback-prod-5',
    name: 'Caixa de Pizza Papelão 35cm — Pct 25 un.',
    slug: 'caixa-pizza-papelao-35cm',
    description: 'Linha reforçada com respiro anti-umidade',
    status: 'ACTIVE',
    brand: { id: 'b5', name: 'Comercial do Norte', slug: 'comercial-do-norte' },
    categories: [{ category: { id: 'c2', name: 'Embalagens', slug: 'embalagens' } }],
    images: [{ id: 'img5', path: '/assets/PRODUTOS/produtos-imgs/caixa-pizza-35cm.jpg', altText: 'Caixa de Pizza 35cm', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-5', publicId: 'v-fallback-5', sku: 'CX-PIZZA-35', priceCents: 2723, compareAtPriceCents: 3890, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-6',
    publicId: 'fallback-prod-6',
    name: 'Prato Descartável Fundo 18cm Branco — Pct 50 un.',
    slug: 'prato-descartavel-fundo-18cm',
    description: 'Ideal para refeições, caldos e eventos',
    status: 'ACTIVE',
    brand: { id: 'b1', name: 'Cristalcopo', slug: 'cristalcopo' },
    categories: [{ category: { id: 'c1', name: 'Descartáveis', slug: 'descartaveis' } }],
    images: [{ id: 'img6', path: '/assets/PRODUTOS/produtos-imgs/copo-200ml.png', altText: 'Prato Descartável 18cm', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-6', publicId: 'v-fallback-6', sku: 'PRATO-18', priceCents: 1450, compareAtPriceCents: 1990, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-7',
    publicId: 'fallback-prod-7',
    name: 'Copo Descartável 200ml Água — Pct 100 un.',
    slug: 'copo-descartavel-200ml-agua',
    description: 'Uso comercial diário para água e café',
    status: 'ACTIVE',
    brand: { id: 'b2', name: 'Techplast', slug: 'techplast' },
    categories: [{ category: { id: 'c1', name: 'Descartáveis', slug: 'descartaveis' } }],
    images: [{ id: 'img7', path: '/assets/PRODUTOS/produtos-imgs/copo-200ml.png', altText: 'Copo Descartável 200ml', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-7', publicId: 'v-fallback-7', sku: 'COPO-200ML', priceCents: 890, compareAtPriceCents: 1250, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-8',
    publicId: 'fallback-prod-8',
    name: 'Detergente Líquido Neutro Concentrado 5L',
    slug: 'detergente-liquido-neutro-5l',
    description: 'Alto rendimento para cozinhas industriais',
    status: 'ACTIVE',
    brand: { id: 'b6', name: 'Limpeza Pro', slug: 'limpeza-pro' },
    categories: [{ category: { id: 'c4', name: 'Limpeza', slug: 'limpeza' } }],
    images: [{ id: 'img8', path: '/assets/PRODUTOS/produtos-imgs/detergente-5l.jpg', altText: 'Detergente 5L', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-8', publicId: 'v-fallback-8', sku: 'DET-5L', priceCents: 3290, compareAtPriceCents: 4200, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-9',
    publicId: 'fallback-prod-9',
    name: 'Marmita Térmica de Alumínio 750ml — Pct 50 un.',
    slug: 'marmita-termica-aluminio-750ml',
    description: 'Mantém o prato quente por mais tempo',
    status: 'ACTIVE',
    brand: { id: 'b7', name: 'Wyda', slug: 'wyda' },
    categories: [{ category: { id: 'c2', name: 'Embalagens', slug: 'embalagens' } }],
    images: [{ id: 'img9', path: '/assets/PRODUTOS/produtos-imgs/marmita-750ml.jpg', altText: 'Marmita Alumínio 750ml', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-9', publicId: 'v-fallback-9', sku: 'MARM-ALUM-750', priceCents: 3850, compareAtPriceCents: 4890, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-10',
    publicId: 'fallback-prod-10',
    name: 'Sacola Plástica Reforçada 38×48 — Pct 5kg',
    slug: 'sacola-plastica-reforcada-38x48',
    description: 'Tamanho padrão para padarias e mercadinhos',
    status: 'ACTIVE',
    brand: { id: 'b3', name: 'NortePlast', slug: 'norteplast' },
    categories: [{ category: { id: 'c3', name: 'Sacos & Sacolas', slug: 'sacos-e-sacolas' } }],
    images: [{ id: 'img10', path: '/assets/PRODUTOS/produtos-imgs/sacola-38x48.jpg', altText: 'Sacola Reforçada 38x48', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-10', publicId: 'v-fallback-10', sku: 'SAC-38X48', priceCents: 5490, compareAtPriceCents: 6890, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-11',
    publicId: 'fallback-prod-11',
    name: 'Caixa de Pizza Oitavada 25cm Brotinho — Pct 25 un.',
    slug: 'caixa-pizza-oitavada-25cm',
    description: 'Excelente para porções individuais e esfihas',
    status: 'ACTIVE',
    brand: { id: 'b5', name: 'Comercial do Norte', slug: 'comercial-do-norte' },
    categories: [{ category: { id: 'c2', name: 'Embalagens', slug: 'embalagens' } }],
    images: [{ id: 'img11', path: '/assets/PRODUTOS/produtos-imgs/caixa-pizza-25cm.jpg', altText: 'Caixa de Pizza 25cm', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-11', publicId: 'v-fallback-11', sku: 'CX-PIZZA-25', priceCents: 2190, compareAtPriceCents: 2890, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-12',
    publicId: 'fallback-prod-12',
    name: 'Copo Descartável Reforçado 300ml — Pct 100 un.',
    slug: 'copo-descartavel-reforcado-300ml',
    description: 'Para sucos, refrigerantes e chopp',
    status: 'ACTIVE',
    brand: { id: 'b2', name: 'Techplast', slug: 'techplast' },
    categories: [{ category: { id: 'c1', name: 'Descartáveis', slug: 'descartaveis' } }],
    images: [{ id: 'img12', path: '/assets/PRODUTOS/produtos-imgs/copo-300ml.png', altText: 'Copo Reforçado 300ml', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-12', publicId: 'v-fallback-12', sku: 'COPO-REF-300', priceCents: 1590, compareAtPriceCents: 2100, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-13',
    publicId: 'fallback-prod-13',
    name: 'Luva Nitrílica Sem Pó Azul — Cx 100 un.',
    slug: 'luva-nitrilica-sem-po-azul',
    description: 'Higiene e proteção profissional na manipulação',
    status: 'ACTIVE',
    brand: { id: 'b8', name: 'Segplast', slug: 'segplast' },
    categories: [{ category: { id: 'c4', name: 'Limpeza & Higiene', slug: 'limpeza' } }],
    images: [{ id: 'img13', path: '/assets/PRODUTOS/produtos-imgs/detergente-5l.jpg', altText: 'Luva Nitrílica Azul', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-13', publicId: 'v-fallback-13', sku: 'LUV-NIT-AZUL', priceCents: 2710, compareAtPriceCents: 3590, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-14',
    publicId: 'fallback-prod-14',
    name: 'Hamburgueira de Isopor Térmica — Pct 100 un.',
    slug: 'hamburgueira-isopor-termica',
    description: 'Mantém o lanche montado e aquecido',
    status: 'ACTIVE',
    brand: { id: 'b2', name: 'Knauf', slug: 'knauf' },
    categories: [{ category: { id: 'c2', name: 'Embalagens', slug: 'embalagens' } }],
    images: [{ id: 'img14', path: '/assets/PRODUTOS/produtos-imgs/marmita-750ml.jpg', altText: 'Hamburgueira Isopor', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-14', publicId: 'v-fallback-14', sku: 'HAMB-ISOPOR', priceCents: 8595, compareAtPriceCents: 10400, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-15',
    publicId: 'fallback-prod-15',
    name: 'Luva Nitrílica Sem Pó Vermelho — Cx 100 un.',
    slug: 'luva-nitrilica-sem-po-vermelho',
    description: 'Resistência química e mecânica certificada',
    status: 'ACTIVE',
    brand: { id: 'b8', name: 'Segplast', slug: 'segplast' },
    categories: [{ category: { id: 'c4', name: 'Limpeza & Higiene', slug: 'limpeza' } }],
    images: [{ id: 'img15', path: '/assets/PRODUTOS/produtos-imgs/marmita-900ml.jpg', altText: 'Luva Nitrílica Vermelho', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-15', publicId: 'v-fallback-15', sku: 'LUV-NIT-VERM', priceCents: 2710, compareAtPriceCents: 3590, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
];

export function ProductCarouselWidget({
  widgetId,
  variant = 'standard-5col',
  title,
  viewAllLink = '/loja',
  source = 'offers',
  limit,
  sideBanner,
  contextData,
}: ProductCarouselProps & { contextData?: WidgetContextData }) {
  const { isEditing, previewMode, updateWidgetProps } = useElementor();
  const [editingTitle, setEditingTitle] = useState(false);
  const [page, setPage] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [campaignMenuOpen, setCampaignMenuOpen] = useState(false);
  const campaignMenuRef = useRef<HTMLDivElement | null>(null);

  // Detecta viewport mobile (< 640px) para paginar em grade 2x2 (4 produtos por página)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkViewport = () => {
      if (typeof window.matchMedia === 'function') {
        const mql = window.matchMedia('(max-width: 639px)');
        if (mql && typeof mql.matches === 'boolean') {
          setIsMobileViewport(mql.matches || (window.innerWidth > 0 && window.innerWidth < 640));
          return;
        }
      }
      setIsMobileViewport(window.innerWidth > 0 && window.innerWidth < 640);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Lista de campanhas promocionais ativas para o seletor interativo (Anexo 2.2)
  const activeCampaigns = useMemo<PromotionalCampaignOption[]>(() => {
    if (sideBanner?.campaigns && sideBanner.campaigns.length > 0) {
      return sideBanner.campaigns;
    }
    if (sideBanner) {
      const primaryLabel = sideBanner.tag || DEFAULT_PROMOTIONAL_CAMPAIGNS[0].label;
      const customFirst: PromotionalCampaignOption = {
        id: 'camp-primary',
        label: primaryLabel,
        title: sideBanner.title || DEFAULT_PROMOTIONAL_CAMPAIGNS[0].title,
        subtitle: sideBanner.subtitle ?? DEFAULT_PROMOTIONAL_CAMPAIGNS[0].subtitle,
        imageUrl: sideBanner.imageUrl || DEFAULT_PROMOTIONAL_CAMPAIGNS[0].imageUrl,
        linkUrl: sideBanner.linkUrl ?? DEFAULT_PROMOTIONAL_CAMPAIGNS[0].linkUrl,
        altText: sideBanner.altText ?? DEFAULT_PROMOTIONAL_CAMPAIGNS[0].altText,
        source: 'offers',
      };
      const others = DEFAULT_PROMOTIONAL_CAMPAIGNS.slice(1).filter(
        (c) => c.label.toLowerCase() !== primaryLabel.toLowerCase(),
      );
      return [customFirst, ...others];
    }
    return DEFAULT_PROMOTIONAL_CAMPAIGNS;
  }, [sideBanner]);

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    () => activeCampaigns[0]?.id ?? 'camp-semana-feirante',
  );

  // Mantém campanha selecionada sincronizada caso a lista de campanhas mude
  useEffect(() => {
    if (!activeCampaigns.some((c) => c.id === selectedCampaignId) && activeCampaigns[0]) {
      setSelectedCampaignId(activeCampaigns[0].id);
    }
  }, [activeCampaigns, selectedCampaignId]);

  // Fecha menu de campanhas ao clicar fora ou pressionar Escape
  useEffect(() => {
    if (!campaignMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        campaignMenuRef.current &&
        !campaignMenuRef.current.contains(event.target as Node)
      ) {
        setCampaignMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCampaignMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [campaignMenuOpen]);

  const selectedCampaign =
    activeCampaigns.find((c) => c.id === selectedCampaignId) ?? activeCampaigns[0];
  const hasMultipleCampaigns = activeCampaigns.length > 1;

  const handleSelectCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setCampaignMenuOpen(false);
    setPage(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, totalPages: number) => {
    if (touchStartX === null || totalPages <= 1) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      setPage((p) => (p + 1) % totalPages);
    } else if (diff < -45) {
      setPage((p) => (p - 1 + totalPages) % totalPages);
    }
    setTouchStartX(null);
  };

  // No mobile (< 640px), exibe sempre 4 produtos por página (grade 2 colunas × 2 linhas — Anexo 3).
  // No desktop, preserva 3 colunas no split-banner e 5 colunas no standard-5col.
  const desktopTargetCount = limit ?? (variant === 'split-banner' ? 3 : 5);
  const MOBILE_ITEMS_PER_PAGE = 4;
  const targetCount = isMobileViewport ? MOBILE_ITEMS_PER_PAGE : desktopTargetCount;
  const MAX_CAROUSEL_PAGES = 4;

  // Constrói o pool completo de produtos disponíveis sem duplicações artificiais
  const allUniqueProducts = useMemo(() => {
    const offers = contextData?.offers ?? [];
    const catalog = contextData?.products ?? [];
    const merged: ApiProduct[] = [];
    const seenSlugs = new Set<string>();

    const appendUnique = (items: ApiProduct[]) => {
      for (const p of items) {
        const key = p.slug || p.id || p.publicId;
        if (key && !seenSlugs.has(key)) {
          seenSlugs.add(key);
          merged.push(p);
        }
      }
    };

    if (source === 'offers') {
      appendUnique(offers);
      appendUnique(catalog);
      if (merged.length < (variant === 'split-banner' ? 8 : 10)) {
        appendUnique(FALLBACK_CATALOG_PRODUCTS);
      }
    } else {
      if (catalog.length > 0) {
        appendUnique(catalog);
      } else {
        appendUnique(FALLBACK_CATALOG_PRODUCTS);
      }
    }

    return merged;
  }, [contextData?.offers, contextData?.products, source, variant]);

  // Filtra/ordena produtos conforme a campanha promocional selecionada no split-banner
  const baseList = useMemo(() => {
    let pool = allUniqueProducts;

    if (
      variant === 'split-banner' &&
      selectedCampaign &&
      selectedCampaign.id !== activeCampaigns[0]?.id
    ) {
      const keywordRegex = selectedCampaign.searchKeyword
        ? new RegExp(selectedCampaign.searchKeyword, 'i')
        : null;
      const catSlug = selectedCampaign.categorySlug?.toLowerCase();

      const matching: ApiProduct[] = [];
      const rest: ApiProduct[] = [];

      for (const product of pool) {
        const matchesCat =
          catSlug &&
          product.categories?.some(
            (c) =>
              c.category?.slug?.toLowerCase().includes(catSlug) ||
              c.category?.name?.toLowerCase().includes(catSlug),
          );
        const matchesKeyword =
          keywordRegex &&
          (keywordRegex.test(product.name) ||
            keywordRegex.test(product.slug) ||
            keywordRegex.test(product.description ?? ''));

        if (matchesCat || matchesKeyword) {
          matching.push(product);
        } else {
          rest.push(product);
        }
      }

      if (matching.length > 0) {
        pool = [...matching, ...rest];
      }
    }

    if (variant === 'split-banner' && source === 'offers') {
      // No mobile (2x2 = 4 por página), permite até 8 produtos (2 páginas de 4) se disponíveis;
      // no desktop (3 por página), mantém 6 produtos (2 páginas de 3).
      const maxSplitItems = isMobileViewport ? 8 : 6;
      return pool.slice(0, maxSplitItems);
    }

    return pool.slice(0, MAX_CAROUSEL_PAGES * targetCount);
  }, [
    allUniqueProducts,
    variant,
    selectedCampaign,
    activeCampaigns,
    source,
    isMobileViewport,
    targetCount,
  ]);

  const totalPages = Math.min(
    MAX_CAROUSEL_PAGES,
    Math.max(1, Math.ceil(baseList.length / targetCount)),
  );
  const safePage = Math.min(page, totalPages - 1);

  // Paginação real por grupos: NUNCA duplica produtos artificialmente para completar a última página (Anexo 3)
  const startIndex = safePage * targetCount;
  const displayItems = baseList.slice(startIndex, startIndex + targetCount);
  // Se o último grupo tiver quantidade ímpar no mobile (grade de 2 colunas), adiciona célula vazia
  // sem esticar o último produto nem duplicar itens.
  const hasOddPlaceholderCell = displayItems.length % 2 === 1;

  const renderEditableTitle = () =>
    isEditing && !previewMode ? (
      <div className="group/title relative flex items-center gap-1.5">
        {editingTitle ? (
          <input
            autoFocus
            className="rounded-lg border-2 border-[#004CB1] bg-white px-2 py-0.5 text-lg font-extrabold text-slate-900 outline-none sm:text-xl"
            onBlur={() => setEditingTitle(false)}
            onChange={(e) => {
              if (widgetId) updateWidgetProps(widgetId, { title: e.target.value });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setEditingTitle(false);
            }}
            value={title}
          />
        ) : (
          <div
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-1 py-0.5 transition hover:bg-slate-100"
            onClick={() => setEditingTitle(true)}
            title="Clique para editar o título"
          >
            <h2 className="text-[19px] font-extrabold tracking-tight text-slate-900 sm:text-[21px] whitespace-nowrap">
              {title}
            </h2>
            <Edit2 className="size-3.5 text-[#004CB1] opacity-0 transition-opacity group-hover/title:opacity-100" />
          </div>
        )}
      </div>
    ) : (
      <h2 className="text-[19px] font-extrabold tracking-tight text-slate-900 sm:text-[21px] whitespace-nowrap">
        {title}
      </h2>
    );

  const renderDarkNavyPaginationPill = () => {
    if (totalPages <= 1) return null;
    const MAX_VISIBLE_DOTS = 4;
    let startIdx = 0;
    if (totalPages > MAX_VISIBLE_DOTS) {
      startIdx = Math.min(Math.max(0, safePage - 1), totalPages - MAX_VISIBLE_DOTS);
    }
    const count = Math.min(totalPages, MAX_VISIBLE_DOTS);
    const dots = Array.from({ length: count }, (_, i) => startIdx + i);

    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#101F3C] px-3 py-1.5 shadow-sm">
        {dots.map((dotIdx) => (
          <button
            aria-label={`Página ${dotIdx + 1}`}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              safePage === dotIdx ? 'w-4 bg-[#E2091E]' : 'w-1.5 bg-white/40 hover:bg-white/70'
            }`}
            key={dotIdx}
            onClick={() => setPage(dotIdx)}
            type="button"
          />
        ))}
      </div>
    );
  };

  if (variant === 'split-banner') {
    const defaultBanner = sideBanner ?? {
      title: 'Ofertas',
      subtitle: 'Mês de Outubro',
      tag: 'Semana do Feirante',
      imageUrl: '/assets/HOME Vitrine/S4-CARD-ESQ-Promocional/S4-CARD-ESQ-Promocional.webp',
      linkUrl: '/loja?oferta=1',
      altText: 'Semana do Feirante Comercial do Norte',
    };

    const banner = selectedCampaign
      ? {
          title: selectedCampaign.title || defaultBanner.title,
          subtitle: selectedCampaign.subtitle ?? defaultBanner.subtitle,
          tag: selectedCampaign.label,
          imageUrl: selectedCampaign.imageUrl || defaultBanner.imageUrl,
          linkUrl: selectedCampaign.linkUrl ?? defaultBanner.linkUrl,
          altText: selectedCampaign.altText ?? defaultBanner.altText ?? selectedCampaign.label,
        }
      : defaultBanner;

    const currentViewAllLink = selectedCampaign?.linkUrl || viewAllLink;

    return (
      <section aria-label={title} className="cn-container py-3 sm:py-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
          {/* Card Esquerdo: Banner Vertical 3:4 com Seletor de Campanhas (Anexo 2) */}
          <div className="flex flex-col min-h-0 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] lg:col-span-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-[18px] sm:text-[19px] font-extrabold text-slate-900">
                  {banner.title}
                </span>
                {banner.subtitle ? (
                  <span className="truncate text-xs font-bold text-[#004CB1]">
                    {banner.subtitle}
                  </span>
                ) : null}
              </div>

              {banner.tag ? (
                hasMultipleCampaigns ? (
                  <div className="relative" ref={campaignMenuRef}>
                    <button
                      aria-expanded={campaignMenuOpen}
                      aria-haspopup="listbox"
                      aria-label="Selecionar campanha promocional"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-[#004CB1]/40 hover:bg-[#004CB1]/5 hover:text-[#004CB1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004CB1]/30 cursor-pointer"
                      onClick={() => setCampaignMenuOpen((prev) => !prev)}
                      type="button"
                    >
                      <span className="max-w-[155px] truncate">{banner.tag}</span>
                      <ChevronDown
                        className={`size-3.5 text-slate-500 transition-transform duration-200 ${
                          campaignMenuOpen ? 'rotate-180 text-[#004CB1]' : ''
                        }`}
                      />
                    </button>

                    {campaignMenuOpen ? (
                      <div
                        aria-label="Campanhas promocionais ativas"
                        className="absolute right-0 top-full z-30 mt-1.5 w-60 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5"
                        role="listbox"
                      >
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Campanhas Ativas
                        </div>
                        {activeCampaigns.map((camp) => {
                          const isSelected = camp.id === selectedCampaign?.id;
                          return (
                            <button
                              aria-selected={isSelected}
                              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition cursor-pointer ${
                                isSelected
                                  ? 'bg-[#004CB1]/10 font-bold text-[#004CB1]'
                                  : 'font-medium text-slate-700 hover:bg-slate-100'
                              }`}
                              key={camp.id}
                              onClick={() => handleSelectCampaign(camp.id)}
                              role="option"
                              type="button"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="truncate">{camp.label}</div>
                                {camp.subtitle ? (
                                  <div className="truncate text-[10px] font-normal text-slate-500">
                                    {camp.subtitle}
                                  </div>
                                ) : null}
                              </div>
                              {isSelected ? (
                                <Check className="size-3.5 shrink-0 text-[#004CB1]" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {banner.tag}
                  </span>
                )
              ) : null}
            </div>

            {/* Container respeitando rigorosamente a proporção 3:4 sem cortar a imagem (Anexo 2.1) */}
            <div className="group/img relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#002B66]">
              {banner.linkUrl ? (
                <Link
                  className="relative block size-full"
                  href={banner.linkUrl}
                  onClick={(e) => {
                    if (isEditing && !previewMode) e.preventDefault();
                  }}
                >
                  <Image
                    alt={banner.altText ?? banner.title}
                    className={`object-contain transition duration-500 ${
                      isEditing && !previewMode
                        ? 'group-hover/img:brightness-50 group-hover/img:grayscale'
                        : 'group-hover/img:scale-[1.01]'
                    }`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    src={banner.imageUrl}
                    unoptimized
                  />
                </Link>
              ) : (
                <Image
                  alt={banner.altText ?? banner.title}
                  className="object-contain"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  src={banner.imageUrl}
                  unoptimized
                />
              )}

              {widgetId ? (
                <InlineImageEditorOverlay
                  canAdd={false}
                  canRemove={false}
                  currentLinkUrl={banner.linkUrl}
                  fieldPath="sideBanner.imageUrl"
                  linkFieldPath="sideBanner.linkUrl"
                  previewUrl={banner.imageUrl}
                  slideIndex={0}
                  title={banner.title}
                  widgetId={widgetId}
                />
              ) : null}
            </div>
          </div>

          {/* Card Direito: Carrossel de Produtos em Promoção (Mobile 2x2 / Desktop 3 col — Anexo 3) */}
          <div className="relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] lg:col-span-8">
            <div className="mb-3.5 sm:mb-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                {renderEditableTitle()}
              </div>
              <Link
                className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-[#004CB1] hover:underline"
                href={currentViewAllLink}
              >
                <span>Ver todos</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div
              className="relative"
              onTouchEnd={(e) => handleTouchEnd(e, totalPages)}
              onTouchStart={handleTouchStart}
            >
              <div
                className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 items-stretch transition-opacity duration-300"
                key={`${selectedCampaign?.id ?? 'default'}-${safePage}`}
              >
                {displayItems.map((product, idx) => (
                  <div className="min-w-0 flex" key={`${product.id}-${safePage}-${idx}`}>
                    <ProductCard
                      flashBadge={idx % 2 === 0}
                      product={product}
                    />
                  </div>
                ))}
                {hasOddPlaceholderCell ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none invisible min-w-0 sm:hidden"
                    data-testid="empty-grid-cell"
                  />
                ) : null}
              </div>

              {totalPages > 1 && (
                <>
                  <button
                    aria-label="Anterior"
                    className={`absolute -left-2.5 sm:-left-3 top-1/2 z-20 size-9 sm:size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 hover:bg-slate-50 cursor-pointer ${
                      safePage === 0 ? 'hidden' : 'flex'
                    }`}
                    onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
                    type="button"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    aria-label="Próximo"
                    className="absolute -right-2.5 sm:-right-3 top-1/2 z-20 flex size-9 sm:size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setPage((p) => (p + 1) % totalPages)}
                    type="button"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
            </div>

            {/* Passador centralizado embaixo dos produtos com no máximo 4 bolinhas */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                {renderDarkNavyPaginationPill()}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Variante 'standard-5col' (Mais vendidos / Para você) — Mobile 2x2 (4 por página) / Desktop 5 col
  return (
    <section aria-label={title} className="cn-container py-3 sm:py-4">
      <div className="relative rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <div className="mb-3.5 sm:mb-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {renderEditableTitle()}
          </div>
          <Link
            className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-[#004CB1] hover:underline"
            href={viewAllLink}
          >
            <span>Ver todos</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <div
          className="relative"
          onTouchEnd={(e) => handleTouchEnd(e, totalPages)}
          onTouchStart={handleTouchStart}
        >
          <div
            className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-3.5 items-stretch transition-opacity duration-300"
            key={safePage}
          >
            {displayItems.map((product, idx) => (
              <div className="min-w-0 flex" key={`${product.id}-${safePage}-${idx}`}>
                <ProductCard
                  flashBadge={idx === 0 || idx === 2}
                  product={product}
                />
              </div>
            ))}
            {hasOddPlaceholderCell ? (
              <div
                aria-hidden="true"
                className="pointer-events-none invisible min-w-0 sm:hidden"
                data-testid="empty-grid-cell"
              />
            ) : null}
          </div>

          {totalPages > 1 && (
            <>
              <button
                aria-label="Anterior"
                className={`absolute -left-2.5 sm:-left-3.5 top-1/2 z-20 size-9 sm:size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 hover:bg-slate-50 cursor-pointer ${
                  safePage === 0 ? 'hidden' : 'flex'
                }`}
                onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
                type="button"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                aria-label="Próximo"
                className="absolute -right-2.5 sm:-right-3.5 top-1/2 z-20 flex size-9 sm:size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 hover:bg-slate-50 cursor-pointer"
                onClick={() => setPage((p) => (p + 1) % totalPages)}
                type="button"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>

        {/* Passador centralizado embaixo dos produtos com no máximo 4 bolinhas */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            {renderDarkNavyPaginationPill()}
          </div>
        )}
      </div>
    </section>
  );
}
