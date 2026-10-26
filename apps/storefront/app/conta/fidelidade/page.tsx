'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Gem,
  Gift,
  HelpCircle,
  Percent,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

const POINTS_HISTORY = [
  {
    id: 'pt-1',
    description: 'Cotação concluída #CN-2026-8491',
    date: '24 Out 2026',
    points: '+1.8500 PTS',
    type: 'credit',
  },
  {
    id: 'pt-2',
    description: 'Bônus de Cadastro e Fidelidade Ouro',
    date: '15 Out 2026',
    points: '+5.0000 PTS',
    type: 'credit',
  },
  {
    id: 'pt-3',
    description: 'Cotação concluída #CN-2026-7210',
    date: '02 Out 2026',
    points: '+2.3600 PTS',
    type: 'credit',
  },
];

export default function FidelidadePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* BANNER CLUBE OURO */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/90 bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7]/60 to-[#FDE68A]/40 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/80 px-3 py-1 text-xs font-bold text-[#B45309]">
              <Gem className="size-3.5 fill-[#B45309]" />
              <span>CATEGORIA EXCLUSIVA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Cliente Ouro Comercial do Norte
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 max-w-md">
              Você tem acesso aos melhores descontos em embalagens, descartáveis e confeitaria com atendimento prioritário.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end rounded-2xl bg-white/90 backdrop-blur-xs p-4 sm:p-5 border border-amber-200/70 shadow-sm shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Saldo Fidelidade Acumulado
            </span>
            <div className="mt-1 flex items-center gap-2">
              <Star className="size-6 fill-[#7E22CE] text-[#7E22CE]" />
              <strong className="text-2xl sm:text-3xl font-black text-[#7E22CE]">
                9.2100 PTS
              </strong>
            </div>
            <span className="mt-1 text-[11px] font-semibold text-emerald-700">
              Apto para desconto na próxima cotação
            </span>
          </div>
        </div>
      </div>

      {/* VANTAGENS EXCLUSIVAS */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="size-4.5 text-amber-500" />
          <span>Vantagens do Seu Perfil Cliente Ouro</span>
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold">
              <Percent className="size-4" />
            </div>
            <div>
              <strong className="block text-slate-900 font-bold mb-0.5">Tabela de Preço Atacado</strong>
              <span className="text-slate-600">Margem diferenciada em compras por caixa fechada e fardos industriais.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#004CB1] font-bold">
              <Crown className="size-4" />
            </div>
            <div>
              <strong className="block text-slate-900 font-bold mb-0.5">Consultor Comercial Dedicado</strong>
              <span className="text-slate-600">Atendimento ágil direto no WhatsApp sem filas de espera.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <strong className="block text-slate-900 font-bold mb-0.5">Faturamento Faturado para PJ</strong>
              <span className="text-slate-600">Condições de boleto faturado sob análise prévia de crédito.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold">
              <Gift className="size-4" />
            </div>
            <div>
              <strong className="block text-slate-900 font-bold mb-0.5">Resgate de Pontos</strong>
              <span className="text-slate-600">Seus 9.2100 PTS abatem do valor final negociado no orçamento.</span>
            </div>
          </div>
        </div>
      </div>

      {/* EXTRATO DE PONTOS */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Extrato de Movimentação de Pontos</h3>
          <span className="text-xs text-slate-500">Últimos lançamentos</span>
        </div>

        <div className="divide-y divide-slate-100">
          {POINTS_HISTORY.map((item) => (
            <div className="flex items-center justify-between py-3" key={item.id}>
              <div>
                <strong className="block text-xs sm:text-sm font-bold text-slate-800">
                  {item.description}
                </strong>
                <span className="text-[11px] text-slate-500">{item.date}</span>
              </div>
              <strong className="text-xs sm:text-sm font-extrabold text-[#7E22CE]">
                {item.points}
              </strong>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Link
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#004CB1] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#003882] transition"
            href="/loja"
          >
            <ShoppingBag className="size-3.5" />
            <span>Fazer nova cotação e pontuar</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
