const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(value) {
  if (typeof value !== "string" || !isoDate.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function serializeFieldValue(field, value) {
  if (field.dataType === "MULTI_SELECT") {
    if (!Array.isArray(value)) throw new Error("MULTI_SELECT exige uma lista de opções.");
    const ids = [];
    for (const name of value) {
      const option = field.options?.find((candidate) => candidate.name === name);
      if (!option) throw new Error(`Opção desconhecida em MULTI_SELECT: ${name}`);
      if (!ids.includes(option.id)) ids.push(option.id);
    }
    return { multiSelectOptionIds: ids };
  }
  if (field.dataType === "SINGLE_SELECT") {
    const option = field.options?.find((candidate) => candidate.name === value);
    if (!option) throw new Error(`Opção desconhecida em SINGLE_SELECT: ${value}`);
    return { singleSelectOptionId: option.id };
  }
  if (field.dataType === "DATE") {
    if (!isValidDate(value)) throw new Error(`Data ISO inválida: ${value}`);
    return { date: value };
  }
  if (field.dataType === "TEXT" && typeof value === "string")
    return { text: value };
  throw new Error(`Tipo de campo não suportado: ${field.dataType}`);
}

export function validateSchedule(status, start, target) {
  if (status === "Backlog") {
    if (Boolean(start) !== Boolean(target))
      throw new Error("Início e Entrega devem ser preenchidos juntos.");
    if (start && (!isValidDate(start) || !isValidDate(target)))
      throw new Error("Início e Entrega devem ser datas ISO válidas.");
  } else {
    if (!start || !target)
      throw new Error(`Início e Entrega são obrigatórias para ${status}.`);
    if (!isValidDate(start) || !isValidDate(target))
      throw new Error("Início e Entrega devem ser datas ISO válidas.");
  }
  if (start && target && start > target)
    throw new Error("Início não pode ser posterior à Entrega.");
  return true;
}

export function aggregateSchedule(children) {
  const planned = children.filter((child) => child.start && child.target);
  return {
    start: planned.map((child) => child.start).sort()[0] ?? null,
    target: planned.map((child) => child.target).sort().at(-1) ?? null,
    unplanned: children.filter((child) => !child.start || !child.target).length,
  };
}

export function addCalendarDays(isoDateValue, days) {
  if (!isValidDate(isoDateValue) || !Number.isInteger(days) || days < 0)
    throw new Error("Data inicial ou duração inválida.");
  const date = new Date(`${isoDateValue}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function shiftCalendarDays(isoDateValue, days) {
  if (!isValidDate(isoDateValue) || !Number.isInteger(days))
    throw new Error("Data inicial ou deslocamento inválido.");
  const date = new Date(`${isoDateValue}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function estimatedDays(type, title = "") {
  const duration = {
    UX: 2,
    UI: 3,
    FRONT: 4,
    BACK: 4,
    BUG: 2,
    INFRA: 3,
    DB: 3,
    SEC: 3,
    QA: 2,
    SEO: 2,
    DOCS: 2,
    CONTENT: 3,
    ERP: 5,
  }[type];
  if (!duration) throw new Error(`Tipo sem estimativa: ${type}`);
  const complex = /completo|integração|integracao|migra|importa|concorrência|concorrencia|homologa|recovery/i.test(title);
  return duration + Number(complex);
}

export function proposeSchedule({ today, type, title, dependencyTargets = [] }) {
  if (!isValidDate(today)) throw new Error("Hoje deve ser uma data ISO válida.");
  const start = dependencyTargets.reduce(
    (latest, target) => (target > latest ? target : latest),
    today,
  );
  return { start, target: addCalendarDays(start, estimatedDays(type, title)) };
}
