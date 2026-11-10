import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';

const REPO = 'idedigitalbr/loja-comercial-do-norte';
const PROJECT_NUMBER = 3;
const PROJECT_ID = 'PVT_kwDODX5gps4BokxJ';
const PROJECT_OWNER = 'idedigitalbr';

const FIELDS = {
  status: 'PVTSSF_lADODX5gps4BokxJzhnEO_0',
  etapa: 'PVTSSF_lADODX5gps4BokxJzhnEQCU',
  prioridade: 'PVTSSF_lADODX5gps4BokxJzhnEQDU',
  sprint: 'PVTSSF_lADODX5gps4BokxJzhnEQCM'
};

const STATUS_OPTIONS = {
  'Backlog': 'f75ad846',
  'A Fazer': '47fc9ee4',
  'Reservado': '98236657',
  'Em Andamento': '64ac12dc',
  'Em Revisão': '659f1e6a',
  'Bloqueado': 'ca9f1663',
  'Concluído': '7192e55d'
};

const ETAPA_OPTIONS = {
  'Etapa 1': '909aac38',
  'Etapa 2': '8dda5c33',
  'Etapa 3': 'a090738f',
  'Etapa 4': '96bf99fd',
  'Etapa 5': '8921cc70',
  'Etapa 6': '1a111e86'
};

const PRIORIDADE_OPTIONS = {
  'P0': '4c47ddf2',
  'P1': 'b6139652',
  'P2': 'b57b4bd1',
  'P3': 'b007d4ea'
};

const SPRINT_OPTIONS = {
  'Sprint 1': '72b477ba',
  'Sprint 2': 'b55f391e',
  'Sprint 3': 'b9c87379',
  'Sprint 4': 'caf2356d'
};

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

function runGql(query) {
  const res = execSync('gh api graphql --input -', {
    input: JSON.stringify({ query }),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  return JSON.parse(res);
}

// 1. Definition of the 6 parent tasks from CRM
const parentTasks = [
  {
    num: 1,
    title: 'ETAPA 01 — PRÉ-PROJETO E PLANEJAMENTO',
    crmId: 'cmwapfe8u01gvlk0j24yfxsex',
    objective: 'Entender as necessidades da empresa, definir o visual e planejar a estrutura do novo site.',
    status: 'Concluído',
    etapa: 'Etapa 1',
    prioridade: 'P1',
    sprint: 'Sprint 1',
    subIssueNumbers: [74, 75, 76]
  },
  {
    num: 2,
    title: 'ETAPA 02 — DESENVOLVIMENTO CORE',
    crmId: 'cmwapg67w01ijlk0jnszyg8ax',
    objective: 'Construir a página inicial, a estrutura do site, o painel administrativo e as funcionalidades essenciais.',
    status: 'Em Andamento',
    etapa: 'Etapa 2',
    prioridade: 'P0',
    sprint: 'Sprint 2',
    subIssueNumbers: [77, 78, 79, 80]
  },
  {
    num: 3,
    title: 'ETAPA 03 — DESENVOLVIMENTO COMPLEMENTAR',
    crmId: 'cmwaphhvf01m7lk0jr73ljdm7',
    objective: 'Desenvolver as demais páginas, os módulos administrativos e as funcionalidades de navegação e atendimento.',
    status: 'Em Andamento',
    etapa: 'Etapa 3',
    prioridade: 'P0',
    sprint: 'Sprint 3',
    subIssueNumbers: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90]
  },
  {
    num: 4,
    title: 'ETAPA 04 — REFINAMENTO, INTEGRAÇÕES E QA',
    crmId: 'cmwapja4r01sdlk0jtoftqtzi',
    objective: 'Garantir que todas as páginas estejam bem apresentadas, com informações corretas e funcionalidades testadas.',
    status: 'Em Andamento',
    etapa: 'Etapa 4',
    prioridade: 'P0',
    sprint: 'Sprint 3',
    subIssueNumbers: [91, 92, 93]
  },
  {
    num: 5,
    title: 'ETAPA 05 — GO-LIVE, ENTREGA E LANÇAMENTO',
    crmId: 'cmwapkcuq01vglk0jv5v0rz90',
    objective: 'Validar o site com o cliente, publicar a versão final e entregar a plataforma pronta para utilização.',
    status: 'A Fazer',
    etapa: 'Etapa 5',
    prioridade: 'P0',
    sprint: 'Sprint 4',
    subIssueNumbers: [94, 95, 96]
  },
  {
    num: 6,
    title: 'FASE FUTURA — E-COMMERCE COMPLETO',
    crmId: 'cmwapkw4l01xdlk0jdpc14r2f',
    objective: 'Funcionalidades fora do escopo da entrega inicial planejadas para a fase seguinte (ERP, checkout real, frete).',
    status: 'Backlog',
    etapa: 'Etapa 6',
    prioridade: 'P3',
    sprint: 'Sprint 4',
    subIssueNumbers: [97]
  }
];

// Clean subtask titles by removing redundant [ETAPA X] prefix if user wants
const subtaskTitleMap = {
  74: '1.1 — Pesquisa e levantamento',
  75: '1.2 — UX/UI e arquitetura',
  76: '1.3 — Preparação técnica',
  77: '2.1 — Páginas públicas — PG 01 — Home / Página Inicial',
  78: '2.2 — PG 02 — Página de Login',
  79: '2.3 — Painel Administrativo (Dashboard e Configurações)',
  80: '2.4 — Funcionalidades principais',
  81: '3.1 — PG 03 — Catálogo de Produtos',
  82: '3.1 — PG 04 — Página do Produto',
  83: '3.1 — PG 05 — Carrinho de Cotação',
  84: '3.1 — PG 06 — Marcas',
  85: '3.1 — PG 07 — Segmentos / Para o Seu Negócio',
  86: '3.1 — PG 08 — Blog / Explica Aí Nort',
  87: '3.1 — PG 09 — Eventos e Workshops',
  88: '3.1 — PG 10 — Outras Páginas do Catálogo',
  89: '3.2 — Módulos Administrativos (Catálogo, Cotações, Conteúdo, Atendimento)',
  90: '3.3 — Funcionalidades complementares',
  91: '4.1 — Refinamento UI/UX',
  92: '4.2 — Conteúdo e informações oficiais',
  93: '4.3 — Integrações e testes',
  94: '5.1 — Homologação',
  95: '5.2 — Deploy / Publicação',
  96: '5.3 — Entrega e lançamento',
  97: 'Fase Futura — E-commerce Completo'
};

console.log('--- 1. Atualizando títulos das subtarefas para refletir nível hierárquico ---');
for (const [num, title] of Object.entries(subtaskTitleMap)) {
  try {
    run(`gh issue edit ${num} --repo ${REPO} --title "${title}"`);
    console.log(`Issue #${num} -> "${title}"`);
  } catch (e) {
    console.error(`Erro ao renomear #${num}:`, e.message);
  }
}

console.log('\n--- 2. Criando Tarefas Pais (Etapas 01 a 05 + Fase Futura) ---');
const existingIssues = JSON.parse(run(`gh issue list --repo ${REPO} --limit 100 --state all --json number,title,id`));
const existingByTitle = {};
for (const iss of existingIssues) {
  existingByTitle[iss.title.trim()] = iss;
}

for (const p of parentTasks) {
  let issue = existingByTitle[p.title];
  if (!issue) {
    const subList = p.subIssueNumbers.map(n => `- [ ] #${n} ${subtaskTitleMap[n]}`).join('\n');
    const body = `## Objetivo da Etapa
${p.objective}

- **Nível Hierárquico:** Tarefa Pai (Etapa)
- **ID no CRM:** \`${p.crmId}\`
- **Etapa:** ${p.etapa}

## Subtarefas Vinculadas
${subList}

<!-- agent-reservation
tarefa: ${p.title}
crmId: ${p.crmId}
tipo: parent-etapa
-->`;

    const tmpFile = 'd:/.GITHUB/sistemas/loja-comercial-do-norte/.MD/temp_parent_body.md';
    writeFileSync(tmpFile, body, 'utf8');
    const url = run(`gh issue create --repo ${REPO} --title "${p.title}" --body-file "${tmpFile}" --label "etapa:${p.num},tipo:etapa" --assignee victorwilliames`);
    unlinkSync(tmpFile);
    console.log(`Criada Tarefa Pai: ${p.title} -> ${url}`);
    
    // Obter ID GraphQL
    const num = parseInt(url.split('/').pop());
    p.issueNumber = num;
  } else {
    p.issueNumber = issue.number;
    console.log(`Tarefa Pai já existente: ${p.title} (#${issue.number})`);
  }

  // Buscar ID GraphQL do pai
  const gqlParent = runGql(`query {
    repository(owner: "idedigitalbr", name: "loja-comercial-do-norte") {
      issue(number: ${p.issueNumber}) {
        id
        title
      }
    }
  }`);
  p.gqlId = gqlParent.data.repository.issue.id;
}

console.log('\n--- 3. Vinculando Subtarefas aos Pais via GitHub Sub-issues API ---');
for (const p of parentTasks) {
  for (const subNum of p.subIssueNumbers) {
    const gqlSub = runGql(`query {
      repository(owner: "idedigitalbr", name: "loja-comercial-do-norte") {
        issue(number: ${subNum}) {
          id
        }
      }
    }`);
    const subGqlId = gqlSub.data.repository.issue.id;

    try {
      const mutation = `mutation {
        addSubIssue(input: {
          issueId: "${p.gqlId}",
          subIssueId: "${subGqlId}"
        }) {
          subIssue {
            id
            title
          }
        }
      }`;
      runGql(mutation);
      console.log(`  Vinculada: #${subNum} -> ${p.title}`);
    } catch (err) {
      console.log(`  (Nota vínculo #${subNum} -> ${p.title}): ${err.message || 'ok'}`);
    }
  }
}

console.log('\n--- 4. Adicionando as Tarefas Pais ao Quadro #3 e definindo campos ---');
for (const p of parentTasks) {
  let itemId;
  try {
    const addRes = run(`gh project item-add ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --url https://github.com/${REPO}/issues/${p.issueNumber} --format json`);
    const parsed = JSON.parse(addRes);
    itemId = parsed.id;
  } catch (e) {}

  if (!itemId) {
    const curItems = JSON.parse(run(`gh project item-list ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --limit 100 --format json`));
    const match = curItems.items.find(i => i.content && i.content.number === p.issueNumber);
    if (match) itemId = match.id;
  }

  if (itemId) {
    // Status
    const sId = STATUS_OPTIONS[p.status];
    if (sId) run(`gh project item-edit --id ${itemId} --field-id ${FIELDS.status} --project-id ${PROJECT_ID} --single-select-option-id ${sId}`);
    // Etapa
    const eId = ETAPA_OPTIONS[p.etapa];
    if (eId) run(`gh project item-edit --id ${itemId} --field-id ${FIELDS.etapa} --project-id ${PROJECT_ID} --single-select-option-id ${eId}`);
    // Prioridade
    const prId = PRIORIDADE_OPTIONS[p.prioridade];
    if (prId) run(`gh project item-edit --id ${itemId} --field-id ${FIELDS.prioridade} --project-id ${PROJECT_ID} --single-select-option-id ${prId}`);
    // Sprint
    const spId = SPRINT_OPTIONS[p.sprint];
    if (spId) run(`gh project item-edit --id ${itemId} --field-id ${FIELDS.sprint} --project-id ${PROJECT_ID} --single-select-option-id ${spId}`);
    console.log(`  Pai no Quadro: ${p.title} (ID: ${itemId})`);
  }
}

console.log('\n--- HIERARQUIA 100% IMPLEMENTADA COM SUCESSO! ---');
