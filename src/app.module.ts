import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TodoModule } from './todo/todo.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { CommentModule } from './comment/comment.module';
import { TagModule } from './tag/tag.module';

@Module({
  imports: [PrismaModule, TodoModule, PostModule, UserModule, CommentModule, TagModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
