# PROMPT MESTRE — IMPORTAÇÃO DE CATÁLOGO POR IA (ANTIGRAVITY / CODEX)

Use este prompt sempre que receber uma nova pasta de catálogo em `IMPORTADOR-PRODUTOS-IA/produtos para importar/<NOME-DA-PASTA>/` para organizar, auditar, gerar imagens WebP e importar para a loja `loja-comercial-do-norte`.

---

```text
Você é um engenheiro sênior responsável por organizar e importar um catálogo de produtos para o e-commerce Comercial do Norte (`D:\.GITHUB\sistemas\loja-comercial-do-norte`), usando o toolkit oficial em `IMPORTADOR-PRODUTOS-IA/ferramenta-ia-import/`.

PASTA DO LOTE A IMPORTAR:
`IMPORTADOR-PRODUTOS-IA/produtos para importar/<SUBSTITUIR-PELA-PASTA>`

AMBIENTE ALVO:
SOMENTE BANCO LOCAL (`127.0.0.1:55432`) a menos que eu peça explicitamente por escrito para publicar no banco online após validação completa.

REGRAS INEGOCIÁVEIS:
1. NUNCA invente preço (`priceCents = null`, `pricingMode = 'QUOTE_ONLY'`), peso logístico (`weightGrams`), dimensões de envio (`widthMm`/`heightMm`/`lengthMm`), GTIN/EAN ou estoque.
2. NUNCA apague marcas, categorias, segmentos, tags, usuários, banners do site (`seed-banner-*`), posts, eventos ou configurações ao limpar produtos de teste.
3. Preserve todas as variantes agrupadas sob o mesmo produto pai (`produto_pai_id` -> 1 `Product` com N `ProductVariant` + N `sku` únicos).
4. Regra mínima para publicar (`ACTIVE`): Nome + Foto principal + SKU.
   - Campos faltantes não bloqueantes (sem preço, sem peso de frete, sem medidas de frete, foto compartilhada, sem EAN) NÃO bloqueiam publicação: recebem etiqueta AMARELA (`YELLOW`) em `auditHealth`, `auditIssueCodes` e `auditIssues`.
   - Erros críticos (`GTIN_INVALIDO`, `CODIGO_DUPLICADO`, `FOTO_DIVERGENTE`, `CONFLITO_SOBREPOSICAO_PDF`, `ESPECIFICACAO_SUSPEITA`) recebem etiqueta VERMELHA (`RED`) e ficam retidos em `DRAFT` (`--publish-mode eligible`) com motivo explícito para revisão no Admin.

PASSO A PASSO OBRIGATÓRIO:
Etapa 1 — Inspecionar a pasta de entrada:
- Liste todos os arquivos da pasta alvo.
- Verifique se já existe `catalogo_final.json` (com `marcas`, `categorias`, `produtos_pais`, `variacoes` e pasta `imagens/`).
- Se a pasta ainda estiver em formato bruto (`.xlsx`, `.csv`, `.json` solto + imagens), normalize antes com:
  `python "IMPORTADOR-PRODUTOS-IA/ferramenta-ia-import/src/prepare_catalog.py" --input "<PASTA-BRUTA>" --output "<PASTA-PRONTO>"`
  e revise eventuais duplicidades de SKU, GTIN inválido, imagens ausentes ou marcas/categorias sem padronização.

Etapa 2 — Verificar infraestrutura local:
- Garanta que o PostgreSQL local (`127.0.0.1:55432`) está ativo e as migrações Prisma estão aplicadas (`pnpm db:migrate:deploy` — verifique `.env`, NÃO use `.env.neon`).
- Rode `pnpm --filter ./apps/api exec tsc --noEmit` se tiver alterado regras de catálogo.

Etapa 3 — Limpeza segura (APENAS se o objetivo for substituir catálogo demo anterior no local):
- Rode primeiro `--dry-run`:
  `npx tsx "IMPORTADOR-PRODUTOS-IA/ferramenta-ia-import/src/clean-local-products.ts" --confirm --dry-run`
- Confirme que `Brand`, `Category`, `Segment`, `Tag`, `SiteBanner`, `Post`, `Event` e `User` continuam intactos, então execute sem `--dry-run` se aplicável.

Etapa 4 — Simulação (Dry-Run) obrigatória:
- Execute:
  `npx tsx "IMPORTADOR-PRODUTOS-IA/ferramenta-ia-import/src/import-catalog.ts" --source "<PASTA-DO-LOTE>" --dry-run`
- Confira no resumo JSON: total de pais, total de variações, marcas/categorias reaproveitadas vs novas, arquivos de imagem faltantes (deve ser 0), distribuição `GREEN / YELLOW / RED` e motivos. Se houver erro crítico inesperado no parser, corrija o dado/mapeamento antes de gravar.

Etapa 5 — Importação real no banco local + espelhamento de imagens:
- Execute:
  `npx tsx "IMPORTADOR-PRODUTOS-IA/ferramenta-ia-import/src/import-catalog.ts" --source "<PASTA-DO-LOTE>"`
- Execute em seguida para copiar todas as imagens WebP (`480`, `960`, `1440`) para `apps/storefront/public/storage` e `apps/api/public/storage`:
  `node scripts/copy-web-builds.mjs`

Etapa 6 — Auditoria pós-importação (obrigatória antes de me responder):
- Consulte no PostgreSQL local as contagens reais de `Product`, `ProductVariant`, `ProductImage`, `Brand`, `Category`, `Segment`, distribuição de `status` (`ACTIVE` vs `DRAFT`) e `auditHealth` (`GREEN` / `YELLOW` / `RED`).
- Verifique se ao menos um produto multiparte/variação (ex.: variantes de cor) possui todas as variantes vinculadas e suas imagens WebP existem em disco.
- Execute a suíte de testes relevante e entregue um resumo direto em português simples listando: quantos produtos entraram publicados (*Sob cotação*), quantos ficaram em rascunho/vermelho e por quê, quantos têm ressalva amarela, e próximos passos práticos.
```
