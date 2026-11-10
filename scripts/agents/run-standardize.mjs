import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';
import {
  PROJECT_ID,
  PROJECT_NUMBER,
  PROJECT_OWNER,
  REPO,
  FIELDS,
  STATUS_OPTIONS,
  ETAPA_OPTIONS,
  PRIORIDADE_OPTIONS,
  SPRINT_OPTIONS,
  checklist,
  crmTasksByTitle,
  tasksDef
} from './standardize-official-project.mjs';

function run(cmd, capture = true) {
  try {
    const res = execSync(cmd, { encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
    return res ? res.trim() : '';
  } catch (err) {
    if (err.stdout) console.log(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    throw err;
  }
}

console.log('--- 1. Preparando tarefas do checklist oficial ---');
const preparedTasks = [];
for (const def of tasksDef) {
  const startIdx = checklist.indexOf(def.startLine);
  const endIdx = checklist.indexOf(def.endLine, startIdx);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Delimitador não encontrado para tarefa ${def.code}: [${def.startLine}] -> [${def.endLine}]`);
  }
  const sectionText = checklist.substring(startIdx, endIdx);
  const checklistLines = sectionText
    .split('\n')
    .filter(line => line.trim().startsWith('- [') || line.trim().startsWith('**PG '))
    .join('\n');

  const crmTask = crmTasksByTitle[def.crmTitle];
  let statusName = 'A Fazer';
  if (crmTask) {
    if (crmTask.status === 'completed') statusName = 'Concluído';
    else if (crmTask.status === 'in_progress') statusName = 'Em Andamento';
    else if (crmTask.status === 'pending') {
      statusName = def.code === 'FASE-FUTURA' ? 'Backlog' : 'A Fazer';
    }
  }

  const issueTitle = def.code === 'FASE-FUTURA' 
    ? `[FASE FUTURA] ${def.crmTitle}`
    : `[ETAPA ${def.etapaNum}] ${def.crmTitle}`;

  const issueBody = `## Contexto e Objetivo
Tarefa oficial do checklist IDE Digital para o projeto **Novo Site / Loja Virtual — Comercial do Norte**.
- **Etapa:** ${def.etapaName}
- **Código / Seção:** \`${def.code}\`
- **ID da Tarefa no CRM:** \`${crmTask ? crmTask.id : 'N/A'}\`
- **Status Operacional CRM:** \`${crmTask ? crmTask.status : 'N/A'}\`

## Checklist Oficial
${checklistLines}

## Protocolo do Agente
1. Conferir se a tarefa possui dependências abertas.
2. Trabalhar em branch própria \`feat/${def.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-<slug>\` ou \`fix/\`.
3. Registrar commits, PRs e atualizações com referência a esta Issue e ao CRM.

<!-- agent-reservation
tarefa: ${def.code}
crmId: ${crmTask ? crmTask.id : ''}
etapa: ${def.etapaName}
estado: ${statusName}
-->`;

  const labels = [
    `etapa:${def.etapaNum}`,
    `tipo:${def.tipo}`,
    `prioridade:${def.prioridade.toLowerCase()}`
  ];

  preparedTasks.push({
    ...def,
    crmTask,
    statusName,
    issueTitle,
    issueBody,
    labels
  });
}

console.log(`Tarefas preparadas: ${preparedTasks.length}`);

// 2. Criar as Issues no repositório
console.log('\n--- 2. Criando as 24 Issues no repositório GitHub ---');
// Obter issues existentes para não duplicar
const existingIssuesJson = run(`gh issue list --repo ${REPO} --limit 100 --state all --json number,title,url`);
const existingIssues = JSON.parse(existingIssuesJson);
const existingByTitle = {};
for (const iss of existingIssues) {
  existingByTitle[iss.title.trim()] = iss;
}

for (const t of preparedTasks) {
  let issue = existingByTitle[t.issueTitle.trim()];
  if (!issue) {
    console.log(`Criando Issue: ${t.issueTitle}...`);
    // Criar arquivo temporário para o corpo para evitar problemas de escape no shell
    const bodyFile = 'd:/.GITHUB/sistemas/loja-comercial-do-norte/.MD/temp_body.md';
    writeFileSync(bodyFile, t.issueBody, 'utf8');
    const url = run(`gh issue create --repo ${REPO} --title "${t.issueTitle}" --body-file "d:/.GITHUB/sistemas/loja-comercial-do-norte/.MD/temp_body.md" --label "${t.labels.join(',')}" --assignee victorwilliames`);
    t.issueUrl = url;
    console.log(`  -> Criada: ${url}`);
  } else {
    t.issueUrl = issue.url;
    console.log(`Issue já existente: ${issue.url}`);
  }
}

// 3. Limpar itens antigos do Projeto #3
console.log('\n--- 3. Limpando itens antigos do Quadro #3 ---');
const projectItemsJson = run(`gh project item-list ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --format json`);
const projectItems = JSON.parse(projectItemsJson);
console.log(`Itens atualmente no Quadro #3: ${projectItems.totalCount}`);

// Manter apenas as issues que correspondem aos títulos oficiais recém-criados
const officialTitles = new Set(preparedTasks.map(t => t.issueTitle.trim()));
for (const item of projectItems.items) {
  const itemTitle = item.content ? item.content.title.trim() : (item.title ? item.title.trim() : '');
  if (!officialTitles.has(itemTitle)) {
    console.log(`Removendo item antigo do Quadro: ${itemTitle} (${item.id})`);
    try {
      run(`gh project item-delete ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --id ${item.id}`);
    } catch (e) {
      console.error(`  Erro ao remover ${item.id}:`, e.message);
    }
  }
}

// 4. Adicionar as 24 novas issues ao Quadro #3 e configurar campos
console.log('\n--- 4. Adicionando as 24 tarefas ao Quadro e configurando campos ---');
for (const t of preparedTasks) {
  console.log(`Adicionando ao Quadro: ${t.issueTitle}`);
  let itemId;
  try {
    const addRes = run(`gh project item-add ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --url ${t.issueUrl} --format json`);
    const parsedAdd = JSON.parse(addRes);
    itemId = parsedAdd.id;
  } catch (err) {
    console.log(`  (Já adicionado ou erro ao adicionar, recuperando ID...)`);
  }

  // Se não obteve itemId do retorno de item-add, buscar da lista atualizada
  if (!itemId) {
    const curItems = JSON.parse(run(`gh project item-list ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --format json`));
    const match = curItems.items.find(i => i.content && i.content.title.trim() === t.issueTitle.trim());
    if (match) itemId = match.id;
  }

  if (itemId) {
    console.log(`  Item ID: ${itemId}`);
    // Status
    const statusOptionId = STATUS_OPTIONS[t.statusName];
    if (statusOptionId) {
      run(`gh project item-edit --id ${itemId} --field-id ${FIELDS.status} --project-id ${PROJECT_ID} --single-select-option-id ${statusOptionId}`);
    }
    // Etapa
    const etapaOptionId = ETAPA_OPTIONS[t.etapaName];
    if (etapaOptionId) {
      run(`gh project item-edit --id ${itemId} --field-id ${FIELDS.etapa} --project-id ${PROJECT_ID} --single-select-option-id ${etapaOptionId}`);
    }
    // Prioridade
    const prioOptionId = PRIORIDADE_OPTIONS[t.prioridade];
    if (prioOptionId) {
      run(`gh project item-edit --id ${itemId} --field-id ${FIELDS.prioridade} --project-id ${PROJECT_ID} --single-select-option-id ${prioOptionId}`);
    }
    // Sprint
    const sprintOptionId = SPRINT_OPTIONS[t.sprint];
    if (sprintOptionId) {
      run(`gh project item-edit --id ${itemId} --field-id ${FIELDS.sprint} --project-id ${PROJECT_ID} --single-select-option-id ${sprintOptionId}`);
    }
    console.log(`  -> Campos definidos: Status=${t.statusName}, Etapa=${t.etapaName}, Prio=${t.prioridade}, Sprint=${t.sprint}`);
  }
}

// Limpar arquivo temporário se existir
try {
  unlinkSync('d:/.GITHUB/sistemas/loja-comercial-do-norte/.MD/temp_body.md');
} catch (e) {}

console.log('\n--- SUCESSO: Quadro #3 padronizado e sincronizado 100% com o CRM! ---');
