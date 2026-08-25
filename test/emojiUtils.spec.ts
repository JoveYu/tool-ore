import { describe, it, expect } from "vitest";
import { searchFullEmojis, ALL_EMOJIS } from "../src/tools/design/fullEmojiUtils";

describe("Full Emoji Utilities with Chinese Search", () => {
  it("loads complete Unicode Emoji database", () => {
    expect(ALL_EMOJIS.length).toBeGreaterThan(1500);
  });

  it("searches emojis by various Chinese keywords", () => {
    // 测试常见中文检索词
    const happy = searchFullEmojis("开心");
    expect(happy.length).toBeGreaterThan(0);
    expect(happy.some((e) => e.char === "😀" || e.char === "😄" || e.char === "😃")).toBe(true);

    const fire = searchFullEmojis("火");
    expect(fire.length).toBeGreaterThan(0);
    expect(fire.some((e) => e.char === "🔥")).toBe(true);

    const rocket = searchFullEmojis("火箭");
    expect(rocket.some((e) => e.char === "🚀")).toBe(true);

    const dog = searchFullEmojis("狗");
    expect(dog.some((e) => e.char === "🐶" || e.char === "🐕")).toBe(true);

    const cat = searchFullEmojis("猫");
    expect(cat.some((e) => e.char === "🐱" || e.char === "🐈")).toBe(true);

    const beer = searchFullEmojis("啤酒");
    expect(beer.some((e) => e.char === "🍺" || e.char === "🍻")).toBe(true);

    const like = searchFullEmojis("点赞");
    expect(like.some((e) => e.char === "👍")).toBe(true);

    const cry = searchFullEmojis("哭");
    expect(cry.some((e) => e.char === "😭" || e.char === "😢")).toBe(true);
  });

  it("searches emojis by English name", () => {
    const rocketResults = searchFullEmojis("rocket");
    expect(rocketResults.some((e) => e.char === "🚀")).toBe(true);
  });

  it("filters full emojis by official category", () => {
    const animals = searchFullEmojis("", "Animals & Nature");
    expect(animals.length).toBeGreaterThan(100);
    expect(animals.every((e) => e.category === "Animals & Nature")).toBe(true);
  });
});
