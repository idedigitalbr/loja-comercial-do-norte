import type { PageComposition } from './widget-types';

/**
 * Configuração padrão completa da Homepage do Comercial do Norte (19 seções de widgets + Rodapé S20).
 * Reconstruída em fidelidade 1:1 com REFERENCIA/site-final.jpg e REFERENCIA/wireframe.png.
 */
export const defaultHomeComposition: PageComposition = {
  page: 'home',
  version: 2,
  widgets: [
    // 01 — SEÇÃO CARROSSEL LARGURA TOTAL (HERO FULL-WIDTH)
    {
      id: 's01-hero-full-width',
      type: 'hero-carousel',
      enabled: true,
      order: 1,
      props: {
        autoplayIntervalMs: 5500,
        showArrows: true,
        showDots: true,
        bottomGradient: true,
        slides: [
          {
            id: 'slide-pizzaria-main',
            title: 'Tudo para sua Pizzaria — Do Preparo à Entrega',
            imageUrl: '/assets/home-ref/s01-hero-pizzaria.jpg',
            linkUrl: '/loja?q=pizza',
            altText: 'Tudo para sua Pizzaria — Caixas de Pizza, Embalagens e Descartáveis no Comercial do Norte',
            backgroundColor: '#022B76',
          },
          {
            id: 'slide-topo-2',
            title: 'Embalagens para Delivery, Pizzarias e Restaurantes',
            imageUrl: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_k93f3kk93f3kk93f.jpg',
            linkUrl: '/loja?q=delivery',
            altText: 'Embalagens para Delivery e Alimentação no Comercial do Norte',
            backgroundColor: '#004CB1',
          },
          {
            id: 'slide-topo-3',
            title: 'Artigos para Festas, Confeitaria e Eventos',
            imageUrl: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_m54tnlm54tnlm54t.jpg',
            linkUrl: '/loja?q=festa',
            altText: 'Artigos de Festa e Confeitaria Comercial do Norte',
            backgroundColor: '#00357B',
          },
        ],
      },
    },

    // 02 — SEÇÃO CARROSSEL PADRÃO CONTIDO (SEMANA DO FEIRANTE)
    {
      id: 's02-contained-hero',
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
            id: 'contained-slide-feirante',
            title: 'Semana do Feirante — Copo Descartável 180ml Cristalcopo',
            imageUrl: '/assets/home-ref/s02-contained-feirante.jpg',
            linkUrl: '/loja?q=copo',
            altText: 'Semana do Feirante Comercial do Norte — Copo Descartável 180ml Cristalcopo',
          },
          {
            id: 'contained-slide-2',
            title: 'Ofertas de Atacado em Sacolas e Descartáveis',
            imageUrl: '/assets/Pagina/S1 TOPO HERO/topo-banners-ML/D_NQ_2X_690577-MLA118270011000_102026-OO.webp',
            linkUrl: '/cotacao',
            altText: 'Ofertas Especiais Comercial do Norte',
          },
        ],
      },
    },

    // 03 — SEÇÃO ÍCONES DE CATEGORIAS (8 ATALHOS)
    {
      id: 's03-category-icons-bar',
      type: 'category-grid',
      enabled: true,
      order: 3,
      props: {
        variant: 'icons-bar',
        title: 'Categorias em Destaque',
        columns: 8,
        maxItems: 8,
        customItems: [
          { id: 'cat-icon-1', label: 'Ofertas Relâmpago', imageUrl: '/assets/home-ref/s03-icon-01-ofertas.jpg', linkUrl: '/loja?oferta=1' },
          { id: 'cat-icon-2', label: 'Internacional', imageUrl: '/assets/home-ref/s03-icon-02-internacional.jpg', linkUrl: '/loja' },
          { id: 'cat-icon-3', label: 'Casa', imageUrl: '/assets/home-ref/s03-icon-03-casa.jpg', linkUrl: '/loja?q=casa' },
          { id: 'cat-icon-4', label: 'Ferramentas', imageUrl: '/assets/home-ref/s03-icon-04-ferramentas.jpg', linkUrl: '/loja' },
          { id: 'cat-icon-5', label: 'Eletroportáteis', imageUrl: '/assets/home-ref/s03-icon-05-eletroportateis.jpg', linkUrl: '/loja' },
          { id: 'cat-icon-6', label: 'Brinquedos', imageUrl: '/assets/home-ref/s03-icon-06-brinquedos.jpg', linkUrl: '/loja?q=festa' },
          { id: 'cat-icon-7', label: 'Automotivo', imageUrl: '/assets/home-ref/s03-icon-07-automotivo.jpg', linkUrl: '/loja' },
          { id: 'cat-icon-8', label: 'Utilidades Domésticas', imageUrl: '/assets/home-ref/s03-icon-08-utilidades.jpg', linkUrl: '/loja?q=utilidades' },
        ],
      },
    },

    // 04 — SEÇÃO CARROSSEL DE PRODUTOS EM DESTAQUE (BANNER VERTICAL + 3 PRODUTOS EM PROMOÇÃO)
    {
      id: 's04-split-offers-carousel',
      type: 'product-carousel',
      enabled: true,
      order: 4,
      props: {
        variant: 'split-banner',
        title: 'Produtos em Promoção',
        source: 'offers',
        limit: 3,
        viewAllLink: '/loja?oferta=1',
        sideBanner: {
          title: 'Ofertas',
          subtitle: 'Mês de Outubro',
          tag: 'Semana do Feirante',
          imageUrl: '/assets/home-ref/s04-side-banner-feirante.jpg',
          linkUrl: '/loja?oferta=1',
          altText: 'Semana do Feirante — Luva Nitrílica Comercial do Norte',
        },
      },
    },

    // 05 — SEÇÃO BANNERS TRIPLOS 01 (LIMPEZA, SEMANA DO FEIRANTE, SACOS E SACOLAS)
    {
      id: 's05-triple-banners-1',
      type: 'banner-grid',
      enabled: true,
      order: 5,
      props: {
        columns: 3,
        banners: [
          {
            id: 's05-b1',
            title: 'Produtos de Limpeza até 30% OFF',
            imageUrl: '/assets/home-ref/s05-triple-01-limpeza.jpg',
            linkUrl: '/loja?q=limpeza',
            altText: 'Produtos de Limpeza até 30% OFF no Comercial do Norte',
          },
          {
            id: 's05-b2',
            title: 'Semana do Feirante — Luva Nitrílica',
            imageUrl: '/assets/home-ref/s05-triple-02-feirante.jpg',
            linkUrl: '/loja?oferta=1',
            altText: 'Semana do Feirante Luva Nitrílica Comercial do Norte',
          },
          {
            id: 's05-b3',
            title: 'Sacos e Sacolas até 25% OFF',
            imageUrl: '/assets/home-ref/s05-triple-03-sacolas.jpg',
            linkUrl: '/loja?q=sacolas',
            altText: 'Sacos e Sacolas até 25% OFF Comercial do Norte',
          },
        ],
      },
    },

    // 06 — SEÇÃO CARROSSEL DE PRODUTOS (MAIS VENDIDOS - 5 COLUNAS)
    {
      id: 's06-mais-vendidos',
      type: 'product-carousel',
      enabled: true,
      order: 6,
      props: {
        variant: 'standard-5col',
        title: 'Mais vendidos',
        source: 'featured',
        limit: 5,
        viewAllLink: '/loja',
      },
    },

    // 07 — SEÇÃO BANNER LARGURA TOTAL (COMO FUNCIONA A COTAÇÃO ONLINE)
    {
      id: 's07-como-funciona-cotacao',
      type: 'quote-steps-banner',
      enabled: true,
      order: 7,
      props: {
        eyebrow: 'Saiba',
        title: 'Como funciona a cotação online',
        mascotImageUrl: '/assets/imgs/Mascote-3D-James-em-pe/outros/james-09-celular.png',
        rightArtworkImageUrl: '/assets/home-ref/s07-quote-right-mockup.jpg',
        ctaUrl: '/cotacao',
        steps: [
          {
            stepNumber: 1,
            title: 'Adicione os produtos',
            description: 'Escolha os itens e quantidades no catálogo.',
          },
          {
            stepNumber: 2,
            title: 'Envie a sua lista',
            description: 'Encaminhe sua cotação em poucos cliques.',
          },
          {
            stepNumber: 3,
            title: 'Receba sua proposta',
            description: 'Nossa equipe retorna rápido pelo WhatsApp.',
          },
          {
            stepNumber: 4,
            title: 'Finalize seu pedido',
            description: 'Confirme condições, entrega ou retirada na loja.',
          },
        ],
      },
    },

    // 08 — SEÇÃO CARROSSEL DE CARDS FUNDO ESCURO (TUDO PARA TODOS OS NEGÓCIOS / SEGMENTOS)
    {
      id: 's08-segmentos-negocios',
      type: 'segments-carousel',
      enabled: true,
      order: 8,
      props: {
        title: 'Tudo para todos os negócios',
        subtitle: 'Para todos os tamanhos!',
        ctaLabel: 'Ver todos os segmentos',
        ctaUrl: '/loja',
        items: [
          {
            id: 'seg-lanchonete',
            prefix: 'Para sua',
            title: 'Lanchonete',
            description: 'Embalagens térmicas, sacolas, guardanapos, copos e descartáveis para atendimento rápido.',
            iconType: 'burger',
            imageUrl: '/assets/home-ref/s08-segment-01-lanchonete.jpg',
            linkUrl: '/loja?q=lanchonete',
          },
          {
            id: 'seg-pizzaria',
            prefix: 'Para sua',
            title: 'Pizzaria',
            description: 'Caixas oitavadas e quadradas, lacres, bobinas, sacolas e insumos para delivery seguro.',
            iconType: 'pizza',
            imageUrl: '/assets/home-ref/s08-segment-02-pizzaria.jpg',
            linkUrl: '/loja?q=pizza',
          },
          {
            id: 'seg-padaria',
            prefix: 'Para sua',
            title: 'Padaria',
            description: 'Bandejas, embalagens para doces e bolos, filme PVC, sacos de papel e luvas descartáveis.',
            iconType: 'bakery',
            imageUrl: '/assets/home-ref/s08-segment-03-padaria.jpg',
            linkUrl: '/loja?q=padaria',
          },
          {
            id: 'seg-festas',
            prefix: 'Para sua',
            title: 'Loja de Festas',
            description: 'Balões, descartáveis coloridos, velas, forminhas e utilidades com preço de atacado.',
            iconType: 'party',
            imageUrl: '/assets/home-ref/s08-segment-04-festas.jpg',
            linkUrl: '/loja?q=festa',
          },
        ],
      },
    },

    // 09 — SEÇÃO BANNER HORIZONTAL (FAIXA OFERTAS IMPERDÍVEIS)
    {
      id: 's09-faixa-ofertas-imperdiveis',
      type: 'promo-strip',
      enabled: true,
      order: 9,
      props: {
        variant: 'offers-strip',
        highlightText: 'OFERTAS IMPERDÍVEIS',
        title: 'em embalagens, descartáveis e utilidades',
        badges: [
          { label: 'Menor preço', icon: 'tag' },
          { label: 'Variedade', icon: 'grid' },
          { label: 'Pelo WhatsApp', icon: 'whatsapp' },
        ],
      },
    },

    // 10 — SEÇÃO CARROSSEL DE PRODUTOS (PARA VOCÊ - 5 COLUNAS)
    {
      id: 's10-para-voce-1',
      type: 'product-carousel',
      enabled: true,
      order: 10,
      props: {
        variant: 'standard-5col',
        title: 'Para você',
        source: 'recent',
        limit: 5,
        viewAllLink: '/loja',
      },
    },

    // 11 — SEÇÃO BANNERS TRIPLOS 02 (HAMBURGUEIRA, LUVA VERMELHO, LUVA AZUL)
    {
      id: 's11-triple-banners-2',
      type: 'banner-grid',
      enabled: true,
      order: 11,
      props: {
        columns: 3,
        banners: [
          {
            id: 's11-b1',
            title: 'Semana do Feirante — Hamburgueira Isopor',
            imageUrl: '/assets/home-ref/s11-triple-01-hamburgueira.jpg',
            linkUrl: '/loja?q=hamburgueira',
            altText: 'Semana do Feirante Hamburgueira Isopor R$ 85,95',
          },
          {
            id: 's11-b2',
            title: 'Semana do Feirante — Luva Nitrílica Vermelho',
            imageUrl: '/assets/home-ref/s11-triple-02-luva-vermelho.jpg',
            linkUrl: '/loja?oferta=1',
            altText: 'Semana do Feirante Luva Nitrílica R$ 27,10',
          },
          {
            id: 's11-b3',
            title: 'Semana do Feirante — Luva Nitrílica Azul',
            imageUrl: '/assets/home-ref/s11-triple-03-luva-azul.jpg',
            linkUrl: '/loja?oferta=1',
            altText: 'Semana do Feirante Luva Nitrílica Azul R$ 27,10',
          },
        ],
      },
    },

    // 12 — SEÇÃO CARROSSEL DE VÍDEOS VERTICAL (NOSSOS EVENTOS)
    {
      id: 's12-nossos-eventos',
      type: 'events-carousel',
      enabled: true,
      order: 12,
      props: {
        title: 'Nossos Eventos',
        subtitle: 'Tudo que acontece no Comercial do Norte',
        ctaLabel: 'Ver todos os eventos',
        ctaUrl: '/loja',
        topThumbUrl: '/assets/home-ref/s12-event-top-thumb.jpg',
        items: [
          {
            id: 'ev-1',
            title: 'Encontro de Empreendedores — James Holanda',
            imageUrl: '/assets/home-ref/s12-event-01-empreendedores.jpg',
            linkUrl: '/loja',
          },
          {
            id: 'ev-2',
            title: 'Grande Reinauguração Loja Pedreira',
            imageUrl: '/assets/home-ref/s12-event-02-reinauguracao.jpg',
            linkUrl: '/loja',
          },
          {
            id: 'ev-3',
            title: 'Encontro de Empreendedores — Uma História de Sucesso',
            imageUrl: '/assets/home-ref/s12-event-03-empreendedores-2.jpg',
            linkUrl: '/loja',
          },
          {
            id: 'ev-4',
            title: 'Sábado Croquete de Charque — Pará Trigo 2026',
            imageUrl: '/assets/home-ref/s12-event-04-croquete.jpg',
            linkUrl: '/loja',
          },
        ],
      },
    },

    // 13 — SEÇÃO BANNER HORIZONTAL (CONDIÇÕES ESPECIAIS PARA O SEU NEGÓCIO)
    {
      id: 's13-condicoes-especiais',
      type: 'promo-strip',
      enabled: true,
      order: 13,
      props: {
        variant: 'conditions-mascot',
        highlightText: 'CONDIÇÕES ESPECIAIS',
        title: 'para o seu negócio',
        mascotImageUrl: '/assets/imgs/Mascote-3D-James-em-pe/principais/Mascote 3D sorridente com joinha.png',
        badges: [
          { label: 'Desconto por volume', icon: 'percent' },
          { label: 'Atendimento no WhatsApp', icon: 'whatsapp' },
          { label: 'Reposição programada', icon: 'clock' },
          { label: 'Retirada ou entrega em Belém', icon: 'truck' },
        ],
      },
    },

    // 14 — SEÇÃO CARROSSEL DE PRODUTOS (PARA VOCÊ - 5 COLUNAS)
    {
      id: 's14-para-voce-2',
      type: 'product-carousel',
      enabled: true,
      order: 14,
      props: {
        variant: 'standard-5col',
        title: 'Para você',
        source: 'featured',
        limit: 5,
        viewAllLink: '/loja',
      },
    },

    // 15 — SEÇÃO CARROSSEL DE VÍDEOS HORIZONTAL (EXPLICA AÍ COMERCIAL)
    {
      id: 's15-explica-ai-comercial',
      type: 'video-articles-carousel',
      enabled: true,
      order: 15,
      props: {
        title: 'Explica aí comercial',
        subtitle: 'Dicas em vídeos e artigos para você usar no seu negócio.',
        viewAllLabel: 'Ver todos',
        viewAllUrl: '/loja',
        items: [
          {
            id: 'vid-1',
            tags: ['P/ DELIVERY', 'GUIA PRÁTICO'],
            title: 'Como escolher a caixa de pizza certa',
            paragraphs: [
              'Na hora de montar ou escalar uma pizzaria, a embalagem faz toda a diferença na temperatura, apresentação e segurança da entrega.',
              'Veja como comparar tamanhos (25cm, 30cm, 35cm e 40cm), gramatura do papelão ondulado e modelos oitavados para evitar que a tampa afunde no transporte.',
              'Economize comprando em fardos fechados com condição especial de atacado no Comercial do Norte.',
            ],
            ctaLabel: 'Ver Completo',
            ctaUrl: '/loja?q=pizza',
            imageUrl: '/assets/home-ref/s15-video-pizza-woman.jpg',
          },
          {
            id: 'vid-2',
            tags: ['P/ DELIVERY', 'DICA RÁPIDA'],
            title: 'Embalagens térmicas que valorizam seu lanche',
            paragraphs: [
              'Saiba qual hamburgueira ou marmita mantém o calor e a crocância por mais tempo no delivery.',
            ],
            ctaLabel: 'Ver Completo',
            ctaUrl: '/loja?q=embalagens',
            imageUrl: '/assets/home-ref/s15-video-pizza-woman.jpg',
          },
        ],
      },
    },

    // 16 — SEÇÃO CARROSSEL DE CARDS COMPACTOS (A LOJA NO INSTAGRAM)
    {
      id: 's16-instagram-feed',
      type: 'instagram-feed',
      enabled: true,
      order: 16,
      props: {
        title: 'A Loja no Instagram',
        subtitle: 'Acompanhe bastidores, lançamentos e ações especiais nas nossas lojas físicas',
        handleLabel: '@comercialdonorte',
        handleUrl: 'https://www.instagram.com/comercialdonorte',
        items: [
          { id: 'ig-1', label: 'Dia do Cliente', imageUrl: '/assets/home-ref/s16-insta-01-dia-cliente.jpg', linkUrl: 'https://www.instagram.com/comercialdonorte' },
          { id: 'ig-2', label: 'No Balcão', imageUrl: '/assets/home-ref/s16-insta-02-no-balcao.jpg', linkUrl: 'https://www.instagram.com/comercialdonorte' },
          { id: 'ig-3', label: '14 Anos de Loja', imageUrl: '/assets/home-ref/s16-insta-03-14-anos.jpg', linkUrl: 'https://www.instagram.com/comercialdonorte' },
          { id: 'ig-4', label: 'Nossa Equipe', imageUrl: '/assets/home-ref/s16-insta-04-equipe.jpg', linkUrl: 'https://www.instagram.com/comercialdonorte' },
          { id: 'ig-5', label: 'Promoções', imageUrl: '/assets/home-ref/s16-insta-05-promocoes.jpg', linkUrl: 'https://www.instagram.com/comercialdonorte' },
          { id: 'ig-6', label: 'Vale-Compras', imageUrl: '/assets/home-ref/s16-insta-06-vale-compras.jpg', linkUrl: 'https://www.instagram.com/comercialdonorte' },
        ],
      },
    },

    // 17 — SEÇÃO BANNER LARGURA TOTAL (GRUPO DE OFERTAS EXCLUSIVAS DO WHATSAPP)
    {
      id: 's17-grupo-whatsapp',
      type: 'promo-strip',
      enabled: true,
      order: 17,
      props: {
        variant: 'whatsapp-group',
        title: 'Entre em nosso Grupo de ofertas',
        highlightText: 'Exclusivas do WhatsApp',
        subtitle: 'Receba promoções relâmpago, lotes especiais para atacado e novidades direto no seu celular.',
        ctaLabel: 'Participar do Grupo WhatsApp',
        ctaUrl: 'https://wa.me/5591983440880',
        mascotImageUrl: '/assets/imgs/Mascote-3D-James-em-pe/outros/james-09-celular.png',
        rightImageUrl: '/assets/home-ref/s17-whatsapp-phones.jpg',
      },
    },

    // 18 — SEÇÃO AVALIAÇÕES E DEPOIMENTOS (AVALIAÇÕES NO GOOGLE - 10 CARDS)
    {
      id: 's18-avaliacoes-google',
      type: 'testimonials-grid',
      enabled: true,
      order: 18,
      props: {
        eyebrow: 'AVALIAÇÕES NO GOOGLE',
        title: 'O que nossos clientes dizem no Google.',
        ratingSummary: 'Classificação 4.8 de 5.0 estrelas',
        totalReviewsLabel: 'Um bloco com mais de 2 mil avaliações',
        items: [
          {
            id: 'rev-1',
            authorName: 'Carlos Eduardo',
            authorHandle: '@carloseduardo · Pizzaria',
            avatarInitials: 'CE',
            avatarColor: '#004CB1',
            rating: 5,
            text: 'Excelente variedade de caixas de pizza e descartáveis. Preço imbatível no atacado em Belém e entrega super rápida.',
          },
          {
            id: 'rev-2',
            authorName: 'Fernanda Souza',
            authorHandle: '@fernandasouza · Confeitaria',
            avatarInitials: 'FS',
            avatarColor: '#E2091E',
            rating: 5,
            text: 'Sempre compro todas as embalagens para doces e bolos no Comercial do Norte. Atendimento nota 10 pelo WhatsApp!',
          },
          {
            id: 'rev-3',
            authorName: 'Roberto Mendes',
            authorHandle: '@robertomendes · Lanchonete',
            avatarInitials: 'RM',
            avatarColor: '#00357B',
            rating: 5,
            text: 'Os preços por fardo compensam muito para quem tem comércio. A retirada na Bernardo Sayão é muito prática.',
          },
          {
            id: 'rev-4',
            authorName: 'Juliana Lima',
            authorHandle: '@julianalima · Eventos',
            avatarInitials: 'JL',
            avatarColor: '#0D9488',
            rating: 5,
            text: 'Encontro tudo para festas e eventos em um só lugar. Produtos de ótima qualidade e equipe sempre prestativa.',
          },
          {
            id: 'rev-5',
            authorName: 'Marcos Vinícius',
            authorHandle: '@marcosvinicius · Mercadinho',
            avatarInitials: 'MV',
            avatarColor: '#7C3AED',
            rating: 5,
            text: 'Sacolas plásticas reforçadas e bobinas com o melhor custo-benefício da região metropolitana.',
          },
          {
            id: 'rev-6',
            authorName: 'Patrícia Rocha',
            authorHandle: '@patriciarocha · Restaurante',
            avatarInitials: 'PR',
            avatarColor: '#D97706',
            rating: 5,
            text: 'Marmitas, copos e produtos de limpeza profissional sempre em estoque. Recomendo de olhos fechados!',
          },
          {
            id: 'rev-7',
            authorName: 'André Nascimento',
            authorHandle: '@andrenascimento · Feirante',
            avatarInitials: 'AN',
            avatarColor: '#004CB1',
            rating: 5,
            text: 'A Semana do Feirante tem preços incríveis. Faço minha cotação online e já retiro tudo separado.',
          },
          {
            id: 'rev-8',
            authorName: 'Camila Martins',
            authorHandle: '@camilamartins · Doceria',
            avatarInitials: 'CM',
            avatarColor: '#E2091E',
            rating: 5,
            text: 'Loja completa, organizada e com muitas opções de embalagens que valorizam o nosso produto.',
          },
          {
            id: 'rev-9',
            authorName: 'Paulo Henrique',
            authorHandle: '@paulohenrique · Padaria',
            avatarInitials: 'PH',
            avatarColor: '#1E293B',
            rating: 5,
            text: 'Parceiro fiel da nossa padaria há anos. Condições especiais por volume fazem toda a diferença.',
          },
          {
            id: 'rev-10',
            authorName: 'Luciana Ferreira',
            authorHandle: '@lucianaferreira · Buffet',
            avatarInitials: 'LF',
            avatarColor: '#059669',
            rating: 5,
            text: 'Atendimento ágil na loja do Jurunas e na Pedreira. Sempre encontro novidades e ótimos preços.',
          },
        ],
      },
    },

    // 19 — SEÇÃO LOCALIZAÇÃO DE UNIDADES E MAPA (ENCONTRE NOSSAS UNIDADES)
    {
      id: 's19-unidades-mapa',
      type: 'store-locations-map',
      enabled: true,
      order: 19,
      props: {
        title: 'Encontre nossas unidades',
        subtitle: 'Lojas mais perto de você',
        searchPlaceholder: 'Digite seu endereço ou CEP',
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d63816.8266816748!2d-48.4901799!3d-1.4450205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sComercial%20do%20Norte%20Belem%20PA!5e0!3m2!1spt-BR!2sbr!4v1710000000000!5m2!1spt-BR!2sbr',
        locations: [
          {
            id: 'loja-jurunas',
            name: 'Loja Matriz — Bernardo Sayão / Jurunas',
            badge: 'Aberta agora',
            isFeatured: true,
            address: 'Av. Bernardo Sayão, 2450 — Jurunas, Belém - PA, 66025-110',
            hoursWeekdays: 'Seg a Sex: 07h30 às 18h00',
            hoursSaturday: 'Sáb: 07h30 às 14h00',
            phone: '(91) 98344-0880',
            whatsappUrl: 'https://wa.me/5591983440880',
            mapQueryUrl: 'https://www.google.com/maps/search/?api=1&query=Comercial+do+Norte+Bernardo+Sayao+Belem',
          },
          {
            id: 'loja-pedreira',
            name: 'Unidade Pedreira',
            badge: 'Aberta agora',
            isFeatured: false,
            address: 'Av. Pedro Miranda, 1180 — Pedreira, Belém - PA, 66085-005',
            hoursWeekdays: 'Seg a Sex: 08h00 às 18h00',
            hoursSaturday: 'Sáb: 08h00 às 13h00',
            phone: '(91) 98344-0880',
            whatsappUrl: 'https://wa.me/5591983440880',
            mapQueryUrl: 'https://www.google.com/maps/search/?api=1&query=Comercial+do+Norte+Pedreira+Belem',
          },
          {
            id: 'loja-entroncamento',
            name: 'Unidade Atacado & Distribuição',
            badge: 'Pronta entrega',
            isFeatured: false,
            address: 'Belém e Região Metropolitana — Retirada rápida ou entrega programada',
            hoursWeekdays: 'Seg a Sex: 07h30 às 18h00',
            hoursSaturday: 'Sáb: 07h30 às 13h00',
            phone: '(91) 98344-0880',
            whatsappUrl: 'https://wa.me/5591983440880',
            mapQueryUrl: 'https://www.google.com/maps/search/?api=1&query=Comercial+do+Norte+Belem+PA',
          },
        ],
      },
    },
  ],
};
