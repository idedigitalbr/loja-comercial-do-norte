'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home, ShoppingBag } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para diagnóstico em desenvolvimento e observabilidade
    console.error('Unhandled storefront error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-[#F4F7FB] py-16 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-rose-50 text-[#E2091E]">
          <AlertCircle className="size-8 stroke-[1.8]" />
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1D2433]">
          Ocorreu um imprevisto ao carregar esta página
        </h1>

        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Nossa equipe foi notificada. Você pode tentar recarregar a visualização ou navegar pelo catálogo de embalagens e descartáveis.
        </p>

        {error.digest && (
          <p className="mt-3 text-xs font-mono text-slate-400 bg-slate-50 rounded-md py-1 px-2.5 inline-block">
            Código do erro: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#004CB1] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#003882] cursor-pointer"
          >
            <RotateCcw className="size-4" />
            <span>Tentar novamente</span>
          </button>

          <Link
            href="/loja"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
          >
            <ShoppingBag className="size-4" />
            <span>Ver Catálogo</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            <Home className="size-4" />
            <span>Início</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
