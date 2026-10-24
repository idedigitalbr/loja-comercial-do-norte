#!/usr/bin/env node
import { projectContext, graphql } from "./github.mjs";
const project = await projectContext();
const desired = {
  Tabela: [
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
  ],
  Kanban: [
    "Title",
    "Tipo",
    "Prioridade",
    "Assignees",
    "Agente executor",
    "Sub-issues progress",
  ],
};
const names = project.views.nodes.map((v) => v.name).sort();
if (JSON.stringify(names) !== JSON.stringify(["Kanban", "Roadmap", "Tabela"]))
  throw new Error(
    "Esperadas somente Tabela, Kanban e Roadmap; nenhuma view será criada ou excluída automaticamente.",
  );
for (const [name, fields] of Object.entries(desired)) {
  const missing = fields.filter(
    (name) => !project.fields.nodes.some((f) => f.name === name),
  );
  if (missing.length) throw new Error(`Campos ausentes: ${missing.join(", ")}`);
  const view = project.views.nodes.find((v) => v.name === name);
  const ids = fields.map(
    (name) => project.fields.nodes.find((f) => f.name === name).id,
  );
  if (
    JSON.stringify(
      view.configuration.visibleFields.nodes.map((f) => f.name),
    ) !== JSON.stringify(fields)
  )
    await graphql(
      `
        mutation ($input: UpdateProjectV2ViewInput!) {
          updateProjectV2View(input: $input) {
            projectV2View {
              id
            }
          }
        }
      `,
      { input: { viewId: view.id, configuration: { visibleFieldIds: ids } } },
    );
}
// Roadmap is macro only; do not infer dates for individual Sprints from a global deadline.
const roadmap = project.views.nodes.find((v) => v.name === "Roadmap");
const macroFilter = '-has:"Tipo"';
if (roadmap.filter !== macroFilter)
  await graphql(
    `
      mutation ($input: UpdateProjectV2ViewInput!) {
        updateProjectV2View(input: $input) {
          projectV2View {
            id
          }
        }
      }
    `,
    { input: { viewId: roadmap.id, filter: macroFilter } },
  );
const saved = await projectContext();
for (const [name, fields] of Object.entries(desired)) {
  const actual = saved.views.nodes
    .find((v) => v.name === name)
    .configuration.visibleFields.nodes.map((f) => f.name);
  if (JSON.stringify(actual) !== JSON.stringify(fields))
    throw new Error(`Configuração não persistida: ${name}`);
}
console.log(
  JSON.stringify(
    {
      views: saved.views.nodes,
      dates:
        "Nenhuma data criada/alterada. Agrupamento e propriedades de timeline exigem UI; a API expõe apenas visibleFieldIds.",
    },
    null,
    2,
  ),
);
