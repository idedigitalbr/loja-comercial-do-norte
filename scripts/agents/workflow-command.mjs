#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { request, repoPath } from "./github.mjs";
const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
const actor = event.sender?.login;
if (!actor || event.sender.type !== "User")
  throw new Error("Somente operadores humanos podem comandar sessões.");
const permission = await request(
  `${repoPath}/collaborators/${encodeURIComponent(actor)}/permission`,
);
if (!["admin", "maintain", "write"].includes(permission.permission))
  throw new Error("Ator sem permissão administrativa de execução.");
if (!process.env.PROJECT_TOKEN)
  throw new Error(
    "Configure PROJECT_TOKEN com acesso ao Project 3. GITHUB_TOKEN não é presumido suficiente.",
  );
let input;
if (process.env.GITHUB_EVENT_NAME === "issue_comment") {
  if (event.issue.pull_request) throw new Error("Comandos somente em Issues.");
  const line = event.comment.body.split(/\r?\n/)[0];
  const command = line.match(
    /^\/(claim|renew|start|pause|resume|block|review|release|repair|status)\b/,
  )?.[1];
  if (!command)
    throw new Error(
      "Comando inválido. done somente por workflow_dispatch com aprovação humana.",
    );
  input = { command, issue: String(event.issue.number) };
  const tail = line.slice(command.length + 1);
  const pattern =
    /\s+--(executor|session|branch|reason|pr|commit|tests)\s+(?:"([^"\r\n]*)"|([^\s]+))/g;
  let end = 0;
  let match;
  while ((match = pattern.exec(tail))) {
    if (tail.slice(end, match.index).trim())
      throw new Error("Argumento inválido.");
    if (input[match[1]] !== undefined) throw new Error("Argumento duplicado.");
    input[match[1]] = match[2] ?? match[3];
    end = pattern.lastIndex;
  }
  if (tail.slice(end).trim())
    throw new Error(
      "Argumento inválido. Use aspas duplas para texto com espaços.",
    );
} else input = event.inputs;
const args = [input.command];
for (const key of [
  "issue",
  "executor",
  "session",
  "branch",
  "reason",
  "pr",
  "commit",
  "tests",
])
  if (input[key]) args.push(`--${key}=${input[key]}`);
if (input.command === "done" && input.human_approved === "true")
  args.push("--human-approved");
if (input.command === "repair" && input.recover === "true")
  args.push("--recover");
if (input.command === "repair" && input.cancel_pending === "true")
  args.push("--cancel-pending");
const result = spawnSync(
  process.execPath,
  ["scripts/agents/task-claim.mjs", ...args],
  {
    stdio: "inherit",
    env: { ...process.env, GITHUB_ACTOR: actor },
    windowsHide: true,
  },
);
process.exit(result.status ?? 1);
