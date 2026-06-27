// @lovable.dev/vite-tanstack-config already includes default plugins.
// Configure nitro preset for Vercel deployment so Vercel outputs serverless functions + static assets correctly.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "vercel",
  },
});
