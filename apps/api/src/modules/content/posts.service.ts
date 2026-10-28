import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RecordStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export type CreatePostInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverUrl?: string;
  videoUrl?: string;
  videoDuration?: string;
  authorName?: string;
  badges?: string[];
  status?: RecordStatus;
  categoryId?: string;
  publishedAt?: Date | string;
};

export type UpdatePostInput = Partial<CreatePostInput>;

export type CreatePostCategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  status?: RecordStatus;
  sortOrder?: number;
};

export type UpdatePostCategoryInput = Partial<CreatePostCategoryInput>;

@Injectable()
export class PostsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listPosts(query: {
    search?: string;
    categoryId?: string;
    category?: string;
    status?: RecordStatus;
    page?: number;
    pageSize?: number;
  } = {}) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 12));
    const skip = (page - 1) * pageSize;

    const where: Prisma.PostWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { excerpt: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    } else if (query.category) {
      where.category = { slug: query.category };
    }

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async getPostBySlug(slug: string, incrementViews = false) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true, description: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post "${slug}" não encontrado`);
    }

    if (incrementViews) {
      this.prisma.post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      }).catch(() => undefined);
    }

    return post;
  }

  async getPostById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post id "${id}" não encontrado`);
    }

    return post;
  }

  async createPost(input: CreatePostInput) {
    const slug = (input.slug?.trim() ? slugify(input.slug) : slugify(input.title)) || `post-${Date.now()}`;
    return this.prisma.post.create({
      data: {
        title: input.title.trim(),
        slug,
        excerpt: input.excerpt?.trim() || null,
        content: input.content,
        coverUrl: input.coverUrl?.trim() || null,
        videoUrl: input.videoUrl?.trim() || null,
        videoDuration: input.videoDuration?.trim() || null,
        authorName: input.authorName?.trim() || 'Comercial do Norte',
        badges: input.badges ?? [],
        status: input.status ?? RecordStatus.ACTIVE,
        categoryId: input.categoryId || null,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async updatePost(id: string, input: UpdatePostInput) {
    await this.getPostById(id);
    const data: Prisma.PostUpdateInput = {};

    if (input.title !== undefined) data.title = input.title.trim();
    if (input.slug !== undefined) data.slug = slugify(input.slug) || slugify(input.title ?? id);
    if (input.excerpt !== undefined) data.excerpt = input.excerpt?.trim() || null;
    if (input.content !== undefined) data.content = input.content;
    if (input.coverUrl !== undefined) data.coverUrl = input.coverUrl?.trim() || null;
    if (input.videoUrl !== undefined) data.videoUrl = input.videoUrl?.trim() || null;
    if (input.videoDuration !== undefined) data.videoDuration = input.videoDuration?.trim() || null;
    if (input.authorName !== undefined) data.authorName = input.authorName?.trim() || null;
    if (input.badges !== undefined) data.badges = input.badges;
    if (input.status !== undefined) data.status = input.status;
    if (input.categoryId !== undefined) {
      data.category = input.categoryId ? { connect: { id: input.categoryId } } : { disconnect: true };
    }
    if (input.publishedAt !== undefined) {
      data.publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();
    }

    return this.prisma.post.update({
      where: { id },
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async archivePost(id: string) {
    await this.getPostById(id);
    return this.prisma.post.update({
      where: { id },
      data: { status: RecordStatus.ARCHIVED },
    });
  }

  async deletePost(id: string) {
    await this.getPostById(id);
    return this.prisma.post.delete({ where: { id } });
  }

  // --- Categorias de Post ---
  async listCategories(status?: RecordStatus) {
    return this.prisma.postCategory.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { posts: true } },
      },
    });
  }

  async getCategoryBySlug(slug: string) {
    const cat = await this.prisma.postCategory.findUnique({
      where: { slug },
      include: {
        _count: { select: { posts: true } },
      },
    });
    if (!cat) throw new NotFoundException(`Categoria de post "${slug}" não encontrada`);
    return cat;
  }

  async getCategoryById(id: string) {
    const cat = await this.prisma.postCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true } },
      },
    });
    if (!cat) throw new NotFoundException(`Categoria de post id "${id}" não encontrada`);
    return cat;
  }

  async createCategory(input: CreatePostCategoryInput) {
    const slug = (input.slug?.trim() ? slugify(input.slug) : slugify(input.name)) || `cat-${Date.now()}`;
    return this.prisma.postCategory.create({
      data: {
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
        status: input.status ?? RecordStatus.ACTIVE,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  async updateCategory(id: string, input: UpdatePostCategoryInput) {
    await this.getCategoryById(id);
    const data: Prisma.PostCategoryUpdateInput = {};
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.slug !== undefined) data.slug = slugify(input.slug) || slugify(input.name ?? id);
    if (input.description !== undefined) data.description = input.description?.trim() || null;
    if (input.status !== undefined) data.status = input.status;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    return this.prisma.postCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    await this.getCategoryById(id);
    return this.prisma.postCategory.delete({ where: { id } });
  }
}
