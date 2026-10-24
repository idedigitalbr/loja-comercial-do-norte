import type { ReactNode } from 'react';
import { cn } from './cn';

export type WebEmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/** Estado vazio canônico (catálogo, carrinho, erros de carregamento). */
export function WebEmptyState({ title, description, action, className }: WebEmptyStateProps) {
  return (
    <div className={cn('rounded-card border border-dashed border-line bg-surface p-8 text-center', className)}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
