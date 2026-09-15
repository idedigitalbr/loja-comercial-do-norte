import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

describe('CatalogController', () => {
  it('resolves CatalogService through its explicit Nest token', async () => {
    const catalogService = {
      listProducts: vi.fn().mockResolvedValue([]),
      getProductBySlug: vi.fn().mockResolvedValue(null),
      listBrands: vi.fn().mockResolvedValue([]),
      listCategories: vi.fn().mockResolvedValue([]),
    };
    const module = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [{ provide: CatalogService, useValue: catalogService }],
    }).compile();

    const controller = module.get(CatalogController);
    await controller.listProducts({ search: 'haskell' });

    expect(catalogService.listProducts).toHaveBeenCalledWith({ search: 'haskell' });
  });
});
