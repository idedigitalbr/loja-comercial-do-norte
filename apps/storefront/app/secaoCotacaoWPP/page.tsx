import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Sparkles, Smartphone, Code2 } from 'lucide-react';
import { PromoStripWidget } from '@/components/storefront/widgets/promo-strip/promo-strip';

export const metadata: Metadata = {
  title: 'Seção Cotação WhatsApp | Comercial do Norte',
  description:
    'Demonstração e ambiente dedicado para ajuste e visualização da seção de Grupo de Ofertas Exclusivas do WhatsApp.',
};

export default function SecaoCotacaoWPPPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-16">
      {/* Barra Superior de Contexto e Navegação */}
      <div className="border-b border-slate-200 bg-white shadow-xs">
        <div className="cn-container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              aria-label="Voltar para a página inicial"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              href="/"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  <MessageCircle className="size-3" />
                  Ambiente Isolado
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">
                  Rota dedicada: <code className="font-mono text-slate-700 font-semibold">/secaoCotacaoWPP</code>
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                Seção: Grupo de Ofertas Exclusivas do WhatsApp
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
              <Sparkles className="size-3.5" />
              Pronto para ajustes
            </span>
          </div>
        </div>
      </div>

      {/* Renderização da Seção Exata solicitada */}
      <div className="py-6 sm:py-10">
        <PromoStripWidget
          ctaLabel="Participar do Grupo WhatsApp"
          ctaUrl="https://wa.me/5591983440880"
          highlightText="Exclusivas do WhatsApp"
          mascotImageUrl="/assets/HOME Vitrine/S0-HEADER/Mascote-3D-NORT/principais/nort-11-piscando.png"
          rightImageUrl="/assets/HOME Vitrine/S0-HEADER/Mascote-3D-NORT/principais/nort-09-celular.png"
          subtitle="Receba promoções relâmpago, lotes especiais para atacado e novidades direto no seu celular."
          title="Entre em nosso Grupo de ofertas"
          variant="whatsapp-group"
        />
      </div>

      {/* Painel Informativo para Apoiar os Ajustes */}
      <div className="cn-container">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Card 1: Arquivos de Componentes */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Code2 className="size-4 text-[#004CB1]" />
              <h3>Arquivos desta Estrutura</h3>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li className="rounded-md bg-slate-50 p-2 font-mono">
                <span className="text-slate-400">Layout principal:</span>{' '}
                <strong className="text-slate-800">apps/storefront/components/storefront/widgets/promo-strip/promo-strip.tsx</strong>
              </li>
              <li className="rounded-md bg-slate-50 p-2 font-mono">
                <span className="text-slate-400">Smartphone interativo:</span>{' '}
                <strong className="text-slate-800">apps/storefront/components/storefront/widgets/promo-strip/whatsapp-phone-animation.tsx</strong>
              </li>
            </ul>
          </div>

          {/* Card 2: Interatividade e Teste */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Smartphone className="size-4 text-[#25D366]" />
              <h3>Funcionalidades Ativas</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              O celular à direita executa a animação interativa com as 3 cenas (gaveta de aplicativos, lista de conversas do Comercial do Norte e chat com digitação automática e envio da mensagem). Você pode tocar ou clicar nele para reiniciar a qualquer momento.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Link do WhatsApp:</span>
              <a
                className="font-mono text-[#004CB1] hover:underline"
                href="https://wa.me/5591983440880"
                rel="noopener noreferrer"
                target="_blank"
              >
                wa.me/5591983440880
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
