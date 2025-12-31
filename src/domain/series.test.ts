import { describe, expect, it } from "vitest";
import {
  chooseSeriesResolution,
  mergeSeriesPoints,
  normalizeSeriesPoints,
} from "./series";

describe("chooseSeriesResolution", () => {
  it("returns raw for ranges up to 24h", () => {
    expect(chooseSeriesResolution(0, 60 * 60)).toBe("raw");
    expect(chooseSeriesResolution(0, 24 * 60 * 60)).toBe("raw");
  });

  it("returns 1h for ranges above 24h", () => {
    expect(chooseSeriesResolution(0, 24 * 60 * 60 + 1)).toBe("1h");
  });
});

describe("normalizeSeriesPoints", () => {
  it("normalizes timestamps and values from multiple shapes", () => {
    const response = {
      points: [
        { ts: 1, value: 10, min: 8, max: 12, n: 4 },
        { t: 2, v: 11 },
        { time: 3, avg: 12 },
        { timestamp: 4, metrics: { aqi_us: 13 } },
        { ts: "bad", value: 14 },
      ],
    };

    const result = normalizeSeriesPoints(response, "aqi_us");

    expect(result.points).toHaveLength(4);
    expect(result.invalidCount).toBe(1);
    expect(result.points[0]).toEqual({
      ts: 1,
      value: 10,
      min: 8,
      max: 12,
      n: 4,
    });
    expect(result.points[1]).toEqual({
      ts: 2,
      value: 11,
      min: undefined,
      max: undefined,
      n: undefined,
    });
    expect(result.points[3]).toEqual({
      ts: 4,
      value: 13,
      min: undefined,
      max: undefined,
      n: undefined,
    });
  });
});

describe("mergeSeriesPoints", () => {
  it("merges metrics by timestamp and sorts ascending", () => {
    const merged = mergeSeriesPoints({
      aqi: [
        { ts: 2, value: 20 },
        { ts: 1, value: 10 },
      ],
      pm25: [
        { ts: 1, value: 2 },
        { ts: 3, value: 3 },
      ],
    });

    expect(merged).toEqual([
      { ts: 1, aqi: 10, pm25: 2 },
      { ts: 2, aqi: 20 },
      { ts: 3, pm25: 3 },
    ]);
  });
});
