import * as React from "react";
import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { Body, Head, Html, Meta, Scripts } from "@tanstack/start";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import nprogress from "nprogress";
import "nprogress/nprogress.css";

import globalCSS from "@/globals.css?url";
import { validateCurrentSession } from "@/lib/auth";
import { Toaster } from "@/lib/components/ui/toaster";
import { NotFound } from "@/lib/components/errors/not-found";
import { Navbar } from "@/lib/components/common/navbar";

nprogress.configure({ showSpinner: false });

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  meta: () => [
    {
      charSet: "utf-8",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
  ],
  links: () => [{ rel: "stylesheet", href: globalCSS }],
  component: RootComponent,
  notFoundComponent: NotFound,
  beforeLoad: async () => {
    const session = await validateCurrentSession();
    return {
      session,
    };
  },
});

function RootComponent() {
  const router = useRouter();
  const { session } = Route.useRouteContext();
  router.subscribe(
    "onBeforeLoad",
    ({ pathChanged }) => pathChanged && nprogress.start(),
  );
  router.subscribe("onLoad", () => nprogress.done());

  return (
    <RootDocument>
      <div className="h-full w-full flex flex-col">
        <Navbar user={session.user} />
        <Outlet />
      </div>
      <Toaster />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Head>
        <Meta />
      </Head>
      <Body>
        {children}
        <Scripts />
        <ScrollRestoration getKey={(location) => location.pathname} />
        <ReactQueryDevtools initialIsOpen={false} />
      </Body>
    </Html>
  );
}