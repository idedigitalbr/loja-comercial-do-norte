import type { NortTourStep } from './nort-tour-types';

export const NORT_TOUR_STEPS: NortTourStep[] = [
  {
    id: 'step-welcome',
    selector: '#tour-header-nort',
    mobileSelector: '#tour-header-logo',
    title: 'Oi! Eu sou o Nort! 👋',
    message:
      'Seja muito bem-vindo à Loja Comercial do Norte! Vou te guiar rapidinho pelo nosso site para você conhecer onde encontrar produtos, novidades e montar suas cotações sem complicação.',
    badge: 'Boas-vindas',
    mascotPose:
      '/assets/HOME%20Vitrine/S0-HEADER/Mascote-3D-NORT/corpo-inteiro/nort-boas-vindas.png',
    mascotAlt: 'Mascote Nort de braços abertos dando boas-vindas',
    balloonSide: 'bottom',
    highlightPadding: 16,
    highlightRadius: 20,
  },
  {
    id: 'step-search',
    selector: '#tour-header-search',
    mobileSelector: '#tour-header-search',
    title: 'Busca Rápida de Produtos 🔍',
    message:
      'Aqui na nossa barra de busca você encontra mais de 5.000 itens! Digite copos térmicos, sacolas kraft, caixas de pizza, descartáveis ou sua marca favorita e aperte Enter.',
    badge: 'Busca Inteligente',
    mascotPose:
      '/assets/HOME%20Vitrine/S0-HEADER/Mascote-3D-NORT/corpo-inteiro/nort-apontando-joinha.png',
    mascotAlt: 'Mascote Nort apontando com joinha',
    balloonSide: 'bottom',
    highlightPadding: 10,
    highlightRadius: 28,
  },
  {
    id: 'step-categories',
    selector: '#tour-header-categories',
    mobileSelector: '#tour-header-mobile-menu',
    title: 'Departamentos & Segmentos 📦',
    message:
      'Abra este menu para navegar por todas as nossas categorias: Embalagens, Descartáveis, Sacos & Sacolas, Higiene e mais. Você também pode filtrar direto pelo seu ramo: Padaria, Pizzaria, Delivery ou Hamburgueria!',
    badge: 'Navegação Completa',
    mascotPose: '/assets/explica-ai/mascote-nort-apontando.webp',
    mascotAlt: 'Mascote Nort apontando para os departamentos',
    balloonSide: 'bottom',
    highlightPadding: 10,
    highlightRadius: 14,
  },
  {
    id: 'step-content',
    selector: '#tour-header-content',
    mobileSelector: '#tour-header-mobile-menu',
    title: 'Explica Aí & Workshops 🎓',
    message:
      'Quer aprender receitas e dicas de negócios? No "Explica Aí Nort" postamos artigos e novidades do setor, e em "Workshops" você confere nossa agenda de aulas práticas de confeitaria com chefs renomados!',
    badge: 'Conteúdos & Aulas',
    mascotPose:
      '/assets/HOME%20Vitrine/S0-HEADER/Mascote-3D-NORT/corpo-inteiro/nort-pensativo.png',
    mascotAlt: 'Mascote Nort com a mão no queixo pensativo',
    balloonSide: 'bottom',
    highlightPadding: 8,
    highlightRadius: 16,
  },
  {
    id: 'step-deals',
    selector: '#tour-header-deals',
    mobileSelector: '#tour-header-search',
    title: 'Mais Vendidos & Ofertas do Dia 🔥',
    message:
      'Economia de verdade para seu estoque! Aqui você encontra os produtos mais procurados pelos comerciantes e promoções imperdíveis com preço de atacado e varejo.',
    badge: 'Economia Garantida',
    mascotPose:
      '/assets/HOME%20Vitrine/S0-HEADER/Mascote-3D-NORT/corpo-inteiro/nort-ofertas.png',
    mascotAlt: 'Mascote Nort empolgado com as promoções',
    balloonSide: 'bottom',
    highlightPadding: 8,
    highlightRadius: 16,
  },
  {
    id: 'step-location',
    selector: '#tour-header-location',
    mobileSelector: '#tour-header-location-mobile',
    title: 'Entrega e Retirada nas Lojas 🚚',
    message:
      'Informe seu CEP para consultar entregas expressas em Belém e Região Metropolitana, ou veja a localização das nossas unidades físicas: Bernardo Sayão e Jurunas.',
    badge: 'Entrega & CEP',
    mascotPose:
      '/assets/HOME%20Vitrine/S0-HEADER/Mascote-3D-NORT/corpo-inteiro/nort-notebook-em-pe.png',
    mascotAlt: 'Mascote Nort mostrando o notebook em pé',
    balloonSide: 'bottom',
    highlightPadding: 10,
    highlightRadius: 14,
  },
  {
    id: 'step-quote',
    selector: '#tour-header-quote',
    mobileSelector: '#tour-header-quote',
    title: 'Sua Lista de Cotação 📋',
    message:
      'Nosso catálogo funciona por cotação! Adicione os produtos à sua lista com facilidade. Quando terminar, nossa equipe de vendas recebe seus itens e envia o orçamento rápido no WhatsApp.',
    badge: 'Cotação Rápida',
    mascotPose:
      '/assets/HOME%20Vitrine/S0-HEADER/Mascote-3D-NORT/corpo-inteiro/nort-entrega-pedidos.png',
    mascotAlt: 'Mascote Nort organizando os pedidos',
    balloonSide: 'bottom',
    highlightPadding: 12,
    highlightRadius: 18,
  },
  {
    id: 'step-whatsapp',
    selector: '#tour-header-whatsapp',
    mobileSelector: '#tour-header-whatsapp',
    title: 'WhatsApp Vendas & Atendimento 💬',
    message:
      'Ficou com alguma dúvida, quer negociar em grande quantidade ou precisa de ajuda técnica? Nosso time de especialistas está pronto para falar com você com um simples clique!',
    badge: 'Fale Conosco',
    mascotPose:
      '/assets/HOME%20Vitrine/S0-HEADER/Mascote-3D-NORT/corpo-inteiro/nort-celular.png',
    mascotAlt: 'Mascote Nort com celular na mão',
    balloonSide: 'bottom',
    highlightPadding: 8,
    highlightRadius: 16,
  },
  {
    id: 'step-finish',
    selector: '#tour-header-nort',
    mobileSelector: '#tour-header-logo',
    title: 'Tudo pronto para navegar! 🎉',
    message:
      'Prontinho! Agora você já sabe tudo sobre a Comercial do Norte. Se quiser rever este tour a qualquer momento, é só clicar em mim no topo da tela e escolher "Ver tour guiado novamente". Boas compras e ótimas cotações!',
    badge: 'Tour Concluído',
    mascotPose:
      '/assets/HOME%20Vitrine/S0-HEADER/Mascote-3D-NORT/principais/nort-sorridente-joinha.png',
    mascotAlt: 'Mascote Nort sorridente com joinha',
    balloonSide: 'bottom',
    highlightPadding: 16,
    highlightRadius: 20,
  },
];
