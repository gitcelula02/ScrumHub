import "../shim";
import React from "react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts, redirect } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "../styles/globals.css";

import appCss from "../styles/globals.css?url";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function RootBeforeLoad() {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, isLoading: true };
  }
  const userJson = localStorage.getItem('user');
  const token = localStorage.getItem('auth_token');
  const isAuthenticated = !!(userJson && token && userJson !== 'undefined');
  return { isAuthenticated, isLoading: false };
}

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = RootBeforeLoad();
    if (!isAuthenticated && location.pathname.startsWith('/app')) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ScrumHub — Gestión ágil al estilo VS Code" },
      { name: "description", content: "Plataforma de gestión de proyectos ágiles con interfaz inspirada en VS Code y asistente de IA integrado." },
      { name: "author", content: "ScrumHub Team" },
      { property: "og:title", content: "ScrumHub — Gestión ágil al estilo VS Code" },
      { property: "og:description", content: "Optimiza tu flujo de trabajo Scrum con una interfaz familiar, rápida y potente." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ScrumHub" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ScrumHub" },
      { name: "twitter:title", content: "ScrumHub — Gestión ágil al estilo VS Code" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  errorComponent: ({ error }) => (
    <div className="p-4 bg-red-900 text-white font-mono">
      <h1 className="text-xl font-bold">Root Error:</h1>
      <pre className="mt-2 text-xs">{error.message}</pre>
    </div>
  ),
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { AuthProvider } from "@/store/AuthContext";

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}
