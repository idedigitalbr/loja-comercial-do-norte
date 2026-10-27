#!/usr/bin/env node
import {
  request,
  pages,
  repoPath,
  manifest,
  projectContext,
  projectItems,
} from "./github.mjs";
const n = Number(process.env.PR_NUMBER);
if (!Number.isSafeInteger(n) || n < 1) throw new Error("PR_NUMBER inválido.");
const pr = await request(`${repoPath}/pulls/${n}`);
if (pr.head.repo?.full_name !== manifest.repository)
  throw new Error("PR de fork não pode controlar tarefas.");
const actor = await request(
  `${repoPath}/collaborators/${encodeURIComponent(pr.user.login)}/permission`,
);
if (!["write", "maintain", "admin"].includes(actor.permission))
  throw new Error("Autor do PR sem permissão.");
const code = pr.head.ref
  .match(/^(?:feat|fix|chore|docs|refactor)\/([a-f][0-9]+)-/i)?.[1]
  ?.toUpperCase();
const task = manifest.tasks.find((t) => t.id === code);
const issues = (await pages(`${repoPath}/issues?state=all`)).filter(
  (i) => !i.pull_request,
);
let issue = task
  ? issues.find(
      (i) =>
        i.title ===
        `[${task.etapa.replace("Etapa ", "ETAPA ")}] [${task.tipo}] ${task.titulo}`,
    )
  : null;
// Explicit maintenance mapping; never infer arbitrary issue numbers from untrusted PR text.
if (pr.head.ref === "chore/multiagent-coordination")
  issue = issues.find((i) => i.number === 48);
if (!issue) {
  console.log("PR sem tarefa conhecida; nenhuma alteração.");
  process.exit(0);
}
if (issue.state === "closed") {
  console.log(
    "Issue fechada: status preservado; nenhuma conclusão automática.",
  );
  process.exit(0);
}
const project = await projectContext();
const items = await projectItems(project);
const item = items.find((i) => i.content?.number === issue.number);
if (!item) throw new Error("Issue fora do Project oficial.");
// Active lease on another branch takes precedence over stale PR events.
let ledger = null;
try {
  ledger = await readLedger(issue.number);
} catch {
  // ignore
}
const branch = ledger?.active ? ledger.sessions.at(-1).branch : null;
if (branch && branch !== pr.head.ref)
  throw new Error("Reserva ativa pertence a outra branch.");
const marker = `<!-- agent-pr:${n}:${pr.head.sha}:${pr.state}:${pr.merged_at ?? "unmerged"} -->`;
const comments = await pages(`${repoPath}/issues/${issue.number}/comments`);
// PR observations do not own the execution lease. Only /review with its session changes Status.
if (!comments.some((c) => c.body.includes(marker)))
  await request(`${repoPath}/issues/${issue.number}/comments`, "POST", {
    body: `${marker}\nPR [#${n}](${pr.html_url}) — ${pr.merged_at ? "mesclado, aguardando validação humana" : pr.state === "open" ? "aberto para revisão" : "fechado sem merge; reserva e progresso preservados"}.\nCommit: ${pr.head.sha}. Status preservado: use /review com a sessão proprietária. CI não conclui a tarefa e não libera a reserva. Evidências completas na sessão e no PR.`,
  });
console.log(
  JSON.stringify({
    issue: issue.number,
    pr: n,
    state: pr.state,
    merged: !!pr.merged_at,
    humanReviewRequired: true,
  }),
);
