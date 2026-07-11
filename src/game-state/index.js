export const LOCAL_BACKEND_URL = "http://127.0.0.1:8787";
export const HERO_LEVEL_CAP = 60;

export function createPlayerId() {
  return `player-${Math.random().toString(16).slice(2, 10)}`;
}

export function createDefaultBackendState() {
  return {
    mode: "local",
    cloudSyncAt: 0,
    status: "Sauvegarde locale",
  };
}

export function createDefaultAccountState() {
  return {
    provider: "local",
    userId: "",
    email: "",
    connectedAt: 0,
  };
}

export function createDefaultGuildState(today) {
  return {
    id: "",
    name: "Aube d'Heliora",
    tag: "HDH",
    rank: "R3",
    role: "member",
    helps: 3,
    rallyReadyAt: 0,
    score: 320,
    lastResetDate: today,
    cloudMembers: [],
    invites: [],
    leaderboard: [],
  };
}
