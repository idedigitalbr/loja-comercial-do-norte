# Changelog

> Registro datado do que entrou no repositório e do que foi verificado na máquina.
> Ordem cronológica crescente — entradas novas **no fim**.

---

## 2026-10-11 → 2026-10-23 (histórico anterior, resumo)

| Data | Commit(s) | O que entrou |
|---|---|---|
| 11/09 | — | Fundação do monorepo (base Jonas & Elivaldo): NestJS + Prisma + React/Vite, gates, migrations, seed |
| 13–16/09 | `c5835e4`, `3d90d9c`, `7c36475` | Settings administrativos, segredos criptografados, integrações, área do cliente |
| 01–03/10 | `f391d4e`, `ac49288`, `6c84a57` | Storefront/admin completos, design de deploy em VPS, paridade visual |
| 23/10 | `6195c6c` | Migração inicial para Comercial do Norte: marca no header/admin, menu reduzido, rotas institucionais fora do router |
| 23/10 | `45f4427` | README reescrito para Comercial do Norte |
| 23/10 | `316508b` | `design-preview.html` (preview de tokens) |
| 23/10 | `62a959a` → `695d808` | Prompts de engenharia reversa do Payload e design system |
| 23/10 | `c6977e0` | `site-comercial-do-norte-html-referencia/` (115 arquivos, 61,8 MB) |
| 23/10 | `ecd0c39` | **Remoção do CI** (token sem scope `workflow`) |

---

## 2026-10-24 — Sincronização com GitHub

- **Clone completo** de `github.com/victorwilliames/loja-comercial-do-norte` para `C:\.PROJETOS - Sites 2026\next\loja-comercial-do-norte`, que estava **vazia** → nenhum arquivo sobrescrito, nenhum conflito.
- Resultado: branch `main`, HEAD `9e19170`, working tree limpo, `origin/main` em sincronia.
- **Permissões confirmadas**: admin/maintain/push/pull/triage; `git fetch --dry-run` e `git push --dry-run` retornaram exit 0.
- Sem branch protection, sem tags, sem PRs, sem issues, 0 workflows de Actions.
- Ajuste local necessário no sandbox: `git config --local http.sslBackend openssl` (schannel falha com `SEC_E_NO_CREDENTIALS` dentro do DSH). Nenhuma alteração em arquivos versionados.

## 2026-10-24 — Análise técnica completa

- Leitura integral da estrutura: 487 arquivos, 54 models + 29 enums Prisma, ~90 rotas de API, 86 specs.
- Inventário de páginas, módulos, integrações e fluxo de deploy documentado em `ANALISE-TECNICA-2026-10-24.md`.
- **16 achados** com evidência `arquivo:linha` e severidade (P0–P3), incluindo: seed que quebra por falta de variáveis (A1), Node/pnpm divergentes (A2), produto DRAFT exposto (A4), filtro de marcas do site antigo escondendo o catálogo novo (A5), conteúdo do salão ainda embutido (A6), ausência de fluxo de cotação (A8), notificação que não chega às vendas (A9) e risco de 404 no root em produção (A10).
- Correções pontuais ao `memory-ai.md` registradas (tabela `SiteBanner`, `/site/config` existe, 86 specs, seed com dados do Jonas).
- **Não executado** (e por quê): `pnpm install` (bloqueio de sandbox), `test`, `build`, `typecheck`, banco/seed. Registrado em §9 da análise.

## 2026-10-24 — Organização da memória

- Criada a pasta `prompts-memory-ai/permanente/` com:
  - `00-LEIA-PRIMEIRO.md` — índice e estado atual;
  - `ANALISE-TECNICA-2026-10-24.md` — raio-X técnico;
  - `PROXIMOS-PASSOS-E-INTERRUPTOS.md` — backlog P0/P1/P2 e bloqueios;
  - `changelog.md` — este arquivo.
- `memory-ai.md` **completado**: o trecho final estava truncado em `…[truncated 2693 chars]`; as seções §7 (dados da loja) e §8/§9 foram reconstruídas a partir do `CONTEXTO-PARA-CHATGPT.md`.
- Nenhum arquivo de código foi alterado nesta rodada. Nada foi commitado.

---

## Pendente de registro (preencher quando acontecer)

- [ ] Primeiro `pnpm install` + `pnpm test` no ambiente correto (resultado e falhas).
- [ ] Restauração do CI.
- [ ] Etapas 0–7 da fase 1.
