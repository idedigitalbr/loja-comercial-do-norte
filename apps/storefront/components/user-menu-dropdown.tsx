'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AtSign,
  ChevronRight,
  Crown,
  Gem,
  LogOut,
  MessageSquare,
  RefreshCw,
  ShoppingCart,
  Star,
  User,
} from 'lucide-react';
import { useAuth } from './auth-provider';

export function UserMenuDropdown() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Extrai somente o primeiro nome conforme instrução:
  // "(e logado fica loa o Olá noem da pessoa (só o primeiro nome nao vai serr tudo)"
  const firstName =
    user?.firstName?.trim() ||
    user?.fullName?.trim().split(/\s+/)[0] ||
    'Cliente';

  // Se NÃO estiver logado: exibe o botão simples que direciona para /login
  if (!isAuthenticated || !user) {
    return (
      <Link
        aria-label="Entre ou Cadastre-se"
        className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white transition hover:bg-white/15"
        href="/login"
      >
        <div className="flex size-7 items-center justify-center rounded-full border border-white/60 bg-white/10 text-white shrink-0">
          <User className="size-4 stroke-[2]" />
        </div>
        <div className="hidden text-left xl:block leading-tight">
          <span className="block text-[11px] font-normal text-white/90 leading-none">
            Boas vindas :)
          </span>
          <span className="block text-xs font-bold text-white whitespace-nowrap leading-tight mt-0.5">
            Entre ou Cadastre-se
          </span>
        </div>
      </Link>
    );
  }

  // Se ESTIVER logado: exibe o botão de Olá [Primeiro Nome] e o popover fiel ao print
  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* BOTÃO DISPARADOR NO HEADER */}
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu da conta de ${firstName}`}
        className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white transition hover:bg-white/15 cursor-pointer text-left"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <div className="flex size-7 items-center justify-center rounded-full border border-white/80 bg-white/10 text-white shrink-0">
          <User className="size-4 stroke-[2]" />
        </div>
        <div className="hidden text-left xl:block leading-tight">
          <span className="block text-[11px] font-normal text-white/90 leading-none">
            Olá
          </span>
          <span className="block text-xs font-bold text-white whitespace-nowrap leading-tight mt-0.5">
            {firstName}
          </span>
        </div>
      </button>

      {/* POPOVER FLUTUANTE DO PAINEL DO CLIENTE (Fidelidade ao print enviado) */}
      {open && (
        <div className="absolute right-0 top-full mt-2.5 z-50 w-[300px] sm:w-[320px] rounded-[24px] bg-[#F8FAFC] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150">
          {/* TRIÂNGULO APONTANDO PARA CIMA */}
          <div
            aria-hidden="true"
            className="absolute -top-2 right-10 size-4 rotate-45 bg-white border-t border-l border-slate-200/90"
          />

          <div className="relative z-10 space-y-2.5">
            {/* BLOCO 01: SUA CONTA */}
            <Link
              className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-xs border border-slate-100 transition hover:bg-slate-50 hover:border-slate-200"
              href="/conta"
              onClick={() => setOpen(false)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#004CB1]">
                  <User className="size-5" />
                </div>
                <span className="truncate text-sm font-bold text-slate-800">
                  Sua conta
                </span>
              </div>
              <ChevronRight className="size-4 text-slate-400 shrink-0" />
            </Link>

            {/* BLOCO 02: TAGS / BADGES SUPERIORES ("coisas em cima igual ultimo print") */}
            <div className="flex items-center justify-between gap-1.5 px-0.5">
              {/* Badge 1: ADM EDITOR */}
              <div className="flex items-center gap-1 rounded-full bg-[#E0EAFF] border border-blue-200/70 px-2.5 py-1 text-[10px] font-extrabold text-[#1E40AF] shadow-2xs">
                <Crown className="size-3 fill-[#1E40AF] text-[#1E40AF]" />
                <span>ADM EDITOR</span>
              </div>

              {/* Badge 2: CLIENTE OURO */}
              <div className="flex items-center gap-1 rounded-full bg-[#FEF3C7] border border-amber-200/70 px-2.5 py-1 text-[10px] font-extrabold text-[#B45309] shadow-2xs">
                <Gem className="size-3 fill-[#B45309] text-[#B45309]" />
                <span>CLIENTE OURO</span>
              </div>

              {/* Badge 3: PONTUAÇÃO */}
              <div className="flex items-center gap-1 rounded-full bg-[#F3E8FF] border border-purple-200/70 px-2.5 py-1 text-[10px] font-extrabold text-[#7E22CE] shadow-2xs">
                <Star className="size-3 fill-[#7E22CE] text-[#7E22CE]" />
                <span>9.2100 PTS</span>
              </div>
            </div>

            {/* BLOCO 03: LISTA AGRUPADA DE MENUS COM ÍCONES REDONDOS */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xs border border-slate-100 divide-y divide-slate-100">
              {/* Meus pedidos */}
              <Link
                className="flex items-center justify-between p-3.5 transition hover:bg-slate-50"
                href="/compras"
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#004CB1]">
                    <ShoppingCart className="size-4" />
                  </div>
                  <span className="truncate text-xs sm:text-sm font-semibold text-slate-700">
                    Meus pedidos
                  </span>
                </div>
                <ChevronRight className="size-4 text-slate-400 shrink-0" />
              </Link>

              {/* Trocas e cancelamentos */}
              <a
                className="flex items-center justify-between p-3.5 transition hover:bg-slate-50"
                href="https://wa.me/5591983440880?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20trocas%20ou%20cancelamento"
                onClick={() => setOpen(false)}
                rel="noreferrer"
                target="_blank"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#004CB1]">
                    <RefreshCw className="size-4" />
                  </div>
                  <span className="truncate text-xs sm:text-sm font-semibold text-slate-700">
                    Trocas e cancelamentos
                  </span>
                </div>
                <ChevronRight className="size-4 text-slate-400 shrink-0" />
              </a>

              {/* Dados pessoais */}
              <Link
                className="flex items-center justify-between p-3.5 transition hover:bg-slate-50"
                href="/conta"
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#004CB1]">
                    <User className="size-4" />
                  </div>
                  <span className="truncate text-xs sm:text-sm font-semibold text-slate-700">
                    Dados pessoais
                  </span>
                </div>
                <ChevronRight className="size-4 text-slate-400 shrink-0" />
              </Link>

              {/* Alterar e-mail ou telefone */}
              <Link
                className="flex items-center justify-between p-3.5 transition hover:bg-slate-50"
                href="/conta"
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#004CB1]">
                    <AtSign className="size-4" />
                  </div>
                  <span className="truncate text-xs sm:text-sm font-semibold text-slate-700">
                    Alterar e-mail ou telefone
                  </span>
                </div>
                <ChevronRight className="size-4 text-slate-400 shrink-0" />
              </Link>
            </div>

            {/* BLOCO 04: FALE COM LOJISTA */}
            <a
              className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-xs border border-slate-100 transition hover:bg-slate-50 hover:border-slate-200"
              href="https://wa.me/5591983440880"
              onClick={() => setOpen(false)}
              rel="noreferrer"
              target="_blank"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#004CB1]">
                  <MessageSquare className="size-4" />
                </div>
                <span className="truncate text-xs sm:text-sm font-semibold text-slate-700">
                  Fale com lojista
                </span>
              </div>
              <ChevronRight className="size-4 text-slate-400 shrink-0" />
            </a>

            {/* BLOCO 05: BOTÃO SAIR */}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#004CB1] bg-white py-2.5 text-sm font-bold text-[#004CB1] shadow-xs hover:bg-blue-50 active:scale-98 transition cursor-pointer"
              onClick={async () => {
                setOpen(false);
                await logout();
              }}
              type="button"
            >
              <LogOut className="size-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
