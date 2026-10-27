import { useEffect, useState } from 'react';
import { ImageDraft, ProductDraft, ProductForm, VariantDraft, ProductTaxonomyOption } from './product-form';

type TaxonomyItem = ProductTaxonomyOption & { status: string };
type ApiProduct = Omit<ProductDraft, 'variants' | 'images'> & { id: string; status: string; brand?: { id: string; name: string } | null; categories?: Array<{ category: TaxonomyItem }>; segments?: Array<{ segment: TaxonomyItem }>; tags?: Array<{ tag: TaxonomyItem }>; variants?: Array<VariantDraft & { id: string; inventoryBalance?: { physicalQuantity: number; reservedQuantity?: number } | null }>; images?: Array<ImageDraft & { isPrimary: boolean }> };

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Não foi possível carregar o produto.');
  return response.json() as Promise<T>;
}

function toDraft(product: ApiProduct | null): ProductDraft | undefined {
  if (!product) return undefined;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    status: product.status,
    brandId: product.brand?.id,
    categoryIds: product.categories?.map(({ category }) => category.id) ?? [],
    segmentIds: product.segments?.map(({ segment }) => segment.id) ?? [],
    tagIds: product.tags?.map(({ tag }) => tag.id) ?? [],
    variants: product.variants?.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      priceCents: variant.priceCents,
      compareAtPriceCents: variant.compareAtPriceCents,
      weightGrams: variant.weightGrams,
      widthMm: variant.widthMm,
      heightMm: variant.heightMm,
      lengthMm: variant.lengthMm,
      inventoryQuantity: variant.inventoryBalance?.physicalQuantity ?? variant.inventoryQuantity,
      manageStock: variant.manageStock,
      stockStatus: variant.stockStatus,
      lowStockThreshold: variant.lowStockThreshold,
    })) ?? [],
    images: product.images?.map((image) => ({
      path: image.path,
      altText: image.altText,
      sortOrder: image.sortOrder,
      isPrimary: image.isPrimary,
      variantId: image.variantId,
    })) ?? [],
  };
}

export function ProductEditorPage({ productId, onBack, onOpenProduct }: { productId?: string; onBack: () => void; onOpenProduct: (id: string) => void }) {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [brands, setBrands] = useState<TaxonomyItem[]>([]);
  const [categories, setCategories] = useState<TaxonomyItem[]>([]);
  const [segments, setSegments] = useState<TaxonomyItem[]>([]);
  const [tags, setTags] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    void Promise.all([
      getJson<TaxonomyItem[]>('/api/v1/admin/catalog/brands'),
      getJson<TaxonomyItem[]>('/api/v1/admin/catalog/categories'),
      getJson<TaxonomyItem[]>('/api/v1/admin/catalog/segments').catch(() => []),
      getJson<TaxonomyItem[]>('/api/v1/admin/catalog/tags').catch(() => []),
      productId ? getJson<ApiProduct>(`/api/v1/admin/catalog/products/${productId}`) : Promise.resolve(null),
    ]).then(([brandList, categoryList, segmentList, tagList, loadedProduct]) => {
      if (!active) return;
      setBrands(brandList); setCategories(categoryList); setSegments(segmentList); setTags(tagList); setProduct(loadedProduct); setError('');
    }).catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : 'Não foi possível carregar o editor.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId]);

  async function saveProduct(draft: ProductDraft) {
    const { id: _id, status: _status, ...payloadDraft } = draft;
    const response = await fetch(productId ? `/api/v1/admin/catalog/products/${productId}` : '/api/v1/admin/catalog/products', { method: productId ? 'PATCH' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadDraft) });
    const payload = await response.json().catch(() => null) as ApiProduct | { message?: string } | null;
    if (!response.ok) throw new Error((payload as { message?: string } | null)?.message ?? 'Não foi possível salvar o produto.');
    setMessage(productId ? 'Produto atualizado.' : 'Produto criado como rascunho.');
    if (!productId && payload && 'id' in payload) onOpenProduct(payload.id);
  }

  async function publishProduct() {
    if (!productId) return;
    const response = await fetch(`/api/v1/admin/catalog/products/${productId}/publish`, { method: 'POST', credentials: 'include' });
    if (!response.ok) throw new Error('Não foi possível publicar o produto.');
    setMessage('Produto publicado.');
    setProduct((current) => current ? { ...current, status: 'ACTIVE' } : current);
  }

  const title = productId ? 'Editar produto' : 'Novo produto';
  return <section className="admin-page admin-product-page"><nav className="product-editor__breadcrumb" aria-label="Breadcrumb"><button type="button" onClick={onBack}>Catálogo</button><span>›</span><button type="button" onClick={onBack}>Produtos</button><span>›</span><strong>{title}</strong></nav><div className="admin-page__heading product-editor__page-heading"><div><p className="admin-eyebrow">WooCommerce / catálogo</p><h2>{title}</h2></div><p>Complete os dados comerciais e publique quando a ficha estiver pronta.</p></div>{message ? <p className="admin-success" role="status">{message}</p> : null}{error ? <p className="admin-error" role="alert">{error}</p> : null}{loading ? <div className="admin-card admin-empty-state"><p>Carregando editor…</p></div> : <ProductForm initialValue={toDraft(product)} brands={brands} categories={categories} segments={segments} tags={tags} onSave={saveProduct} onPublish={productId ? publishProduct : undefined} onCancel={onBack} />}</section>;
}
