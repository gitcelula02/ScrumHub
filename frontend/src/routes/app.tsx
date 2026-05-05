import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";

/**
 * @component AuthGuard
 * Protects child routes from unauthenticated access.
 * Redirects to /login if the user is not authenticated once the auth
 * state has finished loading from localStorage.
 */
function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuthSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Render nothing while loading to prevent a flash of protected content
  if (isLoading) return null;

  // Render nothing while redirect is happening
  if (!isAuthenticated) return null;

  return <AppShell />;
}

/**
 * @route /app
 * Layout route for all authenticated pages.
 * All child routes under /app are protected by AuthGuard.
 */
export const Route = createFileRoute("/app")({
  component: AuthGuard,
});
