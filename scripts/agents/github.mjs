import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

export const manifest = JSON.parse(
  readFileSync(new URL("./tasks.json", import.meta.url), "utf8"),
);
export const repoPath = `/repos/${manifest.repository}`;
let cachedToken;
function token(project) {
  if (project && process.env.PROJECT_TOKEN) return process.env.PROJECT_TOKEN;
  cachedToken ??=
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    (!process.env.CI
      ? execFileSync("gh", ["auth", "token"], {
          encoding: "utf8",
          windowsHide: true,
        }).trim()
      : null);
  if (!cachedToken)
    throw new Error(
      "Autenticação ausente. Configure GITHUB_TOKEN e PROJECT_TOKEN no Actions.",
    );
  return cachedToken;
}
export async function request(path, method = "GET", body, project = false) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token(project)}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.text();
  const data = result ? JSON.parse(result) : null;
  if (!response.ok) {
    const error = new Error(
      `GitHub ${method} ${path}: ${response.status} ${data?.message ?? ""}`,
    );
    error.status = response.status;
    throw error;
  }
  return data;
}
export async function graphql(query, variables = {}) {
  const payload = await request("/graphql", "POST", { query, variables }, true);
  if (payload.errors?.length)
    throw new Error(payload.errors.map((e) => e.message).join(" | "));
  return payload.data;
}
export async function pages(path) {
  const all = [];
  for (let page = 1; ; page++) {
    const batch = await request(
      `${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`,
    );
    all.push(...batch);
    if (batch.length < 100) return all;
  }
}
export async function projectContext() {
  const data = await graphql(
    `
      query ($owner: String!, $number: Int!) {
        organization(login: $owner) {
          projectV2(number: $number) {
            id
            title
            fields(first: 60) {
              nodes {
                ... on ProjectV2FieldCommon {
                  id
                  name
                }
                ... on ProjectV2SingleSelectField {
                  options {
                    id
                    name
                    color
                    description
                  }
                }
              }
            }
            views(first: 30) {
              nodes {
                id
                name
                layout
                filter
                configuration {
                  visibleFields(first: 50) {
                    nodes {
                      ... on ProjectV2FieldCommon {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    { owner: manifest.projectOwner, number: manifest.projectNumber },
  );
  return data.organization.projectV2;
}
export async function projectItems(project) {
  const all = [];
  let cursor = null;
  do {
    const data = await graphql(
      `
        query ($id: ID!, $cursor: String) {
          node(id: $id) {
            ... on ProjectV2 {
              items(first: 100, after: $cursor) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  content {
                    ... on Issue {
                      id
                      number
                      title
                      state
                      assignees(first: 20) {
                        nodes {
                          login
                        }
                      }
                      parent {
                        number
                      }
                      subIssuesSummary {
                        total
                        completed
                        percentCompleted
                      }
                      blockedBy(first: 100) {
                        pageInfo {
                          hasNextPage
                        }
                        nodes {
                          id
                          number
                          state
                        }
                      }
                    }
                  }
                  fieldValues(first: 60) {
                    nodes {
                      ... on ProjectV2ItemFieldSingleSelectValue {
                        name
                        optionId
                        field {
                          ... on ProjectV2FieldCommon {
                            id
                            name
                          }
                        }
                      }
                      ... on ProjectV2ItemFieldTextValue {
                        text
                        field {
                          ... on ProjectV2FieldCommon {
                            id
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      { id: project.id, cursor },
    );
    const batch = data.node.items;
    if (
      batch.nodes.some((item) => item.content?.blockedBy?.pageInfo.hasNextPage)
    )
      throw new Error(
        "Dependências truncadas: recusar operação até leitura completa do grafo.",
      );
    all.push(...batch.nodes);
    cursor = batch.pageInfo.hasNextPage ? batch.pageInfo.endCursor : null;
  } while (cursor);
  return all;
}
export async function setField(project, itemId, name, value) {
  const field = project.fields.nodes.find((f) => f.name === name);
  if (!field) throw new Error(`Campo ausente: ${name}`);
  if (value === null)
    return graphql(
      `
        mutation ($input: ClearProjectV2ItemFieldValueInput!) {
          clearProjectV2ItemFieldValue(input: $input) {
            projectV2Item {
              id
            }
          }
        }
      `,
      { input: { projectId: project.id, itemId, fieldId: field.id } },
    );
  const option = field.options?.find((o) => o.name === value);
  if (field.options && !option)
    throw new Error(`Opção ausente: ${name}=${value}`);
  return graphql(
    `
      mutation ($input: UpdateProjectV2ItemFieldValueInput!) {
        updateProjectV2ItemFieldValue(input: $input) {
          projectV2Item {
            id
          }
        }
      }
    `,
    {
      input: {
        projectId: project.id,
        itemId,
        fieldId: field.id,
        value: option ? { singleSelectOptionId: option.id } : { text: value },
      },
    },
  );
}
export async function itemFor(project, issueId) {
  const data = await graphql(
    `
      mutation ($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(
          input: { projectId: $projectId, contentId: $contentId }
        ) {
          item {
            id
          }
        }
      }
    `,
    { projectId: project.id, contentId: issueId },
  );
  return data.addProjectV2ItemById.item.id;
}

export async function dependencyNode(id) {
  const data = await graphql(
    `
      query ($id: ID!) {
        node(id: $id) {
          ... on Issue {
            id
            blockedBy(first: 100) {
              pageInfo {
                hasNextPage
              }
              nodes {
                id
              }
            }
          }
        }
      }
    `,
    { id },
  );
  if (!data.node?.blockedBy || data.node.blockedBy.pageInfo.hasNextPage)
    throw new Error(`Grafo de dependências incompleto: ${id}`);
  return { id, deps: data.node.blockedBy.nodes.map((node) => node.id) };
}

export async function writeLedger(ref, state, parent, message) {
  const base =
    parent ?? (await request(`${repoPath}/git/ref/heads/main`)).object.sha;
  const parentCommit = await request(`${repoPath}/git/commits/${base}`);
  const blob = await request(`${repoPath}/git/blobs`, "POST", {
    content: JSON.stringify(state, null, 2),
    encoding: "utf-8",
  });
  const tree = await request(`${repoPath}/git/trees`, "POST", {
    base_tree: parentCommit.tree.sha,
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
    message,
    tree: tree.sha,
    parents: [base],
  });
  if (parent)
    await request(`${repoPath}/git/refs/${ref}`, "PATCH", {
      sha: commit.sha,
      force: false,
    });
  else
    await request(`${repoPath}/git/refs`, "POST", {
      ref: `refs/${ref}`,
      sha: commit.sha,
    });
  return commit.sha;
}
