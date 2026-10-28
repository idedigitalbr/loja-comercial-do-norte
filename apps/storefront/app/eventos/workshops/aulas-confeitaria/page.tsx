import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronRight,
  Sparkles,
  GraduationCap,
  UtensilsCrossed,
  Award,
  CheckCircle2,
  Phone,
  MessageCircle,
  Gift,
  HelpCircle,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { getEvents, type ApiEvent } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Workshops & Aulas de Confeitaria | Comercial do Norte',
  description:
    'Aprenda técnicas práticas de chantininho, bicos, brigadeiros gourmet, doces finos e sobremesas na taça com grandes especialistas no Centro Técnico Comercial do Norte em Belém.',
  alternates: { canonical: '/eventos/workshops/aulas-confeitaria' },
};

// Dados padrão de confeitaria para garantir renderização imediata e robustez
const FALLBACK_CONFEITARIA_WORKSHOPS: ApiEvent[] = [
  {
    id: 'workshop-confeitaria-profissional-chantilly-bicos',
    title: 'Workshop de Confeitaria Profissional: Decoração com Chantilly e Bicos',
    slug: 'workshop-confeitaria-profissional-chantilly-bicos',
    subtitle: 'Aprenda técnicas exclusivas com um especialista em confeitaria',
    description:
      'Treinamento prático voltado para boleiras, confeiteiras e pequenos produtores. Conteúdo aborda: ponto correto do chantilly, técnicas de bicos russos e perlê, trabalho com chantininho, nivelamento de bolos e decorações modernas.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-03-workshop-confeitaria.jpg',
    eventDateText: 'Em breve',
    eventTime: '14h às 18h',
    location: 'Centro Técnico Comercial do Norte',
    locationAddress: 'Av. Bernardo Sayão, Belém/PA',
    instructor: 'Mestre Doceiro',
    badge: 'WORKSHOP CONFEITARIA',
    ctaLabel: 'Garantir Vaga',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+me+inscrever+no+Workshop+de+Confeitaria+com+Chantilly+e+Bicos',
    status: 'ACTIVE',
    sortOrder: 1,
  },
  {
    id: 'workshop-doces-finos-brigadeiros-gourmet',
    title: 'Doces Finos e Brigadeiros Gourmet para Casamentos e Festas',
    slug: 'workshop-doces-finos-brigadeiros-gourmet',
    subtitle: 'Técnicas de ponto perfeito, texturas aveludadas e embalagens de luxo',
    description:
      'Workshop mão na massa com receitas consagradas de brigadeiros gourmet, trufas finas, banho de chocolate nobre e apresentação em forminhas especiais e caixas rígidas para festas sofisticadas.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-03-workshop-confeitaria.jpg',
    eventDateText: '18 de Novembro',
    eventTime: '13h30 às 17h30',
    location: 'Centro Técnico Comercial do Norte',
    locationAddress: 'Av. Bernardo Sayão — Belém/PA',
    instructor: 'Chef Confeiteira Convidada',
    badge: 'AULAS CONFEITARIA',
    ctaLabel: 'Garantir Vaga',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+me+inscrever+no+Workshop+Doces+Finos+e+Brigadeiros+Gourmet',
    status: 'ACTIVE',
    sortOrder: 2,
  },
  {
    id: 'workshop-sobremesas-na-taca-copo-da-felicidade',
    title: 'Sobremesas na Taça & Copos da Felicidade: Sucesso de Vendas',
    slug: 'workshop-sobremesas-na-taca-copo-da-felicidade',
    subtitle: 'Montagem estratégica, cremes estruturados e apresentação irresistível',
    description:
      'Domine a preparação de sobremesas geladas de alto giro e excelente margem de lucro. Aprenda cremes básicos estruturados (ninho, 4 leites, ganaches nobres), montagens em camadas nos copos bolha e taças acrílicas, com dicas de conservação e precificação comercial.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-03-workshop-confeitaria.jpg',
    eventDateText: '25 de Novembro',
    eventTime: '14h às 18h',
    location: 'Auditório Gastronômico Comercial do Norte',
    locationAddress: 'Travessa Mauriti — Belém/PA',
    instructor: 'Especialista em Sobremesas',
    badge: 'WORKSHOP',
    ctaLabel: 'Garantir Vaga',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+me+inscrever+no+Workshop+Sobremesas+na+Ta%C3%A7a',
    status: 'ACTIVE',
    sortOrder: 3,
  },
  {
    id: 'sabado-croquete-de-charque-para-trigo',
    title: 'Croquete de Charque com Maionese de Chicória — Aula-Show Gastronômica',
    slug: 'sabado-croquete-de-charque-para-trigo',
    subtitle: 'Aula prática regional no Stand Comercial do Norte',
    description:
      'Aprenda o passo a passo completo da receita consagrada de croquete de charque com toque regional de maionese de chicória. Aula demonstrativa ministrada pela instrutora Thais Reis com degustação.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-04-croquete.jpg',
    eventDateText: '03/10 (Sábado)',
    eventTime: '17h',
    location: 'Hangar Centro de Convenções',
    locationAddress: 'Stand Comercial do Norte — Belém/PA',
    instructor: 'Thais Reis',
    badge: 'AULA-SHOW',
    ctaLabel: 'Confirmar Presença',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+confirmar+presen%C3%A7a+na+aula-show+Croquete+de+Charque',
    status: 'ACTIVE',
    sortOrder: 4,
  },
];

export default async function ConfeitariaWorkshopsPage() {
  const allEvents = await getEvents();

  // Filtra eventos prioritariamente de Confeitaria / Workshop / Aulas
  const confeitariaEvents = allEvents.filter((ev) => {
    const text = `${ev.title} ${ev.subtitle || ''} ${ev.badge || ''} ${ev.description}`.toLowerCase();
    return (
      text.includes('confeitaria') ||
      text.includes('workshop') ||
      text.includes('aula') ||
      text.includes('doce') ||
      text.includes('bolo') ||
      text.includes('chantilly')
    );
  });

  const displayList = confeitariaEvents.length > 0 ? confeitariaEvents : FALLBACK_CONFEITARIA_WORKSHOPS;

  return (
    <div className="w-full bg-[#FFFDF9] min-h-screen text-slate-900">
      {/* 1. TOPO HERO / APRESENTAÇÃO WHITE MODE GOURMET */}
      <section className="relative overflow-hidden border-b border-amber-200/60 bg-gradient-to-b from-[#FFF9EE] via-[#FFFDF9] to-[#FFFDF9] py-10 sm:py-16">
        {/* Padrão decorativo sutil de confeitaria */}
        <div className="absolute inset-0 bg-[radial-gradient(#b4530912_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="cn-container relative z-10">
          {/* Breadcrumb limpo */}
          <nav aria-label="Você está aqui" className="text-xs text-amber-900/70 mb-6 flex items-center gap-1.5">
            <Link className="hover:text-amber-800 transition" href="/">
              Início
            </Link>
            <span aria-hidden>/</span>
            <Link className="hover:text-amber-800 transition" href="/eventos">
              Eventos
            </Link>
            <span aria-hidden>/</span>
            <span className="font-semibold text-amber-900">Workshops · Aulas Confeitaria</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              {/* Pill Badge Oficial (Fiel ao botão do topo do usuário) */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#00357B] px-3.5 py-1 text-white shadow-sm mb-4">
                <span className="text-xs sm:text-sm font-bold tracking-tight">Workshops</span>
                <span className="rounded-full bg-[#B45309] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black uppercase text-white tracking-wide">
                  AULAS CONFEITARIA
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Workshops &amp; Aulas Práticas de Confeitaria
              </h1>

              <div className="mt-3.5 h-1.5 w-32 rounded-full bg-gradient-to-r from-[#B45309] to-[#F59E0B]" />

              <p className="mt-4 text-base sm:text-lg text-slate-700 max-w-2xl leading-relaxed">
                Aprenda técnicas exclusivas, segredos de textura, bolos estruturados, doces finos e embalagens para presentes com os maiores especialistas da confeitaria no{' '}
                <strong className="text-slate-900 font-semibold">Centro Técnico Comercial do Norte</strong>.
              </p>

              {/* Destaques / Benefícios em White Mode */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left rounded-xl border border-amber-200/80 bg-white/90 p-3 shadow-xs">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-[#B45309] mb-2">
                    <UtensilsCrossed className="size-5" />
                  </div>
                  <strong className="text-xs font-bold text-slate-900">100% Prático</strong>
                  <span className="text-[11px] text-slate-500 leading-snug">Mão na massa em bancada</span>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left rounded-xl border border-amber-200/80 bg-white/90 p-3 shadow-xs">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-[#B45309] mb-2">
                    <Award className="size-5" />
                  </div>
                  <strong className="text-xs font-bold text-slate-900">Certificado</strong>
                  <span className="text-[11px] text-slate-500 leading-snug">Oficial Comercial do Norte</span>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left rounded-xl border border-amber-200/80 bg-white/90 p-3 shadow-xs">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-[#B45309] mb-2">
                    <Sparkles className="size-5" />
                  </div>
                  <strong className="text-xs font-bold text-slate-900">Insumos Inclusos</strong>
                  <span className="text-[11px] text-slate-500 leading-snug">Chantilly, formas e pós</span>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left rounded-xl border border-amber-200/80 bg-white/90 p-3 shadow-xs">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-[#B45309] mb-2">
                    <Gift className="size-5" />
                  </div>
                  <strong className="text-xs font-bold text-slate-900">Desconto em Loja</strong>
                  <span className="text-[11px] text-slate-500 leading-snug">Condições especiais</span>
                </div>
              </div>
            </div>

            {/* Card Lateral: Inscrição Rápida WhatsApp */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-2 w-full bg-gradient-to-r from-[#B45309] via-amber-400 to-[#004CB1]" />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="size-3.5 text-[#B45309]" />
                  Coordenação de Cursos
                </span>

                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  Quer garantir sua vaga ou tirar dúvidas?
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  As turmas do Centro Técnico possuem vagas limitadas para garantir o aprendizado individual.
                </p>

                <div className="mt-5 space-y-2.5">
                  <a
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition active:scale-98"
                    href="https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+informa%C3%A7%C3%B5es+sobre+a+agenda+dos+Workshops+de+Confeitaria+do+Comercial+do+Norte"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircle className="size-4.5" />
                    <span>Falar no WhatsApp de Cursos</span>
                  </a>

                  <Link
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    href="/eventos"
                  >
                    <span>Ver todos os outros eventos</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GRADE DE CARTAZES VERTICAIS 9:16 (WHITE MODE) */}
      <section className="py-12 sm:py-16">
        <div className="cn-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[#B45309]">
                Agenda de Turmas e Workshops
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Próximas Aulas de Confeitaria &amp; Gastronomia
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Inscrições Abertas para o Centro Técnico</span>
            </div>
          </div>

          {/* Grid de Cartazes Verticais (9:16) no tema White Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayList.map((workshop) => (
              <article
                className="group flex flex-col overflow-hidden rounded-2xl border border-amber-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-amber-400"
                key={workshop.id}
              >
                {/* Cartaz Vertical 9:16 */}
                <Link
                  className="relative block aspect-[9/16] w-full overflow-hidden bg-amber-50"
                  href={`/evento/workshop/aulas-confeitaria/${workshop.slug}`}
                >
                  {workshop.posterUrl ? (
                    <Image
                      alt={workshop.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      src={workshop.posterUrl}
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center p-6 text-center text-slate-400">
                      <Calendar className="size-12 stroke-1 text-[#B45309]" />
                      <span className="mt-2 text-xs font-medium">Cartaz em produção</span>
                    </div>
                  )}

                  {/* Badge de Destaque no topo do cartaz */}
                  {workshop.badge ? (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="rounded-full bg-[#B45309] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                        {workshop.badge}
                      </span>
                    </div>
                  ) : null}

                  {/* Overlay gradiente inferior para legibilidade do texto */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

                  {/* Detalhes essenciais ancorados no pé do cartaz */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10 text-white">
                    <h3 className="text-base font-extrabold text-white leading-tight line-clamp-2 drop-shadow-md">
                      {workshop.title}
                    </h3>

                    <div className="mt-2 space-y-1 text-xs text-amber-200">
                      {workshop.eventDateText ? (
                        <div className="flex items-center gap-1.5 font-bold">
                          <Calendar className="size-3.5 shrink-0 text-amber-400" />
                          <span>
                            {workshop.eventDateText}
                            {workshop.eventTime ? ` · ${workshop.eventTime}` : ''}
                          </span>
                        </div>
                      ) : null}

                      {workshop.instructor ? (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <User className="size-3.5 shrink-0 text-amber-400" />
                          <span>{workshop.instructor}</span>
                        </div>
                      ) : null}

                      {workshop.location ? (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="size-3.5 shrink-0 text-[#E2091E]" />
                          <span className="line-clamp-1">{workshop.location}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-2.5">
                      <span className="text-[11px] font-bold text-amber-300 group-hover:text-white transition">
                        Ver detalhes &amp; cronograma
                      </span>
                      <ChevronRight className="size-4 text-amber-300 group-hover:translate-x-1 group-hover:text-white transition" />
                    </div>
                  </div>
                </Link>

                {/* Bloco de Ação Inferior: Inscrição Direta no WhatsApp */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <a
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 text-xs font-bold transition shadow-xs active:scale-98"
                    href={
                      workshop.ctaUrl ||
                      `https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+me+inscrever+no+workshop+${encodeURIComponent(workshop.title)}`
                    }
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircle className="size-3.5" />
                    <span>{workshop.ctaLabel || 'Garantir Vaga'}</span>
                  </a>

                  <Link
                    aria-label={`Ver mais sobre ${workshop.title}`}
                    className="flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                    href={`/evento/workshop/aulas-confeitaria/${workshop.slug}`}
                  >
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO INFORMATIVA: COMO FUNCIONA O CENTRO TÉCNICO */}
      <section className="border-t border-amber-200/60 bg-white py-12 sm:py-16">
        <div className="cn-container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-[#B45309]">
              Estrutura Completa
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Como funciona o Centro Técnico Comercial do Norte?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Criado para apoiar o empreendedor e profissional de confeitaria de Belém com conhecimento prático que gera vendas imediatas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-amber-50/40 p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#004CB1] text-white font-black text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Aulas Demonstrativas &amp; Mão na Massa</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Você acompanha passo a passo o instrutor em bancadas modernas e climatizadas, aprendendo o ponto exato das receitas e os erros mais comuns.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-amber-50/40 p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#B45309] text-white font-black text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Insumos e Utensílios de Ponta</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Trabalhamos apenas com marcas consagradas do mercado nacional (chocolates nobres, chantillys de alta estabilidade, bicos profissionais e formas BWB).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-amber-50/40 p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Precificação &amp; Embalagens</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Além da receita, você aprende como calcular os custos da porção, escolher a embalagem que mais valoriza o doce e aumentar o valor percebido pelo cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PERGUNTAS FREQUENTES (FAQ) */}
      <section className="border-t border-slate-200 bg-slate-50 py-12 sm:py-16">
        <div className="cn-container max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Dúvidas Frequentes sobre os Workshops
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Tudo o que você precisa saber antes de participar de uma aula.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="size-4 text-[#B45309] shrink-0" />
                Preciso ter experiência prévia para participar?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                Não! Nossos workshops são desenhados tanto para iniciantes que querem começar a vender doces e bolos do zero quanto para profissionais que desejam aprimorar suas técnicas de decoração e acabamento.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="size-4 text-[#B45309] shrink-0" />
                Os ingredientes e materiais já estão inclusos no valor?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                Sim! Todos os insumos, coberturas, chantillys, formas e embalagens utilizados durante a aula são fornecidos pelo Centro Técnico Comercial do Norte.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="size-4 text-[#B45309] shrink-0" />
                Recebo certificado ao final do workshop?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                Sim, todos os participantes que concluem a carga horária recebem o Certificado Oficial de Capacitação Comercial do Norte.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="size-4 text-[#B45309] shrink-0" />
                Como faço para garantir a minha vaga?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                Basta clicar no botão &ldquo;Garantir Vaga&rdquo; da aula desejada ou entrar em contato direto com a coordenação pelo WhatsApp (91) 98344-0880. As vagas são confirmadas por ordem de matrícula.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
