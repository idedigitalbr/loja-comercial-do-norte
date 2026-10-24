#!/usr/bin/env node
/** Read-only audit. Never count attempted writes as persisted relationships. */
import { validateDependencies, completeGraph } from "./coordination.mjs";
import {
  manifest,
  projectContext,
  projectItems,
  request,
  repoPath,
  dependencyNode,
} from "./github.mjs";
validateDependencies(manifest.tasks);
const project = await projectContext();
const items = await projectItems(project);
const byNumber = new Map(
  items.filter((i) => i.content).map((i) => [i.content.number, i]),
);
const errors = [];
let confirmed = 0;
const tasks = new Map();
for (const t of manifest.tasks) {
  const title = `[${t.etapa.replace("Etapa ", "ETAPA ")}] [${t.tipo}] ${t.titulo}`;
  const matches = items.filter((i) => i.content?.title === title);
  if (matches.length !== 1) errors.push(`${t.id}: ${matches.length} Issues`);
  else tasks.set(t.id, matches[0]);
}
for (const t of manifest.tasks) {
  const item = tasks.get(t.id);
  if (!item) continue;
  for (const dep of t.deps) {
    const blocker = tasks.get(dep);
    if (
      blocker &&
      item.content.blockedBy.nodes.some((d) => d.id === blocker.content.id)
    )
      confirmed++;
    else errors.push(`Dependência ausente ${t.id} <- ${dep}`);
  }
  const etapa = items.find(
    (i) =>
      i.content?.title.startsWith(
        `[${t.etapa.replace("Etapa ", "ETAPA ")}] `,
      ) && !/^\[ETAPA \d+\] \[/.test(i.content.title),
  );
  if (!etapa || item.content.parent?.number !== etapa.content.number)
    errors.push(`Pai incorreto ${t.id}`);
}
for (const e of manifest.etapas) {
  const item = items.find(
    (i) =>
      i.content?.title === `[${e.id.replace("Etapa ", "ETAPA ")}] ${e.titulo}`,
  );
  const sprint = items.find((i) =>
    i.content?.title.startsWith(`[${e.sprint.replace("Sprint ", "SPRINT ")}]`),
  );
  if (!item || item.content.parent?.number !== sprint?.content.number)
    errors.push(`Pai incorreto ${e.id}`);
}
for (const item of items) {
  const i = item.content;
  if (!i) continue;
  if (!i.assignees.nodes.length) errors.push(`#${i.number} sem responsável`);
  const status = item.fieldValues.nodes.find(
    (v) => v.field?.name === "Status",
  )?.name;
  if (i.state === "CLOSED" && status !== "Concluído")
    errors.push(`#${i.number} fechada com ${status}`);
  if (i.state === "OPEN" && status === "Concluído")
    errors.push(`#${i.number} aberta com Concluído`);
  if (
    i.state === "CLOSED" &&
    i.subIssuesSummary.total > i.subIssuesSummary.completed
  )
    errors.push(`#${i.number} fechada com filhos abertos`);
}
const table = project.views.nodes.find((v) => v.name === "Tabela");
const columns =
  table?.configuration.visibleFields.nodes.map((f) => f.name) ?? [];
const desired = [
  "Title",
  "Status",
  "Sprint",
  "Etapa",
  "Tipo",
  "Prioridade",
  "Assignees",
  "Agente executor",
  "Agentes participantes",
  "Trilha",
  "Sub-issues progress",
];
if (JSON.stringify(columns) !== JSON.stringify(desired))
  errors.push("Colunas da Tabela divergentes");
if (
  JSON.stringify(project.views.nodes.map((v) => v.name).sort()) !==
  JSON.stringify(["Kanban", "Roadmap", "Tabela"])
)
  errors.push("Views divergentes");
const agents = project.fields.nodes
  .find((f) => f.name === "Agente executor")
  .options.map((o) => o.name);
if (agents.some((n) => ["Humano", "Não atribuído"].includes(n)))
  errors.push("Opções sentinela ainda presentes");
const priorities = project.fields.nodes
  .find((f) => f.name === "Prioridade")
  .options.map((o) => o.name);
if (JSON.stringify(priorities) !== JSON.stringify(manifest.prioridadeOptions))
  errors.push("Prioridades divergentes");
const refs = await request(`${repoPath}/git/matching-refs/heads/claims/`);
const graph = items
  .filter((i) => i.content?.id)
  .map((i) => ({
    id: i.content.id,
    deps: i.content.blockedBy.nodes.map((d) => d.id),
  }));
validateDependencies(await completeGraph(graph, dependencyNode));
console.log(
  JSON.stringify(
    {
      project: project.title,
      originalTasks: tasks.size,
      items: byNumber.size,
      expectedDependencies: manifest.tasks.reduce(
        (n, t) => n + t.deps.length,
        0,
      ),
      confirmedDependencies: confirmed,
      groups: items
        .filter((i) => i.content?.subIssuesSummary.total)
        .map((i) => ({
          issue: i.content.number,
          progress: i.content.subIssuesSummary,
        })),
      views: project.views.nodes.map((v) => ({
        name: v.name,
        filter: v.filter,
        columns: v.configuration.visibleFields.nodes.map((f) => f.name),
      })),
      reservationRefs: refs.map((r) => r.ref),
      errors,
    },
    null,
    2,
  ),
);
if (errors.length) process.exitCode = 1;
