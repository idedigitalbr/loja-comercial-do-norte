#!/usr/bin/env node
/** Explicit, resumable migration. Legacy fields remain until API readback succeeds. */
import { readFileSync } from "node:fs";
import { manifest, projectContext, projectItems, graphql, request, repoPath, setField } from "./github.mjs";

const apply = process.argv.includes("--apply");
const executors = JSON.parse(readFileSync(new URL("./executors.json", import.meta.url), "utf8"));
const legacyNames = {
  type: "Tipo legado single-select",
  participants: "Agentes participantes legado",
  typeTemporary: "Tipo (migração MULTI_SELECT)",
  participantsTemporary: "Agentes que participaram (migração MULTI_SELECT)",
};
const oldExecutorLabels = new Map(executors.flatMap((executor) =>
  (executor.aliases ?? []).map((alias) => [alias, executor.executorId]),
));
let project = await projectContext();
let items = await projectItems(project);
const actions = [];
const action = async (description, operation) => {
  actions.push(description);
  if (apply) return operation();
  return null;
};
const getField = (name) => project.fields.nodes.find((field) => field.name === name);
const getValue = (item, name) => item.fieldValues.nodes.find((value) => value.field?.name === name);
const typeOptions = manifest.tipoOptions.map((option) => ({
  name: option.name,
  color: ({ UX: "BLUE", UI: "PURPLE", FRONT: "GREEN", BACK: "ORANGE", BUG: "RED", INFRA: "GRAY", DB: "YELLOW", SEC: "RED", QA: "BLUE", SEO: "GREEN", DOCS: "GRAY", CONTENT: "PINK", ERP: "ORANGE" })[option.id],
  description: option.id,
}));
const agentOptions = executors.map((executor) => ({
  name: executor.nomeExibido,
  color: "GRAY",
  description: executor.executorId,
}));

async function createMulti(name, options) {
  const current = getField(name);
  if (current) {
    if (current.dataType !== "MULTI_SELECT") throw new Error(`${name} já existe como ${current.dataType}.`);
    return current;
  }
  await action(`Criar campo MULTI_SELECT temporário ${name}`, () => graphql(`
    mutation ($input: CreateProjectV2FieldInput!) {
      createProjectV2Field(input: $input) {
        projectV2Field { ... on ProjectV2MultiSelectField { id name dataType multiSelectOptions { id name } } }
      }
    }
  `, { input: { projectId: project.id, name, dataType: "MULTI_SELECT", multiSelectOptions: options } }));
  if (!apply) return null;
  project = await projectContext();
  return getField(name);
}

async function updateField(field, updates) {
  if (!field || !apply) {
    if (field) actions.push(`Atualizar campo ${field.name}`);
    return;
  }
  await graphql(`
    mutation ($input: UpdateProjectV2FieldInput!) {
      updateProjectV2Field(input: $input) {
        projectV2Field { ... on ProjectV2FieldCommon { id name dataType } }
      }
    }
  `, { input: { fieldId: field.id, ...updates } });
  project = await projectContext();
}

async function rename(field, name) {
  if (!field || field.name === name) return;
  await updateField(field, { name });
}

async function deleteField(field) {
  if (!field) return;
  await action(`Remover campo legado ${field.name} após validação`, () => graphql(`
    mutation ($input: DeleteProjectV2FieldInput!) {
      deleteProjectV2Field(input: $input) { projectV2Field { ... on ProjectV2FieldCommon { id } } }
    }
  `, { input: { fieldId: field.id } }));
}

const currentType = getField("Tipo");
const oldType = currentType?.dataType === "SINGLE_SELECT" ? currentType : getField(legacyNames.type);
const targetTypeName = currentType?.dataType === "MULTI_SELECT" ? "Tipo" : legacyNames.typeTemporary;
const targetType = await createMulti(targetTypeName, typeOptions);
const oldParticipants = getField("Agentes participantes") ?? getField(legacyNames.participants);
const currentParticipants = getField("Agentes que participaram");
const targetParticipantsName = currentParticipants?.dataType === "MULTI_SELECT"
  ? "Agentes que participaram"
  : legacyNames.participantsTemporary;
const targetParticipants = await createMulti(targetParticipantsName, agentOptions);

const typeById = new Map(manifest.tipoOptions.map((option) => [option.id, option.name]));
const typeByName = new Map(manifest.tipoOptions.map((option) => [option.name, option.name]));
const nameByOldExecutor = new Map(executors.map((executor) => [
  [...oldExecutorLabels].find(([, id]) => id === executor.executorId)?.[0] ?? executor.nomeExibido,
  executor.nomeExibido,
]));
const preservedUnknownParticipants = [];

if (oldType && targetType && oldType.id !== targetType.id) {
  for (const item of items) {
    const previous = getValue(item, oldType.name);
    if (!previous?.name) continue;
    const name = typeById.get(previous.name) ?? typeByName.get(previous.name);
    if (!name) throw new Error(`#${item.content?.number}: tipo antigo não reconhecido (${previous.name}); nenhuma remoção executada.`);
    const migrated = getValue(item, targetTypeName)?.options?.map((option) => option.name) ?? [];
    if (!migrated.includes(name))
      await action(`Migrar Tipo #${item.content.number}: ${name}`, () => setField(project, item.id, targetTypeName, [...migrated, name]));
  }
}

if (oldParticipants && targetParticipants && oldParticipants.id !== targetParticipants.id) {
  for (const item of items) {
    const previous = getValue(item, oldParticipants.name)?.text;
    if (!previous) continue;
    const selected = [];
    const unknown = [];
    for (const label of previous.split(/\s*,\s*/).filter(Boolean)) {
      const mapped = nameByOldExecutor.get(label) ?? (executors.some((executor) => executor.nomeExibido === label) ? label : null);
      if (mapped) selected.push(mapped);
      else unknown.push(label);
    }
    const expected = [...new Set(selected)];
    const migrated = getValue(item, targetParticipantsName)?.options?.map((option) => option.name) ?? [];
    const missing = expected.filter((name) => !migrated.includes(name));
    if (missing.length)
      await action(`Migrar participantes #${item.content.number}`, () => setField(project, item.id, targetParticipantsName, [...migrated, ...missing]));
    if (unknown.length) preservedUnknownParticipants.push({ item, values: unknown });
  }
}

if (apply) {
  project = await projectContext();
  items = await projectItems(project);
  const verifiedType = getField(targetTypeName);
  const verifiedParticipants = getField(targetParticipantsName);
  for (const item of items) {
    const oldTypeValue = oldType && getValue(item, oldType.name)?.name;
    const expectedType = typeById.get(oldTypeValue) ?? typeByName.get(oldTypeValue);
    const actualTypes = getValue(item, targetTypeName)?.options?.map((option) => option.name) ?? [];
    if (expectedType && !actualTypes.includes(expectedType))
      throw new Error(`Leitura de confirmação falhou: Tipo da Issue #${item.content.number}.`);
    const oldText = oldParticipants && getValue(item, oldParticipants.name)?.text;
    if (!oldText) continue;
    const expected = oldText.split(/\s*,\s*/).map((label) => nameByOldExecutor.get(label) ?? label).filter((label) => executors.some((executor) => executor.nomeExibido === label));
    const actual = getValue(item, targetParticipantsName)?.options?.map((option) => option.name) ?? [];
    if (expected.some((label) => !actual.includes(label)))
      throw new Error(`Leitura de confirmação falhou: participantes da Issue #${item.content.number}.`);
  }
  for (const { item, values } of preservedUnknownParticipants) {
    const marker = "<!-- participant-migration-unknown-v1 -->";
    const comments = await (await import("./github.mjs")).pages(`${repoPath}/issues/${item.content.number}/comments`);
    if (!comments.some((comment) => comment.body.includes(marker)))
      await request(`${repoPath}/issues/${item.content.number}/comments`, "POST", {
        body: `${marker}\nValor histórico de participante não convertido em identidade porque não há evidência suficiente: ${values.map((value) => `**${value}**`).join(", ")}. O ledger e a auditoria preservam essa observação; nenhum operador ou sessão foi inferido.`,
      });
  }
  for (const item of items) {
    const oldTrail = getValue(item, "Trilha")?.name;
    if (!oldTrail) continue;
    const marker = "<!-- trail-migration-v1 -->";
    const comments = await (await import("./github.mjs")).pages(`${repoPath}/issues/${item.content.number}/comments`);
    if (!comments.some((comment) => comment.body.includes(marker)))
      await request(`${repoPath}/issues/${item.content.number}/comments`, "POST", {
        body: `${marker}\nClassificação anterior arquivada antes da remoção do campo Trilha: **${oldTrail}**. O campo Tipo e seu valor principal foram preservados; Trilha não é mais classificação operacional.`,
      });
  }
  // Re-read after all value copies; only then switch canonical names and remove legacy fields.
  project = await projectContext();
  items = await projectItems(project);
  const originalType = getField("Tipo");
  if (originalType?.dataType === "SINGLE_SELECT") await rename(originalType, legacyNames.type);
  const tempType = getField(legacyNames.typeTemporary);
  if (tempType && tempType.name !== "Tipo") await rename(tempType, "Tipo");
  const originalParticipants = getField("Agentes participantes");
  if (originalParticipants?.dataType === "TEXT") await rename(originalParticipants, legacyNames.participants);
  const tempParticipants = getField(legacyNames.participantsTemporary);
  if (tempParticipants && tempParticipants.name !== "Agentes que participaram") await rename(tempParticipants, "Agentes que participaram");
  const executor = getField("Agente executor") ?? getField("Agente executando");
  if (executor?.name === "Agente executor") await rename(executor, "Agente executando");
  const currentExecutor = getField("Agente executando");
  if (currentExecutor) {
    const options = currentExecutor.options.map((option) => ({
      ...option,
      name: nameByOldExecutor.get(option.name) ?? option.name,
    }));
    if (JSON.stringify(options.map((option) => [option.id, option.name])) !== JSON.stringify(currentExecutor.options.map((option) => [option.id, option.name])))
      await updateField(currentExecutor, { singleSelectOptions: options });
  }
  for (const [oldName, newName] of [["Start date", "Início"], ["Target date", "Entrega"]]) {
    const existing = getField(oldName);
    const final = getField(newName);
    if (existing?.dataType === "DATE" && !final) await rename(existing, newName);
    if (!existing && final?.dataType !== "DATE")
      await action(`Criar campo DATE ${newName}`, () => graphql(`
        mutation ($input: CreateProjectV2FieldInput!) {
          createProjectV2Field(input: $input) { projectV2Field { ... on ProjectV2FieldCommon { id name dataType } } }
        }
      `, { input: { projectId: project.id, name: newName, dataType: "DATE" } }));
  }
  const priority = getField("Prioridade");
  const priorityNames = manifest.prioridadeOptions;
  if (priority) {
    const options = priority.options.map((option) => ({
      ...option,
      name: priorityNames.find((name) => name.startsWith(`${option.name.split(" ")[0]} `)) ?? option.name,
    }));
    if (JSON.stringify(options.map((option) => [option.id, option.name])) !== JSON.stringify(priority.options.map((option) => [option.id, option.name])))
      await updateField(priority, { singleSelectOptions: options });
  }
  project = await projectContext();
  for (const [viewName, fields] of Object.entries({
    Tabela: ["Title", "Status", "Sprint", "Etapa", "Tipo", "Prioridade", "Assignees", "Agente executando", "Agentes que participaram", "Sub-issues progress"],
    Kanban: ["Title", "Tipo", "Prioridade", "Assignees", "Agente executando", "Sub-issues progress"],
  })) {
    const view = project.views.nodes.find((candidate) => candidate.name === viewName);
    if (!view) throw new Error(`View ${viewName} ausente; interrompendo antes de apagar campos.`);
    const ids = fields.map((name) => getField(name)?.id);
    if (ids.some((id) => !id)) throw new Error(`Campo de view ausente (${viewName}); campos legados preservados.`);
    const currentIds = view.configuration.visibleFields.nodes.map((field) => getField(field.name)?.id);
    if (JSON.stringify(currentIds) === JSON.stringify(ids)) continue;
    await action(`Atualizar colunas ${viewName}`, () => graphql(`
      mutation ($input: UpdateProjectV2ViewInput!) {
        updateProjectV2View(input: $input) { projectV2View { id } }
      }
    `, { input: { viewId: view.id, configuration: { visibleFieldIds: ids } } }));
  }
  project = await projectContext();
  const roadmap = project.views.nodes.find((view) => view.name === "Roadmap");
  if (!roadmap) throw new Error("View Roadmap ausente; campos legados preservados.");
  if (roadmap.filter !== "")
    await action("Atualizar filtro da view Roadmap", () => graphql(`
      mutation ($input: UpdateProjectV2ViewInput!) {
        updateProjectV2View(input: $input) { projectV2View { id } }
      }
    `, { input: { viewId: roadmap.id, filter: "" } }));
  items = await projectItems(project);
  for (const fieldName of ["Tipo", "Agentes que participaram", "Agente executando", "Início", "Entrega", "Prioridade"]) {
    if (!getField(fieldName)) throw new Error(`Campo final não confirmado: ${fieldName}`);
  }
  for (const legacyName of [legacyNames.type, legacyNames.participants, "Trilha"]) {
    const legacy = getField(legacyName);
    if (legacy) await deleteField(legacy);
  }
  project = await projectContext();
  items = await projectItems(project);
}

console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  fields: project.fields.nodes.map(({ name, dataType }) => ({ name, dataType })),
  items: items.length,
  preservedUnknownParticipants: preservedUnknownParticipants.map(({ item, values }) => ({ issue: item.content?.number, values })),
  actions,
  note: "Roadmap timeline date selectors and scale are not included in the public ProjectV2View GraphQL schema; verify those in the authenticated Project UI.",
}, null, 2));
