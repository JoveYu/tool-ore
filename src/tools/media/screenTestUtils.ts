export interface ScreenTestPattern {
  id: string;
  name: string;
  type: "solid" | "gradient" | "checkerboard" | "spectrum" | "bars";
  color?: string;
  description: string;
}

export const SCREEN_TEST_PATTERNS: ScreenTestPattern[] = [
  { id: "black", name: "纯黑色 (检查亮点与四周漏光)", type: "solid", color: "#000000", description: "在暗室环境中检查屏幕是否存在常亮亮点或四周边缘漏光" },
  { id: "white", name: "纯白色 (检查暗点与发黄色斑)", type: "solid", color: "#FFFFFF", description: "检查屏幕是否存在不发光的暗点、坏点或背光不均发黄" },
  { id: "red", name: "纯红色 (检测红色子像素)", type: "solid", color: "#FF0000", description: "检测红色子像素是否正常发光与显色均匀度" },
  { id: "green", name: "纯绿色 (检测绿色子像素)", type: "solid", color: "#00FF00", description: "检测绿色子像素（人眼对绿色最敏感）" },
  { id: "blue", name: "纯蓝色 (检测蓝色子像素)", type: "solid", color: "#0000FF", description: "检测蓝色子像素是否老化或异常" },
  { id: "gray_gradient", name: "256 级灰阶平滑过渡", type: "gradient", description: "测试屏幕对比度、暗部细节与伽马灰阶过渡是否存在色彩断层" },
  { id: "checkerboard", name: "黑白高反差网格", type: "checkerboard", description: "测试屏幕锐度、抗眩光与边缘色散" },
  { id: "spectrum", name: "全色域彩虹渐变", type: "spectrum", description: "测试屏幕广色域色彩表现与丰富度" },
];

export interface ScreenHardwareInfo {
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  dpr: number;
  colorDepth: number;
}

export function getScreenInfo(): ScreenHardwareInfo {
  if (typeof window === "undefined") {
    return {
      screenWidth: 1920,
      screenHeight: 1080,
      windowWidth: 1920,
      windowHeight: 1080,
      dpr: 1,
      colorDepth: 24,
    };
  }

  return {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
    colorDepth: window.screen.colorDepth || 24,
  };
}
