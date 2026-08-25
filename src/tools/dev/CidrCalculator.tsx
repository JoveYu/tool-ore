import React, { useState, useMemo } from "react";
import {
  calculateCidr,
  getSubnetMaskTable,
  CidrCalculationResult,
} from "./cidrUtils";
import {
  Network,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Server,
  Globe2,
  Table,
  AlertCircle,
} from "lucide-react";

export default function CidrCalculator() {
  const [ipInput, setIpInput] = useState<string>("192.168.1.100");
  const [prefixLength, setPrefixLength] = useState<number>(24);
  const [showMaskTable, setShowMaskTable] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 处理输入包含斜杠 CIDR 形式（如 10.0.0.1/16）
  const handleIpChange = (val: string) => {
    if (val.includes("/")) {
      const [ipPart, cidrPart] = val.split("/");
      setIpInput(ipPart.trim());
      const num = parseInt(cidrPart.trim(), 10);
      if (!isNaN(num) && num >= 0 && num <= 32) {
        setPrefixLength(num);
      }
    } else {
      setIpInput(val);
    }
  };

  const result: CidrCalculationResult = useMemo(
    () => calculateCidr(ipInput, prefixLength),
    [ipInput, prefixLength]
  );

  const subnetTable = useMemo(() => getSubnetMaskTable(), []);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const sampleIps = [
    { label: "家庭/局域网 192.168.1.0/24", ip: "192.168.1.1", mask: 24 },
    { label: "企业大内网 10.0.0.0/16", ip: "10.0.0.1", mask: 16 },
    { label: "微服务容器网段 172.17.0.0/16", ip: "172.17.0.1", mask: 16 },
    { label: "点对点直连 10.0.0.1/30", ip: "10.0.0.1", mask: 30 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              IP 子网掩码与 CIDR 计算器
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              IPv4 网络地址、广播地址、可用主机范围、通配符掩码与全量子网对照速查
            </p>
          </div>
        </div>
      </div>

      {/* Input Configuration Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            输入 IP 地址与子网掩码长度
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {sampleIps.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setIpInput(s.ip);
                  setPrefixLength(s.mask);
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium transition-colors cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* IP Input */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              IP 地址 (支持 192.168.1.1/24 格式)
            </label>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => handleIpChange(e.target.value)}
              placeholder="例如: 192.168.1.100..."
              className="w-full px-4 py-2.5 font-mono text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Mask Slider / Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                掩码位 (/{prefixLength})
              </label>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {result.netmask || "255.255.255.0"}
              </span>
            </div>
            <select
              value={prefixLength}
              onChange={(e) => setPrefixLength(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
            >
              {subnetTable.map((item) => (
                <option key={item.cidr} value={item.cidr}>
                  /{item.cidr} - {item.netmask} ({item.usableHosts} 台主机)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Slider */}
        <div className="space-y-1.5 pt-1">
          <input
            type="range"
            min="0"
            max="32"
            value={prefixLength}
            onChange={(e) => setPrefixLength(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>/0 (全网)</span>
            <span>/8</span>
            <span>/16</span>
            <span>/24 (常用)</span>
            <span>/32 (单机)</span>
          </div>
        </div>

        {!result.isValid && ipInput.trim() && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{result.error}</span>
          </div>
        )}
      </div>

      {/* Main Calculation Results Grid */}
      {result.isValid && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Network Address */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">网络起始地址</span>
              <button
                onClick={() => handleCopy("net", result.networkAddress)}
                className="text-slate-400 hover:text-indigo-600 cursor-pointer"
              >
                {copiedKey === "net" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400 select-all">
              {result.networkAddress}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              CIDR: {result.networkAddress}/{result.prefixLength}
            </div>
          </div>

          {/* Broadcast Address */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">广播截止地址</span>
              <button
                onClick={() => handleCopy("broad", result.broadcastAddress)}
                className="text-slate-400 hover:text-indigo-600 cursor-pointer"
              >
                {copiedKey === "broad" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="font-mono font-bold text-lg text-slate-800 dark:text-slate-100 select-all">
              {result.broadcastAddress}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              通配符反码: {result.wildcardMask}
            </div>
          </div>

          {/* Usable Hosts */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">可用主机数量</span>
              <Server className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
              {result.usableHosts.toLocaleString()} 台
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              总地址数: {result.totalHosts.toLocaleString()}
            </div>
          </div>

          {/* IP Category / Type */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">IP 网络属性</span>
              <Globe2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
              {result.ipType}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              掩码: {result.netmask}
            </div>
          </div>
        </div>
      )}

      {/* Detailed IP Range & Binary Breakdown */}
      {result.isValid && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
            网段可用范围与二进制分解
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-400 font-sans block">第一个可用 IP (最小地址)</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm select-all">
                {result.firstUsableIp}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-400 font-sans block">最后一个可用 IP (最大地址)</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm select-all">
                {result.lastUsableIp}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-400 font-sans block">IP 地址二进制表示</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 select-all">
                {result.ipBinary}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-400 font-sans block">子网掩码二进制表示</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 select-all">
                {result.maskBinary}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Subnet Mask Cheat Sheet Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Table className="w-4 h-4 text-indigo-500" />
            <span>IPv4 /0 ~ /32 全量子网掩码对照表</span>
          </div>

          <button
            onClick={() => setShowMaskTable(!showMaskTable)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {showMaskTable ? "收起表格" : "展开对照表"}
          </button>
        </div>

        {showMaskTable && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 uppercase">
                  <th className="py-2.5 px-6 font-semibold">CIDR</th>
                  <th className="py-2.5 px-6 font-semibold">子网掩码</th>
                  <th className="py-2.5 px-6 font-semibold">通配符掩码</th>
                  <th className="py-2.5 px-6 font-semibold">可用主机数</th>
                  <th className="py-2.5 px-6 font-semibold">总地址数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {subnetTable.map((item) => (
                  <tr
                    key={item.cidr}
                    onClick={() => setPrefixLength(item.cidr)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                      prefixLength === item.cidr
                        ? "bg-indigo-50/60 dark:bg-indigo-950/40 font-bold text-indigo-600 dark:text-indigo-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <td className="py-2 px-6">/{item.cidr}</td>
                    <td className="py-2 px-6">{item.netmask}</td>
                    <td className="py-2 px-6 text-slate-400">{item.wildcard}</td>
                    <td className="py-2 px-6">{item.usableHosts.toLocaleString()}</td>
                    <td className="py-2 px-6 text-slate-400">{item.totalHosts.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
