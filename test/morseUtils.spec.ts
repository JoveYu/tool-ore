import { describe, it, expect } from "vitest";
import { encodeToMorse, decodeFromMorse } from "../src/tools/text/morseUtils";

describe("Morse Code Utilities", () => {
  it("encodes text to Morse code accurately", () => {
    const text = "SOS HELP";
    const morse = encodeToMorse(text);
    expect(morse).toBe("... --- ... / .... . .-.. .--.");
  });

  it("decodes Morse code back to text accurately", () => {
    const morse = "... --- ... / .... . .-.. .--.";
    const text = decodeFromMorse(morse);
    expect(text).toBe("SOS HELP");
  });

  it("handles numbers and symbols", () => {
    const text = "2026 = 100%";
    const morse = encodeToMorse(text);
    expect(morse).toContain("..--- ----- ..--- -....");
    expect(morse).toContain("-...-");
  });
});
