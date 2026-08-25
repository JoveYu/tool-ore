import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Radio,
  Send,
  Play,
  Square,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  Copy,
  Check,
  Search,
  Download,
  Trash2,
  Activity,
  Zap,
  Clock,
  Code2,
  CheckCircle2,
  AlertCircle,
  Braces,
} from "lucide-react";
import {
  WsMessageItem,
  WsStats,
  WS_PUBLIC_SERVERS,
  WS_MESSAGE_TEMPLATES,
  formatWsTime,
  tryFormatJson,
  getMessageByteSize,
  formatWsByteSize,
  filterWsMessages,
} from "./webSocketUtils";

type WsConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export default function WebSocketTester() {
  // Connection states
  const [url, setUrl] = useState<string>("wss://ws.postman-echo.com/raw");
  const [subProtocol, setSubProtocol] = useState<string>("");
  const [status, setStatus] = useState<WsConnectionStatus>("disconnected");
  const [statusMessage, setStatusMessage] = useState<string>("未连接");

  // Heartbeat states
  const [heartbeatEnabled, setHeartbeatEnabled] = useState<boolean>(false);
  const [heartbeatInterval, setHeartbeatInterval] = useState<number>(10); // seconds
  const [heartbeatMessage, setHeartbeatMessage] = useState<string>('{"type":"ping"}');

  // Input states
  const [inputMessage, setInputMessage] = useState<string>(
    '{\n  "action": "hello",\n  "timestamp": ' + Date.now() + '\n}'
  );

  // Message log states
  const [messages, setMessages] = useState<WsMessageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "send" | "receive" | "system">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<WsStats>({
    sentCount: 0,
    receivedCount: 0,
    sentBytes: 0,
    receivedBytes: 0,
    connectedAt: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Heartbeat timer handler
  useEffect(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    if (heartbeatEnabled && status === "connected" && wsRef.current) {
      heartbeatTimerRef.current = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const content = heartbeatMessage;
          wsRef.current.send(content);

          const bytes = getMessageByteSize(content);
          const msgItem: WsMessageItem = {
            id: Math.random().toString(36).slice(2, 9),
            type: "send",
            content,
            timestamp: Date.now(),
            byteLength: bytes,
            isJson: Boolean(tryFormatJson(content)),
          };

          setMessages((prev) => [...prev, msgItem]);
          setStats((prev) => ({
            ...prev,
            sentCount: prev.sentCount + 1,
            sentBytes: prev.sentBytes + bytes,
          }));
        }
      }, heartbeatInterval * 1000);
    }

    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    };
  }, [heartbeatEnabled, heartbeatInterval, heartbeatMessage, status]);

  // Connect / Disconnect Handler
  const handleToggleConnect = () => {
    if (status === "connected" || status === "connecting") {
      // Disconnect
      if (wsRef.current) {
        wsRef.current.close();
      }
      return;
    }

    if (!url.trim()) return;

    setStatus("connecting");
    setStatusMessage("正在建立长连接...");

    const addSystemMsg = (text: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2, 9),
          type: "system",
          content: text,
          timestamp: Date.now(),
          byteLength: 0,
        },
      ]);
    };

    try {
      const protocols = subProtocol.trim() ? subProtocol.split(/[, ]+/).filter(Boolean) : undefined;
      const ws = protocols && protocols.length > 0 ? new WebSocket(url.trim(), protocols) : new WebSocket(url.trim());
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        setStatusMessage("已连接");
        setStats((prev) => ({ ...prev, connectedAt: Date.now() }));
        addSystemMsg(`已成功连接至服务器: ${url}`);
      };

      ws.onmessage = (event) => {
        const text = typeof event.data === "string" ? event.data : "[二进制数据/Blob]";
        const bytes = getMessageByteSize(text);
        const formatted = tryFormatJson(text);

        const msgItem: WsMessageItem = {
          id: Math.random().toString(36).slice(2, 9),
          type: "receive",
          content: formatted || text,
          timestamp: Date.now(),
          byteLength: bytes,
          isJson: Boolean(formatted),
        };

        setMessages((prev) => [...prev, msgItem]);
        setStats((prev) => ({
          ...prev,
          receivedCount: prev.receivedCount + 1,
          receivedBytes: prev.receivedBytes + bytes,
        }));
      };

      ws.onerror = () => {
        setStatus("error");
        setStatusMessage("连接异常发生错误");
        addSystemMsg(`WebSocket 发生错误，请检查服务器地址与跨域策略`);
      };

      ws.onclose = (event) => {
        setStatus("disconnected");
        setStatusMessage(event.wasClean ? "连接已关闭" : `连接意外断开 (代码: ${event.code})`);
        addSystemMsg(`连接已断开: ${event.reason || `代码 ${event.code}`}`);
        wsRef.current = null;
      };
    } catch (err: any) {
      setStatus("error");
      setStatusMessage(`创建连接失败: ${err?.message || "地址格式有误"}`);
      addSystemMsg(`无法创建 WebSocket 实例: ${err?.message}`);
    }
  };

  // Send message
  const handleSendMessage = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("请先建立并确认 WebSocket 连接成功");
      return;
    }

    if (!inputMessage.trim()) return;

    const content = inputMessage.trim();
    wsRef.current.send(content);

    const bytes = getMessageByteSize(content);
    const formatted = tryFormatJson(content);

    const msgItem: WsMessageItem = {
      id: Math.random().toString(36).slice(2, 9),
      type: "send",
      content: formatted || content,
      timestamp: Date.now(),
      byteLength: bytes,
      isJson: Boolean(formatted),
    };

    setMessages((prev) => [...prev, msgItem]);
    setStats((prev) => ({
      ...prev,
      sentCount: prev.sentCount + 1,
      sentBytes: prev.sentBytes + bytes,
    }));
  };

  const handleCopyMessage = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExportLogs = () => {
    if (messages.length === 0) return;
    const jsonStr = JSON.stringify(messages, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ws_messages_${Date.now()}.json`;
    a.click();
  };

  const filteredList = useMemo(() => {
    return filterWsMessages(messages, searchQuery, filterType);
  }, [messages, searchQuery, filterType]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              WebSocket 在线测试与调试
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              纯前端长连接测试工具，支持 JSON 自动排版、自动心跳保活、实时上下行通信日志与报文导出
            </p>
          </div>
        </div>
      </div>

      {/* URL & Connect Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Quick Public Servers */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">快速测试服务:</span>
          {WS_PUBLIC_SERVERS.map((server) => (
            <button
              key={server.name}
              onClick={() => setUrl(server.url)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer shadow-2xs"
            >
              {server.name}
            </button>
          ))}
        </div>

        {/* URL Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={status === "connected" || status === "connecting"}
              placeholder="ws:// 或 wss:// 服务器地址 (如 wss://ws.postman-echo.com/raw)"
              className="w-full px-4 py-3 font-mono text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
            />
          </div>

          <button
            onClick={handleToggleConnect}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer shrink-0 ${
              status === "connected"
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                : status === "connecting"
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
            }`}
          >
            {status === "connected" ? (
              <>
                <Square className="w-4 h-4" />
                <span>断开连接</span>
              </>
            ) : status === "connecting" ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>取消连接</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>建立连接</span>
              </>
            )}
          </button>
        </div>

        {/* Status Indicator & Sub-protocol Input */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                status === "connected"
                  ? "bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"
                  : status === "connecting"
                  ? "bg-amber-500 animate-ping"
                  : status === "error"
                  ? "bg-rose-500"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {statusMessage}
            </span>
          </div>

          {/* Heartbeat quick toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
              <input
                type="checkbox"
                checked={heartbeatEnabled}
                onChange={(e) => setHeartbeatEnabled(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>定时心跳</span>
            </label>

            {heartbeatEnabled && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">间隔:</span>
                <select
                  value={heartbeatInterval}
                  onChange={(e) => setHeartbeatInterval(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
                >
                  <option value={3}>3秒</option>
                  <option value={5}>5秒</option>
                  <option value={10}>10秒</option>
                  <option value={30}>30秒</option>
                  <option value={60}>60秒</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Sender - Right Live Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Message Editor Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-500" />
                <span>消息发送区</span>
              </div>

              <button
                onClick={() => {
                  const formatted = tryFormatJson(inputMessage);
                  if (formatted) setInputMessage(formatted);
                }}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Braces className="w-3 h-3" />
                格式化 JSON
              </button>
            </div>

            {/* Template Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {WS_MESSAGE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  onClick={() => setInputMessage(tmpl.content)}
                  className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              rows={12}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="在此输入待发送的文本或 JSON 消息..."
              className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              大小: {formatWsByteSize(getMessageByteSize(inputMessage))}
            </span>

            <button
              onClick={handleSendMessage}
              disabled={status !== "connected" || !inputMessage.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>发送消息</span>
            </button>
          </div>
        </div>

        {/* Right: Message Stream Log (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3 flex-1 flex flex-col">
            {/* Log Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span>通信日志</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-500">
                  {messages.length} 条
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs">
                {/* Filter tabs */}
                {(["all", "send", "receive"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      filterType === f
                        ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-2xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {f === "all" ? "全部" : f === "send" ? "发送" : "接收"}
                  </button>
                ))}

                <button
                  onClick={() => setMessages([])}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
                  title="清空日志"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleExportLogs}
                  disabled={messages.length === 0}
                  className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                  title="导出通信报文"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索日志内容..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>

            {/* Message Stream */}
            <div className="flex-1 min-h-[320px] max-h-[460px] overflow-y-auto space-y-2.5 p-1 rounded-xl">
              {filteredList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs text-slate-400 space-y-2">
                  <Activity className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                  <span>暂无通信记录，连接服务器后即可实时查看收发消息</span>
                </div>
              ) : (
                filteredList.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl border text-xs font-mono transition-all group ${
                      msg.type === "send"
                        ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/70 dark:border-indigo-900/50"
                        : msg.type === "receive"
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/50"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/60"
                    }`}
                  >
                    {/* Top Bar of item */}
                    <div className="flex items-center justify-between text-[11px] pb-1.5 mb-1.5 border-b border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-1.5 font-bold">
                        {msg.type === "send" ? (
                          <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>发送</span>
                          </span>
                        ) : msg.type === "receive" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>接收</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <Info className="w-3.5 h-3.5" />
                            <span>系统</span>
                          </span>
                        )}
                        <span className="text-slate-400 font-normal">
                          {formatWsTime(msg.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {msg.byteLength > 0 && (
                          <span className="text-[10px] text-slate-400">
                            {formatWsByteSize(msg.byteLength)}
                          </span>
                        )}
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 rounded cursor-pointer"
                          title="复制内容"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <pre className="whitespace-pre-wrap break-all leading-relaxed text-slate-800 dark:text-slate-200">
                      {msg.content}
                    </pre>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* Bottom Statistics Summary */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[10px] text-slate-400 block font-sans">已发消息</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {stats.sentCount}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[10px] text-slate-400 block font-sans">已收消息</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {stats.receivedCount}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[10px] text-slate-400 block font-sans">发送流量</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {formatWsByteSize(stats.sentBytes)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[10px] text-slate-400 block font-sans">接收流量</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {formatWsByteSize(stats.receivedBytes)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
