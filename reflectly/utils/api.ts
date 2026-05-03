import Constants from "expo-constants";
import { Platform } from "react-native";
import { BACKEND_API_URL } from "../../shared/backendUrl.js";

const API_PORT = "5000";
const DEFAULT_API_URL = BACKEND_API_URL;

function normalizeApiUrl(url: string): string {
  const cleaned = url.replace(/\/+$/, "");
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

function getExpoHost(): string | null {
  const fromExpoConfig = Constants.expoConfig?.hostUri;
  const fromManifest2 = (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  const fromManifest = (Constants as any).manifest?.debuggerHost;

  const hostUri = fromExpoConfig || fromManifest2 || fromManifest;
  if (!hostUri) return null;

  return hostUri.split(":")[0] || null;
}

function isIpv4Host(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

function isExpoTunnelHost(host: string): boolean {
  return /exp\.direct|expo\.dev|exp\.host/i.test(host);
}

export const getApiUrl = (): string => {
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    return normalizeApiUrl(envApiUrl);
  }

  if (Platform.OS === "web") {
    return DEFAULT_API_URL;
  }

  const host = getExpoHost();
  if (host) {
    if (isExpoTunnelHost(host)) {
      return DEFAULT_API_URL;
    }

    const resolvedHost =
      Platform.OS === "android" && (host === "localhost" || host === "127.0.0.1")
        ? "10.0.2.2"
        : host;

    if (resolvedHost === "localhost" || resolvedHost === "127.0.0.1" || isIpv4Host(resolvedHost)) {
      return `http://${resolvedHost}:${API_PORT}/api`;
    }

    return DEFAULT_API_URL;
  }

  return DEFAULT_API_URL;
};

export function getImageUrl(imagePath: string): string {
  return getApiUrl().replace("/api", "") + imagePath;
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 15000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const requestUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : "";

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error(
        `Request timed out while contacting ${requestUrl || "the backend"}. Check the AWS backend URL and network access.`,
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
