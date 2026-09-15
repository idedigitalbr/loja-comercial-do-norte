export type TaxonomyOption = { id: string; name: string; parentId?: string | null };
export type FlattenedTaxonomyOption = TaxonomyOption & { depth: number };

export function slugifyProductName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function flattenTaxonomy(options: TaxonomyOption[]): FlattenedTaxonomyOption[] {
  const byParent = new Map<string | null, TaxonomyOption[]>();
  options.forEach((option) => {
    const parentId = option.parentId ?? null;
    byParent.set(parentId, [...(byParent.get(parentId) ?? []), option]);
  });
  byParent.forEach((siblings) => siblings.sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')));

  const result: FlattenedTaxonomyOption[] = [];
  function visit(parentId: string | null, depth: number) {
    for (const option of byParent.get(parentId) ?? []) {
      result.push({ ...option, parentId: option.parentId ?? null, depth });
      visit(option.id, depth + 1);
    }
  }
  visit(null, 0);
  return result;
}
