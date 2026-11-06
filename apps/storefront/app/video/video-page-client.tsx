'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Play,
  Share2,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
} from 'lucide-react';
import { openNortVideo } from '@/components/intro';

export interface VideoPageClientProps {
  whatsapp?: string | null;
  siteUrl: string;
}

export function VideoPageClient({
  whatsapp = '5591983440880',
  siteUrl,
}: VideoPageClientProps) {
  const [copied, setCopied] = useState(false);

  // Dispara a abertura automática em tela cheia do vídeo oficial
  useEffect(() => {
    const timer = setTimeout(() => {
      openNortVideo();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const videoShareUrl = `${siteUrl.replace(/\/$/, '')}/video`;
  const whatsappDigits = (whatsapp || '5591983440880').replace(/\D/g, '');
  const whatsappChatUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
    'Olá! Assisti ao vídeo de apresentação da Comercial do Norte e gostaria de solicitar uma cotação de produtos.'
  )}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Assista ao vídeo oficial da Comercial do Norte — Embalagens, descartáveis e mercearia em Belém/PA: ${videoShareUrl}`
  )}`;

  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Comercial do Norte | Apresentação Oficial',
          text: 'Assista ao vídeo da Comercial do Norte: para todos os negócios, de todos os tamanhos!',
          url: videoShareUrl,
        });
        return;
      } catch {
        // Fallback para cópia de link
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(videoShareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      } catch {
        // Fallback para abertura direta do WhatsApp
      }
    }

    window.open(whatsappShareUrl, '_blank', 'noopener,noreferrer');
  }, [videoShareUrl, whatsappShareUrl]);

  return (
    <div
      id="video-page-root"
      className="min-h-screen bg-[#001438] text-white flex flex-col justify-between selection:bg-[#E2091E] selection:text-white"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 0%, #003380 0%, #001D4A 45%, #00102B 100%)',
      }}
    >
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            aria-label="Página Inicial Comercial do Norte"
          >
            <div className="relative h-9 w-32 sm:h-11 sm:w-40">
              <Image
                src="/logo-comercial-do-norte-branca.png"
                alt="Comercial do Norte"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E2091E]/20 text-[#FF4D5E] border border-[#E2091E]/40 text-xs font-semibold">
              <Sparkles className="size-3" /> Vídeo Oficial
            </span>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleShare}
              data-testid="video-share-button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-medium border border-white/20 transition-all cursor-pointer active:scale-95"
              aria-label="Compartilhar link do vídeo"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="size-4 text-white/80" />
                  <span className="hidden xs:inline">Compartilhar</span>
                </>
              )}
            </button>

            <Link
              href="/"
              data-testid="video-go-to-store-button"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#E2091E] hover:bg-[#c9081a] text-white text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(226,9,30,0.4)] transition-all cursor-pointer active:scale-95 group"
            >
              <span>Ir para a Loja</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs sm:text-sm font-semibold text-white/95 mb-4 shadow-sm animate-in fade-in duration-300">
          <span className="w-2 h-2 rounded-full bg-[#E2091E] animate-ping" />
          <span>Apresentação Institucional Comercial do Norte</span>
        </div>

        {/* Headings */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-center tracking-tight text-white max-w-3xl leading-tight">
          Para todos os Negócios, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            De todos os tamanhos
          </span>
        </h1>
        <div className="mt-3 h-1 w-24 rounded-full bg-[#E2091E]" />

        <p className="mt-3.5 text-center text-sm sm:text-base md:text-lg text-white/80 max-w-2xl font-normal leading-relaxed">
          Assista à apresentação oficial e conheça a maior variedade de embalagens,
          descartáveis, confeitaria e mercearia de Belém/PA.
        </p>

        {/* Cinematic Video Card / Preview Frame */}
        <div className="w-full mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl overflow-hidden bg-black/50 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative group">
          <div className="relative aspect-video w-full cursor-pointer overflow-hidden bg-black flex items-center justify-center">
            {/* Poster Thumbnail */}
            <Image
              src="/videos/nort-intro-poster.jpg"
              alt="Assista ao vídeo institucional Comercial do Norte"
              fill
              priority
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-90"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 pointer-events-none" />

            {/* Central Glowing Play Button */}
            <button
              type="button"
              onClick={() => openNortVideo()}
              data-testid="video-hero-play-button"
              className="relative z-10 flex flex-col items-center gap-3 cursor-pointer group/btn"
              aria-label="Assistir ao vídeo em tela cheia"
            >
              <div className="size-16 sm:size-20 md:size-24 rounded-full bg-[#E2091E] text-white flex items-center justify-center shadow-[0_0_35px_rgba(226,9,30,0.8)] border-[3px] border-white transition-all duration-300 group-hover/btn:scale-110 active:scale-95">
                <Play className="size-7 sm:size-9 md:size-11 fill-white ml-1 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider bg-black/60 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md shadow-md group-hover/btn:bg-black/80 transition-colors">
                Assistir em Tela Cheia
              </span>
            </button>

            {/* Floating duration tag */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 border border-white/20 backdrop-blur-sm text-[11px] sm:text-xs font-mono font-medium text-white/90">
              <Clock className="size-3 text-[#E2091E]" />
              <span>00:26 • Full HD</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Hub */}
        <div className="w-full mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Assistir em Tela Cheia */}
          <button
            type="button"
            onClick={() => openNortVideo()}
            data-testid="video-cta-replay-button"
            className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-[#E2091E] hover:bg-[#c9081a] text-white font-bold text-sm sm:text-base shadow-[0_6px_20px_rgba(226,9,30,0.4)] border border-white/20 transition-all cursor-pointer active:scale-95"
          >
            <Play className="size-5 fill-white text-white shrink-0" />
            <span>Assistir em Tela Cheia</span>
          </button>

          {/* 2. Ir para a Loja Virtual */}
          <Link
            href="/"
            data-testid="video-cta-store-button"
            className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#002868] font-bold text-sm sm:text-base shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <ShoppingBag className="size-5 text-[#002868] shrink-0" />
            <span>Acessar Loja Virtual</span>
          </Link>

          {/* 3. Falar no WhatsApp */}
          <a
            href={whatsappChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="video-cta-whatsapp-chat-button"
            className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-[#00A884] hover:bg-[#075844] text-white font-bold text-sm sm:text-base shadow-[0_6px_20px_rgba(0,168,132,0.35)] border border-white/20 transition-all cursor-pointer active:scale-95"
          >
            <MessageCircle className="size-5 text-white shrink-0" />
            <span>Falar no WhatsApp</span>
          </a>

          {/* 4. Compartilhar no WhatsApp */}
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="video-cta-whatsapp-share-button"
            className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-300 border border-[#25D366]/40 font-bold text-sm sm:text-base shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Share2 className="size-5 text-emerald-300 shrink-0" />
            <span>Mandar no WhatsApp</span>
          </a>
        </div>

        {/* Mascote Nort & Segmentos */}
        <section
          aria-label="Produtos para todos os segmentos"
          className="w-full mt-10 sm:mt-14 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 p-5 sm:p-8 backdrop-blur-md"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="relative shrink-0 w-44 sm:w-56 h-40 sm:h-52">
              <Image
                src="/assets/nort-segmentos.png"
                alt="Mascote Nort Comercial do Norte"
                fill
                className="object-contain"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF4D5E]">
                Atendimento Completo
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mt-1">
                Veja as embalagens ideais para o seu segmento
              </h2>
              <p className="mt-2 text-sm sm:text-base text-white/75 leading-relaxed">
                Mais de 5.000 itens a pronta entrega: caixas para pizza, embalagens
                para delivery, formas para doces, descartáveis e mercearia para
                comércios de pequeno, médio e grande porte.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5 justify-center md:justify-start">
                <Link
                  href="/segmento/lanchonete"
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/15 transition-colors"
                >
                  🍔 Lanchonetes
                </Link>
                <Link
                  href="/segmento/pizzaria"
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/15 transition-colors"
                >
                  🍕 Pizzarias
                </Link>
                <Link
                  href="/segmento/confeitaria"
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/15 transition-colors"
                >
                  🎂 Confeitarias
                </Link>
                <Link
                  href="/segmento/restaurante"
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/15 transition-colors"
                >
                  🥡 Delivery & Refeições
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Destaques Institucionais */}
        <section
          aria-label="Vantagens Comercial do Norte"
          className="w-full mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
        >
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-start gap-3">
            <Package className="size-6 text-[#E2091E] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-white">+5.000 Itens</h3>
              <p className="text-xs text-white/70 mt-0.5">
                Variedade completa a pronta entrega no atacado e varejo.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-start gap-3">
            <Truck className="size-6 text-[#E2091E] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-white">Entrega Rápida</h3>
              <p className="text-xs text-white/70 mt-0.5">
                Logística ágil em Belém, Ananindeua e Região Metropolitana.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-start gap-3">
            <Store className="size-6 text-[#E2091E] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-white">6 Lojas Físicas</h3>
              <p className="text-xs text-white/70 mt-0.5">
                São Brás, Pedreira, Jurunas, Guamá, Cidade Nova e Marituba.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-start gap-3">
            <MessageCircle className="size-6 text-[#00A884] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-white">Cotação pelo WhatsApp</h3>
              <p className="text-xs text-white/70 mt-0.5">
                Equipe pronta para orçar suas listas com condições especiais.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-black/40 py-6 mt-12 text-center text-xs text-white/60">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Comercial do Norte - Todos os direitos reservados. Belém/PA.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">
              Página Inicial
            </Link>
            <Link href="/loja" className="hover:text-white transition-colors">
              Catálogo de Produtos
            </Link>
            <Link href="/cotacao" className="hover:text-white transition-colors">
              Minha Cotação
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
