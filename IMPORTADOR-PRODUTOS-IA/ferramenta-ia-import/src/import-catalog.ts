import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import {
  CatalogAuditHealth,
  PricingMode,
  Prisma,
  PrismaClient,
  ProductStockStatus,
  RecordStatus,
} from '@prisma/client';
import { cleanLocalProducts } from './clean-local-products';
import {
  assertLocalDatabaseUrl,
  cleanMultilineText,
  cleanOptionalText,
  loadLocalEnvironment,
  resolveRepoRoot,
  slugifyText,
  toOptionalInt,
  toPositiveIntOrNull,
} from './db-safety';
import { evaluateProductHealth, evaluateVariantHealth } from './health-rules';
import { processCatalogImage } from './media-pipeline';
import {
  buildAndSyncTaxonomy,
  CatalogBrandInput,
  CatalogCategoryInput,
  resolveBrandId,
  resolveProductCategoryIds,
  resolveProductSegmentIds,
  resolveProductTagIds,
} from './taxonomy-matcher';

type PublishMode = 'eligible' | 'draft' | 'all-with-photo';

interface RawVariation {
  produto_pai_id?: string;
  sku?: string;
  legacy_source?: string;
  legacy_id_produto?: string;
  legacy_id_variante?: string;
  nome_original?: string;
  nome_padronizado?: string;
  nome_base_padronizado?: string;
  slug_produto?: string;
  descricao_original?: string;
  descricao_ecommerce?: string;
  marca_padronizada?: string;
  marca_slug?: string;
  categoria_padronizada?: string;
  categoria_slug?: string;
  subcategoria_padronizada?: string;
  subcategoria_slug?: string;
  segmentos_sugeridos?: string[];
  tags_sugeridas?: string[];
  codigo_original_catalogo?: string;
  validacao_digito_gtin?: string;
  codigo_referencia_fabricante?: string;
  ncm?: string | null;
  cor_variacao?: string;
  tamanho_ou_modelo?: string;
  capacidade_volume?: string;
  peso_informado?: string;
  material?: string;
  dimensoes_especificacoes_original?: string;
  dimensoes_internas?: string;
  dimensoes_externas?: string;
  diametro?: string;
  altura?: string;
  volume_cubico_individual?: string;
  embalagem_original?: string;
  embalagem_texto_original?: string;
  embalagem_tipo?: string;
  embalagem_unidade?: string;
  embalagem_unidade_comercial?: string;
  embalagem_fator_1?: number | null;
  embalagem_fator_2?: number | null;
  embalagem_quantidade_total?: number | null;
  embalagem_total_unidades?: number | null;
  imagem_original_anterior?: string;
  imagem_principal?: string;
  imagens_adicionais?: string[];
  imagem_origem?: string;
  imagem_status?: string;
  imagem_confianca?: number | null;
  pagina_pdf?: number | null;
  pagina_impressa?: number | null;
  secao_pdf_detectada?: string;
  texto_original_pdf?: string;
  preco_cents?: number | null;
  estoque_qtd?: number | null;
  peso_logistico_gramas?: number | null;
  largura_frete_mm?: number | null;
  altura_frete_mm?: number | null;
  comprimento_frete_mm?: number | null;
  classificacao_auditoria?: string;
  confianca_geral?: number | null;
  pendencias?: string[];
}

interface RawParentProduct {
  produto_pai_id: string;
  legacy_source?: string;
  legacy_id?: string;
  slug: string;
  nome_original?: string;
  nome_padronizado: string;
  descricao_ecommerce?: string;
  marca?: string;
  marca_slug?: string;
  categoria?: string;
  categoria_slug?: string;
  subcategoria?: string;
  subcategoria_slug?: string;
  segmentos_sugeridos?: string[];
  tags_sugeridas?: string[];
  imagem_principal?: string;
  pagina_pdf?: number | null;
  pagina_impressa?: number | null;
  classificacao_auditoria?: string;
  confianca_geral?: number | null;
  pendencias?: string[];
}

interface CatalogBundle {
  meta?: { legacy_source?: string };
  marcas: CatalogBrandInput[];
  categorias: CatalogCategoryInput[];
  produtos_pais: RawParentProduct[];
  variacoes: RawVariation[];
}

function parseArgValue(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  const prefix = `${flag}=`;
  const eq = args.find((item) => item.startsWith(prefix));
  return eq ? eq.slice(prefix.length) : undefined;
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

async function loadCatalogBundle(sourceDir: string): Promise<CatalogBundle> {
  const combinedPath = resolve(sourceDir, 'catalogo_final.json');
  if (existsSync(combinedPath)) {
    return readJsonFile<CatalogBundle>(combinedPath);
  }

  const [marcas, categorias, produtosPais, variacoes] = await Promise.all([
    existsSync(resolve(sourceDir, 'marcas.json')) ? readJsonFile<CatalogBrandInput[]>(resolve(sourceDir, 'marcas.json')) : [],
    existsSync(resolve(sourceDir, 'categorias.json'))
      ? readJsonFile<CatalogCategoryInput[]>(resolve(sourceDir, 'categorias.json'))
      : [],
    existsSync(resolve(sourceDir, 'produtos.json')) ? readJsonFile<RawParentProduct[]>(resolve(sourceDir, 'produtos.json')) : [],
    readJsonFile<RawVariation[]>(resolve(sourceDir, 'variacoes.json')),
  ]);

  return { marcas, categorias, produtos_pais: produtosPais, variacoes };
}

function buildVariantLabel(variation: RawVariation, packagingRawOverride?: string | null): string | null {
  const parts = [
    cleanOptionalText(variation.cor_variacao, 80),
    cleanOptionalText(variation.tamanho_ou_modelo, 100),
    cleanOptionalText(variation.capacidade_volume, 100),
    cleanOptionalText(packagingRawOverride ?? variation.embalagem_original ?? variation.embalagem_texto_original, 120),
  ].filter(Boolean);
  if (parts.length > 0) return cleanOptionalText(parts.join(' · '), 220);
  return cleanOptionalText(variation.nome_padronizado, 220);
}

function resolveLocalSourceImagePath(sourceDir: string, rawPath?: string | null): string | null {
  const clean = cleanOptionalText(rawPath, 255);
  if (!clean) return null;
  if (isAbsolute(clean) && existsSync(clean)) return clean;
  const direct = resolve(sourceDir, clean);
  if (existsSync(direct)) return direct;
  const underImages = resolve(sourceDir, 'imagens', clean.replace(/^imagens[\\/]/i, ''));
  if (existsSync(underImages)) return underImages;
  return null;
}

async function runImport() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const cleanFirst = args.includes('--clean-products-first');
  const skipMedia = args.includes('--skip-media');
  const forceMedia = args.includes('--force-media');
  const allowRemote = args.includes('--allow-remote');
  const publishModeRaw = (parseArgValue(args, '--publish-mode') ?? 'eligible') as PublishMode;
  const limitRaw = parseArgValue(args, '--limit');
  const limit = limitRaw ? Math.max(1, Number.parseInt(limitRaw, 10)) : undefined;

  if (!['eligible', 'draft', 'all-with-photo'].includes(publishModeRaw)) {
    throw new Error(`--publish-mode inválido (${publishModeRaw}). Use eligible | draft | all-with-photo.`);
  }

  const repoRoot = resolveRepoRoot(__dirname);
  const { parsedUrl } = loadLocalEnvironment(repoRoot);
  assertLocalDatabaseUrl(parsedUrl, { allowRemote });

  const defaultSource = resolve(
    repoRoot,
    'IMPORTADOR-PRODUTOS-IA/produtos para importar/produtos-catalogo-novembro-2026',
  );
  const sourceDir = resolve(parseArgValue(args, '--source') ?? defaultSource);
  if (!existsSync(sourceDir)) {
    throw new Error(`Pasta do catálogo não encontrada: ${sourceDir}`);
  }

  console.log(`[import-catalog] Banco alvo : ${parsedUrl.host}${parsedUrl.pathname}`);
  console.log(`[import-catalog] Pasta fonte: ${sourceDir}`);
  console.log(`[import-catalog] Modo       : dryRun=${dryRun} | publishMode=${publishModeRaw} | skipMedia=${skipMedia}`);

  const bundle = await loadCatalogBundle(sourceDir);
  const legacySource = bundle.meta?.legacy_source || 'catalogo-norte-2026';

  const variationsByParent = new Map<string, RawVariation[]>();
  for (const v of bundle.variacoes) {
    const parentId = v.produto_pai_id || v.legacy_id_produto || v.sku || 'UNKNOWN';
    const list = variationsByParent.get(parentId) ?? [];
    list.push(v);
    variationsByParent.set(parentId, list);
  }

  // Garante parent entries mesmo se produtos_pais estiver ausente
  const parentEntries: RawParentProduct[] =
    bundle.produtos_pais.length > 0
      ? bundle.produtos_pais
      : Array.from(variationsByParent.entries()).map(([paiId, vars]) => ({
          produto_pai_id: paiId,
          legacy_source: legacySource,
          legacy_id: paiId,
          slug: vars[0]?.slug_produto || slugifyText(vars[0]?.nome_padronizado || paiId),
          nome_original: vars[0]?.nome_original,
          nome_padronizado: vars[0]?.nome_base_padronizado || vars[0]?.nome_padronizado || paiId,
          descricao_ecommerce: vars[0]?.descricao_ecommerce,
          marca: vars[0]?.marca_padronizada,
          marca_slug: vars[0]?.marca_slug,
          categoria: vars[0]?.categoria_padronizada,
          categoria_slug: vars[0]?.categoria_slug,
          subcategoria: vars[0]?.subcategoria_padronizada,
          subcategoria_slug: vars[0]?.subcategoria_slug,
          segmentos_sugeridos: vars[0]?.segmentos_sugeridos,
          tags_sugeridas: vars[0]?.tags_sugeridas,
          imagem_principal: vars[0]?.imagem_principal,
          pagina_pdf: vars[0]?.pagina_pdf,
          pagina_impressa: vars[0]?.pagina_impressa,
          classificacao_auditoria: vars[0]?.classificacao_auditoria,
        }));

  const targetParents = limit ? parentEntries.slice(0, limit) : parentEntries;

  const prisma = new PrismaClient();
  const storageRootAbs = resolve(repoRoot, 'apps/api/storage');

  try {
    if (cleanFirst) {
      if (dryRun) {
        console.log('[import-catalog] (--clean-products-first ignorado em --dry-run; use clean-local-products.ts separadamente se desejar inspecionar)');
      } else {
        const cleaned = await cleanLocalProducts({ prisma, parsedUrl, repoRoot, dryRun: false });
        console.log('[import-catalog] Limpeza local prévia concluída:', JSON.stringify(cleaned.before));
      }
    }

    const taxonomy = await buildAndSyncTaxonomy({
      prisma,
      legacySource,
      brands: bundle.marcas,
      categories: bundle.categorias,
      dryRun,
    });
    console.log(
      `[import-catalog] Taxonomia: marcas(reuso=${taxonomy.reusedBrands}, novas=${taxonomy.createdBrands}) ` +
        `categorias(reuso=${taxonomy.reusedCategories}, novas=${taxonomy.createdCategories})`,
    );

    const stats = {
      parentsTotal: targetParents.length,
      parentsCreated: 0,
      parentsUpdated: 0,
      variantsUpserted: 0,
      imagesGenerated: 0,
      imagesReused: 0,
      missingImageFiles: 0,
      statusActive: 0,
      statusDraft: 0,
      healthGreen: 0,
      healthYellow: 0,
      healthRed: 0,
      issueFrequency: new Map<string, number>(),
    };

    for (const parent of targetParents) {
      const parentKey = parent.produto_pai_id || parent.legacy_id || parent.slug;
      const variantsRaw = variationsByParent.get(parentKey) ?? [];
      if (variantsRaw.length === 0) continue;

      const firstVar = variantsRaw[0];
      const name = cleanOptionalText(parent.nome_padronizado || firstVar.nome_padronizado, 220) ?? parentKey;
      const rawCatalogName = cleanOptionalText(parent.nome_original || firstVar.nome_original, 255);
      const slug = cleanOptionalText(parent.slug || firstVar.slug_produto || slugifyText(name), 191) ?? slugifyText(parentKey);
      const description = cleanMultilineText(parent.descricao_ecommerce || firstVar.descricao_ecommerce);
      const rawDescription = cleanMultilineText(firstVar.descricao_original);
      const brandId = resolveBrandId(
        taxonomy.ctx,
        parent.marca_slug || firstVar.marca_slug,
        parent.marca || firstVar.marca_padronizada,
      );

      const categoryIds = resolveProductCategoryIds({
        ctx: taxonomy.ctx,
        categorySlug: parent.categoria_slug || firstVar.categoria_slug,
        categoryName: parent.categoria || firstVar.categoria_padronizada,
        subcategorySlug: parent.subcategoria_slug || firstVar.subcategoria_slug,
        subcategoryName: parent.subcategoria || firstVar.subcategoria_padronizada,
      });

      const suggestedSegments = Array.from(
        new Set([...(parent.segmentos_sugeridos ?? []), ...variantsRaw.flatMap((v) => v.segmentos_sugeridos ?? [])]),
      );
      const suggestedTags = Array.from(
        new Set([...(parent.tags_sugeridas ?? []), ...variantsRaw.flatMap((v) => v.tags_sugeridas ?? [])]),
      );

      const segmentIds = await resolveProductSegmentIds({
        prisma,
        ctx: taxonomy.ctx,
        suggestedSegments,
        productTextHint: `${name} ${description ?? ''}`,
        dryRun,
      });
      const tagIds = await resolveProductTagIds({
        prisma,
        ctx: taxonomy.ctx,
        suggestedTags,
        dryRun,
      });

      // Resolve imagens (deduplica imagem compartilhada entre irmãs, mantendo variação própria quando diferente)
      const primarySourceRel = cleanOptionalText(parent.imagem_principal || firstVar.imagem_principal, 255);
      const seenImageRelPaths = new Set<string>();
      const preparedImages: Array<{
        path: string;
        altText: string;
        sortOrder: number;
        isPrimary: boolean;
        imageStatus: string | null;
        imageSourceMethod: string | null;
        imageConfidence: number | null;
        sha256: string | null;
        widthPx: number | null;
        heightPx: number | null;
        sourceOriginalPath: string | null;
        variantLegacyId?: string | null;
      }> = [];

      const imageSourcesToProcess: Array<{
        relPath: string;
        isPrimary: boolean;
        folderKey: string;
        metaVar: RawVariation;
        variantLegacyId?: string | null;
      }> = [];

      if (primarySourceRel) {
        seenImageRelPaths.add(primarySourceRel);
        imageSourcesToProcess.push({
          relPath: primarySourceRel,
          isPrimary: true,
          folderKey: slug,
          metaVar: firstVar,
          variantLegacyId: variantsRaw.length === 1 ? (firstVar.legacy_id_variante || firstVar.sku || null) : null,
        });
      }

      variantsRaw.forEach((v, idx) => {
        const extraCandidates = [v.imagem_principal, ...(v.imagens_adicionais ?? [])].filter(Boolean) as string[];
        for (const cand of extraCandidates) {
          const cleanCand = cleanOptionalText(cand, 255);
          if (!cleanCand || seenImageRelPaths.has(cleanCand)) continue;
          seenImageRelPaths.add(cleanCand);
          imageSourcesToProcess.push({
            relPath: cleanCand,
            isPrimary: imageSourcesToProcess.length === 0,
            folderKey: `${slug}-v${idx + 1}`,
            metaVar: v,
            variantLegacyId: v.legacy_id_variante || v.sku || null,
          });
        }
      });

      for (let imgIdx = 0; imgIdx < imageSourcesToProcess.length; imgIdx++) {
        const item = imageSourcesToProcess[imgIdx];
        const absFile = resolveLocalSourceImagePath(sourceDir, item.relPath);
        if (!absFile) {
          stats.missingImageFiles += 1;
          continue;
        }

        let dbPath = `uploads/cn-cat/${item.folderKey}/960.webp`;
        let widthPx: number | null = null;
        let heightPx: number | null = null;
        let sha256: string | null = null;

        if (!dryRun && !skipMedia) {
          const processed = await processCatalogImage({
            sourceFileAbs: absFile,
            storageRootAbs,
            folderKey: item.folderKey,
            force: forceMedia,
          });
          dbPath = processed.dbPath;
          widthPx = processed.widthPx;
          heightPx = processed.heightPx;
          sha256 = processed.sha256;
          if (processed.reusedExisting) stats.imagesReused += 1;
          else stats.imagesGenerated += 1;
        } else {
          // Usa metadados já calculados na auditoria quando dry-run/skip-media
          widthPx = toPositiveIntOrNull((item.metaVar as unknown as Record<string, unknown>).imagem_largura);
          heightPx = toPositiveIntOrNull((item.metaVar as unknown as Record<string, unknown>).imagem_altura);
          sha256 = cleanOptionalText((item.metaVar as unknown as Record<string, unknown>).imagem_sha256, 64);
        }

        preparedImages.push({
          path: dbPath,
          altText: cleanOptionalText(name, 255) || slug,
          sortOrder: imgIdx,
          isPrimary: item.isPrimary,
          imageStatus: cleanOptionalText(item.metaVar.imagem_status, 60),
          imageSourceMethod: cleanOptionalText(item.metaVar.imagem_origem, 60),
          imageConfidence: toOptionalInt(item.metaVar.imagem_confianca),
          sha256,
          widthPx,
          heightPx,
          sourceOriginalPath: cleanOptionalText(item.metaVar.imagem_original_anterior || item.relPath, 255),
          variantLegacyId: item.variantLegacyId,
        });
      }

      // Avalia saúde individual de cada variante e preparada payloads do Prisma
      const preparedVariants = variantsRaw.map((v) => {
        const sku = cleanOptionalText(v.sku || v.legacy_id_variante, 100) || `CN-${slug}`;
        const gtinRaw = cleanOptionalText(v.codigo_original_catalogo, 64);
        const gtinStatus = cleanOptionalText(v.validacao_digito_gtin, 40);
        const gtinValid =
          gtinStatus === 'GTIN_DIGITO_VALIDO' ? true : gtinStatus === 'GTIN_DIGITO_INVALIDO' ? false : null;
        const priceCents = toPositiveIntOrNull(v.preco_cents);
        const weightGrams = toPositiveIntOrNull(v.peso_logistico_gramas);
        const widthMm = toPositiveIntOrNull(v.largura_frete_mm);
        const heightMm = toPositiveIntOrNull(v.altura_frete_mm);
        const lengthMm = toPositiveIntOrNull(v.comprimento_frete_mm);

        const variantHealth = evaluateVariantHealth({
          sku,
          priceCents,
          weightGrams,
          widthMm,
          heightMm,
          lengthMm,
          gtinRaw,
          gtinStatus,
          gtinValid,
          extraIssueCodes: v.pendencias ?? [],
        });

        const packagingRaw = cleanOptionalText(v.embalagem_original || v.embalagem_texto_original, 120);
        const packagingUnit = cleanOptionalText(v.embalagem_unidade || v.embalagem_unidade_comercial, 40);
        const packagingTotalUnits = toPositiveIntOrNull(v.embalagem_quantidade_total ?? v.embalagem_total_unidades);

        return {
          legacyId: cleanOptionalText(v.legacy_id_variante || sku, 191) || sku,
          sku,
          variantName: buildVariantLabel(v, packagingRaw),
          pricingMode: priceCents ? PricingMode.FIXED_PRICE : PricingMode.QUOTE_ONLY,
          priceCents,
          gtinRaw,
          gtinStatus,
          gtinValid,
          manufacturerRef: cleanOptionalText(v.codigo_referencia_fabricante, 100),
          ncm: cleanOptionalText(v.ncm, 20),
          color: cleanOptionalText(v.cor_variacao, 80),
          sizeOrModel: cleanOptionalText(v.tamanho_ou_modelo, 100),
          capacityOrVolume: cleanOptionalText(v.capacidade_volume, 100),
          material: cleanOptionalText(v.material, 120),
          packagingRaw,
          packagingType: cleanOptionalText(v.embalagem_tipo, 40),
          packagingUnit,
          packagingFactor1: toPositiveIntOrNull(v.embalagem_fator_1),
          packagingFactor2: toPositiveIntOrNull(v.embalagem_fator_2),
          packagingTotalUnits,
          reportedNetWeight: cleanOptionalText(v.peso_informado, 80),
          dimensionsRaw: cleanOptionalText(v.dimensoes_especificacoes_original, 180),
          internalDimensions: cleanOptionalText(v.dimensoes_internas, 100),
          externalDimensions: cleanOptionalText(v.dimensoes_externas, 100),
          diameterText: cleanOptionalText(v.diametro, 80),
          heightText: cleanOptionalText(v.altura, 80),
          individualVolumeText: cleanOptionalText(v.volume_cubico_individual, 80),
          weightGrams,
          widthMm,
          heightMm,
          lengthMm,
          freightReady: variantHealth.freightReady,
          auditHealth: variantHealth.auditHealth,
          auditIssueCodes: variantHealth.auditIssueCodes,
          auditIssues: variantHealth.auditIssues as unknown as Prisma.InputJsonValue,
          physicalQuantity: toOptionalInt(v.estoque_qtd) ?? 0,
        };
      });

      const productHealth = evaluateProductHealth({
        name,
        description,
        brandId,
        hasCategory: categoryIds.length > 0,
        hasPrimaryImage: preparedImages.some((img) => img.isPrimary),
        images: preparedImages.map((img) => ({
          isPrimary: img.isPrimary,
          imageStatus: img.imageStatus,
          widthPx: img.widthPx,
          heightPx: img.heightPx,
        })),
        variants: preparedVariants.map((v) => ({
          sku: v.sku,
          priceCents: v.priceCents,
          weightGrams: v.weightGrams,
          widthMm: v.widthMm,
          heightMm: v.heightMm,
          lengthMm: v.lengthMm,
          gtinRaw: v.gtinRaw,
          gtinStatus: v.gtinStatus,
          gtinValid: v.gtinValid,
          extraIssueCodes: v.auditIssueCodes,
        })),
        extraIssueCodes: parent.pendencias ?? [],
      });

      // Regra de publicação mínima (Nome + Foto + SKU); RED fica retido em DRAFT no modo eligible
      let targetStatus: RecordStatus = RecordStatus.DRAFT;
      if (publishModeRaw === 'all-with-photo') {
        targetStatus = productHealth.canPublish ? RecordStatus.ACTIVE : RecordStatus.DRAFT;
      } else if (publishModeRaw === 'eligible') {
        targetStatus =
          productHealth.canPublish && productHealth.auditHealth !== CatalogAuditHealth.RED
            ? RecordStatus.ACTIVE
            : RecordStatus.DRAFT;
      }

      if (targetStatus === RecordStatus.ACTIVE) stats.statusActive += 1;
      else stats.statusDraft += 1;

      if (productHealth.auditHealth === CatalogAuditHealth.GREEN) stats.healthGreen += 1;
      else if (productHealth.auditHealth === CatalogAuditHealth.YELLOW) stats.healthYellow += 1;
      else stats.healthRed += 1;

      for (const code of productHealth.auditIssueCodes) {
        stats.issueFrequency.set(code, (stats.issueFrequency.get(code) ?? 0) + 1);
      }

      if (dryRun) {
        stats.parentsCreated += 1;
        stats.variantsUpserted += preparedVariants.length;
        continue;
      }

      const parentLegacyId = cleanOptionalText(parent.legacy_id || parentKey, 191) || slug;
      const confidenceCandidates = [
        toOptionalInt(parent.confianca_geral),
        ...variantsRaw.map((v) => toOptionalInt(v.confianca_geral)),
      ].filter((n): n is number => n !== null);
      const auditConfidence = confidenceCandidates.length > 0 ? Math.min(...confidenceCandidates) : null;

      await prisma.$transaction(async (tx) => {
        const existingProduct =
          (await tx.product.findUnique({
            where: { legacySource_legacyId: { legacySource, legacyId: parentLegacyId } },
            select: { id: true },
          })) ??
          (await tx.product.findUnique({
            where: { slug },
            select: { id: true },
          }));

        const productData = {
          legacySource,
          legacyId: parentLegacyId,
          name,
          rawCatalogName,
          slug,
          description,
          rawDescription,
          status: targetStatus,
          brandId,
          sourcePdfPage: toOptionalInt(parent.pagina_pdf ?? firstVar.pagina_pdf),
          sourcePrintedPage: toOptionalInt(parent.pagina_impressa ?? firstVar.pagina_impressa),
          sourceSection: cleanOptionalText(firstVar.secao_pdf_detectada, 160),
          sourceRawText: cleanMultilineText(firstVar.texto_original_pdf),
          auditHealth: productHealth.auditHealth,
          auditIssueCodes: productHealth.auditIssueCodes,
          auditIssues: productHealth.auditIssues as unknown as Prisma.InputJsonValue,
          auditConfidence,
        };

        const savedProduct = existingProduct
          ? await tx.product.update({
              where: { id: existingProduct.id },
              data: productData,
              select: { id: true },
            })
          : await tx.product.create({
              data: productData,
              select: { id: true },
            });

        if (existingProduct) stats.parentsUpdated += 1;
        else stats.parentsCreated += 1;

        // Relacionamentos N:N (substituição limpa e idempotente)
        await tx.productCategory.deleteMany({ where: { productId: savedProduct.id } });
        if (categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: categoryIds.map((categoryId) => ({ productId: savedProduct.id, categoryId })),
            skipDuplicates: true,
          });
        }

        await tx.productSegment.deleteMany({ where: { productId: savedProduct.id } });
        if (segmentIds.length > 0) {
          await tx.productSegment.createMany({
            data: segmentIds.map((segmentId) => ({ productId: savedProduct.id, segmentId })),
            skipDuplicates: true,
          });
        }

        await tx.productTag.deleteMany({ where: { productId: savedProduct.id } });
        if (tagIds.length > 0) {
          await tx.productTag.createMany({
            data: tagIds.map((tagId) => ({ productId: savedProduct.id, tagId })),
            skipDuplicates: true,
          });
        }

        const variantIdByLegacyId = new Map<string, string>();
        for (const pv of preparedVariants) {
          const existingVar =
            (await tx.productVariant.findUnique({
              where: { legacySource_legacyId: { legacySource, legacyId: pv.legacyId } },
              select: { id: true },
            })) ??
            (await tx.productVariant.findUnique({
              where: { sku: pv.sku },
              select: { id: true },
            }));

          const variantStatus: RecordStatus =
            targetStatus === RecordStatus.ACTIVE && pv.auditHealth !== CatalogAuditHealth.RED
              ? RecordStatus.ACTIVE
              : targetStatus === RecordStatus.ACTIVE && publishModeRaw === 'all-with-photo'
                ? RecordStatus.ACTIVE
                : RecordStatus.DRAFT;

          const variantData = {
            legacySource,
            legacyId: pv.legacyId,
            productId: savedProduct.id,
            sku: pv.sku,
            variantName: pv.variantName,
            pricingMode: pv.pricingMode,
            priceCents: pv.priceCents,
            gtinRaw: pv.gtinRaw,
            gtinStatus: pv.gtinStatus,
            gtinValid: pv.gtinValid,
            manufacturerRef: pv.manufacturerRef,
            ncm: pv.ncm,
            color: pv.color,
            sizeOrModel: pv.sizeOrModel,
            capacityOrVolume: pv.capacityOrVolume,
            material: pv.material,
            packagingRaw: pv.packagingRaw,
            packagingType: pv.packagingType,
            packagingUnit: pv.packagingUnit,
            packagingFactor1: pv.packagingFactor1,
            packagingFactor2: pv.packagingFactor2,
            packagingTotalUnits: pv.packagingTotalUnits,
            reportedNetWeight: pv.reportedNetWeight,
            dimensionsRaw: pv.dimensionsRaw,
            internalDimensions: pv.internalDimensions,
            externalDimensions: pv.externalDimensions,
            diameterText: pv.diameterText,
            heightText: pv.heightText,
            individualVolumeText: pv.individualVolumeText,
            weightGrams: pv.weightGrams,
            widthMm: pv.widthMm,
            heightMm: pv.heightMm,
            lengthMm: pv.lengthMm,
            freightReady: pv.freightReady,
            auditHealth: pv.auditHealth,
            auditIssueCodes: pv.auditIssueCodes,
            auditIssues: pv.auditIssues,
            manageStock: true,
            stockStatus: ProductStockStatus.IN_STOCK,
            status: variantStatus,
          };

          const savedVar = existingVar
            ? await tx.productVariant.update({
                where: { id: existingVar.id },
                data: variantData,
                select: { id: true },
              })
            : await tx.productVariant.create({
                data: variantData,
                select: { id: true },
              });

          variantIdByLegacyId.set(pv.legacyId, savedVar.id);
          stats.variantsUpserted += 1;

          await tx.inventoryBalance.upsert({
            where: { variantId: savedVar.id },
            update: { physicalQuantity: pv.physicalQuantity },
            create: { variantId: savedVar.id, physicalQuantity: pv.physicalQuantity, reservedQuantity: 0 },
          });
        }

        await tx.productImage.deleteMany({ where: { productId: savedProduct.id } });
        for (const img of preparedImages) {
          const linkedVariantId = img.variantLegacyId ? (variantIdByLegacyId.get(img.variantLegacyId) ?? null) : null;
          await tx.productImage.create({
            data: {
              productId: savedProduct.id,
              variantId: linkedVariantId,
              path: img.path,
              altText: img.altText,
              sortOrder: img.sortOrder,
              isPrimary: img.isPrimary,
              imageStatus: img.imageStatus,
              imageSourceMethod: img.imageSourceMethod,
              imageConfidence: img.imageConfidence,
              sha256: img.sha256,
              widthPx: img.widthPx,
              heightPx: img.heightPx,
              sourceOriginalPath: img.sourceOriginalPath,
            },
          });
        }
      }, { maxWait: 15000, timeout: 60000 });
    }

    const sortedIssues = Array.from(stats.issueFrequency.entries()).sort((a, b) => b[1] - a[1]);
    console.log('\n[import-catalog] ===== RESUMO DA EXECUÇÃO =====');
    console.log(
      JSON.stringify(
        {
          dryRun,
          parentsTotal: stats.parentsTotal,
          parentsCreated: stats.parentsCreated,
          parentsUpdated: stats.parentsUpdated,
          variantsUpserted: stats.variantsUpserted,
          imagesGenerated: stats.imagesGenerated,
          imagesReused: stats.imagesReused,
          missingImageFiles: stats.missingImageFiles,
          status: { ACTIVE: stats.statusActive, DRAFT: stats.statusDraft },
          auditHealth: { GREEN: stats.healthGreen, YELLOW: stats.healthYellow, RED: stats.healthRed },
          topIssues: Object.fromEntries(sortedIssues),
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

runImport().catch((err) => {
  console.error('[import-catalog] Falha crítica:', err instanceof Error ? err.message : err);
  process.exit(1);
});
