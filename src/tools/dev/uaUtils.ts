export interface UaParsedResult {
  raw: string;
  browser: {
    name: string;
    version: string;
    major: string;
  };
  engine: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type: "desktop" | "mobile" | "tablet" | "smarttv" | "bot" | "unknown";
    vendor?: string;
    model?: string;
  };
  cpu: {
    architecture?: string;
  };
  isBot: boolean;
  botName?: string;
}

export const UA_PRESETS = [
  {
    name: "当前浏览器 User-Agent",
    ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
  },
  {
    name: "iPhone 15 Pro (iOS 17 Safari)",
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1",
  },
  {
    name: "微信客户端 (Android WeChat)",
    ua: "Mozilla/5.0 (Linux; Android 14; ALN-AL00 Build/HUAWEIALN-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160065 MMWEBSDK/20240301 MMWEBID/5846 MicroMessenger/8.0.48.2580(0x28003036) WeChat/arm64 Weixin NetType/WIFI",
  },
  {
    name: "Windows 11 (Chrome 125)",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  },
  {
    name: "MacBook Pro (macOS Safari 17)",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
  },
  {
    name: "Googlebot (SEO 搜索引擎爬虫)",
    ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
];

/**
 * 纯前端高精度 User-Agent 解析算法
 */
export function parseUserAgent(uaString: string): UaParsedResult {
  const ua = uaString.trim();
  if (!ua) {
    return {
      raw: "",
      browser: { name: "未知", version: "", major: "" },
      engine: { name: "未知", version: "" },
      os: { name: "未知", version: "" },
      device: { type: "unknown" },
      cpu: {},
      isBot: false,
    };
  }

  // 1. 爬虫 Bot 检测
  let isBot = false;
  let botName: string | undefined;
  if (/googlebot/i.test(ua)) {
    isBot = true;
    botName = "Googlebot";
  } else if (/baiduspider/i.test(ua)) {
    isBot = true;
    botName = "Baiduspider";
  } else if (/bingbot/i.test(ua)) {
    isBot = true;
    botName = "Bingbot";
  } else if (/bytespider/i.test(ua)) {
    isBot = true;
    botName = "Bytespider (头条/抖音)";
  } else if (/bot|crawler|spider|curl|wget|python/i.test(ua)) {
    isBot = true;
    botName = "网络爬虫或脚本";
  }

  // 2. 操作系统检测
  let osName = "未知";
  let osVersion = "";

  if (/Windows NT 10\.0/i.test(ua)) {
    osName = "Windows";
    osVersion = "10 / 11";
  } else if (/Windows NT 6\.3/i.test(ua)) {
    osName = "Windows";
    osVersion = "8.1";
  } else if (/Windows NT 6\.1/i.test(ua)) {
    osName = "Windows";
    osVersion = "7";
  } else if (/Windows/i.test(ua)) {
    osName = "Windows";
  } else if (/iPhone/i.test(ua)) {
    osName = "iOS";
    const match = ua.match(/iPhone OS ([\d_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, ".");
  } else if (/iPad/i.test(ua)) {
    osName = "iPadOS";
    const match = ua.match(/CPU OS ([\d_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, ".");
  } else if (/Mac OS X ([\d_]+)/i.test(ua)) {
    osName = "macOS";
    const match = ua.match(/Mac OS X ([\d_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, ".");
  } else if (/Android ([\d.]+)/i.test(ua)) {
    osName = "Android";
    const match = ua.match(/Android ([\d.]+)/i);
    if (match) osVersion = match[1];
  } else if (/CrOS/i.test(ua)) {
    osName = "Chrome OS";
  } else if (/Linux/i.test(ua)) {
    osName = "Linux";
  }

  // 3. 浏览器检测
  let browserName = "未知";
  let browserVersion = "";

  if (/MicroMessenger\/([\d.]+)/i.test(ua)) {
    browserName = "WeChat 微信内置浏览器";
    browserVersion = ua.match(/MicroMessenger\/([\d.]+)/i)?.[1] || "";
  } else if (/QQBrowser\/([\d.]+)/i.test(ua)) {
    browserName = "QQ 浏览器";
    browserVersion = ua.match(/QQBrowser\/([\d.]+)/i)?.[1] || "";
  } else if (/Edg(?:e|A|IOS)?\/([\d.]+)/i.test(ua)) {
    browserName = "Microsoft Edge";
    browserVersion = ua.match(/Edg(?:e|A|IOS)?\/([\d.]+)/i)?.[1] || "";
  } else if (/Chrome\/([\d.]+)/i.test(ua) && !/Chromium/i.test(ua)) {
    browserName = "Google Chrome";
    browserVersion = ua.match(/Chrome\/([\d.]+)/i)?.[1] || "";
  } else if (/Version\/([\d.]+).*Safari/i.test(ua)) {
    browserName = "Apple Safari";
    browserVersion = ua.match(/Version\/([\d.]+)/i)?.[1] || "";
  } else if (/Firefox\/([\d.]+)/i.test(ua)) {
    browserName = "Mozilla Firefox";
    browserVersion = ua.match(/Firefox\/([\d.]+)/i)?.[1] || "";
  } else if (/Opera|OPR\/([\d.]+)/i.test(ua)) {
    browserName = "Opera";
    browserVersion = ua.match(/OPR\/([\d.]+)/i)?.[1] || "";
  }

  const browserMajor = browserVersion.split(".")[0] || "";

  // 4. 渲染引擎检测
  let engineName = "未知";
  let engineVersion = "";

  if (/AppleWebKit\/([\d.]+)/i.test(ua)) {
    engineName = "Blink / WebKit";
    engineVersion = ua.match(/AppleWebKit\/([\d.]+)/i)?.[1] || "";
  } else if (/Gecko\/([\d.]+)/i.test(ua)) {
    engineName = "Gecko";
    engineVersion = ua.match(/Gecko\/([\d.]+)/i)?.[1] || "";
  } else if (/Trident\/([\d.]+)/i.test(ua)) {
    engineName = "Trident";
    engineVersion = ua.match(/Trident\/([\d.]+)/i)?.[1] || "";
  }

  // 5. 设备类型与厂商
  let deviceType: UaParsedResult["device"]["type"] = "desktop";
  let vendor: string | undefined;
  let model: string | undefined;

  if (isBot) {
    deviceType = "bot";
  } else if (/iPad|tablet/i.test(ua)) {
    deviceType = "tablet";
    vendor = "Apple";
    model = "iPad";
  } else if (/iPhone/i.test(ua)) {
    deviceType = "mobile";
    vendor = "Apple";
    model = "iPhone";
  } else if (/Mobile|Android|Phone/i.test(ua)) {
    deviceType = "mobile";
    if (/Huawei|HONOR|HMA|ALN-/i.test(ua)) vendor = "Huawei 华为";
    else if (/Xiaomi|Redmi|MI /i.test(ua)) vendor = "Xiaomi 小米";
    else if (/Samsung|SM-/i.test(ua)) vendor = "Samsung 三星";
    else if (/OPPO/i.test(ua)) vendor = "OPPO";
    else if (/vivo/i.test(ua)) vendor = "vivo";
    else vendor = "Android 设备";
  } else if (/SmartTV|TV|HbbTV/i.test(ua)) {
    deviceType = "smarttv";
  }

  // 6. CPU 架构
  let cpuArch: string | undefined;
  if (/arm64|aarch64/i.test(ua)) cpuArch = "ARM64";
  else if (/x86_64|win64|x64|amd64/i.test(ua)) cpuArch = "x86_64 (64位)";
  else if (/i686|i386|x86/i.test(ua)) cpuArch = "x86 (32位)";

  return {
    raw: ua,
    browser: {
      name: browserName,
      version: browserVersion,
      major: browserMajor,
    },
    engine: {
      name: engineName,
      version: engineVersion,
    },
    os: {
      name: osName,
      version: osVersion,
    },
    device: {
      type: deviceType,
      vendor,
      model,
    },
    cpu: {
      architecture: cpuArch,
    },
    isBot,
    botName,
  };
}
