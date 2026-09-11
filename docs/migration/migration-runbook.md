# Importação WooCommerce

O export oficial ainda não foi recebido. Este runbook deixa a importação pronta sem criar dados fictícios.

## Entrada esperada

Um JSON com uma lista de produtos, contendo pelo menos:

```json
[
  { "id": 42, "name": "Produto", "slug": "produto", "brand": "HASKELL", "category": "Shampoo", "sku": "SKU-42", "price": "19.90" }
]
```

Categorias `Uncategorized` são rejeitadas até existir uma decisão no mapa de categorias. Marcas são normalizadas antes do upsert.

## Execução controlada

1. Fazer backup do MySQL e preservar o arquivo original em local fora do repositório.
2. Validar o mapa em `docs/migration/category-brand-map.csv`.
3. Executar em banco de homologação:

```bash
pnpm exec tsx scripts/migrate-woocommerce.ts C:/caminho/export-woocommerce.json
```

4. Conferir `read`, `imported`, `rejected` e `rejectedIds`.
5. Reexecutar o mesmo arquivo somente após revisar rejeições; `legacySource=woocommerce` + `legacyId` tornam produtos, marcas e categorias idempotentes.
6. Importar imagens em etapa separada, preservando `storage/uploads` e validando MIME, tamanho e WebP.

O script não publica produtos automaticamente e não deve ser executado na produção antes da reconciliação do catálogo, SKUs, preços, marcas, categorias, imagens e estoque.
