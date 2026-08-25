import { describe, it, expect } from "vitest";
import {
  renderOfficialStamp,
  OFFICIAL_STAMP_PRESETS,
  STAMP_COLORS,
  StampOptions,
} from "../src/tools/doc/stampUtils";

describe("Official Stamp Utilities", () => {
  it("provides Chinese standard stamp presets", () => {
    expect(OFFICIAL_STAMP_PRESETS.length).toBeGreaterThanOrEqual(4);
    const officialSeal = OFFICIAL_STAMP_PRESETS.find((p) => p.id === "official_seal");
    expect(officialSeal).toBeDefined();
    expect(officialSeal?.config.shape).toBe("circle");
    expect(officialSeal?.config.centerType).toBe("star");

    const invoiceSeal = OFFICIAL_STAMP_PRESETS.find((p) => p.id === "invoice_seal");
    expect(invoiceSeal).toBeDefined();
    expect(invoiceSeal?.config.shape).toBe("oval");
  });

  it("provides standard stamp ink colors", () => {
    expect(STAMP_COLORS.length).toBeGreaterThanOrEqual(4);
    expect(STAMP_COLORS[0].color).toBe("#C8161D");
  });

  it("renders official circular seal safely", () => {
    const opts: StampOptions = {
      standardType: "official_seal",
      shape: "circle",
      companyName: "北京智能科技有限公司",
      subText: "合同专用章",
      securityCode: "1101080000000",
      centerType: "star",
      color: "#C8161D",
      size: 400,
      noiseStrength: 0.15,
      agingBlur: 0,
      rotationAngle: 0,
    };

    const res = renderOfficialStamp(opts);
    expect(typeof res).toBe("string");
  });

  it("renders national tax invoice oval seal safely", () => {
    const opts: StampOptions = {
      standardType: "invoice_seal",
      shape: "oval",
      companyName: "北京电子商务有限公司",
      taxNumber: "91110108MA0000000X",
      subText: "发票专用章",
      branchCode: "(1)",
      centerType: "none",
      color: "#C8161D",
      size: 400,
      noiseStrength: 0,
      agingBlur: 0,
      rotationAngle: 0,
    };

    const res = renderOfficialStamp(opts);
    expect(typeof res).toBe("string");
  });
});
