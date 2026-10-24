#!/usr/bin/env node
/** Run only from workflow_dispatch; validates actual runner credentials without exposing them. */
import { projectContext, graphql } from "./github.mjs";
const report = {
  projectTokenConfigured: Boolean(process.env.PROJECT_TOKEN),
  githubTokenPresent: Boolean(process.env.GITHUB_TOKEN),
  read: false,
  write: false,
};
try {
  const project = await projectContext();
  if (!project) throw new Error("Project não visível para esta credencial.");
  report.read = true;
  // No-op update preserves the owner's exact title and proves write authorization.
  const result = await graphql(
    `
      mutation ($input: UpdateProjectV2Input!) {
        updateProjectV2(input: $input) {
          projectV2 {
            id
            title
          }
        }
      }
    `,
    { input: { projectId: project.id, title: project.title } },
  );
  if (result.updateProjectV2.projectV2.title !== project.title)
    throw new Error("Título divergente após no-op.");
  report.write = true;
} catch (error) {
  report.error = error.message;
  process.exitCode = 1;
}
console.log(JSON.stringify(report, null, 2));
