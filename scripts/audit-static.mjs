import { readFile } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "styles.css",
  "src/main.js",
  "service-worker.js",
  "manifest.webmanifest",
  "data/cloud-config.json",
  "data/supabase-schema.sql",
  "server/mock-backend.mjs",
];

const publicFilesToScan = [
  "index.html",
  "styles.css",
  "src/main.js",
  "service-worker.js",
  "manifest.webmanifest",
  "data/cloud-config.json",
];

const failures = [];
const warnings = [];

async function readText(file) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    failures.push(`Missing required file: ${file}`);
    return "";
  }
}

for (const file of requiredFiles) {
  await readText(file);
}

for (const file of publicFilesToScan) {
  const text = await readText(file);
  if (/service_role|SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL|JWT_SECRET|SESSION_SECRET/i.test(text)) {
    failures.push(`Potential server secret reference found in public file: ${file}`);
  }
}

const mainJs = await readText("src/main.js");
const styles = await readText("styles.css");
const schema = await readText("data/supabase-schema.sql");
const configRaw = await readText("data/cloud-config.json");

try {
  const config = JSON.parse(configRaw);
  if (config.provider === "supabase") {
    if (!String(config.supabaseUrl ?? "").startsWith("https://")) {
      failures.push("Supabase URL must be HTTPS.");
    }
    if (!config.supabaseAnonKey || /service_role/i.test(config.supabaseAnonKey)) {
      failures.push("Supabase public key is missing or unsafe.");
    }
  }
} catch {
  failures.push("data/cloud-config.json is not valid JSON.");
}

if (mainJs.split("\n").length > 4000) {
  warnings.push("src/main.js is still too large and must be modularized.");
}

if (styles.split("\n").length > 4000) {
  warnings.push("styles.css is still too large and should be split after the visual pass stabilizes.");
}

if (!/enable row level security/i.test(schema)) {
  failures.push("Supabase schema must enable RLS.");
}

if (/Date\.now\(\)|Math\.random\(/.test(mainJs)) {
  warnings.push("Client still controls timers/randomness. Move sensitive decisions to server.");
}

if (/addResources\(|spend\(/.test(mainJs)) {
  warnings.push("Client still mutates resources. Server authority is required for pre-alpha.");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  failures,
  warnings,
}, null, 2));

if (failures.length) {
  process.exitCode = 1;
}
