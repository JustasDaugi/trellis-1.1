import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: 'node',
    isolate: true,
    threads: false,
    globals: true,
    coverage: {
      provider: 'v8',
      include: [
        '**/src/**/*.ts',
      ],
      exclude: [
        '**/src/database/**',
        '**/src/entities/**',
        '**/src/trpc/index.ts',
        '**/src/repositories/**',
      ],
    },
    env: loadEnv('', process.cwd(), ''),
    sequence: {
      concurrent: false,
      shuffle: false,

    },
    poolOptions: {
      threads: {
        isolate: true
      }
    }
  },
  resolve: {
    alias: {
      '@server': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
