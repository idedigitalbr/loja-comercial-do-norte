#!/usr/bin/env node
/** Explicit live test on the operator's own maintenance reservation only. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { request, repoPath, writeLedger } from "./github.mjs";
import { transition } from "./coordination.mjs";
if (!process.argv.includes("--live") || !process.argv.includes("--issue-48"))
  throw Error(
    "Use --live --issue-48. Alvo exclusivo: a própria reserva de manutenção #48.",
  );
const path = `${repoPath}/git/refs/heads/claims/issue-48`;
async function load() {
  const ref = await request(`${repoPath}/git/ref/heads/claims/issue-48`);
  const commit = await request(`${repoPath}/git/commits/${ref.object.sha}`);
  const tree = await request(`${repoPath}/git/trees/${commit.tree.sha}`);
  const blob = await request(
    `${repoPath}/git/blobs/${tree.tree.find((f) => f.path === "agent-session.json").sha}`,
  );
  return {
    sha: ref.object.sha,
    state: JSON.parse(Buffer.from(blob.content, "base64").toString("utf8")),
  };
}
const actor = (await request("/user")).login;
let current = await load();
assert.equal(current.state.active?.actor, actor);
assert.equal(current.state.active?.executorId, "codex-will");
const executor = JSON.parse(
  readFileSync(new URL("./executors.json", import.meta.url), "utf8"),
)[0];
async function candidate(base, action, session, reason) {
  const event = {
    action,
    session,
    executorId: executor.executorId,
    executor,
    actor,
    at: new Date().toISOString(),
    branch: "chore/multiagent-coordination",
    reason,
  };
  const state = transition(base.state, event);
  const blob = await request(`${repoPath}/git/blobs`, "POST", {
    content: JSON.stringify(state, null, 2),
    encoding: "utf-8",
  });
  const tree = await request(`${repoPath}/git/trees`, "POST", {
    base_tree: (await request(`${repoPath}/git/commits/${base.sha}`)).tree.sha,
    tree: [
      {
        path: "agent-session.json",
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      },
    ],
  });
  const commit = await request(`${repoPath}/git/commits`, "POST", {
    message: `agents: teste real ${action} #48 ${reason}`,
    tree: tree.sha,
    parents: [base.sha],
  });
  return { sha: commit.sha, state };
}
async function publish(c) {
  await request(path, "PATCH", { sha: c.sha, force: false });
}
const session = current.state.active.session;
const siblings = await Promise.all([
  candidate(current, "renew", session, "CAS concorrente A"),
  candidate(current, "renew", session, "CAS concorrente B"),
]);
const results = await Promise.allSettled(siblings.map(publish));
assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
assert.equal(results.filter((r) => r.status === "rejected").length, 1);
console.log(
  "PASS API real: uma atualização concorrente aceita, uma recusada pelo servidor.",
);

current = await load();
const delayedRelease = await candidate(
  current,
  "release",
  session,
  "Liberação atrasada, não deve sobrescrever sucessor",
);
const realRelease = await candidate(
  current,
  "release",
  session,
  "Teste de release seguro e retomada após falha",
);
await publish(realRelease);
assert.equal((await load()).state.active, null);
current = await load();
const nextSession = `codex-recovery-verified-${Date.now()}`;
const resumed = await candidate(
  current,
  "claim",
  nextSession,
  "Retomada verificável após tombstone; espelho será reparado pela CLI",
);
await publish(resumed);
await assert.rejects(
  () => publish(delayedRelease),
  (e) => e.status === 422,
);
const final = await load();
assert.equal(final.state.active.session, nextSession);
assert.ok(final.state.sessions.some((s) => s.session === session && s.endedAt));
console.log(
  JSON.stringify(
    {
      test: "PASS API real: release atrasado recusado; histórico e nova sessão preservados",
      issue: 48,
      session: nextSession,
      revision: final.state.revision,
      repairRequired: true,
    },
    null,
    2,
  ),
);

if (process.argv.includes("--mirror-recovery")) {
  const before = await load();
  const released = transition(before.state, {
    action: "release",
    session: nextSession,
    executorId: executor.executorId,
    executor,
    actor,
    at: new Date().toISOString(),
    reason: "Teste explícito de falha antes de atualizar espelho",
  });
  released.pendingMirror = {
    operationId: randomUUID(),
    session: nextSession,
    actor,
    executorId: executor.executorId,
    at: new Date().toISOString(),
    reason: "Processo de teste encerra antes do espelho",
  };
  await writeLedger(
    "heads/claims/issue-48",
    released,
    before.sha,
    "agents: teste de interrupção controlada antes do espelho #48",
  );
  const cli = (...args) =>
    spawnSync(process.execPath, ["scripts/agents/task-claim.mjs", ...args], {
      encoding: "utf8",
      windowsHide: true,
    });
  const denied = cli(
    "claim",
    "--issue=48",
    "--executor=codex-will",
    "--session=must-not-acquire",
  );
  assert.notEqual(denied.status, 0);
  assert.match(denied.stderr, /espelho pendente/);
  const repaired = cli(
    "repair",
    "--issue=48",
    "--executor=codex-will",
    `--session=${nextSession}`,
    "--recover",
    "--reason=Interrupção simulada pelo teste terminou; processo anterior confirmado encerrado",
  );
  assert.equal(repaired.status, 0, repaired.stderr);
  const repairedState = (await load()).state;
  assert.equal(repairedState.pendingMirror, undefined);
  assert.equal(repairedState.active, null);
  assert.ok(
    repairedState.recoveryEvents.at(-1).reason.includes("Interrupção simulada"),
  );
  const finalSession = `codex-recovery-final-${Date.now()}`;
  const reclaimed = cli(
    "claim",
    "--issue=48",
    "--executor=codex-will",
    `--session=${finalSession}`,
    "--branch=chore/multiagent-coordination",
  );
  assert.equal(reclaimed.status, 0, reclaimed.stderr);
  assert.equal((await load()).state.active.session, finalSession);
  console.log(
    JSON.stringify(
      {
        test: "PASS API/CLI real: espelho pendente impediu sucessor; repair auditado liberou; novo claim confirmado",
        session: finalSession,
      },
      null,
      2,
    ),
  );
}
