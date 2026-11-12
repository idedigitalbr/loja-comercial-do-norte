'use client';

import { Check, Clock, Loader2, MapPin, Navigation, Store, Truck } from 'lucide-react';
import {
  isCommercialStoreOpen,
  type RankedCommercialStore,
  type ResolvedLocationAnchor,
} from '@/lib/stores-data';

export type FulfillmentMode = 'PICKUP' | 'DELIVERY';

type QuoteStoreSelectorProps = {
  rankedStores: RankedCommercialStore[];
  anchor: ResolvedLocationAnchor | null;
  selectedStoreId: string;
  onSelectStore: (storeId: string) => void;
  onOpenLocationModal?: () => void;
  onRequestGps: () => void;
  gpsLoading: boolean;
  gpsError: string | null;
  fulfillmentMode: FulfillmentMode;
  onFulfillmentModeChange: (mode: FulfillmentMode) => void;
  hideHeader?: boolean;
};

/**
 * Seletor de unidade ordenada por proximidade geográfica (km) com
 * detecção automática da loja mais próxima e modalidade de retirada/entrega.
 */
export function QuoteStoreSelector({
  rankedStores,
  anchor,
  selectedStoreId,
  onSelectStore,
  onOpenLocationModal,
  onRequestGps,
  gpsLoading,
  gpsError,
  fulfillmentMode,
  onFulfillmentModeChange,
  hideHeader = false,
}: QuoteStoreSelectorProps) {
  return (
    <div
      className={
        hideHeader
          ? 'space-y-4'
          : 'space-y-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5'
      }
    >
      {/* Cabeçalho da etapa */}
      {!hideHeader && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#004CB1]"
            >
              <Store className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-[#1D2433] sm:text-base">
                Qual loja você quer atendimento? <span className="text-[#E2091E]">*</span>
              </h2>
              <p className="text-xs text-slate-500">
                {anchor
                  ? 'Unidades ordenadas da mais próxima à mais distante para agilizar pronta-entrega e retirada.'
                  : 'Selecione a unidade responsável por atender sua cotação com preço de atacado e varejo.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Localização Atual / Atalho GPS e CEP */}
      {anchor ? (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-blue-200/80 bg-white px-3.5 py-2.5 shadow-2xs">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#004CB1]">
              <MapPin className="size-4" />
            </span>
            <div className="min-w-0">
              <span className="block truncate font-semibold text-slate-800">
                Perto de <strong className="text-[#004CB1]">{anchor.label}</strong>
              </span>
              <span className="block text-[11px] text-slate-500">
                {anchor.precision === 'gps'
                  ? 'Distância calculada via GPS do seu dispositivo'
                  : 'Ordenado por proximidade do seu bairro/CEP'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {anchor.precision !== 'gps' && (
              <button
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-2.5 py-1.5 text-[11px] font-bold text-[#004CB1] transition hover:bg-blue-100 cursor-pointer disabled:opacity-60"
                disabled={gpsLoading}
                onClick={onRequestGps}
                type="button"
              >
                {gpsLoading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Navigation className="size-3" />
                )}
                <span>{gpsLoading ? 'Localizando…' : 'Precisão GPS'}</span>
              </button>
            )}
            {onOpenLocationModal && (
              <button
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                onClick={onOpenLocationModal}
                type="button"
              >
                Alterar local
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50/90 to-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#004CB1] text-white">
              <Navigation className="size-3.5" />
            </span>
            <div className="text-xs">
              <strong className="block font-bold text-slate-900">
                Veja as lojas em ordem de distância (km)
              </strong>
              <span className="text-slate-600">
                Ative sua localização ou informe seu CEP para selecionarmos automaticamente a loja mais perto.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#004CB1] px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#003882] cursor-pointer disabled:opacity-60"
              disabled={gpsLoading}
              onClick={onRequestGps}
              type="button"
            >
              {gpsLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Navigation className="size-3.5" />
              )}
              <span>{gpsLoading ? 'Localizando…' : 'Usar minha localização'}</span>
            </button>
            {onOpenLocationModal && (
              <button
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                onClick={onOpenLocationModal}
                type="button"
              >
                Informar CEP
              </button>
            )}
          </div>
        </div>
      )}

      {gpsError && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800" role="status">
          {gpsError}
        </p>
      )}

      {/* Modalidade de Atendimento */}
      <div>
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Como prefere receber ou retirar?
        </span>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-1">
          <button
            aria-pressed={fulfillmentMode === 'PICKUP'}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition cursor-pointer ${
              fulfillmentMode === 'PICKUP'
                ? 'bg-[#004CB1] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            onClick={() => onFulfillmentModeChange('PICKUP')}
            type="button"
          >
            <Store className="size-3.5 shrink-0" />
            <span>Retirar na loja</span>
          </button>
          <button
            aria-pressed={fulfillmentMode === 'DELIVERY'}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition cursor-pointer ${
              fulfillmentMode === 'DELIVERY'
                ? 'bg-[#004CB1] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            onClick={() => onFulfillmentModeChange('DELIVERY')}
            type="button"
          >
            <Truck className="size-3.5 shrink-0" />
            <span>Entrega / Delivery</span>
          </button>
        </div>
      </div>

      {/* Lista de Lojas Ordenadas do Mais Próximo ao Mais Longe */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Loja mais próxima">
        {rankedStores.map((st) => {
          const isSelected = selectedStoreId === st.id;
          const isOpenNow = isCommercialStoreOpen(st);
          const weekdayHours = st.hours.split('|')[0]?.trim() || st.hours;

          return (
            <label
              key={st.id}
              data-testid={`store-option-${st.id}`}
              className={`group relative flex cursor-pointer flex-col justify-between gap-2 rounded-xl border p-3.5 transition-all duration-150 ${
                isSelected
                  ? 'border-[#004CB1] bg-gradient-to-br from-blue-50/90 via-white to-white ring-2 ring-[#004CB1]/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 hover:shadow-2xs'
              }`}
            >
              <input
                checked={isSelected}
                className="sr-only"
                name="preferredStoreId"
                onChange={() => onSelectStore(st.id)}
                type="radio"
                value={st.id}
              />

              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2.5">
                    {/* Radio visual */}
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border transition ${
                        isSelected
                          ? 'border-[#004CB1] bg-[#004CB1] text-white'
                          : 'border-slate-300 bg-white group-hover:border-slate-400'
                      }`}
                    >
                      {isSelected && <Check className="size-2.5 stroke-[3]" />}
                    </span>
                    <div className="min-w-0">
                      <strong className="block text-xs font-extrabold leading-snug text-slate-900 sm:text-[13px]">
                        {st.shortTitle}
                      </strong>
                    </div>
                  </div>

                  {/* Distância em km + Selo Mais Próxima */}
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {st.formattedKm && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums ${
                          st.isClosest
                            ? 'bg-[#004CB1] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Navigation className="size-2.5" />
                        <span>{st.formattedKm}</span>
                      </span>
                    )}
                    {st.isClosest && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200/80">
                        Mais próxima
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-1.5 pl-7 text-[11px] leading-snug text-slate-500">
                  {st.address}
                </p>
              </div>

              <div className="mt-1 flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-100 pt-2 pl-7 text-[10.5px]">
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Clock className={`size-3 ${isOpenNow ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className={isOpenNow ? 'font-bold text-emerald-700' : 'font-medium text-slate-500'}>
                    {isOpenNow ? 'Aberto agora' : 'Fechado agora'}
                  </span>
                  <span className="hidden sm:inline text-slate-400">· {weekdayHours.replace(/^Seg a Sex:\s*/i, '')}</span>
                </span>

                {st.isHeadquarter && (
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-[#004CB1]">
                    Matriz
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
