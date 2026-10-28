import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RecordStatus } from '@prisma/client';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { PostsService } from './posts.service';

class PostInputDto {
  @IsString()
  @Length(2, 255)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(2, 191)
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  videoDuration?: string;

  @IsOptional()
  @IsString()
  authorName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  badges?: string[];

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  publishedAt?: string;
}

class PostCategoryInputDto {
  @IsString()
  @Length(2, 160)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(2, 191)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.SETTINGS_MANAGE)
@Controller('admin/posts')
export class AdminPostsController {
  constructor(@Inject(PostsService) private readonly postsService: PostsService) {}

  @Get()
  listPosts(
    @Query('search') search?: string,
    @Query('status') status?: RecordStatus,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.postsService.listPosts({
      search,
      status,
      categoryId,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
  }

  @Get('categories')
  listCategories(@Query('status') status?: RecordStatus) {
    return this.postsService.listCategories(status);
  }

  @Get('categories/:id')
  getCategory(@Param('id') id: string) {
    return this.postsService.getCategoryById(id);
  }

  @Post('categories')
  createCategory(@Body() body: PostCategoryInputDto) {
    return this.postsService.createCategory(body);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: PostCategoryInputDto) {
    return this.postsService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.postsService.deleteCategory(id);
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postsService.getPostById(id);
  }

  @Post()
  createPost(@Body() body: PostInputDto) {
    return this.postsService.createPost(body);
  }

  @Patch(':id')
  updatePost(@Param('id') id: string, @Body() body: PostInputDto) {
    return this.postsService.updatePost(id, body);
  }

  @Post(':id/archive')
  archivePost(@Param('id') id: string) {
    return this.postsService.archivePost(id);
  }

  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(id);
  }
}
