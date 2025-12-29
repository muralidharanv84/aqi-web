type QueryParams = Record<string, string | number | boolean | undefined | null>;

type ApiGetOptions<T> = {
  allowNotFound?: boolean;
  empty?: T;
};

const baseUrl =
  import.meta.env.VITE_API_BASE_URL?.toString() ??
  "https://aqi-backend.orangeiqlabs.com";

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

export async function apiGet<T>(
  path: string,
  params?: QueryParams,
  options?: ApiGetOptions<T>
): Promise<T> {
  const fetch_url = buildUrl(path, params);
  console.log("Fetching data from url: " + fetch_url);
  const response = await fetch(fetch_url);
  if (response.status === 404 && options?.allowNotFound) {
    return options.empty as T;
  }
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}
