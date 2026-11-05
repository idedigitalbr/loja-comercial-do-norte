import { describe, expect, it, vi } from 'vitest';
import { LeadStage } from '@prisma/client';
import { CrmService } from './crm.service';
import { CreateCrmLeadDto } from './crm.types';

function buildService(prismaOverrides = {}) {
  const prisma = {
    crmLead: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      update: vi.fn(),
    },
    crmLeadNote: {
      create: vi.fn(),
    },
    ...prismaOverrides,
  };
  const service = new CrmService(prisma as never);
  return { service, prisma };
}

describe('CrmService (MiniCRM Leads & Kanban)', () => {
  describe('createLead', () => {
    it('cria lead com histórico de mensagens do Typebot e estágio NEW', async () => {
      const { service, prisma } = buildService();

      const mockCreatedLead = {
        id: 'crm-lead-123',
        publicId: 'lead-test-abc',
        customerName: 'Carlos Silva',
        customerPhone: '(91) 98888-7777',
        customerEmail: 'carlos@exemplo.com',
        preferredStore: 'Bernardo Sayão (Guamá)',
        storeId: 'store-bernardo-sayao',
        subject: '🏷️ Fazer Cotação de Produtos e Atacado',
        stage: LeadStage.NEW,
        origin: 'chat-norti',
        conversationLog: [
          { id: '1', sender: 'bot', text: 'Oi! Eu sou o Norti!', timestamp: '10:00' },
          { id: '2', sender: 'user', text: 'Carlos Silva', timestamp: '10:01' },
          { id: '3', sender: 'bot', text: 'Qual loja fica mais próxima?', timestamp: '10:01' },
          { id: '4', sender: 'user', text: 'Bernardo Sayão', timestamp: '10:02' },
        ],
        notes: null,
        leadNotes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.crmLead.create.mockResolvedValue(mockCreatedLead);

      const dto: CreateCrmLeadDto = {
        customerName: '  Carlos Silva  ',
        customerPhone: ' (91) 98888-7777 ',
        customerEmail: ' carlos@exemplo.com ',
        preferredStore: ' Bernardo Sayão (Guamá) ',
        storeId: 'store-bernardo-sayao',
        subject: '🏷️ Fazer Cotação de Produtos e Atacado',
        conversationLog: [
          { id: '1', sender: 'bot', text: 'Oi! Eu sou o Norti!', timestamp: '10:00' },
          { id: '2', sender: 'user', text: 'Carlos Silva', timestamp: '10:01' },
          { id: '3', sender: 'bot', text: 'Qual loja fica mais próxima?', timestamp: '10:01' },
          { id: '4', sender: 'user', text: 'Bernardo Sayão', timestamp: '10:02' },
        ],
      };

      const result = await service.createLead(dto);

      expect(prisma.crmLead.create).toHaveBeenCalledTimes(1);
      const callData = prisma.crmLead.create.mock.calls[0][0].data;
      expect(callData.customerName).toBe('Carlos Silva');
      expect(callData.customerPhone).toBe('(91) 98888-7777');
      expect(callData.customerEmail).toBe('carlos@exemplo.com');
      expect(callData.preferredStore).toBe('Bernardo Sayão (Guamá)');
      expect(callData.storeId).toBe('store-bernardo-sayao');
      expect(callData.stage).toBe(LeadStage.NEW);
      expect(callData.origin).toBe('chat-norti');
      expect(callData.conversationLog).toHaveLength(4);
      expect(result).toEqual(mockCreatedLead);
    });

    it('faz fallback para armazenamento em memória caso o Prisma falhe', async () => {
      const { service, prisma } = buildService();
      prisma.crmLead.create.mockRejectedValue(new Error('Database unavailable'));

      const dto: CreateCrmLeadDto = {
        customerName: 'Mariana Lima',
        customerPhone: '91999990000',
        preferredStore: 'Matriz São Brás',
        subject: '💬 Falar com Vendedor no WhatsApp',
      };

      const result = await service.createLead(dto);

      expect(result).toBeDefined();
      expect(result.customerName).toBe('Mariana Lima');
      expect(result.customerPhone).toBe('91999990000');
      expect(result.preferredStore).toBe('Matriz São Brás');
      expect(result.stage).toBe(LeadStage.NEW);
      expect(result.origin).toBe('chat-norti');
    });
  });

  describe('listLeads', () => {
    it('lista leads e compila os totais por estágio do Kanban', async () => {
      const { service, prisma } = buildService();

      const mockItems = [
        {
          id: 'lead-1',
          customerName: 'João Santos',
          stage: LeadStage.NEW,
          preferredStore: 'Matriz São Brás',
          leadNotes: [],
        },
        {
          id: 'lead-2',
          customerName: 'Beatriz Costa',
          stage: LeadStage.CONTACTED,
          preferredStore: 'Bernardo Sayão',
          leadNotes: [],
        },
      ];

      prisma.crmLead.findMany.mockResolvedValue(mockItems);
      prisma.crmLead.count.mockResolvedValue(2);
      prisma.crmLead.groupBy.mockResolvedValue([
        { stage: LeadStage.NEW, _count: { _all: 10 } },
        { stage: LeadStage.CONTACTED, _count: { _all: 5 } },
        { stage: LeadStage.IN_PROGRESS, _count: { _all: 3 } },
        { stage: LeadStage.WON, _count: { _all: 8 } },
        { stage: LeadStage.LOST, _count: { _all: 2 } },
      ]);

      const result = await service.listLeads({ page: 1, pageSize: 20 });

      expect(prisma.crmLead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          orderBy: { createdAt: 'desc' },
        })
      );
      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(2);
      expect(result.counts).toEqual({
        NEW: 10,
        CONTACTED: 5,
        IN_PROGRESS: 3,
        WON: 8,
        LOST: 2,
      });
    });

    it('aplica filtros por estágio, loja e busca textual', async () => {
      const { service, prisma } = buildService();

      prisma.crmLead.findMany.mockResolvedValue([]);
      prisma.crmLead.count.mockResolvedValue(0);
      prisma.crmLead.groupBy.mockResolvedValue([]);

      await service.listLeads({
        stage: LeadStage.IN_PROGRESS,
        storeId: 'store-cidade-nova',
        search: 'embalagem',
      });

      const findManyCall = prisma.crmLead.findMany.mock.calls[0][0];
      expect(findManyCall.where.stage).toBe(LeadStage.IN_PROGRESS);
      expect(findManyCall.where.OR).toBeDefined();
    });
  });

  describe('updateLeadStage', () => {
    it('atualiza o estágio do Kanban em todas as transições válidas', async () => {
      const { service, prisma } = buildService();

      const stages: LeadStage[] = [
        LeadStage.NEW,
        LeadStage.CONTACTED,
        LeadStage.IN_PROGRESS,
        LeadStage.WON,
        LeadStage.LOST,
      ];

      for (const targetStage of stages) {
        prisma.crmLead.update.mockResolvedValue({
          id: 'lead-1',
          stage: targetStage,
          leadNotes: [],
        });

        const updated = await service.updateLeadStage('lead-1', targetStage);

        expect(prisma.crmLead.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'lead-1' },
            data: { stage: targetStage },
          })
        );
        expect(updated.stage).toBe(targetStage);
      }
    });

    it('atualiza estágio no modo fallback de memória', async () => {
      const { service, prisma } = buildService();
      // Primeiro cria lead via fallback
      prisma.crmLead.create.mockRejectedValue(new Error('Prisma error'));
      const created = await service.createLead({
        customerName: 'Renata',
        customerPhone: '91988880000',
        preferredStore: 'Jurunas',
        subject: 'Cotação',
      });

      // Atualiza estágio quando prisma falha
      prisma.crmLead.update.mockRejectedValue(new Error('Prisma update error'));
      const updated = await service.updateLeadStage(created.id, LeadStage.IN_PROGRESS);

      expect(updated.stage).toBe(LeadStage.IN_PROGRESS);
    });

    it('lança LEAD_NOT_FOUND se lead não existir no fallback', async () => {
      const { service, prisma } = buildService();
      prisma.crmLead.update.mockRejectedValue(new Error('Prisma update error'));

      await expect(service.updateLeadStage('inexistente', LeadStage.WON)).rejects.toThrowError(
        'LEAD_NOT_FOUND'
      );
    });
  });

  describe('addNote', () => {
    it('adiciona anotação interna da equipe comercial com autor fornecido', async () => {
      const { service, prisma } = buildService();

      const mockNote = {
        id: 'note-1',
        leadId: 'lead-1',
        authorName: 'Vendedor Marcos',
        content: 'Cliente confirmou interesse em 50 caixas de embalagens.',
        createdAt: new Date(),
      };
      prisma.crmLeadNote.create.mockResolvedValue(mockNote);

      const result = await service.addNote('lead-1', {
        content: 'Cliente confirmou interesse em 50 caixas de embalagens.',
        authorName: 'Vendedor Marcos',
      });

      expect(prisma.crmLeadNote.create).toHaveBeenCalledWith({
        data: {
          leadId: 'lead-1',
          content: 'Cliente confirmou interesse em 50 caixas de embalagens.',
          authorName: 'Vendedor Marcos',
        },
      });
      expect(result).toEqual(mockNote);
    });

    it('define autor padrão como "Equipe Comercial" quando autorName não for informado', async () => {
      const { service, prisma } = buildService();

      prisma.crmLeadNote.create.mockImplementation(({ data }) => Promise.resolve({ id: 'note-2', ...data }));

      await service.addNote('lead-1', {
        content: 'Tentativa de contato via WhatsApp sem resposta.',
      });

      expect(prisma.crmLeadNote.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            authorName: 'Equipe Comercial',
          }),
        })
      );
    });

    it('adiciona anotação no modo fallback de memória e propaga no lead', async () => {
      const { service, prisma } = buildService();
      prisma.crmLead.create.mockRejectedValue(new Error('DB offline'));
      const created = await service.createLead({
        customerName: 'Fabio',
        customerPhone: '91977770000',
        preferredStore: 'Mauriti',
        subject: 'Dúvidas',
      });

      prisma.crmLeadNote.create.mockRejectedValue(new Error('DB offline'));
      const note = await service.addNote(created.id, {
        content: 'Contato efetuado às 14h com proposta enviada.',
        authorName: 'Atendente Carla',
      });

      expect(note).toBeDefined();
      expect(note.leadId).toBe(created.id);
      expect(note.authorName).toBe('Atendente Carla');
      expect(note.content).toBe('Contato efetuado às 14h com proposta enviada.');
    });

    it('lança LEAD_NOT_FOUND ao adicionar nota a lead inexistente no fallback', async () => {
      const { service, prisma } = buildService();
      prisma.crmLeadNote.create.mockRejectedValue(new Error('DB offline'));

      await expect(
        service.addNote('lead-inexistente', { content: 'Nota teste' })
      ).rejects.toThrowError('LEAD_NOT_FOUND');
    });
  });
});
