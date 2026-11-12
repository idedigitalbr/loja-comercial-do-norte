# Ferramenta de Importação de Catálogos IA (`ferramenta-ia-import`)

Toolkit reutilizável para preparar, validar saúde de cadastro (`GREEN` / `YELLOW` / `RED`), processar imagens WebP (`480.webp`, `960.webp`, `1440.webp`) e importar catálogos completos para a **Loja Comercial do Norte**.

## Regras de Segurança (Leia antes de executar)

1. **Banco padrão é SEMPRE o LOCAL (`127.0.0.1:55432`)**: os scripts carregam `.env` / `.env.local` e bloqueiam hosts remotos (`neon.tech`, etc.).
2. **Limpeza não apaga taxonomia nem CMS**: `clean-local-products.ts` remove **apenas produtos, variações, imagens de produto, estoques e cotações/pedidos de teste**. Marcas, Categorias, Segmentos, Tags, Usuários, Configurações da Loja, Banners (`seed-banner-*`), Blog e Eventos são preservados.
3. **Nunca inventar dados**: produtos sem preço ficam em `pricingMode = QUOTE_ONLY` (`priceCents = null` / *Sob cotação*). Pesos e medidas de frete ausentes ficam `null` + tag amarela `SEM_PESO_FRETE` / `SEM_DIMENSOES_FRETE`.
4. **Regra mínima de publicação**: apenas **Nome + Foto principal + SKU**. Pendências não bloqueantes viram etiquetas amarelas; erros críticos viram etiquetas vermelhas e seguram o produto em `DRAFT` no modo padrão (`--publish-mode eligible`).

## Comandos Principais (executar na raiz do repositório)

```powershell
# 1. Validar limpeza sem alterar nada
npx tsx "IMPORTADOR-PRODUTOS-IA/ferramenta-ia-import/src/clean-local-products.ts" --confirm --dry-run

# 2. Limpar produtos de demonstração do banco LOCAL (preserva marcas/categorias/banners)
npx tsx "IMPORTADOR-PRODUTOS-IA/ferramenta-ia-import/src/clean-local-products.ts" --confirm

# 3. Simular importação (dry-run)
npx tsx "IMPORTADOR-PRODUTOS-IA/ferramenta-ia-import/src/import-catalog.ts" --source "IMPORTADOR-PRODUTOS-IA/produtos para importar/produtos-catalogo-novembro-2026" --dry-run

# 4. Importar catálogo completo no banco LOCAL e gerar WebPs 480/960/1440
npx tsx "IMPORTADOR-PRODUTOS-IA/ferramenta-ia-import/src/import-catalog.ts" --source "IMPORTADOR-PRODUTOS-IA/produtos para importar/produtos-catalogo-novembro-2026"

# 5. Espelhar imagens para public/storage do storefront e API
node scripts/copy-web-builds.mjs
```

## Preparar um catálogo bruto futuro (Planilha/CSV + Imagens)

```powershell
python "IMPORTADOR-PRODUTOS-IA/ferramenta-ia-import/src/prepare_catalog.py" --input "C:\caminho\bruto" --output "IMPORTADOR-PRODUTOS-IA/produtos para importar/novo-lote"
```
