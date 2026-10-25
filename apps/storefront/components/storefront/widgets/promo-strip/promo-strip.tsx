'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Clock, Grid2X2, MessageCircle, Percent, Tag, Truck } from 'lucide-react';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { PromoStripBadge, PromoStripProps } from '@/lib/storefront/widget-types';

function BadgeIcon({ icon }: { icon?: PromoStripBadge['icon'] }) {
  switch (icon) {
    case 'tag':
      return <Tag className="size-4 text-white" />;
    case 'grid':
      return <Grid2X2 className="size-4 text-white" />;
    case 'whatsapp':
      return <MessageCircle className="size-4 text-white" />;
    case 'percent':
      return <Percent className="size-4 text-white" />;
    case 'clock':
      return <Clock className="size-4 text-white" />;
    case 'truck':
      return <Truck className="size-4 text-white" />;
    default:
      return <Tag className="size-4 text-white" />;
  }
}

export function PromoStripWidget({
  widgetId,
  variant = 'offers-strip',
  title,
  highlightText,
  subtitle,
  badges = [],
  ctaLabel,
  ctaUrl = '/cotacao',
  mascotImageUrl = '/assets/imgs/Mascote-3D-James-em-pe/principais/james-11-piscando.png',
  rightImageUrl = '/assets/home-ref/s17-whatsapp-phones.jpg',
}: PromoStripProps) {
  const { isEditing, previewMode } = useElementor();

  // Variante 1: Seção 09 — Faixa OFERTAS IMPERDÍVEIS (fundo azul marinho full-width com pílula central)
  if (variant === 'offers-strip') {
    return (
      <section aria-label={title} className="w-full bg-[#001F4D] py-4 sm:py-5">
        <div className="cn-container">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/15 bg-gradient-to-r from-[#002D72] via-[#7A091B] to-[#002D72] px-5 py-3 shadow-lg lg:flex-row lg:px-7">
            {/* Logo Comercial do Norte Branca */}
            <div className="flex shrink-0 items-center">
              <Image
                alt="Comercial do Norte"
                className="h-9 w-auto object-contain"
                height={40}
                src="/assets/Logos/logo-comercial-do-norte-branca.png"
                unoptimized
                width={150}
              />
            </div>

            {/* Texto OFERTAS IMPERDÍVEIS + em embalagens, descartáveis e utilidades */}
            <div className="text-center lg:text-left">
              <p className="text-sm font-black uppercase leading-tight tracking-wide text-white sm:text-base">
                <span>OFERTAS </span>
                <span className="text-[#FF1E32]">IMPERDÍVEIS</span>
              </p>
              <p className="text-[11px] font-medium text-white/90 sm:text-xs">
                {title || 'em embalagens, descartáveis e utilidades'}
              </p>
            </div>

            {/* Imagem central dos itens descartáveis (copos, pratos, sacolas) */}
            <div className="hidden h-14 w-36 shrink-0 overflow-hidden rounded-lg xl:block">
              <Image
                alt="Embalagens e descartáveis em oferta"
                className="size-full object-cover object-center"
                height={150}
                src="/assets/home-ref/s09-offers-center-items.jpg"
                unoptimized
                width={320}
              />
            </div>

            {/* 3 Selos à direita com caixas contornadas e divisórias verticais */}
            <div className="flex flex-wrap items-center justify-center divide-x divide-white/20">
              {badges.map((b, idx) => (
                <div
                  className="flex items-center gap-2.5 px-3.5 py-1 first:pl-0 last:pr-0"
                  key={idx}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/35 bg-white/10">
                    <BadgeIcon icon={b.icon} />
                  </span>
                  <span className="max-w-[74px] text-[11px] font-bold leading-tight text-white">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variante 2: Seção 13 — CONDIÇÕES ESPECIAIS para o seu negócio (Logo + Mascote James + texto + sacolas + 4 selos)
  if (variant === 'conditions-mascot') {
    return (
      <section aria-label={title} className="cn-container py-4 sm:py-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-[#002868] via-[#6D0D26] to-[#1A0D2A] px-5 py-3.5 shadow-lg sm:px-7">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            {/* Esquerda: Logo + Mascote James + Título */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Image
                alt="Comercial do Norte"
                className="h-8 w-auto object-contain sm:h-9"
                height={40}
                src="/assets/Logos/logo-comercial-do-norte-branca.png"
                unoptimized
                width={145}
              />

              <div className="group/img relative hidden h-16 w-16 shrink-0 sm:block">
                <Image
                  alt="Mascote James Comercial do Norte"
                  className="size-full object-contain object-bottom drop-shadow-md"
                  height={110}
                  src={mascotImageUrl}
                  unoptimized
                  width={110}
                />
                {widgetId ? (
                  <InlineImageEditorOverlay
                    canAdd={false}
                    canRemove={false}
                    currentLinkUrl={ctaUrl}
                    fieldPath="mascotImageUrl"
                    linkFieldPath="ctaUrl"
                    previewUrl={mascotImageUrl}
                    slideIndex={0}
                    title="Mascote Condições Especiais"
                    widgetId={widgetId}
                  />
                ) : null}
              </div>

              <div className="text-center sm:text-left">
                <p className="text-sm font-black uppercase leading-none tracking-wide text-white sm:text-base">
                  CONDIÇÕES
                </p>
                <p className="text-sm font-black uppercase leading-tight tracking-wide text-[#FF1E32] sm:text-base">
                  ESPECIAIS
                </p>
                <p className="text-[11px] font-medium text-white/90 sm:text-xs">
                  {title || 'para o seu negócio'}
                </p>
              </div>

              {/* Imagem de sacolas/embalagens ao centro */}
              <div className="hidden h-14 w-28 shrink-0 overflow-hidden rounded-lg xl:block">
                <Image
                  alt="Sacolas e embalagens Comercial do Norte"
                  className="size-full object-cover object-center"
                  height={160}
                  src="/assets/home-ref/s13-conditions-items.jpg"
                  unoptimized
                  width={260}
                />
              </div>
            </div>

            {/* Direita: 4 colunas com ícone acima do texto e divisórias verticais */}
            <div className="grid grid-cols-2 divide-x divide-white/15 sm:grid-cols-4">
              {badges.map((b, idx) => (
                <div
                  className="flex flex-col items-center justify-center gap-1.5 px-3.5 py-1 text-center"
                  key={idx}
                >
                  <span className="flex size-8 items-center justify-center rounded-lg border border-white/35 bg-white/10">
                    <BadgeIcon icon={b.icon} />
                  </span>
                  <span className="max-w-[105px] text-[10px] font-semibold leading-tight text-white/95">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variante 3: Seção 17 — Entre em nosso Grupo de ofertas Exclusivas do WhatsApp
  return (
    <section aria-label={title} className="cn-container py-4 sm:py-6">
      <div className="relative overflow-hidden rounded-2xl bg-[#00449E] shadow-[0_8px_28px_rgba(0,53,123,0.18)]">
        <div className="grid grid-cols-1 items-center lg:grid-cols-12">
          {/* Arte Mascote + Ícones 3D à esquerda */}
          <div className="group/img relative hidden h-full min-h-[250px] overflow-hidden lg:col-span-4 lg:block">
            <Image
              alt="Mascote Comercial do Norte WhatsApp"
              className="size-full object-cover object-center"
              height={420}
              src={mascotImageUrl}
              unoptimized
              width={640}
            />
            {widgetId ? (
              <InlineImageEditorOverlay
                canAdd={false}
                canRemove={false}
                currentLinkUrl={ctaUrl}
                fieldPath="mascotImageUrl"
                linkFieldPath="ctaUrl"
                previewUrl={mascotImageUrl}
                slideIndex={0}
                title="Mascote Grupo WhatsApp"
                widgetId={widgetId}
              />
            ) : null}
          </div>

          {/* Texto + Barra Vermelha + Botão Contornado Central */}
          <div className="px-6 py-7 text-center lg:col-span-4 lg:px-4 lg:text-left">
            <p className="text-base font-medium text-blue-100 sm:text-lg">
              Entre em nosso
            </p>
            <h2 className="mt-0.5 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              Grupo de ofertas
              <span className="block">Exclusivas do WhatsApp</span>
            </h2>
            <div className="mx-auto mt-2.5 h-1 w-24 rounded-full bg-[#E2091E] lg:mx-0" />

            {subtitle ? (
              <p className="mt-3 text-xs leading-relaxed text-blue-100 sm:text-sm">
                {subtitle}
              </p>
            ) : null}

            <div className="mt-5">
              <Link
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/45 bg-[#002E73]/90 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#002258] sm:text-sm"
                href={ctaUrl}
                onClick={(e) => {
                  if (isEditing && !previewMode) e.preventDefault();
                }}
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-[#E2091E] text-white">
                  <MessageCircle className="size-3 fill-white text-white" />
                </span>
                <span>{ctaLabel || 'Participar do Grupo WhatsApp'}</span>
                <ChevronRight className="size-4 text-white/80" />
              </Link>
            </div>
          </div>

          {/* Arte Mockup Celular WhatsApp à direita */}
          <div className="group/img relative hidden h-full min-h-[250px] overflow-hidden lg:col-span-4 lg:block">
            <Image
              alt="Grupo de Ofertas WhatsApp Comercial do Norte"
              className="size-full object-cover object-center"
              height={655}
              src={rightImageUrl}
              unoptimized
              width={760}
            />
            {widgetId ? (
              <InlineImageEditorOverlay
                canAdd={false}
                canRemove={false}
                currentLinkUrl={ctaUrl}
                fieldPath="rightImageUrl"
                linkFieldPath="ctaUrl"
                previewUrl={rightImageUrl}
                slideIndex={0}
                title="Arte Direita Grupo WhatsApp"
                widgetId={widgetId}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
