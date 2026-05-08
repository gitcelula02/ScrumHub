/**
 * @module queryClient
 * Shared QueryClient instance for TanStack Query.
 *
 * IMPORTANT: Loaders run OUTSIDE the React component tree and cannot access
 * QueryClientProvider. The same QueryClient instance must be:
 * 1. Passed to createRouter() via context (router.tsx)
 * 2. Passed to QueryClientProvider (client.tsx or __root.tsx)
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});