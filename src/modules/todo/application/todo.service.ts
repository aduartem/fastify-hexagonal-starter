import { z } from 'zod';
import type { TodoRepository } from '@modules/todo/application/ports/todo.repository.js';
import { createTodo, type Todo } from '@modules/todo/domain/todo.entity.js';
import { AppError } from '@shared/core/errors.js';

const createTodoSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    completed: z.boolean().optional(),
  })
  .refine(
    (value) => value.title !== undefined || value.completed !== undefined,
    'At least one field must be provided',
  );

export class TodoService {
  constructor(private readonly repository: TodoRepository) {}

  async create(input: unknown): Promise<Todo> {
    const parsed = createTodoSchema.safeParse(input);

    if (!parsed.success) {
      throw new AppError('Invalid request body', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: parsed.error.issues,
      });
    }

    const todo = createTodo(parsed.data.title);
    return this.repository.create(todo);
  }

  async list(): Promise<Todo[]> {
    return this.repository.list();
  }

  async update(id: string, input: unknown): Promise<Todo> {
    const parsed = updateTodoSchema.safeParse(input);

    if (!parsed.success) {
      throw new AppError('Invalid request body', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: parsed.error.issues,
      });
    }

    const updatedTodo = await this.repository.update(id, parsed.data);

    if (!updatedTodo) {
      throw new AppError('Todo not found', {
        code: 'TODO_NOT_FOUND',
        statusCode: 404,
      });
    }

    return updatedTodo;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new AppError('Todo not found', {
        code: 'TODO_NOT_FOUND',
        statusCode: 404,
      });
    }
  }
}
