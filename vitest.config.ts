import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom", // Domyślnie jsdom dla React komponentów
    setupFiles: ["./src/test/unit/setup.ts"],
    pool: "threads",
    testTimeout: 30000,
    hookTimeout: 30000,
    include: [
      "src/**/*.{test,spec}.{js,ts,jsx,tsx}",
      "src/**/*.test.{js,ts,jsx,tsx}",
      "src/**/*.spec.{js,ts,jsx,tsx}",
    ],
    exclude: [
      "node_modules",
      "dist",
      ".astro",
      "**/*.d.ts",
      "src/test/e2e/**/*", // Wykluczamy testy e2e
      "**/*.e2e.{js,ts,jsx,tsx}", // Wykluczamy pliki e2e
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        ".astro/",
        "src/test/**",
        "src/env.d.ts",
      ],
      thresholds: {
        global: {
          lines: 30,
          branches: 20,
          functions: 25,
          statements: 30,
        },
      },
    },
    // Konfiguracja dla różnych typów testów
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Konfiguracja środowiska testowego
    env: {
      NODE_ENV: "test",
      VITEST: "true",
      // Ustawienie flagi dla testów z chmurą
      SUPABASE_TEST_MODE: "true",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
