import { describe, expect, it } from "vitest";
import {
  formatMetricValue,
  getAvailableMetrics,
  getMetricApiKey,
  getMetricDefinition,
  getMetricStatus,
  selectAvailableMetrics,
} from "./metrics";

describe("metrics helpers", () => {
  it("returns metric definitions and api keys", () => {
    const aqi = getMetricDefinition("aqi");
    expect(aqi.label).toBe("AQI");
    expect(getMetricApiKey("pm25")).toBe("pm25_ugm3");
  });

  it("formats metric values with units", () => {
    expect(formatMetricValue("aqi", 42)).toBe("42");
    expect(formatMetricValue("pm25", 12.345)).toBe("12.3 ug/m3");
    expect(formatMetricValue("humidity", 55)).toBe("55 %");
    expect(formatMetricValue("noise_db", 53.25)).toBe("53.3 dB");
    expect(getMetricApiKey("noise_db")).toBe("noise_db");
  });

  it("returns status only for scaled metrics", () => {
    expect(getMetricStatus("pm25", 10)?.label).toBe("Good");
    expect(getMetricStatus("co2", 1600)?.label).toBe("Very Poor");
    expect(getMetricStatus("aqi", 50)).toBeNull();
  });
});

describe("monitor metric availability", () => {
  it("includes zero readings and excludes missing, null, and invalid readings", () => {
    expect(getAvailableMetrics({
      aqi_us: 0, pm25_ugm3: null, co2_ppm: undefined,
      voc_ppm: Number.NaN, temp_c: Number.POSITIVE_INFINITY,
      noise_db: 53, unknown_metric: 1,
    }).map((metric) => metric.key)).toEqual(["aqi", "noise_db"]);
    expect(getAvailableMetrics(undefined)).toEqual([]);
  });

  it("drops unsupported selections while preserving the chosen order", () => {
    const outdoor = getAvailableMetrics({aqi_us: 100, pm25_ugm3: 38, noise_db: 53});
    expect(selectAvailableMetrics(["noise_db", "temperature_c", "aqi", "noise_db"], outdoor))
      .toEqual(["noise_db", "aqi"]);
    expect(selectAvailableMetrics(["temperature_c"], outdoor)).toEqual(["aqi"]);
  });

  it("falls back to the first reported metric when AQI is unavailable", () => {
    const available = getAvailableMetrics({temp_c: 26, rh_pct: 40});
    expect(selectAvailableMetrics(["aqi"], available)).toEqual(["temperature_c"]);
    expect(selectAvailableMetrics(["aqi"], [])).toEqual([]);
  });
});
