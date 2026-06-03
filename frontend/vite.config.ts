import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
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
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_URL || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      exclude: ["@tanstack/react-start"],
    },
  };
});
