import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const SERVER_DIR = dirname(fileURLToPath(import.meta.url));
const APP_DIR = dirname(SERVER_DIR);

const STARTER_RESOURCES = Object.freeze({ gold: 420, food: 360, stone: 260, wood: 260, energy: 60, gems: 120, guildCoins: 0 });
const STARTER_CACHE_REWARD = Object.freeze({ gold: 180, food: 160, gems: 20 });
const CITADEL_UPGRADE_COSTS = Object.freeze({
  1: { gold: 180, stone: 90, wood: 70 },
  2: { gold: 360, stone: 180, wood: 140 },
  3: { gold: 720, stone: 360, wood: 280 },
});

const defaultDb = {
  profiles: {},
  kingdoms: {},
  idempotency: {},
  auditLogs: [],
};

async function readDb(dbFile) {
  try {
    return JSON.parse(await readFile(dbFile, "utf8"));
  } catch {
    return structuredClone(defaultDb);
  }
}

async function writeDb(db, storageDir, dbFile) {
  await mkdir(storageDir, { recursive: true });
  await writeFile(dbFile, JSON.stringify(db, null, 2));
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Access-Control-Allow-Origin": process.env.CORS_ORIGINS ?? "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Dev-User",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function sendError(response, status, code, message, requestId) {
  sendJson(response, status, { success: false, error: { code, message, requestId } });
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function cleanName(value, fallback = "Commandant") {
  const name = String(value ?? fallback).trim().replace(/[<>]/g, "").slice(0, 32);
  if (name.length < 3 || !/^[\p{L}\p{N} _'-]+$/u.test(name)) {
    throw new Error("INVALID_NAME");
  }
  return name;
}

function addResources(resources, reward) {
  for (const [key, amount] of Object.entries(reward)) {
    resources[key] = Math.max(0, Math.floor((resources[key] ?? 0) + amount));
  }
}

function canSpend(resources, cost) {
  return Object.entries(cost).every(([key, amount]) => (resources[key] ?? 0) >= amount);
}

function spendResources(resources, cost) {
  if (!canSpend(resources, cost)) {
    throw new Error("INSUFFICIENT_RESOURCES");
  }
  for (const [key, amount] of Object.entries(cost)) {
    resources[key] -= amount;
  }
}

function ensureProfile(db, user, name = "Commandant") {
  db.profiles[user.id] ??= {
    userId: user.id,
    email: user.email ?? "",
    name: cleanName(name, user.email?.split("@")[0] ?? "Commandant"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return db.profiles[user.id];
}

function ensureKingdom(db, user, payload = {}) {
  const existing = Object.values(db.kingdoms).find((kingdom) => kingdom.ownerUserId === user.id);
  if (existing) {
    return existing;
  }
  const id = `kingdom-${randomUUID()}`;
  const kingdom = {
    id,
    ownerUserId: user.id,
    name: cleanName(payload.kingdomName, "Royaume d'Heliora"),
    capitalName: cleanName(payload.capitalName, "Citadelle d'Heliora"),
    region: String(payload.region ?? "foret_mystique").slice(0, 32),
    heroId: String(payload.heroId ?? "maelis").slice(0, 32),
    level: 1,
    power: 80,
    resources: { ...STARTER_RESOURCES },
    buildings: { castle: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.kingdoms[id] = kingdom;
  return kingdom;
}

function audit(db, userId, action, details = {}) {
  db.auditLogs.unshift({
    id: randomUUID(),
    userId,
    action,
    details,
    createdAt: new Date().toISOString(),
  });
  db.auditLogs = db.auditLogs.slice(0, 500);
}

function idempotencyKeyFor(userId, key) {
  return `${userId}:${String(key ?? "").trim()}`;
}

function getIdempotent(db, userId, key) {
  if (!key) return null;
  return db.idempotency[idempotencyKeyFor(userId, key)] ?? null;
}

function setIdempotent(db, userId, key, result) {
  if (!key) return;
  db.idempotency[idempotencyKeyFor(userId, key)] = {
    result,
    createdAt: new Date().toISOString(),
  };
}

async function authenticate(request, config) {
  if (config.devAuth) {
    const devUser = request.headers["x-dev-user"];
    if (devUser) {
      return { id: String(devUser), email: `${devUser}@local.dev` };
    }
  }

  const authorization = request.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token || !config.supabaseUrl || !config.supabaseAnonKey) {
    return null;
  }

  const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return null;
  }
  const user = await response.json();
  return user?.id ? { id: user.id, email: user.email ?? "" } : null;
}

function findOwnKingdom(db, userId) {
  return Object.values(db.kingdoms).find((kingdom) => kingdom.ownerUserId === userId) ?? null;
}

function handleAction(db, user, body) {
  const idempotencyKey = body.idempotencyKey;
  const existing = getIdempotent(db, user.id, idempotencyKey);
  if (existing) {
    return existing.result;
  }

  const kingdom = findOwnKingdom(db, user.id);
  if (!kingdom) {
    throw new Error("KINGDOM_REQUIRED");
  }

  let result;
  if (body.type === "claim_starter_cache") {
    addResources(kingdom.resources, STARTER_CACHE_REWARD);
    result = { kingdom, reward: STARTER_CACHE_REWARD };
    audit(db, user.id, "claim_starter_cache", { reward: STARTER_CACHE_REWARD });
  } else if (body.type === "upgrade_citadel") {
    const currentLevel = Math.max(1, Number(kingdom.buildings.castle ?? kingdom.level ?? 1));
    const cost = CITADEL_UPGRADE_COSTS[currentLevel];
    if (!cost) {
      throw new Error("MAX_LEVEL_REACHED");
    }
    spendResources(kingdom.resources, cost);
    kingdom.buildings.castle = currentLevel + 1;
    kingdom.level = currentLevel + 1;
    kingdom.power += 80 + currentLevel * 40;
    result = { kingdom, cost, building: "castle", level: kingdom.level };
    audit(db, user.id, "upgrade_citadel", { cost, level: kingdom.level });
  } else {
    throw new Error("UNKNOWN_ACTION");
  }

  kingdom.updatedAt = new Date().toISOString();
  setIdempotent(db, user.id, idempotencyKey, result);
  return result;
}

export function createAuthoritativeServer(options = {}) {
  const config = {
    port: Number(options.port ?? process.env.PORT ?? 8790),
    storageDir: options.storageDir ?? process.env.HELIORA_SERVER_STORAGE_DIR ?? join(APP_DIR, "storage"),
    supabaseUrl: options.supabaseUrl ?? process.env.SUPABASE_URL ?? "",
    supabaseAnonKey: options.supabaseAnonKey ?? process.env.SUPABASE_ANON_KEY ?? "",
    devAuth: options.devAuth ?? process.env.HELIORA_DEV_AUTH === "true",
  };
  const dbFile = join(config.storageDir, "authoritative-db.json");

  return createServer(async (request, response) => {
    const requestId = randomUUID();
    if (request.method === "OPTIONS") {
      sendJson(response, 200, { success: true });
      return;
    }

    const url = new URL(request.url ?? "/", `http://127.0.0.1:${config.port}`);
    const db = await readDb(dbFile);

    try {
      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, { success: true, serverTime: new Date().toISOString(), mode: "authoritative-prealpha" });
        return;
      }

      const user = await authenticate(request, config);
      if (!user) {
        sendError(response, 401, "UNAUTHENTICATED", "Connexion serveur requise.", requestId);
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/me") {
        const profile = ensureProfile(db, user);
        await writeDb(db, config.storageDir, dbFile);
        sendJson(response, 200, { success: true, profile, kingdom: findOwnKingdom(db, user.id), serverTime: new Date().toISOString() });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/profile") {
        const body = await readBody(request);
        const profile = ensureProfile(db, user, body.name);
        profile.name = cleanName(body.name, profile.name);
        profile.updatedAt = new Date().toISOString();
        audit(db, user.id, "profile_update", { name: profile.name });
        await writeDb(db, config.storageDir, dbFile);
        sendJson(response, 200, { success: true, profile });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/kingdom") {
        const body = await readBody(request);
        ensureProfile(db, user, body.playerName);
        const kingdom = ensureKingdom(db, user, body);
        audit(db, user.id, "kingdom_create_or_restore", { kingdomId: kingdom.id });
        await writeDb(db, config.storageDir, dbFile);
        sendJson(response, 200, { success: true, kingdom });
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/kingdom") {
        sendJson(response, 200, { success: true, kingdom: findOwnKingdom(db, user.id) });
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/resources") {
        const kingdom = findOwnKingdom(db, user.id);
        sendJson(response, 200, { success: true, resources: kingdom?.resources ?? null, serverTime: new Date().toISOString() });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/actions") {
        const body = await readBody(request);
        if (!String(body.idempotencyKey ?? "").trim()) {
          sendError(response, 400, "IDEMPOTENCY_REQUIRED", "Une cle d'idempotence est requise.", requestId);
          return;
        }
        const result = handleAction(db, user, body);
        await writeDb(db, config.storageDir, dbFile);
        sendJson(response, 200, { success: true, ...result, serverTime: new Date().toISOString() });
        return;
      }

      sendError(response, 404, "NOT_FOUND", "Route inconnue.", requestId);
    } catch (error) {
      const code = error.message || "SERVER_ERROR";
      const status = ["INVALID_NAME", "IDEMPOTENCY_REQUIRED", "INSUFFICIENT_RESOURCES", "KINGDOM_REQUIRED", "MAX_LEVEL_REACHED", "UNKNOWN_ACTION"].includes(code) ? 400 : 500;
      sendError(response, status, code, "Action serveur refusee.", requestId);
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT ?? 8790);
  const server = createAuthoritativeServer({ port });
  server.listen(port, "127.0.0.1", () => {
    console.log(`Heliora authoritative server: http://127.0.0.1:${port}`);
  });
}
