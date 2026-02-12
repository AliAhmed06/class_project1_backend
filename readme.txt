npm i prisma@latest @prisma/client@latest @prisma/config @prisma/adapter-pg pg
npx prisma init
  -> this will create 3 files
    1. schema.prisma
      generator client {
        provider = "prisma-client-js"
      }

      datasource db {
        provider = "postgresql"
      }

      model User{
        id Int @id @default(autoincrement())
        name String
        email String @unique
        bio String
        avatar String
        password String
        posts Post[]
        comments Comment[]
        likes Like[]
        createdAt DateTime @default(now())
        updatedAt DateTime @updatedAt
      }

      model Post{
        id Int @id @default(autoincrement())
        slug String
        title String
        content String
        thumbnail String
        published Boolean
        authorId Int
        author User @relation(fields: [authorId], references: [id])
        tags Tag[] @relation("PostTags")
        comments Comment[]
        likes Like[]
        createdAt DateTime @default(now())
        updatedAt DateTime @updatedAt
      }

      model Tag{
        id Int @id @default(autoincrement())
        name String
        posts Post[] @relation("PostTags")
      }

      model Comment{
        id Int @id @default(autoincrement())
        content String
        authorId Int
        author User @relation(fields: [authorId], references: [id])  
        postId Int
        post Post @relation(fields: [postId], references: [id])
        createdAt DateTime @default(now())
        updatedAt DateTime @updatedAt
      }

      model Like{
        id Int @id @default(autoincrement())
        userId Int
        user User @relation(fields: [userId], references: [id])
        postId Int
        post Post @relation(fields: [postId], references: [id])
      }

    2.prisma.config.ts
      import 'dotenv/config';
      import { defineConfig } from 'prisma/config';

      export default defineConfig({
        schema: 'prisma/schema.prisma',
        migrations: {
          path: 'prisma/migrations',
        },
        datasource: {
          url: process.env['DATABASE_URL'],
        },
      });

    3. .env
      DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/todo"

->
npx prisma migrate dev --name init

-> 
nest g module prisma
nest g service prisma

  -> prisma.service.ts
    import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
    import { PrismaPg } from '@prisma/adapter-pg';
    import { PrismaClient } from '@prisma/client';
    import 'dotenv/config';
    // import { PrismaClient } from '@prisma/client/extension';

    @Injectable()
    export class PrismaService
      extends PrismaClient
      implements OnModuleInit, OnModuleDestroy
    {
      constructor() {
        const adapter = new PrismaPg({
          connectionString: process.env.DATABASE_URL,
        });
        super({
          adapter,
          log:
            process.env.NODE_ENV === 'development'
              ? ['query', 'error', 'warn']
              : ['error'],
        });
      }

      async onModuleInit() {
        await this.$connect();
        console.log('database connected successfully!');
      }

      async onModuleDestroy() {
        await this.$disconnect();
        console.log('database disconnected!');
      }

      async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Cannot clean database in production');
        }

        const models = Reflect.ownKeys(this).filter(
          (key) => typeof key === 'string' && !key.startsWith('_'),
        );

        return Promise.all(
          models.map((modelKey) => {
            if (typeof modelKey === 'string') {
              return this[modelKey].deleteMany();
            }
          }),
        );
      }
    }



-> npx prisma generate

------------------------------------------------------------------------------------------------------
----------------------------------------- Seeding Primsa ---------------------------------------------
------------------------------------------------------------------------------------------------------
-> npm i @faker-js/faker

-> prisma -> seed.ts
      import 'dotenv/config';
      import { faker } from '@faker-js/faker';
      import { PrismaService } from '../src/prisma/prisma.service';

      const prisma = new PrismaService();

      function generateSlug(title: string) {
        return title
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-');
      }

      async function main() {
        await prisma.$connect();

        // Users
        const users = Array.from({ length: 10 }).map(() => ({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          bio: faker.lorem.sentence(),
          avatar: faker.image.avatar(),
          password: 'hashed_password',
        }));

        await prisma.user.createMany({ data: users });

        // Posts + Comments
        const posts = Array.from({ length: 40 }).map(() => ({
          title: faker.lorem.sentence(),
          slug: generateSlug(faker.lorem.sentence()),
          content: faker.lorem.paragraphs(3),
          thumbnail: faker.image.url(),
          authorId: faker.number.int({ min: 1, max: 10 }),
          published: true,
        }));

        await Promise.all(
          posts.map((post) =>
            prisma.post.create({
              data: {
                ...post,
                comments: {
                  createMany: {
                    data: Array.from({ length: 20 }).map(() => ({
                      content: faker.lorem.sentence(),
                      authorId: faker.number.int({ min: 1, max: 10 }),
                    })),
                  },
                },
              },
            }),
          ),
        );
      }

      main()
        .then(async () => {
          await prisma.$disconnect();
          console.log('Seeding completed!');
          process.exit(0);
        })
        .catch(async (err) => {
          console.error(err);
          await prisma.$disconnect();
          process.exit(1);
        });
      

-> go to package.json and in scripts add
  "db:seed": "ts-node ./prisma/seed.ts"

-> npm run db:seed



