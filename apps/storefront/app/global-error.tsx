'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Fatal root application error:', error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-md text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-rose-100 text-[#E2091E]">
            <svg
              className="size-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-extrabold text-[#1D2433]">
            Comercial do Norte
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Ocorreu uma falha temporária ao inicializar a interface. Clique abaixo para recarregar a página com segurança.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              type="button"
              className="w-full sm:w-auto rounded-xl bg-[#004CB1] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#003882] cursor-pointer"
            >
              Recarregar aplicação
            </button>
            <a
              href="/"
              className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 text-center"
            >
              Voltar ao início
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
