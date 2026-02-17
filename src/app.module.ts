import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TodoModule } from './todo/todo.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [PrismaModule, TodoModule, PostModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
