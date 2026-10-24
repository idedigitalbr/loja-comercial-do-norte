#!/usr/bin/env node
/** Repair display names in the canonical SINGLE_SELECT without changing option identities. */
import { readFileSync } from "node:fs";
import { graphql, projectContext, projectItems } from "./github.mjs";

const apply = process.argv.includes("--apply");
const executors = JSON.parse(readFileSync(new URL("./executors.json", import.meta.url), "utf8"));
const project = await projectContext();
const field = project.fields.nodes.find((candidate) => candidate.name === "Agente executando");
if (!field || field.dataType !== "SINGLE_SELECT")
  throw new Error("Execute a migração estrutural de campos antes de migrar executores.");
const items = await projectItems(project);
const aliases = new Map(executors.flatMap((executor) => (executor.aliases ?? []).map((alias) => [alias, executor.nomeExibido])));
const usedSentinels = items.filter((item) => ["Humano", "Não atribuído"].includes(item.fieldValues.nodes.find((value) => value.field?.name === field.name)?.name));
if (usedSentinels.length)
  throw new Error(`Opção sentinela ainda atribuída em: ${usedSentinels.map((item) => `#${item.content?.number}`).join(", ")}; preserve a reserva antes de removê-la.`);
const names = new Set(executors.map((executor) => executor.nomeExibido));
const options = field.options.map((option) => ({
  ...option,
  name: aliases.get(option.name) ?? option.name,
})).filter((option) => names.has(option.name));
for (const executor of executors)
  if (!options.some((option) => option.name === executor.nomeExibido))
    options.push({ name: executor.nomeExibido, color: "GRAY", description: executor.executorId });
const changes = options.filter((option, index) => option.name !== field.options[index]?.name || !field.options[index]);
if (apply && changes.length)
  await graphql(`
    mutation ($input: UpdateProjectV2FieldInput!) {
      updateProjectV2Field(input: $input) {
        projectV2Field { ... on ProjectV2SingleSelectField { id name options { id name } } }
      }
    }
  `, { input: { fieldId: field.id, singleSelectOptions: options } });
if (apply) {
  const saved = (await projectContext()).fields.nodes.find((candidate) => candidate.name === field.name);
  const expected = executors.map((executor) => executor.nomeExibido);
  if (JSON.stringify(saved.options.map((option) => option.name)) !== JSON.stringify(expected))
    throw new Error("Leitura de confirmação divergente para o catálogo de executores.");
}
console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", changes: changes.length, options: options.map((option) => option.name), assignmentsPreserved: items.length }, null, 2));
