import type { ComponentType } from "react";
import {
  Bike,
  Boxes,
  CakeSlice,
  Candy,
  Croissant,
  CupSoda,
  Flame,
  IceCream2,
  Layers,
  Milk,
  Package,
  PartyPopper,
  Pizza,
  Receipt,
  Sandwich,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import { mediaUrl } from "./api";
import type { ApiCategory, ApiSegment, ApiTag } from "./types";

export type NormalizedSubcategory = {
  id?: string;
  name: string;
  slug: string;
  productCount: number;
};

export type NormalizedCategoryItem = {
  id: string;
  name: string;
  slug: string;
  imagePath: string | null;
  productCount: number;
  subcategories: NormalizedSubcategory[];
};

export type MegaMenuBannerMeta = {
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
};

export const DEFAULT_FALLBACK_CATEGORIES: NormalizedCategoryItem[] = [
  {
    id: "artigos-para-festa",
    name: "Artigos para Festa",
    slug: "artigos-para-festa",
    imagePath: null,
    productCount: 0,
    subcategories: [
      { name: "Velas e Suprimentos", slug: "velas-e-suprimentos", productCount: 0 },
    ],
  },
  {
    id: "descartaveis",
    name: "Descartáveis",
    slug: "descartaveis",
    imagePath: null,
    productCount: 0,
    subcategories: [
      { name: "Copos", slug: "copos", productCount: 0 },
      { name: "Pratos", slug: "pratos", productCount: 0 },
    ],
  },
  {
    id: "embalagens",
    name: "Embalagens",
    slug: "embalagens",
    imagePath: null,
    productCount: 0,
    subcategories: [
      { name: "Caixas e Bandejas", slug: "caixas-e-bandejas", productCount: 0 },
      { name: "Filme e Alumínio", slug: "filme-e-aluminio", productCount: 0 },
    ],
  },
  {
    id: "doces-e-bomboniere",
    name: "Doces e Bomboniere",
    slug: "doces-e-bomboniere",
    imagePath: null,
    productCount: 0,
    subcategories: [],
  },
  {
    id: "frios-e-laticinios",
    name: "Frios e Laticínios",
    slug: "frios-e-laticinios",
    imagePath: null,
    productCount: 0,
    subcategories: [],
  },
  {
    id: "mercearia",
    name: "Mercearia",
    slug: "mercearia",
    imagePath: null,
    productCount: 0,
    subcategories: [],
  },
  {
    id: "produtos-de-limpeza",
    name: "Produtos de Limpeza",
    slug: "produtos-de-limpeza",
    imagePath: null,
    productCount: 0,
    subcategories: [],
  },
  {
    id: "sacos-e-sacolas",
    name: "Sacos e Sacolas",
    slug: "sacos-e-sacolas",
    imagePath: null,
    productCount: 0,
    subcategories: [],
  },
];

export const DEFAULT_FALLBACK_SEGMENTS: ApiSegment[] = [
  { id: "seg_lanchonete", name: "Lanchonetes & Hamburguerias", slug: "lanchonete" },
  { id: "seg_pizzaria", name: "Pizzarias & Esfiharias", slug: "pizzaria" },
  { id: "seg_padaria", name: "Padarias & Confeitarias", slug: "padaria" },
  { id: "seg_festas", name: "Festas & Eventos", slug: "loja-de-festas" },
  { id: "seg_delivery", name: "Delivery", slug: "delivery" },
  { id: "seg_buffet", name: "Restaurantes & Buffets", slug: "restaurante-buffet" },
  { id: "seg_confeitaria", name: "Doces & Confeitaria Caseira", slug: "confeitaria-bolos" },
  { id: "seg_sorveteria", name: "Sorveterias & Açaís", slug: "sorveteria-acai" },
  { id: "seg_bar", name: "Bares & Distribuidoras", slug: "bar-distribuidora" },
];

export const DEFAULT_FALLBACK_TAGS: ApiTag[] = [
  { id: "tag_biodegradavel", name: "Biodegradável", slug: "biodegradavel" },
  { id: "tag_descartavel", name: "Descartável", slug: "descartavel" },
  { id: "tag_kraft", name: "Kraft", slug: "kraft" },
  { id: "tag_reforcado", name: "Reforçado", slug: "reforcado" },
  { id: "tag_termico", name: "Térmico", slug: "termico" },
  { id: "tag_transparente", name: "Transparente", slug: "transparente" },
  { id: "tag_microondas", name: "Vai ao Micro-ondas", slug: "vai-ao-micro-ondas" },
];

export function resolveStorefrontAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return mediaUrl(path);
}

export function normalizeCategoryTree(categories?: ApiCategory[]): NormalizedCategoryItem[] {
  if (!categories || categories.length === 0) {
    return DEFAULT_FALLBACK_CATEGORIES;
  }

  const roots = categories.filter((c) => !c.parentId);
  if (roots.length === 0) {
    return DEFAULT_FALLBACK_CATEGORIES;
  }

  return roots.map((root) => {
    const subs =
      root.children && root.children.length > 0
        ? root.children
        : categories.filter((c) => c.parentId === root.id);

    const subcategories: NormalizedSubcategory[] = subs.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      productCount: s._count?.products ?? 0,
    }));

    const hasChildCount = subs.some((s) => s._count?.products !== undefined);
    const productCount =
      root._count?.products !== undefined
        ? root._count.products
        : hasChildCount
          ? subcategories.reduce((acc, sub) => acc + sub.productCount, 0)
          : 0;

    return {
      id: root.id,
      name: root.name,
      slug: root.slug,
      imagePath: root.imagePath ?? null,
      productCount,
      subcategories,
    };
  });
}

export function getCategoryIcon(slug: string): ComponentType<{ className?: string }> {
  const s = slug.toLowerCase();
  if (s.includes("epi") || s.includes("protecao") || s.includes("luva")) return ShieldCheck;
  if (s.includes("confeitaria") || s.includes("chocolate") || s.includes("bolo")) return CakeSlice;
  if (s.includes("festa")) return PartyPopper;
  if (s.includes("filme") || s.includes("rolo") || s.includes("aluminio")) return Layers;
  if (s.includes("insumo") || s.includes("condimento") || s.includes("food-service")) return UtensilsCrossed;
  if (s.includes("termic") || s.includes("amarracao")) return Flame;
  if (s.includes("saco") || s.includes("sacola") || s.includes("bobina")) return ShoppingBag;
  if (s.includes("descartaveis") || s.includes("copo") || s.includes("talher") || s.includes("prato")) {
    return CupSoda;
  }
  if (s.includes("embalagens") || s.includes("caixa") || s.includes("pote") || s.includes("marmita")) {
    return Boxes;
  }
  if (s.includes("doce") || s.includes("bomboniere")) return Candy;
  if (s.includes("frio") || s.includes("laticinio")) return Milk;
  if (s.includes("mercearia")) return Store;
  if (s.includes("limpeza") || s.includes("higiene")) return Sparkles;
  return Package;
}

export function getSegmentIcon(slug: string): ComponentType<{ className?: string }> {
  const s = slug.toLowerCase();
  if (s.includes("lanchonete")) return Sandwich;
  if (s.includes("pizzaria")) return Pizza;
  if (s.includes("padaria")) return Croissant;
  if (s.includes("festas")) return PartyPopper;
  if (s.includes("delivery")) return Bike;
  if (s.includes("buffet") || s.includes("restaurante")) return UtensilsCrossed;
  if (s.includes("confeitaria") || s.includes("bolo")) return CakeSlice;
  if (s.includes("sorveteria") || s.includes("acai")) return IceCream2;
  if (s.includes("bar") || s.includes("distribuidora")) return Wine;
  if (s.includes("epi") || s.includes("protecao")) return ShieldCheck;
  if (s.includes("automacao") || s.includes("pdv")) return Receipt;
  return Store;
}

export function getCategoryPromoMeta(
  slug: string,
  name?: string,
  imagePath?: string | null,
): MegaMenuBannerMeta {
  const s = slug.toLowerCase();
  const customImage = resolveStorefrontAssetUrl(imagePath);

  if (s.includes("saco") || s.includes("sacola") || s.includes("bobina")) {
    return {
      tag: "SACOS & SACOLAS",
      title: name || "Sacolas Plásticas e Kraft no Atacado",
      description: "Variedade em tamanhos, espessuras reforçadas e fardos promocionais para seu comércio.",
      imageUrl: customImage || "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-sacolas.jpg",
    };
  }
  if (s.includes("confeit") || s.includes("doce") || s.includes("bomboniere") || s.includes("chocolate")) {
    return {
      tag: "CONFEITARIA & DOCES",
      title: name || "Embalagens e Insumos para Bolos e Doces",
      description: "Valorize suas receitas com coberturas, cachetas, discos e caixas estruturadas.",
      imageUrl: customImage || "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-confeitaria.jpg",
    };
  }
  if (s.includes("festa")) {
    return {
      tag: "FESTAS & EVENTOS",
      title: name || "Decoração e Suprimentos para Festas",
      description: "Variedade completa para aniversários, eventos e comemorações no atacado.",
      imageUrl: customImage || "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-festas.jpg",
    };
  }
  if (s.includes("limpeza") || s.includes("higiene") || s.includes("epi") || s.includes("protecao")) {
    return {
      tag: "LIMPEZA & PROTEÇÃO",
      title: name || "Linha Institucional e EPIs Descartáveis",
      description: "Domissanitários, papéis institucionais, luvas e proteção com alto rendimento.",
      imageUrl: customImage || "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-limpeza.jpg",
    };
  }
  if (s.includes("descartav") || s.includes("copo") || s.includes("talher") || s.includes("prato")) {
    return {
      tag: "DESCARTÁVEIS",
      title: name || "Copos, Pratos e Talheres em Caixa Fechada",
      description: "Abasteça lanchonetes, eventos e restaurantes com entrega expressa em Belém.",
      imageUrl: customImage || "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-descartaveis.jpg",
    };
  }
  if (s.includes("filme") || s.includes("insumo") || s.includes("mercearia") || s.includes("frio")) {
    return {
      tag: "FOOD SERVICE",
      title: name || "Filmes, Papéis e Insumos Profissionais",
      description: "Rolos de PVC, papel alumínio, molhos e utilidades essenciais para operação diária.",
      imageUrl: customImage || "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-foodservice.jpg",
    };
  }
  return {
    tag: "ATACADO & DELIVERY",
    title: name || "Embalagens Térmicas para Restaurantes e Delivery",
    description: "Caixas master e embalagens resistentes com desconto progressivo no atacado.",
    imageUrl: customImage || "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-embalagens.jpg",
  };
}
