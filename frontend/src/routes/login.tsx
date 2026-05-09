import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/AuthPages";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
