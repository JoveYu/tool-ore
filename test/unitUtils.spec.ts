import { describe, it, expect } from "vitest";
import { convertAllUnits, formatUnitNumber } from "../src/tools/convert/unitUtils";

describe("Unit Converter Utilities", () => {
  it("converts data storage units accurately (1024 base)", () => {
    const res = convertAllUnits("data", "MB", 1024);
    expect(res["GB"]).toBe(1);
    expect(res["KB"]).toBe(1048576);
  });

  it("converts length units accurately", () => {
    const res = convertAllUnits("length", "km", 1);
    expect(res["m"]).toBe(1000);
    expect(res["cm"]).toBe(100000);
  });

  it("converts temperature accurately across Celsius, Fahrenheit and Kelvin", () => {
    const res = convertAllUnits("temperature", "C", 100);
    expect(res["F"]).toBe(212);
    expect(res["K"]).toBe(373.15);

    const zeroC = convertAllUnits("temperature", "F", 32);
    expect(zeroC["C"]).toBe(0);
  });

  it("formats large and precision numbers neatly", () => {
    expect(formatUnitNumber(1024)).toBe("1024");
    expect(formatUnitNumber(0.0000000123)).toContain("e-");
  });
});
