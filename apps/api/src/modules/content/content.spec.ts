import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RecordStatus } from '@prisma/client';
import { PostsService, slugify } from './posts.service';
import { EventsService } from './events.service';

describe('PostsService and EventsService', () => {
  it('slugify converts titles accurately', () => {
    expect(slugify('Tudo sobre Embalagens Kraft & Papel!')).toBe('tudo-sobre-embalagens-kraft-papel');
    expect(slugify('Workshop de Confeitaria — Decoração')).toBe('workshop-de-confeitaria-decoracao');
  });

  describe('PostsService', () => {
    let service: PostsService;
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = {
        post: {
          findMany: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        postCategory: {
          findMany: vi.fn().mockResolvedValue([]),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
      };
      service = new PostsService(mockPrisma);
    });

    it('listPosts builds search and pagination correctly', async () => {
      mockPrisma.post.findMany.mockResolvedValue([
        { id: 'p1', title: 'Embalagens kraft', slug: 'embalagens-kraft' },
      ]);
      mockPrisma.post.count.mockResolvedValue(1);

      const result = await service.listPosts({ search: 'kraft', page: 1, pageSize: 10 });
      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
      expect(mockPrisma.post.findMany).toHaveBeenCalled();
    });

    it('createPost generates slug and creates post', async () => {
      mockPrisma.post.create.mockResolvedValue({
        id: 'p1',
        title: 'Novo Post',
        slug: 'novo-post',
        status: RecordStatus.ACTIVE,
      });

      const res = await service.createPost({
        title: 'Novo Post',
        content: '<p>Conteúdo</p>',
      });

      expect(res.slug).toBe('novo-post');
      expect(mockPrisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Novo Post',
            slug: 'novo-post',
          }),
        })
      );
    });

    it('getPostBySlug increments view count when requested', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ id: 'p1', slug: 'teste' });
      mockPrisma.post.update.mockResolvedValue({ id: 'p1', views: 1 });

      const res = await service.getPostBySlug('teste', true);
      expect(res.slug).toBe('teste');
      expect(mockPrisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1' },
          data: { views: { increment: 1 } },
        })
      );
    });
  });

  describe('EventsService', () => {
    let service: EventsService;
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = {
        event: {
          findMany: vi.fn().mockResolvedValue([]),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
      };
      service = new EventsService(mockPrisma);
    });

    it('listEvents retrieves events in order', async () => {
      mockPrisma.event.findMany.mockResolvedValue([
        { id: 'ev1', title: 'Encontro Empreendedores', slug: 'encontro-empreendedores' },
      ]);

      const res = await service.listEvents();
      expect(res.length).toBe(1);
      expect(res[0].slug).toBe('encontro-empreendedores');
    });

    it('createEvent creates an event with proper fields', async () => {
      mockPrisma.event.create.mockResolvedValue({
        id: 'ev1',
        title: 'Workshop Confeitaria',
        slug: 'workshop-confeitaria',
        instructor: 'Thais Reis',
      });

      const res = await service.createEvent({
        title: 'Workshop Confeitaria',
        description: 'Aprenda técnicas de bicos',
        instructor: 'Thais Reis',
        eventDateText: '03/10',
      });

      expect(res.slug).toBe('workshop-confeitaria');
      expect(mockPrisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Workshop Confeitaria',
            instructor: 'Thais Reis',
          }),
        })
      );
    });
  });
});
