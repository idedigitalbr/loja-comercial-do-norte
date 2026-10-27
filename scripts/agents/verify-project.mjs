#!/usr/bin/env node
/** Read-only audit. Never count attempted writes as persisted relationships. */
import { activityStatus, validateDependencies, completeGraph } from "./coordination.mjs";
import { validateSchedule, aggregateSchedule } from "./project-fields.mjs";
import { readFileSync } from "node:fs";
import {
  manifest,
  projectContext,
  projectItems,
  request,
  repoPath,
  dependencyNode,
  readLedger,
} from "./github.mjs";
const executors = JSON.parse(readFileSync(new URL("./executors.json", import.meta.url), "utf8"));
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
  const actualTypes =
    item.fieldValues.nodes.find((v) => v.field?.name === "Tipo")?.options?.map((option) => option.name) ?? [];
  const expectedTypes = [...new Set(t.tipos ?? [t.tipo])].map(
    (code) => manifest.tipoOptions.find((option) => option.id === code)?.name,
  );
  if (expectedTypes.some((name) => !actualTypes.includes(name)))
    errors.push(`Tipo ausente ${t.id}: ${expectedTypes.filter((name) => !actualTypes.includes(name)).join(", ")}`);
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
  "Agente executando",
  "Agentes que participaram",
  "Sub-issues progress",
];
if (JSON.stringify(columns) !== JSON.stringify(desired))
  errors.push("Colunas da Tabela divergentes");
if (
  JSON.stringify(project.views.nodes.map((v) => v.name).sort()) !==
  JSON.stringify(["Kanban", "Roadmap", "Tabela"])
)
  errors.push("Views divergentes");
const viewColumns = {
  Kanban: ["Title", "Tipo", "Prioridade", "Assignees", "Agente executando", "Sub-issues progress"],
};
for (const [name, expected] of Object.entries(viewColumns)) {
  const actual = project.views.nodes.find((view) => view.name === name)?.configuration.visibleFields.nodes.map((field) => field.name) ?? [];
  if (JSON.stringify(actual) !== JSON.stringify(expected)) errors.push(`Colunas da view ${name} divergentes`);
}
const field = (name) => project.fields.nodes.find((f) => f.name === name);
const agents = field("Agente executando")?.options.map((o) => o.name) ?? [];
if (agents.some((n) => ["Humano", "Não atribuído"].includes(n)))
  errors.push("Opções sentinela ainda presentes");
if (field("Agente executando")?.dataType !== "SINGLE_SELECT")
  errors.push("Agente executando deve ser SINGLE_SELECT");
if (field("Agentes que participaram")?.dataType !== "MULTI_SELECT")
  errors.push("Agentes que participaram deve ser MULTI_SELECT");
if (field("Tipo")?.dataType !== "MULTI_SELECT")
  errors.push("Tipo deve ser MULTI_SELECT");
if (field("Trilha")) errors.push("Campo Trilha ainda existe");
for (const dateName of [manifest.dateFields.start, manifest.dateFields.target])
  if (field(dateName)?.dataType !== "DATE") errors.push(`${dateName} deve ser DATE`);
if (project.fields.nodes.some((f) => ["Agentes participantes", "Tipo (legado)", "Agentes que participaram (legado)"].includes(f.name)))
  errors.push("Campos legados não foram removidos após a migração");
const typeOptions = field("Tipo")?.options.map((o) => o.name) ?? [];
if (JSON.stringify(typeOptions) !== JSON.stringify(manifest.tipoOptions.map((option) => option.name)))
  errors.push("Opções de Tipo divergentes");
const agentOptions = field("Agentes que participaram")?.options.map((o) => o.name) ?? [];
if (JSON.stringify(agentOptions) !== JSON.stringify(agents))
  errors.push("Catálogo de agentes divergente entre os dois campos");
const priorities = project.fields.nodes
  .find((f) => f.name === "Prioridade")
  .options.map((o) => o.name);
if (JSON.stringify(priorities) !== JSON.stringify(manifest.prioridadeOptions))
  errors.push("Prioridades divergentes");
let nonBacklog = 0;
let nonBacklogScheduled = 0;
let backlogWithoutDates = 0;
for (const item of items) {
  if (!item.content) continue;
  const value = (name) => {
    const entry = item.fieldValues.nodes.find((candidate) => candidate.field?.name === name);
    return entry?.date ?? entry?.name ?? entry?.options?.map((option) => option.name) ?? null;
  };
  const status = value("Status") ?? "Backlog";
  const start = value(manifest.dateFields.start);
  const target = value(manifest.dateFields.target);
  if (status !== "Backlog") {
    nonBacklog++;
    try {
      validateSchedule(status, start, target);
      nonBacklogScheduled++;
    } catch (error) {
      errors.push(`#${item.content.number}: ${error.message}`);
    }
  } else if (!start && !target) backlogWithoutDates++;
  const types = value("Tipo");
  if (/^\[ETAPA \d+\] \[/.test(item.content.title) && (!types || !types.length))
    errors.push(`#${item.content.number} sem tipo MULTI_SELECT`);
}
const groupItems = items
  .filter((item) => item.content?.subIssuesSummary?.total > 0)
  .sort((left, right) => Number(/^\[SPRINT/.test(left.content.title)) - Number(/^\[SPRINT/.test(right.content.title)));
const groupScheduleByIssue = new Map();
for (const group of groupItems) {
  const children = items.filter((item) => item.content?.parent?.number === group.content.number);
  const value = (item, name) => item.fieldValues.nodes.find((entry) => entry.field?.name === name)?.date ?? null;
  const aggregate = aggregateSchedule(children.map((item) => ({
    status: item.fieldValues.nodes.find((entry) => entry.field?.name === "Status")?.name ?? "Backlog",
    start: value(item, manifest.dateFields.start),
    target: value(item, manifest.dateFields.target),
  })));
  const descendantUnplanned = children.reduce((total, child) => total + (groupScheduleByIssue.get(child.content.number)?.unplannedChildren ?? 0), 0);
  groupScheduleByIssue.set(group.content.number, {
    issue: group.content.number,
    title: group.content.title,
    start: value(group, manifest.dateFields.start),
    target: value(group, manifest.dateFields.target),
    aggregatedStart: aggregate.start,
    aggregatedTarget: aggregate.target,
    unplannedChildren: aggregate.unplanned + descendantUnplanned,
  });
}
const groupPeriods = [...groupScheduleByIssue.values()];
const activeReservations = [];
for (const item of items) {
  const issueNumber = item.content?.number;
  if (!issueNumber) continue;
  const actual = item.fieldValues.nodes.find((value) => value.field?.name === "Agente executando")?.name ?? null;
  if (actual) {
    const valid = executors.some((executor) => executor.nomeExibido === actual || executor.aliases?.includes(actual));
    if (!valid) {
      errors.push(`#${issueNumber}: Agente executando '${actual}' não cadastrado em executors.json`);
    } else {
      activeReservations.push({ issue: issueNumber, executor: actual });
    }
  }
}
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
      reservationRefs: [],
      activeReservations,
      errors,
      schedule: { nonBacklog, nonBacklogScheduled, backlogWithoutDates },
      groupPeriods,
      roadmapTimelineSelectors: "Não expostos por ProjectV2View GraphQL; requerem confirmação na UI autenticada.",
    },
    null,
    2,
  ),
);
if (errors.length) process.exitCode = 1;
