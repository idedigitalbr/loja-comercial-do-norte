import { Inject, Injectable, Logger } from '@nestjs/common';
import { LeadStage, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AddLeadNoteDto, CreateCrmLeadDto, ListCrmLeadsQueryDto } from './crm.types';

export type InMemoryLead = {
  id: string;
  publicId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  preferredStore: string;
  storeId: string | null;
  subject: string;
  stage: LeadStage;
  origin: string;
  conversationLog: unknown;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  leadNotes: Array<{
    id: string;
    leadId: string;
    authorName: string;
    content: string;
    createdAt: Date;
  }>;
};

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);
  private readonly memoryLeads: Map<string, InMemoryLead> = new Map();

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createLead(input: CreateCrmLeadDto) {
    const publicId =
      input.publicId?.trim() ||
      `lead-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const conversationLog = input.conversationLog ?? [];

    try {
      // Se já existe um lead para esta sessão (publicId), atualiza-o com a última conversa para não duplicar no Kanban
      if (input.publicId?.trim() && typeof this.prisma.crmLead.findUnique === 'function') {
        const existing = await this.prisma.crmLead.findUnique({
          where: { publicId },
        });
        if (existing) {
          return await this.prisma.crmLead.update({
            where: { publicId },
            data: {
              customerName: input.customerName.trim(),
              customerPhone: input.customerPhone.trim(),
              customerEmail: input.customerEmail?.trim() || existing.customerEmail,
              preferredStore: input.preferredStore.trim(),
              storeId: input.storeId?.trim() || existing.storeId,
              subject: input.subject.trim(),
              notes: input.notes?.trim() || existing.notes,
              conversationLog: (conversationLog ?? []) as unknown as Prisma.InputJsonValue,
            },
            include: {
              leadNotes: {
                orderBy: { createdAt: 'desc' },
              },
            },
          });
        }
      }

      const created = await this.prisma.crmLead.create({
        data: {
          publicId,
          customerName: input.customerName.trim(),
          customerPhone: input.customerPhone.trim(),
          customerEmail: input.customerEmail?.trim() || null,
          preferredStore: input.preferredStore.trim(),
          storeId: input.storeId?.trim() || null,
          subject: input.subject.trim(),
          notes: input.notes?.trim() || null,
          conversationLog: (conversationLog ?? []) as unknown as Prisma.InputJsonValue,
          stage: LeadStage.NEW,
          origin: 'chat-norti',
        },
        include: {
          leadNotes: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return created;
    } catch (error) {
      this.logger.warn(`Prisma lead save failed, falling back to in-memory store: ${(error as Error).message}`);
      const existingMem = Array.from(this.memoryLeads.values()).find(
        (l) => l.publicId === publicId
      );
      if (existingMem) {
        existingMem.customerName = input.customerName.trim();
        existingMem.customerPhone = input.customerPhone.trim();
        existingMem.preferredStore = input.preferredStore.trim();
        existingMem.storeId = input.storeId?.trim() || existingMem.storeId;
        existingMem.subject = input.subject.trim();
        existingMem.conversationLog = conversationLog;
        existingMem.updatedAt = new Date();
        return existingMem;
      }
      const fallback: InMemoryLead = {
        id: `local-${Date.now()}`,
        publicId,
        customerName: input.customerName.trim(),
        customerPhone: input.customerPhone.trim(),
        customerEmail: input.customerEmail?.trim() || null,
        preferredStore: input.preferredStore.trim(),
        storeId: input.storeId?.trim() || null,
        subject: input.subject.trim(),
        stage: LeadStage.NEW,
        origin: 'chat-norti',
        conversationLog,
        notes: input.notes?.trim() || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        leadNotes: [],
      };
      this.memoryLeads.set(fallback.id, fallback);
      return fallback;
    }
  }

  async getLeadSession(params: { publicId?: string; phone?: string }) {
    const cleanPublicId = params.publicId?.trim();
    const cleanPhone = params.phone?.replace(/\D/g, '');

    try {
      if (cleanPublicId && typeof this.prisma.crmLead.findUnique === 'function') {
        const byPublicId = await this.prisma.crmLead.findUnique({
          where: { publicId: cleanPublicId },
        });
        if (byPublicId) return byPublicId;
      }

      if (cleanPhone && cleanPhone.length >= 8 && typeof this.prisma.crmLead.findMany === 'function') {
        const matches = await this.prisma.crmLead.findMany({
          where: {
            customerPhone: { contains: cleanPhone.slice(-8) },
          },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        });
        if (matches.length > 0) return matches[0];
      }
    } catch {
      // Fallback para memória
    }

    if (cleanPublicId) {
      const mem = Array.from(this.memoryLeads.values()).find((l) => l.publicId === cleanPublicId);
      if (mem) return mem;
    }
    if (cleanPhone && cleanPhone.length >= 8) {
      const mem = Array.from(this.memoryLeads.values()).find((l) =>
        l.customerPhone.replace(/\D/g, '').endsWith(cleanPhone.slice(-8))
      );
      if (mem) return mem;
    }
    return null;
  }

  async listLeads(query: ListCrmLeadsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 50));
    const skip = (page - 1) * pageSize;

    try {
      const where: Prisma.CrmLeadWhereInput = {};

      if (query.stage) {
        where.stage = query.stage;
      }
      if (query.storeId && query.storeId !== 'ALL') {
        where.OR = [
          { storeId: query.storeId },
          { preferredStore: { contains: query.storeId, mode: 'insensitive' } },
        ];
      }
      if (query.search?.trim()) {
        const term = query.search.trim();
        where.OR = [
          { customerName: { contains: term, mode: 'insensitive' } },
          { customerPhone: { contains: term, mode: 'insensitive' } },
          { subject: { contains: term, mode: 'insensitive' } },
          { preferredStore: { contains: term, mode: 'insensitive' } },
        ];
      }

      const [items, total, countsByStage] = await Promise.all([
        this.prisma.crmLead.findMany({
          where,
          include: {
            leadNotes: {
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        this.prisma.crmLead.count({ where }),
        this.prisma.crmLead.groupBy({
          by: ['stage'],
          _count: { _all: true },
        }),
      ]);

      const counts: Record<string, number> = {
        NEW: 0,
        CONTACTED: 0,
        IN_PROGRESS: 0,
        WON: 0,
        LOST: 0,
      };
      for (const entry of countsByStage) {
        counts[entry.stage] = entry._count._all;
      }

      return {
        items,
        total,
        page,
        pageSize,
        counts,
      };
    } catch (error) {
      this.logger.warn(`Prisma listLeads failed, returning in-memory items: ${(error as Error).message}`);
      let all = Array.from(this.memoryLeads.values());
      if (query.stage) {
        all = all.filter((l) => l.stage === query.stage);
      }
      if (query.storeId && query.storeId !== 'ALL') {
        all = all.filter((l) => l.storeId === query.storeId || l.preferredStore.includes(query.storeId!));
      }
      if (query.search?.trim()) {
        const term = query.search.trim().toLowerCase();
        all = all.filter(
          (l) =>
            l.customerName.toLowerCase().includes(term) ||
            l.customerPhone.toLowerCase().includes(term) ||
            l.subject.toLowerCase().includes(term)
        );
      }

      const counts: Record<string, number> = {
        NEW: 0,
        CONTACTED: 0,
        IN_PROGRESS: 0,
        WON: 0,
        LOST: 0,
      };
      for (const l of this.memoryLeads.values()) {
        counts[l.stage] = (counts[l.stage] || 0) + 1;
      }

      const total = all.length;
      const paginated = all.slice(skip, skip + pageSize);
      return {
        items: paginated,
        total,
        page,
        pageSize,
        counts,
      };
    }
  }

  async updateLeadStage(id: string, stage: LeadStage) {
    try {
      const updated = await this.prisma.crmLead.update({
        where: { id },
        data: { stage },
        include: {
          leadNotes: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      return updated;
    } catch {
      const mem = this.memoryLeads.get(id);
      if (mem) {
        mem.stage = stage;
        mem.updatedAt = new Date();
        return mem;
      }
      throw new Error('LEAD_NOT_FOUND');
    }
  }

  async addNote(id: string, dto: AddLeadNoteDto) {
    const authorName = dto.authorName?.trim() || 'Equipe Comercial';
    try {
      const note = await this.prisma.crmLeadNote.create({
        data: {
          leadId: id,
          content: dto.content.trim(),
          authorName,
        },
      });
      return note;
    } catch {
      const mem = this.memoryLeads.get(id);
      if (mem) {
        const newNote = {
          id: `note-${Date.now()}`,
          leadId: id,
          authorName,
          content: dto.content.trim(),
          createdAt: new Date(),
        };
        mem.leadNotes.unshift(newNote);
        return newNote;
      }
      throw new Error('LEAD_NOT_FOUND');
    }
  }
}
