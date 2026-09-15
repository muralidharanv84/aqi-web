import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { Route, Routes } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { describe, expect, it } from "vitest";
import ChartsPage from "./ChartsPage";
import DashboardPage from "./DashboardPage";

function renderMonitor(location: string, metrics?: Record<string, number | null>) {
  const deviceId = location.split("/")[1];
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(["devices"], { devices: [{device_id: deviceId}] });
  if (metrics) {
    client.setQueryData(["latest", deviceId], {
      device_id: deviceId, ts: Math.floor(Date.now() / 1000), metrics,
    });
  }
  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <StaticRouter location={location}>
        <Routes>
          <Route path="/:deviceId/" element={<DashboardPage />} />
          <Route path="/:deviceId/charts" element={<ChartsPage />} />
        </Routes>
      </StaticRouter>
    </QueryClientProvider>
  );
  const seriesMetrics = client.getQueryCache().getAll()
    .filter((query) => query.queryKey[0] === "series" && query.queryKey[2])
    .map((query) => query.queryKey[2]);
  const seriesResolutions = client.getQueryCache().getAll()
    .filter((query) => query.queryKey[0] === "series" && query.queryKey[2])
    .map((query) => query.queryKey[5]);
  client.clear();
  return { html, seriesMetrics, seriesResolutions };
}

describe("metric availability on dashboard and charts", () => {
  it.each([
    ["1h", "raw", "Individual readings"], ["4h", "raw", "Individual readings"],
    ["12h", "5m", "5-minute averages"], ["24h", "5m", "5-minute averages"],
    ["7d", "1h", "Hourly averages"], ["30d", "1d", "Daily averages"],
    ["1y", "1w", "Weekly averages"],
  ])("requests and labels the appropriate averaging interval for %s", (range, resolution, label) => {
    const {html, seriesResolutions} = renderMonitor(`/murali-living-room/charts?range=${range}`, {aqi_us: 50});
    expect(seriesResolutions).toEqual([resolution]);
    expect(html).toContain(label);
  });

  it("lets the backend choose All time detail from the device's history", () => {
    expect(renderMonitor("/murali-living-room/charts?range=all", {aqi_us: 50}).seriesResolutions).toEqual(["auto"]);
  });

  it.each(["/", "/charts"])("shows outdoor noise and hides indoor metrics on %s", (page) => {
    const {html} = renderMonitor(`/bellezea-outdoor${page}`, {
      aqi_us: 107, pm25_ugm3: 38, voc_ppm: 34.374, noise_db: 53,
    });
    expect(html).toContain(">Noise</button>");
    expect(html).toContain(">VOC</button>");
    expect(html).not.toContain(">Temperature</button>");
    expect(html).not.toContain(">Humidity</button>");
    expect(html).not.toContain(">CO2</button>");
    if (page === "/") expect(html).toContain("53 dB");
  });

  it.each(["/", "/charts"])("hides unreported VOC and noise on the living room %s", (page) => {
    const {html} = renderMonitor(`/murali-living-room${page}`, {
      aqi_us: 68, pm25_ugm3: 20, co2_ppm: 545, temp_c: 27.9, rh_pct: 66.5,
    });
    expect(html).toContain(">Temperature</button>");
    expect(html).toContain(">CO2</button>");
    expect(html).not.toContain(">VOC</button>");
    expect(html).not.toContain(">VOC Index</button>");
    expect(html).not.toContain(">Noise</button>");
  });

  it("uses available metrics for a bookmarked chart without querying unsupported ones", () => {
    const {html, seriesMetrics} = renderMonitor(
      "/bellezea-outdoor/charts?range=24h&metrics=temperature_c,noise_db", {
        aqi_us: 107, noise_db: 53,
      }
    );
    expect(html).toContain("Range: 24h");
    expect(seriesMetrics).toEqual(["noise_db"]);
  });

  it.each(["/", "/charts?metrics=voc_ppm"])("hides archived VOC metrics on murali-1 %s", (page) => {
    const {html, seriesMetrics} = renderMonitor(`/murali-1${page}`, {
      voc_ppm: 0.15, voc_index: 157, temp_c: 26.5, rh_pct: 36.7,
    });
    expect(html).not.toContain(">VOC</button>");
    expect(html).not.toContain(">VOC Index</button>");
    expect(html).not.toContain("Current AQI");
    expect(html).toContain(">Temperature</button>");
    expect(seriesMetrics).toEqual(["temp_c"]);
  });

  it("waits for readings before choosing metrics for a bookmarked chart", () => {
    const {html, seriesMetrics} = renderMonitor("/bellezea-outdoor/charts?metrics=noise_db");
    expect(html).toContain("Loading metrics");
    expect(html).not.toContain(">AQI</button>");
    expect(seriesMetrics).toEqual([]);
  });

  it("omits the AQI hero and selects a reported metric on monitors without AQI", () => {
    const {html, seriesMetrics} = renderMonitor("/temperature-monitor/", {temp_c: 0});
    expect(html).not.toContain("Current AQI");
    expect(html).toContain("0 C");
    expect(html).toContain(">Temperature</button>");
    expect(seriesMetrics).toEqual(["temp_c"]);
  });
});
