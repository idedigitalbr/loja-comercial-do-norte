'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ImageIcon, MessageCircle } from 'lucide-react';
import { WhatsappPhoneAnimation } from './whatsapp-phone-animation';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { PromoStripProps } from '@/lib/storefront/widget-types';

export function PromoStripWidget({
  widgetId,
  variant = 'offers-strip',
  title,
  highlightText,
  subtitle,
  badges = [],
  ctaLabel,
  ctaUrl,
  imageUrl,
  altText,
  mascotImageUrl = '/assets/HOME Vitrine/S0-HEADER/Mascote-3D-NORT/principais/nort-11-piscando.png',
  rightImageUrl = '/assets/HOME Vitrine/S0-HEADER/Mascote-3D-NORT/principais/nort-09-celular.png',
}: PromoStripProps) {
  const { isEditing, previewMode } = useElementor();

  // Variante 1: Seção 09 — Faixa OFERTAS IMPERDÍVEIS (Banner em imagem com upload e link)
  if (variant === 'offers-strip') {
    // A arte antiga contém margens dentro do arquivo; fica como placeholder até a troca.
    const effectiveImageUrl = imageUrl === '/assets/HOME Vitrine/S9-BANNERZINHO-Promo/S9-BANNERZINHO-Promo.webp'
      ? undefined
      : imageUrl;
    const effectiveAlt = altText || title || highlightText || 'OFERTAS IMPERDÍVEIS em embalagens, descartáveis e utilidades';

    const bannerImage = effectiveImageUrl ? (
      <Image
        alt={effectiveAlt}
        className={`size-full object-cover transition duration-300 ${
          isEditing && !previewMode ? 'group-hover/img:brightness-50 group-hover/img:grayscale' : 'hover:opacity-95'
        }`}
        fill
        sizes="(max-width: 1536px) 100vw, 1536px"
        src={effectiveImageUrl}
        unoptimized
      />
    ) : (
      <div
        aria-label="Banner sem imagem"
        className="flex size-full items-center justify-center bg-slate-200 text-slate-400"
        role="img"
      >
        <ImageIcon aria-hidden="true" className="size-9 sm:size-11" strokeWidth={1.5} />
      </div>
    );

    return (
      <section aria-label={effectiveAlt} className="w-full bg-[#001F4D] py-3 sm:py-4">
        <div className="cn-container">
          <div className="group/img relative aspect-[12/1] min-h-24 w-full overflow-hidden rounded-2xl bg-slate-200 sm:min-h-28">
            {ctaUrl ? (
              <Link
                className="block size-full"
                href={ctaUrl}
                onClick={(e) => {
                  if (isEditing && !previewMode) e.preventDefault();
                }}
              >
                {bannerImage}
              </Link>
            ) : (
              bannerImage
            )}

            {widgetId ? (
              <InlineImageEditorOverlay
                canAdd={false}
                canRemove={false}
                currentImageUrl={effectiveImageUrl}
                currentLinkUrl={ctaUrl}
                fieldPath="imageUrl"
                linkFieldPath="ctaUrl"
                previewUrl={effectiveImageUrl}
                slideIndex={0}
                title={title || highlightText || 'Faixa Ofertas Imperdíveis'}
                widgetId={widgetId}
              />
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  // Variante 2: Seção 13 — CONDIÇÕES ESPECIAIS para o seu negócio (Banner em imagem com upload e link)
  if (variant === 'conditions-mascot') {
    const effectiveImageUrl = imageUrl || '/assets/HOME Vitrine/S9-BANNERZINHO-Promo/S9-BANNERZINHO-Promo.webp';
    const effectiveAlt = altText || title || highlightText || 'CONDIÇÕES ESPECIAIS para o seu negócio';

    const bannerImage = (
      <Image
        alt={effectiveAlt}
        className={`size-full object-cover transition duration-300 ${
          isEditing && !previewMode ? 'group-hover/img:brightness-50 group-hover/img:grayscale' : 'hover:opacity-95'
        }`}
        height={125}
        priority={false}
        src={effectiveImageUrl}
        unoptimized
        width={1200}
      />
    );

    return (
      <section aria-label={effectiveAlt} className="cn-container py-3 sm:py-5">
        <div className="group/img relative overflow-hidden rounded-2xl shadow-lg border border-white/10">
          {ctaUrl ? (
            <Link
              className="block size-full"
              href={ctaUrl}
              onClick={(e) => {
                if (isEditing && !previewMode) e.preventDefault();
              }}
            >
              {bannerImage}
            </Link>
          ) : (
            bannerImage
          )}

          {widgetId ? (
            <InlineImageEditorOverlay
              canAdd={false}
              canRemove={false}
              currentImageUrl={effectiveImageUrl}
              currentLinkUrl={ctaUrl}
              fieldPath="imageUrl"
              linkFieldPath="ctaUrl"
              previewUrl={effectiveImageUrl}
              slideIndex={0}
              title={title || highlightText || 'Banner Condições Especiais'}
              widgetId={widgetId}
            />
          ) : null}
        </div>
      </section>
    );
  }

  // Variante 3: Seção 17 — Entre em nosso Grupo de ofertas Exclusivas do WhatsApp
  if (imageUrl) {
    const effectiveAlt = altText || title || highlightText || 'Grupo de ofertas Exclusivas do WhatsApp';
    const bannerImage = (
      <Image
        alt={effectiveAlt}
        className={`size-full object-cover transition duration-300 ${
          isEditing && !previewMode ? 'group-hover/img:brightness-50 group-hover/img:grayscale' : 'hover:opacity-95'
        }`}
        height={320}
        priority={false}
        src={imageUrl}
        unoptimized
        width={1200}
      />
    );

    return (
      <section aria-label={effectiveAlt} className="cn-container py-4 sm:py-6">
        <div className="group/img relative overflow-hidden rounded-2xl shadow-[0_8px_28px_rgba(0,53,123,0.18)]">
          {ctaUrl ? (
            <Link
              className="block size-full"
              href={ctaUrl}
              onClick={(e) => {
                if (isEditing && !previewMode) e.preventDefault();
              }}
            >
              {bannerImage}
            </Link>
          ) : (
            bannerImage
          )}

          {widgetId ? (
            <InlineImageEditorOverlay
              canAdd={false}
              canRemove={false}
              currentImageUrl={imageUrl}
              currentLinkUrl={ctaUrl}
              fieldPath="imageUrl"
              linkFieldPath="ctaUrl"
              previewUrl={imageUrl}
              slideIndex={0}
              title={title || 'Banner Grupo WhatsApp'}
              widgetId={widgetId}
            />
          ) : null}
        </div>
      </section>
    );
  }

  // Variante 3: Seção 17 — Entre em nosso Grupo de ofertas Exclusivas do WhatsApp
  return (
    <section aria-label={title || 'Grupo de WhatsApp'} className="cn-container py-4 sm:py-6">
      <div className="relative overflow-hidden rounded-2xl bg-[#00449E] shadow-[0_8px_32px_rgba(0,45,114,0.22)]">
        <div className="grid grid-cols-1 items-center lg:grid-cols-12">
          {/* Conteúdo: Badge + Título + Benefícios + Botão de Ação */}
          <div className="px-6 py-8 text-center sm:py-10 lg:col-span-8 lg:px-10 lg:py-12 lg:text-left">
            {/* Badge de Destaque */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold tracking-wider text-white backdrop-blur-sm">
              <span className="flex size-2 rounded-full bg-[#25D366] animate-pulse" />
              <span>RECEBA OFERTAS NO WHATSAPP</span>
            </div>

            <p className="mt-3 text-base font-medium text-blue-100 sm:text-lg">
              Entre em nosso
            </p>
            <h2 className="mt-0.5 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              Grupo de ofertas
              <span className="block text-[#FFDE59]">Exclusivas do WhatsApp</span>
            </h2>
            <div className="mx-auto mt-2.5 h-1 w-24 rounded-full bg-[#E2091E] lg:mx-0" />

            {subtitle ? (
              <p className="mt-3.5 max-w-xl text-xs leading-relaxed text-blue-100/90 sm:text-sm">
                {subtitle}
              </p>
            ) : null}

            {/* Selos de Benefício */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-blue-100/90 lg:justify-start">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1">
                <span className="text-[#25D366]">✓</span> 100% Gratuito
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1">
                <span className="text-[#25D366]">✓</span> Preço de Atacado
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1">
                <span className="text-[#25D366]">✓</span> Sem Spam
              </span>
            </div>

            {/* Botão de Ação */}
            <div className="mt-6">
              <Link
                className="group inline-flex items-center gap-2.5 rounded-xl border border-white/40 bg-[#002258] px-7 py-3.5 text-xs font-bold text-white shadow-lg transition duration-200 hover:bg-[#001740] hover:scale-[1.02] sm:text-sm"
                href={ctaUrl || 'https://wa.me/5591983440880'}
                onClick={(e) => {
                  if (isEditing && !previewMode) e.preventDefault();
                }}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition group-hover:scale-110">
                  <MessageCircle className="size-3.5 fill-white text-white" />
                </span>
                <span>{ctaLabel || 'Participar do Grupo WhatsApp'}</span>
                <ChevronRight className="size-4 text-white/80 transition group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Dica interativa para o usuário */}
            <p className="mt-2.5 text-[11px] text-blue-200/70">
              ⚡ O celular ao lado é interativo — toque nele para reiniciar a demonstração
            </p>

            {/* No Mobile: Exibe o smartphone animado centralizado */}
            <div className="mt-6 flex justify-center lg:hidden">
              <WhatsappPhoneAnimation
                ctaUrl={ctaUrl || 'https://wa.me/5591983440880'}
              />
            </div>
          </div>

          {/* Smartphone Animado à direita (Desktop) em fundo azul limpo */}
          <div className="relative hidden h-full min-h-[460px] items-end justify-center pt-6 lg:col-span-4 lg:flex">
            <WhatsappPhoneAnimation
              ctaUrl={ctaUrl || 'https://wa.me/5591983440880'}
            />
          </div>
        </div>

        {/* Suporte a upload de imagem no modo Editor Inline */}
        {widgetId && isEditing && !previewMode ? (
          <InlineImageEditorOverlay
            canAdd={false}
            canRemove={false}
            currentLinkUrl={ctaUrl}
            fieldPath="mascotImageUrl"
            linkFieldPath="ctaUrl"
            previewUrl={mascotImageUrl}
            slideIndex={0}
            title="Imagem de Fundo Grupo WhatsApp"
            widgetId={widgetId}
          />
        ) : null}
      </div>
    </section>
  );
}
