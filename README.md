# Fastify Hexagonal Starter

Opinionated TypeScript Fastify starter with Hexagonal Architecture, Vertical Slicing, Zod validation, Swagger, and integration tests.

## Overview

This project is an opinionated TypeScript Fastify starter that applies Hexagonal Architecture with Vertical Slicing, includes a complete Todo module (`create`, `list`, `update`, `delete`), and ships with request validation, OpenAPI docs, consistent error handling, and integration tests. The Todo module currently uses in-memory persistence as an example implementation and should be replaced with a real database adapter in production scenarios.

Current features:

- Fastify HTTP server
- Swagger/OpenAPI JSON generation
- Swagger UI at `/docs`
- Versioned routes under `/api/v1`
- Health check endpoint
- In-memory Todo flow (`create`, `list`, `update`, `delete`)
- Environment validation with Zod
- Consistent API error shape (`error.code`, `error.message`, `error.details`)
- Strict TypeScript configuration
- ESLint + Prettier
- Vitest integration tests for health and Todo endpoints

## Tech Stack

- Node.js
- TypeScript
- Fastify
- Zod
- Swagger (`@fastify/swagger` and `@fastify/swagger-ui`)
- Vitest
- ESLint + Prettier

## Project Structure

```text
src/
	index.ts
	bootstrap/
		index.ts
		server.ts
	shared/
		core/
			config.ts
			errors.ts
		infrastructure/
			persistence/
				database.ts
	modules/
		health/
			http/
				health.routes.ts
		todo/
			application/
				ports/
					todo.repository.ts
				todo.service.ts
			domain/
				todo.entity.ts
			http/
				todo.routes.ts
			infrastructure/
				in-memory-todo.repository.ts
				postgres-todo.repository.ts
			todo.module.ts
```

## Architecture Notes

- `bootstrap` contains application startup and server composition.
- `shared` contains cross-cutting concerns such as config and error handling.
- `modules` groups each feature vertically.
- Each module separates `domain`, `application`, `infrastructure`, and `http` responsibilities.

## Replacing In-Memory Persistence

The Todo module uses in-memory storage by default as a practical example.
For production usage, swap the adapter with a real database implementation.

### Recommended steps

1. Add a database URL to your environment:

```env
DB_URL=postgres://user:password@localhost:5432/app_db
```

2. Validate `DB_URL` in `shared/core/config.ts`.
3. Add a shared database client in `shared/infrastructure/persistence/database.ts`.
4. Implement a real adapter (for example `postgres-todo.repository.ts`) that satisfies `TodoRepository`.
5. Update `modules/todo/todo.module.ts` to inject the real repository into `TodoService`.

### Wiring example

```ts
// Before
const todoRepository = new InMemoryTodoRepository();

// After
const todoRepository = new PostgresTodoRepository(dbClient);
```

This keeps the application layer unchanged and replaces only the infrastructure adapter.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=3000
```

### 3. Run in development mode

```bash
npm run dev
```

### 4. Build and run production bundle

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev`: Start dev server with watch mode
- `npm run build`: Compile TypeScript and resolve path aliases
- `npm start`: Run compiled app from `dist`
- `npm run test-native`: Run entrypoint with Node experimental TypeScript stripping
- `npm run lint`: Run ESLint checks
- `npm run lint:fix`: Auto-fix lint issues
- `npm run format`: Format TypeScript files with Prettier
- `npm test`: Run tests once with Vitest
- `npm run test:watch`: Run Vitest in watch mode
- `npm run test:ui`: Run Vitest UI

## API Endpoints

- `GET /api/v1/health`
  - Returns service health metadata (`status`, `version`, `timestamp`, `uptime`)
- `POST /api/v1/todos`
  - Creates a Todo item
  - Body: `{ "title": "string" }`
- `GET /api/v1/todos`
  - Returns all Todo items stored in memory
- `PATCH /api/v1/todos/:id`
  - Updates a Todo item
  - Body: `{ "title"?: "string", "completed"?: boolean }`
- `DELETE /api/v1/todos/:id`
  - Deletes a Todo item
  - Returns `204 No Content` on success

## Error Response Format

All handled errors follow this response shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": []
  }
}
```

Possible application error codes currently used:

- `VALIDATION_ERROR`
- `TODO_NOT_FOUND`
- `NOT_FOUND`
- `INTERNAL_ERROR`

## Test Coverage

Current integration tests cover:

- Health check endpoint
- Todo creation validation
- Todo create + list flow
- Todo update with `PATCH`
- Todo deletion with `DELETE`

## API Documentation

After starting the server, open:

- `http://localhost:3000/docs`

OpenAPI server URL is generated using the current `PORT` value.

## Notes

- The app uses ESM (`"type": "module"`).
- TypeScript output is generated to `dist`.
- Todo storage is in-memory and intended for starter/development usage.
- Replacing persistence only requires a new repository adapter + module wiring update.
