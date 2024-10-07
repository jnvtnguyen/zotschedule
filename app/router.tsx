import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { QueryClient } from "@tanstack/react-query";
import { SuperJSON } from "superjson";

import { routeTree } from "./routeTree.gen";

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 60, // 1 Hour
        gcTime: 1000 * 60 * 60 * 24 * 7, // 1 Week
      },
    },
  });

  const router = createTanStackRouter({
    transformer: SuperJSON,
    routeTree,
    context: {
      queryClient,
    },
    defaultPendingMinMs: 0,
  });

  return routerWithQueryClient(router, queryClient);
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
