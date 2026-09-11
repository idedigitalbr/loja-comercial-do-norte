import type { InputHTMLAttributes, ReactNode } from 'react';

export type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <div className="commerce-form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error ? <small id={descriptionId}>{hint}</small> : null}
      {error ? <small id={errorId} role="alert">{error}</small> : null}
    </div>
  );
}

export function Input({ id, 'aria-describedby': describedBy, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} id={id} aria-describedby={describedBy} />;
}
