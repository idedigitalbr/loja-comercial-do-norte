'use client';

import React, { useEffect } from 'react';
import { History, X, RotateCcw, CheckCircle2, User, Clock, RefreshCw } from 'lucide-react';
import { useElementor } from './elementor-editor-context';
import type { StorefrontRevision } from '@/lib/storefront/widget-types';

export function ElementorRevisionsModal() {
  const {
    revisionsModalOpen,
    setRevisionsModalOpen,
    revisions,
    loadRevisions,
    restoreRevision,
  } = useElementor();

  useEffect(() => {
    if (revisionsModalOpen) {
      loadRevisions();
    }
  }, [revisionsModalOpen]);

  if (!revisionsModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setRevisionsModalOpen(false)}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <History className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Histórico de Revisões da Vitrine
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 border border-zinc-700">
                  {revisions.length} checkpoints
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Linha do tempo oficial com autor, data e hora. Você pode restaurar qualquer versão anterior.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Atualizar histórico"
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              onClick={() => loadRevisions()}
              title="Recarregar revisões do servidor"
              type="button"
            >
              <RefreshCw className="size-4" />
            </button>
            <button
              aria-label="Fechar modal"
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              onClick={() => setRevisionsModalOpen(false)}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Lista da Linha do Tempo (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {revisions.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <Clock className="size-8 mx-auto mb-2 opacity-40 animate-spin" />
              <p className="text-xs">Carregando histórico de versões...</p>
            </div>
          ) : (
            <div className="relative border-l border-zinc-800 ml-4 space-y-6 pl-6">
              {revisions.map((rev, idx) => {
                const isCurrent = idx === 0;
                const formattedDate = new Date(rev.createdAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div key={rev.id} className="relative group">
                    {/* Marcador na linha do tempo */}
                    <div
                      className={`absolute -left-[31px] top-1.5 flex size-4 items-center justify-center rounded-full border-2 ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-950 text-emerald-400'
                          : 'border-zinc-700 bg-zinc-900 group-hover:border-sky-500 transition'
                      }`}
                    >
                      <div
                        className={`size-1.5 rounded-full ${
                          isCurrent ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                        }`}
                      />
                    </div>

                    {/* Card da Revisão */}
                    <div
                      className={`rounded-xl border p-4 transition-all duration-150 ${
                        isCurrent
                          ? 'border-emerald-500/30 bg-emerald-950/10'
                          : 'border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Detalhes da revisão */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-white tracking-tight">
                              {formattedDate}
                            </span>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                                <CheckCircle2 className="size-3" />
                                Versão Publicada
                              </span>
                            )}
                            <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                              {rev.widgetsCount} seções
                            </span>
                          </div>

                          {/* Autor da edição */}
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <div className="flex size-4 items-center justify-center rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-300">
                              <User className="size-2.5" />
                            </div>
                            <span className="font-medium text-zinc-200">{rev.authorName}</span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-500 text-[11px]">{rev.authorEmail}</span>
                          </div>

                          {/* Nota descritiva */}
                          {rev.note && (
                            <p className="text-[11px] text-zinc-400 italic">
                              "{rev.note}"
                            </p>
                          )}
                        </div>

                        {/* Botão de Restauração */}
                        <div>
                          {!isCurrent ? (
                            <button
                              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-sky-600 hover:text-white px-3 py-1.5 text-xs font-medium text-zinc-300 border border-zinc-700/80 transition shadow-xs active:scale-95 cursor-pointer"
                              onClick={() => restoreRevision(rev)}
                              title="Restaurar a vitrine inteira para este checkpoint"
                              type="button"
                            >
                              <RotateCcw className="size-3.5" />
                              <span>Restaurar Esta Versão</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-medium text-emerald-400/80 px-2 py-1">
                              Em exibição na loja
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé do modal */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 px-6 py-3 bg-zinc-900/40 text-[11px] text-zinc-500">
          <span>Ao restaurar uma versão, ela é carregada no editor para você conferir antes de publicar.</span>
          <button
            className="text-zinc-400 hover:text-white transition font-medium"
            onClick={() => setRevisionsModalOpen(false)}
            type="button"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
