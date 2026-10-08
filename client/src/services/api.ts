import Constants from 'expo-constants';

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setApiAuthToken(token: string | null) { authToken = token; }
export function setUnauthorizedHandler(handler: (() => void) | null) { unauthorizedHandler = handler; }

function getApiUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
  const hostUri = Constants.expoConfig?.hostUri;
  const metroHost = hostUri?.split(':')[0];

  if (configuredUrl?.startsWith('https://')) return configuredUrl;
  if (metroHost) return `http://${metroHost}:5000`;
  return configuredUrl ?? 'http://localhost:5000';
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let response: Response;
  try {
    const apiUrl = getApiUrl();
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...options?.headers },
    });
  } catch {
    throw new Error(`Cannot reach the NeighbourMart server at ${getApiUrl()}. Check that the server is running and the phone uses the same Wi-Fi network, or configure a public backend URL.`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    if (response.status === 401) unauthorizedHandler?.();
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message ?? `API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
