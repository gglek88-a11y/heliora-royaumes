import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { createAuthoritativeServer } from "../apps/server/src/server.mjs";

const root = process.cwd();
const storageDir = join(root, ".tmp-authoritative-test");
await rm(storageDir, { recursive: true, force: true });
await mkdir(storageDir, { recursive: true });

const port = 8799;
const server = createAuthoritativeServer({ port, storageDir, devAuth: true });

await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

async function waitForHealth() {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  throw new Error("Authoritative server did not start.");
}

async function api(path, options = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Dev-User": "test-user",
      ...(options.headers ?? {}),
    },
  });
  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    throw new Error(`API ${path} failed: ${JSON.stringify(payload)}`);
  }
  return payload;
}

try {
  await waitForHealth();
  await api("/v1/profile", {
    method: "POST",
    body: JSON.stringify({ name: "Testeur Heliora" }),
  });
  const created = await api("/v1/kingdom", {
    method: "POST",
    body: JSON.stringify({
      playerName: "Testeur Heliora",
      kingdomName: "Royaume Test",
      capitalName: "Aube Test",
      region: "foret_mystique",
      heroId: "maelis",
    }),
  });
  const before = created.kingdom.resources.gold;
  const action = await api("/v1/actions", {
    method: "POST",
    body: JSON.stringify({ type: "claim_starter_cache", idempotencyKey: "starter-cache-test-1" }),
  });
  const repeat = await api("/v1/actions", {
    method: "POST",
    body: JSON.stringify({ type: "claim_starter_cache", idempotencyKey: "starter-cache-test-1" }),
  });
  if (action.kingdom.resources.gold !== repeat.kingdom.resources.gold) {
    throw new Error("Idempotent action returned inconsistent resource state.");
  }
  if (action.kingdom.resources.gold <= before) {
    throw new Error("Starter cache did not grant server-owned resources.");
  }
  const upgrade = await api("/v1/actions", {
    method: "POST",
    body: JSON.stringify({ type: "upgrade_citadel", idempotencyKey: "upgrade-citadel-test-1" }),
  });
  if (upgrade.kingdom.level < 2) {
    throw new Error("Citadel upgrade did not advance kingdom level.");
  }
  console.log(JSON.stringify({ ok: true, tested: ["profile", "kingdom", "resources", "idempotency", "upgrade_citadel"] }, null, 2));
} finally {
  await new Promise((resolve) => server.close(resolve));
  await rm(storageDir, { recursive: true, force: true });
}
