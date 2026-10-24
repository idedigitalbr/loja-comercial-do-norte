#!/usr/bin/env node
/**
 * Atualiza a Issue do quadro quando um PR é aberto/sincronizado/fechado.
 *
 * Regras:
 * - descobre a tarefa pelo nome da branch (`feat/e5-...` -> `E5`) usando scripts/agents/tasks.json;
 * - comenta na Issue com o link do PR e o estado real;
 * - move o Status para "Em Revisão" quando o PR abre;
 * - NUNCA marca como "Concluído": isso exige validação humana explícita.
 *
 * Env: GITHUB_TOKEN, PR_NUMBER, PR_ACTION, PR_URL, PR_HEAD_REF, PR_MERGED, PR_TITLE.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const { tasks } = JSON.parse(readFileSync(join(here, 'tasks.json'), 'utf8'));
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('Defina GITHUB_TOKEN.');

const OWNER = 'idedigitalbr';
const REPO = 'loja-comercial-do-norte';
const PROJECT_NUMBER = 3;
const headers = {
  authorization: `Bearer ${token}`,
  accept: 'application/vnd.github+json',
  'x-github-api-version': '2022-11-28',
  'content-type': 'application/json',
  'user-agent': 'comercial-do-norte-pr-sync',
};
const api = 'https://api.github.com';

async function rest(path, init = {}) {
  const response = await fetch(`${api}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  const text = await response.text();
  return { ok: response.ok, status: response.status, body: text ? JSON.parse(text) : null };
}

async function graphql(query, variables = {}) {
  const response = await fetch(`${api}/graphql`, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors.map((error) => error.message).join(' | '));
  return payload.data;
}

const headRef = process.env.PR_HEAD_REF ?? '';
const code = (headRef.match(/^(?:feat|fix|chore|docs|refactor)\/([a-f][0-9])-/i)?.[1] ?? '').toUpperCase();
if (!code) {
  console.log(JSON.stringify({ resultado: 'ignorado', motivo: 'branch fora do padrão <tipo>/<codigo>-<slug>', headRef }));
  process.exit(0);
}
const task = tasks.find((candidate) => candidate.id === code);
if (!task) {
  console.log(JSON.stringify({ resultado: 'ignorado', motivo: `código ${code} não existe em tasks.json` }));
  process.exit(0);
}

const title = `[${task.etapa.replace('Etapa ', 'ETAPA ')}] [${task.tipo}] ${task.titulo}`;
const search = await rest(`/search/issues?q=${encodeURIComponent(`repo:${OWNER}/${REPO} in:title "${title}" type:issue`)}`);
const issue = search.body?.items?.[0];
if (!issue) {
  console.log(JSON.stringify({ resultado: 'ignorado', motivo: `Issue não encontrada para ${code}` }));
  process.exit(0);
}

const action = process.env.PR_ACTION ?? 'synchronize';
const merged = process.env.PR_MERGED === 'true';
const prUrl = process.env.PR_URL ?? '';
const prNumber = process.env.PR_NUMBER ?? '';

const status = action === 'closed' ? (merged ? 'Em Revisão' : 'Em Andamento') : 'Em Revisão';
const message = {
  opened: `**PR aberto** para revisão: ${prUrl}`,
  synchronize: `**PR atualizado**: ${prUrl}`,
  reopened: `**PR reaberto**: ${prUrl}`,
  closed: merged
    ? `**PR #${prNumber} mesclado** (${prUrl}). Aguardando **validação humana** antes de concluir a tarefa — o CI verde não conclui automaticamente.`
    : `**PR #${prNumber} fechado sem merge** (${prUrl}). A tarefa volta para andamento.`,
}[action] ?? `**PR atualizado**: ${prUrl}`;

const project = await graphql(
  `query($login:String!,$number:Int!){organization(login:$login){projectV2(number:$number){id fields(first:60){nodes{... on ProjectV2FieldCommon{id name} ... on ProjectV2SingleSelectField{id name options{id name}}}}}}}`,
  { login: OWNER, number: PROJECT_NUMBER },
);
const projectV2 = project.organization.projectV2;
const statusField = projectV2.fields.nodes.find((node) => node.name === 'Status');
const option = statusField.options.find((candidate) => candidate.name === status);

const item = await graphql(
  `mutation($projectId:ID!,$contentId:ID!){addProjectV2ItemById(input:{projectId:$projectId,contentId:$contentId}){item{id}}}`,
  { projectId: projectV2.id, contentId: issue.node_id },
);
await graphql(
  `mutation($input:UpdateProjectV2ItemFieldValueInput!){updateProjectV2ItemFieldValue(input:$input){projectV2Item{id}}}`,
  { input: { projectId: projectV2.id, itemId: item.addProjectV2ItemById.item.id, fieldId: statusField.id, value: { singleSelectOptionId: option.id } } },
);
await rest(`/repos/${OWNER}/${REPO}/issues/${issue.number}/comments`, { method: 'POST', body: JSON.stringify({ body: message }) });
if (action === 'closed' && merged) {
  await rest(`/repos/${OWNER}/${REPO}/issues/${issue.number}/labels`, { method: 'POST', body: JSON.stringify({ labels: ['needs-review'] }) });
}

console.log(JSON.stringify({ resultado: 'atualizado', tarefa: code, issue: issue.number, status, acao: action }, null, 2));
