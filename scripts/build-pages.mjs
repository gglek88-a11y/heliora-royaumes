import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

const rootFiles = [
  "index.html",
  "styles.css",
  "hero-reference.png",
  "hero2.png",
  "saya-astral.png",
  "kael-crimson.png",
  "lyra-lunar.png",
  "aurelion-african-power.png",
  "nyxara-african-power.png",
  "draven-african-power.png",
  "seraphine-african-power.png",
  "ragnar-african-power.png",
  "celestia-african-power.png",
  "varkhan-dragon.png",
  "isolde-frost.png",
  "morvane-necro.png",
  "citadel-redesign.png",
  "world-heliora-map.png",
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of rootFiles) {
  await cp(join(root, file), join(dist, file));
}

for (const directory of ["src", "data"]) {
  await cp(join(root, directory), join(dist, directory), { recursive: true });
}

await writeFile(join(dist, ".nojekyll"), "");

const files = await readdir(dist);
console.log(`GitHub Pages build ready: ${files.length} top-level entries copied to dist/.`);
