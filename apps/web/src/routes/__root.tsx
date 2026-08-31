import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";

import { Toaster } from "@todo/ui/components/toast";

import appCss from "@todo/ui/globals.css?url";
import { type RouterContext } from "../router";
import { authClient } from "#lib/auth";
import { ThemeProvider } from "#components/theme-provider";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Todo app",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  component: RootDocument,
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    return {
      user: session?.user ?? null,
      session: session?.session ?? null,
    };
  },
});

function RootDocument() {
  return (
    <>
      <HeadContent />
      <ThemeProvider defaultTheme="system" storageKey="theme">
        <Outlet />
        <Toaster />
        <Scripts />
      </ThemeProvider>
    </>
  );
}
