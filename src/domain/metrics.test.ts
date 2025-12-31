import { describe, expect, it } from "vitest";
import {
  formatMetricValue,
  getMetricApiKey,
  getMetricDefinition,
  getMetricStatus,
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
  });

  it("returns status only for scaled metrics", () => {
    expect(getMetricStatus("pm25", 10)?.label).toBe("Good");
    expect(getMetricStatus("co2", 1600)?.label).toBe("Very Poor");
    expect(getMetricStatus("aqi", 50)).toBeNull();
  });
});
