import type { VideoArticleItem } from '@/lib/storefront/widget-types';

/**
 * Mapeamento canônico de sugestões de conteúdo "Explica Aí Nort"
 * contextualizadas por segmento de atuação.
 */
const SEGMENT_SUGGESTIONS_MAP: Record<string, VideoArticleItem[]> = {
  // Lanchonetes & Hamburguerias
  lanchonete: [
    {
      id: 'lanchonete-kraft',
      tags: ['DELIVERY', 'LINHA KRAFT'],
      title: 'Embalagens kraft para o seu delivery',
      paragraphs: [
        'Mais praticidade com embalagens kraft.',
        'Combine formato e resistência para hambúrguer e fritas.',
        'Valorize a apresentação do seu delivery.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/embalagens-kraft-para-o-seu-delivery',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
    },
    {
      id: 'lanchonete-copos',
      tags: ['AÇAÍ & CAFÉ', 'GUIA PRÁTICO'],
      title: 'Copos e tampas para açaí e café',
      paragraphs: [
        'O copo certo faz a diferença.',
        'Combine a tampa com sua bebida.',
        'Evite vazamentos no transporte.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/copos-e-tampas-para-acai-e-cafe',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
    },
    {
      id: 'lanchonete-respiros',
      tags: ['P/ DELIVERY', 'GUIA PRÁTICO'],
      title: 'Como escolher embalagens térmicas e com respiro',
      paragraphs: [
        'Dicas práticas para proteger seu lanche.',
        'Respiros para evitar que o vapor umedeça as fritas.',
        'Cuide da apresentação até a entrega final.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/caixas-de-pizza-formatos-e-respiros',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
    },
    {
      id: 'lanchonete-sobremesas',
      tags: ['SOBREMESAS', 'DICAS'],
      title: 'Sobremesas para turbinar seu cardápio de lanchonete',
      paragraphs: [
        'Aumente o ticket médio da sua lanchonete.',
        'Potes ideais para mousses, brownies e sobremesas.',
        'Proteja cada detalhe na entrega rápida.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/decoracao-de-doces-e-bolos-com-chantilly',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
    },
  ],

  // Pizzarias & Esfiharias
  pizzaria: [
    {
      id: 'pizzaria-caixas',
      tags: ['PIZZARIAS', 'TRANSPORTE SEGURO'],
      title: 'Caixas de pizza: formatos e respiros que preservam a massa',
      paragraphs: [
        'Tudo sobre caixas oitavadas e quadradas.',
        'Respiros térmicos que evitam massa borrachuda.',
        'Lacres invioláveis que transmitem segurança.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/caixas-de-pizza-formatos-e-respiros',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
    },
    {
      id: 'pizzaria-kraft',
      tags: ['DELIVERY', 'LINHA KRAFT'],
      title: 'Embalagens kraft para combos e calzones',
      paragraphs: [
        'Resistência ideal para bordas recheadas e calzones.',
        'Apresentação artesanal que valoriza seu pedido.',
        'Sacolas reforçadas para moto-entrega segura.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/embalagens-kraft-para-o-seu-delivery',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
    },
    {
      id: 'pizzaria-copos',
      tags: ['BEBIDAS', 'GUIA PRÁTICO'],
      title: 'Copos e tampas para refrigerantes e sucos',
      paragraphs: [
        'Evite vazamentos no envio de sucos e refrigerantes.',
        'Tampas com vedação reforçada contra tombamentos.',
        'Copos resistentes que conservam o gás e a temperatura.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/copos-e-tampas-para-acai-e-cafe',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
    },
    {
      id: 'pizzaria-doces',
      tags: ['PIZZAS DOCES', 'DICAS'],
      title: 'Embalagens para pizzas doces e brotinhos',
      paragraphs: [
        'Destaque suas opções doces com embalagens especiais.',
        'Proteção térmica para chocolates e coberturas.',
        'Encante seus clientes em cada fatia.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/decoracao-de-doces-e-bolos-com-chantilly',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
    },
  ],

  // Doces & Confeitaria Caseira
  'confeitaria-bolos': [
    {
      id: 'confeitaria-chantilly',
      tags: ['CONFEITARIA', 'DOCES & BOLOS'],
      title: 'Decoração de doces e bolos com chantilly profissional',
      paragraphs: [
        'Técnicas de bicos 1M e ponto chantininho.',
        'Mais estabilidade para o clima da nossa região.',
        'Embalagens altas com trava para bolos decorados.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/decoracao-de-doces-e-bolos-com-chantilly',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
    },
    {
      id: 'confeitaria-kraft',
      tags: ['DELIVERY', 'LINHA KRAFT'],
      title: 'Embalagens kraft para delivery de bolos e doces',
      paragraphs: [
        'Sacolas com fundo largo para caixas de torta.',
        'Acabamento elegante e artesanal para confeitaria.',
        'Resistência mecânica para entregas sem acidentes.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/embalagens-kraft-para-o-seu-delivery',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
    },
    {
      id: 'confeitaria-copos',
      tags: ['AÇAÍ & CAFÉ', 'GUIA PRÁTICO'],
      title: 'Copos da felicidade e sobremesas no copo',
      paragraphs: [
        'Copos bolha de alta transparência para valorizar camadas.',
        'Tampas sem furo para transporte hermético.',
        'Ideal para copos da felicidade, banoffee e mousses.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/copos-e-tampas-para-acai-e-cafe',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
    },
    {
      id: 'confeitaria-transporte',
      tags: ['LOGÍSTICA', 'CUIDADOS'],
      title: 'Segurança e estabilidade no transporte de encomendas',
      paragraphs: [
        'Caixas rígidas com base antiderrapante.',
        'Travas que impedem o deslocamento durante o trajeto.',
        'Seus bolos entregues impecáveis como na foto.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/caixas-de-pizza-formatos-e-respiros',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
    },
  ],

  // Sorveterias & Açaís
  'sorveteria-acai': [
    {
      id: 'acai-copos',
      tags: ['AÇAÍ & CAFÉ', 'GUIA PRÁTICO'],
      title: 'Copos e tampas para açaí e café',
      paragraphs: [
        'O copo certo faz toda a diferença para o seu açaí.',
        'Tampa bolha para acomodar adicionais sem amassar.',
        'Evite vazamentos e encante na apresentação.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/copos-e-tampas-para-acai-e-cafe',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
    },
    {
      id: 'acai-kraft',
      tags: ['DELIVERY', 'LINHA KRAFT'],
      title: 'Embalagens kraft para o seu delivery',
      paragraphs: [
        'Sacolas estruturadas para suportar copos e potes.',
        'Fundo reforçado que previne tombamentos.',
        'Linha completa para kits e complementos separados.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/embalagens-kraft-para-o-seu-delivery',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
    },
    {
      id: 'acai-termicos',
      tags: ['TÉRMICOS', 'QUALIDADE'],
      title: 'Conservação térmica no delivery de açaí e sorvetes',
      paragraphs: [
        'Potes térmicos para manter o gelado consistente.',
        'Lacres invioláveis para segurança máxima do cliente.',
        'Garantia de cremosidade mesmo em trajetos longos.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/caixas-de-pizza-formatos-e-respiros',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
    },
    {
      id: 'acai-sobremesas',
      tags: ['SOBREMESAS', 'DICAS'],
      title: 'Apresentação visual para sobremesas geladas',
      paragraphs: [
        'Taças e potes transparentes para destacar os cremes.',
        'Valorize as fotos do cardápio e das redes sociais.',
        'Mais variedade para enriquecer a experiência.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/decoracao-de-doces-e-bolos-com-chantilly',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
    },
  ],

  // Padarias & Confeitarias
  padaria: [
    {
      id: 'padaria-kraft',
      tags: ['DELIVERY', 'LINHA KRAFT'],
      title: 'Embalagens kraft para o seu delivery',
      paragraphs: [
        'Sacos de papel kraft para pães quentinhos e crocantes.',
        'Papel respirável que mantém a textura da casca.',
        'Sacolas resistentes para compras de balcão e delivery.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/embalagens-kraft-para-o-seu-delivery',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
    },
    {
      id: 'padaria-copos',
      tags: ['CAFÉ & BEBIDAS', 'GUIA PRÁTICO'],
      title: 'Copos e tampas para café e cappuccinos',
      paragraphs: [
        'Copos térmicos com tampa bico para viagem.',
        'Temperatura mantida do balcão até o destino.',
        'Segurança contra derramamentos e queimaduras.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/copos-e-tampas-para-acai-e-cafe',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
    },
    {
      id: 'padaria-chantilly',
      tags: ['CONFEITARIA', 'DOCES & BOLOS'],
      title: 'Decoração de doces e bolos com chantilly',
      paragraphs: [
        'Técnicas para vitrines de padaria irresistíveis.',
        'Embalagens individuais para fatias e tortas.',
        'Praticidade para o cliente levar para casa.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/decoracao-de-doces-e-bolos-com-chantilly',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
    },
    {
      id: 'padaria-salgados',
      tags: ['SALGADOS', 'DELIVERY'],
      title: 'Caixas com respiro para salgados e mini lanches',
      paragraphs: [
        'Caixas ventiladas para salgados fritos e assados.',
        'Mantém os salgadinhos secos sem acumular vapor.',
        'Ideal para kits festa e encomendas matinais.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/caixas-de-pizza-formatos-e-respiros',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
    },
  ],

  // Festas & Eventos
  'loja-de-festas': [
    {
      id: 'festas-doces',
      tags: ['FESTAS', 'DOCES & BOLOS'],
      title: 'Decoração de doces e bolos com chantilly profissional',
      paragraphs: [
        'Dicas práticas para bolos decorados de aniversário.',
        'Bases laminadas e forminhas especiais para docinhos.',
        'Valorize cada detalhe da mesa de comemoração.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/decoracao-de-doces-e-bolos-com-chantilly',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
    },
    {
      id: 'festas-copos',
      tags: ['EVENTOS', 'GUIA PRÁTICO'],
      title: 'Copos e descartáveis para festas e eventos',
      paragraphs: [
        'Copos, pratos e talheres de alta resistência e elegância.',
        'Opções transparentes e coloridas para todas as ocasiões.',
        'Mais economia e praticidade na organização da festa.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/copos-e-tampas-para-acai-e-cafe',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
    },
    {
      id: 'festas-kraft',
      tags: ['LEMBRANCINHAS', 'LINHA KRAFT'],
      title: 'Embalagens kraft para lembrancinhas e encomendas',
      paragraphs: [
        'Sacolas versáteis para personalizar com laços e tags.',
        'Acabamento sofisticado que encanta convidados.',
        'Ideal para doces personalizados e lembranças de evento.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/embalagens-kraft-para-o-seu-delivery',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
    },
    {
      id: 'festas-caixas',
      tags: ['LOGÍSTICA', 'TRANSPORTE'],
      title: 'Caixas seguras para transporte de kits festa',
      paragraphs: [
        'Caixas reforçadas para transportar doces e salgados.',
        'Proteção contra amassados até a chegada ao local.',
        'Empilhamento seguro para entregas de buffet e festas.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/caixas-de-pizza-formatos-e-respiros',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
    },
  ],

  // Restaurantes & Buffets
  'restaurante-buffet': [
    {
      id: 'buffet-kraft',
      tags: ['DELIVERY', 'LINHA KRAFT'],
      title: 'Embalagens kraft para o seu delivery',
      paragraphs: [
        'Apresentação executiva e sustentável para marmitas.',
        'Barcas e caixas térmicas com barreira antigordura.',
        'Valorize seu restaurante com design premium.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/embalagens-kraft-para-o-seu-delivery',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
    },
    {
      id: 'buffet-copos',
      tags: ['BEBIDAS & CALDOS', 'GUIA PRÁTICO'],
      title: 'Copos e tampas para sucos naturais e caldos',
      paragraphs: [
        'Fechamento estanque contra vazamento de sopas e caldos.',
        'Copos com tampa bico para cafés e chás pós-refeição.',
        'Praticidade no buffet e rapidez no atendimento.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/copos-e-tampas-para-acai-e-cafe',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
    },
    {
      id: 'buffet-vedacao',
      tags: ['TRANSPORTE', 'QUALIDADE'],
      title: 'Vedação térmica para transporte de refeições',
      paragraphs: [
        'Dicas para manter o prato na temperatura correta.',
        'Lacres de garantia para entrega inviolável.',
        'Seus clientes recebem a comida como saída da cozinha.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/caixas-de-pizza-formatos-e-respiros',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
    },
    {
      id: 'buffet-sobremesas',
      tags: ['SOBREMESAS', 'DICAS'],
      title: 'Sobremesas individuais para combos executivos',
      paragraphs: [
        'Potes ideais para sobremesas e pudins no delivery.',
        'Aumento significativo no ticket médio do almoço.',
        'Higiene e praticidade na montagem das marmitas.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/decoracao-de-doces-e-bolos-com-chantilly',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
    },
  ],

  // Bares & Distribuidoras
  'bar-distribuidora': [
    {
      id: 'bar-copos',
      tags: ['BEBIDAS', 'GUIA PRÁTICO'],
      title: 'Copos e tampas para drinks, chopp e bebidas',
      paragraphs: [
        'Copos ultra transparentes para destacar coquetéis.',
        'Tampas vedadas para delivery seguro de drinks e batidas.',
        'Agilidade e resistência nos horários de pico.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/copos-e-tampas-para-acai-e-cafe',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
    },
    {
      id: 'bar-kraft',
      tags: ['PETISCOS', 'LINHA KRAFT'],
      title: 'Embalagens kraft para porções e petiscos de bar',
      paragraphs: [
        'Caixas e barcas para batata frita, pasteis e petiscos.',
        'Barreira antigordura que mantém tudo sequinho.',
        'Apresentação moderna que agrada o público do bar.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/embalagens-kraft-para-o-seu-delivery',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
    },
    {
      id: 'bar-distribuidora-caixas',
      tags: ['DISTRIBUIDORA', 'LOGÍSTICA'],
      title: 'Lacres e sacolas reforçadas para distribuidoras',
      paragraphs: [
        'Sacolas de alta resistência para latas e garrafas.',
        'Lacres de segurança para delivery noturno.',
        'Segurança para a carga e rapidez para o entregador.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/caixas-de-pizza-formatos-e-respiros',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
    },
    {
      id: 'bar-acessorios',
      tags: ['UTENSÍLIOS', 'DICAS'],
      title: 'Acessórios e descartáveis para o atendimento',
      paragraphs: [
        'Canudos ecológicos, guardanapos e mexedores.',
        'Higiene e sofisticação no serviço de mesa e balcão.',
        'Experiência completa para fidelizar seus clientes.',
      ],
      ctaLabel: 'Ver Completo',
      ctaUrl: '/post/decoracao-de-doces-e-bolos-com-chantilly',
      imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
    },
  ],
};

// Aliases para suportar variações comuns de slug
SEGMENT_SUGGESTIONS_MAP['festas'] = SEGMENT_SUGGESTIONS_MAP['loja-de-festas'];
SEGMENT_SUGGESTIONS_MAP['confeitaria'] = SEGMENT_SUGGESTIONS_MAP['confeitaria-bolos'];
SEGMENT_SUGGESTIONS_MAP['acai'] = SEGMENT_SUGGESTIONS_MAP['sorveteria-acai'];
SEGMENT_SUGGESTIONS_MAP['buffet'] = SEGMENT_SUGGESTIONS_MAP['restaurante-buffet'];
SEGMENT_SUGGESTIONS_MAP['bar'] = SEGMENT_SUGGESTIONS_MAP['bar-distribuidora'];

const DEFAULT_SEGMENT_SUGGESTIONS: VideoArticleItem[] = [
  {
    id: 'default-kraft',
    tags: ['DELIVERY', 'LINHA KRAFT'],
    title: 'Embalagens kraft para o seu delivery',
    paragraphs: [
      'Mais praticidade com embalagens kraft.',
      'Combine formato e resistência.',
      'Valorize a apresentação do seu delivery.',
    ],
    ctaLabel: 'Ver Completo',
    ctaUrl: '/post/embalagens-kraft-para-o-seu-delivery',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
  },
  {
    id: 'default-copos',
    tags: ['AÇAÍ & CAFÉ', 'GUIA PRÁTICO'],
    title: 'Copos e tampas para açaí e café',
    paragraphs: [
      'O copo certo faz a diferença.',
      'Combine a tampa com sua bebida.',
      'Evite vazamentos no transporte.',
    ],
    ctaLabel: 'Ver Completo',
    ctaUrl: '/post/copos-e-tampas-para-acai-e-cafe',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
  },
  {
    id: 'default-pizza',
    tags: ['P/ DELIVERY', 'GUIA PRÁTICO'],
    title: 'Como escolher a caixa de pizza certa',
    paragraphs: [
      'Dicas práticas para proteger melhor o seu delivery.',
      'Escolha o tamanho certo para sua pizza.',
      'Cuide da apresentação até a entrega.',
    ],
    ctaLabel: 'Ver Completo',
    ctaUrl: '/post/caixas-de-pizza-formatos-e-respiros',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
  },
  {
    id: 'default-doces',
    tags: ['CONFEITARIA', 'DICAS'],
    title: 'Embalagens para valorizar seus doces',
    paragraphs: [
      'Deixe seus doces em destaque.',
      'Escolha caixas com visor e divisórias.',
      'Proteja cada detalhe na entrega.',
    ],
    ctaLabel: 'Ver Completo',
    ctaUrl: '/post/decoracao-de-doces-e-bolos-com-chantilly',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
  },
];

/**
 * Retorna os itens de vídeo/artigo sugeridos para um determinado segmento.
 */
export function getSegmentContentSuggestions(slug?: string): VideoArticleItem[] {
  if (!slug) return DEFAULT_SEGMENT_SUGGESTIONS;
  const normalized = slug.trim().toLowerCase();
  return SEGMENT_SUGGESTIONS_MAP[normalized] ?? DEFAULT_SEGMENT_SUGGESTIONS;
}
