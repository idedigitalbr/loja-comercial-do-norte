'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ChefHat,
  Ticket,
  Plus,
  Minus,
  MessageCircle,
  Store,
  Tag,
  Coffee,
  Star,
  CheckCircle2,
  Gift,
  Users,
  Percent,
  ExternalLink,
  Map as MapIcon,
  X,
  Sparkles,
} from 'lucide-react';
import './confeitaria-tokens.css';
import type { EventItem } from '@/lib/events-data';

export type ConfeitariaWorkshopSingleProps = {
  event: EventItem;
  breadcrumbParent?: {
    label: string;
    href: string;
  };
};

export function ConfeitariaWorkshopSingle({
  event,
  breadcrumbParent = {
    label: 'Workshops · Aulas Confeitaria',
    href: '/eventos/workshops/aulas-confeitaria',
  },
}: ConfeitariaWorkshopSingleProps) {
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);

  const handleIncrement = () => {
    if (ticketQuantity < 5) {
      setTicketQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (ticketQuantity > 1) {
      setTicketQuantity((prev) => prev - 1);
    }
  };

  // Monta a URL de conversão direta com o WhatsApp incluindo quantidade de ingressos
  const whatsappUrl = React.useMemo(() => {
    const rawNumber = '5591983440880';
    const message = `Olá! Gostaria de garantir ${ticketQuantity} vaga(s) para o "${event.title}".`;
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
  }, [ticketQuantity, event.title]);

  const whatsappDuvidasUrl = React.useMemo(() => {
    const rawNumber = '5591983440880';
    const message = `Olá! Tenho algumas dúvidas sobre o workshop "${event.title}".`;
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
  }, [event.title]);

  const mapsUrl = React.useMemo(() => {
    if (event.locationAddress) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.locationAddress)}`;
    }
    return 'https://maps.google.com/?q=Comercial+do+Norte+Belem';
  }, [event.locationAddress]);

  // Lista de aprendizados (fallback refinado se não cadastrado individualmente)
  const learningPoints = event.whatYouWillLearn || [
    'Técnicas profissionais de preparo e finalização',
    'Pontos ideais de cremosidade e textura',
    'Apresentação e decoração para eventos',
    'Dicas de precificação e conservação',
    'Uso de insumos e embalagens de alta qualidade',
  ];

  // Grade da programação oficial
  const scheduleItems = event.schedule || [
    {
      time: '13h30',
      title: 'Recepção e café da manhã',
      description: 'Recepção dos convidados e parceiros.',
    },
    {
      time: '14h00',
      title: 'Abertura oficial',
      description: 'Apresentação do novo espaço e novidades.',
    },
    {
      time: '14h10',
      title: 'Demonstração de produtos',
      description: 'Principais lançamentos e soluções para o seu negócio.',
    },
    {
      time: '15h30',
      title: 'Parte prática',
      description: 'Mão na massa com receitas e técnicas exclusivas.',
    },
    {
      time: '17h00',
      title: 'Dúvidas e networking',
      description: 'Tire suas dúvidas com os especialistas.',
    },
    {
      time: '17h30',
      title: 'Encerramento',
      description: 'Agradecimento e sorteios de brindes.',
    },
  ];

  // Galeria de fotos
  const galleryImages = event.gallery || [
    '/assets/confeitaria/02-pagina-workshop/06-galeria-confeiteira.jpg',
    '/assets/confeitaria/02-pagina-workshop/07-galeria-brigadeiros-coloridos.jpg',
    '/assets/confeitaria/02-pagina-workshop/08-galeria-aula-pratica.jpg',
    '/assets/confeitaria/02-pagina-workshop/09-galeria-bolo-de-chocolate.jpg',
  ];

  return (
    <div
      data-event-theme="light"
      className="confeitaria-theme w-full min-h-screen bg-[#FAF6F0] text-[#4B290D] selection:bg-[#E0BCBC] selection:text-[#4B290D]"
    >
      {/* =========================================================================
          1. HERO PRINCIPAL DO WORKSHOP COM CARD DE INGRESSO
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#FAF6F0] border-b border-[#EFE4DC]">
        {/* Background fotográfico de confeitaria com degradê rosé/creme suave */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <Image
            alt="Hero Confeitaria Comercial do Norte"
            className="size-full object-cover object-right md:object-[82%_center] opacity-35 lg:opacity-45"
            fill
            priority
            sizes="100vw"
            src="/assets/confeitaria/02-pagina-workshop/02-hero-doces-finos-degrade-pronto.png"
          />
          {/* Degradê horizontal para contraste na coluna de texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF9] via-[#FFFDF9]/95 via-40% md:via-55% lg:via-58% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF6F0] via-transparent to-transparent" />
        </div>

        <div className="cn-container relative z-10 pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pb-20">
          {/* Breadcrumb navegável */}
          <nav aria-label="Você está aqui" className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#73594C] mb-8">
            <Link className="hover:text-[#4B290D] transition-colors" href="/">
              Início
            </Link>
            <ChevronRight className="size-3 text-[#A8968B]" />
            <Link className="hover:text-[#4B290D] transition-colors" href="/eventos">
              Eventos
            </Link>
            <ChevronRight className="size-3 text-[#A8968B]" />
            <Link className="hover:text-[#4B290D] transition-colors text-[#73594C]" href={breadcrumbParent.href}>
              {breadcrumbParent.label}
            </Link>
            <ChevronRight className="size-3 text-[#A8968B]" />
            <span className="font-semibold text-[#B75675] truncate max-w-[200px] sm:max-w-xs">{event.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Coluna da Esquerda: Informações Principais do Workshop */}
            <div className="lg:col-span-7 flex flex-col items-start">
              {/* Tags em pílula */}
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#B75675] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                  {event.badge || 'WORKSHOP CONFEITARIA'}
                </span>
                <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white border border-[#EFE4DC] text-[#4B290D] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  {event.typeBadge || 'EVENTO PRESENCIAL'}
                </span>
              </div>

              {/* Título do Workshop em Serif Sofisticada */}
              <h1 className="confeitaria-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#4B290D] leading-[1.14] tracking-tight">
                {event.title}
              </h1>

              {/* Subtítulo / Descrição de abertura */}
              <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#73594C] leading-relaxed max-w-xl">
                {event.subtitle || event.description}
              </p>

              {/* Bloco de 3 Informações Rápidas */}
              <div className="mt-8 pt-6 border-t border-[#EFE4DC] w-full grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Data */}
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF2ED] text-[#B75675] border border-[#E0BCBC]/60">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#4B290D]">
                      {event.eventDateText || '18 de Novembro de 2024'}
                    </div>
                    <div className="text-[11px] text-[#73594C]">{event.eventWeekday || 'Segunda-feira'}</div>
                  </div>
                </div>

                {/* Horário */}
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF2ED] text-[#B75675] border border-[#E0BCBC]/60">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#4B290D]">
                      {event.eventTime || '13h30 às 17h30'}
                    </div>
                    <div className="text-[11px] text-[#73594C]">{event.durationText || '4 horas de workshop'}</div>
                  </div>
                </div>

                {/* Local */}
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF2ED] text-[#B75675] border border-[#E0BCBC]/60">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#4B290D] line-clamp-1">
                      {event.location || 'Centro Técnico Comercial do Norte'}
                    </div>
                    <div className="text-[11px] text-[#73594C] line-clamp-1">
                      {event.locationAddress || 'Av. Bernardo Sayão — Belém/PA'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna da Direita: Card de Inscrição / Garanta seu Ingresso */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE4DC] shadow-xl shadow-[#4B290D]/5 relative">
                {/* Badge Gratuito / Vagas Limitadas */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF2ED] border border-[#E0BCBC]/60 text-[#B75675] text-[10px] font-black uppercase tracking-wider mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B75675]" />
                  EVENTO GRATUITO
                </div>

                <h2 className="confeitaria-serif text-2xl font-bold text-[#4B290D] tracking-tight">
                  Garanta seu ingresso
                </h2>
                <p className="mt-1.5 text-xs text-[#73594C]">
                  Escolha a quantidade de pessoas e confirme sua presença. As vagas são limitadas!
                </p>

                {/* Seletor de Quantidade de Ingressos */}
                <div className="mt-6 p-4 rounded-2xl bg-[#FAF6F0] border border-[#EFE4DC]">
                  <div className="text-xs font-bold text-[#4B290D] mb-3">Quantidade de ingressos</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        aria-label="Diminuir ingressos"
                        className="size-9 rounded-xl bg-white border border-[#EFE4DC] flex items-center justify-center text-[#4B290D] hover:bg-[#F5EAE0] transition-colors disabled:opacity-40 cursor-pointer"
                        disabled={ticketQuantity <= 1}
                        onClick={handleDecrement}
                        type="button"
                      >
                        <Minus className="size-4" />
                      </button>

                      <span className="w-8 text-center text-lg font-black text-[#4B290D]">{ticketQuantity}</span>

                      <button
                        aria-label="Aumentar ingressos"
                        className="size-9 rounded-xl bg-white border border-[#EFE4DC] flex items-center justify-center text-[#4B290D] hover:bg-[#F5EAE0] transition-colors disabled:opacity-40 cursor-pointer"
                        disabled={ticketQuantity >= 5}
                        onClick={handleIncrement}
                        type="button"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>

                    <div className="text-[11px] text-[#A8968B] text-right">
                      Máximo de 5 ingressos <br />
                      por cadastro
                    </div>
                  </div>
                </div>

                {/* Botão de Ação Primário Marrom Chocolate */}
                <a
                  aria-label="Garantir Vaga no WhatsApp"
                  className="mt-5 w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-[#4B290D] hover:bg-[#381E09] py-3.5 px-6 text-sm font-bold text-white transition-all shadow-md shadow-[#4B290D]/20 cursor-pointer"
                  href={whatsappUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Ticket className="size-4" />
                  <span>Garantir Vaga agora</span>
                  <ChevronRight className="size-4" />
                </a>

                {/* Botão Secundário de WhatsApp */}
                <a
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#FDF2ED] hover:bg-[#F5EAE0] py-3 px-6 text-xs font-bold text-[#4B290D] border border-[#E0BCBC]/60 transition-colors cursor-pointer"
                  href={whatsappDuvidasUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <MessageCircle className="size-4 text-[#25D366]" />
                  <span>Tirar dúvidas no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. LINHA DE 4 BENEFÍCIOS / INFRAESTRUTURA
          ========================================================================= */}
      <section className="cn-container py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="rounded-2xl bg-white border border-[#EFE4DC] p-5 flex items-center gap-4 confeitaria-card-shadow">
            <div className="size-12 rounded-xl bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
              <Store className="size-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#4B290D]">Novos ambientes</div>
              <div className="text-xs text-[#73594C] mt-0.5">Um espaço mais moderno e completo para você.</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#EFE4DC] p-5 flex items-center gap-4 confeitaria-card-shadow">
            <div className="size-12 rounded-xl bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
              <Tag className="size-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#4B290D]">Promoções exclusivas</div>
              <div className="text-xs text-[#73594C] mt-0.5">Condições especiais durante o evento.</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#EFE4DC] p-5 flex items-center gap-4 confeitaria-card-shadow">
            <div className="size-12 rounded-xl bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
              <Coffee className="size-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#4B290D]">Café da manhã</div>
              <div className="text-xs text-[#73594C] mt-0.5">Um momento especial com clientes e parceiros.</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#EFE4DC] p-5 flex items-center gap-4 confeitaria-card-shadow">
            <div className="size-12 rounded-xl bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
              <Star className="size-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#4B290D]">Especialistas do mercado</div>
              <div className="text-xs text-[#73594C] mt-0.5">Dicas e novidades para o seu negócio.</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SEÇÃO "SOBRE O EVENTO" + "O QUE VOCÊ VAI APRENDER" + FOTO + MAPA
          ========================================================================= */}
      <section className="cn-container py-8 sm:py-12 border-t border-[#EFE4DC]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Coluna da Esquerda: Descrição & O que você vai aprender */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B75675] mb-2.5">
                <span className="w-5 h-0.5 bg-[#B75675]" />
                Sobre o Evento
              </div>
              <h2 className="confeitaria-serif text-2xl sm:text-3xl font-bold text-[#4B290D]">
                Aprenda com quem vive a confeitaria no dia a dia
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#73594C] leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Box Destacado: O que você vai aprender */}
            <div className="rounded-3xl bg-[#FDF6F4] border border-[#F2DFDA] p-6 sm:p-7">
              <h3 className="text-base font-bold text-[#B75675] mb-4 flex items-center gap-2">
                <Sparkles className="size-4" />
                <span>O que você vai aprender:</span>
              </h3>
              <ul className="space-y-3">
                {learningPoints.map((point, idx) => (
                  <li className="flex items-start gap-3 text-xs sm:text-sm text-[#4B290D]" key={idx}>
                    <CheckCircle2 className="size-4 text-[#B75675] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coluna da Direita: Card com Foto de Brigadeiros Gourmet + Localização */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Foto Alta dos Brigadeiros com Plaqueta */}
            <div className="rounded-3xl overflow-hidden bg-white border border-[#EFE4DC] shadow-lg relative group">
              <div className="relative aspect-[4/3] sm:aspect-[14/11] w-full">
                <Image
                  alt="Brigadeiros gourmet e doces finos do workshop Comercial do Norte"
                  className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  src={event.aboutPhotoUrl || '/assets/confeitaria/02-pagina-workshop/03-foto-brigadeiros-sobre-o-evento.jpg'}
                />
              </div>
              <div className="p-4 bg-white border-t border-[#EFE4DC] flex items-center gap-3">
                <div className="size-9 rounded-full bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
                  <ChefHat className="size-4" />
                </div>
                <div className="text-xs font-bold text-[#4B290D]">
                  Com receitas exclusivas e equipamento profissional
                </div>
              </div>
            </div>

            {/* Card de Localização com Mapa */}
            <div className="rounded-3xl bg-white border border-[#EFE4DC] p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="size-9 rounded-xl bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#A8968B]">Local do Evento</div>
                  <div className="text-sm font-bold text-[#4B290D]">{event.location || 'Centro Técnico Comercial do Norte'}</div>
                  <div className="text-xs text-[#73594C]">{event.locationAddress || 'Av. Bernardo Sayão — Belém/PA'}</div>
                </div>
              </div>

              {/* Mini mapa estilizado com botão de ação */}
              <div className="relative aspect-[16/8] w-full rounded-2xl overflow-hidden bg-[#FAF6F0] border border-[#EFE4DC] flex items-center justify-center p-4 text-center">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-xs text-xs font-bold text-[#4B290D]">
                    <MapPin className="size-3.5 text-[#B75675]" />
                    <span>{event.location}</span>
                  </div>
                  <div>
                    <a
                      className="inline-flex items-center gap-2 rounded-full bg-[#4B290D] px-4 py-2 text-xs font-bold text-white hover:bg-[#381E09] transition-colors cursor-pointer"
                      href={mapsUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <MapIcon className="size-3.5" />
                      <span>Abrir no Google Maps</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. SEÇÃO "PROGRAMAÇÃO" + "O QUE TE ESPERA" + BANNER DE CUPCAKES
          ========================================================================= */}
      <section className="cn-container py-8 sm:py-12 border-t border-[#EFE4DC]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Coluna da Esquerda: Timeline da Programação */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B75675] mb-2.5">
              <span className="w-5 h-0.5 bg-[#B75675]" />
              Programação
            </div>
            <h2 className="confeitaria-serif text-2xl sm:text-3xl font-bold text-[#4B290D] mb-8">
              Cronograma do Workshop
            </h2>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E0BCBC]">
              {scheduleItems.map((item, idx) => (
                <div className="relative flex items-start gap-4" key={idx}>
                  {/* Badge de Horário como Nó da Linha do Tempo */}
                  <div className="absolute -left-6 sm:-left-8 top-0">
                    <span className="inline-flex items-center justify-center rounded-full bg-[#B75675] px-2.5 py-1 text-[11px] font-black text-white shadow-xs">
                      {item.time}
                    </span>
                  </div>
                  <div className="ml-10 sm:ml-12 pt-0.5">
                    <h3 className="text-sm font-bold text-[#4B290D]">{item.title}</h3>
                    <p className="mt-0.5 text-xs text-[#73594C] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna da Direita: O que te espera (Grid 2x2) + Banner Cupcakes */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B75675] mb-2.5">
                <span className="w-5 h-0.5 bg-[#B75675]" />
                O que te espera
              </div>
              <h2 className="confeitaria-serif text-2xl sm:text-3xl font-bold text-[#4B290D] mb-6">
                Estrutura pensada para você
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white border border-[#EFE4DC] p-4 flex items-center gap-3.5 confeitaria-card-shadow">
                  <div className="size-11 rounded-xl bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
                    <Store className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#4B290D]">Loja ampliada</div>
                    <div className="text-[11px] text-[#73594C]">Mais espaço e variedade de produtos.</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-[#EFE4DC] p-4 flex items-center gap-3.5 confeitaria-card-shadow">
                  <div className="size-11 rounded-xl bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
                    <Percent className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#4B290D]">Condições exclusivas</div>
                    <div className="text-[11px] text-[#73594C]">Promoções válidas apenas no evento.</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-[#EFE4DC] p-4 flex items-center gap-3.5 confeitaria-card-shadow">
                  <div className="size-11 rounded-xl bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
                    <Gift className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#4B290D]">Sorteios e brindes</div>
                    <div className="text-[11px] text-[#73594C]">Participe e concorra a prêmios especiais.</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-[#EFE4DC] p-4 flex items-center gap-3.5 confeitaria-card-shadow">
                  <div className="size-11 rounded-xl bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#4B290D]">Atendimento especializado</div>
                    <div className="text-[11px] text-[#73594C]">Converse com nossa equipe e tire suas dúvidas.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Decorativo dos Cupcakes */}
            <div className="rounded-3xl overflow-hidden relative shadow-md border border-[#EFE4DC]">
              <div className="relative aspect-[16/7] w-full flex items-center">
                <Image
                  alt="Banner cupcakes e confeitaria criativa Comercial do Norte"
                  className="size-full object-cover object-center"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src="/assets/confeitaria/02-pagina-workshop/05-banner-cupcakes-degrade-pronto.png"
                />
                <div className="relative z-10 p-6 sm:p-8 max-w-xs">
                  <div className="italic font-serif text-2xl text-[#B75675] font-bold leading-tight">
                    Aprenda Técnicas Reais <br />
                    com Especialistas ♡
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. GALERIA: "VEJA COMO FOI NA ÚLTIMA EDIÇÃO"
          ========================================================================= */}
      <section className="cn-container py-10 sm:py-14 border-t border-[#EFE4DC]">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B75675] mb-2">
              <span className="w-5 h-0.5 bg-[#B75675]" />
              Galeria de Momentos
            </div>
            <h2 className="confeitaria-serif text-2xl sm:text-3xl font-bold text-[#4B290D]">
              Veja como foi na última edição
            </h2>
          </div>

          {/* Dica / instrução para clique */}
          <div className="hidden sm:block text-xs text-[#73594C]">
            Clique para ampliar as fotos
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {galleryImages.map((src, idx) => (
            <div
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#EFE4DC] shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              key={idx}
              onClick={() => setActiveGalleryIndex(idx)}
            >
              <Image
                alt={`Momento do workshop ${idx + 1}`}
                className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                src={src}
              />
              <div className="absolute inset-0 bg-[#4B290D]/0 group-hover:bg-[#4B290D]/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity size-9 rounded-full bg-white/90 text-[#4B290D] flex items-center justify-center shadow-md">
                  <Plus className="size-5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox / Modal de Foto Ampliada */}
        {activeGalleryIndex !== null ? (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveGalleryIndex(null)}
          >
            <div
              className="relative max-w-4xl w-full aspect-[16/10] max-h-[85vh] rounded-2xl overflow-hidden bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                alt="Foto ampliada da última edição do workshop"
                className="size-full object-contain"
                fill
                priority
                src={galleryImages[activeGalleryIndex]}
              />

              {/* Botão Fechar */}
              <button
                aria-label="Fechar galeria"
                className="absolute top-4 right-4 size-10 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors cursor-pointer"
                onClick={() => setActiveGalleryIndex(null)}
                type="button"
              >
                <X className="size-5" />
              </button>

              {/* Navegação Anterior / Próximo */}
              <button
                aria-label="Foto anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors cursor-pointer"
                onClick={() =>
                  setActiveGalleryIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryImages.length - 1))
                }
                type="button"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                aria-label="Próxima foto"
                className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors cursor-pointer"
                onClick={() =>
                  setActiveGalleryIndex((prev) => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : 0))
                }
                type="button"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* =========================================================================
          6. CARD FINAL: "AINDA TEM DÚVIDAS?" (CTA WHATSAPP)
          ========================================================================= */}
      <section className="cn-container pb-14 sm:pb-20">
        <div className="rounded-3xl bg-[#FDF5F3] border border-[#F2DFDA] p-6 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-[#F5E6E6] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/60">
              <MessageCircle className="size-6 text-[#25D366]" />
            </div>
            <div>
              <h2 className="confeitaria-serif text-xl sm:text-2xl font-bold text-[#4B290D]">
                Ainda tem dúvidas?
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#73594C]">
                Fale com nossa equipe pelo WhatsApp e tire todas as suas dúvidas sobre o evento.
              </p>
            </div>
          </div>

          <a
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4B290D] hover:bg-[#381E09] px-7 py-3.5 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-[#4B290D]/20 cursor-pointer shrink-0"
            href={whatsappDuvidasUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle className="size-4 text-[#25D366]" />
            <span>Falar no WhatsApp</span>
            <ChevronRight className="size-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
