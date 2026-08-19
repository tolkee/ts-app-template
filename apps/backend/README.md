# Backend

The backend of the application uses:

- [Hono](https://hono.dev/) for the api server. It's lightweight, fast, has rpc support out of the box, and is at same level as Express.js. It's backed by cloudlfare (as they use it for their serverless platform) and is growing very fast.
- [Drizzle](https://orm.drizzle.team/) for the database schema definitions, migrations, and type-safe query building.
- [Better Auth](https://better-auth.com/) for the auth. It's well integrated with drizzle (adapter that generates the auth schemas) and hono where u can just use the auth routes.
- [Pino](https://github.com/pinojs/pino) as fast, lightweight logger.

The project is structured as follows:

- `src/features/`: each feature has it's own architecture. (eg. `<feature>.service.ts`, `index.ts`, `<feature>.schema.ts` etc...) and only expose selected parts to the outside world.
- `src/api/`: this contains the main hono router (`src/api/index.ts`) and subrouters (`src/api/<subrouter>.routes.ts`) per feature/subject. Each subrouter exporte a function to create itself, taking parameters as db connection, service dependencies etc.. The main router does the same, but also create each subrouter and expose their routes on a path.
  - `src/api/middlewares/`: this contains the middleware for the api server.
    - [authContextMiddleware](src/api/middlewares/auth-context.ts): attaches the better auth context (user/session) to the request, so it can be used in the routes. (used in the main router)
    - [authGuardMiddleware](src/api/middlewares/auth-guard.ts): protects a route by requiring the user to be authenticated.
    - [loggerMiddleware](src/api/middlewares/logger.ts): logs the request/response info using pino.
- `src/lib/`: contains utility/shared code like db connection, env parse etc...
- `src/index.ts`: the backend's main entry point, where dependencies are instantiated and application services—such as the HTTP server (hono main)-are started.

## The vision behind the backend architecture

We need to keep in mind, that is project is organised like this :

- in [features folder](src/features/), we have a set of features, each owning a subject on the application, and exposing public parts (service, schema, types...) so that they can be used anywhere in the backend.
- at the top level, we have consumers of those features. In this example, we only have one consumer, the [api server](src/api/). But we could imagine having other consumers, like CronJobs, BackgroundWorkers etc...

This things allow us to separate the concerns of the application, and make it easier to maintain. Consumers only consume interfaces exposed by the features, and does not have access to the internal implementation details.

## A Feature folder overview

> Taking as example the [`todo`](src/features/todo/) feature folder.

A feature folder has it's own sub architecure. It can basically contains anything but generally have one/many of those files:

- `src/features/todo/todo.service.ts`: the main service of the feature.
- `src/features/todo/todo.schema.ts`: the drizzle schemas definition.
- `src/features/todo/todo.dto.ts`: this contains dtos zod schemas/types used by the feature service methods. They can be used in consumers to validate/parse input data like request bodies in the api.
- `src/features/todo/todo.index.ts`: barrel file exporting the public parts of the feature.

## Dependency injection

In backend, most of router and services depends on external dependencies like database connection, and other services. To be able to test and maintain easily those parts, we do not use singleton, but instead use dependency injection.

We use a simple implementation of it, where each of those either take the external dependencies as constructor parameters, or function parameters. Then, our [main backend entry point](src/index.ts) instantiates those dependencies and passes them to the different parts of the application.

This allow us to easily swap out dependencies in tests, and to rely on only contracts/interfaces, on each consumers of those dependencies.

# Bun as runtime

We use Bun as runtime to run this backend, so we basically don't need to build it. We can just run it directly with run the index.ts file. Simplifying the development workflow and the way we run it in his [docker container](./Dockerfile).

## Running the infra locally

This backend needs to run alongside a database and maybe other infra services like an s3 like storage, a redis cache, etc.
We do have a [docker compose file](./compose.yaml) that can be used to run this infra locally.

You can interact with this local infra with the scripts from the [package.json](./package.json) :

```bash
bun run infra:up # starts the infra locally
bun run infra:up:d # starts the infra locally in detached mode
bun run infra:down # stops the infra locally
bun run infra:logs # shows the logs of the infra
```

Then just update the .env file to match your local infra configuration.

```bash
DATABASE_URL=postgresql://todo:todo@localhost:5432/todo
```
