#!/usr/bin/env node
/** One permanent ref per issue. Immutable commits are session ledger and CAS generations.
 * Release writes a tombstone; NEVER delete this ref (prevents stale-release/ABA races).
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { activityStatus, transition } from "./coordination.mjs";
import { parseCommand } from "./arguments.mjs";
import { proposeSchedule, validateSchedule } from "./project-fields.mjs";
import {
  request,
  graphql,
  repoPath,
  projectContext,
  projectItems,
  setField,
  itemFor,
  readLedger,
  pages,
  writeLedger,
} from "./github.mjs";
const executors = JSON.parse(
  readFileSync(new URL("./executors.json", import.meta.url), "utf8"),
);
const manifest = JSON.parse(
  readFileSync(new URL("./tasks.json", import.meta.url), "utf8"),
);
const executorLabel = new Map(executors.flatMap((executor) => [
  [executor.nomeExibido, executor.nomeExibido],
  ...(executor.aliases ?? []).map((alias) => [alias, executor.nomeExibido]),
]));
const { command, values } = parseCommand(process.argv.slice(2));
const supported = [
  "claim",
  "renew",
  "start",
  "heartbeat",
  "pause",
  "resume",
  "block",
  "review",
  "done",
  "release",
  "status",
  "repair",
];
if (!supported.includes(command))
  throw new Error(`Comandos: ${supported.join(", ")}`);
const flag = (name) => values[name];
const number = Number(flag("issue"));
if (!Number.isSafeInteger(number) || number < 1)
  throw new Error("--issue deve ser inteiro positivo.");
const ref = `heads/claims/issue-${number}`;
const issue = await request(`${repoPath}/issues/${number}`);
if (issue.pull_request) throw new Error("Informe uma Issue, não um PR.");
const legacy = await request(
  `${repoPath}/git/matching-refs/heads/claims/issue-${number}--`,
);
if (legacy.length && command !== "status")
  throw new Error(
    "Reserva legada ativa. Verifique dono/processo/PR e migre manualmente antes de continuar.",
  );
let previousRef = null;
try {
  previousRef = await request(`${repoPath}/git/ref/${ref}`);
} catch (error) {
  if (error.status !== 404) throw error;
}
let previous = null;
if (previousRef) {
  const commit = await request(
    `${repoPath}/git/commits/${previousRef.object.sha}`,
  );
  const tree = await request(`${repoPath}/git/trees/${commit.tree.sha}`);
  const file = tree.tree.find((f) => f.path === "agent-session.json");
  if (!file)
    throw new Error("Reserva sem ledger: recuperação manual obrigatória.");
  const blob = await request(`${repoPath}/git/blobs/${file.sha}`);
  previous = JSON.parse(Buffer.from(blob.content, "base64").toString("utf8"));
}
const dependencies = await graphql(
  `
    query ($id: ID!) {
      node(id: $id) {
        ... on Issue {
          blockedBy(first: 100) {
            pageInfo {
              hasNextPage
            }
            nodes {
              number
              state
            }
          }
        }
      }
    }
  `,
  { id: issue.node_id },
);
const blockers = dependencies.node.blockedBy.nodes.filter(
  (d) => d.state === "OPEN",
);
if (dependencies.node.blockedBy.pageInfo.hasNextPage)
  throw new Error(
    "Dependências truncadas; operação recusada para não ignorar bloqueadores.",
  );
if (command === "status") {
  console.log(
    JSON.stringify(
      {
        issue: number,
        active: previous?.active ?? null,
        activity: activityStatus(previous),
        lastActivityAt: previous?.lastActivityAt ?? null,
        legacy: legacy.map((r) => r.ref),
        pendingMirror: previous?.pendingMirror ?? null,
        blockedBy: blockers,
        available:
          issue.state === "open" &&
          !previous?.active &&
          !previous?.pendingMirror &&
          !legacy.length &&
          !blockers.length,
        sessions: previous?.sessions ?? [],
      },
      null,
      2,
    ),
  );
  process.exit(0);
}
const authenticated = process.env.GITHUB_ACTIONS
  ? await request(
      `/users/${encodeURIComponent(process.env.GITHUB_ACTOR ?? "")}`,
    )
  : await request("/user");
const actor = authenticated.login;
if (!actor) throw new Error("Ator não identificado.");
const permission = await request(
  `${repoPath}/collaborators/${encodeURIComponent(actor)}/permission`,
);
if (!["admin", "maintain", "write"].includes(permission.permission))
  throw new Error("Ator sem permissão de escrita no repositório.");
const executor = executors.find((e) => e.executorId === flag("executor"));
if (!executor || executor.operadorHumano !== actor)
  throw new Error("Executor não cadastrado para este operador humano.");
if (["claim", "start", "resume"].includes(command)) {
  if (issue.state !== "open")
    throw new Error("Issue fechada não pode iniciar execução.");
  if (blockers.length)
    throw new Error(
      `Dependências abertas: ${blockers.map((d) => `#${d.number}`).join(", ")}`,
    );
}
if (command === "block" && !flag("reason"))
  throw new Error("Bloqueio exige --reason.");
if (
  command === "done" &&
  (authenticated.type !== "User" || values["human-approved"] !== true)
)
  throw new Error(
    "Conclusão exige usuário humano autenticado e --human-approved.",
  );
if (command === "done") {
  const children = await pages(`${repoPath}/issues/${number}/sub_issues`);
  if (children.some((child) => child.state !== "closed"))
    throw new Error("Agrupador possui filhos abertos; não pode concluir.");
}
const session = flag("session") ?? (command === "claim" ? randomUUID() : null);
if (!session)
  throw new Error(
    "--session obrigatório para modificar uma reserva existente.",
  );
const event = {
  action: command,
  session,
  executorId: executor.executorId,
  executor,
  actor,
  at: new Date().toISOString(),
  branch: flag("branch") ?? null,
  reason: flag("reason") ?? null,
  pr: flag("pr") ?? null,
  commit: flag("commit") ?? null,
  tests: flag("tests") ?? null,
  humanApproved: values["human-approved"] === true,
};
if (
  event.branch &&
  !/^(feat|fix|chore|docs|refactor)\/[a-z0-9._-]+$/.test(event.branch)
)
  throw new Error("Branch inválida.");
const project = await projectContext(); // fail before reserving if Projects access is absent
const item = await itemFor(project, issue.node_id);
const liveItems = await projectItems(project);
const projectItem = liveItems.find((candidate) => candidate.content?.number === number);
if (!projectItem) throw new Error(`Issue #${number} não foi lida do Project após inclusão.`);
const fieldValue = (fieldName) => {
  const value = projectItem.fieldValues.nodes.find((candidate) => candidate.field?.name === fieldName);
  return value?.date ?? value?.name ?? value?.text ?? value?.options?.map((option) => option.name) ?? null;
};
const effectiveActionForSchedule = command === "repair"
  ? previous?.sessions?.at(-1)?.events?.at(-1)?.action
  : command;
const statusAfter = {
  claim: "Reservado", start: "Em Andamento", resume: "Em Andamento",
  block: "Bloqueado", review: "Em Revisão", done: "Concluído",
}[effectiveActionForSchedule] ?? fieldValue("Status") ?? "Backlog";
if (statusAfter !== "Backlog") {
  const startField = manifest.dateFields?.start ?? "Início";
  const targetField = manifest.dateFields?.target ?? "Entrega";
  const existingStart = fieldValue(startField);
  const existingTarget = fieldValue(targetField);
  if (Boolean(existingStart) !== Boolean(existingTarget))
    throw new Error(`Agenda incompleta em #${number}; preserve a data existente e complete ${startField}/${targetField} antes da operação.`);
  let start = existingStart;
  let target = existingTarget;
  let proposed = false;
  if (!start && !target) {
    if (Boolean(flag("start-date")) !== Boolean(flag("target-date")))
      throw new Error("Informe --start-date e --target-date em conjunto.");
    if (flag("start-date")) {
      start = flag("start-date");
      target = flag("target-date");
    } else {
      const primaryCode = issue.title.match(/^\[ETAPA \d+\] \[([A-Z]+)\]/)?.[1]
        ?? manifest.operationalTasks?.find((task) => task.issue === number)?.tipo;
      if (!primaryCode) throw new Error(`Tipo principal não identificado para propor datas em #${number}.`);
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Belem", year: "numeric", month: "2-digit", day: "2-digit",
      }).formatToParts(new Date());
      const today = `${parts.find((part) => part.type === "year").value}-${parts.find((part) => part.type === "month").value}-${parts.find((part) => part.type === "day").value}`;
      const dependenciesWithDates = projectItem.content.blockedBy.nodes.map((dependency) => {
        const blocked = liveItems.find((candidate) => candidate.content?.number === dependency.number);
        return blocked?.fieldValues.nodes.find((value) => value.field?.name === targetField)?.date
          ?? (blocked?.content?.state === "CLOSED" ? blocked.content.closedAt?.slice(0, 10) : null);
      });
      if (dependenciesWithDates.some((date) => !date))
        throw new Error(`Dependência sem Entrega planejada; não é possível propor datas para #${number}.`);
      const ledger = await readLedger(number);
      const actualStart = ledger?.sessions?.flatMap((current) => current.events ?? [])
        .find((entry) => entry.action === "start")?.at?.slice(0, 10);
      const schedule = proposeSchedule({
        today: actualStart ?? today,
        type: primaryCode,
        title: issue.title,
        dependencyTargets: dependenciesWithDates,
      });
      start = actualStart ?? schedule.start;
      target = schedule.target;
      proposed = !actualStart;
    }
    validateSchedule(statusAfter, start, target);
    await setField(project, item, startField, start);
    await setField(project, item, targetField, target);
    const refreshed = await projectItems(project);
    const savedItem = refreshed.find((candidate) => candidate.content?.number === number);
    const saved = Object.fromEntries(savedItem.fieldValues.nodes
      .filter((value) => [startField, targetField].includes(value.field?.name))
      .map((value) => [value.field.name, value.date]));
    validateSchedule(statusAfter, saved[startField], saved[targetField]);
    if (proposed) {
      const marker = `<!-- roadmap-estimate:${number} -->`;
      const comments = await pages(`${repoPath}/issues/${number}/comments`);
      if (!comments.some((comment) => comment.body.includes(marker)))
        await request(`${repoPath}/issues/${number}/comments`, "POST", {
          body: `${marker}\nPlanejamento **estimado**, não é prazo prometido pelo responsável. Início: ${saved[startField]}; entrega proposta: ${saved[targetField]}. Estimativa baseada no tipo ${primaryCode}, no escopo do título e no término das dependências; datas existentes são preservadas. Fuso do calendário: America/Belem.`,
        });
    }
  } else {
    validateSchedule(statusAfter, start, target);
  }
}
const next =
  command === "repair"
    ? structuredClone(previous)
    : transition(previous, event);
if (next) {
  const participantValue = await graphql(
    `
      query ($id: ID!) {
        node(id: $id) {
          ... on ProjectV2Item {
            fieldValueByName(name: "Agentes que participaram") {
              ... on ProjectV2ItemFieldTextValue {
                text
              }
              ... on ProjectV2ItemFieldMultiSelectValue {
                options {
                  name
                }
              }
            }
          }
        }
      }
    `,
    { id: item },
  );
  next.historicalParticipants = [
    ...new Set([
      ...(next.historicalParticipants ?? []),
      ...(participantValue.node.fieldValueByName?.text ?? "")
        .split(", ")
        .filter(Boolean),
      ...(participantValue.node.fieldValueByName?.options ?? []).map(
        (option) => option.name,
      ),
    ]),
  ];
}
if (
  command === "repair" &&
  (!previous?.sessions?.length ||
    ["session", "executorId", "actor"].some(
      (k) => (previous.active ?? previous.sessions.at(-1))[k] !== event[k],
    ))
)
  throw new Error("Repair exige propriedade da última sessão.");
let ledgerSha = previousRef?.object.sha;
if (
  command === "repair" &&
  previous.pendingMirror &&
  (!values.recover || !flag("reason"))
)
  throw new Error(
    "Espelho pendente: confirme que o processo anterior terminou e use repair --recover --reason com a evidência.",
  );
if (values["cancel-pending"]) {
  if (
    command !== "repair" ||
    !values.recover ||
    !flag("reason") ||
    !previous.pendingMirror ||
    previous.sessions.at(-1).events.at(-1).action !== "done"
  )
    throw new Error(
      "Cancelar projeção exige repair --recover --cancel-pending --reason e conclusão pendente.",
    );
  next.sessions.at(-1).events.push({
    ...event,
    action: "review",
    reopenIssue: true,
    reason: `Projeção de conclusão cancelada: ${event.reason}`,
  });
  next.revision += 1;
}
{
  const operation = {
    operationId: randomUUID(),
    session,
    actor,
    executorId: executor.executorId,
    at: event.at,
    reason: event.reason,
  };
  next.pendingMirror = operation;
  if (command === "repair")
    next.recoveryEvents = [
      ...(next.recoveryEvents ?? []),
      { ...operation, previousPending: previous.pendingMirror ?? null },
    ];
  try {
    ledgerSha = await writeLedger(
      ref,
      next,
      ledgerSha,
      `agents: ${command} issue #${number} session ${session}`,
    );
  } catch (error) {
    throw new Error(
      `Concorrência: operação recusada (${error.message}). Consulte status.`,
    );
  }
}
// Ledger is authoritative; mirror failures preserve the lock and can be retried with repair.
const latest = next.sessions.at(-1);
const effectiveAction =
  command === "repair" ? latest.events.at(-1).action : command;
const mirrorEvent = latest.events.at(-1);
const statuses = {
  claim: "Reservado",
  start: "Em Andamento",
  resume: "Em Andamento",
  block: "Bloqueado",
  review: "Em Revisão",
  done: "Concluído",
};
try {
  if (mirrorEvent.reopenIssue)
    await request(`${repoPath}/issues/${number}`, "PATCH", { state: "open" });
  if (effectiveAction === "done") {
    if (
      !mirrorEvent.humanApproved ||
      !mirrorEvent.pr ||
      !mirrorEvent.commit ||
      !mirrorEvent.tests
    )
      throw new Error("Conclusão sem aprovação/evidências no ledger.");
    const children = await pages(`${repoPath}/issues/${number}/sub_issues`);
    if (children.some((child) => child.state !== "closed"))
      throw new Error(
        "Agrupador possui filhos abertos; não pode concluir/reparar conclusão.",
      );
  }
  if (!issue.assignees.length)
    await request(`${repoPath}/issues/${number}/assignees`, "POST", {
      assignees: [executor.operadorHumano],
    });
  if (next.active)
    await request(`${repoPath}/issues/${number}/labels`, "POST", {
      labels: ["agent-claim"],
    });
  else {
    try {
      await request(
        `${repoPath}/issues/${number}/labels/agent-claim`,
        "DELETE",
      );
    } catch (error) {
      if (error.status !== 404) throw error;
    }
  }
  await setField(
    project,
    item,
    "Agente executando",
    next.active ? executor.nomeExibido : null,
  );
  await setField(
    project,
    item,
    "Agentes que participaram",
    [...new Set([
        ...next.historicalParticipants,
        ...next.participants.map(
          (id) => executors.find((e) => e.executorId === id)?.nomeExibido ?? id,
        ),
      ])]
      .map((name) => executorLabel.get(name))
      .filter((name) => project.fields.nodes.find((field) => field.name === "Agentes que participaram")?.options.some((option) => option.name === name)),
  );
  if (statuses[effectiveAction])
    await setField(project, item, "Status", statuses[effectiveAction]);
  if (effectiveAction === "release") {
    // Preserve review/completion/block; release only resets reservation/in-progress.
    const value = await graphql(
      `
        query ($id: ID!) {
          node(id: $id) {
            ... on ProjectV2Item {
              fieldValueByName(name: "Status") {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                }
              }
            }
          }
        }
      `,
      { id: item },
    );
    if (
      ["Reservado", "Em Andamento"].includes(value.node.fieldValueByName?.name)
    )
      await setField(
        project,
        item,
        "Status",
        issue.state === "closed" ? "Concluído" : "A Fazer",
      );
  }
  if (effectiveAction === "done") {
    await request(`${repoPath}/issues/${number}`, "PATCH", {
      state: "closed",
      state_reason: "completed",
    });
  }
  const marker = `<!-- agent-session:${session}:revision:${next.revision} -->`;
  const comments = await pages(`${repoPath}/issues/${number}/comments`);
  if (!comments.some((c) => c.body.includes(marker)))
    await request(`${repoPath}/issues/${number}/comments`, "POST", {
      body: `${marker}\n**Sessão ${session} — ${effectiveAction}**\nExecutor: ${executor.nomeExibido}; operador: @${actor}; modelo: ${executor.modelo ?? "Não disponível"}.\nInício: ${latest.startedAt}; fim: ${latest.endedAt ?? "em aberto"}; tempo decorrido: ${latest.elapsedSeconds ?? "em aberto"} s; tempo ativo/tokens/custo: Não disponível.\nResultado: ${mirrorEvent.reason ?? effectiveAction}.\nCommit: ${mirrorEvent.commit ?? "Não disponível"}; PR: ${mirrorEvent.pr ?? "Não disponível"}; testes: ${mirrorEvent.tests ?? "Não disponível"}.\nHistórico persistente: [ledger e eventos](https://github.com/${process.env.PROJECT_OWNER ?? "idedigitalbr"}/loja-comercial-do-norte/commits/claims/issue-${number}).`,
    });
  const settled = structuredClone(next);
  delete settled.pendingMirror;
  await writeLedger(
    ref,
    settled,
    ledgerSha,
    `agents: espelho confirmado issue #${number} revision ${next.revision}`,
  );
} catch (error) {
  console.error(
    `Ledger salvo; espelho pendente: ${error.message}. Após confirmar que este processo encerrou, execute repair --recover --reason com a mesma sessão.`,
  );
  process.exitCode = 1;
}
console.log(
  JSON.stringify(
    {
      issue: number,
      action: command,
      session,
      active: next.active,
      revision: next.revision,
      ref: `refs/${ref}`,
    },
    null,
    2,
  ),
);
