#!/usr/bin/env node
/** Migrate legacy display values without inventing historical operators or sessions. */
import { readFileSync } from "node:fs";
import {
  request,
  graphql,
  repoPath,
  projectContext,
  projectItems,
  setField,
  pages,
} from "./github.mjs";
const dry = process.argv.includes("--dry-run");
const project = await projectContext();
const items = await projectItems(project);
const executors = JSON.parse(
  readFileSync(new URL("./executors.json", import.meta.url), "utf8"),
);
const field = project.fields.nodes.find((f) => f.name === "Agente executor");
const changes = [];
for (const item of items) {
  const value = item.fieldValues.nodes.find(
    (v) => v.field?.name === field.name,
  )?.name;
  if (!value || executors.some((e) => e.nomeExibido === value)) continue;
  const n = item.content?.number;
  if (!n) throw new Error("Item sem Issue com executor legado.");
  const refs = await request(
    `${repoPath}/git/matching-refs/heads/claims/issue-${n}`,
  );
  if (
    refs.some(
      (r) =>
        r.ref === `refs/heads/claims/issue-${n}` ||
        r.ref.startsWith(`refs/heads/claims/issue-${n}--`),
    )
  )
    throw new Error(
      `#${n} possui reserva: execute repair antes de migrar opções.`,
    );
  const summary =
    item.fieldValues.nodes.find(
      (v) => v.field?.name === "Agentes participantes",
    )?.text ?? "";
  const legacy = `${value} (legado; operador não confirmado)`;
  changes.push({ issue: n, from: value, to: legacy, current: null });
  if (dry) continue;
  await setField(
    project,
    item.id,
    "Agentes participantes",
    [...new Set([...summary.split(", ").filter(Boolean), legacy])].join(", "),
  );
  const marker = "<!-- agent-executor-legacy-migration:v1 -->";
  const comments = await pages(`${repoPath}/issues/${n}/comments`);
  if (!comments.some((c) => c.body.includes(marker)))
    await request(`${repoPath}/issues/${n}/comments`, "POST", {
      body: `${marker}\nAuditoria preservou o valor antigo de Agente executor: **${value}**. Não há reserva Git ativa. O valor foi transferido para Agentes participantes; executor atual ficou vazio. Operador, modelo, início, fim, duração, tokens e custo históricos: **Não disponível**. Esta observação não cria uma sessão retroativa.`,
    });
  await setField(project, item.id, "Agente executor", null);
}
const refreshed = dry ? items : await projectItems(project);
const used = new Set(
  refreshed.flatMap((i) =>
    i.fieldValues.nodes
      .filter((v) => v.field?.name === field.name)
      .map((v) => v.name),
  ),
);
const options = field.options.filter(
  (o) => used.has(o.name) || executors.some((e) => e.nomeExibido === o.name),
);
if (!dry && options.length !== field.options.length)
  await graphql(
    `
      mutation ($input: UpdateProjectV2FieldInput!) {
        updateProjectV2Field(input: $input) {
          projectV2Field {
            ... on ProjectV2FieldCommon {
              id
            }
          }
        }
      }
    `,
    {
      input: {
        fieldId: field.id,
        singleSelectOptions: options.map((o) => ({
          id: o.id,
          name: o.name,
          color: o.color ?? "GRAY",
          description: o.description ?? "",
        })),
      },
    },
  );
console.log(
  JSON.stringify(
    { dry, changes, options: options.map((o) => o.name) },
    null,
    2,
  ),
);
