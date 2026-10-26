'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Package,
  RefreshCw,
  Send,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

function TrocasContent() {
  const searchParams = useSearchParams();
  const initialProtocol = searchParams.get('protocolo') || '';
  const { user } = useAuth();

  const [orderNumber, setOrderNumber] = useState(initialProtocol);
  const [reason, setReason] = useState('DEFEITO');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdProtocol, setCreatedProtocol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProtocol) {
      setOrderNumber(initialProtocol);
    }
  }, [initialProtocol]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!orderNumber.trim()) {
      setError('Por favor, informe o número do pedido ou protocolo da cotação.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Por favor, descreva o motivo com pelo menos 10 caracteres.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const generated = `TRK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setCreatedProtocol(generated);
      setSubmitting(false);
    }, 600);
  }

  if (!user) return null;

  const reasonLabels: Record<string, string> = {
    DEFEITO: 'Produto com defeito de fábrica ou avaria',
    ARREPENDIMENTO: 'Desistência / Arrependimento de compra (7 dias)',
    DIVERGENTE: 'Item entregue diferente do solicitado',
    CANCELAMENTO: 'Cancelamento antes da entrega',
    OUTRO: 'Outro motivo',
  };

  const whatsappMessage = encodeURIComponent(
    `Olá Comercial do Norte! Abri uma solicitação de troca/cancelamento com protocolo ${createdProtocol || 'TRK-2026'} referente ao pedido ${orderNumber}.\nMotivo: ${reasonLabels[reason] || reason}.\nDescrição: ${description}`,
  );
  const whatsappUrl = `https://wa.me/5591983440880?text=${whatsappMessage}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* CABEÇALHO DA SEÇÃO */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <RefreshCw className="size-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Trocas e Cancelamentos</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Política transparente e atendimento humanizado para trocas, devoluções e cancelamentos na Comercial do Norte.
            </p>
          </div>
        </div>

        {/* DIRETRIZES DO CONSUMIDOR */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs">
            <strong className="block text-slate-900 font-bold mb-1">7 Dias Arrependimento</strong>
            <span className="text-slate-600">Conforme o CDC, você pode desistir em até 7 dias corridos após o recebimento.</span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs">
            <strong className="block text-slate-900 font-bold mb-1">Avarias e Defeitos</strong>
            <span className="text-slate-600">Troca imediata para embalagens com defeito ou avaria no transporte.</span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs">
            <strong className="block text-slate-900 font-bold mb-1">Lojas Físicas Belém</strong>
            <span className="text-slate-600">Troca presencial facilitada nas unidades Bernardo Sayão ou Jurunas.</span>
          </div>
        </div>
      </div>

      {/* RESULTADO: PROTOCOLO GERADO COM SUCESSO */}
      {createdProtocol ? (
        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/90 p-6 sm:p-8 shadow-md text-slate-900 animate-in fade-in zoom-in-95 duration-200 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-8 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Solicitação Aberta com Sucesso!
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Protocolo: <span className="font-mono text-emerald-800">{createdProtocol}</span>
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-700">
            Sua solicitação de troca referente ao pedido <strong>{orderNumber}</strong> foi registrada. Para agilizar o atendimento e a coleta/troca imediata, clique no botão abaixo para conversar diretamente com o SAC no WhatsApp:
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <a
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 transition"
              href={whatsappUrl}
              rel="noreferrer"
              target="_blank"
            >
              <MessageSquare className="size-4.5" />
              <span>Prosseguir no WhatsApp com este protocolo</span>
            </a>

            <button
              className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              onClick={() => {
                setCreatedProtocol(null);
                setDescription('');
                setOrderNumber('');
              }}
              type="button"
            >
              Nova solicitação
            </button>
          </div>
        </div>
      ) : (
        /* FORMULÁRIO DE SOLICITAÇÃO */
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900">Formulário de Solicitação de Troca ou Cancelamento</h3>

          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
              <AlertCircle className="size-4.5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {/* NÚMERO DO PEDIDO / COTAÇÃO */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="orderNumber">
                Número do Pedido ou Cotação <span className="text-rose-500">*</span>
              </label>
              <input
                id="orderNumber"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ex: CN-2026-8491"
                required
                type="text"
                value={orderNumber}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Você pode consultar seus protocolos na aba &quot;Meus Pedidos&quot;.
              </p>
            </div>

            {/* MOTIVO DA SOLICITAÇÃO */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="reason">
                Motivo da Solicitação <span className="text-rose-500">*</span>
              </label>
              <select
                id="reason"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
                onChange={(e) => setReason(e.target.value)}
                value={reason}
              >
                <option value="DEFEITO">Produto com defeito de fábrica ou avaria</option>
                <option value="ARREPENDIMENTO">Desistência / Arrependimento de compra (7 dias)</option>
                <option value="DIVERGENTE">Item entregue diferente do solicitado</option>
                <option value="CANCELAMENTO">Cancelamento antes da entrega</option>
                <option value="OUTRO">Outro motivo</option>
              </select>
            </div>
          </div>

          {/* DESCRIÇÃO DO MOTIVO */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="description">
              Descreva o Ocorrido <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhes como: qual produto apresentou defeito, se a embalagem estava violada, etc."
              rows={4}
              value={description}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              O SAC da Comercial do Norte responderá em até 24h úteis.
            </span>

            <button
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#004CB1] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#003882] active:scale-98 transition cursor-pointer disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              <Send className="size-4" />
              <span>{submitting ? 'Gerando protocolo…' : 'Enviar solicitação de troca'}</span>
            </button>
          </div>
        </form>
      )}

      {/* PERGUNTAS FREQUENTES */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="size-4.5 text-[#004CB1]" />
          <span>Dúvidas Frequentes sobre Trocas e Devoluções</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <strong className="block text-slate-900 font-bold mb-1">
              Como funciona a devolução por arrependimento?
            </strong>
            <span>
              Você tem até 7 dias corridos após receber as mercadorias para solicitar o cancelamento ou devolução, desde que os produtos estejam lacrados na embalagem original.
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <strong className="block text-slate-900 font-bold mb-1">
              Posso trocar diretamente na loja física em Belém?
            </strong>
            <span>
              Sim! Clientes de Belém e Ananindeua podem comparecer diretamente nas nossas lojas da Bernardo Sayão ou Jurunas com o número da cotação/pedido e os itens para troca imediata no balcão.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrocasPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-slate-400">Carregando…</div>}>
      <TrocasContent />
    </Suspense>
  );
}
