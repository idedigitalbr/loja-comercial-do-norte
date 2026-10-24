import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export type WebBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'brand' | 'promo' | 'success' | 'warning';
  children: ReactNode;
};

const tones: Record<NonNullable<WebBadgeProps['tone']>, string> = {
  neutral: 'bg-surface-soft text-body',
  brand: 'bg-brand-soft text-brand',
  promo: 'bg-promo-soft text-promo',
  success: 'bg-emerald-50 text-ok',
  warning: 'bg-amber-50 text-amber-700',
};

/** Etiqueta compacta para status, oferta e categorias. */
export function WebBadge({ tone = 'neutral', className, children, ...props }: WebBadgeProps) {
  return (
    <span {...props} className={cn('inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}
