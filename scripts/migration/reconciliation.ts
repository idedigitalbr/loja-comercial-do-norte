export type MigrationResult = { read: number; imported: number; rejected: number; rejectedIds: string[] };

export function reconcileMigration(input: { expected: number; result: MigrationResult }) {
  return { ...input.result, expected: input.expected, matchesExpected: input.result.imported === input.expected && input.result.rejected === 0 };
}
