import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT ?? 8787);
const SERVER_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = dirname(SERVER_DIR);
const DATA_DIR = join(SERVER_DIR, "storage");
const DB_FILE = join(DATA_DIR, "mock-db.json");
const CONTENT_FILE = join(ROOT_DIR, "data", "game-content.json");

const defaultDb = {
  players: {},
  chat: [
    { from: "Ariane", text: "Serveur mock connecte. Les sauvegardes cloud arrivent." },
    { from: "Nora", text: "Evenement de guilde actif pendant 5 jours." },
  ],
  liveops: [
    {
      id: "ball_carnival",
      name: "Carnaval des Royaumes",
      goal: 500,
      reward: { gold: 900, food: 600, gems: 80 },
    },
  ],
};

async function readDb() {
  try {
    return JSON.parse(await readFile(DB_FILE, "utf8"));
  } catch {
    return structuredClone(defaultDb);
  }
}

async function writeDb(db) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

async function readContentPack() {
  try {
    return JSON.parse(await readFile(CONTENT_FILE, "utf8"));
  } catch {
    return {
      version: "embedded-fallback",
      liveEvents: defaultDb.liveops,
    };
  }
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function leaderboard(db) {
  return Object.values(db.players)
    .map((player) => ({
      name: player.name ?? player.playerId,
      guild: player.guild?.name?.slice(0, 3).toUpperCase() ?? "HDH",
      power: player.kingdomPower ?? 0,
    }))
    .sort((a, b) => b.power - a.power)
    .slice(0, 10);
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true });
    return;
  }

  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);
  const db = await readDb();

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, { ok: true, mode: "mock-mmo", now: Date.now() });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/liveops") {
      const content = await readContentPack();
      sendJson(response, 200, { liveops: content.liveEvents ?? db.liveops });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/content") {
      sendJson(response, 200, await readContentPack());
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/leaderboard") {
      sendJson(response, 200, { leaderboard: leaderboard(db) });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/chat") {
      const body = await readBody(request);
      db.chat = [{ from: body.from ?? "Commandant", text: body.text ?? "" }, ...db.chat].slice(0, 20);
      await writeDb(db);
      sendJson(response, 200, { chat: db.chat });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/sync") {
      const body = await readBody(request);
      const playerId = body.playerId ?? "anonymous";
      db.players[playerId] = {
        playerId,
        name: body.state?.guild?.name ? `${body.state.guild.name} Cmd` : "Commandant",
        guild: body.guild,
        kingdomPower: body.kingdomPower ?? 0,
        resources: body.resources,
        state: body.state,
        syncedAt: Date.now(),
      };
      await writeDb(db);
      sendJson(response, 200, {
        ok: true,
        playerId,
        syncedAt: db.players[playerId].syncedAt,
        leaderboard: leaderboard(db),
        chat: db.chat,
        liveops: (await readContentPack()).liveEvents ?? db.liveops,
      });
      return;
    }

    sendJson(response, 404, { error: "Route inconnue" });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Heliora mock backend: http://127.0.0.1:${PORT}`);
});
