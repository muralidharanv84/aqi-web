import { describe, expect, it } from "vitest";
import worker from "./index";

describe("legacy dashboard domain", () => {
  it.each([
    ["http://aqi.orangeiqlabs.com/", "https://aqi.murali.page/"],
    [
      "https://aqi.orangeiqlabs.com/murali-living-room/compare?metric=aqi_us&range=24h",
      "https://aqi.murali.page/murali-living-room/compare?metric=aqi_us&range=24h",
    ],
  ])("permanently redirects %s", (source, destination) => {
    const response = worker.fetch(new Request(source));
    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe(destination);
  });

  it("does not redirect the new domain", () => {
    expect(worker.fetch(new Request("https://aqi.murali.page/" )).status).toBe(404);
  });
});
