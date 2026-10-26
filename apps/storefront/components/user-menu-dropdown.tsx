'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AtSign,
  ChevronDown,
  ChevronRight,
  Crown,
  ExternalLink,
  Gem,
  LogOut,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Star,
  User,
} from 'lucide-react';
import { useAuth } from './auth-provider';

export function UserMenuDropdown() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora ou ao pressionar ESC
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
        <div className="hidden text-left sm:block leading-tight">
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

  // Se ESTIVER logado: ativa ESTRITAMENTE AO CLICAR (sem hover)
  // e exibe o overlay escuro no resto do site com popover focado conforme Anexo 2
  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* 
        OVERLAY ESCURO QUE DEIXA O RESTO DO SITE INTEIRO BEM ESCURO (FOCO TOTAL NO MENU)
        Ativa estritamente ao clicar e fecha ao clicar no fundo
      */}
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        />
      )}

      {/* BOTÃO DISPARADOR NO HEADER (Z-50 PARA FICAR ACIMA DO OVERLAY ESCURO) */}
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu da conta de ${firstName}`}
        className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs text-white transition cursor-pointer text-left relative z-50 ${
          open
            ? 'bg-white/20 border-white/40 shadow-sm ring-1 ring-white/30'
            : 'border-white/20 bg-white/5 hover:bg-white/15'
        }`}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <div className="flex size-7 items-center justify-center rounded-full border border-white/80 bg-white/10 text-white shrink-0">
          <User className="size-4 stroke-[2]" />
        </div>
        <div className="hidden text-left sm:block leading-tight">
          <span className="block text-[11px] font-normal text-white/90 leading-none">
            Olá
          </span>
          <span className="block text-xs font-bold text-white whitespace-nowrap leading-tight mt-0.5">
            {firstName}
          </span>
        </div>
        <ChevronDown
          className={`size-3.5 text-white/70 transition-transform duration-200 ${
            open ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* POPOVER FLUTUANTE DO PAINEL DO CLIENTE (Fidelidade ao print de referência Anexo 2) */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2.5 z-50 w-[340px] sm:w-[360px] rounded-[28px] bg-[#F4F7FB] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45),0_0_0_1px_rgba(0,0,0,0.06)] border border-slate-200/90 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* TRIÂNGULO APONTANDO PARA CIMA NA COR DO CONTAINER (#F4F7FB) */}
          <div
            aria-hidden="true"
            className="absolute -top-2 right-7 size-4 rotate-45 bg-[#F4F7FB] border-t border-l border-slate-200/90"
          />

          <div className="relative z-10 space-y-2.5">
            {/* BLOCO ESPECIAL: ACESSO DIRETO AO PAINEL ADMINISTRATIVO (SE FOR ADMIN) */}
            {user?.isAdmin && (
              <a
                className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#004CB1] to-[#00357B] px-3.5 py-2.5 text-white shadow-xs transition hover:brightness-110"
                href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5174/admin/'}
                rel="noreferrer"
                target="_blank"
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="block truncate text-xs font-bold leading-tight">
                      Painel Administrativo
                    </span>
                    <span className="block text-[10px] text-blue-100 leading-tight">
                      Catálogo, cotações e banners
                    </span>
                  </div>
                </div>
                <ExternalLink className="size-3.5 text-white/80 shrink-0" />
              </a>
            )}

            {/* BLOCO 01: SUA CONTA (Card branco arredondado com ícone redondo azul) */}
            <Link
              className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-2xs border border-slate-100/90 transition hover:bg-slate-50 hover:border-slate-200"
              href="/conta"
              onClick={() => setOpen(false)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EBF3FF] text-[#0066FF]">
                  <User className="size-5 stroke-[2]" />
                </div>
                <span className="truncate text-[15px] font-semibold text-slate-800">
                  Sua conta
                </span>
              </div>
              <ChevronRight className="size-4 text-slate-400 stroke-[2] shrink-0" />
            </Link>

            {/* 
              BLOCO 02: 3 BADGES EM UMA ÚNICA LINHA HORIZONTAL (SEM QUEBRA DE LINHA)
              Fidelidade absoluta ao Anexo 2:
              1. ADM EDITOR (azul)
              2. CLIENTE OURO (dourado)
              3. 9.2100 PTS (roxo)
            */}
            <div className="grid grid-cols-3 gap-1.5 px-0.5">
              {/* Badge 1: ADM EDITOR */}
              <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#E8F0FE] border border-blue-200/80 py-1.5 px-2 text-[10px] sm:text-[11px] font-bold text-[#1D4ED8] whitespace-nowrap shadow-2xs">
                <Crown className="size-3.5 fill-[#1D4ED8] text-[#1D4ED8] shrink-0" />
                <span className="whitespace-nowrap">ADM EDITOR</span>
              </div>

              {/* Badge 2: CLIENTE OURO */}
              <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#FEF3C7] border border-amber-200/80 py-1.5 px-2 text-[10px] sm:text-[11px] font-bold text-[#B45309] whitespace-nowrap shadow-2xs">
                <Gem className="size-3.5 fill-[#B45309] text-[#B45309] shrink-0" />
                <span className="whitespace-nowrap">CLIENTE OURO</span>
              </div>

              {/* Badge 3: 9.2100 PTS */}
              <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#F3E8FF] border border-purple-200/80 py-1.5 px-2 text-[10px] sm:text-[11px] font-bold text-[#7E22CE] whitespace-nowrap shadow-2xs">
                <Star className="size-3.5 fill-[#7E22CE] text-[#7E22CE] shrink-0" />
                <span className="whitespace-nowrap">9.2100 PTS</span>
              </div>
            </div>

            {/* BLOCO 03: CARD BRANCO AGRUPADO COM 4 ITENS (DIVISORES FINOS E ÍCONES REDONDOS) */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xs border border-slate-100/90 divide-y divide-slate-100">
              {/* Meus pedidos */}
              <Link
                className="flex items-center justify-between p-3.5 transition hover:bg-slate-50"
                href="/compras"
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EBF3FF] text-[#0066FF]">
                    <ShoppingCart className="size-4.5 stroke-[2]" />
                  </div>
                  <span className="truncate text-[14px] sm:text-[15px] font-medium text-slate-800">
                    Meus pedidos
                  </span>
                </div>
                <ChevronRight className="size-4 text-slate-400 stroke-[2] shrink-0" />
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
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EBF3FF] text-[#0066FF]">
                    <RefreshCw className="size-4.5 stroke-[2]" />
                  </div>
                  <span className="truncate text-[14px] sm:text-[15px] font-medium text-slate-800">
                    Trocas e cancelamentos
                  </span>
                </div>
                <ChevronRight className="size-4 text-slate-400 stroke-[2] shrink-0" />
              </a>

              {/* Dados pessoais */}
              <Link
                className="flex items-center justify-between p-3.5 transition hover:bg-slate-50"
                href="/conta"
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EBF3FF] text-[#0066FF]">
                    <User className="size-4.5 stroke-[2]" />
                  </div>
                  <span className="truncate text-[14px] sm:text-[15px] font-medium text-slate-800">
                    Dados pessoais
                  </span>
                </div>
                <ChevronRight className="size-4 text-slate-400 stroke-[2] shrink-0" />
              </Link>

              {/* Alterar e-mail ou telefone */}
              <Link
                className="flex items-center justify-between p-3.5 transition hover:bg-slate-50"
                href="/conta"
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EBF3FF] text-[#0066FF]">
                    <AtSign className="size-4.5 stroke-[2]" />
                  </div>
                  <span className="truncate text-[14px] sm:text-[15px] font-medium text-slate-800">
                    Alterar e-mail ou telefone
                  </span>
                </div>
                <ChevronRight className="size-4 text-slate-400 stroke-[2] shrink-0" />
              </Link>
            </div>

            {/* BLOCO 04: FALE COM LOJISTA (Card branco separado com ícone de mensagem) */}
            <a
              className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-2xs border border-slate-100/90 transition hover:bg-slate-50 hover:border-slate-200"
              href="https://wa.me/5591983440880"
              onClick={() => setOpen(false)}
              rel="noreferrer"
              target="_blank"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EBF3FF] text-[#0066FF]">
                  <MessageSquare className="size-4.5 stroke-[2]" />
                </div>
                <span className="truncate text-[15px] font-medium text-slate-800">
                  Fale com lojista
                </span>
              </div>
              <ChevronRight className="size-4 text-slate-400 stroke-[2] shrink-0" />
            </a>

            {/* BLOCO 05: BOTÃO SAIR (Fiel ao print: fundo branco, contorno azul #0066FF e ícone LogOut azul) */}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#0066FF] bg-white py-3 text-[15px] font-bold text-[#0066FF] shadow-2xs hover:bg-blue-50/70 active:scale-98 transition cursor-pointer"
              onClick={async () => {
                setOpen(false);
                await logout();
              }}
              type="button"
            >
              <LogOut className="size-5 stroke-[2.2] text-[#0066FF]" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
