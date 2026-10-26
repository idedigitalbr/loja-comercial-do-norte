'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Compass,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import {
  BRAZIL_STATES,
  formatCep,
  cleanCep,
  lookupLocationByAddress,
  lookupLocationByCep,
  QUICK_LOCATIONS,
  type UserLocation,
} from '@/lib/location';
import { useUserLocation } from './location-provider';

export function PostalCodeModal() {
  const { location, setLocation, isModalOpen, closeModal } = useUserLocation();

  // Modo: 'cep' ou 'address'
  const [mode, setMode] = useState<'cep' | 'address'>('cep');

  // Estado do Modo CEP
  const [cepInput, setCepInput] = useState('');
  const [resolvedLocation, setResolvedLocation] = useState<UserLocation | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  // Estado do Modo Endereço (Não sei meu CEP)
  const [stateUf, setStateUf] = useState('PA');
  const [cityInput, setCityInput] = useState('Belém');
  const [streetInput, setStreetInput] = useState('');
  const [addressResults, setAddressResults] = useState<UserLocation[]>([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Feedback de sucesso
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Ref para focar no input
  const inputRef = useRef<HTMLInputElement>(null);

  // Inicializa o input com o CEP atual quando o modal abre
  useEffect(() => {
    if (isModalOpen) {
      setCepInput(location?.cep ? formatCep(location.cep) : '');
      setResolvedLocation(location || null);
      setCepError(null);
      setAddressError(null);
      setSuccessMessage(null);
      setMode('cep');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isModalOpen, location]);

  // Fecha no ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  // Handler de digitação do CEP (com busca automática aos 8 dígitos)
  async function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const formatted = formatCep(raw);
    setCepInput(formatted);
    setCepError(null);
    setSuccessMessage(null);

    const digits = cleanCep(raw);
    if (digits.length === 8) {
      await performCepLookup(digits);
    } else {
      setResolvedLocation(null);
    }
  }

  // Executa busca por CEP
  async function performCepLookup(digits: string) {
    setLoadingCep(true);
    setCepError(null);
    try {
      const result = await lookupLocationByCep(digits);
      setResolvedLocation(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'CEP não encontrado.';
      setCepError(msg);
      setResolvedLocation(null);
    } finally {
      setLoadingCep(false);
    }
  }

  // Submissão do formulário de CEP
  async function handleCepSubmit(e: React.FormEvent) {
    e.preventDefault();
    const digits = cleanCep(cepInput);
    if (digits.length !== 8) {
      setCepError('Digite os 8 números do seu CEP.');
      return;
    }

    if (resolvedLocation && cleanCep(resolvedLocation.cep) === digits) {
      confirmLocation(resolvedLocation);
      return;
    }

    setLoadingCep(true);
    setCepError(null);
    try {
      const result = await lookupLocationByCep(digits);
      confirmLocation(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'CEP não encontrado.';
      setCepError(msg);
    } finally {
      setLoadingCep(false);
    }
  }

  // Submissão da busca por endereço
  async function handleAddressSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!streetInput.trim() || streetInput.trim().length < 3) {
      setAddressError('Digite pelo menos 3 letras da rua ou avenida.');
      return;
    }
    if (!cityInput.trim() || cityInput.trim().length < 3) {
      setAddressError('Digite pelo menos 3 letras da cidade.');
      return;
    }

    setLoadingAddress(true);
    setAddressError(null);
    setAddressResults([]);

    try {
      const results = await lookupLocationByAddress({
        uf: stateUf,
        city: cityInput,
        street: streetInput,
      });
      if (results.length === 0) {
        setAddressError('Nenhum endereço encontrado para estes dados. Tente variar o termo da rua.');
      } else {
        setAddressResults(results);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao buscar endereço.';
      setAddressError(msg);
    } finally {
      setLoadingAddress(false);
    }
  }

  // Confirmação final da localização
  function confirmLocation(loc: UserLocation) {
    setLocation(loc);
    setSuccessMessage(`Região definida: ${loc.shortLabel}`);
    setTimeout(() => {
      closeModal();
    }, 600);
  }

  // Geolocation do navegador
  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setCepError('Geolocalização não suportada neste navegador.');
      return;
    }

    setLoadingCep(true);
    setCepError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Consulta reverse geocoding via OpenStreetMap Nominatim
          const { latitude, longitude } = pos.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
          const res = await fetch(url, {
            headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
          });

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const postcode = addr.postcode ? cleanCep(addr.postcode) : '';
            const city = addr.city || addr.town || addr.municipality || 'Belém';
            const state = addr['ISO3166-2-lvl4']?.replace('BR-', '') || addr.state || 'PA';
            const street = addr.road || '';
            const neighborhood = addr.suburb || addr.neighbourhood || '';

            if (postcode && postcode.length === 8) {
              const fullLoc = await lookupLocationByCep(postcode);
              confirmLocation(fullLoc);
              return;
            }

            const customLoc: UserLocation = {
              cep: postcode ? formatCep(postcode) : '66020-600',
              city,
              state: state.toUpperCase(),
              street,
              neighborhood,
              formatted: `${city} - ${state.toUpperCase()}`,
              shortLabel: `Região de ${city}/${state.toUpperCase()}`,
            };
            confirmLocation(customLoc);
          } else {
            // Fallback Belém
            confirmLocation(QUICK_LOCATIONS[0]);
          }
        } catch {
          confirmLocation(QUICK_LOCATIONS[0]);
        } finally {
          setLoadingCep(false);
        }
      },
      () => {
        setLoadingCep(false);
        setCepError('Permissão de localização não concedida. Por favor, digite seu CEP.');
      },
      { timeout: 7000 }
    );
  }

  return (
    <div
      aria-labelledby="location-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeModal}
      />

      {/* Card do Modal (Estilo Magalu / Comercial do Norte) */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
        {/* Topo com botão fechar */}
        <div className="flex items-start justify-between p-5 pb-3 sm:p-6 sm:pb-4 border-b border-slate-100">
          <div>
            <h2
              className="text-lg sm:text-xl font-bold tracking-tight text-slate-900"
              id="location-dialog-title"
            >
              Onde vamos entregar?
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Assim, mostramos as melhores ofertas e prazos para a sua região
            </p>
          </div>

          <button
            aria-label="Fechar janela"
            className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer shrink-0 ml-2"
            onClick={closeModal}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Abas / Alternador de Modo */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 text-xs font-semibold">
          <button
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              mode === 'cep'
                ? 'border-[#004CB1] text-[#004CB1] font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => {
              setMode('cep');
              setCepError(null);
            }}
            type="button"
          >
            <MapPin className="size-3.5" />
            <span>Buscar por CEP</span>
          </button>

          <button
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              mode === 'address'
                ? 'border-[#004CB1] text-[#004CB1] font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => {
              setMode('address');
              setAddressError(null);
            }}
            type="button"
          >
            <Search className="size-3.5" />
            <span>Não sei meu CEP (Buscar por endereço)</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {/* SUCESSO TEMPORÁRIO */}
          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 animate-in fade-in duration-150">
              <Check className="size-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* MODO 1: BUSCA POR CEP */}
          {mode === 'cep' && (
            <form className="space-y-4" onSubmit={handleCepSubmit}>
              <div>
                <label
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5"
                  htmlFor="cep-field-input"
                >
                  Enviar para
                </label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400">
                    <MapPin className="size-5" />
                  </div>
                  <input
                    autoComplete="postal-code"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-10 pl-11 text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#004CB1] focus:outline-none focus:ring-2 focus:ring-[#004CB1]/20 transition shadow-inner"
                    id="cep-field-input"
                    inputMode="numeric"
                    maxLength={9}
                    onChange={handleCepChange}
                    placeholder="Digite seu CEP (ex: 66020-600)"
                    ref={inputRef}
                    type="text"
                    value={cepInput}
                  />
                  {loadingCep && (
                    <div className="absolute right-3">
                      <Loader2 className="size-5 animate-spin text-[#004CB1]" />
                    </div>
                  )}
                </div>

                {/* Link "Não sei o meu CEP" no estilo Magalu */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <button
                    className="font-medium text-[#004CB1] hover:underline cursor-pointer hover:text-[#00357B] transition"
                    onClick={() => setMode('address')}
                    type="button"
                  >
                    Não sei o meu CEP
                  </button>

                  <button
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    onClick={handleUseCurrentLocation}
                    type="button"
                  >
                    <Navigation className="size-3 text-[#004CB1]" />
                    <span>Usar localização atual</span>
                  </button>
                </div>
              </div>

              {/* Erro */}
              {cepError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <p className="font-semibold">{cepError}</p>
                  <p className="mt-1 text-[11px] text-rose-600">
                    Você também pode clicar na aba acima para pesquisar pelo nome da rua e cidade.
                  </p>
                </div>
              )}

              {/* Card de endereço resolvido com sucesso */}
              {resolvedLocation && !cepError && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs text-slate-800">
                  <div className="flex items-start gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#004CB1] text-white">
                      <Check className="size-4 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm">
                        {resolvedLocation.city} - {resolvedLocation.state}
                      </p>
                      {resolvedLocation.neighborhood && (
                        <p className="text-slate-600">
                          Bairro: <span className="font-medium text-slate-900">{resolvedLocation.neighborhood}</span>
                        </p>
                      )}
                      {resolvedLocation.street && (
                        <p className="truncate text-slate-600">
                          Logradouro: <span className="font-medium text-slate-900">{resolvedLocation.street}</span>
                        </p>
                      )}
                      <p className="mt-1 text-[11px] font-semibold text-[#004CB1]">
                        CEP {formatCep(resolvedLocation.cep)} · Entrega disponível
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão de confirmação estilo Magalu (Azul vibrante) */}
              <div className="pt-2">
                <button
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#004CB1] py-3 px-4 font-bold text-sm text-white shadow-md transition hover:bg-[#00357B] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={loadingCep || cleanCep(cepInput).length !== 8}
                  type="submit"
                >
                  {loadingCep ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Consultando dados oficiais...</span>
                    </>
                  ) : (
                    <span>Confirmar</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* MODO 2: BUSCA POR ENDEREÇO (NÃO SEI MEU CEP) */}
          {mode === 'address' && (
            <form className="space-y-3.5" onSubmit={handleAddressSearch}>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label
                    className="block text-xs font-bold text-slate-700 uppercase mb-1"
                    htmlFor="addr-uf"
                  >
                    Estado (UF)
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#004CB1] focus:outline-none focus:ring-2 focus:ring-[#004CB1]/20"
                    id="addr-uf"
                    onChange={(e) => setStateUf(e.target.value)}
                    value={stateUf}
                  >
                    {BRAZIL_STATES.map((s) => (
                      <option key={s.uf} value={s.uf}>
                        {s.uf} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label
                    className="block text-xs font-bold text-slate-700 uppercase mb-1"
                    htmlFor="addr-city"
                  >
                    Cidade
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#004CB1] focus:outline-none focus:ring-2 focus:ring-[#004CB1]/20"
                    id="addr-city"
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Ex: Belém"
                    required
                    type="text"
                    value={cityInput}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-slate-700 uppercase mb-1"
                  htmlFor="addr-street"
                >
                  Rua / Avenida / Travessa
                </label>
                <div className="relative flex items-center">
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-10 pl-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#004CB1] focus:outline-none focus:ring-2 focus:ring-[#004CB1]/20"
                    id="addr-street"
                    onChange={(e) => setStreetInput(e.target.value)}
                    placeholder="Ex: Bernardo Sayão, Nazaré, José Malcher..."
                    required
                    type="text"
                    value={streetInput}
                  />
                  {loadingAddress && (
                    <div className="absolute right-3">
                      <Loader2 className="size-4 animate-spin text-[#004CB1]" />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Digite ao menos 3 letras do nome do logradouro.
                </p>
              </div>

              {addressError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                  {addressError}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#004CB1] py-2.5 px-4 font-bold text-xs sm:text-sm text-white shadow-sm transition hover:bg-[#00357B] disabled:opacity-50 cursor-pointer"
                  disabled={loadingAddress || streetInput.trim().length < 3}
                  type="submit"
                >
                  {loadingAddress ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="size-3.5" />
                      <span>Buscar Endereços</span>
                    </>
                  )}
                </button>

                <button
                  className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setMode('cep')}
                  type="button"
                >
                  Voltar
                </button>
              </div>

              {/* LISTA DE RESULTADOS DE ENDEREÇO */}
              {addressResults.length > 0 && (
                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Selecione seu endereço ({addressResults.length} encontrados):
                  </span>
                  {addressResults.map((item, idx) => (
                    <button
                      className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#004CB1] hover:bg-blue-50/50 cursor-pointer group"
                      key={`${item.cep}-${idx}`}
                      onClick={() => confirmLocation(item)}
                      type="button"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-[#004CB1] truncate">
                          {item.street || 'Logradouro'}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {item.neighborhood ? `${item.neighborhood} · ` : ''}
                          {item.city} - {item.state}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-800 group-hover:bg-[#004CB1] group-hover:text-white transition">
                          CEP {item.cep}
                        </span>
                        <ChevronRight className="size-3.5 text-slate-400 group-hover:text-[#004CB1] inline-block ml-1" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          )}

          {/* ATALHOS RÁPIDOS DA REGIÃO METROPOLITANA DE BELÉM */}
          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Compass className="size-3.5 text-[#004CB1]" />
              <span>Regiões Frequentes (Comercial do Norte)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {QUICK_LOCATIONS.map((loc) => (
                <button
                  className="flex flex-col items-start rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-left transition hover:border-[#004CB1] hover:bg-white cursor-pointer group"
                  key={loc.cep}
                  onClick={() => confirmLocation(loc)}
                  type="button"
                >
                  <span className="font-semibold text-slate-800 text-[11px] group-hover:text-[#004CB1]">
                    {loc.shortLabel}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    CEP {loc.cep}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé com selo institucional de garantia */}
        <div className="bg-slate-50 px-5 py-3 sm:px-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3 text-amber-500" />
            <span>Entrega expressa e cotações personalizadas em Belém e Região</span>
          </div>
        </div>
      </div>
    </div>
  );
}
