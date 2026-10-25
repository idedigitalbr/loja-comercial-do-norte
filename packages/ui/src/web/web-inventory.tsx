import type {
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from './cn';

export type WebFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/** Campo de formulário acessível (WCAG 2.2 AA) com estados de dica e erro anunciados. */
export function WebField({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: WebFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-semibold text-ink" htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-promo">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-muted" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-alert" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export type WebInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const controlBase =
  'w-full rounded-md border bg-surface px-3.5 py-2 text-sm text-ink placeholder:text-muted outline-none transition focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:opacity-60';

export function WebInput({ invalid = false, className, ...props }: WebInputProps) {
  return (
    <input
      {...props}
      aria-invalid={invalid || props['aria-invalid'] ? true : undefined}
      className={cn(
        controlBase,
        invalid ? 'border-alert focus-visible:border-alert focus-visible:ring-alert/20' : 'border-line',
        className,
      )}
    />
  );
}

export type WebTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function WebTextarea({ invalid = false, className, rows = 4, ...props }: WebTextareaProps) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || props['aria-invalid'] ? true : undefined}
      className={cn(
        controlBase,
        invalid ? 'border-alert focus-visible:border-alert focus-visible:ring-alert/20' : 'border-line',
        className,
      )}
      rows={rows}
    />
  );
}

export type WebSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export function WebSelect({ invalid = false, className, children, ...props }: WebSelectProps) {
  return (
    <select
      {...props}
      aria-invalid={invalid || props['aria-invalid'] ? true : undefined}
      className={cn(
        controlBase,
        invalid ? 'border-alert focus-visible:border-alert focus-visible:ring-alert/20' : 'border-line',
        className,
      )}
    >
      {children}
    </select>
  );
}

export type WebCardProps = HTMLAttributes<HTMLDivElement>;

export function WebCard({ className, ...props }: WebCardProps) {
  return (
    <div
      {...props}
      className={cn('rounded-card border border-line bg-surface p-5 shadow-card', className)}
    />
  );
}

export type WebAlertTone = 'info' | 'success' | 'warning' | 'error';

export type WebAlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: WebAlertTone;
  title?: string;
  children: ReactNode;
};

const alertTones: Record<WebAlertTone, string> = {
  info: 'border-brand/25 bg-brand-soft text-brand',
  success: 'border-emerald-200 bg-emerald-50 text-ok',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-promo/30 bg-promo-soft text-alert',
};

export function WebAlert({ tone = 'info', title, className, children, ...props }: WebAlertProps) {
  const isError = tone === 'error';
  return (
    <div
      {...props}
      aria-live={isError ? 'assertive' : 'polite'}
      className={cn('rounded-md border px-4 py-3 text-sm', alertTones[tone], className)}
      role={isError ? 'alert' : 'status'}
    >
      {title ? <p className="font-bold">{title}</p> : null}
      <div className={cn(title && 'mt-0.5')}>{children}</div>
    </div>
  );
}

export type WebSkeletonProps = HTMLAttributes<HTMLDivElement>;

export function WebSkeleton({ className, ...props }: WebSkeletonProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-surface-soft', className)}
    />
  );
}

export type WebSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  side?: 'left' | 'right';
  children: ReactNode;
  footer?: ReactNode;
};

/** Sheet lateral acessível (mini-carrinho / filtros mobile) com aria-modal. */
export function WebSheet({
  open,
  onClose,
  title,
  eyebrow,
  side = 'right',
  children,
  footer,
}: WebSheetProps) {
  if (!open) return null;

  return (
    <div
      aria-label={title}
      aria-modal="true"
      className="fixed inset-0 z-50"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      role="dialog"
    >
      <button
        aria-label="Fechar painel"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        type="button"
      />
      <aside
        className={cn(
          'absolute top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-elevated',
          side === 'right' ? 'right-0' : 'left-0',
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-4 py-4">
          <div>
            {eyebrow ? (
              <p className="text-xs uppercase tracking-wide text-muted">{eyebrow}</p>
            ) : null}
            <h2 className="text-lg font-bold text-ink">{title}</h2>
          </div>
          <button
            aria-label="Fechar"
            className="rounded-pill p-2 text-ink hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer ? <footer className="border-t border-line px-4 py-4">{footer}</footer> : null}
      </aside>
    </div>
  );
}
