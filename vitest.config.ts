import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: [
      "src/**/*.{test,spec}.{js,ts,jsx,tsx}",
      "src/**/*.test.{js,ts,jsx,tsx}",
      "src/**/*.spec.{js,ts,jsx,tsx}",
    ],
    exclude: ["node_modules", "dist", ".astro", "**/*.d.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        ".astro/",
        "**/*.d.ts",
        "**/*.config.*",
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
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
