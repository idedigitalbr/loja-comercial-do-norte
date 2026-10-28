import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AdminEventsController } from './admin-events.controller';
import { AdminPostsController } from './admin-posts.controller';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [
    PostsController,
    EventsController,
    AdminPostsController,
    AdminEventsController,
  ],
  providers: [PostsService, EventsService],
  exports: [PostsService, EventsService],
})
export class ContentModule {}
