import { Controller, Get, Inject, Param, Query, UseGuards } from '@nestjs/common';
import { RecordStatus } from '@prisma/client';
import { PublicRateLimit, PublicRateLimitGuard } from '../../common/security/public-rate-limit.guard';
import { PostsService } from './posts.service';

type PostQuery = {
  search?: string;
  category?: string;
  categoryId?: string;
  page?: string;
  pageSize?: string;
};

@UseGuards(PublicRateLimitGuard)
@Controller('posts')
export class PostsController {
  constructor(@Inject(PostsService) private readonly postsService: PostsService) {}

  @PublicRateLimit({ limit: 120, windowMs: 60_000 })
  @Get()
  listPosts(@Query() query: PostQuery) {
    return this.postsService.listPosts({
      search: query.search,
      category: query.category,
      categoryId: query.categoryId,
      status: RecordStatus.ACTIVE,
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 12,
    });
  }

  @Get('categories')
  listCategories() {
    return this.postsService.listCategories(RecordStatus.ACTIVE);
  }

  @Get(':slug')
  getPost(@Param('slug') slug: string) {
    return this.postsService.getPostBySlug(slug, true);
  }
}
