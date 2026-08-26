import type { ApiType } from "@todo/backend/api-type";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { hc } from "hono/client";
import { publicEnv } from "./env";

// To get authenticated in the api, we need to include in the request the session cookie.
// When using SSR, as we are in a middle server between the browser and the api, we need to forward the cookie from the client
// request, in the new request to the api. (this is not done automatically, credentials: "include" only works with for client side)
const getApiHeaders = createIsomorphicFn()
  .server((): Record<string, string> => {
    const cookie = getRequestHeader("cookie");

    return cookie ? { cookie } : {};
  })
  .client((): Record<string, string> => ({}));

export const apiClient = hc<ApiType>(publicEnv.VITE_API_URL, {
  init: {
    credentials: "include",
  },
  headers: getApiHeaders,
});
