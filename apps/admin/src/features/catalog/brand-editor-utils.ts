export type BrandProductStatus = { status: string };

export function brandProductSummary(products: BrandProductStatus[]) {
  return products.reduce((summary, product) => {
    summary.total += 1;
    if (product.status === 'ACTIVE') summary.active += 1;
    if (product.status === 'DRAFT') summary.drafts += 1;
    if (product.status === 'ARCHIVED') summary.archived += 1;
    return summary;
  }, { total: 0, active: 0, drafts: 0, archived: 0 });
}

export function slugifyBrandName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
