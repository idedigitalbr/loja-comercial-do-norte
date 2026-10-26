# AGENTS.md — operação dos agentes

Fonte de decisões: [docs/memory-ai.md](docs/memory-ai.md). Estado macro e evidências: [docs/roadmap.md](docs/roadmap.md). Leia ambos antes de editar; confirme alvo, branch, `git status` e instruções locais. Referência visual: `site-comercial-do-norte-html-referencia/`.

## Limites do projeto

- Next.js + NestJS + PostgreSQL + Prisma; Tailwind/shadcn/ui, Lucide, Turborepo/pnpm e Zod. A branch oficial e padrão de desenvolvimento é a `main`. Admin continua React/Vite. Não replicar o estado antigo como arquitetura final.
- Fase 1: catálogo + cotação, sem cobrança/frete de venda; CTAs “Adicionar à Cotação” e “Enviar Cotação”. Não instalar Medusa, Payload ou TanStack Start, nem criar outro backend.
- Regras comerciais e persistência apenas no NestJS. Preservar módulos legados por feature flags. Nunca inventar conteúdo de cliente, preços ou depoimentos.
- Não commitar segredos. Não criar memória paralela, backups Markdown ou arquivos `*-old.md`. Memória é atualizada nos dois documentos canônicos.

## Política permanente de desenvolvimento (Consolidação na `main`)

Revogada expressamente pelo responsável a burocracia de branches permanentes, dezenas de PRs e refs de reserva `claims/issue-*`.

1. **Branch oficial e exclusiva:** `main`. O estado normal do repositório é apenas `main`.
2. **Desenvolvimento direto:** Codex, Antigravity e outros agentes autorizados trabalham diretamente na `main`. Commits pequenos, descritivos, frequentes e push normal sem force.
3. **Sem branches por padrão:** Não abrir branches para cada issue e não abrir Pull Request por padrão.
4. **Sem branches de reserva:** Fica extinta a criação de branches `claims/issue-*`. O acompanhamento operacional ocorre via GitHub Issues, GitHub Project 3, comentários rastreáveis nas issues e commits na `main`.
5. **Sem worktrees desnecessários:** Não espalhar worktrees no disco nem manter cópias paralelas da mesma implementação.
6. **Exceções técnicas:** Branches temporárias só são permitidas para experimentos arriscados isolados e devem ser integradas na `main` ou descartadas assim que concluídas.
7. **Validação contínua:** Mudanças devem ser validadas localmente com typecheck, lint, testes e build antes de push para preservar a estabilidade da `main` e do CI.

## Protocolo de acompanhamento e Project 3

Quadro único: [Project 3](https://github.com/orgs/idedigitalbr/projects/3), repo `idedigitalbr/loja-comercial-do-norte`. Somente **Tabela, Kanban e Roadmap**; hierarquia nativa **Sprint → Etapa → Tarefa**. Títulos `[ETAPA N] [TIPO] Descrição`. `Tipo` é multisseleção.

1. Consulte a Issue e dependências Blocked by no GitHub Issues / Project 3 antes de iniciar.
2. Identifique ferramenta/operador/modelo confirmado em `scripts/agents/executors.json`. Use `executorId`, não nome genérico.
3. O progresso e encerramento de tarefas são registrados diretamente na Issue correspondente através de comentários estruturados e na atualização de status no Project 3.
4. Não altere infraestrutura, não execute migrations destrutivas (`migrate reset`) e nunca execute restaurações no banco Neon de produção sem autorização explícita.
5. Ao concluir uma entrega: registre commits na `main`, testes executados e status final na Issue, mantendo o histórico limpo e auditável no GitHub.
