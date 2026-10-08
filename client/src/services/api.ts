const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';
let authToken: string | null = null;
export function setAuthToken(token: string | null) { authToken = token; }

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...options?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
