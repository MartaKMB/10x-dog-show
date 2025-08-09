// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
    esbuild: {
      jsx: "automatic",
      jsxImportSource: "react",
    },
    optimizeDeps: {
      include: ["@supabase/supabase-js", "@supabase/ssr"],
    },
    ssr: {
      noExternal: ["@supabase/supabase-js", "@supabase/ssr"],
    },
  },
  adapter: node({
    mode: "standalone",
  }),
  experimental: { session: true },
});
