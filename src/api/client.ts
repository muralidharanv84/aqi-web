type QueryParams = Record<string, string | number | boolean | undefined | null>;

const baseUrl = import.meta.env.VITE_API_BASE_URL?.toString() ?? "";

function buildUrl(path: string, params?: QueryParams) {
  const url = new URL(path, baseUrl || window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiGet<T>(path: string, params?: QueryParams): Promise<T> {
  const response = await fetch(buildUrl(path, params));
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}
