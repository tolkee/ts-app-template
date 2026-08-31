import { defineRailway, github, group, postgres, preserve, project, service } from "railway/iac";

export default defineRailway((ctx) => {
  const production = ctx.environment === "production";
  const database = postgres("Postgres");

  const backend = service("backend", {
    source: github("tolkee/ts-app-template", { branch: "main", checkSuites: true }),
    build: {
      watchPatterns: [
        "/apps/backend/**",
        "/packages/common/**",
        "/packages/ts-config/**",
        "/package.json",
        "/bun.lock",
        "/turbo.json",
      ],
    },
    deploy: {
      startCommand: "cd apps/backend && bun run start",
      preDeployCommand: ["cd apps/backend && bun run db:migrate"],
      healthcheckPath: "/api/health",
      healthcheckTimeout: 30,
      restartPolicyType: "ON_FAILURE",
      restartPolicyMaxRetries: 5,
    },
    domains: production ? [{ domain: "api.todo.tolkee.dev", port: 3000 }] : [],
    env: {
      ENV: "prod",
      PORT: "3000",
      DATABASE_URL: database.env.DATABASE_URL,
      BETTER_AUTH_URL: "https://api.todo.tolkee.dev",
      TRUSTED_ORIGINS: "https://todo.tolkee.dev,https://ssr.todo.tolkee.dev",
      AUTH_DOMAIN: ".todo.tolkee.dev",
      BETTER_AUTH_SECRET: preserve(),
      GOOGLE_CLIENT_ID: preserve(),
      GOOGLE_CLIENT_SECRET: preserve(),
    },
  });

  return project("ts-app-template", {
    resources: [group("Backend", [backend, database])],
  });
});
