#!/usr/bin/env node
/** Bootstrap creates missing objects; reconciliation repairs structure only.
 * Never replay manifest execution state over existing items or close Issues.
 */
import { readFileSync } from "node:fs";
import { validateDependencies, completeGraph } from "./coordination.mjs";
import {
  manifest,
  request,
  graphql,
  pages,
  repoPath,
  projectContext,
  projectItems,
  itemFor,
  setField,
  dependencyNode,
} from "./github.mjs";
const dry = process.argv.includes("--dry-run");
const reconcile = process.argv.includes("--reconcile");
validateDependencies(manifest.tasks);
const project = await projectContext();
let items = await projectItems(project);
const executors = JSON.parse(
  readFileSync(new URL("./executors.json", import.meta.url), "utf8"),
);
const changes = [];
async function change(description, fn) {
  changes.push(description);
  if (!dry) return fn();
}
async function field(name, names, type = "SINGLE_SELECT") {
  let current = project.fields.nodes.find((f) => f.name === name);
  if (!current) {
    const result = await change(`Criar campo ${name}`, () =>
      graphql(
        `
          mutation ($input: CreateProjectV2FieldInput!) {
            createProjectV2Field(input: $input) {
              projectV2Field {
                ... on ProjectV2FieldCommon {
                  id
                  name
                }
                ... on ProjectV2SingleSelectField {
                  options {
                    id
                    name
                  }
                }
              }
            }
          }
        `,
        {
          input: {
            projectId: project.id,
            name,
            dataType: type,
            ...(names
              ? {
                  singleSelectOptions: names.map((name) => ({
                    name,
                    color: "GRAY",
                    description: "",
                  })),
                }
              : {}),
          },
        },
      ),
    );
    if (result) {
      current = result.createProjectV2Field.projectV2Field;
      project.fields.nodes.push(current);
    }
    return current;
  }
  if (!names) return current;
  let options = current.options.map((o) => ({ ...o }));
  if (name === "Prioridade")
    options = options.map((o) => ({
      ...o,
      name:
        names.find((n) => n.startsWith(o.name.split(" ")[0] + " ")) ?? o.name,
    }));
  // Preserve existing assignments by option ID; clear removed sentinel values first.
  if (name === "Agente executor") {
    for (const item of items) {
      const value = item.fieldValues.nodes.find((v) => v.field?.name === name);
      if (["Humano", "Não atribuído"].includes(value?.name))
        await change(`Limpar sentinela #${item.content?.number}`, () =>
          setField(project, item.id, name, null),
        );
    }
    options = options.filter(
      (o) => !["Humano", "Não atribuído"].includes(o.name),
    );
  }
  for (const value of names)
    if (!options.some((o) => o.name === value))
      options.push({ name: value, color: "GRAY", description: "" });
  if (
    JSON.stringify(options.map((o) => [o.id, o.name])) !==
    JSON.stringify(current.options.map((o) => [o.id, o.name]))
  ) {
    const result = await change(`Ajustar opções ${name}`, () =>
      graphql(
        `
          mutation ($input: UpdateProjectV2FieldInput!) {
            updateProjectV2Field(input: $input) {
              projectV2Field {
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  options {
                    id
                    name
                    color
                    description
                  }
                }
              }
            }
          }
        `,
        {
          input: {
            fieldId: current.id,
            singleSelectOptions: options.map((o) => ({
              id: o.id,
              name: o.name,
              color: o.color ?? "GRAY",
              description: o.description ?? "",
            })),
          },
        },
      ),
    );
    if (result)
      Object.assign(current, result.updateProjectV2Field.projectV2Field);
  }
  return current;
}
await field("Status", manifest.statusOptions);
await field("Agentes participantes", null, "TEXT");
await field("Agente executor", manifest.agentOptions);
for (const [name, values] of [
  ["Sprint", manifest.sprintOptions],
  ["Etapa", manifest.etapaOptions],
  ["Tipo", manifest.tipoOptions],
  ["Trilha", manifest.trilhaOptions],
  ["Prioridade", manifest.prioridadeOptions],
])
  await field(name, values);
const issues = (await pages(`${repoPath}/issues?state=all`)).filter(
  (i) => !i.pull_request,
);
const byTitle = new Map(issues.map((i) => [i.title, i]));
await request(`${repoPath}/assignees/victorwilliames`); // default human must be eligible
async function ensure(title, body) {
  const matches = issues.filter((i) => i.title === title);
  if (matches.length > 1) throw new Error(`Issues duplicadas: ${title}`);
  let issue = byTitle.get(title);
  if (!issue) {
    issue = await change(`Criar Issue ${title}`, () =>
      request(`${repoPath}/issues`, "POST", {
        title,
        body,
        assignees: ["victorwilliames"],
      }),
    );
    if (issue) {
      issues.push(issue);
      byTitle.set(title, issue);
    } // refresh map immediately, before linking dependencies
  }
  return issue;
}
const sprintIssues = new Map();
const etapaIssues = new Map();
const taskIssues = new Map();
for (const s of manifest.sprints)
  sprintIssues.set(
    s.id,
    await ensure(
      `[${s.id.replace("Sprint ", "SPRINT ")}] ${s.titulo}`,
      "Agrupador nativo de etapas. Fechamento somente após validação humana.",
    ),
  );
for (const e of manifest.etapas)
  etapaIssues.set(
    e.id,
    await ensure(
      `[${e.id.replace("Etapa ", "ETAPA ")}] ${e.titulo}`,
      "Agrupador nativo de tarefas. Fechamento somente após validação humana.",
    ),
  );
for (const t of manifest.tasks)
  taskIssues.set(
    t.id,
    await ensure(
      `[${t.etapa.replace("Etapa ", "ETAPA ")}] [${t.tipo}] ${t.titulo}`,
      `Tarefa ${t.id}. Evidência histórica: ${t.evidencia || "Não disponível"}. Consultar docs/roadmap.md e AGENTS.md. Sem conclusão automática.`,
    ),
  );
async function structure(issue, values, parent) {
  if (!issue) return;
  let item = items.find((i) => i.content?.number === issue.number);
  if (!item) {
    const id = await change(`Adicionar #${issue.number} ao Project`, () =>
      itemFor(project, issue.node_id),
    );
    if (!id) return;
    item = {
      id,
      content: { number: issue.number, state: issue.state.toUpperCase() },
      fieldValues: { nodes: [] },
    };
    items.push(item);
  }
  const current = (name) =>
    item.fieldValues.nodes.find((v) => v.field?.name === name);
  if (!issue.assignees?.length)
    await change(`Responsável humano #${issue.number}`, () =>
      request(`${repoPath}/issues/${issue.number}/assignees`, "POST", {
        assignees: ["victorwilliames"],
      }),
    );
  for (const [name, value] of Object.entries(values)) {
    if (!current(name)?.name && value)
      await change(`Preencher ${name} #${issue.number}`, () =>
        setField(project, item.id, name, value),
      );
    else if (
      reconcile &&
      ["Sprint", "Etapa", "Tipo", "Trilha"].includes(name) &&
      current(name)?.name !== value
    )
      await change(`Estrutura ${name} #${issue.number}`, () =>
        setField(project, item.id, name, value),
      );
  }
  if (parent) {
    const relation = item.content?.id
      ? { node: item.content }
      : await graphql(
          `
            query ($id: ID!) {
              node(id: $id) {
                ... on Issue {
                  parent {
                    number
                  }
                }
              }
            }
          `,
          { id: issue.node_id },
        );
    if (relation.node.parent && relation.node.parent.number !== parent.number)
      throw new Error(
        `Pai divergente #${issue.number}; não reparentear automaticamente.`,
      );
    if (!relation.node.parent)
      await change(`Sub-issue #${issue.number} -> #${parent.number}`, () =>
        graphql(
          `
            mutation ($input: AddSubIssueInput!) {
              addSubIssue(input: $input) {
                issue {
                  id
                }
              }
            }
          `,
          { input: { issueId: parent.node_id, subIssueId: issue.node_id } },
        ),
      );
  }
  if (
    reconcile &&
    issue.state === "closed" &&
    current("Status")?.name !== "Concluído"
  ) {
    const evidence = manifest.tasks.find(
      (t) => taskIssues.get(t.id)?.number === issue.number,
    )?.evidencia;
    if (evidence || item.content.subIssuesSummary?.percentCompleted === 100)
      await change(`Status fechado coerente #${issue.number}`, () =>
        setField(project, item.id, "Status", "Concluído"),
      );
  }
}
for (const s of manifest.sprints)
  await structure(sprintIssues.get(s.id), {
    Sprint: s.id,
    Status: "Backlog",
    Trilha: "Compartilhado",
  });
for (const e of manifest.etapas)
  await structure(
    etapaIssues.get(e.id),
    {
      Sprint: e.sprint,
      Etapa: e.id,
      Status: "Backlog",
      Trilha: "Compartilhado",
    },
    sprintIssues.get(e.sprint),
  );
for (const t of manifest.tasks) {
  const e = manifest.etapas.find((e) => e.id === t.etapa);
  await structure(
    taskIssues.get(t.id),
    {
      Sprint: e.sprint,
      Etapa: e.id,
      Tipo: t.tipo,
      Trilha: t.trilha,
      Prioridade: manifest.prioridadeOptions.find((p) =>
        p.startsWith(t.prioridade + " "),
      ),
      Status: t.status === "Concluído" ? "Em Revisão" : t.status,
    },
    etapaIssues.get(t.etapa),
  );
}
for (const t of manifest.operationalTasks ?? []) {
  const e = manifest.etapas.find((e) => e.id === t.etapa);
  const issue = issues.find((i) => i.number === t.issue);
  await structure(
    issue,
    {
      Sprint: e.sprint,
      Etapa: e.id,
      Tipo: t.tipo,
      Trilha: t.trilha,
      Prioridade: manifest.prioridadeOptions.find((p) =>
        p.startsWith(t.prioridade + " "),
      ),
    },
    etapaIssues.get(t.etapa),
  );
}
// Native dependencies: check complete live graph (including relations outside manifest) before mutation.
const graph = new Map(
  items
    .filter((i) => i.content?.id)
    .map((i) => [
      i.content.id,
      {
        id: i.content.id,
        deps: i.content.blockedBy?.nodes.map((d) => d.id) ?? [],
      },
    ]),
);
for (const t of manifest.tasks) {
  const issue = taskIssues.get(t.id);
  if (!issue) continue;
  graph.set(
    issue.node_id,
    graph.get(issue.node_id) ?? { id: issue.node_id, deps: [] },
  );
  for (const dep of t.deps) {
    const blocker = taskIssues.get(dep);
    if (blocker && !graph.get(issue.node_id).deps.includes(blocker.node_id))
      graph.get(issue.node_id).deps.push(blocker.node_id);
  }
}
validateDependencies(await completeGraph([...graph.values()], dependencyNode));
for (const t of manifest.tasks) {
  const issue = taskIssues.get(t.id);
  if (!issue) continue;
  const initial = items.find((i) => i.content?.id === issue.node_id)?.content;
  const live = initial
    ? { node: initial }
    : await graphql(
        `
          query ($id: ID!) {
            node(id: $id) {
              ... on Issue {
                blockedBy(first: 100) {
                  nodes {
                    id
                  }
                }
              }
            }
          }
        `,
        { id: issue.node_id },
      );
  for (const dep of t.deps) {
    const blocker = taskIssues.get(dep);
    if (
      blocker &&
      !live.node.blockedBy.nodes.some((d) => d.id === blocker.node_id)
    )
      await change(`Dependência ${t.id} <- ${dep}`, () =>
        graphql(
          `
            mutation ($input: AddBlockedByInput!) {
              addBlockedBy(input: $input) {
                issue {
                  id
                }
              }
            }
          `,
          {
            input: { issueId: issue.node_id, blockingIssueId: blocker.node_id },
          },
        ),
      );
  }
}
// Link only the existing official repository and project.
const repository = await request(repoPath);
const linked = await graphql(
  `
    query ($id: ID!) {
      node(id: $id) {
        ... on ProjectV2 {
          repositories(first: 50) {
            nodes {
              id
            }
          }
        }
      }
    }
  `,
  { id: project.id },
);
if (!linked.node.repositories.nodes.some((r) => r.id === repository.node_id))
  await change("Vincular repositório oficial", () =>
    graphql(
      `
        mutation ($input: LinkProjectV2ToRepositoryInput!) {
          linkProjectV2ToRepository(input: $input) {
            repository {
              id
            }
          }
        }
      `,
      { input: { projectId: project.id, repositoryId: repository.node_id } },
    ),
  );
if (reconcile) {
  const fresh = await projectItems(project);
  for (const item of fresh.filter((i) => i.content?.subIssuesSummary.total)) {
    const issue = item.content;
    const progress = issue.subIssuesSummary;
    const status = item.fieldValues.nodes.find(
      (v) => v.field?.name === "Status",
    )?.name;
    if (issue.state === "CLOSED" && progress.completed < progress.total)
      await change(
        `Reabrir agrupador #${issue.number} com filhos pendentes`,
        () =>
          request(`${repoPath}/issues/${issue.number}`, "PATCH", {
            state: "open",
          }),
      );
    // Progress is a separate native field, never a reason to overwrite operational state.
    if (status === "Concluído" && progress.completed < progress.total)
      await change(`Corrigir conclusão incompatível #${issue.number}`, () =>
        setField(project, item.id, "Status", "Em Revisão"),
      );
  }
}
console.log(
  JSON.stringify(
    {
      mode: dry ? "dry-run" : reconcile ? "reconcile" : "bootstrap",
      changes: changes.length,
      actions: changes,
    },
    null,
    2,
  ),
);
