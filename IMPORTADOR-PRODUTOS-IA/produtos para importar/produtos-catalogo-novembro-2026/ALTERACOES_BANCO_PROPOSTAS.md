# Propostas de Alteração de Banco de Dados (Prisma / PostgreSQL)

> **Aviso de Segurança**: Conforme diretriz da missão, nenhuma migration foi executada e nenhum dado real do banco de produção da loja (`loja-comercial-do-norte`) foi alterado.

## 1. Diagnóstico do Schema Real Inspecionado

Arquivo inspecionado: `D:\.GITHUB\sistemas\loja-comercial-do-norte\prisma\schema.prisma`  
Serviço inspecionado: `apps/api/src/modules/catalog/catalog.service.ts` (`CatalogService.publish`)  
Editor admin inspecionado: `apps/admin/src/features/catalog/product-form.tsx`

### Pontos críticos identificados no schema atual:
1. **`ProductVariant.priceCents Int` é obrigatório (NOT NULL)**:
   - O catálogo oficial (`CATALOGO-ORIGINAL-DIAGRAMADO-NORTE-2026.pdf`) **não contém preços**, estoque nem cubagem logística de frete.
   - Atribuir `priceCents = 0` violaria a integridade comercial (risco de exposição com preço R\$ 0,00 caso alguém publique acidentalmente ou erro de negócio em consultas).
2. **`CatalogService.publish(id)` bloqueia publicação sem dimensões/preço**:
   - O gate real exige `sku`, `image.isPrimary == true`, `weightGrams`, `widthMm`, `heightMm`, `lengthMm`, e o formulário administrativo exige `priceCents > 0`.
   - Portanto, toda a carga oriunda do catálogo deve obrigatoriamente entrar como `RecordStatus.DRAFT`.
3. **Ausência de campos estruturados de origem/catálogo para não perder nenhuma informação**:
   - Hoje o schema não guarda `codigo_original_catalogo` (GTIN/código PDF sem mutilação), status de validação GS1, fatores de embalagem (`embalagem_tipo`, `fator_1`, `fator_2`, `quantidade_total`), texto bruto do PDF, nem classificação de auditoria (`LIBERADO`, `RASCUNHO_COM_RESSALVAS`, `BLOQUEADO`).

---

## 2. Alterações Propostas no `prisma/schema.prisma`

### A) Tornar preço e status de precificação explícitos para rascunhos
```prisma
enum PricingStatus {
  PENDING_PRICE
  PRICED
}

model ProductVariant {
  // ... campos existentes ...
  priceCents          Int?          // Alterado de Int para Int? para nunca gravar 0 falso em DRAFT
  pricingStatus       PricingStatus @default(PENDING_PRICE)
  catalogMetadata     ProductVariantCatalogMetadata?
}
```
*Regra de segurança no código*: reforçar no `CatalogService.publish(id)` a verificação explícita `if (variant.priceCents == null || variant.priceCents <= 0) throw new ProductIncompleteError(...)`.

### B) Tabelas dedicadas de metadados do catálogo (preservação 100% sem perda)
```prisma
enum CatalogAuditStatus {
  LIBERADO
  RASCUNHO_COM_RESSALVAS
  BLOQUEADO
}

model ProductCatalogMetadata {
  id                         String             @id @default(cuid())
  productId                  String             @unique
  product                    Product            @relation(fields: [productId], references: [id], onDelete: Cascade)
  sourceExternalId           String?            @db.VarChar(80)
  rawCatalogName             String             @db.VarChar(255)
  rawOriginalCategory        String?            @db.VarChar(191)
  rawOriginalBrand           String?            @db.VarChar(160)
  brandCatalogGroup          String?            @db.VarChar(160)
  sourcePdfPage              Int?
  sourceBookletPage          Int?
  auditStatus                CatalogAuditStatus @default(RASCUNHO_COM_RESSALVAS)
  auditConfidence            Int                @default(0)
  auditNotesJson             Json?
  createdAt                  DateTime           @default(now())
  updatedAt                  DateTime           @updatedAt

  @@index([auditStatus])
  @@index([sourcePdfPage])
}

model ProductVariantCatalogMetadata {
  id                         String             @id @default(cuid())
  variantId                  String             @unique
  variant                    ProductVariant     @relation(fields: [variantId], references: [id], onDelete: Cascade)
  sourceRecordId             String?            @db.VarChar(80)
  rawPdfText                 String?            @db.Text
  rawCatalogCode             String?            @db.VarChar(64)
  gtinValidationStatus       String?            @db.VarChar(48)
  manufacturerRefCode        String?            @db.VarChar(64)
  isSharedBarcodeInPdf       Boolean            @default(false)
  colorVariation             String?            @db.VarChar(80)
  sizeOrModel                String?            @db.VarChar(120)
  capacityOrVolume           String?            @db.VarChar(80)
  reportedNetWeight          String?            @db.VarChar(80)
  material                   String?            @db.VarChar(120)
  dimensionsOriginal         String?            @db.Text
  internalDimensions         String?            @db.VarChar(160)
  externalDimensions         String?            @db.VarChar(160)
  diameter                   String?            @db.VarChar(80)
  height                     String?            @db.VarChar(80)
  individualCubicVolume      String?            @db.VarChar(80)
  packagingOriginal          String?            @db.VarChar(160)
  packagingType              String?            @db.VarChar(40)
  packagingFactor1           Int?
  packagingFactor2           Int?
  packagingTotalUnits        Int?
  packagingUnit              String?            @db.VarChar(40)
  imageExtractionMethod      String?            @db.VarChar(64)
  imageAuditStatus           String?            @db.VarChar(64)
  imageConfidence            Int                @default(0)
  imageEvidence              String?            @db.Text
  auditStatus                CatalogAuditStatus @default(RASCUNHO_COM_RESSALVAS)
  auditConfidence            Int                @default(0)
  pendingFlagsJson           Json?
  appliedFixesJson           Json?
  auditJustification         String?            @db.Text
  createdAt                  DateTime           @default(now())
  updatedAt                  DateTime           @updatedAt

  @@index([rawCatalogCode])
  @@index([auditStatus])
}
```

---

## 3. Plano de Migração Segura e Importação Idempotente

1. **Migration SQL não-destrutiva**:
   - `ALTER TABLE "ProductVariant" ALTER COLUMN "priceCents" DROP NOT NULL;`
   - Criação aditiva de `PricingStatus`, `CatalogAuditStatus`, `ProductCatalogMetadata`, `ProductVariantCatalogMetadata`.
   - Backfill: variantes existentes com `priceCents > 0` recebem `pricingStatus = 'PRICED'`.
2. **Importação Idempotente (via `catalogo_final.json`)**:
   - Executar primeiro apenas os registros com `classificacao_auditoria = LIBERADO` (501 variações), opcionalmente incluir `RASCUNHO_COM_RESSALVAS` (285 variações) com flag de revisão no painel, e **nunca** importar automaticamente os `BLOQUEADO` (41 variações) sem resolução humana prévia.
   - Usar `upsert` por `(legacySource="catalogo-norte-2026", legacyId)` em `Brand`, `Category`, `Product` e por `sku` em `ProductVariant`.
   - Passar cada imagem `.webp` de `resultado_final/imagens/` pelo mesmo pipeline `LocalFileStorageService`/`sharp` da API para gerar variantes responsivas (`480px`, `960px`, `1440px`).
