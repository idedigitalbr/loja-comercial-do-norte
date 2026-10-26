'use client';

import Link from 'next/link';
import {
  ArrowRight,
  AtSign,
  Heart,
  MessageSquare,
  Package,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useFavorites } from '@/components/favorites-provider';
import { useQuoteCart } from '@/components/quote-cart-provider';

export default function ContaOverviewPage() {
  const { user } = useAuth();
  const { count: favCount } = useFavorites();
  const { count: cartCount } = useQuoteCart();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* GRID DE CARDS RÁPIDOS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* CARD 01: DADOS PESSOAIS (TROCAR NOME) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-[#004CB1]/40 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#004CB1]">
                <User className="size-5 stroke-[2]" />
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                Identificação
              </span>
            </div>
            <h2 className="mt-3 text-base font-bold text-slate-900">Dados Pessoais</h2>
            <p className="mt-1 text-xs text-slate-500">
              Altere seu nome completo, CPF/CNPJ e informações de cadastro.
            </p>
            <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
              <strong>Nome:</strong> {user.fullName || user.firstName}
            </div>
          </div>
          <Link
            className="mt-4 flex items-center justify-between text-xs font-bold text-[#004CB1] hover:underline pt-3 border-t border-slate-100"
            href="/conta/dados-pessoais"
          >
            <span>Alterar meu nome e dados</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* CARD 02: E-MAIL E TELEFONE */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-[#004CB1]/40 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <AtSign className="size-5 stroke-[2]" />
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                Acesso &amp; Contato
              </span>
            </div>
            <h2 className="mt-3 text-base font-bold text-slate-900">E-mail, Telefone &amp; Senha</h2>
            <p className="mt-1 text-xs text-slate-500">
              Atualize seu e-mail de acesso, WhatsApp para retorno de cotações e altere sua senha.
            </p>
            <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700 space-y-0.5">
              <div className="truncate"><strong>E-mail:</strong> {user.email}</div>
              <div><strong>WhatsApp:</strong> {user.phone || '(91) 98344-0880'}</div>
            </div>
          </div>
          <Link
            className="mt-4 flex items-center justify-between text-xs font-bold text-[#004CB1] hover:underline pt-3 border-t border-slate-100"
            href="/conta/contato"
          >
            <span>Gerenciar contato e segurança</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* CARD 03: MEUS PEDIDOS & COTAÇÕES */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-[#004CB1]/40 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Package className="size-5 stroke-[2]" />
              </div>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                Histórico
              </span>
            </div>
            <h2 className="mt-3 text-base font-bold text-slate-900">Meus Pedidos &amp; Cotações</h2>
            <p className="mt-1 text-xs text-slate-500">
              Acompanhe o andamento de cotações no atacado e negociações com a equipe comercial.
            </p>
            <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
              Cotações ativas e histórico completo disponível para consulta.
            </div>
          </div>
          <Link
            className="mt-4 flex items-center justify-between text-xs font-bold text-[#004CB1] hover:underline pt-3 border-t border-slate-100"
            href="/conta/pedidos"
          >
            <span>Ver histórico de pedidos</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* CARD 04: TROCAS E CANCELAMENTOS */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-[#004CB1]/40 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <RefreshCw className="size-5 stroke-[2]" />
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                Pós-venda
              </span>
            </div>
            <h2 className="mt-3 text-base font-bold text-slate-900">Trocas &amp; Cancelamentos</h2>
            <p className="mt-1 text-xs text-slate-500">
              Solicite devoluções, trocas por defeito ou cancelamentos com protocolo e suporte rápido.
            </p>
          </div>
          <Link
            className="mt-4 flex items-center justify-between text-xs font-bold text-[#004CB1] hover:underline pt-3 border-t border-slate-100"
            href="/conta/trocas"
          >
            <span>Abrir solicitação de troca</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* CARD 05: FAVORITOS */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-[#004CB1]/40 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-[#E2091E]">
                <Heart className="size-5 fill-[#E2091E]" />
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                {favCount} {favCount === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <h2 className="mt-3 text-base font-bold text-slate-900">Meus Favoritos</h2>
            <p className="mt-1 text-xs text-slate-500">
              Itens salvos para agilizar suas cotações e reposições recorrentes de estoque.
            </p>
          </div>
          <Link
            className="mt-4 flex items-center justify-between text-xs font-bold text-[#004CB1] hover:underline pt-3 border-t border-slate-100"
            href="/favoritos"
          >
            <span>Acessar lista de favoritos</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* CARD 06: SACOLA ATIVA DE COTAÇÃO */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-[#004CB1]/40 hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#004CB1]">
                <ShoppingBag className="size-5" />
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                {cartCount} {cartCount === 1 ? 'item ativo' : 'itens ativos'}
              </span>
            </div>
            <h2 className="mt-3 text-base font-bold text-slate-900">Sacola de Cotação</h2>
            <p className="mt-1 text-xs text-slate-500">
              Produtos selecionados para envio direto à equipe de atendimento e fechamento.
            </p>
          </div>
          <Link
            className="mt-4 flex items-center justify-between text-xs font-bold text-[#004CB1] hover:underline pt-3 border-t border-slate-100"
            href="/compras"
          >
            <span>Ver sacola e finalizar</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* BLOCO DE ATENDIMENTO E CANAIS OFICIAIS */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Canais Oficiais de Atendimento</h2>
            <p className="text-xs text-slate-500">
              Comercial do Norte — Belém/PA: Bernardo Sayão e Jurunas.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004CB1] hover:underline"
            href="/conta/atendimento"
          >
            <span>Ver todos os contatos e horários</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3.5 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100/60 text-[#004CB1]">
              <Phone className="size-5" />
            </div>
            <div>
              <strong className="block text-sm font-bold text-slate-900">WhatsApp Vendas &amp; Cotações</strong>
              <span className="block text-xs text-slate-500 mt-0.5">(91) 98344-0880</span>
              <a
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#004CB1] hover:underline"
                href="https://wa.me/5591983440880"
                rel="noreferrer"
                target="_blank"
              >
                <span>Falar com consultor agora</span>
                <ArrowRight className="size-3" />
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100/60 text-[#E2091E]">
              <Store className="size-5" />
            </div>
            <div>
              <strong className="block text-sm font-bold text-slate-900">Unidades Físicas em Belém</strong>
              <span className="block text-xs text-slate-500 mt-0.5">
                Bernardo Sayão &amp; Jurunas (Pronta-entrega e retirada)
              </span>
              <Link
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#004CB1] hover:underline"
                href="/loja"
              >
                <span>Explorar catálogo completo</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
