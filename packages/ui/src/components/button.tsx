import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
};

export function Button({
  loading = false,
  variant = 'primary',
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const classes = ['commerce-button', `commerce-button--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...props}
      className={classes}
      type={props.type ?? 'button'}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      <span>{children}</span>
      {loading ? <span aria-hidden="true">Aguarde…</span> : null}
    </button>
  );
}
