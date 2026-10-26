import { Suspense } from 'react';
import { AuthFlowCard } from '@/components/auth-flow-card';

export const metadata = {
  title: 'Entre ou Crie sua Conta | Comercial do Norte',
  description: 'Faça login ou crie sua conta na Comercial do Norte para salvar favoritos e acompanhar suas cotações.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center py-16 text-slate-400 text-sm">
          Carregando...
        </div>
      }
    >
      <AuthFlowCard />
    </Suspense>
  );
}
