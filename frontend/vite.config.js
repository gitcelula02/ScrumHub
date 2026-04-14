import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite configuration for ScrumHub.
 *
 * Path alias @/ maps to src/ — use it everywhere instead of relative paths.
 * Example: import { EpicBadge } from '@/components/ui'
 *
 * If you add new top-level folders under src/, add them here too.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
});
