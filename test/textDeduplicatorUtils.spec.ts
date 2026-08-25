import { describe, it, expect } from "vitest";
import {
  cleanAndDeduplicateText,
  transformCase,
  CleanOptions,
} from "../src/tools/text/textDeduplicatorUtils";

describe("Text Deduplicator Utilities", () => {
  const defaultOpts: CleanOptions = {
    deduplicate: true,
    caseSensitive: false,
    trimWhitespace: true,
    removeEmptyLines: true,
    removeHtmlTags: false,
    prefix: "",
    suffix: "",
    addLineNumbers: false,
    sort: "none",
    caseTransform: "none",
  };

  it("deduplicates lines case-insensitively and removes empty lines", () => {
    const raw = "Apple\nbanana\napple\n\nBANANA\nOrange\n";
    const res = cleanAndDeduplicateText(raw, defaultOpts);

    expect(res.removedDuplicatesCount).toBe(2);
    expect(res.emptyLinesRemovedCount).toBe(2);
    expect(res.output).toBe("Apple\nbanana\nOrange");
  });

  it("sorts lines alphabetically and numerically", () => {
    const raw = "10\n2\n1\n20";
    const res = cleanAndDeduplicateText(raw, { ...defaultOpts, sort: "num_asc" });
    expect(res.output).toBe("1\n2\n10\n20");
  });

  it("adds prefix, suffix and line numbers", () => {
    const raw = "one\ntwo";
    const res = cleanAndDeduplicateText(raw, {
      ...defaultOpts,
      prefix: "item-",
      suffix: ";",
      addLineNumbers: true,
    });
    expect(res.output).toBe("1. item-one;\n2. item-two;");
  });

  it("transforms naming conventions correctly", () => {
    expect(transformCase("user_profile_name", "camel_case")).toBe("userProfileName");
    expect(transformCase("userProfileName", "kebab_case")).toBe("user-profile-name");
    expect(transformCase("hello world", "pascal_case")).toBe("HelloWorld");
    expect(transformCase("hello_world", "title_case")).toBe("Hello World");
  });
});
