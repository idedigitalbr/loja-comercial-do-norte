'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Clock, ExternalLink, MapPin, Navigation, Phone, Search, Star } from 'lucide-react';
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

  const filteredLocations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        (loc.subtitle && loc.subtitle.toLowerCase().includes(q)),
    );
  }, [locations, query]);

  const activeLocation = useMemo(() => {
    if (selectedId) {
      const match = locations.find((loc) => loc.id === selectedId);
      if (match) return match;
    }
    return filteredLocations[0] || locations[0];
  }, [locations, selectedId, filteredLocations]);

  const currentMapEmbedUrl = useMemo(() => {
    if (activeLocation?.mapEmbedUrl) {
      return activeLocation.mapEmbedUrl;
    }
    if (activeLocation?.mapQueryUrl) {
      try {
        const parsed = new URL(activeLocation.mapQueryUrl);
        const q = parsed.searchParams.get('query');
        if (q) {
          return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
        }
      } catch {
        // fallback to query
      }
    }
    if (activeLocation?.name || activeLocation?.address) {
      const q = `${activeLocation.name}, ${activeLocation.address}`;
      return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    }
    return mapEmbedUrl;
  }, [activeLocation, mapEmbedUrl]);

  const mapExternalUrl = useMemo(() => {
    if (activeLocation?.mapQueryUrl) {
      return activeLocation.mapQueryUrl;
    }
    const q = activeLocation
      ? `${activeLocation.name} ${activeLocation.address}`
      : 'Comercial do Norte Belem PA';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }, [activeLocation]);

  const handleNearMe = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          let closest = locations[0];
          let minDistance = Infinity;

          for (const loc of locations) {
            if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
              const d = Math.hypot(loc.lat - latitude, loc.lng - longitude);
              if (d < minDistance) {
                minDistance = d;
                closest = loc;
              }
            }
          }

          if (closest) {
            setSelectedId(closest.id);
            setQuery('');
          }
        },
        () => {
          window.open('https://www.google.com/maps/search/Comercial+do+Norte+Belem+PA', '_blank');
        },
        { enableHighAccuracy: true, timeout: 5000 },
      );
    } else {
      window.open('https://www.google.com/maps/search/Comercial+do+Norte+Belem+PA', '_blank');
    }
  };

  return (
    <section aria-label={title} className="w-full pt-4">
      <div className="rounded-t-[32px] bg-[#0B0C10] pb-12 pt-10 text-white sm:pt-12">
        <div className="cn-container">
          {/* Header Centralizado com Barra Vermelha Oficial */}
          <div className="mb-8 text-center">
            <p className="text-base font-medium text-zinc-400 sm:text-lg">
              {title}
            </p>
            <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {subtitle}
            </h2>
            <div className="mx-auto mt-2.5 h-1 w-28 rounded-full bg-[#E2091E]" />
          </div>

          {/* Grid: Coluna Esquerda (Busca + Cards) e Coluna Direita (Mapa) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
            {/* Coluna Esquerda: Busca + Cards de Unidades em Dark Mode Limpo */}
            <div className="flex flex-col gap-3 lg:col-span-5">
              {/* Barra de Busca no Topo da Coluna Esquerda */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  aria-label={searchPlaceholder}
                  className="h-11 w-full rounded-xl border border-white/15 bg-[#14161D] pl-10 pr-28 text-xs font-medium text-white placeholder:text-zinc-500 outline-none transition focus:border-white/40 focus:ring-1 focus:ring-white/20"
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  type="text"
                  value={query}
                />
                <button
                  className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-zinc-200 transition hover:bg-white/20 hover:text-white"
                  onClick={handleNearMe}
                  type="button"
                >
                  <Navigation className="size-3 text-zinc-400" />
                  <span>Perto de mim</span>
                </button>
              </div>

              {/* Lista de Unidades com Scrollbar Dark Minimalista */}
              <div className="custom-scrollbar flex max-h-[580px] flex-col gap-3 overflow-y-auto pr-2 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/35 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((loc) => {
                    const isSelected = activeLocation?.id === loc.id;
                    const isAberto = (loc.badge || '').toLowerCase().includes('aberto');

                    return (
                      <div
                        aria-pressed={isSelected}
                        className={`flex cursor-pointer gap-3.5 rounded-2xl border p-3.5 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                          isSelected
                            ? 'border-zinc-400/80 bg-[#171A24] text-white shadow-xl ring-1 ring-white/15'
                            : 'border-white/10 bg-[#12141B] text-zinc-300 hover:border-white/25 hover:bg-[#151822]'
                        }`}
                        key={loc.id}
                        onClick={() => setSelectedId(loc.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedId(loc.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {/* Miniatura da Fachada da Loja à Esquerda */}
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                          <Image
                            alt={loc.name}
                            className="size-full object-cover"
                            height={140}
                            src={loc.imageUrl || '/assets/HOME Vitrine/S0-FOOTER/loja-comercial-do-norte-jurunas.webp'}
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
                              {loc.ratingText && (
                                <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-zinc-300">
                                  <Star className="size-3 fill-zinc-400 text-zinc-400" />
                                  <span>{loc.ratingText}</span>
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 line-clamp-1 text-[11px] font-normal text-zinc-400">
                              {loc.subtitle || 'Loja de Embalagens e Descartáveis'}
                            </p>

                            <p className="mt-1 line-clamp-1 text-[11px] text-zinc-400">
                              <MapPin className="mr-1 inline size-3 text-zinc-400" />
                              {loc.address}
                            </p>
                          </div>

                          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <span className="inline-flex items-center gap-1 text-zinc-300">
                              <Clock className={`size-3 ${isAberto ? 'text-emerald-400' : 'text-rose-400'}`} />
                              <strong className={isAberto ? 'font-semibold text-emerald-400' : 'font-semibold text-rose-400'}>
                                {loc.badge || (isAberto ? 'Aberto' : 'Fechado')}
                              </strong>
                              <span className="text-zinc-400">· {loc.hoursWeekdays}</span>
                            </span>

                            {loc.phone && (
                              <a
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 transition-colors hover:text-white hover:underline"
                                href={loc.whatsappUrl || `https://wa.me/55${loc.phone.replace(/\D/g, '')}`}
                                onClick={(e) => e.stopPropagation()}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                <Phone className="size-3 text-zinc-400" />
                                <span>{loc.phone}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#12141B] p-8 text-center">
                    <Search className="mb-2 size-6 text-zinc-500" />
                    <p className="text-sm font-semibold text-zinc-200">Nenhuma unidade encontrada</p>
                    <p className="mt-1 text-xs text-zinc-400">Tente buscar por outro bairro ou endereço</p>
                    <button
                      className="mt-3 inline-flex items-center rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                      onClick={() => setQuery('')}
                      type="button"
                    >
                      Limpar busca
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna Direita: Mapa Google Embed Interativo */}
            <div className="relative min-h-[440px] lg:min-h-[635px] h-full overflow-hidden rounded-2xl border border-white/15 bg-[#12141B] shadow-2xl lg:col-span-7">
              {/* Botão de Atalho para Abrir a Rota Direta no Google Maps */}
              <a
                className="absolute right-3.5 top-3.5 z-10 inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-[#0B0C10]/90 px-3 py-1.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:border-white/40 hover:bg-[#14161D]"
                href={mapExternalUrl}
                rel="noopener noreferrer"
                target="_blank"
                title="Abrir rota no Google Maps"
              >
                <Navigation className="size-3.5 text-zinc-300" />
                <span>Como chegar</span>
                <ExternalLink className="size-3 text-zinc-400" />
              </a>

              {/* Iframe Interativo do Mapa que Atualiza ao Selecionar Unidade */}
              <iframe
                allowFullScreen
                className="size-full min-h-[440px] lg:min-h-[635px] border-0"
                key={activeLocation?.id || 'default-map'}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={currentMapEmbedUrl}
                title={`Mapa da unidade ${activeLocation?.name || 'Comercial do Norte'}`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
