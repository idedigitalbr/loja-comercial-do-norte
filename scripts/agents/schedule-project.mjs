#!/usr/bin/env node
/** Fill only missing Project dates; preserve every existing interval and human milestone. */
import { manifest, projectContext, projectItems, readLedger, setField, pages, request, repoPath } from "./github.mjs";
import { addCalendarDays, aggregateSchedule, estimatedDays, isValidDate, shiftCalendarDays, validateSchedule } from "./project-fields.mjs";

const apply = process.argv.includes("--apply");
const project = await projectContext();
const items = await projectItems(project);
const byNumber = new Map(items.filter((item) => item.content?.number).map((item) => [item.content.number, item]));
const startField = manifest.dateFields.start;
const targetField = manifest.dateFields.target;
const plans = [];
const updated = [];
const unresolved = [];
const today = (() => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: manifest.dateFields.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  return `${parts.find((part) => part.type === "year").value}-${parts.find((part) => part.type === "month").value}-${parts.find((part) => part.type === "day").value}`;
})();
const localDate = (instant) => {
  if (!instant) return null;
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: manifest.dateFields.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(instant));
  return `${parts.find((part) => part.type === "year").value}-${parts.find((part) => part.type === "month").value}-${parts.find((part) => part.type === "day").value}`;
};
const raw = (item, name) => {
  const value = item.fieldValues.nodes.find((entry) => entry.field?.name === name);
  return value?.date ?? value?.name ?? value?.text ?? value?.options?.map((option) => option.name) ?? null;
};
const typeCode = (item) => item.content.title.match(/^\[ETAPA \d+\] \[([A-Z]+)\]/)?.[1]
  ?? manifest.operationalTasks?.find((task) => task.issue === item.content.number)?.tipo;
const priorityRank = (item) => ({ P0: 0, P1: 1, P2: 2, P3: 3 }[String(raw(item, "Prioridade") ?? "").slice(0, 2)] ?? 4);
const sprintRank = (item) => Number(String(raw(item, "Sprint") ?? "").match(/\d+/)?.[0] ?? 9);
const isTask = (item) => /^\[ETAPA \d+\] \[[A-Z]+\]/.test(item.content.title);
const isEtapa = (item) => /^\[ETAPA \d+\] /.test(item.content.title) && !isTask(item);
const isSprint = (item) => /^\[SPRINT \d+\] /.test(item.content.title);
const isGroup = (item) => isEtapa(item) || isSprint(item);
const plannedTarget = new Map();
const priorityOffset = [0, 2, 5, 10, 14];
const notes = new Map();
const ledgerByIssue = new Map();

const taskItems = items.filter((item) => item.content?.number && isTask(item));
taskItems.sort((left, right) => priorityRank(left) - priorityRank(right) || sprintRank(left) - sprintRank(right) || left.content.number - right.content.number);
const activeResourceEnd = new Map();
const unresolvedItems = new Set(taskItems);
while (unresolvedItems.size) {
  let progressed = false;
  for (const item of [...unresolvedItems]) {
    const status = raw(item, "Status") ?? "Backlog";
    if (status === "Backlog") {
      const existing = raw(item, targetField);
      if (existing) plannedTarget.set(item.content.number, existing);
      unresolvedItems.delete(item);
      progressed = true;
      continue;
    }
    const missingDates = !raw(item, startField) || !raw(item, targetField);
    if (!missingDates) {
      validateSchedule(status, raw(item, startField), raw(item, targetField));
      plannedTarget.set(item.content.number, raw(item, targetField));
      const executor = raw(item, "Agente executando");
      if (executor) activeResourceEnd.set(executor, raw(item, targetField));
      unresolvedItems.delete(item);
      progressed = true;
      continue;
    }
    if (item.content.state === "CLOSED" || status === "Concluído") {
      const ledger = ledgerByIssue.get(item.content.number);
      const actualStart = ledger?.sessions?.flatMap((session) => session.events ?? []).find((event) => event.action === "start")?.at;
      const start = raw(item, startField) ?? localDate(actualStart) ?? localDate(item.content.createdAt);
      const target = raw(item, targetField) ?? localDate(item.content.closedAt);
      if (!start || !target) {
        unresolved.push({ issue: item.content.number, reason: "sem createdAt/closedAt suficiente para reconstrução histórica" });
        unresolvedItems.delete(item);
        progressed = true;
        continue;
      }
      validateSchedule(status, start, target);
      plans.push({ item, start, target, kind: raw(item, startField) ? "fechamento real" : actualStart ? "início real do ledger" : "início aproximado em createdAt; entrega em closedAt", estimated: false });
      plannedTarget.set(item.content.number, target);
      unresolvedItems.delete(item);
      progressed = true;
      continue;
    }
    const code = typeCode(item);
    if (!code) {
      unresolved.push({ issue: item.content.number, reason: "tipo principal ausente; estimativa não fundamentada" });
      unresolvedItems.delete(item);
      progressed = true;
      continue;
    }
    const duration = estimatedDays(code, item.content.title);
    const dependencyTargets = [];
    let dependenciesReady = true;
    for (const dependency of item.content.blockedBy?.nodes ?? []) {
      const dependencyItem = byNumber.get(dependency.number);
      const dependencyTarget = plannedTarget.get(dependency.number)
        ?? raw(dependencyItem ?? { fieldValues: { nodes: [] } }, targetField)
        ?? (dependency.state === "CLOSED" ? localDate(dependencyItem?.content?.closedAt) : null);
      if (!dependencyTarget) { dependenciesReady = false; break; }
      dependencyTargets.push(dependencyTarget);
    }
    if (!dependenciesReady) continue;
    const realStart = ledgerByIssue.get(item.content.number)?.sessions?.flatMap((session) => session.events ?? []).find((event) => event.action === "start")?.at;
    const executor = raw(item, "Agente executando");
    const resourceStart = executor && activeResourceEnd.get(executor)
      ? addCalendarDays(activeResourceEnd.get(executor), 1)
      : today;
    const scheduledBase = addCalendarDays(resourceStart, priorityOffset[priorityRank(item)] + Math.max(0, sprintRank(item) - 1));
    let start = raw(item, startField) ?? localDate(realStart) ?? dependencyTargets.reduce((latest, date) => date > latest ? date : latest, scheduledBase);
    let target = raw(item, targetField) ?? addCalendarDays(start, duration);
    if (!raw(item, startField) && raw(item, targetField)) start = shiftCalendarDays(target, -duration);
    if (executor && activeResourceEnd.has(executor) && start <= activeResourceEnd.get(executor)) {
      if (raw(item, startField)) {
        unresolved.push({ issue: item.content.number, reason: `datas existentes conflitam com outra reserva ativa de ${executor}` });
        unresolvedItems.delete(item);
        progressed = true;
        continue;
      }
      start = addCalendarDays(activeResourceEnd.get(executor), 1);
      target = raw(item, targetField) ?? addCalendarDays(start, duration);
    }
    validateSchedule(status, start, target);
    const startSource = raw(item, startField) ? "Início preexistente preservado" : realStart ? "data real do ledger" : status === "Em Andamento" || status === "Reservado" || status === "Em Revisão" ? "planejamento a partir de hoje; início real indisponível" : "planejamento estimado por prioridade, Sprint e dependências";
    plans.push({ item, start, target, kind: startSource, estimated: !raw(item, targetField) || (!raw(item, startField) && !realStart) });
    plannedTarget.set(item.content.number, target);
    if (executor) activeResourceEnd.set(executor, target);
    unresolvedItems.delete(item);
    progressed = true;
  }
  if (!progressed) {
    for (const item of unresolvedItems)
      unresolved.push({ issue: item.content.number, reason: "dependência sem data planejada" });
    break;
  }
}

// Group periods roll up bottom-up. Existing endpoints are treated as approved milestones and preserved.
const groups = items.filter((item) => item.content?.number && isGroup(item)).sort((a, b) => Number(isSprint(a)) - Number(isSprint(b)) || a.content.number - b.content.number);
for (const group of groups) {
  const children = items.filter((item) => item.content?.parent?.number === group.content.number);
  const scheduledChildren = children.map((child) => ({
    status: raw(child, "Status") ?? "Backlog",
    start: plans.find((plan) => plan.item.id === child.id)?.start ?? raw(child, startField),
    target: plans.find((plan) => plan.item.id === child.id)?.target ?? raw(child, targetField),
  }));
  const aggregate = aggregateSchedule(scheduledChildren);
  const descendantUnplanned = children.reduce((total, child) =>
    total + (plans.find((plan) => plan.item.id === child.id)?.unplanned ?? 0), 0);
  const totalUnplanned = aggregate.unplanned + descendantUnplanned;
  const start = raw(group, startField) ?? aggregate.start;
  const target = raw(group, targetField) ?? aggregate.target;
  const status = raw(group, "Status") ?? "Backlog";
  if (start || target) validateSchedule(status, start, target);
  if (start && target && (!raw(group, startField) || !raw(group, targetField))) {
    plans.push({ item: group, start, target, kind: `agregado das tarefas/etapas filhas; ${totalUnplanned} sem planejamento`, estimated: false, unplanned: totalUnplanned });
    plannedTarget.set(group.content.number, target);
  }
}

if (unresolved.length)
  throw new Error(`Planejamento interrompido sem gravar datas: ${JSON.stringify(unresolved)}`);
const toWrite = plans.filter((plan) => !raw(plan.item, startField) || !raw(plan.item, targetField));
if (apply) {
  for (const plan of toWrite) {
    if (!raw(plan.item, startField)) await setField(project, plan.item.id, startField, plan.start);
    if (!raw(plan.item, targetField)) await setField(project, plan.item.id, targetField, plan.target);
  }
  const refreshed = await projectItems(await projectContext());
  const refreshedByNumber = new Map(refreshed.filter((item) => item.content?.number).map((item) => [item.content.number, item]));
  for (const item of refreshed) {
    if (!item.content) continue;
    const status = raw(item, "Status") ?? "Backlog";
    if (status !== "Backlog") validateSchedule(status, raw(item, startField), raw(item, targetField));
  }
  for (const plan of toWrite) {
    const saved = refreshedByNumber.get(plan.item.content.number);
    const savedStart = raw(saved, startField);
    const savedTarget = raw(saved, targetField);
    if (savedStart !== plan.start || savedTarget !== plan.target)
      throw new Error(`Leitura de confirmação divergente para #${plan.item.content.number}.`);
    const marker = `<!-- roadmap-schedule:${plan.item.content.number} -->`;
    const comments = await pages(`${repoPath}/issues/${plan.item.content.number}/comments`);
    if (!comments.some((comment) => comment.body.includes(marker))) {
      const text = plan.unplanned
        ? ` Existem ${plan.unplanned} subitens ainda sem planejamento; o período agregado não está fechado.`
        : "";
      await request(`${repoPath}/issues/${plan.item.content.number}/comments`, "POST", {
        body: `${marker}\nRoadmap: início ${savedStart}; entrega ${savedTarget}. Origem: ${plan.kind}.${plan.estimated ? " Planejamento estimado, não é promessa do responsável." : " Datas históricas ou agregadas; não representam prazo originalmente prometido."}${text} Fuso do calendário: America/Belem.`,
      });
    }
    updated.push(plan.item.content.number);
  }
}
const finalItems = apply ? await projectItems(await projectContext()) : items;
const counts = { outsideBacklog: 0, outsideBacklogWithDates: 0, backlogWithoutDates: 0 };
for (const item of finalItems) {
  if (!item.content) continue;
  const status = raw(item, "Status") ?? "Backlog";
  if (status === "Backlog") {
    if (!raw(item, startField) && !raw(item, targetField)) counts.backlogWithoutDates++;
  } else {
    counts.outsideBacklog++;
    if (isValidDate(raw(item, startField)) && isValidDate(raw(item, targetField))) counts.outsideBacklogWithDates++;
  }
}
console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", today, counts, planned: plans.map(({ item, start, target, kind, estimated, unplanned }) => ({ issue: item.content.number, status: raw(item, "Status") ?? "Backlog", start, target, kind, estimated, unplanned: unplanned ?? 0 })), updated, unresolved }, null, 2));
