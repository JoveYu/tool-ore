export interface ColorStop {
  id: string;
  color: string;
  position: number; // 0 ~ 100
}

export type GradientType = "linear" | "radial";

export interface GradientConfig {
  type: GradientType;
  angle: number; // 0 ~ 360
  shape: "circle" | "ellipse";
  stops: ColorStop[];
}

export interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

/**
 * 生成渐变 CSS 字符串与 Tailwind 样式
 */
export function buildGradientCss(config: GradientConfig): {
  cssBackground: string;
  tailwindClass: string;
} {
  const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
  const stopStr = sortedStops.map((s) => `${s.color} ${s.position}%`).join(", ");

  let cssValue = "";
  if (config.type === "linear") {
    cssValue = `linear-gradient(${config.angle}deg, ${stopStr})`;
  } else {
    cssValue = `radial-gradient(${config.shape} at center, ${stopStr})`;
  }

  const cssBackground = `background: ${cssValue};`;
  const tailwindClass = `bg-[${cssValue.replace(/\s+/g, "_")}]`;

  return { cssBackground, tailwindClass };
}

/**
 * 生成多层阴影 CSS 字符串与 Tailwind 样式
 */
export function buildBoxShadowCss(layers: ShadowLayer[]): {
  cssBoxShadow: string;
  tailwindClass: string;
} {
  if (layers.length === 0) {
    return {
      cssBoxShadow: "box-shadow: none;",
      tailwindClass: "shadow-none",
    };
  }

  const layerStrs = layers.map((l) => {
    const insetStr = l.inset ? "inset " : "";
    return `${insetStr}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`;
  });

  const fullShadow = layerStrs.join(", ");
  const cssBoxShadow = `box-shadow: ${fullShadow};`;
  const tailwindClass = `shadow-[${fullShadow.replace(/\s+/g, "_")}]`;

  return { cssBoxShadow, tailwindClass };
}

/**
 * 预设渐变推荐色板
 */
export const GRADIENT_PRESETS: { name: string; config: GradientConfig }[] = [
  {
    name: "紫罗兰极光",
    config: {
      type: "linear",
      angle: 135,
      shape: "circle",
      stops: [
        { id: "1", color: "#6366F1", position: 0 },
        { id: "2", color: "#A855F7", position: 50 },
        { id: "3", color: "#EC4899", position: 100 },
      ],
    },
  },
  {
    name: "日落暖橙",
    config: {
      type: "linear",
      angle: 90,
      shape: "circle",
      stops: [
        { id: "1", color: "#F97316", position: 0 },
        { id: "2", color: "#F43F5E", position: 100 },
      ],
    },
  },
  {
    name: "翡翠海浪",
    config: {
      type: "linear",
      angle: 120,
      shape: "circle",
      stops: [
        { id: "1", color: "#06B6D4", position: 0 },
        { id: "2", color: "#10B981", position: 100 },
      ],
    },
  },
  {
    name: "午夜深空",
    config: {
      type: "linear",
      angle: 180,
      shape: "circle",
      stops: [
        { id: "1", color: "#0F172A", position: 0 },
        { id: "2", color: "#1E1B4B", position: 50 },
        { id: "3", color: "#312E81", position: 100 },
      ],
    },
  },
  {
    name: "星空光晕 (径向)",
    config: {
      type: "radial",
      angle: 0,
      shape: "circle",
      stops: [
        { id: "1", color: "#818CF8", position: 0 },
        { id: "2", color: "#3730A3", position: 60 },
        { id: "3", color: "#0F172A", position: 100 },
      ],
    },
  },
];

/**
 * 预设阴影推荐模板
 */
export const SHADOW_PRESETS: { name: string; layers: ShadowLayer[] }[] = [
  {
    name: "柔和浮层 (Soft Elevation)",
    layers: [
      { id: "1", x: 0, y: 4, blur: 6, spread: -1, color: "rgba(0, 0, 0, 0.08)", inset: false },
      { id: "2", x: 0, y: 12, blur: 24, spread: -4, color: "rgba(0, 0, 0, 0.12)", inset: false },
    ],
  },
  {
    name: "苹果风格轻拟物 (Subtle Apple)",
    layers: [
      { id: "1", x: 0, y: 2, blur: 8, spread: 0, color: "rgba(0, 0, 0, 0.04)", inset: false },
      { id: "2", x: 0, y: 20, blur: 30, spread: 0, color: "rgba(0, 0, 0, 0.08)", inset: false },
    ],
  },
  {
    name: "霓虹荧光外发光 (Neon Glow)",
    layers: [
      { id: "1", x: 0, y: 0, blur: 15, spread: 2, color: "rgba(99, 102, 241, 0.4)", inset: false },
      { id: "2", x: 0, y: 0, blur: 30, spread: 6, color: "rgba(168, 85, 247, 0.25)", inset: false },
    ],
  },
  {
    name: "深层内凹 (Inner Inset)",
    layers: [
      { id: "1", x: 0, y: 4, blur: 8, spread: 0, color: "rgba(0, 0, 0, 0.15)", inset: true },
      { id: "2", x: 0, y: 1, blur: 2, spread: 0, color: "rgba(0, 0, 0, 0.1)", inset: true },
    ],
  },
];
