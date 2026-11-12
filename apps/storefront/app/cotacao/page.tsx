'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  LogIn,
  MapPin,
  Minus,
  Navigation,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Truck,
  UserCheck,
  UserPlus,
  UserRound,
} from 'lucide-react';
import {
  WebAlert,
  WebButton,
  WebField,
  WebInput,
  WebTextarea,
} from '@commerce/ui/web';
import { useQuoteCart } from '@/components/quote-cart-provider';
import { useAuth } from '@/components/auth-provider';
import { useOptionalUserLocation } from '@/components/location-provider';
import { QuoteFlowStepper } from '@/components/quote-flow-stepper';
import {
  QuoteStoreSelector,
  type FulfillmentMode,
} from '@/components/quote-store-selector';
import { API_URL } from '@/lib/api';
import { formatMoneyOrQuote } from '@/lib/format';
import {
  DEFAULT_LOCATION,
  getStoredLocation,
  reverseGeocodeCoordinates,
  saveStoredLocation,
  type UserLocation,
} from '@/lib/location';
import { resolveProductImage } from '@/lib/product-placeholders';
import {
  DEFAULT_STORE,
  formatBrazilPhoneMask,
  formatCpfCnpjMask,
  rankStoresByLocation,
} from '@/lib/stores-data';

type FieldErrors = Record<string, string[]>;
type WizardStep = 'account' | 'contact' | 'store' | 'extras';
type StepDirection = 'forward' | 'backward';

const QUICK_NOTE_SUGGESTIONS = [
  'Preciso de nota fiscal (NF-e)',
  'Cotar preço para caixa fechada / fardo',
  'Compra recorrente para meu negócio',
];

const API_ERROR_LABELS: Record<string, string> = {
  INVALID_QUOTE_NAME: 'Informe seu nome completo (mínimo de 3 caracteres).',
  INVALID_QUOTE_PHONE: 'Informe um número de WhatsApp válido com DDD.',
  INVALID_QUOTE_EMAIL: 'O e-mail informado parece inválido. Verifique e tente novamente.',
  QUOTE_EMPTY: 'Sua lista de cotação está vazia.',
  QUOTE_ITEM_UNAVAILABLE: 'Um ou mais itens da sua lista não estão mais disponíveis no momento.',
};

function resolveApiErrorMessage(message?: string): string {
  if (!message) return 'Não foi possível enviar a cotação. Tente novamente.';
  return API_ERROR_LABELS[message] ?? message;
}

export default function QuoteFormPage() {
  const { items, subtotalCents, count, updateQuantity, remove, clear, ready } = useQuoteCart();
  const router = useRouter();
  const auth = useAuth();
  const user = auth.user;
  const isAuthenticated = auth.isAuthenticated;
  const authReady = auth.ready ?? true;
  const locationCtx = useOptionalUserLocation();

  const [wizardStep, setWizardStep] = useState<WizardStep>(() =>
    isAuthenticated ? 'contact' : 'account',
  );
  const [stepDirection, setStepDirection] = useState<StepDirection>('forward');
  const [wantsExtraInfo, setWantsExtraInfo] = useState<boolean | null>(null);

  const [fallbackLocation, setFallbackLocation] = useState<UserLocation | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [hasPrefilledAuth, setHasPrefilledAuth] = useState(false);

  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>('PICKUP');
  const [hasManualStoreSelection, setHasManualStoreSelection] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState(DEFAULT_STORE.id);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [idempotencyKey] = useState(() => `quote-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // Pula automaticamente a etapa 0 se o usuário estiver autenticado
  useEffect(() => {
    if (authReady && isAuthenticated && wizardStep === 'account') {
      setStepDirection('forward');
      setWizardStep('contact');
    }
  }, [authReady, isAuthenticated, wizardStep]);

  // Carrega localização salva caso o componente esteja fora do LocationProvider
  useEffect(() => {
    if (locationCtx) return;
    const stored = getStoredLocation();
    if (stored) {
      setFallbackLocation(stored);
    }
  }, [locationCtx]);

  // Pré-preenche dados do cliente autenticado sem sobrescrever edições manuais
  useEffect(() => {
    if (!user || hasPrefilledAuth) return;
    if (user.fullName && !customerName) {
      setCustomerName(user.fullName);
    }
    if (user.phone && !customerPhone) {
      setCustomerPhone(formatBrazilPhoneMask(user.phone));
    }
    if (user.email && !customerEmail) {
      setCustomerEmail(user.email);
    }
    if (user.document && user.document !== '000.000.000-00' && !documentNumber) {
      setDocumentNumber(formatCpfCnpjMask(user.document));
    }
    setHasPrefilledAuth(true);
  }, [user, hasPrefilledAuth, customerName, customerPhone, customerEmail, documentNumber]);

  const effectiveLocation = locationCtx?.location ?? fallbackLocation ?? DEFAULT_LOCATION;

  const { stores: rankedStores, anchor } = useMemo(
    () => rankStoresByLocation(effectiveLocation),
    [effectiveLocation],
  );

  // Seleciona automaticamente a loja mais próxima quando há localização definida
  useEffect(() => {
    if (anchor && !hasManualStoreSelection && rankedStores.length > 0) {
      setSelectedStoreId(rankedStores[0].id);
    }
  }, [anchor, hasManualStoreSelection, rankedStores]);

  const selectedStore = useMemo(
    () => rankedStores.find((s) => s.id === selectedStoreId) ?? rankedStores[0] ?? DEFAULT_STORE,
    [rankedStores, selectedStoreId],
  );

  function handleSelectStore(storeId: string) {
    setHasManualStoreSelection(true);
    setSelectedStoreId(storeId);
  }

  function handleOpenLocationModal() {
    if (!locationCtx?.openModal) return;
    setHasManualStoreSelection(false);
    locationCtx.openModal();
  }

  function handleRequestGps() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocalização não disponível neste navegador. Informe seu CEP.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const geocoded = await reverseGeocodeCoordinates(latitude, longitude);
          const nextLocation: UserLocation = geocoded ?? {
            cep: '',
            street: '',
            neighborhood: '',
            city: 'Belém',
            state: 'PA',
            formatted: 'Localização atual via GPS',
            shortLabel: 'Minha localização (GPS)',
            lat: latitude,
            lng: longitude,
            source: 'gps',
          };

          setHasManualStoreSelection(false);
          if (locationCtx) {
            locationCtx.setLocation(nextLocation);
          } else {
            saveStoredLocation(nextLocation);
            setFallbackLocation(nextLocation);
          }
        } catch {
          setGpsError('Não conseguimos ler o endereço pelo GPS. Tente informar seu CEP.');
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Permissão de localização bloqueada no navegador. Use o botão "Informar CEP".');
        } else {
          setGpsError('Não foi possível obter sua localização agora. Você pode informar seu CEP.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true },
    );
  }

  function handleAppendQuickNote(snippet: string) {
    setNotes((prev) => {
      const trimmed = prev.trim();
      if (trimmed.toLowerCase().includes(snippet.toLowerCase())) {
        return prev;
      }
      return trimmed ? `${trimmed}\n• ${snippet}` : `• ${snippet}`;
    });
  }

  function goToStep(next: WizardStep, direction: StepDirection) {
    setError(null);
    setStepDirection(direction);
    setWizardStep(next);
  }

  function validateContactFields(name: string, phone: string): FieldErrors {
    const errors: FieldErrors = {};
    if (name.trim().length < 3) {
      errors.customerName = ['Informe seu nome completo (mínimo 3 letras).'];
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      errors.customerPhone = ['Informe um WhatsApp válido com DDD (ex: (91) 90000-0000).'];
    }
    return errors;
  }

  function handleAdvanceFromContact() {
    const contactErrors = validateContactFields(customerName, customerPhone);
    if (Object.keys(contactErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...contactErrors }));
      setError('Informe seu nome e um WhatsApp válido para continuar.');
      return;
    }
    setFieldErrors((prev) => ({ ...prev, customerName: [], customerPhone: [] }));
    goToStep('store', 'forward');
  }

  async function submitQuote(formData?: FormData) {
    if (!items.length || submitting) return;

    const resolvedName = String(formData?.get('customerName') ?? customerName).trim();
    const resolvedPhone = String(formData?.get('customerPhone') ?? customerPhone).trim();
    const includeExtras = wantsExtraInfo !== false;
    const resolvedEmail = (
      includeExtras ? String(formData?.get('customerEmail') ?? customerEmail) : isAuthenticated ? customerEmail : ''
    ).trim();
    const resolvedCompany = (includeExtras ? String(formData?.get('companyName') ?? companyName) : '').trim();
    const resolvedDoc = (
      includeExtras ? String(formData?.get('document') ?? documentNumber) : isAuthenticated ? documentNumber : ''
    ).trim();
    const resolvedNotes = (includeExtras ? String(formData?.get('notes') ?? notes) : '').trim();

    const contactErrors = validateContactFields(resolvedName, resolvedPhone);
    if (Object.keys(contactErrors).length > 0) {
      setFieldErrors(contactErrors);
      setError('Confira os campos obrigatórios destacados antes de enviar.');
      goToStep('contact', 'backward');
      return;
    }

    const localErrors: FieldErrors = {};
    if (resolvedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(resolvedEmail)) {
      localErrors.customerEmail = ['Informe um endereço de e-mail válido.'];
    }

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setError('Confira os campos obrigatórios destacados antes de enviar.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const metadataTags = [
      `[Unidade/Loja mais próxima: ${selectedStore.name}]`,
      `[Modalidade: ${fulfillmentMode === 'PICKUP' ? 'Retirada na loja' : 'Entrega / Delivery'}]`,
      selectedStore.formattedKm && anchor
        ? `[Distância estimada: ${selectedStore.formattedKm} de ${anchor.label}]`
        : null,
    ].filter(Boolean);

    const finalNotes = [...metadataTags, resolvedNotes].filter(Boolean).join('\n').trim();

    try {
      const response = await fetch(`${API_URL}/api/v1/quotes`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customerName: resolvedName,
          customerPhone: resolvedPhone,
          customerEmail: resolvedEmail || undefined,
          companyName: resolvedCompany || undefined,
          document: resolvedDoc || undefined,
          notes: finalNotes || undefined,
          storeId: selectedStore.id,
          preferredStore: selectedStore.shortTitle,
          idempotencyKey,
          items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { publicId?: string; error?: { code?: string; message?: string; fieldErrors?: FieldErrors } }
        | null;

      if (!response.ok) {
        setFieldErrors(payload?.error?.fieldErrors ?? {});
        setError(resolveApiErrorMessage(payload?.error?.message));
        return;
      }
      if (!payload?.publicId) {
        setError('Resposta inesperada da API. Tente novamente.');
        return;
      }

      if (typeof window !== 'undefined') {
        try {
          const stored = window.localStorage.getItem('cn.user_quotes');
          const existing = stored ? JSON.parse(stored) : [];
          const newQuote = {
            publicId: payload.publicId,
            createdAt: new Date().toISOString(),
            status: 'ANALYSIS',
            statusLabel: 'Em Análise Comercial',
            storeId: selectedStore.id,
            storeName: selectedStore.shortTitle,
            itemsCount: items.length,
            subtotalCents,
            items: items.map((i) => ({
              variantId: i.variantId,
              name: i.name,
              productSlug: i.productSlug,
              quantity: i.quantity,
              unitPriceCents: i.unitPriceCents,
            })),
          };
          window.localStorage.setItem('cn.user_quotes', JSON.stringify([newQuote, ...existing]));
          window.localStorage.setItem('cn.last_quote_store', selectedStore.id);
        } catch {
          // Silencioso em caso de restrição de storage
        }
      }

      clear();
      router.push(`/cotacao/${payload.publicId}?storeId=${selectedStore.id}`);
    } catch {
      setError('Falha de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (wizardStep === 'account') return;
    if (wizardStep === 'contact') {
      handleAdvanceFromContact();
      return;
    }
    if (wizardStep === 'store') {
      goToStep('extras', 'forward');
      return;
    }
    if (wizardStep === 'extras' && wantsExtraInfo === null) {
      setError('Escolha "Sim" ou "Não" para finalizar sua cotação.');
      return;
    }
    await submitQuote(new FormData(event.currentTarget));
  }

  if (!ready || !authReady) {
    return (
      <div className="min-h-[60vh] bg-[#F4F7FB]">
        <div className="cn-container py-16 text-sm text-slate-500">Carregando sua lista…</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-[70vh] bg-[#F4F7FB]">
        <div className="cn-container py-16">
          <div className="mx-auto max-w-xl rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-[0_6px_28px_rgba(15,23,42,0.05)] sm:p-10">
            <div className="relative mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-blue-50">
              <ShoppingBag className="size-10 text-[#004CB1]" />
            </div>
            <h2 className="text-xl font-extrabold text-[#1D2433] sm:text-2xl">Sua cotação está vazia</h2>
            <p className="mt-2 text-sm text-slate-500">
              {isAuthenticated
                ? 'Adicione produtos do catálogo para montar sua lista de cotação.'
                : 'Entre na sua conta para consultar cotações anteriores ou explore nosso catálogo.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {!isAuthenticated && (
                <Link
                  className="inline-block rounded-xl bg-[#004CB1] px-6 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#003882]"
                  href="/login"
                >
                  Entrar
                </Link>
              )}
              <Link
                className="inline-block rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                href="/loja"
              >
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalLineTypes = items.length;
  const wizardSteps: { key: WizardStep; label: string }[] = isAuthenticated
    ? [
        { key: 'contact', label: '1. Contato' },
        { key: 'store', label: '2. Loja' },
        { key: 'extras', label: '3. Complemento' },
      ]
    : [
        { key: 'account', label: 'Conta' },
        { key: 'contact', label: '1. Contato' },
        { key: 'store', label: '2. Loja' },
        { key: 'extras', label: '3. Complemento' },
      ];
  const currentWizardIndex = Math.max(
    0,
    wizardSteps.findIndex((s) => s.key === wizardStep),
  );
  const progressPercent = Math.round(((currentWizardIndex + 1) / wizardSteps.length) * 100);

  return (
    <div className="min-h-[75vh] bg-[#F4F7FB] pb-14 pt-5 sm:pt-8">
      <div className="cn-container">
        {/* Navegação de retorno */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <Link
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 transition hover:text-[#004CB1]"
            href="/loja"
          >
            <ArrowLeft className="size-3.5" />
            <span>Continuar escolhendo produtos</span>
          </Link>
          <Link
            className="font-semibold text-[#004CB1] hover:underline"
            href="/compras"
          >
            Revisar sacola completa
          </Link>
        </div>

        {/* Cabeçalho Premium + Trilha de Etapas em Linha Única */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#004CB1]">
                <Sparkles className="size-3" />
                <span>Cotação Comercial · Sem pagamento online</span>
              </span>
              <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-[#1D2433] sm:text-[28px]">
                Enviar cotação
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Sem pagamento online. A equipe comercial responde pelo contato informado com preços de atacado e disponibilidade.
              </p>
            </div>

            <span className="hidden shrink-0 items-center gap-2 self-start rounded-full border border-blue-200/80 bg-blue-50/70 px-3.5 py-1.5 text-xs font-bold text-[#004CB1] whitespace-nowrap sm:inline-flex sm:self-center">
              <span className="size-2 rounded-full bg-[#004CB1]" />
              <span>Etapa 2 de 3 · Dados e loja</span>
            </span>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/75 px-4 py-3.5 sm:px-7 sm:py-4">
            <QuoteFlowStepper currentStep={2} itemsCount={count} />
          </div>
        </div>

        {/* Grid Principal: Formulário em Etapas (esquerda) + Resumo Sticky (direita) */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_1fr] lg:items-start">
          {/* Coluna Esquerda: Wizard Animado em Etapas */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_6px_28px_rgba(15,23,42,0.05)] sm:p-7">
            {/* Progresso interno do formulário em etapas */}
            <div className="mb-6 space-y-2.5 border-b border-slate-100 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {wizardSteps.map((stepItem, index) => {
                    const isDone = index < currentWizardIndex;
                    const isActive = index === currentWizardIndex;
                    return (
                      <button
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                          isDone
                            ? 'cursor-pointer bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : isActive
                              ? 'bg-[#004CB1] text-white shadow-2xs'
                              : 'cursor-default bg-slate-100 text-slate-400'
                        }`}
                        disabled={!isDone}
                        key={stepItem.key}
                        onClick={() => {
                          if (isDone) goToStep(stepItem.key, 'backward');
                        }}
                        type="button"
                      >
                        {isDone && <Check className="size-3 stroke-[2.75]" />}
                        <span>{stepItem.label}</span>
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                  {currentWizardIndex + 1} / {wizardSteps.length}
                </span>
              </div>

              <div
                aria-hidden="true"
                className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#004CB1] to-emerald-500 transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <form noValidate onSubmit={handleSubmit}>
              <div
                className={
                  stepDirection === 'backward'
                    ? 'animate-cn-step-backward'
                    : 'animate-cn-step-forward'
                }
                key={wizardStep}
              >
                {/* ETAPA 0: Conta Comercial do Norte (apenas quando não logado) */}
                {wizardStep === 'account' && !isAuthenticated && (
                  <section aria-labelledby="quote-account-heading" className="space-y-5">
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#004CB1]"
                      >
                        <UserCheck className="size-5" />
                      </span>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wide text-[#004CB1]">
                          Etapa 0 · Identificação
                        </span>
                        <h2
                          className="mt-0.5 text-lg font-extrabold text-[#1D2433] sm:text-xl"
                          id="quote-account-heading"
                        >
                          Você já tem conta na loja virtual da Comercial do Norte?
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                          Entre para preencher seus dados automaticamente ou siga sem cadastro em poucos segundos.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Opção SIM */}
                      <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-[#004CB1]/40 hover:bg-blue-50/20">
                        <div>
                          <span className="inline-flex items-center rounded-full bg-blue-100/80 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#004CB1]">
                            Sim
                          </span>
                          <h3 className="mt-2.5 text-base font-extrabold text-[#1D2433]">
                            Já tenho conta
                          </h3>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            Seus dados já vêm preenchidos e você acompanha o histórico de cotações no site.
                          </p>
                        </div>

                        <Link
                          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#004CB1] px-4 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#003882]"
                          href="/login?redirect=/cotacao"
                        >
                          <LogIn className="size-4" />
                          <span>Fazer login agora</span>
                        </Link>
                      </div>

                      {/* Opção NÃO */}
                      <div className="flex flex-col justify-between rounded-2xl border border-[#004CB1]/25 bg-white p-5 shadow-2xs transition hover:border-[#004CB1]/50">
                        <div>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-700">
                            Não
                          </span>
                          <h3 className="mt-2.5 text-base font-extrabold text-[#1D2433]">
                            Ainda não tenho conta
                          </h3>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            Crie seu cadastro rápido agora ou continue direto sem precisar de conta.
                          </p>
                        </div>

                        <div className="mt-5 flex flex-col gap-2">
                          <Link
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#004CB1] bg-white px-4 py-2.5 text-xs font-bold text-[#004CB1] transition hover:bg-blue-50 sm:text-sm"
                            href="/login?redirect=/cotacao"
                          >
                            <UserPlus className="size-4" />
                            <span>Criar minha conta agora</span>
                          </Link>
                          <button
                            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white shadow-xs transition hover:bg-emerald-700 sm:text-sm"
                            onClick={() => goToStep('contact', 'forward')}
                            type="button"
                          >
                            <span>Quero continuar sem conta</span>
                            <ArrowRight className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* ETAPA 1: Nome e Telefone/WhatsApp */}
                {wizardStep === 'contact' && (
                  <section aria-labelledby="quote-contact-heading" className="space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#004CB1]"
                        >
                          <UserRound className="size-5" />
                        </span>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wide text-[#004CB1]">
                            Etapa 1 · Seus dados
                          </span>
                          <h2
                            className="mt-0.5 text-lg font-extrabold text-[#1D2433] sm:text-xl"
                            id="quote-contact-heading"
                          >
                            Qual seu nome e seu Telefone / WhatsApp?
                          </h2>
                          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                            Para enviarmos a proposta comercial e confirmar disponibilidade.
                          </p>
                        </div>
                      </div>
                      {isAuthenticated && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          Conta conectada
                        </span>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <WebField
                        error={fieldErrors.customerName?.join(' ')}
                        id="customerName"
                        label="Nome completo"
                        required
                      >
                        <WebInput
                          aria-describedby={fieldErrors.customerName ? 'customerName-error' : undefined}
                          autoComplete="name"
                          className="h-11 rounded-xl border-slate-200 bg-slate-50/40 focus:bg-white"
                          id="customerName"
                          invalid={Boolean(fieldErrors.customerName)}
                          name="customerName"
                          onChange={(e) => {
                            setCustomerName(e.target.value);
                            if (fieldErrors.customerName) {
                              setFieldErrors((prev) => ({ ...prev, customerName: [] }));
                            }
                          }}
                          placeholder="Ex: Maria Silva ou responsável pela compra"
                          required
                          value={customerName}
                        />
                      </WebField>

                      <WebField
                        error={fieldErrors.customerPhone?.join(' ')}
                        id="customerPhone"
                        label="Seu Telefone / WhatsApp"
                        required
                      >
                        <WebInput
                          aria-describedby={fieldErrors.customerPhone ? 'customerPhone-error' : undefined}
                          autoComplete="tel"
                          className="h-11 rounded-xl border-slate-200 bg-slate-50/40 focus:bg-white"
                          id="customerPhone"
                          inputMode="tel"
                          invalid={Boolean(fieldErrors.customerPhone)}
                          name="customerPhone"
                          onChange={(e) => {
                            setCustomerPhone(formatBrazilPhoneMask(e.target.value));
                            if (fieldErrors.customerPhone) {
                              setFieldErrors((prev) => ({ ...prev, customerPhone: [] }));
                            }
                          }}
                          placeholder="(91) 90000-0000"
                          required
                          value={customerPhone}
                        />
                      </WebField>
                    </div>

                    {error ? <WebAlert tone="error">{error}</WebAlert> : null}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                      {!isAuthenticated ? (
                        <button
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 sm:text-sm"
                          onClick={() => goToStep('account', 'backward')}
                          type="button"
                        >
                          <ArrowLeft className="size-4" />
                          <span>Voltar</span>
                        </button>
                      ) : (
                        <span />
                      )}

                      <button
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#004CB1] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#003882]"
                        onClick={handleAdvanceFromContact}
                        type="button"
                      >
                        <span>Avançar</span>
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                  </section>
                )}

                {/* ETAPA 2: Seleção da Loja */}
                {wizardStep === 'store' && (
                  <section aria-labelledby="quote-store-heading" className="space-y-5">
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#004CB1]"
                      >
                        <Store className="size-5" />
                      </span>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wide text-[#004CB1]">
                          Etapa 2 · Loja de atendimento
                        </span>
                        <h2
                          className="mt-0.5 text-lg font-extrabold text-[#1D2433] sm:text-xl"
                          id="quote-store-heading"
                        >
                          Qual loja você quer atendimento?
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                          Escolha se prefere retirar ou receber e selecione a unidade mais próxima de você.
                        </p>
                      </div>
                    </div>

                    <QuoteStoreSelector
                      anchor={anchor}
                      fulfillmentMode={fulfillmentMode}
                      gpsError={gpsError}
                      gpsLoading={gpsLoading}
                      hideHeader
                      onFulfillmentModeChange={setFulfillmentMode}
                      onOpenLocationModal={locationCtx ? handleOpenLocationModal : undefined}
                      onRequestGps={handleRequestGps}
                      onSelectStore={handleSelectStore}
                      rankedStores={rankedStores}
                      selectedStoreId={selectedStore.id}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                      <button
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 sm:text-sm"
                        onClick={() => goToStep('contact', 'backward')}
                        type="button"
                      >
                        <ArrowLeft className="size-4" />
                        <span>Voltar</span>
                      </button>

                      <button
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#004CB1] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#003882]"
                        onClick={() => goToStep('extras', 'forward')}
                        type="button"
                      >
                        <span>Avançar</span>
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                  </section>
                )}

                {/* ETAPA 3: Dados adicionais complementares */}
                {wizardStep === 'extras' && (
                  <section aria-labelledby="quote-extras-heading" className="space-y-5">
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#004CB1]"
                      >
                        <Building2 className="size-5" />
                      </span>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wide text-[#004CB1]">
                          Etapa 3 · Dados adicionais complementares
                        </span>
                        <h2
                          className="mt-0.5 text-lg font-extrabold text-[#1D2433] sm:text-xl"
                          id="quote-extras-heading"
                        >
                          Você quer enviar mais informações complementares?
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                          Opcional: informe empresa, CPF/CNPJ, e-mail ou observações e condições para a proposta.
                        </p>
                      </div>
                    </div>

                    {/* Resumo rápido das etapas anteriores */}
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        {customerName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span>{customerPhone}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-semibold text-[#004CB1]">{selectedStore.shortTitle}</span>
                    </div>

                    {/* Escolha Sim / Não */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        aria-pressed={wantsExtraInfo === true}
                        className={`flex cursor-pointer flex-col items-start rounded-2xl border p-4 text-left transition ${
                          wantsExtraInfo === true
                            ? 'border-[#004CB1] bg-blue-50/70 ring-2 ring-[#004CB1]/15 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-[#004CB1]/40 hover:bg-slate-50/60'
                        }`}
                        onClick={() => {
                          setWantsExtraInfo(true);
                          setError(null);
                        }}
                        type="button"
                      >
                        <span className="text-sm font-extrabold text-[#1D2433]">
                          Sim
                        </span>
                        <span className="mt-0.5 text-xs text-slate-500">
                          Adicionar empresa, CPF/CNPJ, e-mail e observações
                        </span>
                      </button>

                      <button
                        aria-pressed={wantsExtraInfo === false}
                        className={`flex cursor-pointer flex-col items-start rounded-2xl border p-4 text-left transition ${
                          wantsExtraInfo === false
                            ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/15 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-slate-50/60'
                        }`}
                        onClick={() => {
                          setWantsExtraInfo(false);
                          setFieldErrors((prev) => ({ ...prev, customerEmail: [] }));
                          setError(null);
                        }}
                        type="button"
                      >
                        <span className="text-sm font-extrabold text-[#1D2433]">
                          Não
                        </span>
                        <span className="mt-0.5 text-xs text-slate-500">
                          Enviar direto apenas com meus dados principais
                        </span>
                      </button>
                    </div>

                    {/* Campos complementares animados quando escolhe Sim */}
                    {wantsExtraInfo === true && (
                      <div className="animate-cn-section-reveal space-y-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <WebField
                            className="sm:col-span-2"
                            error={fieldErrors.customerEmail?.join(' ')}
                            id="customerEmail"
                            label="E-mail (opcional)"
                          >
                            <WebInput
                              aria-describedby={fieldErrors.customerEmail ? 'customerEmail-error' : undefined}
                              autoComplete="email"
                              className="h-11 rounded-xl border-slate-200 bg-white"
                              id="customerEmail"
                              invalid={Boolean(fieldErrors.customerEmail)}
                              name="customerEmail"
                              onChange={(e) => {
                                setCustomerEmail(e.target.value);
                                if (fieldErrors.customerEmail) {
                                  setFieldErrors((prev) => ({ ...prev, customerEmail: [] }));
                                }
                              }}
                              placeholder="contato@suaempresa.com.br"
                              type="email"
                              value={customerEmail}
                            />
                          </WebField>

                          <WebField id="companyName" label="Empresa / Comércio (opcional)">
                            <WebInput
                              autoComplete="organization"
                              className="h-11 rounded-xl border-slate-200 bg-white"
                              id="companyName"
                              name="companyName"
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="Ex: Lanchonete, Padaria, Mercado..."
                              value={companyName}
                            />
                          </WebField>

                          <WebField id="document" label="CPF ou CNPJ (opcional)">
                            <WebInput
                              className="h-11 rounded-xl border-slate-200 bg-white"
                              id="document"
                              inputMode="numeric"
                              name="document"
                              onChange={(e) => setDocumentNumber(formatCpfCnpjMask(e.target.value))}
                              placeholder="00.000.000/0001-00"
                              value={documentNumber}
                            />
                          </WebField>
                        </div>

                        <div className="space-y-3 border-t border-slate-200/80 pt-4">
                          <div>
                            <h3 className="text-sm font-extrabold text-[#1D2433]">
                              Observações e condições (opcional)
                            </h3>
                            <p className="text-xs text-slate-500">
                              Informe detalhes como endereço de entrega, prazo desejado ou quantidade por caixa.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {QUICK_NOTE_SUGGESTIONS.map((snippet) => (
                              <button
                                key={snippet}
                                className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-[#004CB1]/40 hover:bg-blue-50/70 hover:text-[#004CB1]"
                                onClick={() => handleAppendQuickNote(snippet)}
                                type="button"
                              >
                                + {snippet}
                              </button>
                            ))}
                          </div>

                          <WebField id="notes" label="Observações">
                            <WebTextarea
                              className="rounded-xl border-slate-200 bg-white"
                              id="notes"
                              name="notes"
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder={
                                fulfillmentMode === 'DELIVERY'
                                  ? 'Informe seu bairro/endereço para entrega, prazo desejado ou observações...'
                                  : 'Horário previsto para retirada, faturamento ou outras observações...'
                              }
                              rows={3}
                              value={notes}
                            />
                          </WebField>
                        </div>
                      </div>
                    )}

                    {/* Confirmação rápida quando escolhe Não */}
                    {wantsExtraInfo === false && (
                      <div className="animate-cn-section-reveal flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs font-semibold text-emerald-900">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                        <span>
                          Tudo certo! Sua cotação será enviada apenas com seus dados principais para a{' '}
                          <strong>{selectedStore.shortTitle}</strong>.
                        </span>
                      </div>
                    )}

                    {error ? <WebAlert tone="error">{error}</WebAlert> : null}

                    <div className="space-y-3 border-t border-slate-100 pt-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 sm:text-sm"
                          onClick={() => goToStep('store', 'backward')}
                          type="button"
                        >
                          <ArrowLeft className="size-4" />
                          <span>Voltar</span>
                        </button>

                        {wantsExtraInfo !== null && (
                          <WebButton
                            className="h-12 flex-1 rounded-xl text-sm font-extrabold shadow-sm sm:min-w-[220px]"
                            disabled={submitting}
                            loading={submitting}
                            type="submit"
                            variant="promo"
                          >
                            {submitting ? 'Enviando…' : 'Enviar cotação'}
                          </WebButton>
                        )}
                      </div>

                      {wantsExtraInfo !== null && (
                        <p className="text-center text-[11.5px] text-slate-500">
                          Ao enviar, você concorda com o contato da equipe comercial da{' '}
                          <strong className="text-slate-700">{selectedStore.shortTitle}</strong> sobre esta cotação.
                        </p>
                      )}
                    </div>
                  </section>
                )}
              </div>
            </form>
          </div>

          {/* Coluna Direita: Resumo Sticky */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_6px_28px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#1D2433]">
                    Itens ({count})
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                    {totalLineTypes} {totalLineTypes === 1 ? 'produto' : 'produtos'}
                  </span>
                </div>
                <Link
                  className="text-xs font-bold text-[#004CB1] hover:underline"
                  href="/loja"
                >
                  + Adicionar
                </Link>
              </div>

              <ul className="mt-2 max-h-[360px] divide-y divide-slate-100 overflow-y-auto pr-1 sidebar-scrollbar">
                {items.map((item) => {
                  const image = resolveProductImage({
                    slug: item.productSlug,
                    id: item.variantId,
                    imagePath: item.imagePath,
                  });
                  const hasUnitPrice = item.unitPriceCents != null && item.unitPriceCents > 0;
                  const lineTotalCents = hasUnitPrice ? item.unitPriceCents! * item.quantity : null;

                  return (
                    <li className="flex gap-3 py-3.5" key={item.variantId}>
                      <Link
                        className="flex size-15 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1 transition hover:border-[#004CB1]"
                        href={`/produto/${item.productSlug}`}
                      >
                        <Image
                          alt={item.name}
                          className="size-full object-contain"
                          height={60}
                          src={image}
                          unoptimized
                          width={60}
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          className="line-clamp-2 text-xs font-bold leading-snug text-[#1D2433] transition hover:text-[#004CB1] sm:text-sm"
                          href={`/produto/${item.productSlug}`}
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {formatMoneyOrQuote(item.unitPriceCents)} · SKU {item.sku}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
                            <button
                              aria-label="Diminuir"
                              className="p-1.5 text-slate-600 transition hover:bg-slate-200/70 cursor-pointer"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              type="button"
                            >
                              <Minus aria-hidden className="size-3" />
                            </button>
                            <span className="min-w-7 text-center text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              aria-label="Aumentar"
                              className="p-1.5 text-slate-600 transition hover:bg-slate-200/70 cursor-pointer"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              type="button"
                            >
                              <Plus aria-hidden className="size-3" />
                            </button>
                          </div>
                          <button
                            aria-label={`Remover ${item.name}`}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-[#E2091E] cursor-pointer"
                            onClick={() => remove(item.variantId)}
                            type="button"
                          >
                            <Trash2 aria-hidden className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-extrabold text-[#1D2433] sm:text-sm">
                          {formatMoneyOrQuote(lineTotalCents)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Resumo Consolidado */}
              <div className="mt-3 space-y-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <MapPin className="size-3.5 text-[#004CB1] shrink-0" />
                    <span>Unidade escolhida</span>
                  </span>
                  <div className="text-right">
                    <strong className="block font-bold text-slate-900">{selectedStore.shortTitle}</strong>
                    {selectedStore.formattedKm && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#004CB1]">
                        <Navigation className="size-2.5" />
                        a {selectedStore.formattedKm}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    {fulfillmentMode === 'PICKUP' ? (
                      <Store className="size-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <Truck className="size-3.5 text-slate-400 shrink-0" />
                    )}
                    <span>Modalidade</span>
                  </span>
                  <strong className="font-bold text-slate-800">
                    {fulfillmentMode === 'PICKUP' ? 'Retirar na loja' : 'Entrega / Delivery'}
                  </strong>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5 text-sm">
                  <span className="font-semibold text-slate-600">Total de referência</span>
                  <strong className="text-lg font-extrabold text-[#004CB1]">
                    {formatMoneyOrQuote(subtotalCents)}
                  </strong>
                </div>
              </div>

              <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500">
                Valores de referência; a proposta comercial final com descontos de atacado é enviada pela equipe da{' '}
                <strong>{selectedStore.shortTitle}</strong>.
              </p>
            </div>

            {/* Card de Garantias Comerciais */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>
                    <strong className="text-slate-800">Sem cobrança online:</strong> você só fecha o pedido após aprovar o orçamento.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Tag className="mt-0.5 size-4 shrink-0 text-[#004CB1]" />
                  <span>
                    <strong className="text-slate-800">Condições de atacado:</strong> preços diferenciados para fardos, caixas e recorrência.
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
