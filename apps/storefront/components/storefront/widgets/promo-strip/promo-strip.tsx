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
      return <Tag className="size-3.5 text-amber-300" />;
    case 'grid':
      return <Grid2X2 className="size-3.5 text-amber-300" />;
    case 'whatsapp':
      return <MessageCircle className="size-3.5 text-emerald-400" />;
    case 'percent':
      return <Percent className="size-3.5 text-amber-300" />;
    case 'clock':
      return <Clock className="size-3.5 text-amber-300" />;
    case 'truck':
      return <Truck className="size-3.5 text-amber-300" />;
    default:
      return <Tag className="size-3.5 text-amber-300" />;
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
  mascotImageUrl = '/assets/imgs/Mascote-3D-James-em-pe/principais/Mascote 3D sorridente com joinha.png',
  rightImageUrl = '/assets/home-ref/s17-whatsapp-phones.jpg',
}: PromoStripProps) {
  const { isEditing, previewMode } = useElementor();

  // Variante 1: Seção 09 — Faixa OFERTAS IMPERDÍVEIS (fundo azul marinho full-width com pílula vermelha/azul central)
  if (variant === 'offers-strip') {
    return (
      <section aria-label={title} className="w-full bg-[#001F4D] py-4 sm:py-5">
        <div className="cn-container">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/15 bg-gradient-to-r from-[#00357B] via-[#C8081A] to-[#00357B] px-5 py-3.5 shadow-lg lg:flex-row lg:px-8">
            <div className="flex items-center gap-3">
              <Image
                alt="Comercial do Norte"
                className="h-9 w-auto object-contain"
                height={40}
                src="/assets/Logos/logo-comercial-do-norte-branca.png"
                unoptimized
                width={150}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-center">
              <span className="rounded-md bg-[#E2091E] px-2.5 py-1 text-sm font-black uppercase tracking-wide text-white shadow-xs sm:text-base">
                {highlightText || 'OFERTAS IMPERDÍVEIS'}
              </span>
              <span className="text-sm font-semibold text-white sm:text-base">
                {title || 'em embalagens, descartáveis e utilidades'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {badges.map((b, idx) => (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#00285E]/90 px-3 py-1.5 text-xs font-bold text-white"
                  key={idx}
                >
                  <BadgeIcon icon={b.icon} />
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variante 2: Seção 13 — CONDIÇÕES ESPECIAIS para o seu negócio (Mascote James dando joinha + 4 selos)
  if (variant === 'conditions-mascot') {
    return (
      <section aria-label={title} className="cn-container py-4 sm:py-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-[#002B66] via-[#00449E] to-[#9E0B18] px-5 py-4 shadow-lg sm:px-8 sm:py-5">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div className="flex items-center gap-4">
              <div className="group/img relative hidden h-20 w-20 shrink-0 sm:block">
                <Image
                  alt="Mascote James Comercial do Norte"
                  className="size-full object-contain object-bottom drop-shadow-md"
                  height={120}
                  src={mascotImageUrl}
                  unoptimized
                  width={120}
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

              <div className="flex items-center gap-3">
                <Image
                  alt="Comercial do Norte"
                  className="hidden h-8 w-auto object-contain md:block"
                  height={36}
                  src="/assets/Logos/logo-comercial-do-norte-branca.png"
                  unoptimized
                  width={135}
                />
                <div>
                  <span className="inline-block rounded bg-[#E2091E] px-2 py-0.5 text-xs font-black uppercase tracking-wider text-white sm:text-sm">
                    {highlightText || 'CONDIÇÕES ESPECIAIS'}
                  </span>
                  <p className="mt-0.5 text-sm font-bold text-white sm:text-base">
                    {title || 'para o seu negócio'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {badges.map((b, idx) => (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs"
                  key={idx}
                >
                  <BadgeIcon icon={b.icon} />
                  {b.label}
                </span>
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#002B66] via-[#00449E] to-[#0059CC] shadow-[0_8px_28px_rgba(0,53,123,0.18)]">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
          {/* Mascote à esquerda */}
          <div className="group/img relative hidden h-full min-h-[230px] items-end justify-center pt-4 lg:col-span-3 lg:flex">
            <Image
              alt="Mascote Comercial do Norte WhatsApp"
              className="h-[220px] w-auto object-contain object-bottom drop-shadow-xl"
              height={320}
              src={mascotImageUrl}
              unoptimized
              width={240}
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

          {/* Texto + Botão Central */}
          <div className="px-6 py-7 text-center lg:col-span-5 lg:px-2 lg:text-left">
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              {title || 'Entre em nosso Grupo de ofertas'}{' '}
              <span className="mt-1 inline-block rounded-lg bg-[#E2091E] px-2.5 py-0.5 text-white">
                {highlightText || 'Exclusivas do WhatsApp'}
              </span>
            </h2>
            {subtitle ? (
              <p className="mt-2.5 text-xs leading-relaxed text-blue-100 sm:text-sm">
                {subtitle}
              </p>
            ) : null}

            <div className="mt-5">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-extrabold text-[#00357B] shadow-md transition hover:scale-105 hover:bg-blue-50 sm:text-sm"
                href={ctaUrl}
                onClick={(e) => {
                  if (isEditing && !previewMode) e.preventDefault();
                }}
              >
                <MessageCircle className="size-4 fill-emerald-500 text-emerald-500" />
                <span>{ctaLabel || 'Participar do Grupo WhatsApp'}</span>
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Arte Mockup Celular WhatsApp à direita */}
          <div className="group/img relative hidden h-full min-h-[230px] overflow-hidden lg:col-span-4 lg:block">
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
