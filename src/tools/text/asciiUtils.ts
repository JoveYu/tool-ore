import figlet from "figlet";
import standard from "figlet/importable-fonts/Standard.js";
import slant from "figlet/importable-fonts/Slant.js";
import big from "figlet/importable-fonts/Big.js";
import small from "figlet/importable-fonts/Small.js";
import banner from "figlet/importable-fonts/Banner.js";
import doom from "figlet/importable-fonts/Doom.js";
import ghost from "figlet/importable-fonts/Ghost.js";

// 预载入主流纯前端可导入字体
figlet.parseFont("Standard", standard);
figlet.parseFont("Slant", slant);
figlet.parseFont("Big", big);
figlet.parseFont("Small", small);
figlet.parseFont("Banner", banner);
figlet.parseFont("Doom", doom);
figlet.parseFont("Ghost", ghost);

export type AsciiFont = "Standard" | "Slant" | "Big" | "Small" | "Banner" | "Doom" | "Ghost";

export type CommentWrapperType = "none" | "js_block" | "hash" | "sql" | "html";

export const ASCII_FONTS: { id: AsciiFont; name: string }[] = [
  { id: "Standard", name: "Standard (标准经典)" },
  { id: "Slant", name: "Slant (现代斜体)" },
  { id: "Big", name: "Big (加大加粗)" },
  { id: "Small", name: "Small (精简小号)" },
  { id: "Doom", name: "Doom (游戏粗犷风格)" },
  { id: "Banner", name: "Banner (横幅大字)" },
  { id: "Ghost", name: "Ghost (幽灵悬浮)" },
];

/**
 * 渲染生成 ASCII 艺术字 Banner
 */
export function generateAsciiBanner(
  text: string,
  font: AsciiFont = "Standard",
  wrapper: CommentWrapperType = "none"
): string {
  const clean = text.trim();
  if (!clean) return "";

  try {
    const rawBanner = figlet.textSync(clean, {
      font: font as any,
      horizontalLayout: "default",
      verticalLayout: "default",
    });

    if (!rawBanner) return "";

    // 注释包装
    if (wrapper === "js_block") {
      const lines = rawBanner.split("\n").map((l) => ` * ${l}`);
      return `/**\n${lines.join("\n")}\n */`;
    }

    if (wrapper === "hash") {
      const lines = rawBanner.split("\n").map((l) => `# ${l}`);
      return lines.join("\n");
    }

    if (wrapper === "sql") {
      const lines = rawBanner.split("\n").map((l) => `-- ${l}`);
      return lines.join("\n");
    }

    if (wrapper === "html") {
      return `<!--\n${rawBanner}\n-->`;
    }

    return rawBanner;
  } catch (err: any) {
    return `生成失败: ${err?.message || "包含不支持的特殊字符"}`;
  }
}
