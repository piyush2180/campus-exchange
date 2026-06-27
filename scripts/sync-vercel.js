import fs from "node:fs";
import path from "node:path";

const srcConfig = path.resolve(process.cwd(), "dist/config.json");
const destConfig = path.resolve(process.cwd(), ".vercel/output/config.json");

if (fs.existsSync(srcConfig)) {
  fs.mkdirSync(path.dirname(destConfig), { recursive: true });
  fs.copyFileSync(srcConfig, destConfig);
  console.log("✔ [vercel-sync] Successfully copied dist/config.json to .vercel/output/config.json");
} else {
  console.warn("⚠ [vercel-sync] dist/config.json not found.");
}
