import { describe, expect, it } from 'vitest';
import { brandProductSummary } from './brand-editor-utils';

describe('brand editor utilities', () => {
  it('summarizes brand product status counts', () => {
    expect(brandProductSummary([
      { status: 'ACTIVE' },
      { status: 'ACTIVE' },
      { status: 'DRAFT' },
      { status: 'ARCHIVED' },
    ])).toEqual({ total: 4, active: 2, drafts: 1, archived: 1 });
  });
});
