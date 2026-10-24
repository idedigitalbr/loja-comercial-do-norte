# LEIA PRIMEIRO — Memória permanente do projeto

> Pasta de memória de longo prazo do repositório **loja-comercial-do-norte**.
> Qualquer IA ou pessoa que for mexer no projeto deve ler esta pasta antes de alterar código.

---

## Ordem de leitura

| # | Arquivo | Para que serve |
|---|---|---|
| 1 | [`memory-ai.md`](./memory-ai.md) | **Verdade de produto.** Decisões da reunião, escopo da fase 1, estrutura da home S0–S10, dados da loja, gaps conhecidos. Em conflito com código, este arquivo vence em decisões de produto. |
| 2 | [`ANALISE-TECNICA-2026-10-24.md`](./ANALISE-TECNICA-2026-10-24.md) | **Raio-X do código.** Arquitetura, inventário de rotas/páginas, 16 achados com `arquivo:linha` e severidade, correções ao `memory-ai.md`, roadmap por prioridade. |
| 3 | [`PROXIMOS-PASSOS-E-INTERRUPTOS.md`](./PROXIMOS-PASSOS-E-INTERRUPTOS.md) | **O que fazer agora** e o que ficou parado (com motivo). Backlog P0/P1/P2. |
| 4 | [`changelog.md`](./changelog.md) | Histórico datado do que entrou no repositório e do que foi verificado. |

Fora desta pasta:
- `prompts-memory-ai/PROMPT-FASE1-SEM-API.md` — plano de execução em 7 etapas (Etapa 0 a 7) para a fase 1.
- `prompts-memory-ai/CONTEXTO-PARA-CHATGPT.md` — versão "para colar em chat" do contexto do projeto.
- `ui-design/DESIGN.md` e `ui-design/UX-CONTRACT.md` — design atual (ainda herdado do Jonas; será reescrito na Etapa 5).
- `prompts/00-master-like-payload.md` — briefing de engenharia reversa + design system.

---

## Estado em 2026-10-24 (11:50, America/Fortaleza)

| Item | Valor |
|---|---|
| Branch | `main` |
| HEAD | `9e19170` — "prompts: referência visual é só o site HTML da Comercial (fora Mais B); pasta agora commitada no repo" (23/10/2026 20:17 -03) |
| Remoto | `origin` = github.com/victorwilliames/loja-comercial-do-norte (**privado**) |
| Sincronização | ✅ clone completo, working tree limpo, nada sobrescrito (a pasta estava vazia) |
| Permissões | ✅ admin/maintain/push/pull/triage — `push --dry-run` e `fetch` OK |
| CI | ❌ desligado (`ci.yml` removido no commit `ecd0c39`) |
| Testes | ⚠️ 86 arquivos de spec; **não executados** nesta máquina (ver pendências) |
| Fase do projeto | Fase 1 = **catálogo + cotação**, lançamento 31/10/2026. Sem checkout, sem pagamento, sem ERP nesta etapa. |
| Próximo passo recomendado | Etapa 0 do `PROMPT-FASE1-SEM-API.md` **depois** de destravar ambiente/seed/CI (P0 em `PROXIMOS-PASSOS-E-INTERRUPTOS.md`) |

---

## Regras que valem para qualquer agente

1. **Nunca apague código** — desligue com feature flag (treinamentos, checkout, pagamento).
2. **Backup antes de mexer**: branch `backup/base-original` + tag `v0-base-jonas-elivaldo`; trabalhe em `feat/comercial-norte-fase1`.
3. **Um commit por etapa**, mensagem em português, suíte rodada ao fim de cada etapa que toque API/banco.
4. **Não invente** marca, depoimento, preço ou dado de cliente — placeholders marcados como exemplo.
5. **Não reintroduza** linguagem de compra na fase 1: é sempre "Adicionar à Cotação" / "Enviar Cotação".
6. A memória é viva: ao concluir algo, atualize `changelog.md` e mova o item em `PROXIMOS-PASSOS-E-INTERRUPTOS.md`.
