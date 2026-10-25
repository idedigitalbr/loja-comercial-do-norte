'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Clock, MapPin, Navigation, Phone, Search, Star } from 'lucide-react';
import type { StoreLocationsMapProps } from '@/lib/storefront/widget-types';

export function StoreLocationsMapWidget({
  title = 'Encontre nossas unidades',
  subtitle = 'Lojas mais perto de você',
  searchPlaceholder = 'Buscar unidade ou endereço',
  mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d63816.8266816748!2d-48.4901799!3d-1.4450205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sComercial%20do%20Norte%20Belem%20PA!5e0!3m2!1spt-BR!2sbr!4v1710000000000!5m2!1spt-BR!2sbr',
  locations = [],
}: StoreLocationsMapProps) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>(locations[0]?.id ?? '');

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(query.toLowerCase()) ||
      loc.address.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section aria-label={title} className="w-full pt-4">
      <div className="rounded-t-[32px] bg-[#0B0C10] pb-12 pt-10 text-white sm:pt-12">
        <div className="cn-container">
          {/* Header Centralizado com Barra Vermelha */}
          <div className="mb-8 text-center">
            <p className="text-base font-medium text-slate-300 sm:text-lg">
              {title}
            </p>
            <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {subtitle}
            </h2>
            <div className="mx-auto mt-2.5 h-1 w-28 rounded-full bg-[#E2091E]" />
          </div>

          {/* Grid: Coluna Esquerda (Busca + 3 Lojas) e Coluna Direita (Mapa) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Coluna Esquerda: Busca + 3 Cards de Unidades Escuros */}
            <div className="flex flex-col gap-3 lg:col-span-5">
              {/* Barra de Busca no Topo da Coluna Esquerda */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-11 w-full rounded-xl border border-white/15 bg-[#14161D] pl-10 pr-24 text-xs font-medium text-white placeholder:text-slate-400 outline-none focus:border-amber-400"
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  type="text"
                  value={query}
                />
                <a
                  className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-[10px] font-bold text-slate-200 transition hover:bg-white/20"
                  href="https://www.google.com/maps/search/Comercial+do+Norte+Belem+PA"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Navigation className="size-3" />
                  <span>Perto de mim</span>
                </a>
              </div>

              {(filteredLocations.length > 0 ? filteredLocations : locations).map((loc) => {
                const isSelected = selectedId === loc.id || (!selectedId && loc.isFeatured);
                return (
                  <div
                    className={`flex cursor-pointer gap-3.5 rounded-2xl border p-3.5 transition ${
                      isSelected
                        ? 'border-amber-400/80 bg-[#171922] text-white shadow-xl'
                        : 'border-white/10 bg-[#12141B] text-slate-200 hover:border-white/25'
                    }`}
                    key={loc.id}
                    onClick={() => setSelectedId(loc.id)}
                  >
                    {/* Miniatura da Fachada da Loja à Esquerda */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                      <Image
                        alt={loc.name}
                        className="size-full object-cover"
                        height={140}
                        src={loc.imageUrl || '/assets/Fotografias/loja-comercial-do-norte-jurunas.webp'}
                        unoptimized
                        width={140}
                      />
                    </div>

                    {/* Dados da Unidade à Direita */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate text-sm font-extrabold tracking-tight text-white">
                            {loc.name}
                          </h3>
                          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-amber-400">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            <span>{loc.ratingText || '4,8 (1.240)'}</span>
                          </span>
                        </div>

                        <p className="text-[11px] font-semibold text-amber-400">
                          {loc.subtitle || 'Loja de Embalagens e Descartáveis'}
                        </p>

                        <p className="mt-1 line-clamp-1 text-[11px] text-slate-300">
                          <MapPin className="mr-1 inline size-3 text-slate-400" />
                          {loc.address}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <Clock className="size-3 text-emerald-400" />
                          <strong className="text-emerald-400">{loc.badge}</strong>
                          <span>· {loc.hoursWeekdays}</span>
                        </span>

                        <a
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline"
                          href={loc.whatsappUrl}
                          onClick={(e) => e.stopPropagation()}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <Phone className="size-3" />
                          <span>{loc.phone}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coluna Direita: Mapa Google Embed */}
            <div className="relative min-h-[380px] overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl lg:col-span-7">
              <iframe
                allowFullScreen
                className="size-full min-h-[410px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={mapEmbedUrl}
                title="Mapa das Lojas Comercial do Norte em Belém"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
