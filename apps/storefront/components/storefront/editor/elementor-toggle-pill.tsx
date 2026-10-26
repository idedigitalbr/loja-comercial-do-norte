'use client';

import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useElementor } from './elementor-editor-context';

export function ElementorTogglePill() {
  const { user, ready } = useAuth();
  const { isEditing, setIsEditing, setPreviewMode } = useElementor();
  const [isHovered, setIsHovered] = useState(false);

  // Somente administradores autenticados podem ver o botão e abrir o editor visual
  if (!ready || !user?.isAdmin) return null;
  if (isEditing) return null;

  return (
    <aside
      aria-label="Controle de edição da página"
      className="fixed bottom-0 left-0 z-[999] flex items-end min-w-[72px] min-h-[48px] p-2 pb-2 pl-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Botão compacto "Editar Página" - sutil e discreto, só surge para admins ao encostar o mouse no canto inferior esquerdo */}
      <button
        aria-label="Editar Página"
        className={`flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-900/90 py-1.5 px-3 text-xs font-semibold text-white shadow-xl ring-1 ring-white/15 backdrop-blur-md transition-all duration-200 hover:bg-[#004CB1] hover:ring-[#004CB1]/50 active:scale-95 ${
          isHovered
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 -translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto'
        }`}
        onClick={() => {
          setIsEditing(true);
          setPreviewMode(false);
        }}
        title="Editar Página com o editor visual"
        type="button"
      >
        {/* Ícone sutil 'E' */}
        <div className="flex size-4 items-center justify-center rounded-full bg-[#E2091E] font-black text-[9px] text-white shrink-0">
          <span>E</span>
        </div>

        <span className="tracking-wide">Editar Página</span>
        <Edit3 className="size-3 text-white/70 ml-0.5 shrink-0" />
      </button>

      {/* Marcador ultra discreto no cantinho encostado quando o mouse não está na área */}
      {!isHovered && (
        <div
          aria-hidden="true"
          className="size-2 rounded-full bg-slate-400/20 group-hover:hidden transition-all ml-1 mb-1 pointer-events-none"
        />
      )}
    </aside>
  );
}
