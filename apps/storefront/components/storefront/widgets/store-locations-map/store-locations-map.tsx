'use client';

import React, { useState } from 'react';
import { Clock, ExternalLink, MapPin, MessageCircle, Navigation, Phone, Search } from 'lucide-react';
import type { StoreLocationsMapProps } from '@/lib/storefront/widget-types';

export function StoreLocationsMapWidget({
  title = 'Encontre nossas unidades',
  subtitle = 'Lojas mais perto de você',
  searchPlaceholder = 'Digite seu endereço ou CEP',
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
          {/* Header + Barra de Busca */}
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {title}
              </h2>
              <p className="mt-0.5 text-lg font-medium text-slate-300 sm:text-xl">
                {subtitle}
              </p>
            </div>

            <div className="flex w-full max-w-xl items-center gap-2">
              <div className="relative flex-1">
                <input
                  className="h-11 w-full rounded-xl border border-white/15 bg-white px-4 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#004CB1]"
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  type="text"
                  value={query}
                />
                <Search className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>

              <a
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#004CB1] px-4 text-xs font-bold text-white shadow-md transition hover:bg-[#003882]"
                href="https://www.google.com/maps/search/Comercial+do+Norte+Belem+PA"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Navigation className="size-3.5" />
                <span>Usar minha localização</span>
              </a>
            </div>
          </div>

          {/* Grid: Lista de Lojas (Esquerda) + Mapa Interativo (Direita) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Coluna Esquerda: 3 Cards de Unidades */}
            <div className="flex flex-col gap-3.5 lg:col-span-5">
              {(filteredLocations.length > 0 ? filteredLocations : locations).map((loc) => {
                const isSelected = selectedId === loc.id || (!selectedId && loc.isFeatured);
                return (
                  <div
                    className={`cursor-pointer rounded-2xl border p-4 transition sm:p-5 ${
                      isSelected
                        ? 'border-[#004CB1] bg-[#00357B] text-white shadow-xl'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-blue-300'
                    }`}
                    key={loc.id}
                    onClick={() => setSelectedId(loc.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex size-6 items-center justify-center rounded-full ${
                            isSelected ? 'bg-[#E2091E] text-white' : 'bg-blue-50 text-[#004CB1]'
                          }`}
                        >
                          <MapPin className="size-3.5" />
                        </span>
                        <h3 className="text-base font-extrabold tracking-tight">
                          {loc.name}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {loc.badge}
                      </span>
                    </div>

                    <p
                      className={`mt-2 text-xs leading-relaxed ${
                        isSelected ? 'text-blue-100' : 'text-slate-600'
                      }`}
                    >
                      {loc.address}
                    </p>

                    <div
                      className={`mt-3 grid grid-cols-1 gap-1.5 text-[11px] sm:grid-cols-2 ${
                        isSelected ? 'text-blue-100' : 'text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 shrink-0 opacity-75" />
                        <span>
                          {loc.hoursWeekdays} · {loc.hoursSaturday}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="size-3.5 shrink-0 opacity-75" />
                        <span className="font-bold">{loc.phone}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                          isSelected
                            ? 'bg-white text-[#00357B] hover:bg-blue-50'
                            : 'bg-[#004CB1] text-white hover:bg-[#003882]'
                        }`}
                        href={loc.whatsappUrl}
                        onClick={(e) => e.stopPropagation()}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <MessageCircle className="size-3.5 fill-emerald-500 text-emerald-500" />
                        <span>Chamar no WhatsApp</span>
                      </a>

                      <a
                        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                          isSelected
                            ? 'border-white/25 bg-white/10 text-white hover:bg-white/20'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                        href={loc.mapQueryUrl}
                        onClick={(e) => e.stopPropagation()}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Como chegar</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coluna Direita: Mapa Google Embed */}
            <div className="relative min-h-[380px] overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl lg:col-span-7">
              <iframe
                allowFullScreen
                className="size-full min-h-[420px] border-0"
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
