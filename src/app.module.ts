import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TodoModule } from './todo/todo.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { CommentModule } from './comment/comment.module';
import { TagModule } from './tag/tag.module';
import { LikeModule } from './like/like.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, TodoModule, PostModule, UserModule, CommentModule, TagModule, LikeModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
