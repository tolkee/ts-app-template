import { createTodoSchema, TodoNotFoundError, type TodoService } from "#features/todo";
import { Hono } from "hono";
import { sValidator } from "@hono/standard-validator";
import { type ApiEnv } from "./types";
import { authGuardMiddleware } from "./middlewares/auth-guard";
import { ApiErrorCode, type ApiErrorResponse } from "@todo/common/errors";

export function createTodoRoutes(todoService: TodoService) {
  const routes = new Hono<ApiEnv>()
    .get("/", authGuardMiddleware, async (c) => {
      const userId = c.get("user").id;
      const todos = await todoService.getTodos(userId);

      return c.json(todos);
    })
    .post("/", authGuardMiddleware, sValidator("json", createTodoSchema), async (c) => {
      const userId = c.get("user").id;
      const body = c.req.valid("json");
      const todo = await todoService.createTodo(userId, body);

      return c.json(todo);
    })
    .onError((err, c) => {
      if (err instanceof TodoNotFoundError) {
        return c.json(
          {
            code: ApiErrorCode.TODO_NOT_FOUND,
            message: "Todo not found",
          } satisfies ApiErrorResponse,
          404,
        );
      }

      // let above router handle other errors
      throw err;
    });

  return routes;
}
