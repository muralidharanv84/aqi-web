import { describe, expect, it } from "vitest";
import {
  chooseSeriesResolution,
  mergeSeriesPoints,
  normalizeSeriesPoints,
} from "./series";

describe("chooseSeriesResolution", () => {
  it.each([
    [3600, "raw"], [4 * 3600, "raw"], [4 * 3600 + 1, "5m"],
    [12 * 3600, "5m"], [86400, "5m"], [86401, "1h"],
    [7 * 86400, "1h"], [14 * 86400, "1h"], [14 * 86400 + 1, "1d"],
    [30 * 86400, "1d"], [90 * 86400, "1d"], [90 * 86400 + 1, "1w"],
    [365 * 86400, "1w"], [730 * 86400, "1w"], [730 * 86400 + 1, "1mo"],
  ])("uses an appropriate resolution for a %i-second range", (seconds, resolution) => {
    expect(chooseSeriesResolution(0, seconds)).toBe(resolution);
  });
});

describe("normalizeSeriesPoints", () => {
  it("normalizes timestamps and values from multiple shapes", () => {
    const response = {
      resolution: "1w",
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
    expect(result.resolution).toBe("1w");
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
