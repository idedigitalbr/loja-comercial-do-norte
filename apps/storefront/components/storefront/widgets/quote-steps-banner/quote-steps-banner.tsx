'use client';

import React from 'react';
import Image from 'next/image';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { QuoteStepsBannerProps } from '@/lib/storefront/widget-types';

export function QuoteStepsBannerWidget({
  widgetId,
  eyebrow = 'Saiba',
  title = 'Como funciona a cotação online',
  steps = [],
  mascotImageUrl = '/assets/imgs/Mascote-3D-James-em-pe/outros/james-09-celular.png',
  rightArtworkImageUrl = '/assets/home-ref/s07-quote-right-mockup.jpg',
  ctaUrl = '/cotacao',
}: QuoteStepsBannerProps) {
  const { isEditing, previewMode } = useElementor();

  return (
    <section aria-label={title} className="cn-container py-4 sm:py-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00357B] via-[#004CB1] to-[#0059CC] shadow-[0_8px_28px_rgba(0,53,123,0.18)]">
        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-12">
          {/* Mascote 3D à esquerda */}
          <div className="group/img relative hidden h-full min-h-[260px] items-end justify-center pt-4 lg:col-span-2 lg:flex">
            <Image
              alt="Mascote Comercial do Norte"
              className={`h-[250px] w-auto object-contain object-bottom drop-shadow-xl transition ${
                isEditing && !previewMode ? 'group-hover/img:brightness-50 group-hover/img:grayscale' : ''
              }`}
              height={400}
              src={mascotImageUrl}
              unoptimized
              width={260}
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
                title="Mascote Como Funciona Cotação"
                widgetId={widgetId}
              />
            ) : null}
          </div>

          {/* Centro: Título + 4 Passos */}
          <div className="px-5 py-6 sm:px-6 lg:col-span-7 lg:py-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-100 sm:text-sm">
              {eyebrow}
            </p>
            <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight text-white sm:text-[28px]">
              {title}
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div
                  className="flex flex-col rounded-xl bg-white p-3.5 shadow-md transition hover:-translate-y-0.5"
                  key={step.stepNumber}
                >
                  <span className="mb-2 inline-flex size-6 items-center justify-center rounded-full bg-[#004CB1] text-xs font-extrabold text-white">
                    {step.stepNumber}
                  </span>
                  <h3 className="text-[13px] font-extrabold leading-snug text-[#00357B]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Direita: Arte Mockup WhatsApp + Embalagens */}
          <div className="group/img relative hidden h-full min-h-[260px] overflow-hidden lg:col-span-3 lg:block">
            <Image
              alt="Cotação Online pelo WhatsApp"
              className={`size-full object-cover object-center transition ${
                isEditing && !previewMode ? 'group-hover/img:brightness-50 group-hover/img:grayscale' : ''
              }`}
              height={555}
              src={rightArtworkImageUrl}
              unoptimized
              width={640}
            />
            {widgetId ? (
              <InlineImageEditorOverlay
                canAdd={false}
                canRemove={false}
                currentLinkUrl={ctaUrl}
                fieldPath="rightArtworkImageUrl"
                linkFieldPath="ctaUrl"
                previewUrl={rightArtworkImageUrl}
                slideIndex={0}
                title="Arte Direita Como Funciona Cotação"
                widgetId={widgetId}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
