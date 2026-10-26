import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AccountShell } from './account-shell';

export const metadata: Metadata = {
  title: 'Minha Conta | Comercial do Norte',
  description: 'Gerencie seus dados pessoais, pedidos, cotações, trocas e atendimento na Comercial do Norte.',
  robots: { index: false, follow: false },
};

export default function ContaLayout({ children }: { children: ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
