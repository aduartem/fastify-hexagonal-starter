import type { FastifyInstance } from 'fastify';
import type { TodoService } from '@modules/todo/application/todo.service.js';

type TodoRoutesOptions = {
  todoService: TodoService;
};

export async function todoRoutes(fastify: FastifyInstance, options: TodoRoutesOptions) {
  const { todoService } = options;

  fastify.post(
    '/todos',
    {
      schema: {
        description: 'Creates a todo',
        tags: ['Todo'],
        body: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const todo = await todoService.create(request.body);
      return reply.code(201).send(todo);
    },
  );

  fastify.get(
    '/todos',
    {
      schema: {
        description: 'Lists todos',
        tags: ['Todo'],
      },
    },
    async () => {
      return todoService.list();
    },
  );

  const todoParamsSchema = {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  };

  fastify.patch(
    '/todos/:id',
    {
      schema: {
        description: 'Updates a todo',
        tags: ['Todo'],
        params: todoParamsSchema,
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            completed: { type: 'boolean' },
          },
        },
      },
    },
    async (request) => {
      const { id } = request.params as { id: string };
      return todoService.update(id, request.body);
    },
  );

  fastify.delete(
    '/todos/:id',
    {
      schema: {
        description: 'Deletes a todo',
        tags: ['Todo'],
        params: todoParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await todoService.delete(id);
      return reply.code(204).send();
    },
  );
}
