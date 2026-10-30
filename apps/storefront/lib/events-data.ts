import type { ApiEvent } from './api';

export type EventCategoryKey = 'workshops' | 'aulas-show' | 'palestras' | 'reinauguracoes';

export type EventItem = ApiEvent & {
  buttonVariant?: 'red' | 'blue';
  categoryKey?: EventCategoryKey | string | null;
  eventWeekday?: string;
  durationText?: string;
  typeBadge?: string;
  isFree?: boolean;
  heroUrl?: string;
  aboutPhotoUrl?: string;
  whatYouWillLearn?: string[];
  schedule?: Array<{ time: string; title: string; description: string }>;
  gallery?: string[];
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
    id: 'workshop-doces-finos-brigadeiros-gourmet',
    title: 'Doces Finos e Brigadeiros Gourmet para Casamentos e Festas',
    slug: 'workshop-doces-finos-brigadeiros-gourmet',
    subtitle: 'Técnicas de ponto perfeito, texturas aveludadas e embalagens de luxo. Aprenda com especialistas do Centro Técnico Comercial do Norte e eleve suas criações para eventos especiais.',
    description:
      'Workshop mão na massa com receitas consagradas de brigadeiros gourmet, trufas finas, banho de chocolate nobre e apresentação em forminhas especiais e caixas rígidas para festas sofisticadas. Uma experiência completa para aprimorar suas técnicas e surpreender seus clientes.',
    posterUrl: '/assets/confeitaria/01-listagem-eventos/04-card-brigadeiros-gourmet.jpg',
    heroUrl: '/assets/confeitaria/02-pagina-workshop/02-hero-doces-finos-degrade-pronto.png',
    aboutPhotoUrl: '/assets/confeitaria/02-pagina-workshop/03-foto-brigadeiros-sobre-o-evento.jpg',
    eventDateText: '18 de Novembro de 2024',
    eventWeekday: 'Segunda-feira',
    eventTime: '13h30 às 17h30',
    durationText: '4 horas de workshop',
    location: 'Centro Técnico Comercial do Norte',
    locationAddress: 'Av. Bernardo Sayão — Belém/PA',
    instructor: 'Chef Especialista em Confeitaria Fina',
    badge: 'WORKSHOP',
    typeBadge: 'EVENTO PRESENCIAL',
    isFree: true,
    categoryKey: 'workshops',
    ctaLabel: 'Inscreva-se Já!',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+garantir+minha+vaga+no+Workshop+Doces+Finos+e+Brigadeiros+Gourmet',
    buttonVariant: 'red',
    status: 'ACTIVE',
    sortOrder: 1,
    whatYouWillLearn: [
      'Técnicas profissionais de preparo e finalização',
      'Pontos ideais de cremosidade e textura',
      'Apresentação e decoração para eventos',
      'Dicas de precificação e conservação',
      'Uso de insumos e embalagens de alta qualidade',
    ],
    schedule: [
      {
        time: '13h30',
        title: 'Recepção e café da manhã',
        description: 'Recepção dos convidados e parceiros.',
      },
      {
        time: '14h00',
        title: 'Abertura oficial',
        description: 'Apresentação do novo espaço e novidades.',
      },
      {
        time: '14h10',
        title: 'Demonstração de produtos',
        description: 'Principais lançamentos e soluções para o seu negócio.',
      },
      {
        time: '15h30',
        title: 'Parte prática',
        description: 'Mão na massa com receitas e técnicas exclusivas.',
      },
      {
        time: '17h00',
        title: 'Dúvidas e networking',
        description: 'Tire suas dúvidas com os especialistas.',
      },
      {
        time: '17h30',
        title: 'Encerramento',
        description: 'Agradecimento e sorteios de brindes.',
      },
    ],
    gallery: [
      '/assets/confeitaria/02-pagina-workshop/06-galeria-confeiteira.jpg',
      '/assets/confeitaria/02-pagina-workshop/07-galeria-brigadeiros-coloridos.jpg',
      '/assets/confeitaria/02-pagina-workshop/08-galeria-aula-pratica.jpg',
      '/assets/confeitaria/02-pagina-workshop/09-galeria-bolo-de-chocolate.jpg',
    ],
  },
  {
    id: 'workshop-confeitaria-profissional-chantilly-bicos',
    title: 'Bolos Decorados com Chantilly e Bicos',
    slug: 'workshop-confeitaria-profissional-chantilly-bicos',
    subtitle: 'Aprenda técnicas exclusivas com uma especialista e descubra como criar bolos incríveis e cheios de personalidade.',
    description:
      'Treinamento prático voltado para boleiras, confeiteiras e iniciantes. Conteúdo aborda: ponto correto e estabilização de chantilly e chantininho no calor, utilização de bicos clássicos e russos, espatulados perfeitos, estruturação de andares e técnicas de transporte seguro.',
    posterUrl: '/assets/confeitaria/01-listagem-eventos/05-card-bolo-decorado-rosa.jpg',
    heroUrl: '/assets/confeitaria/02-pagina-workshop/02-hero-doces-finos-degrade-pronto.png',
    aboutPhotoUrl: '/assets/confeitaria/02-pagina-workshop/03-foto-brigadeiros-sobre-o-evento.jpg',
    eventDateText: '03 de Outubro',
    eventWeekday: 'Sábado',
    eventTime: '17h',
    durationText: '2 horas de aula-show',
    location: 'Hangar Centro de Convenções',
    locationAddress: 'Feira Pará Trigo — Belém/PA',
    instructor: 'Thais Reis (Chef Instrutora Convidada)',
    badge: 'AULA-SHOW',
    typeBadge: 'EVENTO PRESENCIAL',
    isFree: true,
    categoryKey: 'aulas-show',
    ctaLabel: 'Confirmar Presença',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+confirmar+presen%C3%A7a+na+aula-show+Bolos+Decorados+com+Chantilly+e+Bicos',
    buttonVariant: 'red',
    status: 'ACTIVE',
    sortOrder: 2,
    whatYouWillLearn: [
      'Ponto correto e hidratação de chantininho',
      'Técnicas de bico 1M, pitanga, babados e flores',
      'Alinhamento e nivelamento com espátulas de inox',
      'Colorimetria e degradês sem manchar',
      'Dicas para bolos que suportam o clima paraense',
    ],
    schedule: [
      {
        time: '17h00',
        title: 'Boas-vindas e introdução de insumos',
        description: 'Apresentação dos tipos de chantilly e corantes adequados.',
      },
      {
        time: '17h25',
        title: 'Demonstração de ponto e batimento',
        description: 'Como atingir a textura sedosa sem porosidade.',
      },
      {
        time: '17h50',
        title: 'Técnicas de bico e aplicação ao vivo',
        description: 'Decoração prática passo a passo no bolo real.',
      },
      {
        time: '18h30',
        title: 'Espaço para dúvidas e degustação',
        description: 'Interação direta com a instrutora e corte do bolo.',
      },
    ],
    gallery: [
      '/assets/confeitaria/02-pagina-workshop/06-galeria-confeiteira.jpg',
      '/assets/confeitaria/02-pagina-workshop/07-galeria-brigadeiros-coloridos.jpg',
      '/assets/confeitaria/02-pagina-workshop/08-galeria-aula-pratica.jpg',
      '/assets/confeitaria/02-pagina-workshop/09-galeria-bolo-de-chocolate.jpg',
    ],
  },
  {
    id: 'workshop-sobremesas-na-taca-copo-da-felicidade',
    title: 'Sobremesas na Taça & Copos da Felicidade',
    slug: 'workshop-sobremesas-na-taca-copo-da-felicidade',
    subtitle: 'Montagem estratégica, cremes estruturados e apresentação irresistível para alavancar suas vendas.',
    description:
      'Domine a preparação de sobremesas geladas de alto giro e excelente margem de lucro. Aprenda cremes básicos estruturados (ninho, 4 leites, ganaches nobres), montagens em camadas nos copos bolha e taças acrílicas, com dicas de conservação e precificação comercial.',
    posterUrl: '/assets/confeitaria/01-listagem-eventos/06-card-sobremesa-na-taca.jpg',
    heroUrl: '/assets/confeitaria/02-pagina-workshop/02-hero-doces-finos-degrade-pronto.png',
    aboutPhotoUrl: '/assets/confeitaria/02-pagina-workshop/03-foto-brigadeiros-sobre-o-evento.jpg',
    eventDateText: '25 de Novembro',
    eventWeekday: 'Segunda-feira',
    eventTime: '14h às 18h',
    durationText: '4 horas de workshop',
    location: 'Centro Técnico Comercial do Norte',
    locationAddress: 'Av. Bernardo Sayão — Belém/PA',
    instructor: 'Especialista em Sobremesas Comerciais',
    badge: 'WORKSHOP',
    typeBadge: 'EVENTO PRESENCIAL',
    isFree: true,
    categoryKey: 'workshops',
    ctaLabel: 'Garantir Vaga',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+me+inscrever+no+Workshop+Sobremesas+na+Ta%C3%A7a',
    buttonVariant: 'red',
    status: 'ACTIVE',
    sortOrder: 3,
    whatYouWillLearn: [
      'Cremes base ultra aveludados e resistentes',
      'Camadas harmônicas e contraste de texturas',
      'Seleção de embalagens plásticas e taças para entrega',
      'Congelamento e validade comercial prolongada',
      'Ficha técnica de custo e margem de 100%+',
    ],
    schedule: [
      {
        time: '14h00',
        title: 'Recepção e introdução ao mercado de delivery doce',
        description: 'Visão geral das opções de maior saída no balcão.',
      },
      {
        time: '14h30',
        title: 'Preparo dos cremes estruturados',
        description: 'Técnica de cozimento e resfriamento rápido.',
      },
      {
        time: '15h45',
        title: 'Montagem prática dos copos e taças',
        description: 'Prática de montagem em camadas e finalizações com confeitos.',
      },
      {
        time: '17h15',
        title: 'Embalagem, precificação e fechamento',
        description: 'Como calcular seu preço de venda e divulgar fotos que vendem.',
      },
    ],
    gallery: [
      '/assets/confeitaria/02-pagina-workshop/06-galeria-confeiteira.jpg',
      '/assets/confeitaria/02-pagina-workshop/07-galeria-brigadeiros-coloridos.jpg',
      '/assets/confeitaria/02-pagina-workshop/08-galeria-aula-pratica.jpg',
      '/assets/confeitaria/02-pagina-workshop/09-galeria-bolo-de-chocolate.jpg',
    ],
  },
  {
    id: 'workshop-cupcakes-confeitaria-criativa',
    title: 'Cupcakes e Confeitaria Criativa para Presentear',
    slug: 'workshop-cupcakes-confeitaria-criativa',
    subtitle: 'Aprenda do zero, com técnicas práticas, decorações encantadoras e ideias para presentes e datas especiais.',
    description:
      'Aprenda do zero massas leves e úmidas, recheios trufados que encantam clientes e coberturas firmes para decorações com bicos florais. Descubra opções de embalagens individuais e caixas para presentes com alto valor percebido.',
    posterUrl: '/assets/confeitaria/01-listagem-eventos/07-card-cupcakes-rosa.jpg',
    heroUrl: '/assets/confeitaria/02-pagina-workshop/02-hero-doces-finos-degrade-pronto.png',
    aboutPhotoUrl: '/assets/confeitaria/02-pagina-workshop/03-foto-brigadeiros-sobre-o-evento.jpg',
    eventDateText: '10 de Dezembro',
    eventWeekday: 'Terça-feira',
    eventTime: '13h às 17h',
    durationText: '4 horas de aula prática',
    location: 'Auditório Gastronômico Comercial do Norte',
    locationAddress: 'Belém/PA',
    instructor: 'Chef Pâtissier Convidada',
    badge: 'AULA PRÁTICA',
    typeBadge: 'EVENTO PRESENCIAL',
    isFree: true,
    categoryKey: 'workshops',
    ctaLabel: 'Garantir Vaga',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+me+inscrever+no+Workshop+Cupcakes+e+Confeitaria+Criativa',
    buttonVariant: 'red',
    status: 'ACTIVE',
    sortOrder: 4,
    whatYouWillLearn: [
      'Massas de baunilha, chocolate e red velvet',
      'Recheios que não vazam e técnicas de injeção',
      'Decorações com bicos de folhas, rosas e pitangas',
      'Montagem de caixas para presentes de datas comemorativas',
      'Estratégias de combos para datas como Natal e Dia das Mães',
    ],
    schedule: [
      {
        time: '13h00',
        title: 'Boas-vindas e apostila técnica',
        description: 'Entrega do material e apresentação das bancadas.',
      },
      {
        time: '13h30',
        title: 'Mão na massa: assamento e pontos de cocção',
        description: 'Segredos para cupcakes nivelados e úmidos.',
      },
      {
        time: '14h45',
        title: 'Recheios e trabalho de bico',
        description: 'Prática de decorações florais e temáticas.',
      },
      {
        time: '16h15',
        title: 'Embalagens e sessão de fotos para portfólio',
        description: 'Embalando para presente e entrega de certificados.',
      },
    ],
    gallery: [
      '/assets/confeitaria/02-pagina-workshop/06-galeria-confeiteira.jpg',
      '/assets/confeitaria/02-pagina-workshop/07-galeria-brigadeiros-coloridos.jpg',
      '/assets/confeitaria/02-pagina-workshop/08-galeria-aula-pratica.jpg',
      '/assets/confeitaria/02-pagina-workshop/09-galeria-bolo-de-chocolate.jpg',
    ],
  },
];

export const GENERAL_EVENTS: EventItem[] = [
  CANONICAL_EVENTS[0], // Encontro de Empreendedores (Palestra)
  CANONICAL_EVENTS[1], // Grande Reinauguração Loja Pedreira (Reinauguração)
  CANONICAL_EVENTS[7], // Gestão e Crescimento para Pequenos Negócios (Palestra)
  {
    id: 'inauguracao-nova-loja-castanhal',
    title: 'Inauguração Oficial Nova Loja Castanhal',
    slug: 'inauguracao-nova-loja-castanhal',
    subtitle: 'Um novo espaço completo para o seu negócio',
    description:
      'Venha celebrar a inauguração da nossa nova unidade em Castanhal. Mais espaço, ofertas exclusivas e café da manhã especial para clientes e parceiros.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-02-reinauguracao.jpg',
    eventDateText: '15 de Dezembro',
    eventTime: '09h',
    location: 'Loja Castanhal',
    locationAddress: 'Rodovia BR-316 — Castanhal/PA',
    instructor: 'Equipe Comercial do Norte',
    badge: 'INAUGURAÇÃO',
    categoryKey: 'reinauguracoes',
    ctaLabel: 'Ver Como Chegar',
    ctaUrl: 'https://maps.google.com/?q=Comercial+do+Norte+Castanhal',
    buttonVariant: 'red',
    status: 'ACTIVE',
    sortOrder: 4,
  },
  {
    id: 'forum-de-varejo-e-food-service-2026',
    title: 'Fórum de Varejo & Food Service Comercial do Norte',
    slug: 'forum-de-varejo-e-food-service-2026',
    subtitle: 'Tendências, Inovação e Lucratividade',
    description:
      'Painel estratégico com líderes do setor gastronômico e supermercadista do Norte. Palestras práticas sobre gestão comercial, inovação e expansão.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-01-empreendedores.jpg',
    eventDateText: '20 de Janeiro',
    eventTime: '18h30',
    location: 'Hangar Centro de Convenções',
    locationAddress: 'Hangar Centro de Convenções — Belém/PA',
    instructor: 'Especialistas Convidados',
    badge: 'PALESTRA',
    categoryKey: 'palestras',
    ctaLabel: 'Garantir Vaga',
    ctaUrl:
      'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+me+inscrever+no+F%C3%B3rum+de+Varejo+Comercial+do+Norte',
    buttonVariant: 'blue',
    status: 'ACTIVE',
    sortOrder: 5,
  },
];

export function findAnyEventBySlug(slug: string): EventItem | null {
  const normalized = (slug || '').toLowerCase().trim();
  const allEvents = [...CANONICAL_EVENTS, ...CONFEITARIA_WORKSHOPS, ...GENERAL_EVENTS];

  const exact = allEvents.find((e) => e.slug.toLowerCase() === normalized);
  if (exact) return exact;

  const match = allEvents.find(
    (e) =>
      normalized.includes(e.slug.toLowerCase()) ||
      e.slug.toLowerCase().includes(normalized)
  );
  return match || null;
}
