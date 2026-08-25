export type ThemeId =
  | "one_dark"
  | "dracula"
  | "github_dark"
  | "github_light"
  | "monokai"
  | "night_owl";

export type BackgroundPresetId =
  | "aurora"
  | "sunset"
  | "oceanic"
  | "midnight"
  | "emerald"
  | "transparent";

export interface CodeImageOptions {
  code: string;
  language: string;
  theme: ThemeId;
  background: BackgroundPresetId;
  windowHeader: "mac" | "win" | "none";
  title: string;
  showLineNumbers: boolean;
  padding: number; // 16, 32, 48, 64
  fontSize: number;
  scale: 1 | 2 | 3;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bg: string;
  fg: string;
  keyword: string;
  string: string;
  number: string;
  comment: string;
  function: string;
}

export const THEME_CONFIGS: Record<ThemeId, ThemeConfig> = {
  one_dark: {
    id: "one_dark",
    name: "One Dark Pro",
    bg: "#282c34",
    fg: "#abb2bf",
    keyword: "#c678dd",
    string: "#98c379",
    number: "#d19a66",
    comment: "#5c6370",
    function: "#61afef",
  },
  dracula: {
    id: "dracula",
    name: "Dracula",
    bg: "#282a36",
    fg: "#f8f8f2",
    keyword: "#ff79c6",
    string: "#f1fa8c",
    number: "#bd93f9",
    comment: "#6272a4",
    function: "#50fa7b",
  },
  github_dark: {
    id: "github_dark",
    name: "GitHub Dark",
    bg: "#0d1117",
    fg: "#c9d1d9",
    keyword: "#ff7b72",
    string: "#a5d6ff",
    number: "#79c0ff",
    comment: "#8b949e",
    function: "#d2a8ff",
  },
  github_light: {
    id: "github_light",
    name: "GitHub Light",
    bg: "#ffffff",
    fg: "#24292f",
    keyword: "#cf222e",
    string: "#0a3069",
    number: "#0550ae",
    comment: "#6e7781",
    function: "#8250df",
  },
  monokai: {
    id: "monokai",
    name: "Monokai Pro",
    bg: "#272822",
    fg: "#f8f8f2",
    keyword: "#f92672",
    string: "#e6db74",
    number: "#ae81ff",
    comment: "#75715e",
    function: "#a6e22e",
  },
  night_owl: {
    id: "night_owl",
    name: "Night Owl",
    bg: "#011627",
    fg: "#d6deeb",
    keyword: "#c792ea",
    string: "#ecc48d",
    number: "#f78c6c",
    comment: "#637777",
    function: "#82aaff",
  },
};

export const BACKGROUND_PRESETS: { id: BackgroundPresetId; name: string; gradient: string }[] = [
  { id: "aurora", name: "紫罗兰极光", gradient: "linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)" },
  { id: "sunset", name: "日落暖霞", gradient: "linear-gradient(135deg, #F97316 0%, #F43F5E 100%)" },
  { id: "oceanic", name: "深海幽蓝", gradient: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)" },
  { id: "midnight", name: "暗夜深空", gradient: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)" },
  { id: "emerald", name: "翡翠森林", gradient: "linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)" },
  { id: "transparent", name: "纯透明无背景", gradient: "transparent" },
];

/**
 * 极轻量语法高亮词法着色器（基于占位符机制，避免 HTML 属性冲突）
 */
export function highlightCodeSimple(code: string, theme: ThemeConfig): string {
  const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = code.split("\n");

  const highlightedLines = lines.map((line) => {
    const placeholders: { key: string; value: string }[] = [];
    let pIdx = 0;

    let text = line;

    // 1. 抽取注释
    text = text.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, (match) => {
      const key = `___CMT_${pIdx++}___`;
      placeholders.push({
        key,
        value: `<span style="color:${theme.comment}">${escapeHtml(match)}</span>`,
      });
      return key;
    });

    // 2. 抽取字符串
    text = text.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[\s\S]*?`)/g, (match) => {
      const key = `___STR_${pIdx++}___`;
      placeholders.push({
        key,
        value: `<span style="color:${theme.string}">${escapeHtml(match)}</span>`,
      });
      return key;
    });

    // 3. 转义普通文本
    let escaped = escapeHtml(text);

    // 4. 替换关键字
    const keywords = [
      "const", "let", "var", "function", "return", "import", "export", "from",
      "class", "extends", "interface", "type", "async", "await", "if", "else",
      "for", "while", "switch", "case", "break", "try", "catch", "finally",
      "def", "class", "self", "None", "True", "False", "package", "func", "struct"
    ];
    const kwRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
    escaped = escaped.replace(
      kwRegex,
      `<span style="color:${theme.keyword};font-weight:600;">$1</span>`
    );

    // 5. 替换数字字面量
    escaped = escaped.replace(
      /\b(\d+(?:\.\d+)?)\b/g,
      `<span style="color:${theme.number}">$1</span>`
    );

    // 6. 还原注释与字符串占位符
    for (const ph of placeholders) {
      escaped = escaped.replace(ph.key, ph.value);
    }

    return escaped;
  });

  return highlightedLines.join("\n");
}

/**
 * 将 DOM 元素通过 Canvas 渲染导出为高分辨率 PNG Blob
 */
export async function renderElementToPngBlob(element: HTMLElement, scale: number = 2): Promise<Blob> {
  const rect = element.getBoundingClientRect();
  const width = rect.width * scale;
  const height = rect.height * scale;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法初始化 Canvas");

  ctx.scale(scale, scale);

  const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">
        ${element.outerHTML}
      </div>
    </foreignObject>
  </svg>`;

  const img = new Image();
  const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) resolve(pngBlob);
        else reject(new Error("生成图片失败"));
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG 载入失败"));
    };
    img.src = url;
  });
}
