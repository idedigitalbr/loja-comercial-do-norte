export type BrandOption = { id?: string; value: string; label: string; parentId?: string | null; imagePath?: string | null };
export type FlatBrandOption = BrandOption & { depth: number };

export function flattenBrandTree(options: BrandOption[]): FlatBrandOption[] {
  const byParent = new Map<string | null, BrandOption[]>();
  for (const option of options) {
    const parent = option.parentId ?? null;
    byParent.set(parent, [...(byParent.get(parent) ?? []), option]);
  }
  for (const siblings of byParent.values()) siblings.sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'));

  const flattened: FlatBrandOption[] = [];
  function visit(parentId: string | null, depth: number) {
    for (const option of byParent.get(parentId) ?? []) {
      const imagePath = depth === 0 ? option.imagePath : undefined;
      flattened.push({ value: option.value, label: option.label, parentId: option.parentId ?? null, depth, ...(imagePath ? { imagePath } : {}) });
      visit(option.id ?? option.value, depth + 1);
    }
  }
  visit(null, 0);
  return flattened;
}
