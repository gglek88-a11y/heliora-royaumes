import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const SERVER_DIR = dirname(fileURLToPath(import.meta.url));
const APP_DIR = dirname(SERVER_DIR);

const STARTER_RESOURCES = Object.freeze({ gold: 420, food: 360, stone: 260, wood: 260, energy: 60, gems: 120, guildCoins: 0 });
const STARTER_CACHE_REWARD = Object.freeze({ gold: 180, food: 160, gems: 20 });
const DAILY_REWARD = Object.freeze({ gold: 240, food: 240, energy: 20, gems: 25 });
const EVENT_REWARDS = Object.freeze({
  ball_carnival: { gold: 900, food: 600, gems: 80 },
  guild_expedition: { stone: 700, wood: 700, guildCoins: 120 },
});

const BUILDING_COSTS = Object.freeze({
  castle: { gold: 180, stone: 90, wood: 70 },
  farm: { gold: 60, wood: 35 },
  lumber: { gold: 65, food: 30 },
  quarry: { gold: 80, wood: 45 },
  barracks: { gold: 120, food: 70, wood: 50 },
  academy: { gold: 160, stone: 80 },
  wall: { gold: 140, stone: 120 },
  market: { gold: 110, wood: 60 },
  hospital: { gold: 130, food: 90, stone: 55 },
  forge: { gold: 170, stone: 100, wood: 80 },
  embassy: { gold: 190, food: 90, stone: 85 },
  watchtower: { gold: 150, stone: 105 },
  temple: { gold: 220, gems: 20, stone: 130 },
  vault: { gold: 135, stone: 90 },
  portal: { gold: 260, gems: 35, stone: 160 },
});

const UNIT_RULES = Object.freeze({
  guard: { type: "infantry", power: 10, seconds: 4, cost: { food: 18, gold: 8 } },
  archer: { type: "ranged", power: 14, seconds: 5, cost: { food: 14, wood: 16, gold: 10 } },
  rider: { type: "cavalry", power: 26, seconds: 7, cost: { food: 28, gold: 20, stone: 8 } },
  ram: { type: "siege", power: 34, seconds: 9, cost: { wood: 36, stone: 28, gold: 18 } },
  mage: { type: "magic", power: 40, seconds: 10, cost: { food: 22, gems: 4, gold: 26 } },
});

const FORMATION_RULES = Object.freeze({
  balanced: { counter: "charge", weakTo: "arcane", bonusType: "all" },
  shieldwall: { counter: "volley", weakTo: "siege", bonusType: "infantry" },
  volley: { counter: "balanced", weakTo: "charge", bonusType: "ranged" },
  charge: { counter: "siege", weakTo: "shieldwall", bonusType: "cavalry" },
  siege: { counter: "shieldwall", weakTo: "charge", bonusType: "siege" },
  arcane: { counter: "balanced", weakTo: "volley", bonusType: "magic" },
});

const LIVE_EVENTS = Object.freeze([
  { id: "ball_carnival", name: "Carnaval solaire", tag: "LIVE", goal: 900, reward: EVENT_REWARDS.ball_carnival, endsInHours: 24 },
  { id: "guild_expedition", name: "Expedition de guilde", tag: "GUILDE", goal: 700, reward: EVENT_REWARDS.guild_expedition, endsInHours: 24 },
]);

const defaultDb = {
  profiles: {},
  kingdoms: {},
  guilds: {},
  guildMembers: {},
  guildInvites: {},
  idempotency: {},
  auditLogs: [],
};

function clone(value) {
  return structuredClone(value);
}

async function fileReadDb(dbFile) {
  try {
    return JSON.parse(await readFile(dbFile, "utf8"));
  } catch {
    return clone(defaultDb);
  }
}

async function fileWriteDb(db, storageDir, dbFile) {
  await mkdir(storageDir, { recursive: true });
  await writeFile(dbFile, JSON.stringify(db, null, 2));
}

async function supabaseRequest(config, path, options = {}) {
  const response = await fetch(`${config.supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`SUPABASE_STORAGE_${response.status}:${text}`);
  }
  if (response.status === 204) return null;
  return response.json().catch(() => null);
}

function rowToMap(rows = [], key) {
  return Object.fromEntries((rows ?? []).map((row) => [row[key], row]));
}

function memberKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

async function supabaseReadDb(config) {
  const [profiles, kingdoms, guilds, guildMembers, guildInvites, actions, auditLogs] = await Promise.all([
    supabaseRequest(config, "/rest/v1/heliora_server_profiles?select=*"),
    supabaseRequest(config, "/rest/v1/heliora_server_kingdoms?select=*"),
    supabaseRequest(config, "/rest/v1/heliora_server_guilds?select=*"),
    supabaseRequest(config, "/rest/v1/heliora_server_guild_members?select=*"),
    supabaseRequest(config, "/rest/v1/heliora_server_guild_invites?select=*"),
    supabaseRequest(config, "/rest/v1/heliora_server_actions?select=*"),
    supabaseRequest(config, "/rest/v1/heliora_server_audit_logs?select=*&order=created_at.desc&limit=500"),
  ]);

  return {
    profiles: rowToMap((profiles ?? []).map((row) => ({
      userId: row.user_id,
      email: row.email,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })), "userId"),
    kingdoms: rowToMap((kingdoms ?? []).map((row) => ({
      id: row.id,
      ownerUserId: row.owner_user_id,
      name: row.name,
      capitalName: row.capital_name,
      region: row.region,
      heroId: row.hero_id,
      level: row.level,
      power: row.power,
      resources: row.resources ?? {},
      buildings: row.buildings ?? {},
      units: row.units ?? {},
      training: row.training ?? [],
      eventProgress: row.event_progress ?? {},
      claimedRewards: row.claimed_rewards ?? [],
      guildId: row.guild_id ?? "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })), "id"),
    guilds: rowToMap((guilds ?? []).map((row) => ({
      id: row.id,
      ownerUserId: row.owner_user_id,
      name: row.name,
      tag: row.tag,
      description: row.description ?? "",
      power: row.power ?? 0,
      score: row.score ?? 0,
      memberCount: row.member_count ?? 1,
      isOpen: row.is_open ?? true,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })), "id"),
    guildMembers: Object.fromEntries((guildMembers ?? []).map((row) => [memberKey(row.guild_id, row.user_id), {
      guildId: row.guild_id,
      userId: row.user_id,
      playerId: row.player_id,
      name: row.name,
      role: row.role,
      kingdomPower: row.kingdom_power ?? 0,
      contribution: row.contribution ?? 0,
      joinedAt: row.joined_at,
    }])),
    guildInvites: rowToMap((guildInvites ?? []).map((row) => ({
      id: row.id,
      guildId: row.guild_id,
      invitedEmail: row.invited_email,
      invitedUserId: row.invited_user_id,
      createdBy: row.created_by,
      status: row.status,
      createdAt: row.created_at,
    })), "id"),
    idempotency: Object.fromEntries((actions ?? []).map((row) => [`${row.user_id}:${row.idempotency_key}`, {
      result: row.result,
      createdAt: row.created_at,
    }])),
    auditLogs: (auditLogs ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      action: row.action,
      details: row.details ?? {},
      createdAt: row.created_at,
    })),
  };
}

async function supabaseWriteDb(db, config) {
  const now = new Date().toISOString();
  const profiles = Object.values(db.profiles).map((profile) => ({
    user_id: profile.userId,
    email: profile.email ?? "",
    name: profile.name,
    created_at: profile.createdAt ?? now,
    updated_at: profile.updatedAt ?? now,
  }));
  const kingdoms = Object.values(db.kingdoms).map((kingdom) => ({
    id: kingdom.id,
    owner_user_id: kingdom.ownerUserId,
    name: kingdom.name,
    capital_name: kingdom.capitalName,
    region: kingdom.region,
    hero_id: kingdom.heroId,
    level: kingdom.level,
    power: kingdom.power,
    resources: kingdom.resources ?? {},
    buildings: kingdom.buildings ?? {},
    units: kingdom.units ?? {},
    training: kingdom.training ?? [],
    event_progress: kingdom.eventProgress ?? {},
    claimed_rewards: kingdom.claimedRewards ?? [],
    guild_id: kingdom.guildId || null,
    created_at: kingdom.createdAt ?? now,
    updated_at: kingdom.updatedAt ?? now,
  }));
  const guilds = Object.values(db.guilds).map((guild) => ({
    id: guild.id,
    owner_user_id: guild.ownerUserId,
    name: guild.name,
    tag: guild.tag,
    description: guild.description ?? "",
    power: guild.power ?? 0,
    score: guild.score ?? 0,
    member_count: guild.memberCount ?? 1,
    is_open: guild.isOpen ?? true,
    created_at: guild.createdAt ?? now,
    updated_at: guild.updatedAt ?? now,
  }));
  const members = Object.values(db.guildMembers).map((member) => ({
    guild_id: member.guildId,
    user_id: member.userId,
    player_id: member.playerId,
    name: member.name,
    role: member.role,
    kingdom_power: member.kingdomPower ?? 0,
    contribution: member.contribution ?? 0,
    joined_at: member.joinedAt ?? now,
  }));
  const invites = Object.values(db.guildInvites).map((invite) => ({
    id: invite.id,
    guild_id: invite.guildId,
    invited_email: invite.invitedEmail,
    invited_user_id: invite.invitedUserId || null,
    created_by: invite.createdBy,
    status: invite.status,
    created_at: invite.createdAt ?? now,
  }));
  const actions = Object.entries(db.idempotency).map(([key, entry]) => {
    const [userId, ...rest] = key.split(":");
    return {
      user_id: userId,
      idempotency_key: rest.join(":"),
      result: entry.result ?? {},
      created_at: entry.createdAt ?? now,
    };
  });
  const logs = (db.auditLogs ?? []).slice(0, 500).map((log) => ({
    id: log.id,
    user_id: log.userId,
    action: log.action,
    details: log.details ?? {},
    created_at: log.createdAt ?? now,
  }));

  const upsert = async (path, rows, conflict) => {
    if (!rows.length) return null;
    return supabaseRequest(config, `${path}?on_conflict=${conflict}`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify(rows),
    });
  };

  await upsert("/rest/v1/heliora_server_profiles", profiles, "user_id");
  await upsert("/rest/v1/heliora_server_kingdoms", kingdoms, "id");
  await upsert("/rest/v1/heliora_server_guilds", guilds, "id");
  await upsert("/rest/v1/heliora_server_guild_members", members, "guild_id,user_id");
  await upsert("/rest/v1/heliora_server_guild_invites", invites, "id");
  await upsert("/rest/v1/heliora_server_actions", actions, "user_id,idempotency_key");
  await upsert("/rest/v1/heliora_server_audit_logs", logs, "id");
}

function createStorage(config) {
  const dbFile = join(config.storageDir, "authoritative-db.json");
  const supabaseEnabled = config.storageProvider === "supabase" && config.supabaseUrl && config.supabaseServiceRoleKey;
  return {
    mode: supabaseEnabled ? "supabase-postgres" : "file",
    async read() {
      return supabaseEnabled ? supabaseReadDb(config) : fileReadDb(dbFile);
    },
    async write(db) {
      if (supabaseEnabled) {
        await supabaseWriteDb(db, config);
      } else {
        await fileWriteDb(db, config.storageDir, dbFile);
      }
    },
  };
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
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function cleanName(value, fallback = "Commandant") {
  const name = String(value ?? fallback).trim().replace(/[<>]/g, "").slice(0, 42);
  if (name.length < 3 || !/^[\p{L}\p{N} _'-]+$/u.test(name)) throw new Error("INVALID_NAME");
  return name;
}

function cleanTag(value, fallback = "HDH") {
  return String(value ?? fallback).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4).padEnd(3, "H");
}

function addResources(resources, reward) {
  for (const [key, amount] of Object.entries(reward ?? {})) {
    resources[key] = Math.max(0, Math.floor((resources[key] ?? 0) + Number(amount ?? 0)));
  }
}

function scaleCost(cost, multiplier) {
  return Object.fromEntries(Object.entries(cost).map(([key, amount]) => [key, Math.ceil(amount * multiplier)]));
}

function canSpend(resources, cost) {
  return Object.entries(cost).every(([key, amount]) => (resources[key] ?? 0) >= amount);
}

function spendResources(resources, cost) {
  if (!canSpend(resources, cost)) throw new Error("INSUFFICIENT_RESOURCES");
  for (const [key, amount] of Object.entries(cost)) resources[key] -= amount;
}

function deterministicRoll(seed, min = 0.9, max = 1.12) {
  const hash = createHash("sha256").update(seed).digest("hex").slice(0, 8);
  const ratio = parseInt(hash, 16) / 0xffffffff;
  return min + (max - min) * ratio;
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
  if (existing) return existing;
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
    units: {},
    training: [],
    eventProgress: {},
    claimedRewards: [],
    guildId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.kingdoms[id] = kingdom;
  return kingdom;
}

function findOwnKingdom(db, userId) {
  return Object.values(db.kingdoms).find((kingdom) => kingdom.ownerUserId === userId) ?? null;
}

function audit(db, userId, action, details = {}) {
  db.auditLogs.unshift({ id: randomUUID(), userId, action, details, createdAt: new Date().toISOString() });
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
  db.idempotency[idempotencyKeyFor(userId, key)] = { result, createdAt: new Date().toISOString() };
}

async function authenticate(request, config) {
  if (config.devAuth) {
    const devUser = request.headers["x-dev-user"];
    if (devUser) return { id: String(devUser), email: `${devUser}@local.dev` };
  }
  const authorization = request.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token || !config.supabaseUrl || !config.supabaseAnonKey) return null;
  const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: { apikey: config.supabaseAnonKey, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  const user = await response.json();
  return user?.id ? { id: user.id, email: user.email ?? "" } : null;
}

function buildingUpgradeCost(kingdom, buildingId) {
  const base = BUILDING_COSTS[buildingId];
  if (!base) throw new Error("UNKNOWN_BUILDING");
  const level = kingdom.buildings?.[buildingId] ?? 0;
  const multiplier = level === 0 ? 1 : Math.pow(1.68, level);
  return scaleCost(base, multiplier);
}

function trainCost(unitId, amount) {
  const unit = UNIT_RULES[unitId];
  if (!unit) throw new Error("UNKNOWN_UNIT");
  return scaleCost(unit.cost, amount);
}

function troopsPower(units = {}) {
  return Object.entries(units).reduce((sum, [unitId, amount]) => sum + (UNIT_RULES[unitId]?.power ?? 0) * Number(amount ?? 0), 0);
}

function formationMultiplier(formationId, enemyFormation) {
  const formation = FORMATION_RULES[formationId] ?? FORMATION_RULES.balanced;
  let multiplier = 1;
  if (formation.counter === enemyFormation) multiplier += 0.18;
  if (formation.weakTo === enemyFormation) multiplier -= 0.14;
  return Math.max(0.72, multiplier);
}

function applyUnitLosses(kingdom, sentUnits = {}, lossRate) {
  const losses = {};
  kingdom.units ??= {};
  for (const [unitId, sent] of Object.entries(sentUnits)) {
    const available = kingdom.units[unitId] ?? 0;
    const lost = Math.min(available, Math.floor(Number(sent ?? 0) * lossRate));
    kingdom.units[unitId] = Math.max(0, available - lost);
    losses[unitId] = lost;
  }
  return losses;
}

function actionUpgradeBuilding(db, user, kingdom, body) {
  const buildingId = String(body.payload?.buildingId ?? body.buildingId ?? "castle");
  const current = kingdom.buildings?.[buildingId] ?? 0;
  const castleLevel = kingdom.buildings?.castle ?? kingdom.level ?? 1;
  if (buildingId !== "castle" && current >= castleLevel) throw new Error("CASTLE_LEVEL_REQUIRED");
  const cost = buildingUpgradeCost(kingdom, buildingId);
  spendResources(kingdom.resources, cost);
  kingdom.buildings[buildingId] = current + 1;
  if (buildingId === "castle") kingdom.level = kingdom.buildings.castle;
  kingdom.power += 55 + current * 25;
  audit(db, user.id, "upgrade_building", { buildingId, level: kingdom.buildings[buildingId], cost });
  return { kingdom, cost, building: buildingId, level: kingdom.buildings[buildingId] };
}

function actionTrainUnits(db, user, kingdom, body) {
  const unitId = String(body.payload?.unitId ?? body.unitId ?? "");
  const amount = Math.min(5000, Math.max(1, Math.floor(Number(body.payload?.amount ?? body.amount ?? 1))));
  if ((kingdom.buildings?.barracks ?? 0) <= 0) throw new Error("BARRACKS_REQUIRED");
  const cost = trainCost(unitId, amount);
  spendResources(kingdom.resources, cost);
  kingdom.units ??= {};
  kingdom.units[unitId] = (kingdom.units[unitId] ?? 0) + amount;
  kingdom.power += Math.floor((UNIT_RULES[unitId]?.power ?? 0) * amount * 0.35);
  audit(db, user.id, "train_units", { unitId, amount, cost });
  return { kingdom, unitId, amount, cost };
}

function actionClaimReward(db, user, kingdom, body) {
  const rewardId = String(body.payload?.rewardId ?? body.rewardId ?? "daily_login");
  const eventId = String(body.payload?.eventId ?? body.eventId ?? "");
  const claimKey = eventId ? `${rewardId}:${eventId}` : rewardId;
  kingdom.claimedRewards ??= [];
  if (kingdom.claimedRewards.includes(claimKey)) throw new Error("REWARD_ALREADY_CLAIMED");
  const reward = rewardId === "daily_login"
    ? DAILY_REWARD
    : rewardId === "event_reward" && EVENT_REWARDS[eventId]
      ? EVENT_REWARDS[eventId]
      : STARTER_CACHE_REWARD;
  addResources(kingdom.resources, reward);
  kingdom.claimedRewards.push(claimKey);
  audit(db, user.id, "claim_reward", { claimKey, reward });
  return { kingdom, reward, claimKey };
}

function actionResolveBattle(db, user, kingdom, body) {
  const payload = body.payload ?? body;
  const node = payload.node ?? {};
  const sentUnits = payload.units ?? {};
  const formation = String(payload.formation ?? "balanced");
  const enemyFormation = String(node.enemyFormation ?? "balanced");
  const heroPower = Math.max(0, Number(payload.heroPower ?? 0));
  const nodePower = Math.max(1, Number(node.power ?? 100));
  const basePower = troopsPower(sentUnits) + heroPower;
  const roll = deterministicRoll(`${user.id}:${body.idempotencyKey}:${node.id ?? node.name}`);
  const attackPower = Math.floor(basePower * formationMultiplier(formation, enemyFormation) * roll);
  const victory = attackPower >= nodePower;
  const pressure = nodePower / Math.max(1, attackPower);
  const lossRate = Math.min(0.34, victory ? 0.04 + pressure * 0.04 : 0.12 + pressure * 0.09);
  const losses = applyUnitLosses(kingdom, sentUnits, lossRate);
  const reward = victory ? Object.fromEntries(Object.entries(node.reward ?? {}).map(([key, value]) => [key, Math.max(0, Math.floor(Number(value ?? 0)))]) ) : {};
  if (victory) {
    addResources(kingdom.resources, reward);
    kingdom.power += Math.floor(nodePower * 0.04);
  }
  const report = {
    id: `srv-battle-${randomUUID()}`,
    node: node.name ?? "Cible",
    victory,
    formation,
    enemyFormation,
    attackPower,
    enemyPower: nodePower,
    losses,
    reward,
    createdAt: Date.now(),
    serverAuthoritative: true,
  };
  audit(db, user.id, "resolve_battle", report);
  return { kingdom, report, reward, losses, victory };
}

function actionHarvestReturn(db, user, kingdom, body) {
  const reward = Object.fromEntries(Object.entries(body.payload?.reward ?? {}).map(([key, value]) => [key, Math.max(0, Math.min(50000, Math.floor(Number(value ?? 0))))]));
  addResources(kingdom.resources, reward);
  audit(db, user.id, "harvest_return", { reward });
  return { kingdom, reward };
}

function actionGuildHelp(db, user, kingdom) {
  const guildId = kingdom.guildId;
  if (!guildId || !db.guilds[guildId]) throw new Error("GUILD_REQUIRED");
  const member = db.guildMembers[memberKey(guildId, user.id)];
  if (!member) throw new Error("GUILD_REQUIRED");
  member.contribution = (member.contribution ?? 0) + 35;
  db.guilds[guildId].score = (db.guilds[guildId].score ?? 0) + 35;
  audit(db, user.id, "guild_help", { guildId });
  return { kingdom, guild: db.guilds[guildId], member };
}

function handleAction(db, user, body) {
  const idempotencyKey = body.idempotencyKey;
  const existing = getIdempotent(db, user.id, idempotencyKey);
  if (existing) return existing.result;
  const kingdom = findOwnKingdom(db, user.id);
  if (!kingdom) throw new Error("KINGDOM_REQUIRED");

  let result;
  if (body.type === "claim_starter_cache") {
    addResources(kingdom.resources, STARTER_CACHE_REWARD);
    result = { kingdom, reward: STARTER_CACHE_REWARD };
    audit(db, user.id, "claim_starter_cache", { reward: STARTER_CACHE_REWARD });
  } else if (body.type === "upgrade_citadel") {
    result = actionUpgradeBuilding(db, user, kingdom, { ...body, payload: { buildingId: "castle" } });
  } else if (body.type === "upgrade_building") {
    result = actionUpgradeBuilding(db, user, kingdom, body);
  } else if (body.type === "train_units") {
    result = actionTrainUnits(db, user, kingdom, body);
  } else if (body.type === "claim_reward") {
    result = actionClaimReward(db, user, kingdom, body);
  } else if (body.type === "resolve_battle") {
    result = actionResolveBattle(db, user, kingdom, body);
  } else if (body.type === "harvest_return") {
    result = actionHarvestReturn(db, user, kingdom, body);
  } else if (body.type === "guild_help") {
    result = actionGuildHelp(db, user, kingdom);
  } else {
    throw new Error("UNKNOWN_ACTION");
  }

  kingdom.updatedAt = new Date().toISOString();
  setIdempotent(db, user.id, idempotencyKey, result);
  return result;
}

function guildMemberRows(db, guildId) {
  return Object.values(db.guildMembers).filter((member) => member.guildId === guildId);
}

function publicGuild(guild) {
  return {
    id: guild.id,
    name: guild.name,
    tag: guild.tag,
    score: guild.score ?? 0,
    power: guild.power ?? 0,
    memberCount: guild.memberCount ?? 1,
    isOpen: guild.isOpen ?? true,
  };
}

function ownGuild(db, userId) {
  const member = Object.values(db.guildMembers).find((entry) => entry.userId === userId);
  if (!member) return null;
  const guild = db.guilds[member.guildId];
  return guild ? { ...publicGuild(guild), role: member.role, members: guildMemberRows(db, guild.id) } : null;
}

function createGuild(db, user, kingdom, body) {
  if (ownGuild(db, user.id)) throw new Error("GUILD_ALREADY_JOINED");
  const id = `guild-${randomUUID()}`;
  const guild = {
    id,
    ownerUserId: user.id,
    name: cleanName(body.name, "Alliance Heliora"),
    tag: cleanTag(body.tag, "HDH"),
    description: String(body.description ?? "Alliance fondee depuis Heliora.").slice(0, 180),
    power: kingdom.power ?? 0,
    score: 0,
    memberCount: 1,
    isOpen: body.isOpen ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.guilds[id] = guild;
  db.guildMembers[memberKey(id, user.id)] = {
    guildId: id,
    userId: user.id,
    playerId: kingdom.id,
    name: db.profiles[user.id]?.name ?? "Commandant",
    role: "leader",
    kingdomPower: kingdom.power ?? 0,
    contribution: 0,
    joinedAt: new Date().toISOString(),
  };
  kingdom.guildId = id;
  audit(db, user.id, "guild_create", { guildId: id });
  return { guild: publicGuild(guild), role: "leader", members: guildMemberRows(db, id) };
}

function joinGuild(db, user, kingdom, guildId) {
  const guild = db.guilds[guildId];
  if (!guild || !guild.isOpen) throw new Error("GUILD_CLOSED");
  if (ownGuild(db, user.id)) throw new Error("GUILD_ALREADY_JOINED");
  db.guildMembers[memberKey(guildId, user.id)] = {
    guildId,
    userId: user.id,
    playerId: kingdom.id,
    name: db.profiles[user.id]?.name ?? "Commandant",
    role: "member",
    kingdomPower: kingdom.power ?? 0,
    contribution: 0,
    joinedAt: new Date().toISOString(),
  };
  guild.memberCount = guildMemberRows(db, guildId).length;
  guild.power = guildMemberRows(db, guildId).reduce((sum, member) => sum + (member.kingdomPower ?? 0), 0);
  guild.updatedAt = new Date().toISOString();
  kingdom.guildId = guildId;
  audit(db, user.id, "guild_join", { guildId });
  return { guild: publicGuild(guild), role: "member", members: guildMemberRows(db, guildId) };
}

function inviteGuild(db, user, guildId, email) {
  const member = db.guildMembers[memberKey(guildId, user.id)];
  if (!member || !["leader", "officer"].includes(member.role)) throw new Error("GUILD_PERMISSION_DENIED");
  const invite = {
    id: `invite-${randomUUID()}`,
    guildId,
    invitedEmail: String(email ?? "").trim().toLowerCase(),
    invitedUserId: "",
    createdBy: user.id,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  if (!invite.invitedEmail.includes("@")) throw new Error("INVALID_EMAIL");
  db.guildInvites[invite.id] = invite;
  audit(db, user.id, "guild_invite", { guildId, email: invite.invitedEmail });
  return invite;
}

export function createAuthoritativeServer(options = {}) {
  const config = {
    port: Number(options.port ?? process.env.PORT ?? 8790),
    storageDir: options.storageDir ?? process.env.HELIORA_SERVER_STORAGE_DIR ?? join(APP_DIR, "storage"),
    storageProvider: options.storageProvider ?? process.env.HELIORA_STORAGE_PROVIDER ?? "file",
    supabaseUrl: options.supabaseUrl ?? process.env.SUPABASE_URL ?? "",
    supabaseAnonKey: options.supabaseAnonKey ?? process.env.SUPABASE_ANON_KEY ?? "",
    supabaseServiceRoleKey: options.supabaseServiceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    devAuth: options.devAuth ?? process.env.HELIORA_DEV_AUTH === "true",
  };
  const storage = createStorage(config);

  return createServer(async (request, response) => {
    const requestId = randomUUID();
    if (request.method === "OPTIONS") {
      sendJson(response, 200, { success: true });
      return;
    }

    const url = new URL(request.url ?? "/", `http://127.0.0.1:${config.port}`);

    try {
      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, { success: true, serverTime: new Date().toISOString(), mode: "authoritative-prealpha", storage: storage.mode });
        return;
      }

      const user = await authenticate(request, config);
      if (!user) {
        sendError(response, 401, "UNAUTHENTICATED", "Connexion serveur requise.", requestId);
        return;
      }

      const db = await storage.read();

      if (request.method === "GET" && url.pathname === "/v1/me") {
        const profile = ensureProfile(db, user);
        await storage.write(db);
        sendJson(response, 200, { success: true, profile, kingdom: findOwnKingdom(db, user.id), guild: ownGuild(db, user.id), serverTime: new Date().toISOString() });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/profile") {
        const body = await readBody(request);
        const profile = ensureProfile(db, user, body.name);
        profile.name = cleanName(body.name, profile.name);
        profile.updatedAt = new Date().toISOString();
        audit(db, user.id, "profile_update", { name: profile.name });
        await storage.write(db);
        sendJson(response, 200, { success: true, profile });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/kingdom") {
        const body = await readBody(request);
        ensureProfile(db, user, body.playerName);
        const kingdom = ensureKingdom(db, user, body);
        audit(db, user.id, "kingdom_create_or_restore", { kingdomId: kingdom.id });
        await storage.write(db);
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
        await storage.write(db);
        sendJson(response, 200, { success: true, ...result, serverTime: new Date().toISOString() });
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/events") {
        sendJson(response, 200, { success: true, events: LIVE_EVENTS, serverTime: new Date().toISOString() });
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/leaderboard") {
        const kingdoms = Object.values(db.kingdoms)
          .sort((a, b) => (b.power ?? 0) - (a.power ?? 0))
          .slice(0, 20)
          .map((kingdom) => ({ id: kingdom.id, name: kingdom.name, power: kingdom.power, level: kingdom.level }));
        const guilds = Object.values(db.guilds)
          .sort((a, b) => (b.power ?? 0) - (a.power ?? 0))
          .slice(0, 20)
          .map(publicGuild);
        sendJson(response, 200, { success: true, kingdoms, guilds });
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/guilds") {
        const guilds = Object.values(db.guilds).sort((a, b) => (b.power ?? 0) - (a.power ?? 0)).slice(0, 30).map(publicGuild);
        sendJson(response, 200, { success: true, guilds, ownGuild: ownGuild(db, user.id) });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/guilds") {
        const body = await readBody(request);
        const kingdom = findOwnKingdom(db, user.id) ?? ensureKingdom(db, user, {});
        const result = createGuild(db, user, kingdom, body);
        await storage.write(db);
        sendJson(response, 200, { success: true, ...result });
        return;
      }

      const joinMatch = url.pathname.match(/^\/v1\/guilds\/([^/]+)\/join$/);
      if (request.method === "POST" && joinMatch) {
        const kingdom = findOwnKingdom(db, user.id) ?? ensureKingdom(db, user, {});
        const result = joinGuild(db, user, kingdom, decodeURIComponent(joinMatch[1]));
        await storage.write(db);
        sendJson(response, 200, { success: true, ...result });
        return;
      }

      const inviteMatch = url.pathname.match(/^\/v1\/guilds\/([^/]+)\/invites$/);
      if (request.method === "POST" && inviteMatch) {
        const body = await readBody(request);
        const invite = inviteGuild(db, user, decodeURIComponent(inviteMatch[1]), body.email);
        await storage.write(db);
        sendJson(response, 200, { success: true, invite });
        return;
      }

      sendError(response, 404, "NOT_FOUND", "Route inconnue.", requestId);
    } catch (error) {
      const code = error.message || "SERVER_ERROR";
      const clientErrors = [
        "INVALID_NAME",
        "INVALID_EMAIL",
        "IDEMPOTENCY_REQUIRED",
        "INSUFFICIENT_RESOURCES",
        "KINGDOM_REQUIRED",
        "UNKNOWN_ACTION",
        "UNKNOWN_BUILDING",
        "UNKNOWN_UNIT",
        "BARRACKS_REQUIRED",
        "CASTLE_LEVEL_REQUIRED",
        "REWARD_ALREADY_CLAIMED",
        "GUILD_REQUIRED",
        "GUILD_CLOSED",
        "GUILD_ALREADY_JOINED",
        "GUILD_PERMISSION_DENIED",
      ];
      const status = clientErrors.includes(code) ? 400 : 500;
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
