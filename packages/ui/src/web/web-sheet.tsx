'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from './cn';

export type WebSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  side?: 'left' | 'right';
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  badge?: ReactNode;
  panelClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  backdropClassName?: string;
};

/** Sheet lateral acessível (mini-carrinho / filtros mobile) portado no body acima de headers e widgets flutuantes. */
export function WebSheet({
  open,
  onClose,
  title,
  eyebrow,
  side = 'right',
  children,
  footer,
  headerActions,
  badge,
  panelClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  backdropClassName,
}: WebSheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (
        dialogRef.current &&
        event.target instanceof Node &&
        dialogRef.current.contains(event.target)
      ) {
        return;
      }
      onClose();
    };

    window.addEventListener('keydown', handleWindowKeyDown);

    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={dialogRef}
      aria-label={title}
      aria-modal="true"
      className={cn(
        'fixed inset-0 z-[10050] flex',
        side === 'right' ? 'justify-end' : 'justify-start',
      )}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
      role="dialog"
    >
      <button
        aria-label="Fechar painel"
        className={cn(
          'fixed inset-0 cursor-pointer bg-slate-950/70 backdrop-blur-[2px] transition-opacity',
          backdropClassName,
        )}
        onClick={onClose}
        type="button"
      />
      <aside
        className={cn(
          'relative z-10 flex h-full w-full max-w-[440px] flex-col bg-surface text-ink shadow-2xl',
          side === 'right'
            ? 'ml-auto border-l border-slate-200/80'
            : 'mr-auto border-r border-slate-200/80',
          panelClassName,
        )}
      >
        <header
          className={cn(
            'flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-5 py-4',
            headerClassName,
          )}
        >
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#004CB1]">
                {eyebrow}
              </p>
            ) : null}
            <div className="mt-0.5 flex items-center gap-2">
              <h2 className="truncate text-lg font-extrabold tracking-tight text-ink">{title}</h2>
              {badge}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {headerActions}
            <button
              aria-label="Fechar"
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        </header>
        <div className={cn('flex-1 overflow-y-auto overscroll-contain', bodyClassName)}>
          {children}
        </div>
        {footer ? (
          <footer
            className={cn(
              'border-t border-slate-200 bg-white px-5 py-4 shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.12)]',
              footerClassName,
            )}
          >
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>,
    document.body,
  );
}
