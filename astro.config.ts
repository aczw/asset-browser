import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";

import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [
    react(),
    tailwind({
      // Use existing CSS files
      applyBaseStyles: false,
    }),
  ],
  // Enable verbose logging for debugging
  vite: {
    logLevel: "info",
    define: {
      "process.env": process.env,
    },
  },
});
