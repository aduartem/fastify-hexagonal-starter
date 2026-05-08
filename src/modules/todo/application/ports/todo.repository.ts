import type { Todo, TodoPatch } from '../../domain/todo.entity.js';

export interface TodoRepository {
  create(todo: Todo): Promise<Todo>;
  list(): Promise<Todo[]>;
  update(id: string, updates: TodoPatch): Promise<Todo | null>;
  delete(id: string): Promise<boolean>;
}
