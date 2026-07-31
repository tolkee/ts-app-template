import { createMiddleware } from "hono/factory";
import type { AuthedApiEnv } from "../types";
import { UnauthorizedError } from "#features/auth";

export const authGuardMiddleware = createMiddleware<AuthedApiEnv>(async (c, next) => {
  if (!c.get("user")) {
    throw new UnauthorizedError("Unauthorized");
  }

  await next();
});
