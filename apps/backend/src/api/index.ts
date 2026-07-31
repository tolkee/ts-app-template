import { Hono } from "hono";
import { createTodoRoutes } from "./todo.routes";
import type { Services } from "#lib/services";
import { auth, UnauthorizedError } from "#features/auth";
import { authContextMiddleware } from "./middlewares/auth-context";
import { ApiErrorCode, type ApiErrorResponse } from "@todo/common/errors";
import { loggerMiddleware } from "./middlewares/logger";
import { requestId } from "hono/request-id";
import { cors } from "hono/cors";
import { env } from "#lib/env";

export function createApi(services: Services) {
  const todoRoutes = createTodoRoutes(services.todoService);

  return new Hono()
    .use(requestId())
    .use(
      cors({
        origin: env.TRUSTED_ORIGINS,
        credentials: true,
      }),
    )
    .use(loggerMiddleware)
    .use(authContextMiddleware)
    .all("/api/auth/*", (c) => auth.handler(c.req.raw))
    .route("api/todo", todoRoutes)
    .get("/api/health", (c) => {
      return c.json({ status: "ok" });
    })
    .onError((err, c) => {
      if (err instanceof UnauthorizedError) {
        return c.json(
          {
            code: ApiErrorCode.UNAUTHORIZED,
            message: "Unauthorized",
          } satisfies ApiErrorResponse,
          401,
        );
      }

      return c.json(
        {
          code: ApiErrorCode.INTERNAL_SERVER_ERROR,
          message: "Internal server error",
        } satisfies ApiErrorResponse,
        500,
      );
    });
}

export type ApiType = ReturnType<typeof createApi>;
