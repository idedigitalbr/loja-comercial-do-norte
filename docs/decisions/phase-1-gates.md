# Fase 1 — Gates de arquitetura e negócio

Status: em andamento
Última atualização: 2026-09-11

Este documento registra as decisões necessárias antes da criação do monorepo. A arquitetura do plano só avança para a Task 1 quando os gates obrigatórios estiverem comprovados.

## Gate A — Compatibilidade da hospedagem

Resultado atual: compatível por declaração do responsável; falta apenas anexar/registrar a evidência do hPanel quando disponível.

| Verificação | Evidência esperada | Status |
|---|---|---|
| Node.js compatível com a versão escolhida | Versão disponível e comando de inicialização | Compatível — plano Business |
| Processo Node persistente | Aplicação permanece ativa após o start | Pendente |
| `PORT` fornecida pela plataforma | Variável documentada ou observada | Pendente |
| Variáveis de ambiente secretas | Configuração fora do repositório | Compatível — confirmar no hPanel |
| MySQL compatível com Prisma/InnoDB | Versão, acesso e limites de conexão | Compatível — confirmar limites |
| Cron Job | Intervalo mínimo e comando/URL disponíveis | Pendente |
| HTTPS | Domínio e certificado ativos | Pendente |
| Upload persistente | Diretório gravável que sobrevive ao deploy | Pendente |
| Limites operacionais | CPU, RAM, processos, timeout e conexões | Pendente |

Decisão atual: `GO condicionado` para iniciar a fundação no plano Business. O deploy de produção continua condicionado à confirmação dos limites, do comando de inicialização, das variáveis de ambiente e da persistência de uploads no hPanel.

### Evidência pública consultada em 2026-09-11

- A [documentação de opções Node.js da Hostinger](https://www.hostinger.com/support/node-js-hosting-options-at-hostinger/) informa que planos Web Business ou qualquer plano Cloud permitem publicar uma aplicação Node.js; planos Agency são descritos como front-end estático e não atendem ao processo Node persistente deste plano.
- A [documentação de Cron Jobs](https://support.hostinger.com/en/articles/1583465-how-to-set-up-a-cron-job-at-hostinger) informa que os agendamentos usam UTC+0. O runbook deve converter explicitamente os horários comerciais para UTC.
- A [documentação sobre `event_scheduler`](https://support.hostinger.com/en/articles/1583548-is-event_scheduler-enabled-for-mysql) informa que Web e Cloud não o suportam. O executor HTTP protegido por Cron continua sendo a opção compatível.

Essa evidência pública não substitui a verificação da conta. O plano da conta, os limites de recursos, o comando de inicialização e a disponibilidade real de variáveis de ambiente ainda precisam ser confirmados no hPanel.

## Gate B — Regras comerciais

| Tema | Decisão necessária | Status |
|---|---|---|
| Frete | Provedor, regiões, prazo, valor declarado e fallback | Pendente |
| Retirada | Endereço, horários, prazo de preparação e comprovante | Pendente |
| Pagamento | Pix, cartão, parcelas, expiração e conciliação | Pendente |
| Cancelamento/reembolso | Produto, treinamento, parcial, total e chargeback | Pendente |
| Fiscal | Emissão de documento fiscal e responsável operacional | Pendente |
| VIP | Elegibilidade, vigência, acúmulo e aprovação | Pendente |
| Treinamentos | Transferência de participante, falta e cancelamento | Pendente |
| Comunicação | E-mail transacional, remetente e templates | Pendente |
| Fuso horário | Confirmar `America/Belem` como fuso comercial | Pendente |

## Gate C — Escopo do MVP

O MVP está definido preliminarmente em `docs/acceptance/mvp.md`. O escopo deve ser aprovado antes de congelar o schema Prisma.

## Gate D — Testes e operação

- [x] Repositório Git inicializado na pasta correta.
- [x] `.gitignore` criado antes do primeiro stage.
- [x] Estratégia inicial registrada em `docs/testing/strategy.md`.
- [x] MySQL real disponível localmente no Laragon.
- [ ] MySQL real provisionado no CI.
- [x] Seed e migrations reproduzíveis localmente.
- [ ] Playwright executável no CI.
- [ ] Política de cobertura configurada por pacote e módulo crítico.

## Decisão de passagem

O responsável deve registrar uma decisão `GO` com data e evidências anexas após concluir os Gates A–D. Até lá, alterações ficam limitadas à documentação e preparação segura do repositório.
