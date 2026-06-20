import { rm } from "node:fs/promises";
import { glob } from "node:fs/promises";

const patterns = ["apps/*/dist", "apps/*/.next", "packages/*/dist", "coverage"];

for (const pattern of patterns) {
  for await (const path of glob(pattern)) {
    await rm(path, { recursive: true, force: true });
  }
}
