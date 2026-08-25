import { describe, it, expect } from "vitest";
import { parseUserAgent, UA_PRESETS } from "../src/tools/dev/uaUtils";

describe("User-Agent Parser Utilities", () => {
  it("identifies iPhone Safari correctly", () => {
    const iphoneUa = UA_PRESETS[1].ua;
    const res = parseUserAgent(iphoneUa);

    expect(res.os.name).toBe("iOS");
    expect(res.os.version).toBe("17.4.1");
    expect(res.browser.name).toBe("Apple Safari");
    expect(res.device.type).toBe("mobile");
    expect(res.device.model).toBe("iPhone");
  });

  it("identifies WeChat Android client accurately", () => {
    const wxUa = UA_PRESETS[2].ua;
    const res = parseUserAgent(wxUa);

    expect(res.browser.name).toContain("WeChat");
    expect(res.os.name).toBe("Android");
    expect(res.device.vendor).toContain("Huawei");
  });

  it("identifies search engine bots", () => {
    const botUa = UA_PRESETS[5].ua;
    const res = parseUserAgent(botUa);

    expect(res.isBot).toBe(true);
    expect(res.botName).toBe("Googlebot");
    expect(res.device.type).toBe("bot");
  });
});
