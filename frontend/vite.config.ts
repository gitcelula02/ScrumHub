import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackStart({
      client: {
        entry: "./src/client.tsx",
      },
      server: {
        entry: "./src/server.tsx",
      },
    }),
    react({ jsxRuntime: "automatic" }),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    host: "::",
    port: 8080,
  },
  optimizeDeps: {
    exclude: ["@tanstack/react-start"],
  },
});
