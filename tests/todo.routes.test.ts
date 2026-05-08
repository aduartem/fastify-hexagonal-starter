import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/bootstrap/server.js';

describe('Todo routes', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = await buildServer();
  });

  afterEach(async () => {
    await server.close();
  });

  it('returns validation error for invalid todo payload', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: { title: '' },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();

    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Invalid request body');
    expect(Array.isArray(body.error.details)).toBe(true);
  });

  it('creates and lists todos in memory', async () => {
    const createResponse = await server.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: { title: 'Write tests' },
    });

    expect(createResponse.statusCode).toBe(201);
    const createdTodo = createResponse.json();

    expect(createdTodo.title).toBe('Write tests');
    expect(createdTodo.completed).toBe(false);
    expect(typeof createdTodo.id).toBe('string');

    const listResponse = await server.inject({
      method: 'GET',
      url: '/api/v1/todos',
    });

    expect(listResponse.statusCode).toBe(200);
    const list = listResponse.json();

    expect(Array.isArray(list)).toBe(true);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(createdTodo.id);
    expect(list[0].title).toBe('Write tests');
  });

  it('updates a todo with patch', async () => {
    const createResponse = await server.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: { title: 'Initial title' },
    });

    const createdTodo = createResponse.json();

    const patchResponse = await server.inject({
      method: 'PATCH',
      url: `/api/v1/todos/${createdTodo.id}`,
      payload: { title: 'Updated title', completed: true },
    });

    expect(patchResponse.statusCode).toBe(200);
    const updatedTodo = patchResponse.json();

    expect(updatedTodo.id).toBe(createdTodo.id);
    expect(updatedTodo.title).toBe('Updated title');
    expect(updatedTodo.completed).toBe(true);
    expect(updatedTodo.createdAt).toBe(createdTodo.createdAt);
  });

  it('deletes a todo with delete', async () => {
    const createResponse = await server.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: { title: 'Disposable todo' },
    });

    const createdTodo = createResponse.json();

    const deleteResponse = await server.inject({
      method: 'DELETE',
      url: `/api/v1/todos/${createdTodo.id}`,
    });

    expect(deleteResponse.statusCode).toBe(204);

    const listResponse = await server.inject({
      method: 'GET',
      url: '/api/v1/todos',
    });

    expect(listResponse.statusCode).toBe(200);
    const list = listResponse.json();

    expect(list).toHaveLength(0);
  });
});
