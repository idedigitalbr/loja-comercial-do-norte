"use client";

import React, { useState } from "react";
import type { ApiSegment } from "@/lib/types";
import {
  SEGMENT_BANNER_MAP,
  resolveSegmentBanner,
  type SegmentBannerConfig,
} from "@/lib/segment-banner-config";

export { SEGMENT_BANNER_MAP, resolveSegmentBanner };
export type { SegmentBannerConfig };

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
 * - Imagem PNG/WebP centralizada horizontalmente e ancorada na base (bottom-0)
 * - Lado esquerdo: "O COMERCIAL" em branco bold
 * - Lado direito: "DA SUA PIZZARIA" / "DO SEU RESTAURANTE" em vermelho vibrante com traço de pincel branco abaixo
 */
export function SegmentHeroBanner({
  segment,
  banner: bannerOverride,
}: SegmentHeroBannerProps) {
  const config = resolveSegmentBanner(segment, bannerOverride);
  const fallbackImg =
    "/assets/HOME Vitrine/S0-HEADER/Mascote-3D-NORT/corpo-inteiro/nort-apontando-joinha.png";

  const [imgSrc, setImgSrc] = useState<string | null>(
    config.imageSrc || fallbackImg
  );
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setImgSrc(config.imageSrc || fallbackImg);
    setImageError(false);
  }, [config.imageSrc, fallbackImg]);

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

            {/* CENTRO: Imagem PNG/WebP da pessoa / produto centralizada e colada na base */}
            <div className="relative h-full flex items-end justify-center shrink-0 z-20 pointer-events-none px-1 sm:px-2 md:px-4">
              {imgSrc && !imageError ? (
                /* eslint-disable-next-js/next/no-img-element */
                <img
                  alt={config.altText ?? `${config.prefix} ${config.highlight}`}
                  className="h-[92%] sm:h-[95%] md:h-[98%] lg:h-full w-auto max-w-[150px] xs:max-w-[180px] sm:max-w-[280px] md:max-w-[380px] lg:max-w-[460px] xl:max-w-[520px] object-contain object-bottom drop-shadow-[0_12px_24px_rgba(0,0,0,0.28)] transition-transform duration-300"
                  fetchPriority="high"
                  loading="eager"
                  onError={() => {
                    if (imgSrc !== fallbackImg) {
                      setImgSrc(fallbackImg);
                    } else {
                      setImageError(true);
                    }
                  }}
                  src={imgSrc}
                />
              ) : null}
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
