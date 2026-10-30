'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Compass, Sparkles, X } from 'lucide-react';

interface NortTourPromptProps {
  onStart: () => void;
  onDismiss: () => void;
}

export function NortTourPrompt({ onStart, onDismiss }: NortTourPromptProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Exibe suavemente após 3.5 segundos na primeira visita
    const timer = setTimeout(() => {
      setVisible(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !visible || typeof document === 'undefined') return null;

  return createPortal(
    <aside
      aria-label="Convite para tour guiado com o Nort"
      className="fixed bottom-4 right-4 z-[9990] max-w-sm w-[calc(100vw-32px)] bg-white text-slate-800 rounded-2xl shadow-[0_10px_35px_rgba(0,35,120,0.22)] border border-[#004CB1]/20 p-3.5 animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="flex items-start gap-3">
        {/* AVATAR DO NORT COM JOINHA */}
        <div className="relative shrink-0 size-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/60 p-1 flex items-center justify-center overflow-hidden">
          <Image
            src="/assets/HOME%20Vitrine/S0-HEADER/Mascote-3D-NORT/principais/nort-sorridente-joinha.png"
            alt="Mascote Nort"
            width={48}
            height={48}
            unoptimized
            className="object-contain object-bottom translate-y-1"
          />
        </div>

        {/* TEXTO DO CONVITE */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#004CB1]">
            <Sparkles className="size-3 text-amber-500 fill-amber-400" />
            <span>Tour Comercial do Norte</span>
          </div>
          <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-snug">
            Oi! Quer um tour guiado de 1 minutinho para conhecer o site?
          </p>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => onStart()}
              className="inline-flex items-center gap-1.5 bg-[#004CB1] hover:bg-[#00357B] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
            >
              <Compass className="size-3" />
              <span>Fazer tour!</span>
            </button>
            <button
              type="button"
              onClick={() => onDismiss()}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-medium px-2 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              Agora não
            </button>
          </div>
        </div>

        {/* BOTÃO FECHAR */}
        <button
          type="button"
          onClick={() => onDismiss()}
          aria-label="Fechar convite do tour"
          className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </aside>,
    document.body
  );
}
