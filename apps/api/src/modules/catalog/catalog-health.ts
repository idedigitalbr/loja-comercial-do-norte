import type { CatalogAuditHealth } from '@prisma/client';

export type CatalogIssueSeverity = 'RED' | 'YELLOW';

export interface CatalogAuditIssue {
  code: string;
  severity: CatalogIssueSeverity;
  title: string;
  message: string;
  field?: string;
  blockingPublish?: boolean;
}

export interface CatalogIssueDefinition {
  severity: CatalogIssueSeverity;
  title: string;
  message: string;
  field?: string;
  blockingPublish?: boolean;
}

export const CATALOG_ISSUE_DEFINITIONS: Record<string, CatalogIssueDefinition> = {
  SEM_NOME: {
    severity: 'RED',
    title: 'Nome ausente',
    message: 'Informe o nome do produto para identificá-lo na loja.',
    field: 'name',
    blockingPublish: true,
  },
  SEM_FOTO: {
    severity: 'RED',
    title: 'Sem foto principal',
    message: 'Cadastre ao menos 1 imagem marcada como principal antes de publicar.',
    field: 'mainImage',
    blockingPublish: true,
  },
  SEM_SKU: {
    severity: 'RED',
    title: 'Sem SKU',
    message: 'Defina um código SKU único na variação principal do produto.',
    field: 'sku',
    blockingPublish: true,
  },
  GTIN_INVALIDO: {
    severity: 'RED',
    title: 'GTIN / código de barras inválido',
    message: 'O código de barras informado falhou na validação do dígito verificador.',
    field: 'gtinRaw',
  },
  CODIGO_DUPLICADO: {
    severity: 'RED',
    title: 'Código repetido no catálogo',
    message: 'O mesmo código de barras apareceu em outro produto diferente no catálogo.',
    field: 'gtinRaw',
  },
  FOTO_DIVERGENTE: {
    severity: 'RED',
    title: 'Foto divergente do produto',
    message: 'A imagem vinculada apresenta divergência visual em relação ao título/cor.',
    field: 'images',
  },
  CONFLITO_SOBREPOSICAO_PDF: {
    severity: 'RED',
    title: 'Conflito visual no PDF',
    message: 'Sobreposição de diagramação detectada no catálogo PDF; revise imagem e código.',
    field: 'images',
  },
  ESPECIFICACAO_SUSPEITA: {
    severity: 'RED',
    title: 'Especificação suspeita',
    message: 'As dimensões ou especificações extraídas do PDF requerem conferência manual.',
    field: 'dimensionsRaw',
  },
  SEM_PRECO: {
    severity: 'YELLOW',
    title: 'Sob cotação (sem preço)',
    message: 'Produto ainda sem preço definido; permanece em modo Sob cotação até futura ativação de checkout.',
    field: 'priceCents',
  },
  SEM_PESO_FRETE: {
    severity: 'YELLOW',
    title: 'Sem peso de envio',
    message: 'Peso logístico em gramas não preenchido (necessário futuramente para cálculo de frete).',
    field: 'weightGrams',
  },
  SEM_DIMENSOES_FRETE: {
    severity: 'YELLOW',
    title: 'Sem dimensões de envio',
    message: 'Largura, altura e comprimento em mm incompletos para cálculo futuro de frete.',
    field: 'dimensionsMm',
  },
  FOTO_COMPARTILHADA: {
    severity: 'YELLOW',
    title: 'Foto compartilhada (conferir)',
    message: 'A mesma foto está associada a mais de um produto distinto no catálogo e deve ser confirmada.',
    field: 'images',
  },
  FOTO_BAIXA_RESOLUCAO: {
    severity: 'YELLOW',
    title: 'Foto em baixa resolução',
    message: 'Imagem nativa com largura/altura reduzida; substitua quando houver foto melhor.',
    field: 'images',
  },
  GTIN_AUSENTE: {
    severity: 'YELLOW',
    title: 'Sem código de barras',
    message: 'Nenhum EAN/GTIN informado no catálogo original.',
    field: 'gtinRaw',
  },
  GTIN_NAO_PADRAO: {
    severity: 'YELLOW',
    title: 'Código não padrão GTIN',
    message: 'Código informado no catálogo difere do padrão EAN/GTIN comercial.',
    field: 'gtinRaw',
  },
  GRADE_SEM_GTIN_INDIVIDUAL: {
    severity: 'YELLOW',
    title: 'Grade sem EAN individual',
    message: 'Item pertencente a grade numérica sem código de barras individual.',
    field: 'gtinRaw',
  },
  SEM_MARCA: {
    severity: 'YELLOW',
    title: 'Sem marca vinculada',
    message: 'Vincule o produto a uma marca para melhorar filtros e vitrine.',
    field: 'brandId',
  },
  SEM_CATEGORIA: {
    severity: 'YELLOW',
    title: 'Sem categoria',
    message: 'Associe ao menos uma categoria para exibir corretamente na navegação.',
    field: 'categoryIds',
  },
  SEM_DESCRICAO: {
    severity: 'YELLOW',
    title: 'Sem descrição',
    message: 'Inclua uma descrição comercial para facilitar busca e atendimento.',
    field: 'description',
  },
};

export interface VariantHealthInput {
  sku?: string | null;
  priceCents?: number | null;
  weightGrams?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
  lengthMm?: number | null;
  gtinRaw?: string | null;
  gtinStatus?: string | null;
  gtinValid?: boolean | null;
  extraIssueCodes?: string[];
}

export interface ProductHealthInput {
  name?: string | null;
  description?: string | null;
  brandId?: string | null;
  hasCategory?: boolean;
  categoryCount?: number;
  hasPrimaryImage?: boolean;
  images?: Array<{
    isPrimary?: boolean;
    imageStatus?: string | null;
    widthPx?: number | null;
    heightPx?: number | null;
  }>;
  variants: VariantHealthInput[];
  extraIssueCodes?: string[];
}

export interface HealthEvaluationResult {
  auditHealth: CatalogAuditHealth;
  auditIssueCodes: string[];
  auditIssues: CatalogAuditIssue[];
  missingPublishFields: string[];
  canPublish: boolean;
  freightReady: boolean;
}

const IGNORED_RAW_AUDIT_TAGS = new Set([
  'imagem_compartilhada_entre_variantes_de_cor',
]);

export function mapRawPendencyToIssueCode(raw: string): string | null {
  const normalized = raw.trim();
  if (!normalized || IGNORED_RAW_AUDIT_TAGS.has(normalized)) return null;
  if (normalized in CATALOG_ISSUE_DEFINITIONS) return normalized;

  if (normalized === 'gtin_digito_verificador_invalido') return 'GTIN_INVALIDO';
  if (normalized === 'codigo_barras_repetido_no_pdf') return 'CODIGO_DUPLICADO';
  if (normalized === 'foto_com_cor_divergente_do_titulo_no_pdf' || normalized.startsWith('divergencia_visual_cor_pdf')) {
    return 'FOTO_DIVERGENTE';
  }
  if (normalized.startsWith('conflito_visual_pdf_sobreposicao')) return 'CONFLITO_SOBREPOSICAO_PDF';
  if (normalized.startsWith('especificacao_dimensoes_suspeita')) return 'ESPECIFICACAO_SUSPEITA';
  if (
    normalized === 'imagem_identica_compartilhada_entre_produtos_distintos_no_pdf'
    || normalized === 'foto_compartilhada_entre_produtos_distintos_conferir'
  ) {
    return 'FOTO_COMPARTILHADA';
  }
  if (normalized === 'foto_nativa_baixa_resolucao' || normalized.startsWith('baixa_resolucao_nativa')) {
    return 'FOTO_BAIXA_RESOLUCAO';
  }
  if (normalized === 'codigo_nao_informado_no_catalogo') return 'GTIN_AUSENTE';
  if (normalized === 'codigo_formato_nao_gtin_padrao') return 'GTIN_NAO_PADRAO';
  if (normalized.startsWith('grade_numerica')) return 'GRADE_SEM_GTIN_INDIVIDUAL';
  return null;
}

function buildIssue(code: string): CatalogAuditIssue {
  const def = CATALOG_ISSUE_DEFINITIONS[code];
  if (def) {
    return { code, ...def };
  }
  return {
    code,
    severity: 'YELLOW',
    title: code,
    message: `Pendência sinalizada no catálogo: ${code}.`,
  };
}

export function isVariantFreightReady(variant: Pick<VariantHealthInput, 'weightGrams' | 'widthMm' | 'heightMm' | 'lengthMm'>): boolean {
  return Boolean(
    variant.weightGrams && variant.weightGrams > 0
    && variant.widthMm && variant.widthMm > 0
    && variant.heightMm && variant.heightMm > 0
    && variant.lengthMm && variant.lengthMm > 0,
  );
}

export function evaluateVariantHealth(variant: VariantHealthInput): Omit<HealthEvaluationResult, 'missingPublishFields' | 'canPublish'> {
  const codes = new Set<string>();

  if (!variant.sku || !variant.sku.trim()) codes.add('SEM_SKU');
  if (variant.priceCents == null || variant.priceCents <= 0) codes.add('SEM_PRECO');
  if (!variant.weightGrams || variant.weightGrams <= 0) codes.add('SEM_PESO_FRETE');
  if (!variant.widthMm || variant.widthMm <= 0 || !variant.heightMm || variant.heightMm <= 0 || !variant.lengthMm || variant.lengthMm <= 0) {
    codes.add('SEM_DIMENSOES_FRETE');
  }

  if (variant.gtinValid === false || variant.gtinStatus === 'GTIN_DIGITO_INVALIDO') {
    codes.add('GTIN_INVALIDO');
  } else if (variant.gtinStatus === 'FORMATO_NAO_GTIN') {
    codes.add('GTIN_NAO_PADRAO');
  } else if (variant.gtinStatus === 'SEM_CODIGO' || (!variant.gtinRaw && variant.gtinStatus != null)) {
    codes.add('GTIN_AUSENTE');
  }

  for (const raw of variant.extraIssueCodes ?? []) {
    const mapped = mapRawPendencyToIssueCode(raw);
    if (mapped) codes.add(mapped);
  }

  const auditIssues = Array.from(codes).map(buildIssue);
  const auditHealth: CatalogAuditHealth = auditIssues.some((issue) => issue.severity === 'RED')
    ? 'RED'
    : auditIssues.length > 0
      ? 'YELLOW'
      : 'GREEN';

  return {
    auditHealth,
    auditIssueCodes: auditIssues.map((issue) => issue.code),
    auditIssues,
    freightReady: isVariantFreightReady(variant),
  };
}

export function validatePublishRequirements(input: {
  name?: string | null;
  hasPrimaryImage?: boolean;
  primaryVariantSku?: string | null;
}): string[] {
  const missing: string[] = [];
  if (!input.name || !input.name.trim()) missing.push('name');
  if (!input.hasPrimaryImage) missing.push('mainImage');
  if (!input.primaryVariantSku || !input.primaryVariantSku.trim()) missing.push('sku');
  return missing;
}

export function evaluateProductHealth(input: ProductHealthInput): HealthEvaluationResult {
  const codes = new Set<string>();
  const images = input.images ?? [];
  const hasPrimary = input.hasPrimaryImage ?? images.some((image) => Boolean(image.isPrimary));

  if (!input.name || !input.name.trim()) codes.add('SEM_NOME');
  if (!hasPrimary) codes.add('SEM_FOTO');
  if (!input.brandId) codes.add('SEM_MARCA');

  const hasCategory = input.hasCategory ?? (input.categoryCount ?? 0) > 0;
  if (!hasCategory) codes.add('SEM_CATEGORIA');
  if (!input.description || !input.description.trim()) codes.add('SEM_DESCRICAO');

  for (const image of images) {
    if (image.imageStatus === 'PENDENTE_DIVERGENCIA_VISUAL') codes.add('FOTO_DIVERGENTE');
    if (image.imageStatus === 'PENDENTE_COMPARTILHADA_PRODUTOS') codes.add('FOTO_COMPARTILHADA');
    if (image.imageStatus === 'PENDENTE_BAIXA_RESOLUCAO') codes.add('FOTO_BAIXA_RESOLUCAO');
    if (
      image.widthPx && image.heightPx
      && (image.widthPx < 250 || image.heightPx < 250)
    ) {
      codes.add('FOTO_BAIXA_RESOLUCAO');
    }
  }

  for (const raw of input.extraIssueCodes ?? []) {
    const mapped = mapRawPendencyToIssueCode(raw);
    if (mapped) codes.add(mapped);
  }

  const variantEvals = input.variants.map((variant) => evaluateVariantHealth(variant));
  if (!input.variants.length) {
    codes.add('SEM_SKU');
    codes.add('SEM_PRECO');
    codes.add('SEM_PESO_FRETE');
    codes.add('SEM_DIMENSOES_FRETE');
  } else {
    for (const variantEval of variantEvals) {
      for (const code of variantEval.auditIssueCodes) {
        codes.add(code);
      }
    }
  }

  const auditIssues = Array.from(codes).map(buildIssue);
  const auditHealth: CatalogAuditHealth = auditIssues.some((issue) => issue.severity === 'RED')
    ? 'RED'
    : auditIssues.length > 0
      ? 'YELLOW'
      : 'GREEN';

  const primaryVariant = input.variants[0];
  const missingPublishFields = validatePublishRequirements({
    name: input.name,
    hasPrimaryImage: hasPrimary,
    primaryVariantSku: primaryVariant?.sku,
  });

  return {
    auditHealth,
    auditIssueCodes: auditIssues.map((issue) => issue.code),
    auditIssues,
    missingPublishFields,
    canPublish: missingPublishFields.length === 0,
    freightReady: variantEvals.some((v) => v.freightReady),
  };
}
