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

// @ts-ignore
import css from "../globals.css?url";
import { NotFound } from "@/lib/components/errors/not-found";
import { Navbar } from "@/lib/components/navbar";

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
  links: () => [{ rel: "stylesheet", href: css }],
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  const router = useRouter();
  router.subscribe(
    "onBeforeLoad",
    ({ pathChanged }) => pathChanged && nprogress.start(),
  );
  router.subscribe("onLoad", () => nprogress.done());

  return (
    <RootDocument>
      <Navbar />
      <Outlet />
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
        <ScrollRestoration />
        <Scripts />
      </Body>
    </Html>
  );
}
