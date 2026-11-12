import { describe, expect, it } from 'vitest';
import { evaluateProductHealth, evaluateVariantHealth, validatePublishRequirements } from './catalog-health';

describe('catalog-health', () => {
  it('returns GREEN when product and variant have complete commercial and shipping fields', () => {
    const result = evaluateProductHealth({
      name: 'Embalagem P-65M Torta Plasan',
      description: 'Embalagem para torta confeitaria Plasan caixa com 50 unidades.',
      brandId: 'brand-1',
      hasCategory: true,
      hasPrimaryImage: true,
      variants: [
        {
          sku: 'CN-4000565658988',
          priceCents: 4990,
          weightGrams: 1200,
          widthMm: 300,
          heightMm: 180,
          lengthMm: 300,
          gtinRaw: '4000565658988',
          gtinStatus: 'GTIN_DIGITO_VALIDO',
          gtinValid: true,
        },
      ],
    });

    expect(result.auditHealth).toBe('GREEN');
    expect(result.auditIssueCodes).toEqual([]);
    expect(result.canPublish).toBe(true);
    expect(result.freightReady).toBe(true);
  });

  it('allows publishing with only name, SKU and primary image, tagging missing price/freight as YELLOW', () => {
    const result = evaluateProductHealth({
      name: 'Copo Cristal 200ml',
      description: 'Copo descartável para eventos.',
      brandId: 'brand-1',
      hasCategory: true,
      hasPrimaryImage: true,
      variants: [
        {
          sku: 'CN-COPO-200',
          priceCents: null,
          weightGrams: null,
          widthMm: null,
          heightMm: null,
          lengthMm: null,
        },
      ],
    });

    expect(result.canPublish).toBe(true);
    expect(result.missingPublishFields).toEqual([]);
    expect(result.auditHealth).toBe('YELLOW');
    expect(result.auditIssueCodes).toEqual(['SEM_PRECO', 'SEM_PESO_FRETE', 'SEM_DIMENSOES_FRETE']);
    expect(result.freightReady).toBe(false);
  });

  it('blocks publish only when name, primary image, or SKU is missing, while surfacing RED audit tags for bad GTIN or divergent image', () => {
    const missingPhoto = validatePublishRequirements({
      name: 'Produto Teste',
      hasPrimaryImage: false,
      primaryVariantSku: 'SKU-1',
    });
    expect(missingPhoto).toEqual(['mainImage']);

    const redVariant = evaluateVariantHealth({
      sku: 'CN-7898302985268',
      priceCents: null,
      extraIssueCodes: ['gtin_digito_verificador_invalido'],
    });
    expect(redVariant.auditHealth).toBe('RED');
    expect(redVariant.auditIssueCodes).toContain('GTIN_INVALIDO');
    expect(redVariant.auditIssueCodes).toContain('SEM_PRECO');
  });
});
