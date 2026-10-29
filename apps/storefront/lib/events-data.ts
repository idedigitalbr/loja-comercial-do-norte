import type { ApiEvent } from './api';

export type EventItem = ApiEvent & {
  buttonVariant?: 'red' | 'blue';
  categoryKey?: 'workshops' | 'aulas-show' | 'palestras' | 'reinauguracoes';
};

export const CANONICAL_EVENTS: EventItem[] = [
  {
    id: 'encontro-de-empreendedores-james-holanda',
    title: 'Encontro de Empreendedores',
    slug: 'encontro-de-empreendedores',
    subtitle: 'Uma História de Sucesso',
    description:
      'Com James Holanda, CEO da Comercial do Norte. Inspiração, crescimento e oportunidades para o seu negócio.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-01-empreendedores.jpg',
    eventDateText: '31 de Agosto',
    eventTime: '19h30',
    location: 'Igreja Nova Terra',
    locationAddress: 'Belém - PA',
    instructor: 'James Holanda (CEO Comercial do Norte)',
    badge: 'PALESTRA',
    categoryKey: 'palestras',
    ctaLabel: 'Garantir Vaga',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+garantir+minha+vaga+no+Encontro+de+Empreendedores',
    buttonVariant: 'blue',
    status: 'ACTIVE',
    sortOrder: 1,
  },
  {
    id: 'grande-reinauguracao-loja-pedreira',
    title: 'Grande Reinauguração Loja Pedreira',
    slug: 'grande-reinauguracao-loja-pedreira',
    subtitle: 'Venha conhecer nossa nova loja na Pedreira',
    description:
      'Venha conhecer nossa nova loja na Pedreira. Mais espaço, mais variedade e promoções exclusivas.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-02-reinauguracao.jpg',
    eventDateText: '03 de Julho',
    eventTime: '08h',
    location: 'Loja Pedreira',
    locationAddress: 'Travessa Mauriti, entre Pedro Miranda e Antônio Everdosa — Belém/PA',
    instructor: 'Equipe Comercial do Norte',
    badge: 'REINAUGURAÇÃO',
    categoryKey: 'reinauguracoes',
    ctaLabel: 'Ver Como Chegar',
    ctaUrl: 'https://maps.google.com/?q=Comercial+do+Norte+Pedreira+Belem',
    buttonVariant: 'red',
    status: 'ACTIVE',
    sortOrder: 2,
  },
  {
    id: 'workshop-de-confeitaria-profissional',
    title: 'Workshop de Confeitaria Profissional',
    slug: 'workshop-confeitaria-profissional-chantilly-bicos',
    subtitle: 'Decoração com Chantilly e Bicos',
    description:
      'Decoração com Chantilly e Bicos. Aprenda técnicas exclusivas com especialistas no Centro Técnico Comercial do Norte.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-03-workshop-confeitaria.jpg',
    eventDateText: 'Em breve',
    eventTime: '14h às 18h',
    location: 'Centro Técnico Comercial do Norte',
    locationAddress: 'Av. Bernardo Sayão — Belém/PA',
    instructor: 'Mestre Doceiro Convidado',
    badge: 'WORKSHOP',
    categoryKey: 'workshops',
    ctaLabel: 'Inscreva-se Já',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+me+inscrever+no+Workshop+de+Confeitaria+Profissional',
    buttonVariant: 'red',
    status: 'ACTIVE',
    sortOrder: 3,
  },
  {
    id: 'croquete-de-charque-com-maionese-de-chicoria',
    title: 'Croquete de Charque com Maionese de Chicória',
    slug: 'sabado-croquete-de-charque-para-trigo',
    subtitle: 'Aula-show com a instrutora Thais Reis',
    description:
      'Aula-show com a instrutora Thais Reis. Receita tradicional paraense com um toque especial e segredos gastronômicos.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-04-croquete.jpg',
    eventDateText: '03 de Outubro',
    eventTime: '17h',
    location: 'Hangar Centro de Convenções - Belém/PA',
    locationAddress: 'Stand Comercial do Norte — Belém/PA',
    instructor: 'Thais Reis',
    badge: 'AULA-SHOW',
    categoryKey: 'aulas-show',
    ctaLabel: 'Confirmar Presença',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+confirmar+presen%C3%A7a+na+aula-show+Croquete+de+Charque',
    buttonVariant: 'red',
    status: 'ACTIVE',
    sortOrder: 4,
  },
  {
    id: 'doces-e-bolos-para-o-seu-negocio',
    title: 'Doces e Bolos para o seu Negócio',
    slug: 'doces-e-bolos-para-o-seu-negocio',
    subtitle: 'Aprenda receitas que mais vendem',
    description:
      'Aprenda receitas que mais vendem e dicas de precificação com especialistas para turbinar seus lucros.',
    posterUrl: '/assets/evento/event-doces-bolos.jpg',
    eventDateText: '12 de Novembro',
    eventTime: '14h',
    location: 'Centro Técnico Comercial do Norte',
    locationAddress: 'Belém - PA',
    instructor: 'Chef Especialista em Doces & Massas',
    badge: 'WORKSHOP',
    categoryKey: 'workshops',
    ctaLabel: 'Quero Participar',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+participar+do+workshop+Doces+e+Bolos+para+o+seu+Negocio',
    buttonVariant: 'blue',
    status: 'ACTIVE',
    sortOrder: 5,
  },
  {
    id: 'bebidas-para-seu-negocio',
    title: 'Bebidas para seu Negócio',
    slug: 'bebidas-para-seu-negocio',
    subtitle: 'Técnicas e receitas de cafés e frappés',
    description:
      'Técnicas e receitas de cafés, frappés e bebidas especiais para aumentar suas vendas com excelente margem.',
    posterUrl: '/assets/evento/event-bebidas.jpg',
    eventDateText: '18 de Novembro',
    eventTime: '15h',
    location: 'Centro Técnico Comercial do Norte',
    locationAddress: 'Belém - PA',
    instructor: 'Barista & Mixologista Convidado',
    badge: 'AULA-SHOW',
    categoryKey: 'aulas-show',
    ctaLabel: 'Ver Detalhes',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+saber+mais+sobre+a+aula-show+Bebidas+para+seu+Negocio',
    buttonVariant: 'red',
    status: 'ACTIVE',
    sortOrder: 6,
  },
  {
    id: 'solucoes-em-embalagens-para-delivery',
    title: 'Soluções em Embalagens para Delivery',
    slug: 'solucoes-em-embalagens-para-delivery',
    subtitle: 'Como escolher a embalagem ideal',
    description:
      'Como escolher a embalagem ideal para o seu negócio com dicas práticas de proteção, vedação e apresentação.',
    posterUrl: '/assets/evento/event-embalagens.jpg',
    eventDateText: '22 de Novembro',
    eventTime: '14h',
    location: 'Centro Técnico Comercial do Norte',
    locationAddress: 'Belém - PA',
    instructor: 'Consultor Técnico em Embalagens',
    badge: 'WORKSHOP',
    categoryKey: 'workshops',
    ctaLabel: 'Fazer Inscrição',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+me+inscrever+no+workshop+Solu%C3%A7%C3%B5es+em+Embalagens',
    buttonVariant: 'red',
    status: 'ACTIVE',
    sortOrder: 7,
  },
  {
    id: 'gestao-e-crescimento-para-pequenos-negocios',
    title: 'Gestão e Crescimento para Pequenos Negócios',
    slug: 'gestao-e-crescimento-para-pequenos-negocios',
    subtitle: 'Estratégias práticas para vender mais',
    description:
      'Estratégias práticas para vender mais e escalar o seu negócio em 2026 com gestão financeira eficiente.',
    posterUrl: '/assets/evento/event-gestao.jpg',
    eventDateText: '05 de Dezembro',
    eventTime: '19h',
    location: 'Hangar Centro de Convenções - Belém/PA',
    locationAddress: 'Hangar Centro de Convenções — Belém/PA',
    instructor: 'Especialista em Gestão Comercial',
    badge: 'PALESTRA',
    categoryKey: 'palestras',
    ctaLabel: 'Saiba Mais',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+saber+mais+sobre+a+palestra+Gest%C3%A3o+e+Crescimento',
    buttonVariant: 'blue',
    status: 'ACTIVE',
    sortOrder: 8,
  },
];

export const CONFEITARIA_WORKSHOPS: EventItem[] = [
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
    categoryKey: 'workshops',
    ctaLabel: 'Garantir Vaga',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+me+inscrever+no+Workshop+de+Confeitaria+com+Chantilly+e+Bicos',
    buttonVariant: 'red',
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
    categoryKey: 'workshops',
    ctaLabel: 'Garantir Vaga',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+me+inscrever+no+Workshop+Doces+Finos+e+Brigadeiros+Gourmet',
    buttonVariant: 'red',
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
    categoryKey: 'workshops',
    ctaLabel: 'Garantir Vaga',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+me+inscrever+no+Workshop+Sobremesas+na+Ta%C3%A7a',
    buttonVariant: 'red',
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
    categoryKey: 'aulas-show',
    ctaLabel: 'Confirmar Presença',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+confirmar+presen%C3%A7a+na+aula-show+Croquete+de+Charque',
    buttonVariant: 'red',
    status: 'ACTIVE',
    sortOrder: 4,
  },
];

export function findAnyEventBySlug(slug: string): EventItem | null {
  const normalized = (slug || '').toLowerCase().trim();
  const allEvents = [...CANONICAL_EVENTS, ...CONFEITARIA_WORKSHOPS];

  const exact = allEvents.find((e) => e.slug.toLowerCase() === normalized);
  if (exact) return exact;

  const match = allEvents.find(
    (e) =>
      normalized.includes(e.slug.toLowerCase()) ||
      e.slug.toLowerCase().includes(normalized)
  );
  return match || null;
}
