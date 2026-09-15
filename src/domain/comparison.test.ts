import { describe, expect, it } from "vitest";
import { chooseComparisonDevices, findClosestReading, getSharedMetrics, mergeComparisonSeries } from "./comparison";

describe("monitor comparisons", () => {
  const devices = ["murali-1", "bellezea-outdoor", "murali-living-room"].map(device_id => ({device_id}));
  it("defaults to the living room and outdoor monitor and prevents duplicate selections", () => {
    expect(chooseComparisonDevices(devices)).toEqual({first: devices[2], second: devices[1]});
    expect(chooseComparisonDevices(devices, "bellezea-outdoor", "bellezea-outdoor").second?.device_id).not.toBe("bellezea-outdoor");
    expect(chooseComparisonDevices(devices, "unknown", "missing")).toEqual({first: devices[2], second: devices[1]});
    expect(chooseComparisonDevices([devices[0]]).second).toBeUndefined();
  });
  it("offers only shared metrics with finite values, including zero", () => {
    const first = {device_id: "murali-living-room", ts: 1, metrics: {aqi_us: 0, pm25_ugm3: 12, temp_c: 27, noise_db: null}};
    const second = {device_id: "bellezea-outdoor", ts: 1, metrics: {aqi_us: 100, pm25_ugm3: 38, noise_db: 53}};
    expect(getSharedMetrics(first, second).map(metric => metric.key)).toEqual(["aqi", "pm25"]);
    expect(getSharedMetrics(first, undefined)).toEqual([]);
  });
  it("preserves mismatched sampling times without making up readings", () => {
    expect(mergeComparisonSeries([{ts: 60, value: 0}, {ts: 120, value: 20}], [{ts: 120, value: 40}, {ts: 600, value: 50}]))
      .toEqual([{ts: 60000, first: 0}, {ts: 120000, first: 20, second: 40}, {ts: 600000, second: 50}]);
  });
});

describe("closest comparison reading", () => {
  const points = [{ts: 600, value: 0}, {ts: 1200, value: 80}, {ts: 3000, value: 90}];

  it("uses exact readings, including zero", () => {
    expect(findClosestReading(points, 600)).toBe(points[0]);
    expect(findClosestReading(points, 1200)).toBe(points[1]);
  });

  it("finds the nearest reading on either side of a gap", () => {
    expect(findClosestReading(points, 1500)).toBe(points[1]);
    expect(findClosestReading(points, 2700)).toBe(points[2]);
    expect(findClosestReading(points, 2100)).toBe(points[1]);
  });

  it("uses the first or last available reading at the edges", () => {
    expect(findClosestReading(points, 0)).toBe(points[0]);
    expect(findClosestReading(points, 4000)).toBe(points[2]);
    expect(findClosestReading([points[1]], 4000)).toBe(points[1]);
  });

  it("leaves a monitor without any readings empty", () => {
    expect(findClosestReading([], 1200)).toBeUndefined();
  });
});
