'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, ClipboardList, FileSpreadsheet, PackageCheck, ShoppingCart } from 'lucide-react';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { QuoteStepsBannerProps } from '@/lib/storefront/widget-types';

function StepIcon({ stepNumber }: { stepNumber: number }) {
  switch (stepNumber) {
    case 1:
      return <ShoppingCart className="size-7 text-[#004CB1] stroke-[1.8]" />;
    case 2:
      return <ClipboardList className="size-7 text-[#004CB1] stroke-[1.8]" />;
    case 3:
      return <FileSpreadsheet className="size-7 text-[#004CB1] stroke-[1.8]" />;
    default:
      return <PackageCheck className="size-7 text-[#004CB1] stroke-[1.8]" />;
  }
}

export function QuoteStepsBannerWidget({
  widgetId,
  eyebrow = 'Saiba',
  title = 'Como funciona a cotação online',
  steps = [],
  mascotImageUrl = '/assets/home-ref/s07-quote-left-mascot.jpg',
  rightArtworkImageUrl = '/assets/home-ref/s07-quote-right-mockup.jpg',
  ctaUrl = '/cotacao',
}: QuoteStepsBannerProps) {
  const { isEditing, previewMode } = useElementor();

  return (
    <section aria-label={title} className="cn-container py-4 sm:py-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#002868] via-[#003E99] to-[#990012] shadow-[0_8px_28px_rgba(0,40,104,0.22)]">
        <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
          {/* Mascote 3D no galpão à esquerda (fiel ao site-final.jpg) */}
          <div className="group/img relative hidden min-h-[260px] overflow-hidden lg:col-span-3 lg:block">
            <Image
              alt="Mascote Comercial do Norte segurando celular"
              className={`size-full object-cover object-center transition ${
                isEditing && !previewMode ? 'group-hover/img:brightness-50 group-hover/img:grayscale' : ''
              }`}
              height={615}
              src={mascotImageUrl}
              unoptimized
              width={630}
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

          {/* Centro: Título Centralizado + Barra Vermelha + 4 Cards Brancos com Ícones */}
          <div className="flex flex-col justify-center px-5 py-6 sm:px-6 lg:col-span-6 lg:py-7">
            <div className="text-center">
              <p className="text-xs font-medium text-blue-200 sm:text-sm">
                {eyebrow}
              </p>
              <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight text-white sm:text-[28px]">
                {title}
              </h2>
              <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-[#E2091E]" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, idx) => (
                <div
                  className="relative flex flex-col rounded-xl bg-white p-3.5 shadow-md transition hover:-translate-y-0.5"
                  key={step.stepNumber}
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#E2091E] text-xs font-extrabold text-white shadow-xs">
                      {step.stepNumber}
                    </span>
                    <StepIcon stepNumber={step.stepNumber} />
                  </div>
                  <h3 className="text-[12.5px] font-extrabold leading-snug text-[#002868]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-slate-600">
                    {step.description}
                  </p>

                  {idx < steps.length - 1 ? (
                    <span className="pointer-events-none absolute -right-2.5 top-1/2 z-10 hidden size-5 -translate-y-1/2 items-center justify-center rounded-full bg-[#E2091E] text-white shadow-xs lg:flex">
                      <ArrowRight className="size-3" />
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Direita: Arte Mockup WhatsApp + Embalagens */}
          <div className="group/img relative hidden min-h-[260px] overflow-hidden lg:col-span-3 lg:block">
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
