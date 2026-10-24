import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TrainingsService {
  constructor(private readonly prisma: PrismaService) {}

  async reserveSeats(input: { sessionId: string; orderId: string; participantName: string; participantEmail: string; participantPhone?: string }) {
    if (!input.participantName.trim() || !input.participantEmail.trim()) throw new BadRequestException('PARTICIPANT_DATA_REQUIRED');
    return this.prisma.$transaction(async (transaction) => {
      const changed = await transaction.$executeRaw`
        UPDATE "TrainingSession"
        SET "reservedSeats" = "reservedSeats" + 1, "updatedAt" = NOW()
        WHERE "id" = ${input.sessionId} AND "status" = 'OPEN'::"TrainingSessionStatus" AND "reservedSeats" < "capacity"
      `;
      if (changed !== 1) throw new BadRequestException('TRAINING_SEATS_UNAVAILABLE');
      return transaction.enrollment.create({ data: input });
    });
  }

  async getSession(publicId: string) {
    const session = await this.prisma.trainingSession.findUnique({ where: { publicId }, include: { training: true, batches: { orderBy: { startsAt: 'asc' } } } });
    if (!session) throw new NotFoundException('TRAINING_SESSION_NOT_FOUND');
    return { ...session, availableSeats: Math.max(session.capacity - session.reservedSeats, 0) };
  }

  createTraining(input: { name: string; slug: string; description?: string }) {
    return this.prisma.training.create({ data: input });
  }

  createSession(input: { trainingId: string; startsAt: Date; endsAt: Date; location: string; capacity: number }) {
    return this.prisma.trainingSession.create({ data: { ...input, status: 'OPEN' } });
  }
}
