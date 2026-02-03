import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}
  async create(createTodoDto: CreateTodoDto) {
    await this.prisma.todo.create({ data: createTodoDto });
    return { message: 'Todo added successfully' };
  }

  findAll() {
    return this.prisma.todo.findMany();
  }

  async findOne(id: number) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) throw new NotFoundException();
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) throw new NotFoundException();
    await this.prisma.todo.update({ where: { id }, data: updateTodoDto });
    return { message: 'Todo updated successfully' };
  }

  async remove(id: number) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) throw new NotFoundException();
    await this.prisma.todo.delete({ where: { id } });
    return { message: 'Todo deleted successfully' };
  }
}
