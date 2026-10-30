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
  isMobile?: boolean;
}

export function NortTourCard({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onClose,
  onStepClick,
  isMobile = false,
}: NortTourCardProps) {
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  return (
    <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-2 sm:gap-4 max-w-[94vw] sm:max-w-xl md:max-w-2xl select-none animate-in fade-in zoom-in-95 duration-200">
      {/* MASCOTE NORT 3D COM POSE DINÂMICA */}
      <div className="relative shrink-0 flex items-end justify-center w-24 sm:w-32 md:w-36 -mb-1 sm:mb-0 z-20">
        <div className="relative h-28 sm:h-40 md:h-48 w-full filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)] transition-all duration-300 transform hover:scale-105">
          <Image
            src={step.mascotPose}
            alt={step.mascotAlt}
            fill
            sizes="(max-width: 640px) 96px, 144px"
            className="object-contain object-bottom"
            priority
          />
        </div>
      </div>

      {/* BALÃO DE FALA EM FORMATO COMIC COM RABICHO APONTADO PARA A BOCA DO NORT */}
      <div className="relative flex-1 bg-white text-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,35,120,0.35)] border-2 border-[#004CB1]/25 z-10 w-full">
        {/* RABICHO DO BALÃO: DESKTOP (Apontando para a esquerda, na altura da boca do Nort) */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute -left-3 top-10 sm:top-12 w-0 h-0 border-y-[10px] border-y-transparent border-r-[14px] border-r-white filter drop-shadow-[-2px_0_2px_rgba(0,0,0,0.08)] pointer-events-none"
        />

        {/* RABICHO DO BALÃO: MOBILE (Apontando para cima em direção à cabeça do Nort) */}
        <div
          aria-hidden="true"
          className="sm:hidden absolute left-12 -top-2.5 w-0 h-0 border-x-[10px] border-x-transparent border-b-[12px] border-b-white filter drop-shadow-[0_-2px_2px_rgba(0,0,0,0.08)] pointer-events-none"
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
              {currentStepIndex + 1} de {totalSteps}
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
        <div className="py-2.5 sm:py-3 space-y-1">
          <h3 className="font-extrabold text-[#00357B] text-sm sm:text-base tracking-tight leading-snug">
            {step.title}
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
            {step.message}
          </p>
        </div>

        {/* PROGRESSO EM PONTINHOS (PAGINAÇÃO INTERATIVA) */}
        <div className="flex items-center justify-center gap-1.5 py-1.5" aria-label="Progresso do tour">
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
    </div>
  );
}
