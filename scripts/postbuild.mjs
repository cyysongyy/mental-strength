/**
 * Stamps the build commit into the service worker.
 *
 * public/ is copied verbatim by Vite, so sw.js never sees the `define`
 * substitutions the app bundle gets. Without this the cache name would be
 * constant across builds and old entries would never be cleared out.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const commit = (() => {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "dev";
  }
})();

const path = "dist/sw.js";
const source = readFileSync(path, "utf8");
if (!source.includes("__BUILD_COMMIT__")) {
  throw new Error("dist/sw.js has no __BUILD_COMMIT__ placeholder to stamp");
}
writeFileSync(path, source.replaceAll("__BUILD_COMMIT__", commit));
console.log(`sw.js stamped with ${commit}`);
