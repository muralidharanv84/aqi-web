import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { Route, Routes } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { describe, expect, it } from "vitest";
import ComparePage from "./ComparePage";

function renderComparison(location: string, omitOutdoor = false) {
  const client = new QueryClient();
  const deviceIds = ["murali-living-room", "bellezea-outdoor", "murali-1"];
  const readings = [
    {aqi_us: 60, pm25_ugm3: 20, temp_c: 27, rh_pct: 60},
    {aqi_us: 100, pm25_ugm3: 38, noise_db: 53},
    {temp_c: 25, rh_pct: 40},
  ];
  client.setQueryData(["devices"], {devices: deviceIds.map(device_id => ({device_id}))});
  deviceIds.forEach((id, index) => {
    if (omitOutdoor && index === 1) return;
    client.setQueryData(["latest", id], {device_id: id, ts: Math.floor(Date.now() / 1000), metrics: readings[index]});
  });
  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}><StaticRouter location={location}>
      <Routes><Route path="/:deviceId/compare" element={<ComparePage />} /></Routes>
    </StaticRouter></QueryClientProvider>
  );
  const requests = client.getQueryCache().getAll().filter(query => query.queryKey[0] === "comparison")
    .map(query => ({key: query.queryKey, enabled: query.isActive()}));
  client.clear();
  return {html, requests};
}

describe("Compare page", () => {
  it("defaults to living room versus outdoor with only AQI and PM2.5", () => {
    const {html, requests} = renderComparison("/murali-living-room/compare");
    expect(html).toContain("First monitor");
    expect(html).toContain("Second monitor");
    expect(html).toContain(">AQI</button>");
    expect(html).toContain(">PM2.5</button>");
    expect(html).not.toContain(">Temperature</button>");
    expect(html).not.toContain(">Noise</button>");
    expect(requests[0].key.slice(1, 4)).toEqual(["murali-living-room", "bellezea-outdoor", "aqi_us"]);
    expect(Number(requests[0].key[5]) - Number(requests[0].key[4])).toBe(86400);
  });

  it("honors bookmarked PM2.5 and range selections", () => {
    const {html, requests} = renderComparison("/murali-living-room/compare?with=bellezea-outdoor&metric=pm25&range=1y");
    expect(html).toContain("Latest PM2.5");
    expect(html).toContain("Weekly averages");
    expect(requests[0].key[3]).toBe("pm25_ugm3");
  });

  it("falls back to a common metric after switching monitors", () => {
    const {html, requests} = renderComparison("/murali-living-room/compare?with=murali-1&metric=aqi");
    expect(html).not.toContain(">AQI</button>");
    expect(html).toContain(">Temperature</button>");
    expect(requests[0].key[3]).toBe("temp_c");
  });

  it("explains when monitors have no shared metrics", () => {
    const {html} = renderComparison("/bellezea-outdoor/compare?with=murali-1");
    expect(html).toContain("These monitors don’t share a metric");
    expect(html).not.toContain("Latest AQI");
  });

  it("waits for both monitors before choosing a metric", () => {
    const {html, requests} = renderComparison("/murali-living-room/compare?metric=pm25", true);
    expect(html).toContain("Loading shared metrics");
    expect(requests[0].key[3]).toBe("");
  });
});
