import React, { useState, useMemo } from "react";
import {
  encryptText,
  decryptText,
  SymmetricAlgorithm,
  CipherMode,
  PaddingMode,
  OutputFormat,
  InputCipherFormat,
  CryptoOptions,
} from "./symmetricCryptoUtils";
import {
  Lock,
  Unlock,
  Key,
  RotateCcw,
  Copy,
  Check,
  ArrowRightLeft,
  SlidersHorizontal,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type ActionType = "encrypt" | "decrypt";

export default function SymmetricCrypto() {
  const [action, setAction] = useState<ActionType>("encrypt");
  const [algorithm, setAlgorithm] = useState<SymmetricAlgorithm>("AES");
  const [inputContent, setInputContent] = useState<string>("Hello World, 这是一段私密内容！");
  const [key, setKey] = useState<string>("my-secret-key-123");
  const [iv, setIv] = useState<string>("1234567890123456");
  const [mode, setMode] = useState<CipherMode>("CBC");
  const [padding, setPadding] = useState<PaddingMode>("Pkcs7");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("Base64");
  const [inputFormat, setInputFormat] = useState<InputCipherFormat>("Auto");

  const [copied, setCopied] = useState<boolean>(false);

  const isBlockCipher = algorithm === "AES" || algorithm === "DES" || algorithm === "TripleDES" || algorithm === "SM4";
  const needsIv = isBlockCipher && mode !== "ECB";

  const options: CryptoOptions = useMemo(
    () => ({
      algorithm,
      key,
      iv: needsIv ? iv : undefined,
      mode,
      padding,
      outputFormat,
      inputFormat,
    }),
    [algorithm, key, iv, needsIv, mode, padding, outputFormat, inputFormat]
  );

  const processResult = useMemo(() => {
    if (action === "encrypt") {
      return encryptText(inputContent, options);
    }
    return decryptText(inputContent, options);
  }, [action, inputContent, options]);

  const handleSwapAction = () => {
    if (processResult.result && !processResult.error) {
      setInputContent(processResult.result);
      setAction(action === "encrypt" ? "decrypt" : "encrypt");
    }
  };

  const handleCopy = async () => {
    if (!processResult.result) return;
    await navigator.clipboard.writeText(processResult.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleClear = () => {
    setInputContent("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                对称加解密
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                支持 AES、DES、3DES、RC4、Rabbit 以及 SM4 算法，支持自定义分组模式、填充与密钥向量
              </p>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center shrink-0">
            <button
              onClick={() => {
                if (action === "decrypt" && processResult.result && !processResult.error) {
                  setInputContent(processResult.result);
                }
                setAction("encrypt");
              }}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                action === "encrypt"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>数据加密</span>
            </button>
            <button
              onClick={() => {
                if (action === "encrypt" && processResult.result && !processResult.error) {
                  setInputContent(processResult.result);
                }
                setAction("decrypt");
              }}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                action === "decrypt"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>数据解密</span>
            </button>
          </div>
        </div>
      </div>

      {/* Algorithm & Config Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          <span>算法参数配置</span>
        </div>

        {/* Algorithm Selectors */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            加密算法 (Algorithm)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { id: "AES", label: "AES (推荐)" },
              { id: "SM4", label: "SM4" },
              { id: "DES", label: "DES" },
              { id: "TripleDES", label: "3DES" },
              { id: "RC4", label: "RC4" },
              { id: "Rabbit", label: "Rabbit" },
            ].map((alg) => (
              <button
                key={alg.id}
                onClick={() => setAlgorithm(alg.id as any)}
                className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  algorithm === alg.id
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {alg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key and IV Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                密钥 (Secret Key)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                长度: {key.length} 字符
              </span>
            </div>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="请输入加密/解密密钥..."
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {needsIv ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>初始向量 (IV)</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {algorithm === "DES" || algorithm === "TripleDES" ? "8 字节" : "16 字节"}
                </span>
              </div>
              <input
                type="text"
                value={iv}
                onChange={(e) => setIv(e.target.value)}
                placeholder="CBC/CTR 模式下的初始向量 IV..."
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          ) : (
            <div className="space-y-1.5 opacity-40 select-none">
              <div className="text-xs font-medium text-slate-400">初始向量 (IV)</div>
              <div className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400">
                当前模式无需 IV
              </div>
            </div>
          )}
        </div>

        {/* Mode, Padding & Output format */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              分组模式 (Mode)
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as CipherMode)}
              disabled={!isBlockCipher}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none disabled:opacity-40"
            >
              <option value="CBC">CBC (密码分组链接 - 常用)</option>
              <option value="ECB">ECB (电码本 - 无 IV)</option>
              <option value="CTR">CTR (计数器模式)</option>
              <option value="OFB">OFB (输出反馈)</option>
              <option value="CFB">CFB (密文反馈)</option>
            </select>
          </div>

          {/* Padding */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              填充方式 (Padding)
            </label>
            <select
              value={padding}
              onChange={(e) => setPadding(e.target.value as PaddingMode)}
              disabled={!isBlockCipher || algorithm === "SM4"}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none disabled:opacity-40"
            >
              <option value="Pkcs7">PKCS7 (标准推荐)</option>
              <option value="ZeroPadding">ZeroPadding (补零)</option>
              <option value="AnsiX923">ANSI X.923</option>
              <option value="Iso10126">ISO 10126</option>
              <option value="NoPadding">NoPadding (无填充)</option>
            </select>
          </div>

          {/* Output/Input Format */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {action === "encrypt" ? "密文输出格式 (Output)" : "密文输入格式 (Input)"}
            </label>
            {action === "encrypt" ? (
              <div className="grid grid-cols-2 gap-2">
                {(["Base64", "Hex"] as OutputFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt)}
                    className={`py-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                      outputFormat === fmt
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {(["Auto", "Base64", "Hex"] as InputCipherFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setInputFormat(fmt)}
                    className={`py-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                      inputFormat === fmt
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {fmt === "Auto" ? "自动" : fmt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input & Output Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {action === "encrypt" ? "待加密明文 (Plaintext)" : "待解密密文 (Ciphertext)"}
            </label>

            <button
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空
            </button>
          </div>

          <textarea
            rows={10}
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder={action === "encrypt" ? "输入需要加密的明文数据..." : "输入 Base64 或 Hex 格式的密文数据..."}
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>字符数: {inputContent.length}</span>
            <span>字节大小: {new Blob([inputContent]).size} Bytes</span>
          </div>
        </div>

        {/* Output Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {action === "encrypt" ? "加密密文结果" : "解密还原明文"}
            </label>

            <div className="flex items-center gap-2">
              {processResult.result && !processResult.error && (
                <>
                  <button
                    onClick={handleSwapAction}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors cursor-pointer"
                    title="将输出作为输入进行对调操作"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>对调</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>复制结果</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {processResult.error ? (
            <div className="flex-1 w-full p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">处理失败</div>
                <div className="mt-1 leading-relaxed">{processResult.error}</div>
              </div>
            </div>
          ) : (
            <textarea
              readOnly
              rows={10}
              value={processResult.result}
              placeholder="加解密结果将在此实时呈现..."
              className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 outline-none resize-none select-all break-all leading-relaxed"
            />
          )}

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-mono">
            <span>结果字符: {processResult.result.length}</span>
            <span>大小: {new Blob([processResult.result]).size} Bytes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
