import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

it("uses the page origin in production, including chart query parameters", async () => {
  vi.stubEnv("DEV", false);
  vi.stubEnv("VITE_API_BASE_URL", undefined);
  vi.stubGlobal("window", { location: { origin: "https://aqi.murali.page" } });
  const fetch = vi.fn().mockResolvedValue(Response.json({ points: [] }));
  vi.stubGlobal("fetch", fetch);
  vi.spyOn(console, "log").mockImplementation(() => {});
  const { apiGet } = await import("./client");
  await apiGet("/api/v1/devices/murali-1/series", { metric: "aqi_us", from: 100 });
  expect(fetch).toHaveBeenCalledWith("https://aqi.murali.page/api/v1/devices/murali-1/series?metric=aqi_us&from=100");
});

it("supports an explicit local backend override", async () => {
  vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8787");
  const fetch = vi.fn().mockResolvedValue(Response.json([]));
  vi.stubGlobal("fetch", fetch);
  vi.spyOn(console, "log").mockImplementation(() => {});
  const { apiGet } = await import("./client");
  await apiGet("/api/v1/devices");
  expect(fetch).toHaveBeenCalledWith("http://localhost:8787/api/v1/devices");
});
