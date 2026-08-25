export interface WsMessageItem {
  id: string;
  type: "send" | "receive" | "system";
  content: string;
  timestamp: number; // 毫秒时间戳
  byteLength: number;
  isJson?: boolean;
}

export interface WsStats {
  sentCount: number;
  receivedCount: number;
  sentBytes: number;
  receivedBytes: number;
  connectedAt: number | null;
}

export interface WsPresetServer {
  name: string;
  url: string;
  desc: string;
}

export const WS_PUBLIC_SERVERS: WsPresetServer[] = [
  {
    name: "Postman Echo (回显测试)",
    url: "wss://ws.postman-echo.com/raw",
    desc: "将发送的任何数据原样回显",
  },
  {
    name: "PieSocket Echo",
    url: "wss://echo.piesocket.com/v3/channel_1?api_key=VC3oEGttzDAngNfZDANx2iErErYqvjbCPEmPREnN",
    desc: "高可靠免费公开测试节点",
  },
  {
    name: "Localhost 本地测试",
    url: "ws://localhost:8080",
    desc: "连接本地开发服务",
  },
];

export const WS_MESSAGE_TEMPLATES = [
  {
    name: "心跳 Ping",
    content: '{"type":"ping"}',
  },
  {
    name: "身份认证 Auth",
    content: '{"action":"auth","token":"demo_jwt_token_123456"}',
  },
  {
    name: "订阅频道 Subscribe",
    content: '{"action":"subscribe","channel":"market_ticks","topic":"BTC_USDT"}',
  },
  {
    name: "纯文本 Hello",
    content: "Hello WebSocket Server!",
  },
];

/**
 * 格式化时间为 HH:mm:ss.SSS
 */
export function formatWsTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number, len: number = 2) => n.toString().padStart(len, "0");
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  const ms = pad(d.getMilliseconds(), 3);
  return `${h}:${m}:${s}.${ms}`;
}

/**
 * 检验字符串是否为有效 JSON，若是则返回美化格式，否则返回 null
 */
export function tryFormatJson(str: string): string | null {
  try {
    const trimmed = str.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      const parsed = JSON.parse(str);
      return JSON.stringify(parsed, null, 2);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 计算消息字节大小 (UTF-8 字符长度)
 */
export function getMessageByteSize(str: string): number {
  return new Blob([str]).size;
}

/**
 * 格式化字节大小显示
 */
export function formatWsByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * 过滤与搜索 WebSocket 消息列表
 */
export function filterWsMessages(
  messages: WsMessageItem[],
  query: string,
  filterType: "all" | "send" | "receive" | "system"
): WsMessageItem[] {
  return messages.filter((msg) => {
    if (filterType !== "all" && msg.type !== filterType) {
      return false;
    }
    if (query.trim()) {
      return msg.content.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  });
}
