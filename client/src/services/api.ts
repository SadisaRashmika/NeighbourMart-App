const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
  } catch {
    throw new Error(`Cannot reach the NeighbourMart server at ${API_URL}. Check that the server is running and the phone uses the same Wi-Fi network, or configure a public backend URL.`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message ?? `API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
