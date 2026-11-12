import type { ApiSegment } from "@/lib/types";

export interface SegmentBannerConfig {
  prefix: string;
  highlight: string;
  imageSrc?: string;
  altText?: string;
  backgroundColor?: string;
}

/**
 * Mapeamento canônico dos segmentos da Comercial do Norte.
 * Lado esquerdo: "O COMERCIAL"
 * Centro: Imagem PNG da pessoa / insumo
 * Lado direito: "DA SUA PIZZARIA" / "DO SEU RESTAURANTE" / etc.
 */
export const SEGMENT_BANNER_MAP: Record<string, SegmentBannerConfig> = {
  delivery: {
    prefix: "O COMERCIAL",
    highlight: "DO SEU DELIVERY",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-delivery.png.webp",
    altText: "O Comercial do Seu Delivery — Sacolas kraft, lacres invioláveis, embalagens térmicas e caixas",
    backgroundColor: "#0059E9",
  },
  pizzaria: {
    prefix: "O COMERCIAL",
    highlight: "DA SUA PIZZARIA",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-pizzaria.png.webp",
    altText: "O Comercial da Sua Pizzaria — Caixas de pizza, embalagens térmicas e descartáveis para delivery",
    backgroundColor: "#0059E9",
  },
  lanchonete: {
    prefix: "O COMERCIAL",
    highlight: "DA SUA LANCHONETE",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-lanchonete.png.webp",
    altText: "O Comercial da Sua Lanchonete — Descartáveis, copos, guardanapos e embalagens térmicas",
    backgroundColor: "#0059E9",
  },
  padaria: {
    prefix: "O COMERCIAL",
    highlight: "DA SUA PADARIA",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-padaria.png.webp",
    altText: "O Comercial da Sua Padaria — Formas forneáveis, sacos kraft, bandejas e descartáveis",
    backgroundColor: "#0059E9",
  },
  "loja-de-festas": {
    prefix: "O COMERCIAL",
    highlight: "DA SUA FESTA",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-festas.png.webp",
    altText: "O Comercial da Sua Festa — Copos personalizados, pratos, forminhas e artigos para eventos",
    backgroundColor: "#0059E9",
  },
  festas: {
    prefix: "O COMERCIAL",
    highlight: "DA SUA FESTA",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-festas.png.webp",
    altText: "O Comercial da Sua Festa — Copos personalizados, pratos, forminhas e artigos para eventos",
    backgroundColor: "#0059E9",
  },
  festa: {
    prefix: "O COMERCIAL",
    highlight: "DA SUA FESTA",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-festas.png.webp",
    altText: "O Comercial da Sua Festa — Copos personalizados, pratos, forminhas e artigos para eventos",
    backgroundColor: "#0059E9",
  },
  "restaurante-buffet": {
    prefix: "O COMERCIAL",
    highlight: "DO SEU RESTAURANTE",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-restaurante-buffet.png.webp",
    altText: "O Comercial do Seu Restaurante — Marmitas térmicas, travessas de alumínio e descartáveis",
    backgroundColor: "#0059E9",
  },
  buffet: {
    prefix: "O COMERCIAL",
    highlight: "DO SEU RESTAURANTE",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-restaurante-buffet.png.webp",
    altText: "O Comercial do Seu Restaurante — Marmitas térmicas, travessas de alumínio e descartáveis",
    backgroundColor: "#0059E9",
  },
  restaurante: {
    prefix: "O COMERCIAL",
    highlight: "DO SEU RESTAURANTE",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-restaurante-buffet.png.webp",
    altText: "O Comercial do Seu Restaurante — Marmitas térmicas, travessas de alumínio e descartáveis",
    backgroundColor: "#0059E9",
  },
  "confeitaria-bolos": {
    prefix: "O COMERCIAL",
    highlight: "DA SUA CONFEITARIA",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-confeitaria-bolos.png.webp",
    altText: "O Comercial da Sua Confeitaria — Embalagens para bolos, tortas, doces e fitas decorativas",
    backgroundColor: "#0059E9",
  },
  confeitaria: {
    prefix: "O COMERCIAL",
    highlight: "DA SUA CONFEITARIA",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-confeitaria-bolos.png.webp",
    altText: "O Comercial da Sua Confeitaria — Embalagens para bolos, tortas, doces e fitas decorativas",
    backgroundColor: "#0059E9",
  },
  "sorveteria-acai": {
    prefix: "O COMERCIAL",
    highlight: "DO SEU AÇAÍ",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-sorveteria-acai.png.webp",
    altText: "O Comercial do Seu Açaí — Potes térmicos, copos com tampa bolha e colheres",
    backgroundColor: "#0059E9",
  },
  acai: {
    prefix: "O COMERCIAL",
    highlight: "DO SEU AÇAÍ",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-sorveteria-acai.png.webp",
    altText: "O Comercial do Seu Açaí — Potes térmicos, copos com tampa bolha e colheres",
    backgroundColor: "#0059E9",
  },
  sorveteria: {
    prefix: "O COMERCIAL",
    highlight: "DO SEU AÇAÍ",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-sorveteria-acai.png.webp",
    altText: "O Comercial do Seu Açaí — Potes térmicos, copos com tampa bolha e colheres",
    backgroundColor: "#0059E9",
  },
  "bar-distribuidora": {
    prefix: "O COMERCIAL",
    highlight: "DO SEU BAR",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-bar-distribuidora.png.webp",
    altText: "O Comercial do Seu Bar — Copos descartáveis para chopp, petisqueiras e sacolas reforçadas",
    backgroundColor: "#0059E9",
  },
  bar: {
    prefix: "O COMERCIAL",
    highlight: "DO SEU BAR",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-bar-distribuidora.png.webp",
    altText: "O Comercial do Seu Bar — Copos descartáveis para chopp, petisqueiras e sacolas reforçadas",
    backgroundColor: "#0059E9",
  },
  distribuidora: {
    prefix: "O COMERCIAL",
    highlight: "DO SEU BAR",
    imageSrc: "/assets/PRODUTOS/segmentos/segmento-bar-distribuidora.png.webp",
    altText: "O Comercial do Seu Bar — Copos descartáveis para chopp, petisqueiras e sacolas reforçadas",
    backgroundColor: "#0059E9",
  },
};

/**
 * Resolve dinamicamente a configuração do banner para qualquer slug ou nome de segmento.
 * Módulo sem "use client" para poder ser chamado por Server Components (ex.: /segmentos).
 */
export function resolveSegmentBanner(
  segmentOrSlug?: ApiSegment | string | null,
  override?: Partial<SegmentBannerConfig>
): SegmentBannerConfig {
  const rawSlug =
    typeof segmentOrSlug === "string"
      ? segmentOrSlug
      : segmentOrSlug?.slug ?? "";
  const name =
    typeof segmentOrSlug === "object" && segmentOrSlug?.name
      ? segmentOrSlug.name
      : "";

  const slug = (rawSlug || "").toLowerCase().trim();
  const normalizedSlug = slug.replace(/^segmento-/, "");

  const mapped = slug
    ? SEGMENT_BANNER_MAP[slug] ?? SEGMENT_BANNER_MAP[normalizedSlug]
    : null;

  if (mapped) {
    return {
      prefix: override?.prefix ?? mapped.prefix,
      highlight: override?.highlight ?? mapped.highlight,
      imageSrc: override?.imageSrc ?? mapped.imageSrc,
      altText: override?.altText ?? mapped.altText,
      backgroundColor: override?.backgroundColor ?? mapped.backgroundColor,
    };
  }

  // Resolução inteligente baseada em gênero gramatical
  const lowerName = name.toLowerCase();
  const lowerSlug = slug.toLowerCase();
  const isFeminine =
    lowerName.includes("loja") ||
    lowerName.includes("padaria") ||
    lowerName.includes("pizzaria") ||
    lowerName.includes("confeitaria") ||
    lowerName.includes("lanchonete") ||
    lowerName.includes("hamburgueria") ||
    lowerName.includes("sorveteria") ||
    lowerName.includes("distribuidora") ||
    lowerName.includes("farmacia") ||
    lowerName.includes("festa") ||
    lowerSlug.includes("pizzaria") ||
    lowerSlug.includes("lanchonete") ||
    lowerSlug.includes("padaria") ||
    lowerSlug.includes("confeitaria") ||
    lowerSlug.includes("hamburgueria");

  const cleanTitle = name
    ? name.split("&")[0].trim().toUpperCase()
    : "NEGÓCIO";

  const defaultImage =
    "/assets/HOME Vitrine/S0-HEADER/Mascote-3D-NORT/corpo-inteiro/nort-apontando-joinha.png";

  return {
    prefix: override?.prefix ?? "O COMERCIAL",
    highlight: override?.highlight ?? (isFeminine ? `DA SUA ${cleanTitle}` : `DO SEU ${cleanTitle}`),
    imageSrc:
      override?.imageSrc ??
      (normalizedSlug
        ? `/assets/PRODUTOS/segmentos/segmento-${normalizedSlug}.png.webp`
        : defaultImage),
    altText:
      override?.altText ??
      `O Comercial para ${name || "seu segmento"} — Embalagens e descartáveis`,
    backgroundColor: override?.backgroundColor ?? "#0059E9",
  };
}
