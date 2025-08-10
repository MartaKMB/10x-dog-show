import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node", // Node environment dla testów serwisów
    setupFiles: ["./src/test/unit/setup.ts"],
    pool: "threads",
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ["src/test/unit/lib/services/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["node_modules", "dist", ".astro", "**/*.d.ts"],
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
    },
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
