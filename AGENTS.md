# AGENTS.md — operação dos agentes

Fonte de decisões: [docs/memory-ai.md](docs/memory-ai.md). Estado macro e evidências: [docs/roadmap.md](docs/roadmap.md). Leia ambos antes de editar; confirme alvo, branch, `git status` e instruções locais. Referência visual: `site-comercial-do-norte-html-referencia/`.

## Limites do projeto

- Next.js + NestJS + PostgreSQL + Prisma; Tailwind/shadcn/ui, Lucide, Turborepo/pnpm e Zod. A branch de desenvolvimento já tem Next/PostgreSQL; admin continua React/Vite. Não replicar o estado antigo da main como arquitetura final.
- Fase 1: catálogo + cotação, sem cobrança/frete de venda; CTAs “Adicionar à Cotação” e “Enviar Cotação”. Não instalar Medusa, Payload ou TanStack Start, nem criar outro backend.
- Regras comerciais e persistência apenas no NestJS. Preservar módulos legados por feature flags. Nunca inventar conteúdo de cliente, preços ou depoimentos.
- Não commitar segredos. Não criar memória paralela, backups Markdown ou arquivos `*-old.md`. Memória é atualizada nos dois documentos canônicos.

## Protocolo obrigatório — Codex, Claude, Harness, Antigravity e outros

Quadro único: [Project 3](https://github.com/orgs/idedigitalbr/projects/3), repo `idedigitalbr/loja-comercial-do-norte`. Somente **Tabela, Kanban e Roadmap**; hierarquia nativa **Sprint → Etapa → Tarefa**. Títulos `[ETAPA N] [TIPO] Descrição`; campos/filtros distinguem Engenharia, Design/Frontend e Compartilhado.

1. Consulte a Issue e dependências Blocked by; não inicie com bloqueador aberto ou outra reserva ativa. Toda Issue, incluindo agrupadores, precisa de Assignee humano; padrão autorizado `victorwilliames`, preservando responsáveis existentes.
2. Identifique ferramenta/operador/modelo confirmado em `scripts/agents/executors.json`. Use `executorId`, não nome genérico. Modelo desconhecido fica nulo. Não atribua a si o modelo de um exemplo.
3. **Antes de editar**, assuma a Issue: `pnpm agents:claim claim --issue N --executor codex-will --branch chore/codigo-descricao`. Guarde a sessão retornada. Reutilize uma branch segura por tarefa; nunca edite diretamente na main nem crie branches para alterações só no Project.
4. Use a mesma sessão em `start`, `renew`, `pause`, `resume`, `block --reason`, `review --pr`, `release --reason`. Acrescente `--commit` e `--tests` como evidência real. Comentários aceitam `/claim --executor ...` e demais comandos operacionais; conclusão somente pelo dispatch com aprovação humana explícita ou CLI autorizada com `--human-approved`.
5. Reserve arquivos/frentes sem sobreposição; mudança estrutural exige testes, rollback e atualização do roadmap. Não altere infraestrutura, execute migrations ou faça deploy sem pedido correspondente.
6. Abra/atualize PR, registre commits e testes na Issue e na sessão; CI não conclui tarefa nem libera a reserva. Não use palavras de fechamento automático de Issue em PR que ainda aguarda aceite.
7. Libere ao encerrar: `pnpm agents:claim release --issue N --executor codex-will --session S --reason "entregue para revisão"`. Participantes e histórico permanecem; revisão/bloqueio não são apagados.
8. Nunca apague `refs/heads/claims/issue-N`: é trava e histórico persistente. Release grava estado livre na ref. Propriedade exige **ator + executorId + sessão**. Refs antigas `issue-N--Agente` bloqueiam migração até auditoria manual.
9. Após falha, consulte `status`. `repair` recompõe o espelho. Se existir `pendingMirror`, confirme que o processo anterior encerrou e use `repair --recover --reason "evidência"` com a mesma sessão. Não recupere trabalho ainda ativo em outra máquina. Outra identidade exige recuperação administrativa humana auditada, sem apagar histórico.
10. Bootstrap `pnpm agents:sync`; reconciliação `pnpm agents:sync --reconcile`; inspeção prévia `--dry-run`. Não reaplicar o manifesto para apagar progresso. Verifique com `pnpm agents:verify` e `pnpm agents:test`.

## Publicação e automações

- Commits pequenos em português, push sem force, PR com escopo isolado. **Sem merge automático na main.** PR #37 usa base `feat/stack-next-postgres`; não apontar novamente à main sem revisar o diff completo.
- Workflows organizacionais exigem `PROJECT_TOKEN` autorizado para Project 3; GITHUB_TOKEN cuida de Git/Issues. Não enviar credencial pessoal local para secrets automaticamente. Scripts privilegiados usam código confiável da branch padrão, nunca cabeça de PR.
- Enquanto a coordenação não estiver integrada na branch padrão e o secret não estiver configurado, automações por comentário/PR não estão homologadas. Operação pela CLI autenticada é verificável; detalhes e limitações no roadmap.
- Ao entregar: arquivos relevantes, validações locais/API/CI distintas, commit/PR, pendências e reserva liberada. Tokens/custo/tempo ativo sem telemetria: **Não disponível**.
