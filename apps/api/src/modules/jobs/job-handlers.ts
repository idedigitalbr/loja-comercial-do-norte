import { JobType } from '@prisma/client';

export type JobHandler = (payload: unknown) => Promise<void>;

export const jobHandlers: Record<JobType, JobHandler> = {
  RELEASE_EXPIRED_RESERVATIONS: async () => undefined,
  RECONCILE_PAYMENT: async () => undefined,
  SEND_TRANSACTIONAL_EMAIL: async () => undefined,
  GENERATE_REPORT: async () => undefined,
  CLEAN_EXPIRED_CARTS: async () => undefined,
};
