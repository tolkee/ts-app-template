import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";

import { Toaster } from "@todo/ui/components/toast";

import appCss from "@todo/ui/globals.css?url";
import { type RouterContext } from "../router";
import { getSession } from "#lib/auth";
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
  shellComponent: RootDocument,
  beforeLoad: async () => {
    const session = await getSession();

    return {
      user: session?.user ?? null,
      session: session?.session ?? null,
    };
  },
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="[--header-height:--spacing(14)] lg:[--header-height:--spacing(16)]"
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          {children}
          <Toaster />
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  );
}
