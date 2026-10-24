#!/usr/bin/env node
/** Recovered Harness entry point; structure is now one non-destructive implementation. */
if (!process.argv.includes("--reconcile")) process.argv.push("--reconcile");
await import("./project-sync.mjs");
