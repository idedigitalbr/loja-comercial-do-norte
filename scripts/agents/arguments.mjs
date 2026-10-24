import { parseArgs } from "node:util";

export function parseCommand(args) {
  const command = args[0];
  const options = Object.fromEntries(
    [
      "issue",
      "executor",
      "session",
      "branch",
      "reason",
      "pr",
      "commit",
      "tests",
      "start-date",
      "target-date",
    ].map((name) => [name, { type: "string" }]),
  );
  options["human-approved"] = { type: "boolean" };
  options.recover = { type: "boolean" };
  options["cancel-pending"] = { type: "boolean" };
  const parsed = parseArgs({
    args: args.slice(1),
    options,
    strict: true,
    allowPositionals: false,
    tokens: true,
  });
  const names = parsed.tokens
    .filter((token) => token.kind === "option")
    .map((token) => token.name);
  if (new Set(names).size !== names.length) throw new Error("Opção duplicada.");
  return { command, values: parsed.values };
}
