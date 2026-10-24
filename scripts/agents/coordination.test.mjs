import { test } from "node:test";
import assert from "node:assert/strict";

const core = await import("./coordination.mjs").catch(() => ({}));

test("duas sessões concorrentes têm somente um vencedor por Issue", async () => {
  assert.equal(typeof core.transition, "function");
  const initial = { revision: 0, active: null, sessions: [], participants: [] };
  const a = core.transition(initial, {
    action: "claim",
    session: "a",
    executorId: "codex-will",
    actor: "will",
    at: "2026-10-24T20:00:00Z",
  });
  assert.throws(
    () =>
      core.transition(a, {
        action: "claim",
        session: "b",
        executorId: "claude-will",
        actor: "will",
      }),
    /reservada/,
  );
});

test("mesma ferramenta não autoriza outra sessão nem outro operador", () => {
  assert.equal(typeof core.transition, "function");
  const state = core.transition(null, {
    action: "claim",
    session: "a",
    executorId: "codex-will",
    actor: "will",
    at: "2026-10-24T20:00:00Z",
  });
  for (const patch of [
    { session: "b" },
    { actor: "other" },
    { executorId: "claude-will" },
  ]) {
    assert.throws(
      () =>
        core.transition(state, {
          action: "release",
          session: "a",
          executorId: "codex-will",
          actor: "will",
          ...patch,
        }),
      /propriedade/,
    );
  }
});

test("release preserva histórico e duração sem inventar tempo ativo ou tokens", () => {
  assert.equal(typeof core.transition, "function");
  const event = {
    session: "a",
    executorId: "codex-will",
    actor: "will",
    at: "2026-10-24T20:00:00Z",
  };
  const state = core.transition(null, { ...event, action: "claim" });
  const started = core.transition(state, { ...event, action: "start", at: "2026-10-24T20:00:10Z" });
  const ended = core.transition(started, {
    ...event,
    action: "release",
    at: "2026-10-24T20:01:00Z",
  });
  assert.equal(ended.active, null);
  assert.equal(ended.sessions[0].elapsedSeconds, 60);
  assert.equal(ended.sessions[0].tokens, null);
  assert.equal(ended.sessions[0].activeSeconds, null);
  assert.deepEqual(ended.participants, ["codex-will"]);
  assert.equal(started.sessions[0].events.length, 2);
  assert.equal(ended.sessions[0].events.length, 3);
});

test("claim não atribui participação; start e heartbeat registram atividade sem expirar reserva", () => {
  assert.equal(typeof core.activityStatus, "function");
  const event = { session: "a", executorId: "codex-will", actor: "will", at: "2026-10-24T20:00:00Z" };
  const claimed = core.transition(null, { ...event, action: "claim" });
  assert.deepEqual(claimed.participants, []);
  assert.equal(claimed.sessions[0].startedAt, null);
  const started = core.transition(claimed, { ...event, action: "start", at: "2026-10-24T20:01:00Z" });
  assert.deepEqual(started.participants, ["codex-will"]);
  const heartbeat = core.transition(started, { ...event, action: "heartbeat", at: "2026-10-24T20:02:00Z" });
  assert.equal(heartbeat.lastActivityAt, "2026-10-24T20:02:00Z");
  assert.equal(heartbeat.active.session, "a");
  assert.equal(core.activityStatus(heartbeat, "2026-10-24T20:31:00Z"), "atividade_recente");
  assert.equal(core.activityStatus(heartbeat, "2026-10-24T20:33:00Z"), "atividade_nao_confirmada");
  assert.equal(core.activityStatus({ active: null }, "2026-10-24T20:33:00Z"), "finalizada");
});

test("ciclos longos e dependências inexistentes são recusados antes de escrever", () => {
  assert.equal(typeof core.validateDependencies, "function");
  assert.throws(
    () =>
      core.validateDependencies([
        { id: "a", deps: ["b"] },
        { id: "b", deps: ["c"] },
        { id: "c", deps: ["a"] },
      ]),
    /ciclo/,
  );
  assert.throws(
    () => core.validateDependencies([{ id: "a", deps: ["missing"] }]),
    /inexistente/,
  );
});

test("conclusão exige aprovação humana e evidências", () => {
  assert.equal(typeof core.transition, "function");
  const event = {
    session: "a",
    executorId: "codex-will",
    actor: "will",
    at: "2026-10-24T20:00:00Z",
  };
  const state = core.transition(null, { ...event, action: "claim" });
  assert.throws(
    () => core.transition(state, { ...event, action: "done" }),
    /humana/,
  );
  assert.throws(
    () =>
      core.transition(state, { ...event, action: "done", humanApproved: true }),
    /evid/,
  );
});

test("espelho pendente bloqueia nova sessão até concluir o reparo", () => {
  const state = {
    revision: 1,
    active: null,
    sessions: [],
    participants: [],
    pendingMirror: { session: "old" },
  };
  assert.throws(
    () =>
      core.transition(state, {
        action: "claim",
        actor: "will",
        executorId: "codex-will",
        session: "new",
      }),
    /espelho/,
  );
});

test("ciclos que passam por Issue externa ao Project são detectados", async () => {
  assert.equal(typeof core.completeGraph, "function");
  const graph = await core.completeGraph(
    [
      { id: "A", deps: ["outside"] },
      { id: "B", deps: ["A"] },
    ],
    async (id) => ({ id, deps: ["B"] }),
  );
  assert.throws(() => core.validateDependencies(graph), /ciclo/);
});

test("valor textual de teste não se transforma em aprovação humana", async () => {
  const parser = await import("./arguments.mjs").catch(() => ({}));
  assert.equal(typeof parser.parseCommand, "function");
  const result = parser.parseCommand([
    "done",
    "--tests=--human-approved",
    "--issue=48",
  ]);
  assert.equal(result.values["human-approved"], undefined);
  assert.equal(result.values.tests, "--human-approved");
});
