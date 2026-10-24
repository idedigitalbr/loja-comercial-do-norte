/** Pure protocol rules; GitHub persistence is in github.mjs/task-claim.mjs. */
export function validateDependencies(tasks) {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (!byId.has(id)) throw new Error(`Dependência inexistente: ${id}`);
    if (visiting.has(id)) throw new Error(`Dependência contém ciclo: ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dep of byId.get(id).deps) visit(dep);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of byId.keys()) visit(id);
}

export function transition(previous, event) {
  const state = structuredClone(
    previous ?? { revision: 0, active: null, sessions: [], participants: [] },
  );
  if (state.pendingMirror)
    throw new Error(
      "Há espelho pendente; execute repair com a última sessão antes de modificar a reserva.",
    );
  if (!event.session || !event.actor || !event.executorId)
    throw new Error("Sessão, ator e executor obrigatórios.");
  if (event.action === "claim") {
    if (state.active)
      throw new Error(
        `Issue reservada pela sessão ${state.active.session}. Use renew para renovar.`,
      );
    if (state.sessions.some((s) => s.session === event.session))
      throw new Error("Identificador de sessão já utilizado.");
    state.active = {
      session: event.session,
      executorId: event.executorId,
      actor: event.actor,
    };
    state.sessions.push({
      ...state.active,
      executor: event.executor,
      branch: event.branch ?? null,
      startedAt: event.at,
      endedAt: null,
      elapsedSeconds: null,
      activeSeconds: null,
      tokens: null,
      cost: null,
      provider: null,
      events: [],
    });
    state.participants = [
      ...new Set([...state.participants, event.executorId]),
    ];
  } else if (
    !state.active ||
    ["session", "executorId", "actor"].some(
      (key) => state.active[key] !== event[key],
    )
  ) {
    throw new Error(
      "Falha de propriedade: executor, ator e sessão devem coincidir com a reserva.",
    );
  }
  if (event.action === "done" && !event.humanApproved)
    throw new Error("Conclusão exige aprovação humana explícita.");
  if (event.action === "done" && (!event.pr || !event.tests || !event.commit))
    throw new Error("Conclusão exige evidências: PR, commit e testes.");
  const session = state.sessions.at(-1);
  session.events.push(event);
  if (event.action === "release") {
    session.endedAt = event.at;
    session.elapsedSeconds = Math.max(
      0,
      (Date.parse(event.at) - Date.parse(session.startedAt)) / 1000,
    );
    session.result = event.reason ?? "Liberada";
    state.active = null;
  }
  state.revision += 1;
  return state;
}

export async function completeGraph(initial, load) {
  const graph = new Map(
    initial.map((node) => [node.id, structuredClone(node)]),
  );
  const queue = [...graph.keys()];
  for (let index = 0; index < queue.length; index++) {
    for (const id of graph.get(queue[index]).deps) {
      if (!graph.has(id)) {
        const node = await load(id);
        if (!node || node.id !== id || !Array.isArray(node.deps))
          throw new Error(`Grafo incompleto: ${id}`);
        graph.set(id, node);
        queue.push(id);
      }
    }
  }
  return [...graph.values()];
}
