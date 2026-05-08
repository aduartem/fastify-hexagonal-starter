import { patchTodo, type Todo, type TodoPatch } from '../domain/todo.entity.js';
import type { TodoRepository } from '../application/ports/todo.repository.js';

export class InMemoryTodoRepository implements TodoRepository {
  private readonly todos: Todo[] = [];

  async create(todo: Todo): Promise<Todo> {
    this.todos.push(todo);
    return todo;
  }

  async list(): Promise<Todo[]> {
    return [...this.todos];
  }

  async update(id: string, updates: TodoPatch): Promise<Todo | null> {
    const index = this.todos.findIndex((todo) => todo.id === id);

    if (index === -1) {
      return null;
    }

    const currentTodo = this.todos[index];

    if (!currentTodo) {
      return null;
    }

    const updatedTodo = patchTodo(currentTodo, updates);
    this.todos[index] = updatedTodo;

    return updatedTodo;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.todos.findIndex((todo) => todo.id === id);

    if (index === -1) {
      return false;
    }

    this.todos.splice(index, 1);
    return true;
  }
}
