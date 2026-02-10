import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { formatDateTime } from "../domain/time";
import PurifierControlPanel from "./PurifierControlPanel";

describe("PurifierControlPanel", () => {
  it("renders cleanly when no control data is available", () => {
    const html = renderToStaticMarkup(<PurifierControlPanel fanControl={null} />);

    expect(html).toContain("Purifier Control");
    expect(html).toContain("No control run has been recorded yet.");
    expect(html).toContain("Last control run");
    expect(html).toContain("Last set speed");
    expect(html).toContain("Target purifier IDs");
  });

  it("renders latest success event details", () => {
    const runTs = 1_704_067_200;
    const html = renderToStaticMarkup(
      <PurifierControlPanel
        fanControl={{
          latest_event: {
            run_ts: runTs,
            status: "success",
            purifier_device_ids: ["purifier-a", "purifier-b"],
            speed: "medium",
            error_message: null,
          },
          latest_error: null,
        }}
      />,
    );

    expect(html).toContain(formatDateTime(runTs));
    expect(html).toContain("medium");
    expect(html).toContain("purifier-a, purifier-b");
    expect(html).not.toContain("No control run has been recorded yet.");
  });

  it("renders latest error state prominently when present", () => {
    const runTs = 1_704_067_200;
    const html = renderToStaticMarkup(
      <PurifierControlPanel
        fanControl={{
          latest_event: null,
          latest_error: {
            run_ts: runTs,
            status: "error",
            message: "Failed to call purifier API",
            error_streak: 4,
          },
        }}
      />,
    );

    expect(html).toContain("error");
    expect(html).toContain(formatDateTime(runTs));
    expect(html).toContain("Failed to call purifier API");
    expect(html).toContain("Error streak: 4");
  });
});
