import type { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/catalog-view';
import { getBrands, getCategories, getOffers, getProductsPage, getSegments, getTags } from '@/lib/api';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{
  q?: string;
  categoria?: string;
  segmento?: string;
  tag?: string;
  marca?: string;
  ordem?: string;
  ordenar?: string;
  entrega?: string;
  avaliacao?: string;
  precoMin?: string;
  precoMax?: string;
  pagina?: string;
  oferta?: string;
  promocao?: string;
  mais_vendidos?: string;
}>;

const PAGE_SIZE = 20;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const isOferta = params.oferta === '1' || params.oferta === 'true' || params.promocao === '1';
  const isMaisVendidos =
    params.ordem === 'mais_vendidos' ||
    params.ordenar === 'mais-vendidos' ||
    params.mais_vendidos === '1';

  if (isOferta) {
    return {
      title: 'Ofertas do Dia | Comercial do Norte',
      description: 'Confira as melhores ofertas e descontos em embalagens, descartáveis, festas e limpeza com preços imbatíveis.',
      alternates: { canonical: '/loja?oferta=1' },
    };
  }

  if (isMaisVendidos) {
    return {
      title: 'Mais Vendidos | Comercial do Norte',
      description: 'Os produtos mais vendidos e procurados da Comercial do Norte: copos descartáveis, sacolas reforçadas, caixas de pizza e muito mais.',
      alternates: { canonical: '/loja?ordem=mais_vendidos' },
    };
  }

  return {
    title: 'Catálogo | Comercial do Norte',
    description: 'Embalagens, descartáveis, artigos para festa, limpeza e mercearia. Monte sua lista e receba a cotação.',
    alternates: { canonical: '/loja' },
  };
}

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const {
    q,
    categoria,
    segmento,
    tag,
    marca,
    ordem: rawOrdem,
    ordenar,
    entrega,
    avaliacao,
    precoMin,
    precoMax,
    pagina,
    oferta,
    promocao,
    mais_vendidos,
  } = await searchParams;

  const ordem = rawOrdem ?? (ordenar === 'mais-vendidos' ? 'mais_vendidos' : undefined);
  const isOferta = oferta === '1' || oferta === 'true' || promocao === '1';
  const isMaisVendidos = ordem === 'mais_vendidos' || mais_vendidos === '1';

  const page = Math.max(1, Number.parseInt(pagina ?? '1', 10) || 1);
  const sort = ordem === 'nome' ? 'name_asc' : isMaisVendidos ? 'mais_vendidos' : 'newest';

  const [result, categories, segments, tags, brands] = await Promise.all([
    getProductsPage({
      search: q,
      category: categoria,
      segment: segmento,
      tag,
      brand: marca,
      page,
      pageSize: PAGE_SIZE,
      sort,
      offer: isOferta,
    }),
    getCategories(),
    getSegments(),
    getTags(),
    getBrands(),
  ]);

  const activeCategory = categories.find((c) => c.slug === categoria);
  const activeSegment = segments.find((s) => s.slug === segmento);
  const activeTag = tags.find((t) => t.slug === tag);
  const activeBrand = brands.find((b) => b.slug === marca);

  let items = result.items;

  // Quando filtrado por oferta: garante que apenas produtos com desconto real de/por sejam exibidos
  if (isOferta) {
    items = items.filter((p) =>
      p.variants.some(
        (v) => (v.compareAtPriceCents ?? 0) > v.priceCents || (v.compareAtPriceCents ?? 0) > 0
      )
    );

    // Se a busca paginada não encontrou itens em oferta no banco, busca ofertas ativas reais
    if (items.length === 0) {
      const activeOffers = await getOffers(24);
      if (activeOffers.length > 0) {
        items = activeOffers;
      }
    }
  }

  // Filtros em memória complementares para ordenação por preço e faixas personalizadas
  if (precoMin) {
    const minCents = Math.round(Number(precoMin) * 100);
    items = items.filter((p) => (p.variants[0]?.priceCents ?? 0) >= minCents);
  }
  if (precoMax) {
    const maxCents = Math.round(Number(precoMax) * 100);
    items = items.filter((p) => (p.variants[0]?.priceCents ?? 0) <= maxCents);
  }
  if (ordem === 'preco_asc') {
    items = [...items].sort(
      (a, b) => (a.variants[0]?.priceCents ?? 0) - (b.variants[0]?.priceCents ?? 0)
    );
  } else if (ordem === 'preco_desc') {
    items = [...items].sort(
      (a, b) => (b.variants[0]?.priceCents ?? 0) - (a.variants[0]?.priceCents ?? 0)
    );
  }

  const pageTitle = isOferta
    ? activeCategory
      ? `Ofertas: ${activeCategory.name}`
      : activeSegment
        ? `Ofertas: ${activeSegment.name}`
        : 'Ofertas do Dia'
    : isMaisVendidos
      ? activeCategory
        ? `Mais Vendidos: ${activeCategory.name}`
        : activeSegment
          ? `Mais Vendidos: ${activeSegment.name}`
          : 'Mais Vendidos'
      : activeSegment
        ? `Segmento: ${activeSegment.name}`
        : activeCategory
          ? activeCategory.name
          : activeTag
            ? `Tag: #${activeTag.name}`
            : activeBrand
              ? `Marca: ${activeBrand.name}`
              : 'Catálogo completo';

  const breadcrumbs = isOferta
    ? [{ label: 'Ofertas do Dia' }]
    : isMaisVendidos
      ? [{ label: 'Mais Vendidos' }]
      : undefined;

  const total = isOferta && items.length !== result.items.length ? items.length : result.total;
  const totalPages =
    isOferta && items.length !== result.items.length
      ? Math.max(1, Math.ceil(items.length / PAGE_SIZE))
      : result.totalPages;

  return (
    <CatalogView
      activeBrand={activeBrand}
      activeCategory={activeCategory}
      activeSegment={activeSegment}
      activeTag={activeTag}
      baseUrl="/loja"
      brands={brands}
      breadcrumbs={breadcrumbs}
      categories={categories}
      page={result.page}
      pageSize={PAGE_SIZE}
      products={items}
      searchParamsState={{
        q,
        categoria,
        segmento,
        tag,
        marca,
        ordem,
        entrega,
        avaliacao,
        precoMin,
        precoMax,
        pagina,
        oferta: isOferta ? '1' : undefined,
        promocao,
      }}
      segments={segments}
      tags={tags}
      title={pageTitle}
      total={total}
      totalPages={totalPages}
    />
  );
}
