import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const CHECKLIST_PATH = 'd:/.GITHUB/sistemas/loja-comercial-do-norte/.MD/CHECKLIST.md';
const CRM_JSON_PATH = 'C:/Users/willi/.gemini/antigravity/brain/edf2c120-40ed-48c0-b93f-04b8522514a2/.system_generated/steps/65/output.txt';

const PROJECT_ID = 'PVT_kwDODX5gps4BokxJ';
const PROJECT_NUMBER = 3;
const PROJECT_OWNER = 'idedigitalbr';
const REPO = 'idedigitalbr/loja-comercial-do-norte';

// Field IDs in Project 3
const FIELDS = {
  status: 'PVTSSF_lADODX5gps4BokxJzhnEO_0',
  etapa: 'PVTSSF_lADODX5gps4BokxJzhnEQCU',
  prioridade: 'PVTSSF_lADODX5gps4BokxJzhnEQDU',
  sprint: 'PVTSSF_lADODX5gps4BokxJzhnEQCM'
};

// Option IDs
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
  'P0': '4c47ddf2', // P0 — URGENTE | Pra ontem
  'P1': 'b6139652', // P1 — ALTA | Pra hoje
  'P2': 'b57b4bd1', // P2 — NORMAL | Prioridade média
  'P3': 'b007d4ea'  // P3 — BAIXA | Pra depois
};

const SPRINT_OPTIONS = {
  'Sprint 1': '72b477ba',
  'Sprint 2': 'b55f391e',
  'Sprint 3': 'b9c87379',
  'Sprint 4': 'caf2356d'
};

const checklist = readFileSync(CHECKLIST_PATH, 'utf8');
const crmData = JSON.parse(readFileSync(CRM_JSON_PATH, 'utf8'));

const crmTasksByTitle = {};
for (const t of crmData.tasks) {
  crmTasksByTitle[t.title.trim()] = t;
}

const tasksDef = [
  {
    code: '1.1',
    crmTitle: '1.1 — Pesquisa e levantamento',
    etapaNum: 1,
    etapaName: 'Etapa 1',
    sprint: 'Sprint 1',
    prioridade: 'P1',
    tipo: 'ux',
    startLine: '### 1.1 — Pesquisa e levantamento',
    endLine: '### 1.2 — UX/UI e arquitetura'
  },
  {
    code: '1.2',
    crmTitle: '1.2 — UX/UI e arquitetura',
    etapaNum: 1,
    etapaName: 'Etapa 1',
    sprint: 'Sprint 1',
    prioridade: 'P1',
    tipo: 'ui',
    startLine: '### 1.2 — UX/UI e arquitetura',
    endLine: '### 1.3 — Preparação técnica'
  },
  {
    code: '1.3',
    crmTitle: '1.3 — Preparação técnica',
    etapaNum: 1,
    etapaName: 'Etapa 1',
    sprint: 'Sprint 1',
    prioridade: 'P0',
    tipo: 'infra',
    startLine: '### 1.3 — Preparação técnica',
    endLine: '## ETAPA 02 — DESENVOLVIMENTO CORE'
  },
  {
    code: '2.1',
    crmTitle: '2.1 — Páginas públicas — PG 01 — Home / Página Inicial',
    etapaNum: 2,
    etapaName: 'Etapa 2',
    sprint: 'Sprint 2',
    prioridade: 'P0',
    tipo: 'front',
    startLine: '**PG 01 — Home / Página Inicial**',
    endLine: '### 2.2 — Página de Login'
  },
  {
    code: '2.2',
    crmTitle: '2.2 — PG 02 — Página de Login',
    etapaNum: 2,
    etapaName: 'Etapa 2',
    sprint: 'Sprint 2',
    prioridade: 'P1',
    tipo: 'front',
    startLine: '### 2.2 — Página de Login',
    endLine: '### 2.3 — Painel administrativo'
  },
  {
    code: '2.3',
    crmTitle: '2.3 — Painel Administrativo (Dashboard e Configurações)',
    etapaNum: 2,
    etapaName: 'Etapa 2',
    sprint: 'Sprint 2',
    prioridade: 'P1',
    tipo: 'front',
    startLine: '### 2.3 — Painel administrativo',
    endLine: '### 2.4 — Funcionalidades principais'
  },
  {
    code: '2.4',
    crmTitle: '2.4 — Funcionalidades principais',
    etapaNum: 2,
    etapaName: 'Etapa 2',
    sprint: 'Sprint 2',
    prioridade: 'P0',
    tipo: 'back',
    startLine: '### 2.4 — Funcionalidades principais',
    endLine: '## ETAPA 03 — DESENVOLVIMENTO COMPLEMENTAR'
  },
  {
    code: '3.1-PG03',
    crmTitle: '3.1 — PG 03 — Catálogo de Produtos',
    etapaNum: 3,
    etapaName: 'Etapa 3',
    sprint: 'Sprint 2',
    prioridade: 'P0',
    tipo: 'front',
    startLine: '**PG 03 — Catálogo de Produtos**',
    endLine: '**PG 04 — Página do Produto**'
  },
  {
    code: '3.1-PG04',
    crmTitle: '3.1 — PG 04 — Página do Produto',
    etapaNum: 3,
    etapaName: 'Etapa 3',
    sprint: 'Sprint 2',
    prioridade: 'P0',
    tipo: 'front',
    startLine: '**PG 04 — Página do Produto**',
    endLine: '**PG 05 — Carrinho de Cotação**'
  },
  {
    code: '3.1-PG05',
    crmTitle: '3.1 — PG 05 — Carrinho de Cotação',
    etapaNum: 3,
    etapaName: 'Etapa 3',
    sprint: 'Sprint 2',
    prioridade: 'P0',
    tipo: 'front',
    startLine: '**PG 05 — Carrinho de Cotação**',
    endLine: '**PG 06 — Marcas**'
  },
  {
    code: '3.1-PG06',
    crmTitle: '3.1 — PG 06 — Marcas',
    etapaNum: 3,
    etapaName: 'Etapa 3',
    sprint: 'Sprint 3',
    prioridade: 'P1',
    tipo: 'front',
    startLine: '**PG 06 — Marcas**',
    endLine: '**PG 07 — Segmentos / Para o Seu Negócio**'
  },
  {
    code: '3.1-PG07',
    crmTitle: '3.1 — PG 07 — Segmentos / Para o Seu Negócio',
    etapaNum: 3,
    etapaName: 'Etapa 3',
    sprint: 'Sprint 3',
    prioridade: 'P1',
    tipo: 'front',
    startLine: '**PG 07 — Segmentos / Para o Seu Negócio**',
    endLine: '**PG 08 — Blog / Explica Aí Nort**'
  },
  {
    code: '3.1-PG08',
    crmTitle: '3.1 — PG 08 — Blog / Explica Aí Nort',
    etapaNum: 3,
    etapaName: 'Etapa 3',
    sprint: 'Sprint 3',
    prioridade: 'P2',
    tipo: 'front',
    startLine: '**PG 08 — Blog / Explica Aí Nort**',
    endLine: '**PG 09 — Eventos e Workshops**'
  },
  {
    code: '3.1-PG09',
    crmTitle: '3.1 — PG 09 — Eventos e Workshops',
    etapaNum: 3,
    etapaName: 'Etapa 3',
    sprint: 'Sprint 3',
    prioridade: 'P2',
    tipo: 'front',
    startLine: '**PG 09 — Eventos e Workshops**',
    endLine: '**PG 10 — Outras Páginas do Catálogo**'
  },
  {
    code: '3.1-PG10',
    crmTitle: '3.1 — PG 10 — Outras Páginas do Catálogo',
    etapaNum: 3,
    etapaName: 'Etapa 3',
    sprint: 'Sprint 3',
    prioridade: 'P2',
    tipo: 'front',
    startLine: '**PG 10 — Outras Páginas do Catálogo**',
    endLine: '### 3.2 — Demais módulos administrativos'
  },
  {
    code: '3.2',
    crmTitle: '3.2 — Módulos Administrativos (Catálogo, Cotações, Conteúdo, Atendimento)',
    etapaNum: 3,
    etapaName: 'Etapa 3',
    sprint: 'Sprint 3',
    prioridade: 'P1',
    tipo: 'back',
    startLine: '### 3.2 — Demais módulos administrativos',
    endLine: '### 3.3 — Funcionalidades complementares'
  },
  {
    code: '3.3',
    crmTitle: '3.3 — Funcionalidades complementares',
    etapaNum: 3,
    etapaName: 'Etapa 3',
    sprint: 'Sprint 3',
    prioridade: 'P1',
    tipo: 'front',
    startLine: '### 3.3 — Funcionalidades complementares',
    endLine: '## ETAPA 04 — REFINAMENTO, INTEGRAÇÕES E QA'
  },
  {
    code: '4.1',
    crmTitle: '4.1 — Refinamento UI/UX',
    etapaNum: 4,
    etapaName: 'Etapa 4',
    sprint: 'Sprint 3',
    prioridade: 'P1',
    tipo: 'ui',
    startLine: '### 4.1 — Refinamento UI/UX',
    endLine: '### 4.2 — Conteúdo e informações oficiais'
  },
  {
    code: '4.2',
    crmTitle: '4.2 — Conteúdo e informações oficiais',
    etapaNum: 4,
    etapaName: 'Etapa 4',
    sprint: 'Sprint 3',
    prioridade: 'P0',
    tipo: 'content',
    startLine: '### 4.2 — Conteúdo e informações oficiais',
    endLine: '### 4.3 — Integrações e testes'
  },
  {
    code: '4.3',
    crmTitle: '4.3 — Integrações e testes',
    etapaNum: 4,
    etapaName: 'Etapa 4',
    sprint: 'Sprint 3',
    prioridade: 'P0',
    tipo: 'qa',
    startLine: '### 4.3 — Integrações e testes',
    endLine: '## ETAPA 05 — GO-LIVE, ENTREGA E LANÇAMENTO'
  },
  {
    code: '5.1',
    crmTitle: '5.1 — Homologação',
    etapaNum: 5,
    etapaName: 'Etapa 5',
    sprint: 'Sprint 4',
    prioridade: 'P0',
    tipo: 'qa',
    startLine: '### 5.1 — Homologação',
    endLine: '### 5.2 — Deploy / Publicação'
  },
  {
    code: '5.2',
    crmTitle: '5.2 — Deploy / Publicação',
    etapaNum: 5,
    etapaName: 'Etapa 5',
    sprint: 'Sprint 4',
    prioridade: 'P0',
    tipo: 'infra',
    startLine: '### 5.2 — Deploy / Publicação',
    endLine: '### 5.3 — Entrega e lançamento'
  },
  {
    code: '5.3',
    crmTitle: '5.3 — Entrega e lançamento',
    etapaNum: 5,
    etapaName: 'Etapa 5',
    sprint: 'Sprint 4',
    prioridade: 'P1',
    tipo: 'content',
    startLine: '### 5.3 — Entrega e lançamento',
    endLine: '## FASE FUTURA — E-COMMERCE COMPLETO'
  },
  {
    code: 'FASE-FUTURA',
    crmTitle: 'Fase Futura — E-commerce Completo',
    etapaNum: 6,
    etapaName: 'Etapa 6',
    sprint: 'Sprint 4',
    prioridade: 'P3',
    tipo: 'back',
    startLine: '## FASE FUTURA — E-COMMERCE COMPLETO',
    endLine: '## Regras de acompanhamento — IDE Digital'
  }
];

export {
  CHECKLIST_PATH,
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
};
