// @lovable.dev/vite-tanstack-config configuration for Vercel deployment.
// Explicitly override Nitro output paths so Vercel Build Output v3 API generates directly into .vercel/output.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "vercel",
    output: {
      dir: ".vercel/output",
      publicDir: ".vercel/output/static",
      serverDir: ".vercel/output/functions/__server.func",
    },
  },
});
