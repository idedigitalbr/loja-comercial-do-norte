import { TrainingSessionStatus } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { TrainingsService } from './trainings.service';

describe('TrainingsService concurrency', () => {
  const prisma = new PrismaService();
  const service = new TrainingsService(prisma);
  let trainingId: string;
  let sessionId: string;
  let orderA: string;
  let orderB: string;

  beforeAll(async () => {
    await prisma.$connect();
    const training = await prisma.training.create({ data: { name: 'Teste de vagas', slug: `teste-vagas-${Date.now()}`, status: 'ACTIVE' } });
    trainingId = training.id;
    const session = await prisma.trainingSession.create({ data: { trainingId, startsAt: new Date(Date.now() + 86_400_000), endsAt: new Date(Date.now() + 90_000_000), location: 'Sala teste', capacity: 1, status: TrainingSessionStatus.OPEN } });
    sessionId = session.id;
    const first = await prisma.order.create({ data: { subtotalCents: 1000, totalCents: 1000, contactEmail: 'a@teste.local' } });
    const second = await prisma.order.create({ data: { subtotalCents: 1000, totalCents: 1000, contactEmail: 'b@teste.local' } });
    orderA = first.id;
    orderB = second.id;
  });

  afterAll(async () => {
    await prisma.enrollment.deleteMany({ where: { sessionId } });
    await prisma.order.deleteMany({ where: { id: { in: [orderA, orderB] } } });
    await prisma.trainingSession.delete({ where: { id: sessionId } });
    await prisma.training.delete({ where: { id: trainingId } });
    await prisma.$disconnect();
  });

  it('confirms only one reservation for the final seat', async () => {
    const results = await Promise.allSettled([
      service.reserveSeats({ sessionId, orderId: orderA, participantName: 'A', participantEmail: 'a@teste.local' }),
      service.reserveSeats({ sessionId, orderId: orderB, participantName: 'B', participantEmail: 'b@teste.local' }),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(await prisma.trainingSession.findUniqueOrThrow({ where: { id: sessionId } }).then((session) => session.reservedSeats)).toBe(1);
  });
});
