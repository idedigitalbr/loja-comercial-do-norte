import { test } from "node:test";
import assert from "node:assert/strict";

const fields = await import("./project-fields.mjs").catch(() => ({}));

test("serializa opções MULTI_SELECT por IDs, preservando ordem e removendo duplicatas", () => {
  assert.equal(typeof fields.serializeFieldValue, "function");
  assert.deepEqual(
    fields.serializeFieldValue(
      { dataType: "MULTI_SELECT", options: [{ id: "u", name: "UX" }, { id: "f", name: "FRONT" }] },
      ["FRONT", "UX", "FRONT"],
    ),
    { multiSelectOptionIds: ["f", "u"] },
  );
  assert.throws(
    () => fields.serializeFieldValue({ dataType: "MULTI_SELECT", options: [] }, ["MISSING"]),
    /opção desconhecida/i,
  );
});

test("serializa DATE como calendário ISO sem converter fuso", () => {
  assert.deepEqual(
    fields.serializeFieldValue({ dataType: "DATE" }, "2026-10-24"),
    { date: "2026-10-24" },
  );
  assert.throws(
    () => fields.serializeFieldValue({ dataType: "DATE" }, "2026-02-30"),
    /data ISO/i,
  );
});

test("exige início e entrega ordenados fora do Backlog", () => {
  assert.equal(typeof fields.validateSchedule, "function");
  assert.doesNotThrow(() => fields.validateSchedule("Backlog", null, null));
  assert.throws(() => fields.validateSchedule("Em Andamento", null, null), /obrigatórias/i);
  assert.throws(() => fields.validateSchedule("A Fazer", "2026-10-25", "2026-10-24"), /posterior/i);
});

test("agrega início e entrega das tarefas sem esconder filhos não planejados", () => {
  assert.equal(typeof fields.aggregateSchedule, "function");
  assert.deepEqual(
    fields.aggregateSchedule([
      { status: "Em Andamento", start: "2026-10-25", target: "2026-10-28" },
      { status: "Concluído", start: "2026-10-20", target: "2026-10-24" },
      { status: "Backlog", start: null, target: null },
    ]),
    { start: "2026-10-20", target: "2026-10-28", unplanned: 1 },
  );
});

test("propõe intervalo específico ao tipo e depois das dependências", () => {
  assert.equal(typeof fields.proposeSchedule, "function");
  assert.deepEqual(
    fields.proposeSchedule({
      today: "2026-10-24",
      type: "BUG",
      title: "Ajustar erro",
      dependencyTargets: ["2026-10-27"],
    }),
    { start: "2026-10-27", target: "2026-10-29" },
  );
});

test("desloca datas de calendário sem aplicar conversão de fuso", () => {
  assert.equal(typeof fields.shiftCalendarDays, "function");
  assert.equal(fields.shiftCalendarDays("2026-10-31", -3), "2026-10-28");
});
