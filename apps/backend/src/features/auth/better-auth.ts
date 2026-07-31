import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { db } from "#lib/db";
import { env } from "#lib/env";
import * as authSchema from "./auth.schema";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: authSchema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.TRUSTED_ORIGINS,
  advanced:
    env.ENV === "prod"
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: env.AUTH_DOMAIN,
          },
          useSecureCookies: true,
        }
      : undefined,
});

export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session.session;
