#!/usr/bin/env node
/**
 * Protocolo de reserva de tarefas para execução multiagente.
 *
 * Exclusividade REAL: a trava é um ref Git (`refs/heads/claims/issue-<n>--<agente>`).
 * Criar um ref é atômico no servidor: se já existir, o GitHub responde 422 e a
 * reserva é recusada. Campo de texto/label serve apenas como espelho visual.
 *
 * Comandos:
 *   claim   --issue N --agent <Agente> --branch <branch> [--session S] [--assignee login]
 *   start   --issue N --agent <Agente> [--branch B]
 *   block   --issue N --agent <Agente> --reason "motivo"
 *   review  --issue N --agent <Agente> [--pr URL]
 *   done    --issue N --agent <Agente> [--pr URL]
 *   release --issue N --agent <Agente> [--force] [--reason "..."]
 *   status  --issue N
 *
 * Env: GITHUB_TOKEN (escopos project, repo, issues).
 */
const args = process.argv.slice(2);
const command = args[0];
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
if (!token) throw new Error('Defina GITHUB_TOKEN.');

const OWNER = process.env.PROJECT_OWNER ?? 'idedigitalbr';
const REPO = process.env.PROJECT_REPO ?? 'loja-comercial-do-norte';
const PROJECT_NUMBER = Number(process.env.PROJECT_NUMBER ?? 3);
const AGENTS = ['Claude', 'Codex', 'DeepSeek', 'Antigravity', 'Copilot', 'Humano'];
const STATUS_BY_COMMAND = {
  claim: 'Reservado',
  start: 'Em Andamento',
  block: 'Bloqueado',
  review: 'Em Revisão',
  done: 'Concluído',
};
const DEFAULT_BRANCH_PREFIX = 'claims';

function flag(name, required = false) {
  const index = args.indexOf(`--${name}`);
  const value = index >= 0 ? args[index + 1] : undefined;
  if (required && !value) throw new Error(`Informe --${name}.`);
  return value;
}
const has = (name) => args.includes(`--${name}`);

const api = 'https://api.github.com';
const headers = {
  authorization: `Bearer ${token}`,
  accept: 'application/vnd.github+json',
  'x-github-api-version': '2022-11-28',
  'content-type': 'application/json',
  'user-agent': 'comercial-do-norte-agent-claim',
};

async function rest(path, init = {}) {
  const response = await fetch(`${api}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { ok: response.ok, status: response.status, body };
}

async function graphql(query, variables = {}) {
  const response = await fetch(`${api}/graphql`, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(`GraphQL: ${payload.errors.map((error) => error.message).join(' | ')}`);
  return payload.data;
}

const nowIso = () => new Date().toISOString();
const state = { issueNumber: null, agent: null, session: '-', branch: '-', reservedAt: '-', updatedAt: nowIso(), status: 'livre' };

async function projectContext() {
  const data = await graphql(
    `query($login:String!,$number:Int!){organization(login:$login){projectV2(number:$number){id fields(first:60){nodes{
       ... on ProjectV2FieldCommon{id name}
       ... on ProjectV2SingleSelectField{id name options{id name}}
     }}}}}`,
    { login: OWNER, number: PROJECT_NUMBER },
  );
  const project = data.organization?.projectV2;
  if (!project) throw new Error('Projeto não encontrado.');
  return project;
}

async function projectItemFor(project, contentId) {
  const data = await graphql(
    `mutation($projectId:ID!,$contentId:ID!){addProjectV2ItemById(input:{projectId:$projectId,contentId:$contentId}){item{id}}}`,
    { projectId: project.id, contentId },
  );
  return data.addProjectV2ItemById.item.id;
}

async function setSelect(project, itemId, fieldName, value) {
  const field = project.fields.nodes.find((node) => node.name === fieldName);
  const option = field?.options?.find((candidate) => candidate.name === value);
  if (!field || !option) throw new Error(`Campo/opção inexistente: ${fieldName}=${value}`);
  await graphql(
    `mutation($input:UpdateProjectV2ItemFieldValueInput!){updateProjectV2ItemFieldValue(input:$input){projectV2Item{id}}}`,
    { input: { projectId: project.id, itemId, fieldId: field.id, value: { singleSelectOptionId: option.id } } },
  );
}

async function issueByNumber(number) {
  const { ok, body } = await rest(`/repos/${OWNER}/${REPO}/issues/${number}`);
  if (!ok) throw new Error(`Issue #${number} não encontrada.`);
  return body;
}

async function openDependencies(issueNodeId) {
  const data = await graphql(
    `query($id:ID!){node(id:$id){... on Issue{blockedBy(first:50){nodes{number title state}}}}}`,
    { id: issueNodeId },
  );
  return (data.node.blockedBy.nodes ?? []).filter((node) => node.state === 'OPEN');
}

async function claimRefs(issueNumber) {
  const { ok, body } = await rest(`/repos/${OWNER}/${REPO}/git/matching-refs/heads/${DEFAULT_BRANCH_PREFIX}/issue-${issueNumber}--`);
  return ok && Array.isArray(body) ? body : [];
}

const holderOf = (ref) => ref?.ref?.split('--').pop() ?? 'desconhecido';

async function baseSha() {
  const { body } = await rest(`/repos/${OWNER}/${REPO}/git/ref/heads/main`);
  return body.object.sha;
}

async function comment(number, body) {
  await rest(`/repos/${OWNER}/${REPO}/issues/${number}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
}

async function addLabels(number, labels) {
  await rest(`/repos/${OWNER}/${REPO}/issues/${number}/labels`, { method: 'POST', body: JSON.stringify({ labels }) });
}

async function removeLabel(number, label) {
  await rest(`/repos/${OWNER}/${REPO}/issues/${number}/labels/${encodeURIComponent(label)}`, { method: 'DELETE' });
}

function reservationComment(action, extra = '') {
  return `${extra}<!-- agent-reservation
tarefa: #${state.issueNumber}
agente: ${state.agent ?? 'Não atribuído'}
sessao: ${state.session}
branch: ${state.branch}
reservadoEm: ${state.reservedAt}
atualizadoEm: ${state.updatedAt}
estado: ${state.status}
acao: ${action}
-->`;
}

async function applyStatus(project, issue, status) {
  const itemId = await projectItemFor(project, issue.node_id);
  await setSelect(project, itemId, 'Status', status);
  if (state.agent && AGENTS.includes(state.agent)) await setSelect(project, itemId, 'Agente executor', state.agent);
}

// ------------------------------------------------------------------ comandos --

async function requireAgent() {
  const agent = flag('agent', true);
  if (!AGENTS.includes(agent)) throw new Error(`Agente inválido. Use: ${AGENTS.join(', ')}`);
  state.agent = agent;
}

async function commandClaim(project, issue) {
  const refs = await claimRefs(issue.number);
  const existing = refs[0];
  if (existing) {
    const holder = holderOf(existing);
    if (holder !== state.agent) {
      throw new Error(`Tarefa já reservada por "${holder}" (ref ${existing.ref}). Escolha outra Issue ou peça a liberação.`);
    }
    // Mesmo agente: renova a reserva.
    await applyStatus(project, issue, 'Reservado');
    await comment(issue.number, reservationComment('renovada', `**Reserva renovada** por \`${state.agent}\`.\n\n`));
    return { resultado: 'renovada', issue: issue.number, agente: state.agent, branch: state.branch };
  }

  const blocked = await openDependencies(issue.node_id);
  if (blocked.length) {
    throw new Error(`Tarefa bloqueada por: ${blocked.map((node) => `#${node.number}`).join(', ')}. Resolva as dependências antes de assumir.`);
  }

  const sha = await baseSha();
  const refName = `refs/heads/${DEFAULT_BRANCH_PREFIX}/issue-${issue.number}--${state.agent}`;
  const created = await rest(`/repos/${OWNER}/${REPO}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: refName, sha }),
  });
  if (!created.ok) {
    // 422 = outro agente criou o ref no mesmo instante (corrida real).
    throw new Error(`Reserva recusada (${created.status}). Outro agente pode ter assumido a tarefa agora.`);
  }

  state.reservedAt = nowIso();
  state.status = 'reservado';
  await applyStatus(project, issue, 'Reservado');
  await addLabels(issue.number, ['agent-claim']);
  const assignee = flag('assignee');
  if (assignee) await rest(`/repos/${OWNER}/${REPO}/issues/${issue.number}/assignees`, { method: 'POST', body: JSON.stringify({ assignees: [assignee] }) });
  await comment(issue.number, reservationComment('assumida', `**Tarefa assumida** por \`${state.agent}\`.\nBranch prevista: \`${state.branch}\`.\n`));
  return { resultado: 'reservada', issue: issue.number, agente: state.agent, branch: state.branch, ref: refName };
}

async function commandProgress(project, issue, action, status, extraComment, labels = []) {
  const refs = await claimRefs(issue.number);
  const holder = refs.length ? holderOf(refs[0]) : null;
  if (!holder) throw new Error('Tarefa sem reserva ativa. Rode `claim` antes.');
  if (holder !== state.agent) throw new Error(`Reserva pertence a "${holder}".`);
  state.status = status.toLowerCase();
  await applyStatus(project, issue, status);
  if (labels.length) await addLabels(issue.number, labels);
  await comment(issue.number, reservationComment(action, `${extraComment}\n\n`));
  return { resultado: action, issue: issue.number, agente: state.agent, status };
}

async function commandRelease(project, issue) {
  const refs = await claimRefs(issue.number);
  if (!refs.length) return { resultado: 'sem-reserva', issue: issue.number };
  const holder = holderOf(refs[0]);
  const force = has('force');
  if (holder !== state.agent && !force) throw new Error(`Reserva pertence a "${holder}". Use --force apenas se confirmou que o processo morreu.`);

  if (force) {
    // Nunca libere automaticamente: confirme que não há PR aberto nem trabalho recente.
    const { body: pulls } = await rest(`/repos/${OWNER}/${REPO}/pulls?state=open&per_page=100`);
    const related = (pulls ?? []).filter((pull) => pull.head?.ref && pull.head.ref.includes(`issue-${issue.number}`));
    if (related.length) {
      throw new Error(`Há PR aberto para esta tarefa (${related.map((pull) => `#${pull.number}`).join(', ')}). Resolva o PR antes de forçar a liberação.`);
    }
    if (!has('reason')) throw new Error('Liberação forçada exige --reason (evidência de que o processo morreu).');
  }

  const { ok } = await rest(`/repos/${OWNER}/${REPO}/git/refs/heads/${DEFAULT_BRANCH_PREFIX}/issue-${issue.number}--${holder}`, { method: 'DELETE' });
  if (!ok) throw new Error('Falha ao remover o ref de reserva.');
  state.agent = state.agent ?? holder;
  state.status = 'livre';
  await applyStatus(project, issue, 'A Fazer');
  await removeLabel(issue.number, 'agent-claim').catch(() => undefined);
  await comment(issue.number, reservationComment('liberada', `**Reserva liberada** (era de \`${holder}\`)${has('reason') ? `.\nMotivo: ${flag('reason')}` : '.'}\n`));
  return { resultado: 'liberada', issue: issue.number, eraDe: holder };
}

async function commandStatus(issue) {
  const refs = await claimRefs(issue.number);
  const blocked = await openDependencies(issue.node_id);
  return {
    issue: issue.number,
    titulo: issue.title,
    reserva: refs.length ? { agente: holderOf(refs[0]), ref: refs[0].ref } : null,
    bloqueadoPor: blocked.map((node) => `#${node.number} ${node.title}`),
    disponivel: !refs.length && blocked.length === 0,
  };
}

// ---------------------------------------------------------------------- run --

const issueNumber = Number(flag('issue', true));
state.issueNumber = issueNumber;
state.session = flag('session') ?? process.env.AGENT_SESSION ?? '-';
state.branch = flag('branch') ?? '-';
const project = await projectContext();
const issue = await issueByNumber(issueNumber);

let result;
if (command === 'status') {
  result = await commandStatus(issue);
} else if (command === 'release') {
  await requireAgent();
  result = await commandRelease(project, issue);
} else if (command === 'claim') {
  await requireAgent();
  result = await commandClaim(project, issue);
} else if (['start', 'block', 'review', 'done'].includes(command)) {
  await requireAgent();
  const extra = {
    start: `Implementação iniciada em \`${state.branch}\`.`,
    block: `**Bloqueio registrado:** ${flag('reason') ?? 'motivo não informado'}`,
    review: `Revisão solicitada${flag('pr') ? ` — ${flag('pr')}` : ''}.`,
    done: `Implementação concluída${flag('pr') ? ` — ${flag('pr')}` : ''}. Aguardando validação humana.`,
  }[command];
  if (command === 'block' && !flag('reason')) throw new Error('Informe --reason no bloqueio.');
  result = await commandProgress(project, issue, command, STATUS_BY_COMMAND[command], extra, command === 'review' ? ['needs-review'] : []);
} else {
  throw new Error('Comandos: claim, start, block, review, done, release, status.');
}

console.log(JSON.stringify(result, null, 2));
