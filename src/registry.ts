import { lazy } from "react";
import { CategoryInfo, ToolDefinition } from "./types/tool";

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "text",
    name: "文本工具",
    description: "大写金额转换、文本处理等",
    iconName: "FileText",
  },
  {
    id: "image",
    name: "图片工具",
    description: "图片压缩、格式转换、颜色拾取等前端图形处理",
    iconName: "Image",
  },
  {
    id: "crypto",
    name: "加密工具",
    description: "Base64 编解码、哈希散列等安全计算",
    iconName: "KeyRound",
  },
];

export const TOOLS: ToolDefinition[] = [
  {
    id: "currency-to-chinese",
    name: "大写金额转换",
    description: "将阿拉伯数字金额转换为中文大写金额（财务标准汉字）",
    category: "text",
    tags: ["金额", "大写", "人民币", "财务", "数字转汉字"],
    iconName: "Coins",
    status: "stable",
    component: lazy(() => import("./tools/text/CurrencyToChinese")),
  },
  {
    id: "image-compressor",
    name: "图片压缩",
    description: "纯本地 Canvas 调整质量与尺寸，大幅减小图片体积",
    category: "image",
    tags: ["压缩", "图片", "tinypng", "webp", "jpg"],
    iconName: "Minimize2",
    status: "stable",
    component: lazy(() => import("./tools/image/ImageCompressor")),
  },
  {
    id: "image-converter",
    name: "图片格式转换",
    description: "支持 PNG、JPG、WebP 等多格式批量互转与一键导出",
    category: "image",
    tags: ["转换", "png", "webp", "jpg", "批量格式转换"],
    iconName: "RefreshCw",
    status: "stable",
    component: lazy(() => import("./tools/image/ImageConverter")),
  },
  {
    id: "color-picker",
    name: "颜色拾取器",
    description: "高倍放大镜精准拾色，支持屏幕取色及 HEX/RGB/HSL/CMYK 多格式换算",
    category: "image",
    tags: ["取色", "吸管", "颜色拾取", "hex", "rgb", "hsl", "cmyk", "配色"],
    iconName: "Pipette",
    status: "stable",
    component: lazy(() => import("./tools/image/ColorPicker")),
  },
  {
    id: "base64-converter",
    name: "Base64 编解码",
    description: "支持 UTF-8 文本编码/解码、URL-Safe 安全模式与文件转 Base64 DataURI",
    category: "crypto",
    tags: ["base64", "编码", "解码", "datauri", "url-safe", "加密"],
    iconName: "Binary",
    status: "stable",
    component: lazy(() => import("./tools/crypto/Base64Converter")),
  },
];

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  return TOOLS.filter((tool) => tool.category === category);
}
