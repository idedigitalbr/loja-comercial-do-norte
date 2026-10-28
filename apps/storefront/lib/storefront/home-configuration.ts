import type { PageComposition } from "./widget-types";

/**
 * Configuração padrão completa da Homepage do Comercial do Norte (18 seções de widgets + Rodapé S20).
 * Reconstruída em fidelidade 1:1 com REFERENCIA/site-final.jpg e REFERENCIA/wireframe.png.
 */
export const defaultHomeComposition: PageComposition = {
  page: "home",
  version: 6,
  widgets: [
    // 01 — SEÇÃO CARROSSEL LARGURA TOTAL (HERO FULL-WIDTH)
    {
      id: "s01-hero-full-width",
      type: "hero-carousel",
      enabled: true,
      order: 1,
      props: {
        autoplayIntervalMs: 5500,
        showArrows: true,
        showDots: true,
        bottomGradient: false,
        slides: [
          {
            id: "slide-festa-main",
            title: "A Festa Começa Aqui — Detalhes que Fazem a Diferença",
            imageUrl:
              "/assets/HOME Vitrine/S1-TOPO-HERO-largura-total/s1-topo (1).webp",
            linkUrl: "",
            altText: "A Festa Começa Aqui — Comercial do Norte",
            backgroundColor: "#E2091E",
          },
          {
            id: "slide-topo-2",
            title: "Embalagens para Delivery, Pizzarias e Restaurantes",
            imageUrl:
              "/assets/HOME Vitrine/S1-TOPO-HERO-largura-total/s1-topo (2).webp",
            linkUrl: "",
            altText:
              "Embalagens para Delivery e Alimentação no Comercial do Norte",
            backgroundColor: "#004CB1",
          },
          {
            id: "slide-topo-3",
            title: "Artigos para Festas, Confeitaria e Eventos",
            imageUrl:
              "/assets/HOME Vitrine/S1-TOPO-HERO-largura-total/s1-topo (3x).webp",
            linkUrl: "",
            altText: "Artigos de Festa e Confeitaria Comercial do Norte",
            backgroundColor: "#00357B",
          },
          {
            id: "slide-topo-4",
            title: "Descartáveis no Atacado — Fardos Fechados com Menor Preço",
            imageUrl:
              "/assets/HOME Vitrine/S1-TOPO-HERO-largura-total/s1-topo (4).webp",
            linkUrl: "",
            altText: "Descartáveis no Atacado no Comercial do Norte",
            backgroundColor: "#002B66",
          },
          {
            id: "slide-topo-5",
            title: "Limpeza Profissional e Higienização Comercial",
            imageUrl:
              "/assets/HOME Vitrine/S1-TOPO-HERO-largura-total/s1-topo (5).webp",
            linkUrl: "",
            altText: "Limpeza e Higienização no Comercial do Norte",
            backgroundColor: "#004CB1",
          },
        ],
      },
    },

    // 02 — SEÇÃO CARROSSEL PADRÃO CONTIDO (SEMANA DO FEIRANTE)
    {
      id: "s02-contained-hero",
      type: "contained-hero",
      enabled: true,
      order: 2,
      props: {
        autoplayIntervalMs: 6000,
        showArrows: true,
        showDots: true,
        overlapTop: false,
        slides: [
          {
            id: "contained-slide-feirante",
            title: "Semana do Feirante — Copo Descartável 180ml Cristalcopo",
            imageUrl:
              "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_k93f3kk93f3kk93f.jpg",
            linkUrl: "",
            altText:
              "Semana do Feirante Comercial do Norte — Copo Descartável 180ml Cristalcopo",
          },
          {
            id: "contained-slide-para-trigo",
            title: "Para Trigo 2026 — Domingo das 14h às 16h",
            imageUrl:
              "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_m54tnlm54tnlm54t.jpg",
            linkUrl: "",
            altText: "Para Trigo 2026 Domingo 14h às 16h Comercial do Norte",
          },
          {
            id: "contained-slide-outlet",
            title: "Mega Outlet de Embalagens e Descartáveis",
            imageUrl:
              "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_k46c0pk46c0pk46c.jpg",
            linkUrl: "",
            altText: "Mega Outlet Comercial do Norte",
          },
          {
            id: "contained-slide-kraft",
            title: "Linha Kraft & Embalagens Sustentáveis para Delivery",
            imageUrl:
              "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_nmv06jnmv06jnmv0.jpg",
            linkUrl: "",
            altText: "Linha Kraft e Embalagens Sustentáveis Comercial do Norte",
          },
          {
            id: "contained-slide-luvas",
            title: "Higiene e Proteção — Luvas e Descartáveis",
            imageUrl:
              "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_x5pilwx5pilwx5pi.jpg",
            linkUrl: "",
            altText: "Semana do Feirante Luvas Nitrílicas Comercial do Norte",
          },
          {
            id: "contained-slide-relampago",
            title: "Últimas 24 Horas de Ofertas Especiais",
            imageUrl:
              "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_yr0ncxyr0ncxyr0n (1).jpg",
            linkUrl: "",
            altText: "Ofertas Relâmpago 24h Comercial do Norte",
          },
          {
            id: "contained-slide-lojas",
            title: "Visite Nossas Lojas Físicas — Bernardo Sayão e Jurunas",
            imageUrl:
              "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_u1xlqu1xlqu1xlqu.jpg",
            linkUrl: "",
            altText: "Fachada Comercial do Norte — Belém PA",
          },
        ],
      },
    },

    // 03 — SEÇÃO ÍCONES DE CATEGORIAS (8 ATALHOS)
    {
      id: "s03-category-icons-bar",
      type: "category-grid",
      enabled: true,
      order: 3,
      props: {
        variant: "icons-bar",
        title: "Categorias em Destaque",
        columns: 7,
        maxItems: 7,
        customItems: [
          {
            id: 'cat-ofertas',
            label: 'Ofertas do Dia',
            imageUrl:
              '/assets/HOME Vitrine/S3-CARDS-Categorias/3d/01-ofertas-do-dia.png',
            linkUrl: '/loja?oferta=1',
          },
          {
            id: 'cat-embalagens',
            label: 'Embalagens',
            imageUrl:
              '/assets/HOME Vitrine/S3-CARDS-Categorias/3d/02-embalagens.png',
            linkUrl: "",
          },
          {
            id: 'cat-descartaveis',
            label: 'Descartáveis',
            imageUrl:
              '/assets/HOME Vitrine/S3-CARDS-Categorias/3d/03-descartaveis.png',
            linkUrl: "",
          },
          {
            id: 'cat-artigos-festa',
            label: 'Artigos para Festa',
            imageUrl:
              '/assets/HOME Vitrine/S3-CARDS-Categorias/3d/04-artigos-para-festa.png',
            linkUrl: '/categoria/artigos-festa',
          },
          {
            id: 'cat-confeitaria',
            label: 'Doces e Confeitaria',
            imageUrl:
              '/assets/HOME Vitrine/S3-CARDS-Categorias/3d/05-doces-e-confeitaria.png',
            linkUrl: "",
          },
          {
            id: 'cat-limpeza',
            label: 'Limpeza Profissional',
            imageUrl:
              '/assets/HOME Vitrine/S3-CARDS-Categorias/3d/06-limpeza-profissional.png',
            linkUrl: "",
          },
          {
            id: 'cat-mais-vendidos',
            label: 'Mais Vendidos',
            imageUrl:
              '/assets/HOME Vitrine/S3-CARDS-Categorias/3d/07-mais-vendidos.png',
            linkUrl: '/loja?ordem=mais_vendidos',
          },
        ],
      },
    },

    // 04 — SEÇÃO CARROSSEL DE PRODUTOS EM DESTAQUE (BANNER VERTICAL + 3 PRODUTOS EM PROMOÇÃO)
    {
      id: "s04-split-offers-carousel",
      type: "product-carousel",
      enabled: true,
      order: 4,
      props: {
        variant: "split-banner",
        title: "Produtos em Promoção",
        source: "offers",
        limit: 3,
        viewAllLink: "/loja?oferta=1",
        sideBanner: {
          title: "Ofertas",
          subtitle: "Mês de Outubro",
          tag: "Semana do Feirante",
          imageUrl:
            "/assets/HOME Vitrine/S4-CARD-ESQ-Promocional/S4-CARD-ESQ-Promocional.webp",
          linkUrl: "/loja?oferta=1",
          altText: "Semana do Feirante — Luva Nitrílica Comercial do Norte",
        },
      },
    },

    // 05 — SEÇÃO BANNERS TRIPLOS 01 (LIMPEZA, SEMANA DO FEIRANTE, SACOS E SACOLAS)
    {
      id: "s05-triple-banners-1",
      type: "banner-grid",
      enabled: true,
      order: 5,
      props: {
        columns: 3,
        banners: [
          {
            id: "s05-b1",
            title: "Produtos de Limpeza até 30% OFF",
            imageUrl:
              "/assets/HOME Vitrine/S5-MINICARDS-Carrossel/1-mini-card-azul.png.webp",
            linkUrl: "",
            altText: "Produtos de Limpeza até 30% OFF no Comercial do Norte",
          },
          {
            id: "s05-b2",
            title: "Semana do Feirante — Luva Nitrílica",
            imageUrl:
              "/assets/HOME Vitrine/S5-MINICARDS-Carrossel/2-mini-card-red.png.webp",
            linkUrl: "",
            altText: "Semana do Feirante Luva Nitrílica Comercial do Norte",
          },
          {
            id: "s05-b3",
            title: "Sacos e Sacolas até 25% OFF",
            imageUrl:
              "/assets/HOME Vitrine/S5-MINICARDS-Carrossel/3-mini-card-azul-.png.webp",
            linkUrl: "",
            altText: "Sacos e Sacolas até 25% OFF Comercial do Norte",
          },
          {
            id: "s05-b4",
            title: "Confeitaria e Doces até 20% OFF",
            imageUrl:
              "/assets/HOME Vitrine/S5-MINICARDS-Carrossel/4-mini-card-azul.png.webp",
            linkUrl: "",
            altText: "Confeitaria e Doces até 20% OFF no Comercial do Norte",
          },
          {
            id: "s05-b5",
            title: "Embalagens para Marmitas e Delivery",
            imageUrl:
              "/assets/HOME Vitrine/S11-MINICARDS-Carrossel/5-mini-ard-azul.png.webp",
            linkUrl: "",
            altText:
              "Embalagens para Marmitas e Delivery no Comercial do Norte",
          },
          {
            id: "s05-b6",
            title: "Copos e Pratos Descartáveis no Atacado",
            imageUrl:
              "/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_k93f3kk93f3kk93f.jpg",
            linkUrl: "",
            altText: "Copos e Pratos Descartáveis no Comercial do Norte",
          },
        ],
      },
    },

    // 06 — SEÇÃO CARROSSEL DE PRODUTOS (MAIS VENDIDOS - 5 COLUNAS)
    {
      id: "s06-mais-vendidos",
      type: "product-carousel",
      enabled: true,
      order: 6,
      props: {
        variant: "standard-5col",
        title: "Mais vendidos",
        source: "featured",
        limit: 5,
        viewAllLink: "/loja",
      },
    },

    // 08 — SEÇÃO CARROSSEL DE CARDS FUNDO ESCURO (TUDO PARA TODOS OS NEGÓCIOS / SEGMENTOS)
    {
      id: "s08-segmentos-negocios",
      type: "segments-carousel",
      enabled: true,
      order: 7,
      props: {
        title: "Para todos os Negócios",
        subtitle: "De todos os tamanhos",
        ctaLabel: "Ver todos os segmentos",
        ctaUrl: "/segmentos",
        items: [
          {
            id: "seg-lanchonete",
            prefix: "Para sua",
            title: "Lanchonete",
            description:
              "Embalagens térmicas, sacolas, guardanapos, copos e descartáveis para atendimento rápido.",
            iconType: "burger",
            imageUrl:
              "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-01-lanchonete.jpg",
            linkUrl: "/segmento/lanchonete",
          },
          {
            id: "seg-pizzaria",
            prefix: "Para sua",
            title: "Pizzaria",
            description:
              "Caixas oitavadas e quadradas, lacres, bobinas, sacolas e insumos para delivery seguro.",
            iconType: "pizza",
            imageUrl:
              "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-02-pizzaria.jpg",
            linkUrl: "/segmento/pizzaria",
          },
          {
            id: "seg-padaria",
            prefix: "Para sua",
            title: "Padaria",
            description:
              "Bandejas, embalagens para doces e bolos, filme PVC, sacos de papel e luvas descartáveis.",
            iconType: "bakery",
            imageUrl:
              "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-03-padaria.jpg",
            linkUrl: "/segmento/padaria",
          },
          {
            id: "seg-festas",
            prefix: "Para sua",
            title: "Loja de Festas",
            description:
              "Balões, descartáveis coloridos, velas, forminhas e utilidades com preço de atacado.",
            iconType: "party",
            imageUrl:
              "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-04-festas.jpg",
            linkUrl: "",
          },
          {
            id: "seg-buffet",
            prefix: "Para seu",
            title: "Restaurante & Buffet",
            description:
              "Marmitas térmicas, travessas de alumínio, talheres descartáveis premium e guardanapos folha dupla.",
            iconType: "buffet",
            imageUrl:
              "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-05-buffet.jpg",
            linkUrl: "/segmento/restaurante-buffet",
          },
          {
            id: "seg-confeitaria",
            prefix: "Para sua",
            title: "Confeitaria & Bolos",
            description:
              "Bases para bolos, caixas vitrine, forminhas para doces finos, mangas e bicos de confeitar.",
            iconType: "confectionery",
            imageUrl:
              "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-06-confeitaria.jpg",
            linkUrl: "",
          },
          {
            id: "seg-sorveteria",
            prefix: "Para sua",
            title: "Sorveteria & Açaí",
            description:
              "Potes térmicos, copos transparentes com tampa bolha, colheres coloridas e canudos biodegradáveis.",
            iconType: "icecream",
            imageUrl:
              "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-07-acai.jpg",
            linkUrl: "/segmento/sorveteria-acai",
          },
          {
            id: "seg-bar",
            prefix: "Para seu",
            title: "Bar & Distribuidora",
            description:
              "Copos chopp e cerveja descartáveis, petisqueiras, guardanapos de balcão e sacolas reforçadas.",
            iconType: "bar",
            imageUrl:
              "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-08-sustentaveis.jpg",
            linkUrl: "/segmento/bar-distribuidora",
          },
        ],
      },
    },

    // 09 — SEÇÃO BANNER HORIZONTAL (FAIXA OFERTAS IMPERDÍVEIS)
    {
      id: "s09-faixa-ofertas-imperdiveis",
      type: "promo-strip",
      enabled: true,
      order: 8,
      props: {
        variant: "offers-strip",
        highlightText: "OFERTAS IMPERDÍVEIS",
        title: "em embalagens, descartáveis e utilidades",
        imageUrl:
          "/assets/HOME Vitrine/S9-BANNERZINHO-Promo/S9-BANNERZINHO-Promo.webp",
        ctaUrl: "",
        altText: "OFERTAS IMPERDÍVEIS em embalagens, descartáveis e utilidades",
      },
    },

    // 10 — SEÇÃO CARROSSEL DE PRODUTOS (PARA VOCÊ - 5 COLUNAS)
    {
      id: "s10-para-voce-1",
      type: "product-carousel",
      enabled: true,
      order: 9,
      props: {
        variant: "standard-5col",
        title: "Para você",
        source: "recent",
        limit: 5,
        viewAllLink: "/loja",
      },
    },

    // 11 — SEÇÃO BANNERS TRIPLOS 02 (HAMBURGUEIRA, LUVA VERMELHO, LUVA AZUL)
    {
      id: "s11-triple-banners-2",
      type: "banner-grid",
      enabled: true,
      order: 10,
      props: {
        columns: 3,
        banners: [
          {
            id: "s11-b1",
            title: "Semana do Feirante — Hamburgueira Isopor",
            imageUrl:
              "/assets/HOME Vitrine/S11-MINICARDS-Carrossel/5-mini-ard-azul.png.webp",
            linkUrl: "",
            altText: "Semana do Feirante Hamburgueira Isopor R$ 85,95",
          },
          {
            id: "s11-b2",
            title: "Semana do Feirante — Luva Nitrílica Vermelho",
            imageUrl:
              "/assets/HOME Vitrine/S11-MINICARDS-Carrossel/6-mini-card-red.png.webp",
            linkUrl: "",
            altText: "Semana do Feirante Luva Nitrílica R$ 27,10",
          },
          {
            id: "s11-b3",
            title: "Semana do Feirante — Luva Nitrílica Azul",
            imageUrl:
              "/assets/HOME Vitrine/S11-MINICARDS-Carrossel/7-mini-card-azul.png.webp",
            linkUrl: "",
            altText: "Semana do Feirante Luva Nitrílica Azul R$ 27,10",
          },
          {
            id: "s11-b4",
            title: "Filme PVC e Bobinas Térmicas",
            imageUrl:
              "/assets/HOME Vitrine/S5-MINICARDS-Carrossel/1-mini-card-azul.png.webp",
            linkUrl: "",
            altText: "Filme PVC e Bobinas Térmicas no Comercial do Norte",
          },
          {
            id: "s11-b5",
            title: "Papel Toalha Interfolhado e Higiene",
            imageUrl:
              "/assets/HOME Vitrine/S5-MINICARDS-Carrossel/4-mini-card-azul.png.webp",
            linkUrl: "",
            altText: "Papel Toalha e Higiene Profissional Comercial do Norte",
          },
          {
            id: "s11-b6",
            title: "Sacolas Kraft Reforçadas para Delivery",
            imageUrl:
              "/assets/HOME Vitrine/S5-MINICARDS-Carrossel/3-mini-card-azul-.png.webp",
            linkUrl: "",
            altText: "Sacolas Kraft Reforçadas Comercial do Norte",
          },
        ],
      },
    },

    // 12 — SEÇÃO CARROSSEL DE VÍDEOS VERTICAL (NOSSOS EVENTOS)
    {
      id: "s12-nossos-eventos",
      type: "events-carousel",
      enabled: true,
      order: 11,
      props: {
        title: "Nossos Eventos",
        subtitle: "Tudo que acontece no Comercial do Norte",
        ctaLabel: "Ver todos os eventos",
        ctaUrl: "",
        items: [
          {
            id: "ev-1",
            title: "Encontro de Empreendedores — James Holanda",
            imageUrl:
              "/assets/HOME Vitrine/S12-EVENTOS/s12-event-01-empreendedores.jpg",
            linkUrl: "",
          },
          {
            id: "ev-2",
            title: "Grande Reinauguração Loja Pedreira",
            imageUrl:
              "/assets/HOME Vitrine/S12-EVENTOS/s12-event-02-reinauguracao.jpg",
            linkUrl: "",
          },
          {
            id: "ev-3",
            title:
              "Workshop de Confeitaria Profissional — Decoração com Chantilly e Bicos",
            imageUrl:
              "/assets/HOME Vitrine/S12-EVENTOS/s12-event-03-workshop-confeitaria.jpg",
            linkUrl: "",
          },
          {
            id: "ev-4",
            title: "Sábado Croquete de Charque — Pará Trigo 2026",
            imageUrl:
              "/assets/HOME Vitrine/S12-EVENTOS/s12-event-04-croquete.jpg",
            linkUrl: "",
          },
          {
            id: "ev-5",
            title: "Encontro de Empreendedores — James Holanda",
            imageUrl:
              "/assets/HOME Vitrine/S12-EVENTOS/s12-event-01-empreendedores.jpg",
            linkUrl: "",
          },
          {
            id: "ev-6",
            title: "Grande Reinauguração Loja Pedreira",
            imageUrl:
              "/assets/HOME Vitrine/S12-EVENTOS/s12-event-02-reinauguracao.jpg",
            linkUrl: "",
          },
          {
            id: "ev-7",
            title:
              "Workshop de Confeitaria Profissional — Decoração com Chantilly e Bicos",
            imageUrl:
              "/assets/HOME Vitrine/S12-EVENTOS/s12-event-03-workshop-confeitaria.jpg",
            linkUrl: "",
          },
          {
            id: "ev-8",
            title: "Sábado Croquete de Charque — Pará Trigo 2026",
            imageUrl:
              "/assets/HOME Vitrine/S12-EVENTOS/s12-event-04-croquete.jpg",
            linkUrl: "",
          },
        ],
      },
    },

    // 14 — SEÇÃO CARROSSEL DE PRODUTOS (PARA VOCÊ - 5 COLUNAS)
    {
      id: "s14-para-voce-2",
      type: "product-carousel",
      enabled: true,
      order: 12,
      props: {
        variant: "standard-5col",
        title: "Para você",
        source: "featured",
        limit: 5,
        viewAllLink: "/loja",
      },
    },

    // 15 — SEÇÃO CARROSSEL DE VÍDEOS HORIZONTAL (EXPLICA AÍ NORT)
    {
      id: "s15-explica-ai-comercial",
      type: "video-articles-carousel",
      enabled: true,
      order: 13,
      props: {
        title: "Explica Aí Nort",
        subtitle: "Dicas em vídeos e artigos para você usar no seu negócio.",
        viewAllLabel: "Ver todos",
        viewAllUrl: "/post",
        mascotImageUrl: "/assets/HOME Vitrine/S14-POSTS-ExplicaAi/S14-Boneco3D-explica-ai-nort-trimmed.webp",
        bgImageUrl: "/assets/HOME Vitrine/S14-POSTS-ExplicaAi/S14-bg-fundo-vermelho-geometrico-abstrato-hd.png",
        items: [
          {
            id: "vid-2",
            tags: ["DELIVERY", "LINHA KRAFT"],
            title: "Embalagens kraft para o seu delivery",
            paragraphs: [
              "Mais praticidade com embalagens kraft.",
              "Combine formato e resistência.",
              "Valorize a apresentação do seu delivery.",
            ],
            ctaLabel: "Ver Completo",
            ctaUrl: "/post/embalagens-kraft-para-o-seu-delivery",
            imageUrl: "/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp",
          },
          {
            id: "vid-3",
            tags: ["AÇAÍ & CAFÉ", "GUIA PRÁTICO"],
            title: "Copos e tampas para açaí e café",
            paragraphs: [
              "O copo certo faz a diferença.",
              "Combine a tampa com sua bebida.",
              "Evite vazamentos no transporte.",
            ],
            ctaLabel: "Ver Completo",
            ctaUrl: "/post/copos-e-tampas-para-acai-e-cafe",
            imageUrl: "/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp",
          },
          {
            id: "vid-1",
            tags: ["P/ DELIVERY", "GUIA PRÁTICO"],
            title: "Como escolher a caixa de pizza certa",
            paragraphs: [
              "Dicas práticas para proteger melhor o seu delivery.",
              "Escolha o tamanho certo para sua pizza.",
              "Cuide da apresentação até a entrega.",
            ],
            ctaLabel: "Ver Completo",
            ctaUrl: "/post/caixas-de-pizza-formatos-e-respiros",
            imageUrl: "/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp",
          },
          {
            id: "vid-4",
            tags: ["CONFEITARIA", "DICAS"],
            title: "Embalagens para valorizar seus doces",
            paragraphs: [
              "Deixe seus doces em destaque.",
              "Escolha caixas com visor e divisórias.",
              "Proteja cada detalhe na entrega.",
            ],
            ctaLabel: "Ver Completo",
            ctaUrl: "/categoria/confeitaria",
            imageUrl: "/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp",
          },
        ],
      },
    },

    // 16 — SEÇÃO CARROSSEL DE CARDS COMPACTOS (A LOJA NO INSTAGRAM)
    {
      id: "s16-instagram-feed",
      type: "instagram-feed",
      enabled: true,
      order: 14,
      props: {
        title: "A Loja no Instagram",
        subtitle:
          "Acompanhe bastidores, lançamentos e ações especiais nas nossas lojas físicas",
        handleLabel: "@comercialdonorte",
        handleUrl: "https://www.instagram.com/comercialdonorte",
        items: [
          {
            id: "ig-1",
            label: "Dia do Cliente",
            imageUrl:
              "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-01-dia-cliente.jpg",
            linkUrl: "https://www.instagram.com/comercialdonorte",
          },
          {
            id: "ig-2",
            label: "No Balcão",
            imageUrl:
              "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-02-no-balcao.jpg",
            linkUrl: "https://www.instagram.com/comercialdonorte",
          },
          {
            id: "ig-3",
            label: "14 Anos de Loja",
            imageUrl:
              "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-03-14-anos.jpg",
            linkUrl: "https://www.instagram.com/comercialdonorte",
          },
          {
            id: "ig-4",
            label: "Nossa Equipe",
            imageUrl:
              "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-04-equipe.jpg",
            linkUrl: "https://www.instagram.com/comercialdonorte",
          },
          {
            id: "ig-5",
            label: "Promoções",
            imageUrl:
              "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-05-promocoes.jpg",
            linkUrl: "https://www.instagram.com/comercialdonorte",
          },
          {
            id: "ig-6",
            label: "Vale-Compras",
            imageUrl:
              "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-06-vale-compras.jpg",
            linkUrl: "https://www.instagram.com/comercialdonorte",
          },
          {
            id: "ig-7",
            label: "Dia do Cliente",
            imageUrl:
              "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-01-dia-cliente.jpg",
            linkUrl: "https://www.instagram.com/comercialdonorte",
          },
          {
            id: "ig-8",
            label: "No Balcão",
            imageUrl:
              "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-02-no-balcao.jpg",
            linkUrl: "https://www.instagram.com/comercialdonorte",
          },
          {
            id: "ig-9",
            label: "14 Anos de Loja",
            imageUrl:
              "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-03-14-anos.jpg",
            linkUrl: "https://www.instagram.com/comercialdonorte",
          },
          {
            id: "ig-10",
            label: "Nossa Equipe",
            imageUrl:
              "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-04-equipe.jpg",
            linkUrl: "https://www.instagram.com/comercialdonorte",
          },
          {
            id: "ig-11",
            label: "Promoções",
            imageUrl:
              "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-05-promocoes.jpg",
            linkUrl: "https://www.instagram.com/comercialdonorte",
          },
          {
            id: "ig-12",
            label: "Vale-Compras",
            imageUrl:
              "/assets/HOME Vitrine/S15-INSTAGRAM/s16-insta-06-vale-compras.jpg",
            linkUrl: "https://www.instagram.com/comercialdonorte",
          },
        ],
      },
    },

    // 18 — SEÇÃO AVALIAÇÕES E DEPOIMENTOS (AVALIAÇÕES NO GOOGLE - 10 CARDS)
    {
      id: "s18-avaliacoes-google",
      type: "testimonials-grid",
      enabled: true,
      order: 15,
      props: {
        eyebrow: "AVALIAÇÕES NO GOOGLE",
        title: "O que nossos clientes dizem no Google.",
        ratingSummary: "Classificação 4.8 de 5.0 estrelas",
        totalReviewsLabel: "Um bloco com mais de 2 mil avaliações",
        items: [
          {
            id: "rev-1",
            authorName: "Carlos Eduardo",
            authorHandle: "14 avaliações",
            timeAgo: "1 mês atrás",
            avatarInitials: "CE",
            avatarColor: "#004CB1",
            rating: 5,
            text: "Excelente variedade de caixas de pizza e descartáveis. Preço imbatível no atacado em Belém e entrega super rápida.",
          },
          {
            id: "rev-2",
            authorName: "Fernanda Souza",
            authorHandle: "8 avaliações",
            timeAgo: "2 semanas atrás",
            avatarInitials: "FS",
            avatarColor: "#E2091E",
            rating: 5,
            text: "Sempre compro todas as embalagens para doces e bolos no Comercial do Norte. Atendimento nota 10 pelo WhatsApp!",
          },
          {
            id: "rev-3",
            authorName: "Roberto Mendes",
            authorHandle: "22 avaliações",
            timeAgo: "1 mês atrás",
            avatarInitials: "RM",
            avatarColor: "#00357B",
            rating: 5,
            text: "Os preços por fardo compensam muito para quem tem comércio. A retirada na Bernardo Sayão é muito prática.",
          },
          {
            id: "rev-4",
            authorName: "Juliana Lima",
            authorHandle: "11 avaliações",
            timeAgo: "3 semanas atrás",
            avatarInitials: "JL",
            avatarColor: "#0D9488",
            rating: 5,
            text: "Encontro tudo para festas e eventos em um só lugar. Produtos de ótima qualidade e equipe sempre prestativa.",
          },
          {
            id: "rev-5",
            authorName: "Marcos Vinícius",
            authorHandle: "19 avaliações",
            timeAgo: "2 meses atrás",
            avatarInitials: "MV",
            avatarColor: "#7C3AED",
            rating: 5,
            text: "Sacolas plásticas reforçadas e bobinas com o melhor custo-benefício da região metropolitana.",
          },
          {
            id: "rev-6",
            authorName: "Patrícia Rocha",
            authorHandle: "9 avaliações",
            timeAgo: "1 mês atrás",
            avatarInitials: "PR",
            avatarColor: "#D97706",
            rating: 5,
            text: "Marmitas, copos e produtos de limpeza profissional sempre em estoque. Recomendo de olhos fechados!",
          },
          {
            id: "rev-7",
            authorName: "André Nascimento",
            authorHandle: "16 avaliações",
            timeAgo: "3 semanas atrás",
            avatarInitials: "AN",
            avatarColor: "#004CB1",
            rating: 5,
            text: "A Semana do Feirante tem preços incríveis. Faço minha cotação online e já retiro tudo separado.",
          },
          {
            id: "rev-8",
            authorName: "Camila Martins",
            authorHandle: "7 avaliações",
            timeAgo: "1 mês atrás",
            avatarInitials: "CM",
            avatarColor: "#E2091E",
            rating: 5,
            text: "Loja completa, organizada e com muitas opções de embalagens que valorizam o nosso produto.",
          },
          {
            id: "rev-9",
            authorName: "Paulo Henrique",
            authorHandle: "31 avaliações",
            timeAgo: "2 meses atrás",
            avatarInitials: "PH",
            avatarColor: "#1E293B",
            rating: 5,
            text: "Parceiro fiel da nossa padaria há anos. Condições especiais por volume fazem toda a diferença.",
          },
          {
            id: "rev-10",
            authorName: "Luciana Ferreira",
            authorHandle: "12 avaliações",
            timeAgo: "1 mês atrás",
            avatarInitials: "LF",
            avatarColor: "#059669",
            rating: 5,
            text: "Atendimento ágil na loja do Jurunas e na Pedreira. Sempre encontro novidades e ótimos preços.",
          },
        ],
      },
    },

    // 19 — SEÇÃO LOCALIZAÇÃO DE UNIDADES E MAPA (ENCONTRE NOSSAS UNIDADES)
    {
      id: "s19-unidades-mapa",
      type: "store-locations-map",
      enabled: true,
      order: 16,
      props: {
        title: "Encontre nossas unidades",
        subtitle: "Lojas mais perto de você",
        searchPlaceholder: "Buscar unidade ou endereço",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d63816.8266816748!2d-48.4901799!3d-1.4450205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sComercial%20do%20Norte%20Belem%20PA!5e0!3m2!1spt-BR!2sbr!4v1710000000000!5m2!1spt-BR!2sbr",
        locations: [
          {
                    id: "loja-jurunas",
                    name: "Comercial do Norte — Jurunas (Bernardo Sayão)",
                    eyebrow: "Comercial do Norte",
                    displayTitle: "Jurunas",
                    ratingText: "4,8 (1.240)",
                    imageUrl: "/assets/HOME Vitrine/S0-FOOTER/loja-comercial-do-norte-jurunas.webp",
                    badge: "Aberto",
                    isFeatured: true,
                    address: "Av. Bernardo Sayão, 2450 — Jurunas, Belém - PA",
                    hoursWeekdays: "07h30 às 18h00",
                    hoursSaturday: "Sáb: 07h30 às 14h00",
                    phone: "(91) 98344-0880",
                    whatsappUrl: "https://wa.me/5591983440880",
                    mapQueryUrl: "https://maps.app.goo.gl/2squa7ire4uahDMz5",
                    mapEmbedUrl: "https://www.google.com/maps?q=Comercial+do+Norte+Av.+Bernardo+Say%C3%A3o+2450+Jurunas+Bel%C3%A9m+PA&output=embed",
                    lat: -1.4757,
                    lng: -48.4941
          },
          {
                    id: "loja-sao-bras",
                    name: "Comercial do Norte — Matriz São Brás",
                    eyebrow: "Comercial do Norte (Matriz)",
                    displayTitle: "São Brás",
                    ratingText: "4,8 (950)",
                    imageUrl: "/assets/HOME Vitrine/S0-FOOTER/loja-comercial-fachada.webp",
                    badge: "Aberto",
                    isFeatured: false,
                    address: "Av. Rômulo Maiorana, 115 (antiga 25) — São Brás, Belém - PA",
                    hoursWeekdays: "06h30 às 18h00",
                    hoursSaturday: "Sáb: 06h30 às 12h30",
                    phone: "(91) 4042-0513",
                    whatsappUrl: "https://wa.me/5591983440880",
                    mapQueryUrl: "https://maps.app.goo.gl/1PZ19MPGHDA6fTUd8",
                    mapEmbedUrl: "https://www.google.com/maps?q=Av.+R%C3%B4mulo+Maiorana+115+S%C3%A3o+Br%C3%A1s+Bel%C3%A9m+PA&output=embed",
                    lat: -1.445,
                    lng: -48.4684
          },
          {
                    id: "loja-pedreira-mauriti",
                    name: "Comercial do Norte — Filial Mauriti Pedreira",
                    eyebrow: "Comercial do Norte",
                    displayTitle: "Pedreira (Mauriti)",
                    ratingText: "4,9 (890)",
                    imageUrl: "/assets/HOME Vitrine/S0-FOOTER/loja-comercial-fachada.webp",
                    badge: "Aberto",
                    isFeatured: false,
                    address: "Tv. Mauriti, 1124 (entre Pedro Miranda e Antônio Everdosa) — Pedreira, Belém - PA",
                    hoursWeekdays: "07h00 às 18h00",
                    hoursSaturday: "Sáb: 07h00 às 12h30",
                    phone: "(91) 98344-0880",
                    whatsappUrl: "https://wa.me/5591983440880",
                    mapQueryUrl: "https://maps.app.goo.gl/Ef5ihP2Y6DpvhBYA9",
                    mapEmbedUrl: "https://www.google.com/maps?q=Tv.+Mauriti+1124+Pedreira+Bel%C3%A9m+PA&output=embed",
                    lat: -1.4278,
                    lng: -48.4732
          },
          {
                    id: "loja-guama",
                    name: "Comercial do Norte — Filial Guamá",
                    eyebrow: "Comercial do Norte",
                    displayTitle: "Guamá",
                    ratingText: "4,8 (720)",
                    imageUrl: "/assets/HOME Vitrine/S0-FOOTER/loja-comercial-do-norte-jurunas.webp",
                    badge: "Aberto",
                    isFeatured: false,
                    address: "Av. José Bonifácio, 2545 — Guamá, Belém - PA",
                    hoursWeekdays: "07h00 às 19h00",
                    hoursSaturday: "Sáb: 07h00 às 19h00",
                    phone: "(91) 98344-0880",
                    whatsappUrl: "https://wa.me/5591983440880",
                    mapQueryUrl: "https://maps.app.goo.gl/ecekBNcBS2MKUK7w9",
                    mapEmbedUrl: "https://www.google.com/maps?q=Av.+Jos%C3%A9+Bonif%C3%A1cio+2545+Guam%C3%A1+Bel%C3%A9m+PA&output=embed",
                    lat: -1.4693,
                    lng: -48.4684
          },
          {
                    id: "loja-atacado-delivery",
                    name: "Comercial do Norte — Vendas Internet & Delivery",
                    eyebrow: "Comercial do Norte",
                    displayTitle: "Vendas Online & Delivery",
                    ratingText: "4,9 (640)",
                    imageUrl: "/assets/HOME Vitrine/S0-FOOTER/loja-comercial-do-norte-jurunas.webp",
                    badge: "Aberto",
                    isFeatured: false,
                    address: "Tv. das Mercês, 158 — São Brás, Belém - PA",
                    hoursWeekdays: "08h15 às 18h00",
                    hoursSaturday: "Sáb: 07h30 às 12h00",
                    phone: "(91) 98344-0880",
                    whatsappUrl: "https://wa.me/5591983440880",
                    mapQueryUrl: "https://maps.app.goo.gl/kGDpknzPGpQ1Q1nV6",
                    mapEmbedUrl: "https://www.google.com/maps?q=Tv.+das+Merc%C3%AAs+158+S%C3%A3o+Br%C3%A1s+Bel%C3%A9m+PA&output=embed",
                    lat: -1.4453,
                    lng: -48.4679
          },
          {
                    id: "loja-cidade-nova",
                    name: "Comercial do Norte — Filial Cidade Nova",
                    eyebrow: "Comercial do Norte",
                    displayTitle: "Cidade Nova",
                    ratingText: "4,8 (510)",
                    imageUrl: "/assets/HOME Vitrine/S0-FOOTER/loja-comercial-fachada.webp",
                    badge: "Aberto",
                    isFeatured: false,
                    address: "Tv. WE-59 (Conj. Cidade Nova V), 138 — Cidade Nova, Ananindeua - PA",
                    hoursWeekdays: "07h00 às 19h00",
                    hoursSaturday: "Sáb: 07h00 às 13h00",
                    phone: "(91) 98344-0880",
                    whatsappUrl: "https://wa.me/5591983440880",
                    mapQueryUrl: "https://www.google.com/maps/search/?api=1&query=Dosplasticos+Cidade+Nova+Ananindeua",
                    mapEmbedUrl: "https://www.google.com/maps?q=Tv.+WE-59+Cidade+Nova+V+138+Ananindeua+PA&output=embed",
                    lat: -1.3658,
                    lng: -48.4124
          }
],
      },
    },
  ],
};
