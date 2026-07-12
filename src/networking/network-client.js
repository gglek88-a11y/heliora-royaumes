import { LOCAL_BACKEND_URL } from "../game-state/index.js";

export function cloudProviderReady(config) {
  if (config.provider === "supabase") {
    return Boolean(config.supabaseUrl && config.supabaseAnonKey);
  }
  return Boolean(config.apiBaseUrl);
}

export async function loadCloudConfiguration(currentConfig, configPath = "./data/cloud-config.json") {
  try {
    const response = await fetch(configPath, { cache: "no-store" });
    if (!response.ok) {
      return currentConfig;
    }
    const config = await response.json();
    return {
      ...currentConfig,
      ...config,
      apiBaseUrl: (config.apiBaseUrl || currentConfig.apiBaseUrl || LOCAL_BACKEND_URL).replace(/\/$/, ""),
      supabaseUrl: (config.supabaseUrl || "").replace(/\/$/, ""),
      supabaseAnonKey: config.supabaseAnonKey || "",
    };
  } catch {
    return { ...currentConfig, provider: "local" };
  }
}

export async function requestBackend(config, path, options = {}) {
  const { timeoutMs = 1600, ...requestOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const baseUrl = config.apiBaseUrl || LOCAL_BACKEND_URL;
    const response = await fetch(`${baseUrl}${path}`, {
      ...requestOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(requestOptions.headers ?? {}),
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestSupabaseAuth(config, path, options = {}) {
  const { timeoutMs = 7000, ...requestOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${config.supabaseUrl}${path}`, {
      ...requestOptions,
      signal: controller.signal,
      headers: {
        apikey: config.supabaseAnonKey,
        "Content-Type": "application/json",
        ...(requestOptions.headers ?? {}),
      },
    });
    const payload = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error_description || payload?.msg || payload?.message || `Supabase Auth HTTP ${response.status}`);
    }
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestSupabaseRest(config, path, options = {}) {
  const { authenticated = false, accessToken = "", timeoutMs = 6000, ...requestOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const token = authenticated ? accessToken : config.supabaseAnonKey;
    const response = await fetch(`${config.supabaseUrl}${path}`, {
      ...requestOptions,
      signal: controller.signal,
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(requestOptions.headers ?? {}),
      },
    });
    if (!response.ok) {
      throw new Error(`Supabase HTTP ${response.status}`);
    }
    if (response.status === 204) {
      return null;
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}
