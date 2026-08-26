import { createAuthClient } from "better-auth/react";
import { publicEnv } from "./env";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const authClient = createAuthClient({
  baseURL: publicEnv.VITE_API_URL,
});

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const cookie = headers.get("cookie");

  const result = await authClient.getSession({
    fetchOptions: { headers: { cookie } },
  });

  return result.data;
});
