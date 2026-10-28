import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, getProducts } from '@/lib/api';
import { ExplicaAiSinglePost } from '@/components/explica-ai/explica-ai-single-post';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

const DEFAULT_PIZZA_POST = {
  id: 'post-caixas-pizza-formatos-e-respiros',
  title: 'Caixas de pizza: formatos e respiros que preservam a massa',
  slug: 'caixas-de-pizza-formatos-e-respiros',
  excerpt:
    'Tudo sobre caixas oitavadas e quadradas, respiros térmicos e lacres invioláveis para sua pizzaria. Dicas práticas para manter a qualidade da pizza do forno até o cliente.',
  content:
    '<p>A caixa de pizza não é apenas uma embalagem: é a extensão da qualidade da sua cozinha até a casa do cliente. Entenda como ela protege a massa, mantém o sabor e valoriza a sua marca.</p>',
  coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
  videoUrl: null,
  videoDuration: '5 min',
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
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getPostBySlug(slug)) || (slug === DEFAULT_PIZZA_POST.slug ? DEFAULT_PIZZA_POST : null);
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

  let post = postResult;

  if (!post && (slug === 'caixas-de-pizza-formatos-e-respiros' || slug === 'caixas-de-pizza-formatos-e-respiros-que-preservam-a-massa')) {
    post = DEFAULT_PIZZA_POST;
  }

  if (!post) {
    notFound();
  }

  return <ExplicaAiSinglePost post={post} products={products} />;
}
