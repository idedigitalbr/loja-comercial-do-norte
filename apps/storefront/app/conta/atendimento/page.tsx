'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Store,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export default function AtendimentoPage() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('DUVIDA');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!message.trim() || message.trim().length < 8) {
      setError('Por favor, escreva uma mensagem com ao menos 8 caracteres.');
      return;
    }

    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSuccess('Sua mensagem foi enviada à gerência da Comercial do Norte! Responderemos em breve via WhatsApp ou e-mail.');
      setMessage('');
      setTimeout(() => setSuccess(null), 6000);
    }, 600);
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* CABEÇALHO */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-[#004CB1]">
            <MessageSquare className="size-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Fale com o Lojista</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Canais oficiais e diretos de atendimento ao cliente da Comercial do Norte em Belém/PA.
            </p>
          </div>
        </div>

        {/* CARDS RÁPIDOS DE CONTATO */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* WHATSAPP CONSULTOR */}
          <div className="flex flex-col justify-between rounded-xl bg-slate-50 p-4 border border-slate-200/70">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <Phone className="size-4" />
                <span>Atendimento WhatsApp Direto</span>
              </div>
              <strong className="mt-2 block text-base font-extrabold text-slate-900">
                (91) 98344-0880
              </strong>
              <p className="mt-1 text-xs text-slate-500">
                Fale em tempo real com nossos consultores de vendas para negociar descontos por volume.
              </p>
            </div>
            <a
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
              href="https://wa.me/5591983440880"
              rel="noreferrer"
              target="_blank"
            >
              <MessageSquare className="size-3.5" />
              <span>Abrir WhatsApp Comercial</span>
            </a>
          </div>

          {/* E-MAIL E HORÁRIOS */}
          <div className="flex flex-col justify-between rounded-xl bg-slate-50 p-4 border border-slate-200/70">
            <div>
              <div className="flex items-center gap-2 text-[#004CB1] font-bold text-xs uppercase tracking-wider">
                <Clock className="size-4" />
                <span>Horário de Funcionamento</span>
              </div>
              <strong className="mt-2 block text-sm font-bold text-slate-900">
                Seg à Sex: 07:30 às 18:00
              </strong>
              <p className="mt-0.5 text-xs text-slate-600">
                Sábado: 07:30 às 13:00 · Domingo: Fechado
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                <Mail className="size-3.5" />
                <span>vendas@comercialdonorte.com.br</span>
              </div>
            </div>

            <Link
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              href="/loja"
            >
              <span>Ver catálogo de produtos</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO DE MENSAGEM DIRETA */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <h3 className="text-base font-bold text-slate-900">Enviar Mensagem para a Equipe</h3>

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
            <AlertCircle className="size-4.5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="subject">
            Assunto
          </label>
          <select
            id="subject"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
            onChange={(e) => setSubject(e.target.value)}
            value={subject}
          >
            <option value="DUVIDA">Dúvida sobre produtos ou catálogo</option>
            <option value="ORCAMENTO">Orçamento especial para CNPJ / Revenda</option>
            <option value="FATURAMENTO">Condições de pagamento e faturamento a prazo</option>
            <option value="ENTREGA">Informações sobre frete e entrega em Belém/PA</option>
            <option value="OUTRO">Outro assunto</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="message">
            Sua Mensagem <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="message"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Como podemos te ajudar hoje?"
            rows={4}
            value={message}
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#004CB1] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#003882] active:scale-98 transition cursor-pointer disabled:opacity-60"
            disabled={sending}
            type="submit"
          >
            <Send className="size-4" />
            <span>{sending ? 'Enviando mensagem…' : 'Enviar mensagem'}</span>
          </button>
        </div>
      </form>

      {/* UNIDADES FÍSICAS */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Store className="size-5 text-[#E2091E]" />
          <span>Nossas Lojas Físicas em Belém / PA</span>
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 text-xs text-slate-600">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <strong className="block text-slate-900 font-bold text-sm mb-1">Unidade Bernardo Sayão</strong>
            <p className="text-slate-500 flex items-center gap-1 mb-2">
              <MapPin className="size-3.5 text-slate-400 shrink-0" />
              <span>Av. Bernardo Sayão, Belém - PA</span>
            </p>
            <span className="inline-block rounded-md bg-blue-100/70 px-2 py-0.5 font-bold text-[#004CB1]">
              Pronta-entrega e retirada
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <strong className="block text-slate-900 font-bold text-sm mb-1">Unidade Jurunas</strong>
            <p className="text-slate-500 flex items-center gap-1 mb-2">
              <MapPin className="size-3.5 text-slate-400 shrink-0" />
              <span>Bairro do Jurunas, Belém - PA</span>
            </p>
            <span className="inline-block rounded-md bg-blue-100/70 px-2 py-0.5 font-bold text-[#004CB1]">
              Atacado e distribuição
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
