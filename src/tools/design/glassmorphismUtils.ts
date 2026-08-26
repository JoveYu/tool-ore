export type GlassStyleMode = "glass" | "neumorphism_flat" | "neumorphism_convex" | "neumorphism_inset";

export interface GlassOptions {
  mode: GlassStyleMode;
  blur: number; // 0 ~ 40 px
  opacity: number; // 0.05 ~ 0.95
  color: string; // hex
  borderWidth: number; // 0 ~ 4 px
  borderOpacity: number; // 0 ~ 1.0
  borderRadius: number; // 0 ~ 40 px
  shadowBlur: number; // 0 ~ 50 px
  shadowOpacity: number; // 0 ~ 0.5
  neuDistance?: number; // 拟态阴影偏移距离 (2 ~ 20 px)
  neuIntensity?: number; // 拟态光影对比度 (0.05 ~ 0.4)
}

export interface GlassOutput {
  cssStyles: Record<string, string>;
  cssCode: string;
  tailwindClass: string;
}

export const GLASS_PRESETS = [
  {
    name: "浅色清透毛玻璃",
    options: {
      mode: "glass" as GlassStyleMode,
      blur: 16,
      opacity: 0.25,
      color: "#FFFFFF",
      borderWidth: 1,
      borderOpacity: 0.3,
      borderRadius: 24,
      shadowBlur: 20,
      shadowOpacity: 0.1,
    },
  },
  {
    name: "深色极夜毛玻璃",
    options: {
      mode: "glass" as GlassStyleMode,
      blur: 20,
      opacity: 0.35,
      color: "#0F172A",
      borderWidth: 1,
      borderOpacity: 0.2,
      borderRadius: 24,
      shadowBlur: 24,
      shadowOpacity: 0.35,
    },
  },
  {
    name: "霓虹极光毛玻璃",
    options: {
      mode: "glass" as GlassStyleMode,
      blur: 18,
      opacity: 0.22,
      color: "#818CF8",
      borderWidth: 1,
      borderOpacity: 0.4,
      borderRadius: 24,
      shadowBlur: 24,
      shadowOpacity: 0.2,
    },
  },
  {
    name: "柔和软拟物凸起",
    options: {
      mode: "neumorphism_flat" as GlassStyleMode,
      blur: 0,
      opacity: 1,
      color: "#E2E8F0",
      borderWidth: 0,
      borderOpacity: 0,
      borderRadius: 24,
      shadowBlur: 16,
      shadowOpacity: 0.15,
      neuDistance: 8,
      neuIntensity: 0.18,
    },
  },
  {
    name: "内凹软拟物按键",
    options: {
      mode: "neumorphism_inset" as GlassStyleMode,
      blur: 0,
      opacity: 1,
      color: "#E2E8F0",
      borderWidth: 0,
      borderOpacity: 0,
      borderRadius: 20,
      shadowBlur: 14,
      shadowOpacity: 0.16,
      neuDistance: 6,
      neuIntensity: 0.18,
    },
  },
];

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

/**
 * 转换色彩为明暗拟态阴影色
 */
function adjustColorLightness(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const r = Math.max(0, Math.min(255, Math.round(((num >> 16) & 255) * (1 + percent))));
  const g = Math.max(0, Math.min(255, Math.round(((num >> 8) & 255) * (1 + percent))));
  const b = Math.max(0, Math.min(255, Math.round((num & 255) * (1 + percent))));
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 纯前端计算毛玻璃与拟态 CSS 代码与内联样式
 */
export function computeGlassmorphism(options: GlassOptions): GlassOutput {
  const {
    mode,
    blur,
    opacity,
    color,
    borderWidth,
    borderOpacity,
    borderRadius,
    shadowBlur,
    shadowOpacity,
    neuDistance = 8,
    neuIntensity = 0.18,
  } = options;

  const cssStyles: Record<string, string> = {
    borderRadius: `${borderRadius}px`,
  };

  const lines: string[] = [];

  if (mode === "glass") {
    const bgRgba = hexToRgba(color, opacity);
    const borderRgba = hexToRgba("#FFFFFF", borderOpacity);
    const shadowRgba = hexToRgba("#000000", shadowOpacity);

    cssStyles.background = bgRgba;
    cssStyles.backdropFilter = `blur(${blur}px)`;
    cssStyles.WebkitBackdropFilter = `blur(${blur}px)`;

    if (borderWidth > 0) {
      cssStyles.border = `${borderWidth}px solid ${borderRgba}`;
    }

    if (shadowBlur > 0 && shadowOpacity > 0) {
      cssStyles.boxShadow = `0 ${Math.round(shadowBlur * 0.4)}px ${shadowBlur}px 0 ${shadowRgba}`;
    }

    lines.push(`/* 毛玻璃核心样式 */`);
    lines.push(`background: ${bgRgba};`);
    lines.push(`backdrop-filter: blur(${blur}px);`);
    lines.push(`-webkit-backdrop-filter: blur(${blur}px);`);
    lines.push(`border-radius: ${borderRadius}px;`);
    if (borderWidth > 0) {
      lines.push(`border: ${borderWidth}px solid ${borderRgba};`);
    }
    if (shadowBlur > 0 && shadowOpacity > 0) {
      lines.push(`box-shadow: 0 ${Math.round(shadowBlur * 0.4)}px ${shadowBlur}px 0 ${shadowRgba};`);
    }
  } else {
    // 软拟物 Neumorphism
    const lightShadow = adjustColorLightness(color, neuIntensity);
    const darkShadow = adjustColorLightness(color, -neuIntensity * 1.2);
    const d = neuDistance;
    const b = shadowBlur;

    cssStyles.backgroundColor = color;

    if (mode === "neumorphism_flat") {
      cssStyles.boxShadow = `${d}px ${d}px ${b}px ${darkShadow}, -${d}px -${d}px ${b}px ${lightShadow}`;
      lines.push(`/* 软拟物凸起平滑阴影 */`);
      lines.push(`background-color: ${color};`);
      lines.push(`border-radius: ${borderRadius}px;`);
      lines.push(`box-shadow: ${d}px ${d}px ${b}px ${darkShadow}, -${d}px -${d}px ${b}px ${lightShadow};`);
    } else if (mode === "neumorphism_inset") {
      cssStyles.boxShadow = `inset ${d}px ${d}px ${b}px ${darkShadow}, inset -${d}px -${d}px ${b}px ${lightShadow}`;
      lines.push(`/* 软拟物内凹阴影 */`);
      lines.push(`background-color: ${color};`);
      lines.push(`border-radius: ${borderRadius}px;`);
      lines.push(`box-shadow: inset ${d}px ${d}px ${b}px ${darkShadow}, inset -${d}px -${d}px ${b}px ${lightShadow};`);
    }
  }

  // 拟合 Tailwind CSS 类
  const twClasses: string[] = [];
  if (mode === "glass") {
    if (blur >= 24) twClasses.push("backdrop-blur-xl");
    else if (blur >= 16) twClasses.push("backdrop-blur-md");
    else if (blur >= 8) twClasses.push("backdrop-blur-sm");
    else if (blur > 0) twClasses.push("backdrop-blur-xs");

    twClasses.push(color === "#0F172A" ? `bg-slate-900/${Math.round(opacity * 100)}` : `bg-white/${Math.round(opacity * 100)}`);
    if (borderWidth > 0) {
      twClasses.push(`border border-white/${Math.round(borderOpacity * 100)}`);
    }
    if (shadowBlur >= 20) twClasses.push("shadow-2xl");
    else if (shadowBlur >= 12) twClasses.push("shadow-lg");
    else if (shadowBlur > 0) twClasses.push("shadow-md");

    twClasses.push(`rounded-[${borderRadius}px]`);
  } else {
    twClasses.push(`bg-[${color}] rounded-[${borderRadius}px] shadow-neu`);
  }

  return {
    cssStyles,
    cssCode: lines.join("\n"),
    tailwindClass: twClasses.join(" "),
  };
}
