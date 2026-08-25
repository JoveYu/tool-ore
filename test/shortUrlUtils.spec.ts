import { describe, it, expect } from "vitest";
import { generateShortSlug, buildShortUrl } from "../src/tools/dev/shortUrlUtils";

describe("Short URL Utilities", () => {
  it("generates 6-character short slug based on Base62 algorithm", () => {
    const slug = generateShortSlug("https://example.com/long/path/to/resource", "base62");
    expect(slug).toBeDefined();
    expect(slug.length).toBeGreaterThanOrEqual(6);
  });

  it("builds full short URL with custom domain prefix accurately", () => {
    const res = buildShortUrl({
      url: "https://github.com/JoveYu/tool-ore",
      algorithm: "base62",
      domainPrefix: "https://ore.link",
    });

    expect(res.isValid).toBe(true);
    expect(res.shortUrl.startsWith("https://ore.link/")).toBe(true);
    expect(res.slug.length).toBeGreaterThanOrEqual(6);
  });

  it("handles custom slug override", () => {
    const res = buildShortUrl({
      url: "https://github.com/JoveYu/tool-ore",
      algorithm: "custom_slug",
      domainPrefix: "https://ore.link",
      customSlug: "my-app",
    });

    expect(res.isValid).toBe(true);
    expect(res.shortUrl).toBe("https://ore.link/my-app");
  });
});
