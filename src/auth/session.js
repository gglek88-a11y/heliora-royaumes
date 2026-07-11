export const AUTH_STORAGE_KEY = "heliora-supabase-session-v1";

export function loadAuthSession() {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
    return stored?.access_token ? stored : null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function persistAuthSession(session) {
  if (session?.access_token) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return session;
  }
  localStorage.removeItem(AUTH_STORAGE_KEY);
  return null;
}

export function authUserFromSession(session) {
  return session?.user ?? null;
}
