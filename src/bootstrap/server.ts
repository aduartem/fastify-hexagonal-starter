import fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { TodoService } from '../modules/todo/application/todo.service.js';
import { env } from '../shared/core/config.js';
import { AppError, buildErrorResponse } from '../shared/core/errors.js';
import { InMemoryTodoRepository } from '../modules/todo/infrastructure/in-memory-todo.repository.js';
import { healthRoutes } from '../modules/health/http/health.routes.js';
import { todoRoutes } from '../modules/todo/http/todo.routes.js';

export async function buildServer() {
  const server = fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
      ...(env.NODE_ENV === 'development' && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }),
    },
  });

  const todoRepository = new InMemoryTodoRepository();
  const todoService = new TodoService(todoRepository);

  await server.register(swagger, {
    openapi: {
      info: {
        title: 'TS Pure API',
        description: 'Pure TypeScript Node.js 24 boilerplate',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${env.PORT}` }],
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/docs',
  });

  server.register(healthRoutes, { prefix: '/api/v1' });
  server.register(todoRoutes, {
    prefix: '/api/v1',
    todoService,
  });

  server.setNotFoundHandler((_request, reply) => {
    return reply.code(404).send(buildErrorResponse('NOT_FOUND', 'Route not found'));
  });

  server.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply
        .code(error.statusCode)
        .send(buildErrorResponse(error.code, error.message, error.details));
    }

    server.log.error(error);
    return reply.code(500).send(buildErrorResponse('INTERNAL_ERROR', 'Unexpected internal error'));
  });

  return server;
}
