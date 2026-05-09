import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/pages/LandingPage";

/**
 * @route /
 * Landing page - public entry point for unauthenticated users.
 */
export const Route = createFileRoute("/")({
  component: LandingPage,
});
