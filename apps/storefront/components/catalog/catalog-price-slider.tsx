"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type CatalogPriceSliderProps = {
  min?: number;
  max?: number;
  initialMin?: number;
  initialMax?: number;
  baseUrl?: string;
};

const DEFAULT_MIN = 0.36;
const DEFAULT_MAX = 116111.46;

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function CatalogPriceSlider({
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  initialMin,
  initialMax,
  baseUrl = "/loja",
}: CatalogPriceSliderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [minValue, setMinValue] = useState<number>(initialMin ?? min);
  const [maxValue, setMaxValue] = useState<number>(initialMax ?? max);

  useEffect(() => {
    if (initialMin !== undefined) setMinValue(initialMin);
    if (initialMax !== undefined) setMaxValue(initialMax);
  }, [initialMin, initialMax]);

  const minPercent = Math.min(100, Math.max(0, ((minValue - min) / (max - min)) * 100));
  const maxPercent = Math.min(100, Math.max(0, ((maxValue - min) / (max - min)) * 100));

  function applyPrice(newMin: number, newMax: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newMin > min) {
      params.set("precoMin", newMin.toFixed(2));
    } else {
      params.delete("precoMin");
    }
    if (newMax < max) {
      params.set("precoMax", newMax.toFixed(2));
    } else {
      params.delete("precoMax");
    }
    params.delete("pagina");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${baseUrl}?${query}` : baseUrl, { scroll: false });
    });
  }

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.min(Number(e.target.value), maxValue - 1);
    setMinValue(val);
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.max(Number(e.target.value), minValue + 1);
    setMaxValue(val);
  }

  function handleCommit() {
    applyPrice(minValue, maxValue);
  }

  return (
    <div className="w-full space-y-3">
      {/* Slider Track and Handles */}
      <div className="relative flex h-6 w-full items-center">
        {/* Background track */}
        <div className="h-1.5 w-full rounded-full bg-slate-200" />

        {/* Active colored track */}
        <div
          className="absolute h-1.5 rounded-full bg-[#004CB1]"
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(0, maxPercent - minPercent)}%`,
          }}
        />

        {/* Input Min Thumb */}
        <input
          aria-label="Preço mínimo"
          className="pointer-events-none absolute inset-0 z-20 h-6 w-full appearance-none bg-transparent opacity-0 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5"
          max={max}
          min={min}
          onChange={handleMinChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          step="0.5"
          type="range"
          value={minValue}
        />

        {/* Input Max Thumb */}
        <input
          aria-label="Preço máximo"
          className="pointer-events-none absolute inset-0 z-20 h-6 w-full appearance-none bg-transparent opacity-0 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5"
          max={max}
          min={min}
          onChange={handleMaxChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          step="0.5"
          type="range"
          value={maxValue}
        />

        {/* Visual Knobs com tracinho azul vertical exatamente como no print */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-10 flex size-4.5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#004CB1] bg-white shadow-sm"
          style={{ left: `${minPercent}%` }}
        >
          <div className="h-2 w-0.5 rounded-full bg-[#004CB1]" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-10 flex size-4.5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#004CB1] bg-white shadow-sm"
          style={{ left: `${maxPercent}%` }}
        >
          <div className="h-2 w-0.5 rounded-full bg-[#004CB1]" />
        </div>
      </div>

      {/* Caixas de Valor Mínimo e Máximo abaixo do slider */}
      <div className="grid grid-cols-2 gap-2 text-left">
        <div>
          <span className="block text-[11px] font-medium text-slate-500">
            Valor mínimo
          </span>
          <div className="mt-1 flex items-center rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 shadow-2xs">
            <span className="text-xs font-bold text-slate-800">
              R$ {formatBRL(minValue)}
            </span>
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-medium text-slate-500">
            Valor máximo
          </span>
          <div className="mt-1 flex items-center rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 shadow-2xs">
            <span className="text-xs font-bold text-slate-800">
              R$ {formatBRL(maxValue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
