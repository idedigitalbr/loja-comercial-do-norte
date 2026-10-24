# ROADMAP & AUDITORIA — COMERCIAL DO NORTE

> **Único documento operacional de execução, bloqueios, riscos e histórico breve** — atualizado em **24/10/2026**.
> Decisões permanentes e contexto: [`memory-ai.md`](./memory-ai.md). Não criar changelog, checklist ou prompts de memória separados nesta pasta.

## 1. Estado confirmado nesta revisão

- Repositório oficial **privado**: [idedigitalbr/loja-comercial-do-norte](https://github.com/idedigitalbr/loja-comercial-do-norte). Branch de desenvolvimento `feat/stack-next-postgres` em `88c413c`; coordenação em `chore/multiagent-coordination`. Main em `564c9e3`; nenhuma integração/deploy autorizada nesta missão.
- Código conferido: Next.js App Router na loja, NestJS como API única, admin React/Vite, Prisma/PostgreSQL com quatro migrations versionadas, cotação implementada e flags isolando módulos futuros. Padronização visual completa, Playwright e prontidão de produção ainda pendem.
- Fonte operacional de tarefas/status: [Project 3](https://github.com/orgs/idedigitalbr/projects/3). Roadmap registra marcos, riscos e evidências; o manifesto é estrutura de bootstrap, não um espelho autoritativo de execução.
- O prazo registrado da fase 1 permanece **31/10/2026**, sujeito a aceite; não prova datas individuais das Sprints. Não foi executada migration nem inicialização de PostgreSQL nesta recuperação.

### 1.1 Execução real em 24/10/2026 (branch `feat/stack-next-postgres`)

| Verificação | Comando | Resultado |
|---|---|---|
| CI completo (GitHub Actions) | run `40116859387` no commit `7a64b64` | **SUCESSO** — `pnpm install --frozen-lockfile`, `prisma generate`, `migrate deploy` (3 migrations), `db:seed` (catálogo demo + imagens WebP + templates), `lint` **6/6**, `typecheck` **6/6**, `typecheck:seed`, **testes de todos os pacotes** e `build` **6/6** com `next build` ("Compiled successfully") + build da API e do admin |
| Dependências locais | `pnpm install` (store/cache no workspace, `--node-linker=hoisted`) | 471+ pacotes; `argon2`, `sharp` e `prisma generate` funcionais |
| Typecheck local | `pnpm typecheck` | **6/6 tarefas OK** |
| Lint local | `pnpm lint` | **6/6 tarefas OK** |
| Build local | `pnpm build` | `contracts`, `api-client` e `api` OK; `admin`/`storefront` bloqueados pelo sandbox (`spawn EPERM` do esbuild/turbopack), validados no CI |
| Testes locais | `vitest` | **bloqueado pelo sandbox** (esbuild não inicia serviço); suítes executadas no CI |
| Verificação alternativa | build `tsc` + script JS puro | R04, E7 e R05 verificados contra o build compilado (`apps/api/dist`) |
| PostgreSQL | binários `embedded-postgres` + `scripts/dev/postgres.mjs` | PostgreSQL 18 real em `127.0.0.1:55432` |
| Migrations | `pg` aplicando `prisma/migrations/**` em banco novo | baseline `54 tabelas/29 enums/165 índices`; após cotação: **57 tabelas**, `QuoteStatus` com 7 valores e 2 eventos de e-mail |

**Consequência:** a base compila, passa em lint/typecheck/testes e builda no CI; localmente o sandbox bloqueia apenas esbuild/Prisma engine (registrado acima).

### Fonte única dos arquivos de memória

`docs/memory-ai.md` = decisões e fatos duradouros.
`docs/roadmap.md` = o que fazer, evidências, bloqueios, auditoria e changelog compacto.

Complementos permitidos: `docs/security/lgpd-data-map.md` e `docs/security/threat-model.md`. Nada além disso.

Toda a documentação anterior (memórias, auditoria técnica, prompts, planos/specs, runbooks MySQL/Hostinger, importação WooCommerce e MVP antigo) foi **removida do worktree** em 24/10/2026 e permanece somente no histórico Git (`5781590`). **Não recriar cópias**, arquivos `*-old.md`, `*-backup.md` ou pastas de arquivo dentro do repositório.

## 2. Planejamento macro — tarefas e estados no Project

| Etapa | Evidência na branch de desenvolvimento | Pendência principal | Fonte operacional |
|---|---|---|---|
| 1 — Arquitetura/qualidade | CI e base de ambiente versionados; coordenação recuperada nesta missão | validar automações com credencial Projects e revisão humana | [#42](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/42) |
| 2 — PostgreSQL/Prisma | provider, SQL, seed e quatro migrations versionadas | integração concorrente real, backup/recovery e produção | [#43](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/43) |
| 3 — Design system | tokens e primitivos em packages/ui | consumo consistente, acessibilidade e admin | [#44](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/44) |
| 4 — Next.js | App Router, integração REST e metadata/sitemap/robots | fidelidade HTML, performance, navegador e produção | [#45](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/45) |
| 5 — Catálogo/cotação | hierarquia de categorias, busca, solicitação idempotente, fila admin e notificações | contatos/marcas/fotos oficiais, home final e aceite Playwright | [#46](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/46) |
| 6 — Homologação/futuro | escopo separado e dependências identificadas | ERP só com contrato; checkout só após correções/homologação | [#47](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/47) |

As **36 tarefas originais** permanecem no Project/manifesto com as mesmas identidades. A manutenção de coordenação é [#48](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/48), adicional às originais. Não manter checklists duplicados de execução neste arquivo. O aceite de negócio segue: catálogo → cotação → vendas/admin, sem cobrança online, dados oficiais e operação possível pelo marketing.

## 3. Achados técnicos que NÃO podem se perder

| ID | Severidade | Problema constatado no código legado / ação | Evidência |
|---|---|---|---|
| R01 | **P0** | O `payments.service.ts` atualiza o pagamento no webhook mas não demonstra transição automática do pedido para `PAID`; testar e corrigir ANTES de habilitar checkout. | `apps/api/src/modules/payments/payments.service.ts` |
| R02 | **P0** | `checkout` aceita `shippingCents` fornecido pelo cliente; não confiar em preço, frete ou total vindos da interface. A API precisa recalcular/verificar cotação de frete autenticada. | `apps/api/src/modules/checkout/checkout.service.ts` / `orders/orders.service.ts` |
| R03 | **P0** | `job-handlers.ts` é um mapa de no-ops; apenas `SEND_TRANSACTIONAL_EMAIL` é sobrescrito com implementação real em `jobs.module.ts:20`. `RELEASE_EXPIRED_RESERVATIONS`, `RECONCILE_PAYMENT`, `GENERATE_REPORT` e `CLEAN_EXPIRED_CARTS` só retornam `undefined` — o runner marca o job como concluído sem executar nada. Implementar antes de operar vendas/estoque. | `apps/api/src/modules/jobs/job-handlers.ts:5-11`, `jobs.module.ts:18-21` |
| R04 | **P0** | ~~Produto DRAFT acessível por slug~~ **Corrigido em 24/10/2026:** `getProductBySlug` passou a filtrar `status: ACTIVE`; coberto por `catalog-public-access.spec.ts` e validado no build compilado. | `apps/api/src/modules/catalog/catalog.service.ts` |
| R05 | **P0** | ~~`GET /orders/:publicId` pode não validar ownership~~ **Corrigido em 24/10/2026:** `OrdersService.getForUser(publicId, userId)` filtra por dono e devolve 404 para terceiros; coberto por `orders-ownership.spec.ts` e validado no build compilado. | `apps/api/src/modules/orders/orders.service.ts` |
| R06 | **P1** | Melhor Envio provider é stub e não consulta API real. Retirada traz rótulo legado “salão”. | `apps/api/src/modules/shipping/providers/{melhor-envio,pickup}.provider.ts` |
| R07 | **P1** | **Corrigido na branch de desenvolvimento:** shell/SEO legado da loja removido, Next fornece metadata e CSP foi ajustada. Confirmar domínio final antes de publicar. | `apps/api/src/public-shell/seo-renderer.service.ts`, `apps/api/src/main.ts` |
| R08 | **P1** | **Superado na branch de desenvolvimento:** loja Next usa busca/paginação REST no servidor; trecho Vite citado é histórico. | `apps/storefront/src/pages/shop-page.tsx` |
| R09 | **P1** | **Implementado:** Category tem parentId/imagePath/sortOrder, filtro descendente e proteção contra ciclos. Aceite de upload/ordenação do admin pendente. | `prisma/schema.prisma` |
| R10 | **P1** | **Implementado na API:** domínio próprio de cotação, fila admin e notificações. Solicitação não cria pedido/reserva de venda; aceite no navegador ainda pendente. | `orders.service.ts`, `notifications`, `checkout` |
| R11 | P1 | **Parcialmente corrigido em 24/10/2026:** seed, banners default e nome padrão do schema não usam mais Jonas/Elivaldo; resta conteúdo herdado em `apps/storefront/src/content`, removido na migração Next. | `prisma/seed.ts`, `apps/api/src/modules/settings/default-home-banners.ts` |
| R12 | **P1** | **Superado na branch de desenvolvimento:** provider/lock PostgreSQL e quatro migrations versionadas. Histórico MySQL permanece no Git. | `prisma/`, `scripts/repair-migration-history.ts` |
| R13 | **P1** | Shell público da loja removido; validar reverse proxy Next/Nest/admin e rotas finais antes de produção. | `apps/api/src/public-shell/`, `apps/api/src/main.ts` |
| R14 | **P1** | CI existe e possui runs verdes históricos. Resultado atual da recuperação está na seção 8; não confundir run antigo com validação do novo commit. | `.github/workflows/` ausente |
| R15 | **P2** | Testes Vite antigos foram removidos na migração anterior; cobertura de navegador Next/Playwright continua pendente. | `apps/storefront/src/pages/institutional-pages.spec.tsx` |
| R16 | **P2** | CSS extenso duplicado e tokens de salão contradizem referência Comercial do Norte; `packages/ui` subaproveitado. | `apps/*/src/styles.css`, `packages/ui` |

**Severidade é de revisão estática; não significa exploração demonstrada.** Preservar as correções R04/R05 antes de abrir dados reais ao público; R01–R03/R06 são bloqueadores de **checkout de venda**, não necessariamente do MVP sem cobrança.

## 4. Catálogo e UI: critérios de aceitação completos

- **Design**: extrair tokens e componentes de `site-comercial-do-norte-html-referencia/`; manter identidade azul `#264887`, vermelho `#E33C34`, fundo `#F4F7FB`, Lufga/Plus Jakarta Sans, ícones Lucide e responsividade.
- **Navegação**: header, busca, mega menu hierárquico, campanha editável, produtos, categorias, marcas, mini-carrinho e rodapé.
- **Cotação**: visitante não precisa criar conta; quantidade editável; captura dados necessários; formulário acessível; API idempotente; notificação para vendas; histórico e estado no admin.
- **Publicação**: Produto DRAFT invisível tanto em busca/lista quanto em detalhes; preço/categoria/variante/imagem com regras comerciais explícitas; o marketing publica.
- **SEO**: título, descrição, canonical, sitemap, robots, OG, JSON-LD quando aplicável, URLs limpas e noindex de páginas privadas/rascunhos.
- **Qualidade**: sem warnings críticos de React/hydration, sem links quebrados, imagens redimensionadas, 404 correto, validação de tudo no Nest, smoke tests em produção/homologação, testes automatizados e evidência de sucesso.

## 5. Regras da migração e das branches

1. Não executar `prisma migrate reset` nem apagar migrations legadas num banco existente sem **verificação explícita** do banco e backup. Como não há produtos, o caminho de **PostgreSQL vazio** é preferível, mas ainda precisa verificar users/settings/banners.
2. Registrar todos os arquivos e scripts que dependem de MySQL; adaptar SQL com identificadores entre aspas duplas (`"InventoryBalance"`, por exemplo), sem injeção, preservando transação e locks.
3. Não misturar refatoração visual extensa no commit que troca provider do Prisma. Usar PRs/commits pequenos e reversíveis, scripts com `--dry-run` quando possível.
4. O frontend migrado usa o Nest via contratos compartilhados; não adicionar Prisma ao Next nem inventar endpoints BFF permanentes para contornar a API.
5. Fase 1 aprovada = cotação; funcionalidades herdadas de pagamentos e treinamentos permanecem isoladas. Uma evolução para loja com pagamento requer decisão e homologação independentes.
6. Não alterar ao mesmo tempo o banco que opera vendas e a implementação de checkout. Homologar em staging antes do cutover.

## 6. Documentação — estado final

A documentação oficial é **somente**:

- `docs/memory-ai.md` — decisões, contexto e padrões.
- `docs/roadmap.md` — este arquivo.
- `docs/security/lgpd-data-map.md` e `docs/security/threat-model.md` — complementos de segurança/LGPD, sem repetir decisões de produto.

Removidos do worktree em 24/10/2026 (preservados no commit `5781590`, acessíveis por `git show 5781590:<caminho>`):

| Removido | Motivo |
|---|---|
| `prompts-memory-ai/**` (9 arquivos, incl. `permanente/`) | memória antiga e contraditória; consolidada nos dois arquivos atuais |
| `docs/superpowers/**` (planos e specs) | engenharia da base Jonas, sem valor de decisão atual |
| `docs/acceptance/mvp.md` | MVP com checkout/Pix/treinamento; substituído por cotação |
| `docs/decisions/phase-1-gates.md` | gates de MySQL/Hostinger; substituído pela fase A/B deste roadmap |
| `docs/runbooks/hostinger-*.md`, `docs/runbooks/local-laragon.md` | deploy MySQL/processo único; runbook novo entra em D7 (VPS Next + Nest + PostgreSQL) |
| `docs/migration/**` | importação WooCommerce da loja anterior; não é especificação do ERP |
| `docs/testing/strategy.md` | camadas e gates já absorvidos em A2/A4 e na seção 4 |
| `docs/ui-design/**` | design preto/dourado da Jonas; a identidade oficial está em §3 do `memory-ai.md` |
| `docs/README.md`, `docs/_archive/**` | índice e backups que só existiam para os documentos acima |
| pacote `COMERCIAL-DO-NORTE-MEMORIA-IA-2026-10-24` (Downloads) | origem da memória consolidada; apagado |

**Regra:** não recriar cópias, `*-old.md`, `*-backup.md`, `*-v2.md` ou pastas de arquivo dentro do repositório. O histórico é o Git.

## 7. Histórico consolidado (curto, com fatos e sem duplicações)

| Data | Registro |
|---|---|
| 11/09–03/10/2026 | Base Jonas & Elivaldo construída com NestJS, Prisma/MySQL, React/Vite, admin, catálogo, pagamentos, CRM/treinamentos e documentação legada. |
| 20–21/10/2026 | Decisões de produto Comercial do Norte: fase 1 catálogo + cotação; ERP depois; layout varejista, azul/vermelho, “Explica Aí Comercial”. |
| 23/10/2026 | Primeiras adaptações ao novo cliente; repositório incorpora a referência visual HTML e estudos de Payload como ideias, sem adoção como backend. |
| 24/10/2026 (`5781590`) | Antigo agente reorganizou `prompts-memory-ai`, `permanente` e `ui-design`; produziu auditoria de código, backlog e changelog, ainda com escolhas antigas de stack. |
| **24/10/2026 — decisão do responsável** | **Escolhida a stack Next.js + NestJS + PostgreSQL + Prisma + Tailwind CSS + shadcn/ui, monorepo e componentes compartilhados.** Medusa/Payload/TanStack Start excluídos da implementação; manter fase 1 cotação. |
| **24/10/2026 — esta revisão** | Contexto histórico e auditoria consolidados em **dois Markdown**; tarefas de migração formalizadas; **nenhuma alteração de código, banco, deploy ou GitHub afirmada**. |
| **24/10/2026 — consolidação final** | Documentação reduzida a `docs/memory-ai.md` + `docs/roadmap.md` + `docs/security/`; **31 arquivos legados** (22 de `docs/` + 9 da memória antiga) e a pasta `prompts-memory-ai/` removidos do worktree; pacote de memória em Downloads apagado. Histórico preservado no commit `5781590`. **Nenhum código, banco ou migration alterado.** |
| **24/10/2026 — execução (branch `feat/stack-next-postgres`)** | Dependências instaladas (store local), `typecheck`/`lint` 6/6, build OK na API e bloqueado no Vite pelo sandbox; **R04 e R05 corrigidos** com testes; Prisma migrado para PostgreSQL, SQL nativo adaptado e busca case-insensitive; PostgreSQL 18 local provisionado por script; **CI criado**; migration baseline PostgreSQL bloqueada pelo sandbox (`spawn EPERM` no `schema-engine`). |
| **24/10/2026 — cotação + Next + CI verde** | Migration PostgreSQL gerada pelo Prisma no runner e validada (`57 tabelas` com cotação); **domínio de cotação** (`Quote/QuoteItem/QuoteEvent`, `POST /quotes` público, fila admin `quotes.manage`, notificações); **storefront migrado para Next.js 16** com tokens oficiais e fluxo de cotação completo; **shell/SEO legado removido**; **CI verde** no run `40116859387` (commit `7a64b64`) com lint/typecheck/testes/build incluindo `next build`. |
| **24/10/2026 — checkpoint de auditoria (HEAD `1813e1a`)** | **Desenvolvimento autônomo pausado a pedido do responsável** para auditoria independente. HEAD com **CI verde** (run `40121852853`): lint, typecheck, typecheck do seed, testes de todos os pacotes, **E2E da API da cotação**, `next build` e builds da API/admin. Estado conhecido: nenhuma validação em navegador (Playwright) realizada; dados oficiais de contato/marcas/fotos pendentes de confirmação; marcas "Jonas & Elivaldo" residuais em `settings.service.ts` (fallbacks), `notifications.service.ts` (e-mail de teste) e no login do admin; `apps/storefront/tsconfig.tsbuildinfo` era artefato de build versionado por engano (removido do índice neste checkpoint). Nenhuma migration, deploy ou merge na `main` foi executado. |

### Protocolo de manutenção daqui em diante

Após cada marco, atualizar a Issue operacional com evidência: data, branch/commit, comandos de teste, resultado e rollback. Conclusão exige revisão humana; não editar listas duplicadas de status. Inserir uma linha nova no histórico **deste arquivo** em vez de criar `changelog.md` extra. Se o requisito mudar, atualizar `memory-ai.md` no mesmo commit.

**Critério principal de encerramento:** stack nova implementada e testada, projeto rodando em Next + Nest + PostgreSQL, UI padronizada em Tailwind/shadcn, negócio de cotação funcional, e nenhuma dependência de Medusa ou Payload.

## 8. Recuperação da coordenação — 24/10/2026

**Escopo:** [Issue #48](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/48), [PR #37](https://github.com/idedigitalbr/loja-comercial-do-norte/pull/37). Não desenvolver e-commerce, executar migrations, iniciar PostgreSQL, fazer merge ou deploy.

### Recuperado e preservado

- Branch `chore/multiagent-coordination`, HEAD inicial `1078e31`, sincronizado com remoto; main `564c9e3`, desenvolvimento `88c413c`. Sem stash nem outro worktree. Origin já correto.
- Três arquivos não rastreados do Harness: `setup-hierarchy.mjs`, `setup-views.mjs`, `verify-project.mjs`; quatro patches e consultas GraphQL em `.agents-work/`. Cópia externa preservada no TEMP, prefixo `cdn-coordination-recovery-20261024-180750`.
- Patches não foram executados às cegas: continham leitura insegura de dono por comentário, referência a `project.items` não carregado e opção de reconciliar apagando status. Funcionalidades recuperadas foram incorporadas aos scripts com proteção e testes.
- PR #37 tinha a migração da aplicação inteira contra main. Base alterada para a branch de desenvolvimento existente; diff de coordenação isolado, sem branch de trabalho adicional e sem reescrever histórico.

### Quadro e histórico verificados pela API

- Nome preservado: **Quadro -  loja-comercial-do-norte**. Project vinculado ao repo oficial privado. **47 itens**: 36 tarefas originais + 4 Sprints + 6 Etapas + manutenção #48. Relações nativas preservadas; #48 pertence à Etapa 1, reaberta por ter filho pendente.
- **42/42 dependências originais** confirmadas por leitura, grafo validado sem ciclos. A recuperação não precisou recriar dependências que já existiam. Ciclos externos ao Project também são percorridos pelos scripts.
- Todos os itens têm Assignee humano; nove agrupadores sem responsável receberam `victorwilliames`. Nenhum responsável legítimo removido.
- Somente **Tabela, Kanban e Roadmap**. Tabela com 11 colunas na ordem aprovada e Labels oculta; cartões do Kanban reduzidos a campos essenciais. Roadmap filtra agrupadores por ausência de Tipo. Nenhuma data nova inferida; datas anteriores preservadas.
- Agente executor contém Codex (Will), Antigravity (Will), Claude (Will), DeepSeek Harness (Will), OpenCode (Will), com IDs estáveis e modelo nulo até confirmação. Humano/Não atribuído removidos após limpeza. Valor legado DeepSeek da #23 preservado em participantes e comentário, com operador/horários não confirmados, sem sessão retroativa inventada.
- Causa dos status incompatíveis: automações nativas continuavam usando IDs de opções renomeadas; reservar #48 fechou a Issue automaticamente, comprovado no timeline. Removidas as cinco regras nativas de status/fechamento, mantida Auto-add sub-issues to project. #48 reaberta; tarefas previamente fechadas com evidência foram apenas alinhadas a Concluído, sem novas aprovações de negócio.
- Progresso é o campo nativo Sub-issues progress. Reconciliador não deriva status de execução dos contadores nem sobrescreve reserva/bloqueio de agrupadores. Nenhuma Sprint foi fechada.
- Reserva própria #48 migrada para ref única antes de remover a própria ref legada. Ledger por commits mantém sessão inicial verificável, sessões do teste, eventos e participantes. Não registra telemetria inventada.

### Validação e limites

| Camada | Comando/evidência | Resultado |
|---|---|---|
| Regras locais | `node --test scripts/agents/*.test.mjs` | **8/8 aprovados**, com ciclo falhar/corrigir verificado; propriedade, histórico, ciclos longos/externos, aprovação estrutural e espelho pendente |
| API real — concorrência | `node scripts/agents/live-reservation-test.mjs --live --issue-48` | dois commits irmãos disputam a mesma ref: um aceito, outro recusado; liberação atrasada recusada após nova sessão; histórico preservado |
| API real — bloqueio | claim da #15 com dependência #14 aberta | recusado antes de criar reserva |
| API real — propriedade | release #48 com sessão incorreta | recusado; reserva preservada |
| API real — recuperação | `live-reservation-test.mjs --live --issue-48 --mirror-recovery` | release com espelho pendente impediu novo claim; reparo explícito e auditado removeu pendência; novo claim pela CLI confirmado. Participantes/histórico preservados |
| API real — quadro | `node scripts/agents/verify-project.mjs` | 36 originais, 47 itens, 42/42 dependências; zero erros na auditoria implementada |
| Idempotência | segunda reconciliação aplicada e dry-run | **zero alterações**, nenhuma Issue/view duplicada |
| Lint/typecheck | launcher local pnpm | **lint 6/6 e typecheck 6/6 aprovados**; ESLint dos scripts de coordenação também aprovado |
| PR real | `PR_NUMBER=37 node scripts/agents/pr-sync.mjs`, duas vezes | evidência publicada na #48 sem duplicação; estado e reserva preservados; transição para revisão usa a sessão proprietária |
| Suíte geral local | launcher `.tools/bin/pnpm.cmd test`, TEMP/TMP em `.agents-work/tmp` | **falhou**: API com 12 arquivos de teste falhos, 52 aprovados; 126 testes aprovados, 1 falho e 16 pulados. PostgreSQL `127.0.0.1:55432` indisponível. Nenhum banco iniciado/alterado para contornar o limite |
| Primeiras tentativas locais | pnpm global / TEMP do Windows | bloqueios de permissão resolvidos usando launcher/cache temporário do workspace; não confundir essas tentativas com teste aprovado |
| Navegador | in-app browser e tentativa de Chrome | in-app sem login no GitHub; controle do Chrome interrompido pela ferramenta por não conseguir confirmar URL. Agrupamento por Status no Kanban, expansão hierárquica da Tabela e propriedades da timeline **não verificados visualmente** |
| Automações Actions | secrets do repositório e branch padrão | `PROJECT_TOKEN` não listado no repo; visibilidade de eventuais secrets organizacionais não comprova disponibilização ao workflow. CLI OAuth com project/repo tem leitura/escrita real, mas não equivale ao token efêmero do Actions |

### Ativação pendente, rollback e próxima revisão

- Revisão humana do PR #37 contra `feat/stack-next-postgres`; integração na main continua proibida sem autorização. Automação por comentário só executa o código da branch padrão. PR privilegiado usa checkout explícito da branch padrão; enquanto os scripts não estiverem lá, a automação completa não está ativa.
- Configurar secret `PROJECT_TOKEN` ou token de instalação de App com acesso mínimo de Projects e leitura das Issues vinculadas; provar a permissão no Actions. Não publicar a credencial local nem presumir que o secret exista por nome. Falha deve ser explícita antes de reservar.
- Confirmar na UI: Kanban agrupado por Status com sete opções, Tabela com hierarquia expandida, Roadmap com campos Start date/Target date e progresso. API pública disponível nesta sessão não expõe agrupamento/timeline. Não inventar datas.
- Sessões usam identificador aleatório único por operação e `pendingMirror` como barreira entre ledger e espelho: nova operação recusa enquanto houver reparo pendente. Recuperação exige confirmação de processo encerrado e motivo; refs permanentes não são excluídas. Cancelar uma projeção de conclusão inválida exige `repair --recover --cancel-pending --reason`, preserva o evento anterior e retorna à revisão; intenção de reabrir é persistida para repetição segura.
- Rollback de código: revert dos commits de coordenação, sem restaurar o protocolo inseguro em operação ativa. Não apagar refs/ledgers ou histórico. Configuração do Project exige revisão dos IDs reais; nunca recriar auto-close/auto-done com opções renomeadas. Campos e relações existentes foram preservados.
- Pendências de aplicação continuam nas Issues originais; esta recuperação não homologa produção, Playwright, ERP, checkout ou persistência.

### Checkpoint solicitado pelo responsável

Execução encerrada para conservar a franquia. Código e scripts recuperados preservados na branch `chore/multiagent-coordination`; PR #37 permanece com base em `feat/stack-next-postgres`. Últimas evidências: 8/8 testes rápidos, sintaxe/ESLint dos scripts, lint e typecheck 6/6; concorrência e recuperação confirmadas pela API/CLI. Não houve nova tentativa de integração PostgreSQL, merge ou deploy. Homologação do Actions com PROJECT_TOKEN e configuração visual do Kanban/timeline permanecem pendentes. O diagnóstico de credenciais foi preparado, mas ainda não executado no Actions. CI do novo checkpoint deve ser consultado na próxima sessão; não foi aguardado nesta rodada.

### Checkpoint Project e agenda — 24/10/2026

- Migração aplicada e conferida pela API: `Tipo` e `Agentes que participaram` multisseleção; `Agente executando` seleção única; `Início`/`Entrega` como datas; prioridade P0 renomeada para URGENTE. Campos legados removidos após migração. Tabela/Kanban atualizados; Roadmap permanece sem configuração visual de datas/escala, não exposta pela API disponível.
- Agenda aplicada sem sobrescrever datas existentes: 34/34 itens fora de Backlog têm início e entrega; 8 itens em Backlog seguem sem datas. Datas ativas são estimativas. Sprint 3 mantém entrega de 31/10; agregação de tarefas chega a 07/11 e precisa de revisão humana.
- Reconciliação de categorias executada; `verify-project.mjs`: 47 itens, 42/42 dependências, zero erros. A reserva de #48 continua ativa para `codex-will`, sem atividade confirmada nesta sessão.
- Pendente: configuração visual do Roadmap, revisão da divergência de Sprint 3, CI após o novo push e homologação de `PROJECT_TOKEN` no Actions. Nenhum PostgreSQL iniciado; sem merge/deploy.
