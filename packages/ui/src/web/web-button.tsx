import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export type WebButtonVariant = 'primary' | 'promo' | 'secondary' | 'ghost';
export type WebButtonSize = 'sm' | 'md' | 'lg';

export type WebButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: WebButtonVariant;
  size?: WebButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
};

const base = 'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<WebButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  promo: 'bg-promo text-white hover:bg-promo-hover',
  secondary: 'border border-line bg-surface text-ink hover:border-brand hover:text-brand',
  ghost: 'text-brand hover:bg-brand-soft',
};

const sizes: Record<WebButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
};

/** Botão canônico da loja (tokens oficiais + Tailwind), sem "Comprar". */
export function WebButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: WebButtonProps) {
  return (
    <button
      {...props}
      aria-busy={loading}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      type={type}
    >
      {children}
      {loading ? <span className="sr-only">Processando</span> : null}
    </button>
  );
}
