import { describe, expect, it } from "vitest";
import { formatChartPeriod, formatChartTick } from "./time";

describe("chart time labels", () => {
  const timestamp = Date.UTC(2026, 0, 5);
  it("keeps calendar ticks short and omits irrelevant clock times", () => {
    expect(formatChartTick(timestamp, "1d")).toBe("05 Jan");
    expect(formatChartTick(timestamp, "1w")).toBe("05 Jan");
    expect(formatChartTick(timestamp, "1mo")).toBe("Jan 2026");
  });
  it("identifies calendar periods and their timezone in tooltips", () => {
    expect(formatChartPeriod(timestamp, "1w")).toBe("Week of 05 Jan 2026 (UTC)");
    expect(formatChartPeriod(timestamp, "1d")).toBe("05 Jan 2026 (UTC)");
    expect(formatChartPeriod(timestamp, "1mo")).toBe("Jan 2026 (UTC)");
  });
});
