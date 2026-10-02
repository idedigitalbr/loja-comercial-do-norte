import type { IconName } from '@commerce/ui';

export type ServicePageSlug = 'cabelos-e-penteados' | 'maquiagem' | 'manicure-pedicure' | 'terapia-capilar';

type ServiceImage = { src: string; alt: string };

export type ServicePageData = {
  slug: ServicePageSlug;
  title: string;
  heroImage: string;
  intro: {
    title: string;
    paragraphs: string[];
    noteTitle?: string;
    note?: string | string[];
    images: ServiceImage[];
  };
  process?: {
    eyebrow: string;
    title: string;
    steps: Array<{ number: string; title: string; description: string }>;
  };
  solutions: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      bullets?: string[];
      image: ServiceImage;
    }>;
  };
  results: {
    eyebrow: string;
    title: string;
    description: string;
    images: ServiceImage[];
  };
  gallery?: { images: ServiceImage[]; initialCount?: number };
  hideResults?: boolean;
  beforeAfter?: Array<ServiceImage & { caption?: string }>;
  whyChooseGallery?: ServiceImage[];
  benefits?: {
    eyebrow: string;
    items: Array<{ icon: IconName; title: string }>;
  };
  whyChoose?: {
    eyebrow: string;
    title: string;
    description: string;
    items: string[];
  };
  closingEyebrow?: string;
  closingImage?: string;
  closingCtaLabel?: string;
  closingDescription?: string;
  reassurance?: Array<{ icon: IconName; title: string; description: string }>;
  ctaTitle: string;
};

const uploads = 'https://jonaselivaldohair.com.br/wp-content/uploads';

const hairGalleryNames = [
  '2026/09/raquel.jpeg',
  '2026/07/cabelo-loiro-longo-ondulado.webp',
  '2026/09/WhatsApp-Image-2026-09-09-at-16.37.32.jpeg',
  '2026/07/cabelo-morena-iluminada-tom-mel.webp',
  '2026/07/cabelo-loiro-iluminado-sorriso.webp',
  '2026/07/cabelo-cacheado-volumoso-iluminado.webp',
  '2026/09/WhatsApp-Image-2026-09-09-at-16.37.33-2.jpeg',
  '2026/07/cabelo-morena-iluminada-castanho-longo.webp',
  '2026/07/cabelo-castanho-ondas-cliente.webp',
  '2026/07/cabelo-morena-iluminada-frente-perfil.webp',
  '2026/07/cabelo-morena-iluminada-costas-ondas.webp',
  '2026/09/cabelo-raquel.jpeg',
  '2026/09/WhatsApp-Image-2026-09-09-at-16.37.35-1.jpeg',
  '2026/09/WhatsApp-Image-2026-09-09-at-16.37.36.jpeg',
  '2026/09/WhatsApp-Image-2026-09-09-at-16.37.38-1.jpeg',
  ...['4', '3-1', '19', '18', '2-1', '21', '3', '13', '15', '20'].map((name) => `2026/03/image-${name}.jpg`),
  '2026/07/cabelo-iluminado-tom-quente-costas.webp',
  ...['1-1', '1-2', '2-2'].map((name) => `2026/03/image-${name}.jpg`),
  '2026/03/coloracao.jpg',
  '2026/03/penteado.jpg',
  ...['5', '6', '7', '8', '9'].map((name) => `2026/03/image-${name}.jpg`),
  '2026/03/Gemini_Generated_Image_pcocakpcocakpcoc.png',
  ...['10', '11'].map((name) => `2026/03/image-${name}.jpg`),
  '2026/09/WhatsApp-Image-2026-09-09-at-16.37.34.jpeg',
  '2026/09/WhatsApp-Image-2026-09-09-at-16.37.37.jpeg',
];

const hairGallery = hairGalleryNames.map((name, index) => ({
  src: `${uploads}/${name}`,
  alt: `Resultado de cabelos e penteados ${index + 1}`,
}));

export const servicePages: Record<ServicePageSlug, ServicePageData> = {
  'cabelos-e-penteados': {
    slug: 'cabelos-e-penteados',
    title: 'Cabelos & Penteados',
    heroImage: `${uploads}/2026/03/Gemini_Generated_Image_pcocakpcocakpcoc.png`,
    intro: {
      title: 'Cabelos bem cuidados, Autoestima lá em cima!',
      paragraphs: [
        'Tá na hora de dar aquele trato no visual? Corte, hidratação, escova ou aquela mudança que você vem pensando aqui a gente faz com carinho, técnica e atenção aos detalhes.',
        'Reserve seu horário e venha viver a experiência de se sentir ainda mais você.',
      ],
      images: [
        { src: `${uploads}/2026/03/image-1-1.jpg`, alt: 'Resultado de corte e penteado' },
        { src: `${uploads}/2026/09/cabelo-raquel.jpeg`, alt: 'Cabelo finalizado no salão' },
      ],
    },
    solutions: {
      eyebrow: 'Cabelos & Penteados',
      title: 'Algumas de Nossas Soluções',
      description: 'Serviços profissionais para realçar sua beleza e transformar seus cabelos.',
      items: [
        {
          title: 'Corte Feminino',
          description: 'Quer renovar o visual e valorizar ainda mais sua beleza? O corte feminino é personalizado para realçar o formato do seu rosto, seu estilo e deixar os fios com mais leveza, movimento e caimento perfeito.',
          bullets: ['Mais leveza e movimento', 'Valorização do rosto', 'Cor Radiante', 'Acabamento Impecável'],
          image: { src: `${uploads}/2026/03/penteado.jpg`, alt: 'Corte feminino e penteado' },
        },
        {
          title: 'Coloração',
          description: 'Quer mudar a cor do cabelo ou manter o tom sempre bonito? A coloração é indicada para renovar ou intensificar a cor dos fios, feita após um diagnóstico capilar para escolher a tonalidade ideal e garantir um resultado bonito e duradouro.',
          bullets: ['Cobertura de fios brancos', 'Cor uniforme e brilhante', 'Cor Radiante', 'Acabamento Impecável'],
          image: { src: `${uploads}/2026/03/coloracao.jpg`, alt: 'Coloração profissional' },
        },
      ],
    },
    results: {
      eyebrow: 'Nossas fotos',
      title: 'Resultados que Transformam',
      description: 'Veja alguns dos nossos cabelos e penteados feitos para valorizar a beleza de cada cliente. Cada detalhe é pensado para criar um visual elegante, moderno e perfeito para qualquer ocasião.',
      images: [
        { src: `${uploads}/2026/03/penteado.jpg`, alt: 'Penteado profissional' },
        { src: `${uploads}/2026/03/coloracao.jpg`, alt: 'Coloração de cabelo' },
        { src: `${uploads}/2026/03/Gemini_Generated_Image_5v2yzx5v2yzx5v2y-1.png`, alt: 'Resultado de cabelo transformado' },
      ],
    },
    gallery: { images: hairGallery, initialCount: 6 },
    closingEyebrow: 'Serviço Cabelos e Penteados',
    closingImage: `${uploads}/2026/03/Gemini_Generated_Image_5v2yzx5v2yzx5v2y-1.png`,
    closingCtaLabel: 'Chame no WhatsApp',
    closingDescription: 'Agende seu horário e venha viver uma experiência feita para valorizar ainda mais você.',
    reassurance: [
      { icon: 'sliders-horizontal', title: 'Atendimento Personalizado', description: 'Cada cliente recebe uma avaliação para encontrar o estilo ideal para seu rosto e tipo de cabelo.' },
      { icon: 'badge-check', title: 'Profissionais Qualificados', description: 'Equipe preparada com técnicas modernas para garantir um resultado bonito e seguro.' },
      { icon: 'heart-handshake', title: 'Mais Beleza e Autoestima', description: 'Um visual renovado que valoriza sua beleza e aumenta sua confiança.' },
    ],
    ctaTitle: 'Pronta para um novo visual? Cuide dos seus cabelos com quem entende.',
  },
  maquiagem: {
    slug: 'maquiagem',
    title: 'Maquiagem',
    heroImage: `${uploads}/2026/09/maquiagem-top-hero.webp`,
    intro: {
      title: 'Realce sua beleza com uma maquiagem profissional para cada ocasião',
      paragraphs: [
        'Quer valorizar ainda mais sua beleza para um evento, sessão de fotos ou até para aquele compromisso especial? Aqui cada maquiagem é feita com atenção aos detalhes, técnicas profissionais e produtos de qualidade para garantir um resultado elegante, duradouro e que combine com o seu estilo.',
        'Seja uma make leve para o dia a dia, uma produção social mais elaborada ou até uma maquiagem artística cheia de personalidade, nossa equipe prepara tudo para que você se sinta confiante, linda e pronta para qualquer ocasião.',
        'Reserve seu horário e venha viver a experiência de realçar o que você tem de mais bonito.',
      ],
      images: [
        { src: `${uploads}/2026/03/make-x2.jpg`, alt: 'Maquiagem artística profissional' },
        { src: `${uploads}/2026/03/make-5x.jpg`, alt: 'Maquiagem social no salão' },
      ],
    },
    solutions: {
      eyebrow: 'Conheça algumas de',
      title: 'Algumas de Nossas Soluções em Maquiagem',
      description: 'Em nosso salão oferecemos diferentes estilos de maquiagem para atender cada ocasião e realçar ainda mais a sua beleza.',
      items: [
        {
          title: 'Make Express',
          description: 'Precisa de uma maquiagem rápida que valorize sua beleza natural? Uma maquiagem rápida e leve, ideal para quem quer se arrumar para o dia a dia ou para um compromisso de última hora, mantendo a pele bonita e natural.',
          image: { src: `${uploads}/2026/03/make-3.jpg`, alt: 'Make express' },
        },
        {
          title: 'Make Social',
          description: 'Vai para um evento especial e quer uma maquiagem impecável? Perfeita para eventos, festas, formaturas e ocasiões especiais. É uma maquiagem mais detalhada, com acabamento profissional, realçando seus traços e garantindo um visual elegante e duradouro.',
          image: { src: `${uploads}/2026/03/make-1.jpg`, alt: 'Make social' },
        },
        {
          title: 'Make Artística',
          description: 'Quer um visual criativo e cheio de personalidade? Tenha uma maquiagem profissional artística perfeita para eventos, ensaios, apresentações e ocasiões especiais. Destaque sua beleza com criatividade, técnica e acabamento impecável.',
          image: { src: `${uploads}/2026/03/make-x2.jpg`, alt: 'Make artística' },
        },
      ],
    },
    results: {
      eyebrow: 'Nossas fotos',
      title: 'Resultados que Transformam',
      description: 'Veja algumas das maquiagens que realizamos. Cada cliente recebe um atendimento personalizado para definir a maquiagem ideal, de acordo com seus traços, estilo e ocasião.',
      images: [
        { src: `${uploads}/2026/03/make-5x.jpg`, alt: 'Resultado de maquiagem profissional' },
        { src: `${uploads}/2026/09/makee-1-scaled.jpeg`, alt: 'Maquiagem social finalizada' },
        { src: `${uploads}/2026/09/makee-2-scaled.jpeg`, alt: 'Maquiagem profissional finalizada' },
      ],
    },
    gallery: { images: [
      { src: `${uploads}/2026/03/make-5x.jpg`, alt: 'Resultado de maquiagem profissional' },
      { src: `${uploads}/2026/09/makee-1-scaled.jpeg`, alt: 'Maquiagem social finalizada' },
      { src: `${uploads}/2026/09/makee-2-scaled.jpeg`, alt: 'Maquiagem profissional finalizada' },
    ] },
    closingEyebrow: 'Entre em contato',
    closingImage: `${uploads}/2026/03/Gemini_Generated_Image_okt6lqokt6lqokt6-1.png`,
    closingCtaLabel: 'Chame no WhatsApp',
    closingDescription: 'Agende seu horário e venha viver uma experiência pensada para destacar seus traços e deixar você ainda mais confiante para qualquer ocasião.',
    ctaTitle: 'Pronta para realçar ainda mais a sua beleza? Faça sua maquiagem com quem entende.',
  },
  'manicure-pedicure': {
    slug: 'manicure-pedicure',
    title: 'Manicure & Pedicure',
    heroImage: `${uploads}/2026/03/Gemini_Generated_Image_wrh8u4wrh8u4wrh8-1.png`,
    intro: {
      title: 'Unhas bem cuidadas, autoestima lá em cima!',
      paragraphs: [
        'Nossas unhas contam muito sobre quem somos. Por isso, o serviço de Manicure & Pedicure do nosso salão vai além do embelezamento — é um momento de cuidado, relaxamento e atenção personalizada para você.',
        'Com materiais esterilizados, esmaltes de alta durabilidade e profissionais especializados, garantimos resultados que duram mais e fazem você se sentir ainda mais bonita.',
      ],
      images: [
        { src: `${uploads}/2026/03/image-1-3.jpg`, alt: 'Pedicure profissional' },
        { src: `${uploads}/2026/03/image-6-1.jpg`, alt: 'Manicure profissional' },
      ],
    },
    process: {
      eyebrow: 'Cada etapa pensada para garantir um resultado perfeito e duradouro',
      title: 'Como funciona',
      steps: [
        { number: '01', title: 'Higienização', description: 'Limpeza completa das mãos e pés com produtos adequados.' },
        { number: '02', title: 'Corte e Lixamento', description: 'Modelagem precisa das unhas no formato ideal para você.' },
        { number: '03', title: 'Cutilagem', description: 'Técnica cuidadosa e segura para um acabamento perfeito.' },
        { number: '04', title: 'Polimento', description: 'Aplicação com esmaltes de alta durabilidade.' },
      ],
    },
    solutions: {
      eyebrow: 'Conheça alguns dos nossos serviços de',
      title: 'Manicure & Pedicure',
      description: '',
      items: [
        { title: 'Pacote Completo', description: 'O pacote completo para cuidar das mãos e dos pés em um único atendimento.', image: { src: `${uploads}/2026/03/image-6-1.jpg`, alt: 'Pacote completo de manicure e pedicure' } },
        { title: 'Manicure Tradicional', description: 'Limpeza, corte, lixamento e esmaltação para deixar suas mãos sempre bonitas e bem cuidadas.', image: { src: `${uploads}/2026/09/IMG_6718-scaled.jpg`, alt: 'Manicure tradicional' } },
        { title: 'Pedicure Tradicional', description: 'Cuidado para os pés, removendo cutículas e deixando as unhas bonitas e saudáveis.', image: { src: `${uploads}/2026/03/image-4-1.jpg`, alt: 'Pedicure tradicional' } },
        { title: 'Manutenção de Unhas', description: 'Cuidados profissionais para manter suas unhas sempre bonitas, saudáveis e com o formato perfeito, garantindo durabilidade e aparência impecável.', image: { src: `${uploads}/2026/09/IMG_6727-scaled.jpg`, alt: 'Manutenção de unhas' } },
        { title: 'Spa dos Pés', description: 'Tratamento relaxante com hidratação e cuidados especiais para revitalizar seus pés.', image: { src: `${uploads}/2026/03/Gemini_Generated_Image_7a7q2f7a7q2f7a7q-1.png`, alt: 'Spa dos pés' } },
        { title: 'Unhas Decoradas', description: 'Designs criativos e personalizados para quem quer unhas ainda mais estilosas.', image: { src: `${uploads}/2026/03/a111.jpg`, alt: 'Unhas decoradas' } },
        { title: 'Esmaltação Tradicional', description: 'Aplicação profissional de esmalte, garantindo um acabamento elegante, uniforme e duradouro que valoriza suas unhas e realça sua beleza.', image: { src: `${uploads}/2026/09/IMG_5562-1-scaled.jpg`, alt: 'Esmaltação tradicional' } },
        { title: 'Esmaltação em Gel', description: 'Garante unhas com brilho intenso, acabamento impecável e durabilidade prolongada. Perfeita para quem quer unhas bonitas e resistentes por muito mais tempo.', image: { src: `${uploads}/2026/03/gell.webp`, alt: 'Esmaltação em gel' } },
      ],
    },
    results: {
      eyebrow: 'Nossos resultados',
      title: 'Unhas feitas para você',
      description: 'Cuidado, precisão e acabamento para mãos e pés que combinam com o seu estilo.',
      images: [
        { src: `${uploads}/2026/09/IMG_6718-scaled.jpg`, alt: 'Resultado de manicure' },
        { src: `${uploads}/2026/09/IMG_6727-scaled.jpg`, alt: 'Resultado de pedicure' },
        { src: `${uploads}/2026/03/Gemini_Generated_Image_7a7q2f7a7q2f7a7q-1.png`, alt: 'Resultado de unhas decoradas' },
      ],
    },
    hideResults: true,
    closingEyebrow: 'Serviço Manicure e Pedicure',
    closingImage: `${uploads}/2026/03/Gemini_Generated_Image_wrh8u4wrh8u4wrh8-1.png`,
    closingCtaLabel: 'Chame no WhatsApp',
    closingDescription: 'Agende seu horário e tenha unhas bonitas, cuidadas e com acabamento impecável.',
    ctaTitle: 'Quer deixar suas unhas lindas e bem cuidadas?',
  },
  'terapia-capilar': {
    slug: 'terapia-capilar',
    title: 'Terapia Capilar',
    heroImage: `${uploads}/2026/03/Gemini_Generated_Image_1zjcl1zjcl1zjcl1-1.png`,
    intro: {
      title: 'Sofrendo com queda de cabelo ou problemas no couro cabeludo?',
      paragraphs: [
        'A Terapia Capilar trata a causa da queda, inflamações e desequilíbrios capilares, restaurando a saúde e estimulando o crescimento natural dos fios.',
      ],
      noteTitle: 'Sobre o Especialista:',
      note: [
        'Jonas Moreira é Terapeuta Capilar formado pela Academia Brasileira de Tricologia, com especialização em saúde do couro cabeludo.',
        'Com atendimento individualizado e protocolos personalizados, Jonas trata queda, inflamações e desequilíbrios capilares com técnicas de alta eficácia e abordagem integrativa.',
      ],
      images: [
        { src: `${uploads}/2026/03/capilar-3-1028x1536.jpg`, alt: 'Avaliação de terapia capilar' },
        { src: `${uploads}/2026/07/1aa-600x816.webp`, alt: 'Especialista em terapia capilar' },
      ],
    },
    hideResults: true,
    beforeAfter: [
      { src: `${uploads}/2026/03/capilar-7.jpg`, alt: 'Resultado de terapia capilar antes do tratamento', caption: 'ANTES' },
      { src: `${uploads}/2026/03/capilar-9.jpg`, alt: 'Resultado de terapia capilar depois do tratamento', caption: 'DEPOIS' },
      { src: `${uploads}/2026/03/capilar-5.jpg`, alt: 'Resultado de terapia capilar' },
      { src: `${uploads}/2026/03/capilar-8.jpg`, alt: 'Resultado de terapia capilar' },
      { src: `${uploads}/2026/03/Gemini_Generated_Image_1zjcl1zjcl1zjcl1-1.png`, alt: 'Resultado de terapia capilar' },
    ],
    process: {
      eyebrow: 'Conheça o processo de',
      title: 'Como funciona a Terapia Capilar',
      steps: [
        { number: '01', title: 'Anamnese Detalhada', description: 'Histórico capilar completo e mapeamento dos hábitos do paciente para uma visão integral do problema.' },
        { number: '02', title: 'Tricoscopia Digital', description: 'Exame de alta definição do couro cabeludo com equipamento especializado para visualização precisa.' },
        { number: '03', title: 'Diagnóstico Técnico', description: 'Identificação do problema capilar com base científica e tricológica para direcionar o tratamento.' },
        { number: '04', title: 'Protocolo Personalizado', description: 'Aplicação de técnicas terapêuticas específicas para cada caso, com acompanhamento da evolução.' },
      ],
    },
    solutions: {
      eyebrow: 'Conheça',
      title: 'Nossos Tratamentos Capilares',
      description: '',
      items: [
        { title: 'Terapia Capilar Avançada', description: 'Tratamento completo para restaurar a saúde do couro cabeludo e fortalecer os fios com protocolos exclusivos.', image: { src: `${uploads}/2026/03/capilar-5.jpg`, alt: 'Terapia capilar avançada' } },
        { title: 'Tricoscopia Capilar', description: 'Exame detalhado com aparelho de imagem para diagnóstico preciso e acompanhamento da evolução capilar.', image: { src: `${uploads}/2026/03/Gemini_Generated_Image_1zjcl1zjcl1zjcl1-1.png`, alt: 'Tricoscopia capilar' } },
        { title: 'Protocolo com Óleos Essenciais', description: 'Blend terapêutico de óleos essenciais e vegetais personalizado para inflamações, oleosidade e crescimento.', image: { src: `${uploads}/2026/03/oleoss.jpg`, alt: 'Protocolo com óleos essenciais' } },
        { title: 'Massagem Craniana Terapêutica', description: 'Técnica manual que ativa a circulação, reduz estresse e promove bem-estar e crescimento capilar.', image: { src: `${uploads}/2026/03/wmremove-transformed.jpeg`, alt: 'Massagem craniana terapêutica' } },
        { title: 'Manutenção Domiciliar', description: 'Produtos específicos indicados para potencializar resultados e manter o couro cabeludo equilibrado em casa, com orientação completa de uso.', image: { src: `${uploads}/2026/03/Gemini_Generated_Image_9thfun9thfun9thf-1.png`, alt: 'Manutenção domiciliar' } },
      ],
    },
    results: {
      eyebrow: 'Confira os',
      title: 'Resultados e Benefícios do Tratamento',
      description: 'Um protocolo individualizado acompanha a evolução do couro cabeludo e fortalece os fios de forma segura.',
      images: [
        { src: `${uploads}/2026/03/capilar-7.jpg`, alt: 'Resultado de terapia capilar antes' },
        { src: `${uploads}/2026/03/capilar-9.jpg`, alt: 'Resultado de terapia capilar depois' },
        { src: `${uploads}/2026/03/capilar-8.jpg`, alt: 'Acompanhamento de terapia capilar' },
      ],
    },
    benefits: {
      eyebrow: 'Confira os',
      items: [
        { icon: 'trending-up', title: 'Redução da queda capilar' },
        { icon: 'sliders-horizontal', title: 'Controle da oleosidade' },
        { icon: 'shield-check', title: 'Diminuição de inflamações' },
        { icon: 'badge-check', title: 'Fortalecimento dos fios' },
        { icon: 'heart-handshake', title: 'Relaxamento e bem-estar' },
        { icon: 'sparkles', title: 'Estímulo ao crescimento' },
      ],
    },
    whyChoose: {
      eyebrow: 'Saiba',
      title: 'Por que você deve\nNos Escolher',
      description: 'Nossa equipe está sempre se atualizando por meio de cursos, certificações e eventos do setor, trazendo novos conhecimentos, técnicas e tendências para oferecer o melhor a você.',
      items: ['Especialistas em constante atualização', 'Compromisso com a Saúde e Integridade dos Fios', 'Atendimento Personalizado', 'Garantia de Excelência'],
    },
    whyChooseGallery: [
      { src: `${uploads}/2026/07/institucional-jonas-elivaldo-evento-dupla-aromaterapia.webp`, alt: 'Jonas e Elivaldo em evento de aromaterapia' },
      { src: `${uploads}/2026/07/institucional-jonas-elivaldo-evento-aromaterapia.webp`, alt: 'Atendimento e ambiente de aromaterapia' },
    ],
    closingEyebrow: 'Entre em contato',
    closingImage: `${uploads}/2026/03/Gemini_Generated_Image_1zjcl1zjcl1zjcl1-1.png`,
    closingCtaLabel: 'Agende seu atendimento.',
    closingDescription: 'Agende sua avaliação capilar e descubra a causa da queda ou enfraquecimento dos seus fios.',
    ctaTitle: 'Quer recuperar a saúde do seu cabelo?',
  },
};
