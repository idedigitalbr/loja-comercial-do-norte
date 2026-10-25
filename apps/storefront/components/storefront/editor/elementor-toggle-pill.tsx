'use client';

import React from 'react';
import { Edit3, Sparkles } from 'lucide-react';
import { useElementor } from './elementor-editor-context';

export function ElementorTogglePill() {
  const { isEditing, setIsEditing, setPreviewMode } = useElementor();

  if (isEditing) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[999] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        aria-label="Abrir Editor Elementor"
        className="group flex cursor-pointer items-center gap-2.5 rounded-full bg-[#161719] py-2 pr-4 pl-2 text-white shadow-2xl ring-2 ring-white/10 transition-all duration-200 hover:scale-105 hover:bg-[#8C1D40] hover:ring-[#8C1D40]/50"
        onClick={() => {
          setIsEditing(true);
          setPreviewMode(false);
        }}
        title="Personalizar vitrine com o Editor Visual Elementor"
        type="button"
      >
        {/* Logo Círculo 'E' */}
        <div className="flex size-7 items-center justify-center rounded-full bg-[#E2091E] font-black text-xs text-white shadow-sm transition-transform group-hover:rotate-12">
          <span>E</span>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-xs font-bold leading-tight tracking-wide">Editar com Elementor</span>
          <span className="text-[10px] text-white/60 group-hover:text-white/90">Personalizar Vitrine</span>
        </div>

        <Edit3 className="ml-1 size-3.5 text-white/50 group-hover:text-white" />
      </button>
    </div>
  );
}
