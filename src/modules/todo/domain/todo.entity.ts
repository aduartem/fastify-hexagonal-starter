import { randomUUID } from 'node:crypto';

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export type TodoPatch = {
  title?: string | undefined;
  completed?: boolean | undefined;
};

export function createTodo(title: string): Todo {
  return {
    id: randomUUID(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function patchTodo(todo: Todo, updates: TodoPatch): Todo {
  return {
    ...todo,
    ...(updates.title !== undefined && { title: updates.title }),
    ...(updates.completed !== undefined && { completed: updates.completed }),
  };
}
