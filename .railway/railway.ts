import { defineRailway, github, group, postgres, project, service } from "railway/iac";

export default defineRailway((ctx) => {
  const production = ctx.environment === "production";
  const database = postgres("postgres");

  const backend = service("backend", {
    source: github("tolkee/ts-app-template", { branch: "main" }),
    start: "cd apps/backend && bun run start",
    healthcheck: "/api/health",
    healthcheckTimeout: 30,
    domains: production ? [{ domain: "api.todo.tolkee.dev", port: 3000 }] : [],
    env: {
      ENV: "prod",
      PORT: "3000",
      DATABASE_URL: database.env.DATABASE_URL,
      BETTER_AUTH_URL: "https://api.todo.tolkee.dev",
      TRUSTED_ORIGINS: "https://todo.tolkee.dev,https://ssr.todo.tolkee.dev",
      AUTH_DOMAIN: ".todo.tolkee.dev",
      BETTER_AUTH_SECRET: ctx.shared.BETTER_AUTH_SECRET,
      GOOGLE_CLIENT_ID: ctx.shared.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: ctx.shared.GOOGLE_CLIENT_SECRET,
    },
  });

  return project("ts-app-template", {
    resources: [group("Backend", [backend, database])],
  });
});
