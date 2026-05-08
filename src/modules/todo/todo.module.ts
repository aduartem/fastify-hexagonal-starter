import { TodoService } from '@modules/todo/application/todo.service.js';
import { InMemoryTodoRepository } from '@modules/todo/infrastructure/in-memory-todo.repository.js';

export function buildTodoDependencies() {
  const todoRepository = new InMemoryTodoRepository();
  const todoService = new TodoService(todoRepository);

  return {
    todoRepository,
    todoService,
  };
}
