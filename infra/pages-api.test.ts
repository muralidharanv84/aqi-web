import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequest } from "../functions/api/[[path]]";

function call(path: string, fetch: ReturnType<typeof vi.fn>, method = "GET") {
  return onRequest({
    request: new Request(`https://aqi.murali.page${path}`, {
      method,
      headers: { Cookie: "private=value", "X-Signature": "private" },
    }),
    env: { AQI_API: { fetch } },
  } as unknown as Parameters<typeof onRequest>[0]);
}

afterEach(() => vi.restoreAllMocks());

describe("same-origin read API", () => {
  it("preserves series queries and data without forwarding browser credentials", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ points: [{ value: 12 }] }));
    const path = "/api/v1/devices/murali-living-room/series?metric=aqi_us&from=100&to=200&resolution=1h";
    const response = await call(path, fetch);
    const request = fetch.mock.calls[0][0] as Request;
    expect(request.url).toBe(`https://aqi-backend.murali.page${path}`);
    expect(request.method).toBe("GET");
    expect(request.headers.get("cookie")).toBeNull();
    expect(request.headers.get("x-signature")).toBeNull();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ points: [{ value: 12 }] });
  });

  it.each(["/api/v1/health", "/api/v1/devices", "/api/v1/devices/murali-1/latest"])("forwards %s", async (path) => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    expect((await call(path, fetch)).status).toBe(200);
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("preserves backend not-found responses", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ error: "No readings" }, { status: 404 }));
    const response = await call("/api/v1/devices/missing/latest", fetch);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "No readings" });
  });

  it.each(["/api/v1/ingest", "/api/admin", "/api/v1/devices/a/control"])("does not expose %s", async (path) => {
    const fetch = vi.fn();
    expect((await call(path, fetch)).status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects mutations without calling the backend", async () => {
    const fetch = vi.fn();
    const response = await call("/api/v1/devices", fetch, "POST");
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns a readable, uncached error when the service is unavailable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await call("/api/v1/devices", vi.fn().mockRejectedValue(new Error("Unavailable")));
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: "Air quality data is temporarily unavailable" });
  });
});
