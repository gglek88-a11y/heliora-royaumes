export const STORAGE_KEY = "heliora-web-kingdom-v1";

export function readJsonStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorageItem(key) {
  localStorage.removeItem(key);
}

export function readStoredGame() {
  return readJsonStorage(STORAGE_KEY, null);
}

export function writeStoredGame(state) {
  writeJsonStorage(STORAGE_KEY, state);
}

export function removeStoredGame() {
  removeStorageItem(STORAGE_KEY);
}
