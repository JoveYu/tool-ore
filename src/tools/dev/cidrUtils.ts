export interface CidrCalculationResult {
  isValid: boolean;
  error?: string;
  ip: string;
  prefixLength: number;
  netmask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalHosts: number;
  usableHosts: number;
  ipType: string;
  ipBinary: string;
  maskBinary: string;
}

export interface SubnetMaskInfo {
  cidr: number;
  netmask: string;
  wildcard: string;
  totalHosts: number;
  usableHosts: number;
}

/**
 * 将 IPv4 字符串转为 32 位无符号整数
 */
export function ipToNumber(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    throw new Error("无效的 IPv4 地址");
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/**
 * 将 32 位无符号整数转为 IPv4 字符串
 */
export function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".");
}

/**
 * 将 32 位无符号整数转为 8 位一组的二进制字符串
 */
export function numberToBinary(num: number): string {
  const bin = (num >>> 0).toString(2).padStart(32, "0");
  return `${bin.slice(0, 8)}.${bin.slice(8, 16)}.${bin.slice(16, 24)}.${bin.slice(24, 32)}`;
}

/**
 * 判定 IP 类别与公私网属性
 */
export function getIpType(ipNum: number): string {
  const firstOctet = (ipNum >>> 24) & 255;
  const secondOctet = (ipNum >>> 16) & 255;

  if (firstOctet === 127) return "本地回环地址 (Loopback)";
  if (firstOctet === 10) return "A 类私有保留网段 (Private 10.0.0.0/8)";
  if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31)
    return "B 类私有保留网段 (Private 172.16.0.0/12)";
  if (firstOctet === 192 && secondOctet === 168)
    return "C 类私有保留网段 (Private 192.168.0.0/16)";
  if (firstOctet === 169 && secondOctet === 254) return "链路本地地址 (Link-Local)";
  if (firstOctet >= 224 && firstOctet <= 239) return "D 类多播地址 (Multicast)";
  if (firstOctet >= 240 && firstOctet <= 255) return "E 类实验保留地址 (Reserved)";

  if (firstOctet >= 1 && firstOctet <= 126) return "A 类公网地址 (Public Class A)";
  if (firstOctet >= 128 && firstOctet <= 191) return "B 类公网地址 (Public Class B)";
  if (firstOctet >= 192 && firstOctet <= 223) return "C 类公网地址 (Public Class C)";

  return "公网地址 (Public IP)";
}

/**
 * 计算完整的 CIDR 网络划分数据
 */
export function calculateCidr(ipStr: string, prefixLen: number): CidrCalculationResult {
  const cleanIp = ipStr.trim();
  if (!cleanIp) {
    return {
      isValid: false,
      error: "请输入 IP 地址",
      ip: "",
      prefixLength: prefixLen,
      netmask: "",
      wildcardMask: "",
      networkAddress: "",
      broadcastAddress: "",
      firstUsableIp: "",
      lastUsableIp: "",
      totalHosts: 0,
      usableHosts: 0,
      ipType: "",
      ipBinary: "",
      maskBinary: "",
    };
  }

  if (prefixLen < 0 || prefixLen > 32) {
    return {
      isValid: false,
      error: "子网掩码长度必须在 0 到 32 之间",
      ip: cleanIp,
      prefixLength: prefixLen,
      netmask: "",
      wildcardMask: "",
      networkAddress: "",
      broadcastAddress: "",
      firstUsableIp: "",
      lastUsableIp: "",
      totalHosts: 0,
      usableHosts: 0,
      ipType: "",
      ipBinary: "",
      maskBinary: "",
    };
  }

  try {
    const ipNum = ipToNumber(cleanIp);
    const maskNum = prefixLen === 0 ? 0 : (~0 << (32 - prefixLen)) >>> 0;
    const wildcardNum = (~maskNum) >>> 0;

    const networkNum = (ipNum & maskNum) >>> 0;
    const broadcastNum = (networkNum | wildcardNum) >>> 0;

    const totalHosts = Math.pow(2, 32 - prefixLen);
    const usableHosts = prefixLen >= 31 ? (prefixLen === 31 ? 2 : 1) : Math.max(0, totalHosts - 2);

    const firstUsableNum = prefixLen >= 31 ? networkNum : networkNum + 1;
    const lastUsableNum = prefixLen >= 31 ? broadcastNum : Math.max(networkNum, broadcastNum - 1);

    return {
      isValid: true,
      ip: numberToIp(ipNum),
      prefixLength: prefixLen,
      netmask: numberToIp(maskNum),
      wildcardMask: numberToIp(wildcardNum),
      networkAddress: numberToIp(networkNum),
      broadcastAddress: numberToIp(broadcastNum),
      firstUsableIp: numberToIp(firstUsableNum),
      lastUsableIp: numberToIp(lastUsableNum),
      totalHosts,
      usableHosts,
      ipType: getIpType(ipNum),
      ipBinary: numberToBinary(ipNum),
      maskBinary: numberToBinary(maskNum),
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err?.message || "IP 地址格式不合法",
      ip: cleanIp,
      prefixLength: prefixLen,
      netmask: "",
      wildcardMask: "",
      networkAddress: "",
      broadcastAddress: "",
      firstUsableIp: "",
      lastUsableIp: "",
      totalHosts: 0,
      usableHosts: 0,
      ipType: "",
      ipBinary: "",
      maskBinary: "",
    };
  }
}

/**
 * 获取全量 /0 到 /32 子网掩码对照速查表
 */
export function getSubnetMaskTable(): SubnetMaskInfo[] {
  const list: SubnetMaskInfo[] = [];
  for (let i = 0; i <= 32; i++) {
    const maskNum = i === 0 ? 0 : (~0 << (32 - i)) >>> 0;
    const wildcardNum = (~maskNum) >>> 0;
    const totalHosts = Math.pow(2, 32 - i);
    const usableHosts = i >= 31 ? (i === 31 ? 2 : 1) : Math.max(0, totalHosts - 2);

    list.push({
      cidr: i,
      netmask: numberToIp(maskNum),
      wildcard: numberToIp(wildcardNum),
      totalHosts,
      usableHosts,
    });
  }
  return list;
}
