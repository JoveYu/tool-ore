import { describe, it, expect } from "vitest";
import {
  formatWsTime,
  tryFormatJson,
  getMessageByteSize,
  formatWsByteSize,
  filterWsMessages,
  WS_PUBLIC_SERVERS,
  WsMessageItem,
} from "../src/tools/dev/webSocketUtils";

describe("WebSocket Utilities", () => {
  it("formats timestamp with milliseconds correctly", () => {
    const ts = new Date("2026-08-25T14:30:45.123").getTime();
    const formatted = formatWsTime(ts);
    expect(formatted).toContain("14:30:45.123");
  });

  it("identifies and formats valid JSON strings", () => {
    const rawJson = '{"key":"value","num":123}';
    const formatted = tryFormatJson(rawJson);
    expect(formatted).not.toBeNull();
    expect(formatted).toContain('  "key": "value"');

    const nonJson = "Hello World";
    expect(tryFormatJson(nonJson)).toBeNull();
  });

  it("calculates and formats byte size accurately", () => {
    expect(getMessageByteSize("Hello")).toBe(5);
    expect(getMessageByteSize("中文")).toBe(6);

    expect(formatWsByteSize(500)).toBe("500 B");
    expect(formatWsByteSize(2048)).toBe("2.0 KB");
    expect(formatWsByteSize(1024 * 1024 * 3.5)).toBe("3.50 MB");
  });

  it("filters and searches messages by keyword and type", () => {
    const list: WsMessageItem[] = [
      { id: "1", type: "send", content: '{"type":"ping"}', timestamp: 1000, byteLength: 15 },
      { id: "2", type: "receive", content: '{"type":"pong"}', timestamp: 1050, byteLength: 15 },
      { id: "3", type: "system", content: "Connected to server", timestamp: 900, byteLength: 19 },
    ];

    const allPings = filterWsMessages(list, "ping", "all");
    expect(allPings.length).toBe(1);
    expect(allPings[0].id).toBe("1");

    const receivedOnly = filterWsMessages(list, "", "receive");
    expect(receivedOnly.length).toBe(1);
    expect(receivedOnly[0].id).toBe("2");
  });

  it("provides reliable public testing servers", () => {
    expect(WS_PUBLIC_SERVERS.length).toBeGreaterThanOrEqual(2);
    expect(WS_PUBLIC_SERVERS[0].url.startsWith("wss://")).toBe(true);
  });
});
