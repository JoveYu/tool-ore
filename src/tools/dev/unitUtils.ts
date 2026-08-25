export type UnitCategory =
  | "data"
  | "length"
  | "area"
  | "weight"
  | "temperature"
  | "time"
  | "speed"
  | "pressure";

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  // 对基准单位的换算系数（如长度基准为米，1 km = 1000 m，系数为 1000）
  ratio: number;
}

export interface UnitCategoryConfig {
  id: UnitCategory;
  name: string;
  baseUnit: string;
  units: UnitDefinition[];
}

export const UNIT_CATEGORIES: UnitCategoryConfig[] = [
  {
    id: "data",
    name: "数据存储",
    baseUnit: "B",
    units: [
      { id: "bit", name: "比特 (Bit)", symbol: "b", ratio: 0.125 },
      { id: "B", name: "字节 (Byte)", symbol: "B", ratio: 1 },
      { id: "KB", name: "千字节 (KB - 1024)", symbol: "KB", ratio: 1024 },
      { id: "MB", name: "兆字节 (MB - 1024)", symbol: "MB", ratio: 1024 ** 2 },
      { id: "GB", name: "吉字节 (GB - 1024)", symbol: "GB", ratio: 1024 ** 3 },
      { id: "TB", name: "太字节 (TB - 1024)", symbol: "TB", ratio: 1024 ** 4 },
      { id: "PB", name: "拍字节 (PB - 1024)", symbol: "PB", ratio: 1024 ** 5 },
      { id: "kB_dec", name: "千字节 (kB - 1000)", symbol: "kB", ratio: 1000 },
      { id: "MB_dec", name: "兆字节 (MB - 1000)", symbol: "MB", ratio: 1000 ** 2 },
      { id: "GB_dec", name: "吉字节 (GB - 1000)", symbol: "GB", ratio: 1000 ** 3 },
      { id: "TB_dec", name: "太字节 (TB - 1000)", symbol: "TB", ratio: 1000 ** 4 },
    ],
  },
  {
    id: "length",
    name: "长度距离",
    baseUnit: "m",
    units: [
      { id: "mm", name: "毫米", symbol: "mm", ratio: 0.001 },
      { id: "cm", name: "厘米", symbol: "cm", ratio: 0.01 },
      { id: "dm", name: "分米", symbol: "dm", ratio: 0.1 },
      { id: "m", name: "米 (基准)", symbol: "m", ratio: 1 },
      { id: "km", name: "千米 (公里)", symbol: "km", ratio: 1000 },
      { id: "in", name: "英寸", symbol: "in", ratio: 0.0254 },
      { id: "ft", name: "英尺", symbol: "ft", ratio: 0.3048 },
      { id: "yd", name: "码", symbol: "yd", ratio: 0.9144 },
      { id: "mi", name: "英里", symbol: "mi", ratio: 1609.344 },
      { id: "nmi", name: "海里", symbol: "nmi", ratio: 1852 },
      { id: "chi_cun", name: "市寸", symbol: "寸", ratio: 1 / 30 },
      { id: "chi_chi", name: "市尺", symbol: "尺", ratio: 1 / 3 },
    ],
  },
  {
    id: "area",
    name: "面积大小",
    baseUnit: "m2",
    units: [
      { id: "cm2", name: "平方厘米", symbol: "cm²", ratio: 0.0001 },
      { id: "m2", name: "平方米 (基准)", symbol: "m²", ratio: 1 },
      { id: "ha", name: "公顷", symbol: "ha", ratio: 10000 },
      { id: "km2", name: "平方千米", symbol: "km²", ratio: 1000000 },
      { id: "mu", name: "市亩", symbol: "亩", ratio: 666.6666667 },
      { id: "ft2", name: "平方英尺", symbol: "ft²", ratio: 0.09290304 },
      { id: "acre", name: "英亩", symbol: "acre", ratio: 4046.8564224 },
    ],
  },
  {
    id: "weight",
    name: "重量质量",
    baseUnit: "g",
    units: [
      { id: "mg", name: "毫克", symbol: "mg", ratio: 0.001 },
      { id: "g", name: "克 (基准)", symbol: "g", ratio: 1 },
      { id: "kg", name: "千克 (公斤)", symbol: "kg", ratio: 1000 },
      { id: "t", name: "公吨", symbol: "t", ratio: 1000000 },
      { id: "jin", name: "市斤", symbol: "斤", ratio: 500 },
      { id: "liang", name: "市两", symbol: "两", ratio: 50 },
      { id: "oz", name: "盎司", symbol: "oz", ratio: 28.349523125 },
      { id: "lb", name: "磅", symbol: "lb", ratio: 453.59237 },
      { id: "ct", name: "克拉 (钻石)", symbol: "ct", ratio: 0.2 },
    ],
  },
  {
    id: "temperature",
    name: "温度温标",
    baseUnit: "C",
    units: [
      { id: "C", name: "摄氏度", symbol: "°C", ratio: 1 },
      { id: "F", name: "华氏度", symbol: "°F", ratio: 1 },
      { id: "K", name: "开尔文 (热力学温度)", symbol: "K", ratio: 1 },
      { id: "R", name: "兰氏度", symbol: "°R", ratio: 1 },
    ],
  },
  {
    id: "time",
    name: "时间跨度",
    baseUnit: "s",
    units: [
      { id: "ms", name: "毫秒", symbol: "ms", ratio: 0.001 },
      { id: "s", name: "秒 (基准)", symbol: "s", ratio: 1 },
      { id: "min", name: "分钟", symbol: "min", ratio: 60 },
      { id: "h", name: "小时", symbol: "h", ratio: 3600 },
      { id: "d", name: "天 (日)", symbol: "d", ratio: 86400 },
      { id: "wk", name: "周 (星期)", symbol: "wk", ratio: 604800 },
      { id: "mo", name: "月 (30天标准)", symbol: "mo", ratio: 2592000 },
      { id: "yr", name: "年 (365天标准)", symbol: "yr", ratio: 31536000 },
    ],
  },
  {
    id: "speed",
    name: "速度速率",
    baseUnit: "m_s",
    units: [
      { id: "m_s", name: "米/秒 (基准)", symbol: "m/s", ratio: 1 },
      { id: "km_h", name: "千米/时 (公里/时)", symbol: "km/h", ratio: 1 / 3.6 },
      { id: "mph", name: "英里/时", symbol: "mph", ratio: 0.44704 },
      { id: "knot", name: "节 (海里/时)", symbol: "kn", ratio: 0.514444 },
      { id: "mach", name: "马赫 (空气声速)", symbol: "Mach", ratio: 340.3 },
      { id: "c", name: "真空中光速", symbol: "c", ratio: 299792458 },
    ],
  },
  {
    id: "pressure",
    name: "压力压强",
    baseUnit: "Pa",
    units: [
      { id: "Pa", name: "帕斯卡 (基准)", symbol: "Pa", ratio: 1 },
      { id: "kPa", name: "千帕", symbol: "kPa", ratio: 1000 },
      { id: "MPa", name: "兆帕", symbol: "MPa", ratio: 1000000 },
      { id: "bar", name: "巴", symbol: "bar", ratio: 100000 },
      { id: "atm", name: "标准大气压", symbol: "atm", ratio: 101325 },
      { id: "mmHg", name: "毫米汞柱 (托)", symbol: "mmHg", ratio: 133.322 },
      { id: "psi", name: "磅力/平方英寸", symbol: "psi", ratio: 6894.757 },
    ],
  },
];

/**
 * 转换特定类别的所有单位数值
 */
export function convertAllUnits(
  category: UnitCategory,
  sourceUnitId: string,
  sourceValue: number
): Record<string, number> {
  const catConfig = UNIT_CATEGORIES.find((c) => c.id === category);
  if (!catConfig || isNaN(sourceValue)) return {};

  const results: Record<string, number> = {};

  // 温度单独处理线性偏移
  if (category === "temperature") {
    // 转换为基准摄氏度 C
    let celsius = sourceValue;
    if (sourceUnitId === "F") {
      celsius = ((sourceValue - 32) * 5) / 9;
    } else if (sourceUnitId === "K") {
      celsius = sourceValue - 273.15;
    } else if (sourceUnitId === "R") {
      celsius = ((sourceValue - 491.67) * 5) / 9;
    }

    results["C"] = celsius;
    results["F"] = (celsius * 9) / 5 + 32;
    results["K"] = celsius + 273.15;
    results["R"] = ((celsius + 273.15) * 9) / 5;
    return results;
  }

  const srcUnit = catConfig.units.find((u) => u.id === sourceUnitId);
  if (!srcUnit) return {};

  // 1. 转为基准单位值
  const baseValue = sourceValue * srcUnit.ratio;

  // 2. 转为各目标单位
  catConfig.units.forEach((u) => {
    results[u.id] = baseValue / u.ratio;
  });

  return results;
}

/**
 * 格式化数值展示（支持精巧的小数与科学计数法）
 */
export function formatUnitNumber(num: number): string {
  if (num === 0) return "0";
  if (isNaN(num)) return "-";

  const abs = Math.abs(num);
  if (abs >= 1e12 || (abs < 1e-6 && abs > 0)) {
    return num.toExponential(6);
  }

  // 避免浮点数精度 0.0000000000001 问题
  const rounded = Number(num.toPrecision(10));
  return rounded.toString();
}
