import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSeries } from "../api/endpoints";
import { loadComparisonSeries } from "./comparison";

vi.mock("../api/endpoints", () => ({getSeries: vi.fn()}));
const mockedGetSeries = vi.mocked(getSeries);

describe("comparison data", () => {
  beforeEach(() => vi.resetAllMocks());
  const params = {firstDeviceId: "indoor", secondDeviceId: "outdoor", metric: "aqi_us", from: 100000, to: 186400};

  it("requests identical metric, bounds, and detail for both monitors", async () => {
    mockedGetSeries.mockResolvedValue({resolution: "5m", points: [{ts: 100200, avg: 50}]});
    const data = await loadComparisonSeries(params);
    expect(mockedGetSeries.mock.calls).toEqual([
      ["indoor", {metric: "aqi_us", from: 100000, to: 186400, resolution: "5m"}],
      ["outdoor", {metric: "aqi_us", from: 100000, to: 186400, resolution: "5m"}],
    ]);
    expect(data.resolution).toBe("5m");
  });

  it("re-queries finer All time data to match the longer monitor history", async () => {
    mockedGetSeries.mockImplementation(async (device, request) => {
      const resolution = request.resolution === "auto" ? device === "indoor" ? "1w" : "1h" : request.resolution;
      return {resolution, points: [{ts: 100800, avg: 50, min: 40, max: 60, n: 4}]};
    });
    const data = await loadComparisonSeries({...params, from: 0});
    expect(mockedGetSeries).toHaveBeenCalledTimes(3);
    expect(mockedGetSeries).toHaveBeenLastCalledWith("outdoor", {metric: "aqi_us", from: 0, to: 186400, resolution: "1w"});
    expect(data.resolution).toBe("1w");
    expect(data.first.points[0]).toEqual(data.second.points[0]);
  });

  it("retains a monitor with no readings as an empty series", async () => {
    mockedGetSeries.mockResolvedValueOnce({resolution: "5m", points: [{ts: 100200, avg: 50}]});
    mockedGetSeries.mockResolvedValueOnce({resolution: "5m", points: []});
    const data = await loadComparisonSeries(params);
    expect(data.first.points).toHaveLength(1);
    expect(data.second.points).toEqual([]);
  });

  it("surfaces failed requests so the UI can offer retry", async () => {
    mockedGetSeries.mockRejectedValue(new Error("Network error"));
    await expect(loadComparisonSeries(params)).rejects.toThrow("Network error");
  });
});
