import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getMetricDefinition } from "../domain/metrics";
import { formatChartPeriod } from "../domain/time";
import { ComparisonTooltip } from "./ComparisonChart";

describe("comparison tooltip", () => {
  const ts = Date.parse("2026-09-15T06:30:00Z") / 1000;
  const common = {active: true, label: (ts + 180) * 1000, names: ["living-room", "outdoor"], metric: getMetricDefinition("aqi")};

  it("shows the sparse monitor's closest value and actual time", () => {
    const html = renderToStaticMarkup(<ComparisonTooltip {...common} resolution="raw" series={[
      [{ts: ts + 180, value: 57}],
      [{ts, value: 88}, {ts: ts + 1800, value: 91}],
    ]} />);
    expect(html).toContain(">57</div>");
    expect(html).toContain(">88</div>");
    expect(html).toContain(`Closest reading · ${formatChartPeriod(ts * 1000, "raw")}`);
    expect(html).not.toContain("No reading");
    expect(html.match(/Closest reading/g)).toHaveLength(1);
  });

  it("identifies the actual averaging period and retains its extrema", () => {
    const html = renderToStaticMarkup(<ComparisonTooltip {...common} resolution="1d" series={
      [[{ts, value: 88, min: 80, max: 95}], []]
    } />);
    expect(html).toContain(`Closest period · ${formatChartPeriod(ts * 1000, "1d")}`);
    expect(html).toContain("Min 80 · Max 95");
    expect(html).toContain("No readings in this range");
  });
});
