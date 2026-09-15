import { ConflictException } from '@nestjs/common';

export type ExistingIdempotencyKey = {
  scope: string;
  responseJson: unknown;
};

export function assertIdempotencyScope(existing: ExistingIdempotencyKey | null | undefined, expectedScope: string): void {
  if (!existing) return;
  if (existing.scope !== expectedScope) throw new ConflictException('IDEMPOTENCY_KEY_REUSED');
  if (!existing.responseJson) throw new ConflictException('IDEMPOTENCY_KEY_IN_PROGRESS');
}
