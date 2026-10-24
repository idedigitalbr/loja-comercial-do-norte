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
    "Agente executando",
    "Agentes que participaram",
    "Sub-issues progress",
  ],
  Kanban: [
    "Title",
    "Tipo",
    "Prioridade",
    "Assignees",
    "Agente executando",
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
// ProjectV2ViewConfigurationInput rejects visible fields on ROADMAP_LAYOUT; only persist its filter here.
const roadmap = project.views.nodes.find((v) => v.name === "Roadmap");
const roadmapFilter = "";
if (roadmap.filter !== roadmapFilter)
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
    { input: { viewId: roadmap.id, filter: roadmapFilter } },
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
        "The Roadmap filter is empty so Sprints, Etapas and tasks remain visible. Start/Target field selectors, scale, grouping and sort are not exposed by the public ProjectV2View API and require UI confirmation.",
    },
    null,
    2,
  ),
);
