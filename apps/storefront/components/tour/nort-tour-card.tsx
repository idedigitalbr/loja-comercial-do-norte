'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from 'lucide-react';
import type { NortTourStep } from './nort-tour-types';

interface NortTourCardProps {
  step: NortTourStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onStepClick: (index: number) => void;
}

export function NortTourCard({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onClose,
  onStepClick,
}: NortTourCardProps) {
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  return (
    <div className="relative flex flex-col items-center w-full max-w-xl md:max-w-2xl select-none animate-in slide-in-from-bottom-8 fade-in duration-300">
      {/* BALÃO DE FALA EM FORMATO COMIC COM RABICHO APONTADO PARA A BOCA DO NORT */}
      <div className="relative w-full bg-white text-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,15,50,0.55)] border-2 border-[#004CB1]/30 z-20 mb-1.5 sm:mb-2.5">
        {/* RABICHO DO BALÃO APONTANDO PARA BAIXO EM DIREÇÃO À CABEÇA/BOCA DO NORT */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-0 h-0 border-x-[12px] border-x-transparent border-t-[14px] border-t-white filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.12)] pointer-events-none"
        />

        {/* TOPO DO BALÃO: BADGE DO NORT + CONTADOR DE PASSOS + BOTÃO FECHAR */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#004CB1]/10 text-[#004CB1]">
              <Sparkles className="size-3 text-amber-500 fill-amber-400" />
              <span>Nort Apresenta</span>
            </span>

            {step.badge && (
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900">
                {step.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-400">
              Passo {currentStepIndex + 1} de {totalSteps}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar tour guiado"
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL (FALA DO NORT) */}
        <div className="py-2 sm:py-2.5 space-y-1">
          <h3 className="font-extrabold text-[#00357B] text-sm sm:text-base md:text-lg tracking-tight leading-snug">
            {step.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {step.message}
          </p>
        </div>

        {/* PROGRESSO EM PONTINHOS (PAGINAÇÃO INTERATIVA) */}
        <div className="flex items-center justify-center gap-1.5 py-1" aria-label="Progresso do tour">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onStepClick(idx)}
              aria-label={`Ir para passo ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentStepIndex
                  ? 'w-6 bg-[#004CB1]'
                  : 'w-1.5 bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* RODAPÉ DO BALÃO COM BOTÕES DE NAVEGAÇÃO */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            Pular tour
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={onPrev}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>Voltar</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-md transition-all cursor-pointer ${
                isLast
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 active:scale-95'
                  : 'bg-[#004CB1] hover:bg-[#00357B] shadow-[#004CB1]/30 active:scale-95'
              }`}
            >
              <span>{isLast ? 'Concluir Tour!' : 'Próximo'}</span>
              {isLast ? (
                <Check className="size-3.5 stroke-[3]" />
              ) : (
                <ArrowRight className="size-3.5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MASCOTE NORT BEM GRANDE ENCOSTADO NO CANTO INFERIOR (BOTTOM: 0) */}
      <div className="relative shrink-0 flex items-end justify-center w-48 sm:w-60 md:w-72 h-40 sm:h-52 md:h-60 z-10 -mb-1">
        <Image
          src={step.mascotPose}
          alt={step.mascotAlt}
          fill
          sizes="(max-width: 640px) 192px, 288px"
          className="object-contain object-bottom filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.65)]"
          priority
          unoptimized
        />
      </div>
    </div>
  );
}
