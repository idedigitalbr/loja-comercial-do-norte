import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, getProducts } from '@/lib/api';
import { ExplicaAiSinglePost } from '@/components/explica-ai/explica-ai-single-post';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

const DEFAULT_POSTS_BY_SLUG: Record<string, {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  videoUrl: string;
  videoDuration: string;
  authorName: string;
  badges: string[];
  status: string;
  publishedAt: string;
  views: number;
  conceptTag: string;
  category: { id: string; name: string; slug: string };
}> = {
  'caixas-de-pizza-formatos-e-respiros': {
    id: 'post-caixas-pizza-formatos-e-respiros',
    title: 'Caixas de pizza: formatos e respiros que preservam a massa',
    slug: 'caixas-de-pizza-formatos-e-respiros',
    excerpt:
      'Tudo sobre caixas oitavadas e quadradas, respiros térmicos e lacres invioláveis para sua pizzaria. Dicas práticas para manter a qualidade da pizza do forno até o cliente.',
    content:
      '<p>A caixa de pizza não é apenas uma embalagem: é a extensão da qualidade da sua cozinha até a casa do cliente. Entenda como ela protege a massa, mantém o sabor e valoriza a sua marca.</p><h3>O que observar na escolha da caixa:</h3><ul><li><strong>Respiros de ar:</strong> garantem a saída controlada de vapor sem esfriar a pizza.</li><li><strong>Oitavadas vs Quadradas:</strong> as caixas oitavadas evitam que a pizza deslize dentro da caixa durante a entrega.</li><li><strong>Lacre de segurança:</strong> obrigatório e indispensável para transmitir confiança ao cliente final.</li></ul>',
    coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
    videoUrl: 'https://www.youtube.com/shorts/m6drhnZQmCM',
    videoDuration: '2:18',
    authorName: 'Comercial do Norte',
    badges: ['PIZZARIAS', 'TRANSPORTE SEGURO'],
    status: 'ACTIVE',
    publishedAt: '2026-10-27T10:00:00.000Z',
    views: 12500,
    conceptTag: 'Conceito 7',
    category: {
      id: 'cat-embalagens-delivery',
      name: 'Embalagens & Delivery',
      slug: 'embalagens-delivery',
    },
  },
  'caixas-de-pizza-formatos-e-respiros-que-preservam-a-massa': {
    id: 'post-caixas-pizza-formatos-e-respiros',
    title: 'Caixas de pizza: formatos e respiros que preservam a massa',
    slug: 'caixas-de-pizza-formatos-e-respiros',
    excerpt:
      'Tudo sobre caixas oitavadas e quadradas, respiros térmicos e lacres invioláveis para sua pizzaria. Dicas práticas para manter a qualidade da pizza do forno até o cliente.',
    content:
      '<p>A caixa de pizza não é apenas uma embalagem: é a extensão da qualidade da sua cozinha até a casa do cliente. Entenda como ela protege a massa, mantém o sabor e valoriza a sua marca.</p><h3>O que observar na escolha da caixa:</h3><ul><li><strong>Respiros de ar:</strong> garantem a saída controlada de vapor sem esfriar a pizza.</li><li><strong>Oitavadas vs Quadradas:</strong> as caixas oitavadas evitam que a pizza deslize dentro da caixa durante a entrega.</li><li><strong>Lacre de segurança:</strong> obrigatório e indispensável para transmitir confiança ao cliente final.</li></ul>',
    coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
    videoUrl: 'https://www.youtube.com/shorts/m6drhnZQmCM',
    videoDuration: '2:18',
    authorName: 'Comercial do Norte',
    badges: ['PIZZARIAS', 'TRANSPORTE SEGURO'],
    status: 'ACTIVE',
    publishedAt: '2026-10-27T10:00:00.000Z',
    views: 12500,
    conceptTag: 'Conceito 7',
    category: {
      id: 'cat-embalagens-delivery',
      name: 'Embalagens & Delivery',
      slug: 'embalagens-delivery',
    },
  },
  'copos-e-tampas-para-acai-e-cafe': {
    id: 'post-copos-e-tampas-para-acai-e-cafe',
    title: 'Copos e tampas para açaí e café',
    slug: 'copos-e-tampas-para-acai-e-cafe',
    excerpt:
      'O copo certo faz a diferença. Combine a tampa com sua bebida. Evite vazamentos no transporte e valorize sua entrega.',
    content:
      '<p>Escolher a combinação ideal de copo e tampa é fundamental para evitar vazamentos no transporte e garantir a melhor experiência para o seu cliente, seja servindo um café bem quente ou um açaí gelado com complementos.</p><h3>Dicas práticas do Nort:</h3><ul><li><strong>Tampa Bolha para Açaí:</strong> permite adicionar frutas, granola e camadas generosas sem amassar a cobertura.</li><li><strong>Tampa Bico para Café e Bebidas Quentes:</strong> mantém a temperatura por mais tempo e permite consumo durante o trajeto sem respingos.</li><li><strong>Copo Térmico vs Copo Cristal PP:</strong> use copos térmicos para cafés e caldos; para açaí e vitaminas, prefira os copos ultra transparentes para destacar as camadas.</li></ul>',
    coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
    videoUrl: 'https://www.youtube.com/shorts/m6drhnZQmCM',
    videoDuration: '2:18',
    authorName: 'Comercial do Norte',
    badges: ['AÇAÍ & CAFÉ', 'GUIA PRÁTICO'],
    status: 'ACTIVE',
    publishedAt: '2026-10-27T10:00:00.000Z',
    views: 14200,
    conceptTag: 'Conceito 7',
    category: {
      id: 'cat-food-service-bebidas',
      name: 'Food Service & Bebidas',
      slug: 'food-service-bebidas',
    },
  },
  'embalagens-kraft-para-o-seu-delivery': {
    id: 'post-embalagens-kraft-para-o-seu-delivery',
    title: 'Embalagens kraft para o seu delivery',
    slug: 'embalagens-kraft-para-o-seu-delivery',
    excerpt:
      'Mais praticidade com embalagens kraft. Combine formato e resistência. Valorize a apresentação do seu delivery.',
    content:
      '<p>As embalagens de papel kraft revolucionaram o delivery de comida e fast-food com apelo sustentável e excelente respirabilidade, mantendo alimentos fritos crocantes por muito mais tempo.</p><h3>Vantagens para o seu negócio:</h3><ul><li><strong>Apresentação premium:</strong> visual artesanal que eleva o valor percebido do seu prato.</li><li><strong>Resistência a gordura:</strong> opções com barreira antigordura para hambúrgueres e batatas.</li><li><strong>Sustentabilidade:</strong> material 100% biodegradável e reciclável.</li></ul>',
    coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
    videoUrl: 'https://www.youtube.com/shorts/m6drhnZQmCM',
    videoDuration: '2:18',
    authorName: 'Comercial do Norte',
    badges: ['DELIVERY', 'LINHA KRAFT'],
    status: 'ACTIVE',
    publishedAt: '2026-10-27T10:00:00.000Z',
    views: 18900,
    conceptTag: 'Conceito 7',
    category: {
      id: 'cat-embalagens-delivery',
      name: 'Embalagens & Delivery',
      slug: 'embalagens-delivery',
    },
  },
  'decoracao-de-doces-e-bolos-com-chantilly': {
    id: 'post-decoracao-de-doces-e-bolos-com-chantilly',
    title: 'Decoração de doces e bolos com chantilly profissional',
    slug: 'decoracao-de-doces-e-bolos-com-chantilly',
    excerpt:
      'Dicas práticas de confeitaria caseira para encantar clientes e aumentar suas vendas de doces.',
    content:
      '<p>A confeitaria profissional exige domínio de ponto, temperatura e uso correto dos bicos de confeitar. Com as técnicas certas, você valoriza seus bolos de festa e sobremesas para vitrine.</p><h3>Principais recomendações:</h3><ul><li><strong>Ponto Chantininho:</strong> mistura estável ideal para climas quentes.</li><li><strong>Bicos 1M e 2D:</strong> os clássicos para rosetas perfeitas e acabamentos elegantes.</li><li><strong>Embalagens altas com trava:</strong> garantem que o topo decorado chegue intacto.</li></ul>',
    coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
    videoUrl: 'https://www.youtube.com/shorts/m6drhnZQmCM',
    videoDuration: '2:18',
    authorName: 'Comercial do Norte',
    badges: ['CONFEITARIA', 'DOCES & BOLOS'],
    status: 'ACTIVE',
    publishedAt: '2026-10-27T10:00:00.000Z',
    views: 9800,
    conceptTag: 'Conceito 7',
    category: {
      id: 'cat-confeitaria-festas',
      name: 'Confeitaria & Festas',
      slug: 'confeitaria-festas',
    },
  },
};

const DEFAULT_PIZZA_POST = DEFAULT_POSTS_BY_SLUG['caixas-de-pizza-formatos-e-respiros'];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getPostBySlug(slug)) || DEFAULT_POSTS_BY_SLUG[slug] || null;
  if (!post) return { title: 'Post não encontrado | Comercial do Norte' };

  return {
    title: `${post.title} | Explica Aí Nort!`,
    description: post.excerpt || `Dicas práticas sobre embalagens e negócios na Comercial do Norte.`,
    alternates: { canonical: `/post/${slug}` },
  };
}

export default async function SinglePostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [postResult, products] = await Promise.all([
    getPostBySlug(slug),
    getProducts({ limit: 10 }),
  ]);

  let post = postResult || DEFAULT_POSTS_BY_SLUG[slug] || null;

  if (!post) {
    notFound();
  }

  // Se o post vier do banco sem videoUrl, garante o vídeo oficial do YouTube fornecido
  if (!post.videoUrl) {
    post = {
      ...post,
      videoUrl: 'https://www.youtube.com/shorts/m6drhnZQmCM',
    };
  }

  return <ExplicaAiSinglePost post={post} products={products} />;
}
