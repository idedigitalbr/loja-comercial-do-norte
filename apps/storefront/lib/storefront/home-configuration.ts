import type { PageComposition } from './widget-types';

export const defaultHomeComposition: PageComposition = {
  page: 'home',
  version: 1,
  widgets: [
    {
      id: 'ml-hero-superior',
      type: 'hero-carousel',
      enabled: true,
      order: 1,
      props: {
        autoplayIntervalMs: 5000,
        showArrows: true,
        showDots: true,
        bottomGradient: true,
        slides: [
          {
            id: 'slide-ml-1',
            title: 'Semana Intelbras no seu ritmo — Até 40% OFF Aproveite',
            imageUrl: '/assets/Pagina/S1 TOPO HERO/topo-banners-ML/D_NQ_2X_977867-MLA118147004068_102026-OO.webp',
            linkUrl: '/loja',
            altText: 'Semana Intelbras no seu ritmo — Até 40% OFF Aproveite',
            backgroundColor: '#028F34',
          },
          {
            id: 'slide-ml-2',
            title: 'Super Ofertas Comercial do Norte',
            imageUrl: '/assets/Pagina/S1 TOPO HERO/topo-banners-ML/D_NQ_2X_690577-MLA118270011000_102026-OO.webp',
            linkUrl: '/loja',
            altText: 'Super Ofertas Comercial do Norte',
            backgroundColor: '#004CB1',
          },
        ],
      },
    },
    {
      id: 'hero-secundario-contido',
      type: 'contained-hero',
      enabled: true,
      order: 2,
      props: {
        autoplayIntervalMs: 6000,
        showArrows: true,
        showDots: true,
        overlapTop: true,
        slides: [
          {
            id: 'slide-cont-1',
            title: 'Super Oferta Copo Cristalcopo — Comercial do Norte',
            imageUrl: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_x5pilwx5pilwx5pi.jpg',
            linkUrl: '/loja',
            altText: 'Super Oferta Copo Cristalcopo — Comercial do Norte',
          },
          {
            id: 'slide-cont-2',
            title: 'Mega Descontos e Outlet das Embalagens — Comercial do Norte',
            imageUrl: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_k46c0pk46c0pk46c.jpg',
            linkUrl: '/loja',
            altText: 'Mega Descontos e Outlet das Embalagens',
          },
          {
            id: 'slide-cont-3',
            title: 'Verão Total Comercial do Norte — Ofertas Mais Quentes',
            imageUrl: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_k93f3kk93f3kk93f.jpg',
            linkUrl: '/loja',
            altText: 'Verão Total Comercial do Norte',
          },
          {
            id: 'slide-cont-4',
            title: 'Pará Trigo Stand Comercial do Norte — Pizzas e Panificação',
            imageUrl: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_m54tnlm54tnlm54t.jpg',
            linkUrl: '/loja',
            altText: 'Pará Trigo Stand Comercial do Norte',
          },
          {
            id: 'slide-cont-5',
            title: 'Comercial do Norte — Faltam 3 Dias Ofertas Especiais',
            imageUrl: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_nmv06jnmv06jnmv0.jpg',
            linkUrl: '/loja',
            altText: 'Comercial do Norte — Ofertas Especiais',
          },
          {
            id: 'slide-cont-6',
            title: 'Fachada Comercial do Norte — Tudo para quem faz o melhor',
            imageUrl: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_u1xlqu1xlqu1xlqu.jpg',
            linkUrl: '/sobre',
            altText: 'Fachada Comercial do Norte',
          },
        ],
      },
    },
    {
      id: 'beneficios-loja',
      type: 'benefits-bar',
      enabled: true,
      order: 3,
      props: {
        items: [
          {
            iconName: 'truck',
            title: 'Entrega em Belém e Região',
            description: 'Logística rápida para comércios e residências',
          },
          {
            iconName: 'tag',
            title: 'Menor Preço Atacado e Varejo',
            description: 'Tabela escalonada para o seu negócio economizar',
          },
          {
            iconName: 'package',
            title: 'Tudo em um Só Lugar',
            description: 'Milhares de itens em embalagens, descartáveis e festas',
          },
          {
            iconName: 'shield',
            title: 'Atendimento Próximo e Rápido',
            description: 'Cotação ágil via site ou WhatsApp da equipe',
          },
        ],
      },
    },
    {
      id: 'ofertas-do-dia',
      type: 'product-carousel',
      enabled: true,
      order: 4,
      props: {
        title: 'Ofertas em Destaque',
        subtitle: 'Preços especiais de atacado e varejo para cotação imediata',
        badge: 'OFERTAS',
        source: 'offers',
        limit: 8,
        viewAllLink: '/loja',
        showCountdown: true,
        countdownTargetHours: 24,
      },
    },
    {
      id: 'departamentos-principais',
      type: 'category-grid',
      enabled: true,
      order: 5,
      props: {
        title: 'Navegue por Departamentos',
        subtitle: 'Encontre com facilidade o que sua empresa precisa',
        viewAllLink: '/loja',
        columns: 4,
      },
    },
  ],
};
