#!/usr/bin/env node
/**
 * Sincroniza o GitHub Project da Comercial do Norte com scripts/agents/tasks.json.
 *
 * O que faz (idempotente):
 *  1. cria/atualiza os campos do Project (Agente executor, Sprint, Etapa, Tipo, Trilha, Prioridade)
 *     e reescreve as opções do campo Status;
 *  2. cria as labels usadas no quadro;
 *  3. cria as Issues do roadmap no padrão "[ETAPA N] [TIPO] Descrição" (não duplica as existentes);
 *  4. adiciona cada Issue ao Project e preenche os campos;
 *  5. registra as dependências reais com `addBlockedBy` (Blocked by / Blocking nativos).
 *
 * Uso: GITHUB_TOKEN=<token com escopo project+repo> node scripts/agents/project-sync.mjs [--dry-run]
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(here, 'tasks.json'), 'utf8'));
const dryRun = process.argv.includes('--dry-run');
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
if (!token) throw new Error('Defina GITHUB_TOKEN (escopos: project, repo).');

const [owner, repo] = manifest.repository.split('/');
const projectNumber = manifest.projectNumber;
const api = 'https://api.github.com';

const headers = {
  authorization: `Bearer ${token}`,
  accept: 'application/vnd.github+json',
  'x-github-api-version': '2022-11-28',
  'content-type': 'application/json',
  'user-agent': 'comercial-do-norte-project-sync',
};

async function rest(path, init = {}) {
  const response = await fetch(`${api}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`REST ${init.method ?? 'GET'} ${path} -> ${response.status}: ${text.slice(0, 300)}`);
  return body;
}

async function graphql(query, variables = {}) {
  const response = await fetch(`${api}/graphql`, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(`GraphQL: ${payload.errors.map((error) => error.message).join(' | ')}`);
  return payload.data;
}

const colorFor = (index) => ['BLUE', 'GRAY', 'GREEN', 'ORANGE', 'PINK', 'PURPLE', 'RED', 'YELLOW'][index % 8];

// ---------------------------------------------------------------- project ----

async function loadProject() {
  const data = await graphql(
    `query($login:String!,$number:Int!){organization(login:$login){projectV2(number:$number){id title fields(first:60){nodes{
       __typename ... on ProjectV2FieldCommon{id name}
       ... on ProjectV2SingleSelectField{options{id name}}
     }}}}}`,
    { login: manifest.projectOwner, number: projectNumber },
  );
  const project = data.organization?.projectV2;
  if (!project) throw new Error('Projeto não encontrado ou sem permissão de leitura.');
  return project;
}

async function ensureField(project, name, options) {
  const existing = project.fields.nodes.find((field) => field.name === name);
  if (!existing) {
    if (dryRun) return null;
    const data = await graphql(
      `mutation($input:CreateProjectV2FieldInput!){createProjectV2Field(input:$input){projectV2Field{... on ProjectV2SingleSelectField{id name options{id name}}}}}`,
      {
        input: {
          projectId: project.id,
          dataType: 'SINGLE_SELECT',
          name,
          singleSelectOptions: options.map((label, index) => ({ name: label, color: colorFor(index), description: '' })),
        },
      },
    );
    const created = data.createProjectV2Field.projectV2Field;
    project.fields.nodes.push({ ...created, __typename: 'ProjectV2SingleSelectField' });
    return created;
  }
  const missing = options.filter((label) => !existing.options?.some((option) => option.name === label));
  if (!missing.length) return existing;
  if (dryRun) return existing;
  const merged = [
    ...(existing.options ?? []).map((option) => ({ id: option.id, name: option.name, color: 'GRAY', description: '' })),
    ...missing.map((label, index) => ({ name: label, color: colorFor(index + 2), description: '' })),
  ];
  const data = await graphql(
    `mutation($input:UpdateProjectV2FieldInput!){updateProjectV2Field(input:$input){projectV2Field{... on ProjectV2SingleSelectField{id name options{id name}}}}}`,
    { input: { fieldId: existing.id, singleSelectOptions: merged } },
  );
  const updated = data.updateProjectV2Field.projectV2Field;
  Object.assign(existing, updated);
  return updated;
}

async function ensureStatus(project) {
  const status = project.fields.nodes.find((field) => field.name === 'Status');
  const desired = manifest.statusOptions;
  const current = status.options ?? [];
  const missing = desired.filter((label) => !current.some((option) => option.name === label));
  if (!missing.length) return status;
  if (dryRun) return status;
  // Reaproveita as opções padrão (Todo/In Progress/Done) renomeando-as para as primeiras da lista.
  const reused = current.slice(0, desired.length).map((option, index) => ({
    id: option.id,
    name: desired[index],
    color: colorFor(index),
    description: '',
  }));
  const extra = desired.slice(reused.length).map((label, index) => ({ name: label, color: colorFor(index + 4), description: '' }));
  const data = await graphql(
    `mutation($input:UpdateProjectV2FieldInput!){updateProjectV2Field(input:$input){projectV2Field{... on ProjectV2SingleSelectField{id name options{id name}}}}}`,
    { input: { fieldId: status.id, singleSelectOptions: [...reused, ...extra] } },
  );
  Object.assign(status, data.updateProjectV2Field.projectV2Field);
  return status;
}

// ----------------------------------------------------------------- labels ----

async function ensureLabel(name, color, description) {
  if (dryRun) return;
  const response = await fetch(`${api}/repos/${owner}/${repo}/labels`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, color, description }),
  });
  if (response.status === 422) return; // já existe
  if (!response.ok) throw new Error(`label ${name}: ${response.status} ${(await response.text()).slice(0, 200)}`);
}

// ----------------------------------------------------------------- issues ----

const reservationBlock = (task) => `<!-- agent-reservation
tarefa: ${task.id}
agente: Não atribuído
sessao: -
branch: -
reservadoEm: -
atualizadoEm: -
estado: livre
-->`;

const issueBody = (task) => `## Contexto
Tarefa \`${task.id}\` do roadmap (\`${task.etapa}\`) — ver [docs/roadmap.md](../../blob/main/docs/roadmap.md).

## Evidência atual
${task.evidencia ? task.evidencia : '— (sem evidência registrada ainda)'}

## Protocolo do agente
1. Ler \`docs/memory-ai.md\` e \`docs/roadmap.md\`.
2. Conferir dependências (Blocked by) e a reserva desta Issue antes de editar código.
3. Assumir a tarefa pelo workflow **Assumir tarefa** (Actions → \`agent-claim\`) — proteção atômica por \`concurrency\`.
4. Trabalhar em branch própria \`feat/${task.id.toLowerCase()}-<slug>\` (ou \`fix/\`).
5. Comentar progresso nesta Issue com commits, PRs, testes e bloqueios.
6. Liberar a reserva ao encerrar a sessão.

${reservationBlock(task)}`;

async function listIssues() {
  const issues = [];
  for (let page = 1; page <= 10; page += 1) {
    const batch = await rest(`/repos/${owner}/${repo}/issues?state=all&per_page=100&page=${page}`);
    issues.push(...batch.filter((issue) => !issue.pull_request));
    if (batch.length < 100) break;
  }
  return issues;
}

async function ensureIssue(task, existing) {
  const title = `[${task.etapa.replace('Etapa ', 'ETAPA ')}] [${task.tipo}] ${task.titulo}`;
  const labels = [`tipo:${task.tipo.toLowerCase()}`, `etapa:${task.etapa.replace('Etapa ', '')}`, `prioridade:${task.prioridade.toLowerCase()}`];
  if (existing) return { issue: existing, title, created: false };
  if (dryRun) return { issue: { number: 0, node_id: '', title }, title, created: false };
  const issue = await rest(`/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    body: JSON.stringify({ title, body: issueBody(task), labels }),
  });
  return { issue, title, created: true };
}

async function ensureProjectItem(project, issue) {
  if (dryRun) return null;
  const data = await graphql(
    `mutation($projectId:ID!,$contentId:ID!){addProjectV2ItemById(input:{projectId:$projectId,contentId:$contentId}){item{id}}}`,
    { projectId: project.id, contentId: issue.node_id },
  );
  return data.addProjectV2ItemById.item.id;
}

async function setField(project, itemId, field, value) {
  if (dryRun || !itemId) return;
  const option = field.options?.find((candidate) => candidate.name === value);
  if (!option) throw new Error(`Opção "${value}" não existe no campo ${field.name}`);
  await graphql(
    `mutation($input:UpdateProjectV2ItemFieldValueInput!){updateProjectV2ItemFieldValue(input:$input){projectV2Item{id}}}`,
    { input: { projectId: project.id, itemId, fieldId: field.id, value: { singleSelectOptionId: option.id } } },
  );
}

async function linkDependency(taskId, blockingTaskId, issuesByTitle, taskById) {
  const blocked = issuesByTitle.get(taskById.get(taskId).title);
  const blocking = issuesByTitle.get(taskById.get(blockingTaskId).title);
  if (!blocked || !blocking || dryRun) return;
  const data = await graphql(
    `query($id:ID!){node(id:$id){... on Issue{blockedBy(first:50){nodes{id}}}}}`,
    { id: blocked.node_id },
  );
  const already = data.node.blockedBy.nodes.some((node) => node.id === blocking.node_id);
  if (already) return;
  await graphql(
    `mutation($issueId:ID!,$blockingIssueId:ID!){addBlockedBy(input:{issueId:$issueId,blockingIssueId:$blockingIssueId}){issue{id}}}`,
    { issueId: blocked.node_id, blockingIssueId: blocking.node_id },
  );
}

// ------------------------------------------------------------------- main ----

const project = await loadProject();
console.log(`Projeto: ${project.title} (${project.id})`);

await ensureStatus(project);
const fields = {
  agente: await ensureField(project, 'Agente executor', manifest.agentOptions),
  sprint: await ensureField(project, 'Sprint', manifest.sprintOptions),
  etapa: await ensureField(project, 'Etapa', manifest.etapaOptions),
  tipo: await ensureField(project, 'Tipo', manifest.tipoOptions),
  trilha: await ensureField(project, 'Trilha', manifest.trilhaOptions),
  prioridade: await ensureField(project, 'Prioridade', manifest.prioridadeOptions),
};
const statusField = project.fields.nodes.find((field) => field.name === 'Status');

for (const tipo of manifest.tipoOptions) await ensureLabel(`tipo:${tipo.toLowerCase()}`, '0e8a16', 'Classificação [TIPO]');
for (const etapa of manifest.etapaOptions) await ensureLabel(`etapa:${etapa.replace('Etapa ', '')}`, '1d76db', 'Etapa do roadmap');
for (const prioridade of manifest.prioridadeOptions) await ensureLabel(`prioridade:${prioridade.toLowerCase()}`, 'fbca04', 'Prioridade');
await ensureLabel('agent-claim', '5319e7', 'Reserva/exclusividade de execução por agente');
await ensureLabel('needs-review', 'd93f0b', 'Aguardando revisão humana');

const issues = await listIssues();
const byTitle = new Map(issues.map((issue) => [issue.title, issue]));
const taskById = new Map();
const summary = { created: 0, existing: 0, linked: 0, tasks: [] };

for (const task of manifest.tasks) {
  const { issue, title, created } = await ensureIssue(task, byTitle.get(`[${task.etapa.replace('Etapa ', 'ETAPA ')}] [${task.tipo}] ${task.titulo}`));
  taskById.set(task.id, { ...task, title, issue });
  if (created) summary.created += 1; else summary.existing += 1;
}

for (const task of manifest.tasks) {
  const record = taskById.get(task.id);
  const itemId = await ensureProjectItem(project, record.issue);
  await setField(project, itemId, statusField, task.status);
  await setField(project, itemId, fields.agente, 'Não atribuído');
  await setField(project, itemId, fields.sprint, task.sprint);
  await setField(project, itemId, fields.etapa, task.etapa);
  await setField(project, itemId, fields.tipo, task.tipo);
  await setField(project, itemId, fields.trilha, task.trilha);
  await setField(project, itemId, fields.prioridade, task.prioridade);
  summary.tasks.push({ id: task.id, title: record.title, status: task.status, deps: task.deps.length });
}

for (const task of manifest.tasks) {
  for (const dep of task.deps) {
    await linkDependency(task.id, dep, byTitle, taskById);
    summary.linked += 1;
  }
}

console.log(JSON.stringify({
  modo: dryRun ? 'dry-run' : 'aplicado',
  criadas: summary.created,
  jaExistiam: summary.existing,
  dependenciasVerificadas: summary.linked,
  totalTarefas: manifest.tasks.length,
}, null, 2));
