'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Compass,
  Headphones,
  HelpCircle,
  MapPin,
  MessageCircle,
  Send,
  ShoppingBag,
  Sparkles,
  X,
  Minimize2,
} from 'lucide-react';
import { useNortTour } from './tour';

export type NortChatFloatingProps = {
  whatsapp?: string | null;
  phone?: string | null;
};

export function NortChatFloating({ whatsapp, phone }: NortChatFloatingProps) {
  const { startTour } = useNortTour();
  const [isOpen, setIsOpen] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [inputText, setInputText] = useState('');
  const [storeInfoVisible, setStoreInfoVisible] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  // Número limpo de WhatsApp (fallback para o número oficial da loja)
  const defaultWhatsapp = '5591983440880';
  const rawNumber = whatsapp || phone || defaultWhatsapp;
  const whatsappDigits = rawNumber.replace(/\D/g, '') || defaultWhatsapp;

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        chatBodyRef.current?.scrollTo({
          top: chatBodyRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [isOpen, storeInfoVisible]);

  function handleSendCustomMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${whatsappDigits}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setInputText('');
  }

  function openWhatsAppTopic(topicMessage: string) {
    const encoded = encodeURIComponent(topicMessage);
    const url = `https://wa.me/${whatsappDigits}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      {/* ======================================================== */}
      {/* 1. BALÃO FLUTUANTE DE PRÉVIA / CONVITE DO NORTI          */}
      {/* ======================================================== */}
      {!isOpen && !bubbleDismissed && (
        <aside
          aria-label="Convite de atendimento do Norti"
          className="fixed bottom-20 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[280px] sm:max-w-[320px]"
        >
          <div className="relative flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] border border-emerald-100 ring-1 ring-black/5">
            {/* Avatar Norti */}
            <div className="relative size-10 shrink-0 rounded-full bg-emerald-500/10 p-0.5 ring-2 ring-emerald-500 overflow-hidden">
              <Image
                alt="Norti Atendente"
                className="size-full object-contain"
                height={40}
                src="/assets/nort-avatar.png"
                unoptimized
                width={40}
              />
            </div>

            {/* Texto de Convite */}
            <div
              className="flex-1 min-w-0 cursor-pointer text-left"
              onClick={() => setIsOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setIsOpen(true);
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Norti</span>
                <span className="flex size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                  Online
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600 leading-snug">
                Oi! Precisa de ajuda com cotação ou produtos? Fala comigo! 👋
              </p>
            </div>

            {/* Botão Fechar Notificação */}
            <button
              aria-label="Dispensar aviso do Norti"
              className="text-slate-400 hover:text-slate-600 transition -mr-1 -mt-1 p-1 rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                setBubbleDismissed(true);
              }}
              type="button"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* ======================================================== */}
      {/* 2. BOTÃO FLUTUANTE PRINCIPAL (CANTO INFERIOR DIREITO)    */}
      {/* ======================================================== */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          aria-controls={id}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={
            isOpen ? 'Fechar chat do Norti' : 'Abrir chat com o Norti no WhatsApp'
          }
          className="group relative flex size-14 sm:size-15 items-center justify-center rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#25D366] text-white shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-white/90"
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
        >
          {isOpen ? (
            <X className="size-6 text-white transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <>
              {/* Ícone clássico do WhatsApp (SVG) */}
              <svg
                aria-hidden="true"
                className="size-7.5 fill-current text-white drop-shadow-xs"
                viewBox="0 0 24 24"
              >
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.31" />
              </svg>

              {/* Mini Badge Avatar do Norti fixado no topo do botão */}
              <div className="absolute -top-1.5 -left-1.5 size-7 rounded-full bg-white p-0.5 shadow-md ring-2 ring-emerald-500 overflow-hidden">
                <Image
                  alt="Norti Avatar"
                  className="size-full object-contain"
                  height={28}
                  src="/assets/nort-avatar.png"
                  unoptimized
                  width={28}
                />
              </div>

              {/* Ponto indicador de status verde */}
              <span className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
            </>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. MODAL / PAINEL DE CHAT ESTILO WHATSAPP               */}
      {/* ======================================================== */}
      {isOpen && (
        <section
          id={id}
          aria-label="Chat de atendimento com o mascote Norti"
          className="fixed bottom-22 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[380px] md:w-[400px] h-[520px] max-h-[calc(100vh-110px)] bg-[#ECE5DD] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-slate-200/80 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
        >
          {/* CABEÇALHO ESTILO WHATSAPP COM NORTI */}
          <header className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar circular do Norti com status */}
              <div className="relative size-10.5 shrink-0 rounded-full bg-white/20 p-0.5 ring-2 ring-emerald-400/80 overflow-hidden">
                <Image
                  alt="Norti Mascote Oficial"
                  className="size-full object-contain"
                  height={42}
                  src="/assets/nort-avatar.png"
                  unoptimized
                  width={42}
                />
              </div>

              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-white tracking-wide truncate">
                    Norti
                  </h2>
                  <span className="rounded-full bg-emerald-500/30 border border-emerald-400/40 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-200 uppercase tracking-wider">
                    Atendente Oficial
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-100 font-medium">
                    Online agora • Comercial do Norte
                  </span>
                </div>
              </div>
            </div>

            {/* Ações do Topo */}
            <div className="flex items-center gap-1">
              <button
                aria-label="Minimizar chat"
                className="flex size-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <Minimize2 className="size-4" />
              </button>
              <button
                aria-label="Fechar chat do Norti"
                className="flex size-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X className="size-4.5" />
              </button>
            </div>
          </header>

          {/* CORPO DE MENSAGENS COM BALÕES ESTILO WHATSAPP */}
          <div
            ref={chatBodyRef}
            className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#EFEAE2]/95"
            style={{
              backgroundImage:
                'radial-gradient(rgba(7, 94, 84, 0.08) 1px, transparent 1px), radial-gradient(rgba(7, 94, 84, 0.08) 1px, #efeae2 1px)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
            }}
          >
            {/* Tag Central de Criptografia / Confiança */}
            <div className="flex justify-center">
              <span className="rounded-lg bg-amber-100/90 border border-amber-200 px-3 py-1 text-[10px] text-amber-900 shadow-xs text-center max-w-[90%]">
                🔒 Atendimento oficial Comercial do Norte via WhatsApp &amp; CRM
              </span>
            </div>

            {/* BALÃO 01: APRESENTAÇÃO DO NORTI */}
            <div className="flex flex-col items-start max-w-[90%]">
              <div className="relative rounded-2xl rounded-tl-none bg-white p-3 text-xs sm:text-[13px] text-slate-800 shadow-sm border border-slate-200/60 leading-relaxed">
                <p className="font-bold text-[#004CB1] mb-1 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-500" />
                  Oi! Eu sou o Norti! 👋
                </p>
                <p>
                  Sou o assistente virtual da <strong>Comercial do Norte</strong>.
                  Como posso te ajudar hoje?
                </p>
                <span className="mt-1 block text-right text-[10px] text-slate-400">
                  {new Date().toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* BALÃO 02: OPÇÕES DE ATENDIMENTO INTERATIVAS */}
            <div className="flex flex-col items-start max-w-[95%] space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-600 px-1">
                Escolha uma opção de atendimento rápido:
              </span>

              {/* Opção 1: Vendas WhatsApp */}
              <button
                className="w-full flex items-center justify-between gap-2.5 rounded-xl bg-white p-2.5 text-left text-xs font-semibold text-slate-800 border border-emerald-600/20 hover:border-emerald-600 hover:bg-emerald-50/70 transition shadow-xs cursor-pointer group"
                onClick={() =>
                  openWhatsAppTopic(
                    'Olá! Gostaria de falar com um vendedor da Comercial do Norte para tirar dúvidas sobre produtos e preços.'
                  )
                }
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                    <MessageCircle className="size-3.5" />
                  </div>
                  <span>Falar com Vendas no WhatsApp</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">
                  Iniciar &rarr;
                </span>
              </button>

              {/* Opção 2: Cotação */}
              <button
                className="w-full flex items-center justify-between gap-2.5 rounded-xl bg-white p-2.5 text-left text-xs font-semibold text-slate-800 border border-blue-600/20 hover:border-blue-600 hover:bg-blue-50/70 transition shadow-xs cursor-pointer group"
                onClick={() =>
                  openWhatsAppTopic(
                    'Olá Norti! Preciso de ajuda com a minha lista de cotação de produtos na loja.'
                  )
                }
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#004CB1] text-white">
                    <ShoppingBag className="size-3.5" />
                  </div>
                  <span>Ajuda com Lista de Cotação</span>
                </div>
                <span className="text-[10px] text-[#004CB1] font-bold group-hover:translate-x-0.5 transition-transform">
                  Cotar &rarr;
                </span>
              </button>

              {/* Opção 3: Ver Tour Guiado (Reaproveitamento da interação anterior do Header) */}
              <button
                className="w-full flex items-center justify-between gap-2.5 rounded-xl bg-white p-2.5 text-left text-xs font-semibold text-slate-800 border border-amber-500/25 hover:border-amber-500 hover:bg-amber-50/70 transition shadow-xs cursor-pointer group"
                onClick={() => {
                  setIsOpen(false);
                  startTour();
                }}
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                    <Compass className="size-3.5" />
                  </div>
                  <span>Fazer Tour Guiado na Loja</span>
                </div>
                <span className="text-[10px] text-amber-700 font-bold group-hover:translate-x-0.5 transition-transform">
                  Explorar &rarr;
                </span>
              </button>

              {/* Opção 4: Nossas Lojas e Horários */}
              <button
                className="w-full flex items-center justify-between gap-2.5 rounded-xl bg-white p-2.5 text-left text-xs font-semibold text-slate-800 border border-purple-500/20 hover:border-purple-500 hover:bg-purple-50/70 transition shadow-xs cursor-pointer group"
                onClick={() => setStoreInfoVisible((prev) => !prev)}
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white">
                    <MapPin className="size-3.5" />
                  </div>
                  <span>Endereços e Horários das Lojas</span>
                </div>
                <span className="text-[10px] text-purple-700 font-bold group-hover:translate-x-0.5 transition-transform">
                  {storeInfoVisible ? 'Ocultar' : 'Ver'} &rarr;
                </span>
              </button>

              {/* Opção 5: Pós-Venda e Suporte CRM */}
              <button
                className="w-full flex items-center justify-between gap-2.5 rounded-xl bg-white p-2.5 text-left text-xs font-semibold text-slate-800 border border-slate-300 hover:border-slate-500 hover:bg-slate-50 transition shadow-xs cursor-pointer group"
                onClick={() =>
                  openWhatsAppTopic(
                    'Olá! Preciso de atendimento de pós-venda / suporte da Comercial do Norte.'
                  )
                }
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-white">
                    <Headphones className="size-3.5" />
                  </div>
                  <span>Suporte e Pós-Venda CRM</span>
                </div>
                <span className="text-[10px] text-slate-600 font-bold group-hover:translate-x-0.5 transition-transform">
                  Abrir &rarr;
                </span>
              </button>
            </div>

            {/* BALÃO DINÂMICO DE LOJAS (QUANDO CLICADO) */}
            {storeInfoVisible && (
              <div className="flex flex-col items-start max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="relative rounded-2xl rounded-tl-none bg-white p-3 text-xs text-slate-800 shadow-sm border border-slate-200/60 leading-relaxed">
                  <p className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-purple-600" />
                    Nossas Unidades em Belém e Região:
                  </p>
                  <ul className="space-y-1.5 mt-2 text-[11px] text-slate-600">
                    <li>
                      <strong>📍 Bernardo Sayão:</strong> Av. Bernardo Sayão, 608 —
                      Guamá
                    </li>
                    <li>
                      <strong>📍 Jurunas:</strong> Av. Bernardo Sayão, 1414 —
                      Jurunas
                    </li>
                    <li>
                      <strong>📍 Cidade Nova:</strong> Tv. WE-59, 138 — Ananindeua
                    </li>
                    <li>
                      <strong>📍 Online / Delivery:</strong> Tv. das Mercês, 158
                    </li>
                  </ul>
                  <p className="mt-2 text-[10.5px] text-slate-500">
                    Segunda a Sexta: 07h às 19h | Sábado: 07h às 13h
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RODAPÉ COM CAMPO DE MENSAGEM LIVRE (ENVIO DIRETO AO WHATSAPP) */}
          <footer className="bg-[#F0F2F5] p-2.5 border-t border-slate-200/90 shrink-0">
            <form
              className="flex items-center gap-2"
              onSubmit={handleSendCustomMessage}
            >
              <input
                ref={inputRef}
                aria-label="Digite sua mensagem para o atendimento"
                className="flex-1 rounded-full bg-white px-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite sua dúvida ou pedido..."
                type="text"
                value={inputText}
              />
              <button
                aria-label="Enviar mensagem no WhatsApp"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white hover:bg-[#128C7E] transition shadow-sm cursor-pointer disabled:opacity-50"
                disabled={!inputText.trim()}
                type="submit"
              >
                <Send className="size-4 ml-0.5" />
              </button>
            </form>
          </footer>
        </section>
      )}
    </>
  );
}
