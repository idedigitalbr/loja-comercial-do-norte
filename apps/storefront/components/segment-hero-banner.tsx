"use client";

import React, { useState } from "react";
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
  pizzaria: {
    prefix: "O COMERCIAL",
    highlight: "DA SUA PIZZARIA",
    imageSrc: "/assets/segmentos/pizzaria.png",
    altText: "O Comercial da Sua Pizzaria — Caixas de pizza, embalagens térmicas e descartáveis para delivery",
    backgroundColor: "#0059E9",
  },
  lanchonete: {
    prefix: "O COMERCIAL",
    highlight: "DA SUA LANCHONETE",
    imageSrc: "/assets/segmentos/lanchonete.png",
    altText: "O Comercial da Sua Lanchonete — Descartáveis, copos, guardanapos e embalagens térmicas",
    backgroundColor: "#0059E9",
  },
  padaria: {
    prefix: "O COMERCIAL",
    highlight: "DA SUA PADARIA",
    imageSrc: "/assets/segmentos/padaria.png",
    altText: "O Comercial da Sua Padaria — Formas forneáveis, sacos kraft, bandejas e descartáveis",
    backgroundColor: "#0059E9",
  },
  "loja-de-festas": {
    prefix: "O COMERCIAL",
    highlight: "DA SUA FESTA",
    imageSrc: "/assets/segmentos/loja-de-festas.png",
    altText: "O Comercial da Sua Festa — Copos personalizados, pratos, forminhas e artigos para eventos",
    backgroundColor: "#0059E9",
  },
  "restaurante-buffet": {
    prefix: "O COMERCIAL",
    highlight: "DO SEU RESTAURANTE",
    imageSrc: "/assets/segmentos/restaurante-buffet.png",
    altText: "O Comercial do Seu Restaurante — Marmitas térmicas, travessas de alumínio e descartáveis",
    backgroundColor: "#0059E9",
  },
  "confeitaria-bolos": {
    prefix: "O COMERCIAL",
    highlight: "DA SUA CONFEITARIA",
    imageSrc: "/assets/segmentos/confeitaria-bolos.png",
    altText: "O Comercial da Sua Confeitaria — Embalagens para bolos, tortas, doces e fitas decorativas",
    backgroundColor: "#0059E9",
  },
  "sorveteria-acai": {
    prefix: "O COMERCIAL",
    highlight: "DO SEU AÇAÍ",
    imageSrc: "/assets/segmentos/sorveteria-acai.png",
    altText: "O Comercial do Seu Açaí — Potes térmicos, copos com tampa bolha e colheres",
    backgroundColor: "#0059E9",
  },
  "bar-distribuidora": {
    prefix: "O COMERCIAL",
    highlight: "DO SEU BAR",
    imageSrc: "/assets/segmentos/bar-distribuidora.png",
    altText: "O Comercial do Seu Bar — Copos descartáveis para chopp, petisqueiras e sacolas reforçadas",
    backgroundColor: "#0059E9",
  },
};

/**
 * Traço de pincel estilizado branco (SVG vetorial orgânico)
 * Reproduz com fidelidade o sublinhado do banner de referência.
 */
export function BrushUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 320 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 16.5C32 11.2 78 7.8 135 7.2C192 6.6 250 8.8 314 14.2C292 11.8 238 8.6 182 8.2C124 7.8 68 10.4 6 16.5Z"
        fill="currentColor"
      />
      <path
        d="M28 14.8C74 9.8 136 7.6 198 8.5C246 9.2 288 11.5 312 13.5C275 10.8 218 8.2 162 8.0C104 7.8 54 10.2 28 14.8Z"
        fill="currentColor"
      />
      <path
        d="M75 16.2C120 12.8 175 12.2 225 14.0C250 14.9 270 16.2 280 17.0C255 15.2 225 13.8 190 13.5C148 13.1 105 14.5 75 16.2Z"
        fill="currentColor"
        opacity="0.85"
      />
      <ellipse cx="205" cy="20" fill="currentColor" opacity="0.75" rx="6" ry="1.2" />
      <ellipse cx="235" cy="19.5" fill="currentColor" opacity="0.9" rx="10" ry="1.5" />
    </svg>
  );
}

/**
 * Resolve dinamicamente a configuração do banner para qualquer slug ou nome de segmento.
 */
export function resolveSegmentBanner(
  segmentOrSlug?: ApiSegment | string | null,
  override?: Partial<SegmentBannerConfig>
): SegmentBannerConfig {
  const slug =
    typeof segmentOrSlug === "string"
      ? segmentOrSlug
      : segmentOrSlug?.slug ?? "";
  const name =
    typeof segmentOrSlug === "object" && segmentOrSlug?.name
      ? segmentOrSlug.name
      : "";

  const mapped = slug ? SEGMENT_BANNER_MAP[slug] : null;

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

  return {
    prefix: override?.prefix ?? "O COMERCIAL",
    highlight: override?.highlight ?? (isFeminine ? `DA SUA ${cleanTitle}` : `DO SEU ${cleanTitle}`),
    imageSrc: override?.imageSrc ?? (slug ? `/assets/segmentos/${slug}.png` : "/assets/segmentos/default.png"),
    altText:
      override?.altText ??
      `O Comercial para ${name || "seu segmento"} — Embalagens e descartáveis`,
    backgroundColor: override?.backgroundColor ?? "#0059E9",
  };
}

export interface SegmentHeroBannerProps {
  segment?: ApiSegment | string | null;
  banner?: Partial<SegmentBannerConfig>;
}

/**
 * Banner Oficial de Topo para Páginas de Segmento.
 * Segue rigorosamente a referência visual da Comercial do Norte:
 * - Largura total no topo (mesmo tamanho e altura do Hero da Home)
 * - Cantos inferiores arredondados com sombra e fundo #EBEBEB em volta
 * - Fundo em cor sólida (#0059E9)
 * - Imagem PNG centralizada horizontalmente e ancorada na base (bottom-0)
 * - Lado esquerdo: "O COMERCIAL" em branco bold
 * - Lado direito: "DA SUA PIZZARIA" / "DO SEU RESTAURANTE" em vermelho vibrante com traço de pincel branco abaixo
 */
export function SegmentHeroBanner({
  segment,
  banner: bannerOverride,
}: SegmentHeroBannerProps) {
  const config = resolveSegmentBanner(segment, bannerOverride);
  const fallbackImg = "/assets/segmentos/default.png";

  const [imgSrc, setImgSrc] = useState<string>(
    config.imageSrc || fallbackImg
  );

  // Divide highlight para quebra elegante em telas mobile pequenas ("DA SUA" / "PIZZARIA")
  const highlightWords = config.highlight.split(" ");
  const highlightLead =
    highlightWords.length > 2
      ? highlightWords.slice(0, 2).join(" ")
      : highlightWords[0] ?? "";
  const highlightRest =
    highlightWords.length > 2
      ? highlightWords.slice(2).join(" ")
      : highlightWords.slice(1).join(" ");

  return (
    <section
      aria-label={`Banner: ${config.prefix} ${config.highlight}`}
      className="relative w-full overflow-hidden select-none bg-[#EBEBEB]"
    >
      <div
        className="relative w-full overflow-hidden rounded-b-[28px] sm:rounded-b-[36px] md:rounded-b-[44px] shadow-md"
        style={{
          backgroundColor: config.backgroundColor ?? "#0059E9",
        }}
      >
        <div className="relative w-full h-[180px] sm:h-[210px] md:h-[236px] lg:h-[250px] xl:h-[280px] flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-[1440px] h-full mx-auto px-3 sm:px-6 md:px-10 flex items-center justify-between">
            {/* LADO ESQUERDO: "O COMERCIAL" */}
            <div className="flex-1 flex flex-col items-end justify-center z-10 pr-2 sm:pr-4 md:pr-8 lg:pr-12">
              <span className="text-right font-black uppercase tracking-tight text-white leading-tight sm:leading-none text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-[44px] drop-shadow-sm whitespace-nowrap">
                {config.prefix}
              </span>
            </div>

            {/* CENTRO: Imagem PNG da pessoa / produto centralizada e colada na base */}
            <div className="relative h-full flex items-end justify-center shrink-0 z-20 pointer-events-none px-1 sm:px-2 md:px-4">
              {/* eslint-disable-next-js/next/no-img-element */}
              <img
                alt={config.altText ?? `${config.prefix} ${config.highlight}`}
                className="h-[92%] sm:h-[95%] md:h-[98%] lg:h-full w-auto max-w-[150px] xs:max-w-[180px] sm:max-w-[280px] md:max-w-[380px] lg:max-w-[460px] object-contain object-bottom drop-shadow-[0_12px_24px_rgba(0,0,0,0.28)] transition-transform duration-300"
                fetchPriority="high"
                loading="eager"
                onError={() => {
                  if (imgSrc !== fallbackImg) {
                    setImgSrc(fallbackImg);
                  }
                }}
                src={imgSrc}
              />
            </div>

            {/* LADO DIREITO: "DA SUA PIZZARIA" / "DO SEU RESTAURANTE" + Traço de Pincel */}
            <div className="flex-1 flex flex-col items-start justify-center z-10 pl-2 sm:pl-4 md:pl-8 lg:pl-12">
              <span className="text-left font-black uppercase tracking-tight text-[#FF2E2E] leading-tight sm:leading-none text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-[44px] drop-shadow-sm">
                <span>{highlightLead} </span>
                <span className="sm:inline block">{highlightRest}</span>
              </span>
              <BrushUnderline className="w-[100px] xs:w-[130px] sm:w-[170px] md:w-[220px] lg:w-[280px] xl:w-[320px] h-auto mt-1 sm:mt-1.5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
