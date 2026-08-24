import React, { useState, useEffect, useMemo } from "react";
import {
  encryptAsymmetric,
  decryptAsymmetric,
  generateAsymmetricKeyPair,
  AsymmetricAlgorithm,
  OutputFormat,
  CipherFormat,
  KeyPairResult,
} from "./asymmetricCryptoUtils";
import {
  KeyRound,
  Lock,
  Unlock,
  Key,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  AlertCircle,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from "lucide-react";

type ActionType = "encrypt" | "decrypt";

export default function AsymmetricCrypto() {
  const [algorithm, setAlgorithm] = useState<AsymmetricAlgorithm>("RSA");
  const [action, setAction] = useState<ActionType>("encrypt");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("Base64");
  const [inputFormat, setInputFormat] = useState<CipherFormat>("Auto");

  // Key Pair states
  const [keyPair, setKeyPair] = useState<KeyPairResult>({
    publicKey: "",
    privateKey: "",
  });
  const [isGeneratingKeys, setIsGeneratingKeys] = useState<boolean>(false);
  const [sm2CipherMode, setSm2CipherMode] = useState<"1" | "0">("1");

  // Content state
  const [inputContent, setInputContent] = useState<string>("Hello World, 非对称加密数据测试！");
  const [manualKey, setManualKey] = useState<string>("");
  const [useGeneratedKey, setUseGeneratedKey] = useState<boolean>(true);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Generate initial keypair on load / algorithm change
  useEffect(() => {
    let isMounted = true;
    const gen = async () => {
      setIsGeneratingKeys(true);
      try {
        const pair = await generateAsymmetricKeyPair(algorithm);
        if (isMounted) {
          setKeyPair(pair);
        }
      } catch (err) {
        console.error("生成密钥对失败", err);
      } finally {
        if (isMounted) {
          setIsGeneratingKeys(false);
        }
      }
    };

    gen();
    return () => {
      isMounted = false;
    };
  }, [algorithm]);

  // Current active key for operation
  const activeKey = useMemo(() => {
    if (useGeneratedKey) {
      return action === "encrypt" ? keyPair.publicKey : keyPair.privateKey;
    }
    return manualKey;
  }, [useGeneratedKey, action, keyPair, manualKey]);

  // Process encryption or decryption
  const processResult = useMemo(() => {
    if (action === "encrypt") {
      return encryptAsymmetric(inputContent, {
        algorithm,
        key: activeKey,
        cipherMode: sm2CipherMode,
        outputFormat,
      });
    }
    return decryptAsymmetric(inputContent, {
      algorithm,
      key: activeKey,
      cipherMode: sm2CipherMode,
      inputFormat,
    });
  }, [action, inputContent, algorithm, activeKey, sm2CipherMode, outputFormat, inputFormat]);

  const handleGenerateNewKeys = async () => {
    setIsGeneratingKeys(true);
    try {
      const pair = await generateAsymmetricKeyPair(algorithm);
      setKeyPair(pair);
      setUseGeneratedKey(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  const handleSwapAction = () => {
    if (processResult.result && !processResult.error) {
      setInputContent(processResult.result);
      setAction(action === "encrypt" ? "decrypt" : "encrypt");
    }
  };

  const handleCopy = async (keyName: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 1800);
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
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                非对称加解密
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                支持 RSA (2048-bit) 与 SM2 算法，纯本地生成密钥对、公钥加密与私钥解密
              </p>
            </div>
          </div>

          {/* Action Mode Tabs */}
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
              <span>公钥加密</span>
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
              <span>私钥解密</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Management & Algorithm Selection Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              选择算法:
            </span>
            <div className="flex gap-2">
              {[
                { id: "RSA", label: "RSA (2048-bit)" },
                { id: "SM2", label: "SM2" },
              ].map((alg) => (
                <button
                  key={alg.id}
                  onClick={() => setAlgorithm(alg.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    algorithm === alg.id
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {alg.label}
                </button>
              ))}
            </div>

            {algorithm === "SM2" && (
              <div className="flex items-center gap-1.5 ml-2 text-xs">
                <span className="text-slate-400">模式:</span>
                <select
                  value={sm2CipherMode}
                  onChange={(e) => setSm2CipherMode(e.target.value as "1" | "0")}
                  className="px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="1">C1C3C2 (新国标)</option>
                  <option value="0">C1C2C3 (旧国标)</option>
                </select>
              </div>
            )}

            {/* Output Format Tabs (Encrypt) */}
            {action === "encrypt" && (
              <div className="flex items-center gap-1.5 ml-2 text-xs">
                <span className="text-slate-400">输出格式:</span>
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                  {(["Base64", "Hex"] as OutputFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      className={`px-2.5 py-0.5 rounded-md font-mono transition-colors cursor-pointer ${
                        outputFormat === fmt
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Format Tabs (Decrypt) */}
            {action === "decrypt" && (
              <div className="flex items-center gap-1.5 ml-2 text-xs">
                <span className="text-slate-400">输入密文格式:</span>
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                  {(["Auto", "Base64", "Hex"] as CipherFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setInputFormat(fmt)}
                      className={`px-2.5 py-0.5 rounded-md font-mono transition-colors cursor-pointer ${
                        inputFormat === fmt
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                      }`}
                    >
                      {fmt === "Auto" ? "自动识别" : fmt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateNewKeys}
            disabled={isGeneratingKeys}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingKeys ? "animate-spin" : ""}`} />
            <span>重新生成密钥对</span>
          </button>
        </div>

        {/* Key pair display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Public Key */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-500" />
                公钥 (Public Key - 用于加密)
              </span>
              <button
                onClick={() => handleCopy("pub", keyPair.publicKey)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === "pub" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                复制公钥
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={keyPair.publicKey}
              className="w-full p-2.5 font-mono text-[11px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none select-all resize-none"
            />
          </div>

          {/* Private Key */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                私钥 (Private Key - 用于解密，请妥善保管)
              </span>
              <button
                onClick={() => handleCopy("priv", keyPair.privateKey)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === "priv" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                复制私钥
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={keyPair.privateKey}
              className="w-full p-2.5 font-mono text-[11px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none select-all resize-none"
            />
          </div>
        </div>

        {/* Custom key override */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!useGeneratedKey}
                onChange={(e) => setUseGeneratedKey(!e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>使用自定义输入的{action === "encrypt" ? "公钥" : "私钥"}</span>
            </label>
          </div>

          {!useGeneratedKey && (
            <textarea
              rows={3}
              value={manualKey}
              onChange={(e) => setManualKey(e.target.value)}
              placeholder={`请粘贴你自己的 ${algorithm} ${action === "encrypt" ? "公钥 (PEM格式或十六进制)" : "私钥 (PEM格式或十六进制)"}...`}
              className="w-full p-2.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          )}
        </div>
      </div>

      {/* Inputs & Output Grid */}
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
            placeholder={action === "encrypt" ? "输入需要公钥加密的明文文本..." : "输入需要私钥解密的 Base64 或 Hex 密文..."}
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>字符数: {inputContent.length}</span>
            <span>大小: {new Blob([inputContent]).size} Bytes</span>
          </div>
        </div>

        {/* Output Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {action === "encrypt" ? "非对称加密密文" : "解密还原明文"}
            </label>

            <div className="flex items-center gap-2">
              {processResult.result && !processResult.error && (
                <>
                  <button
                    onClick={handleSwapAction}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors cursor-pointer"
                    title="将密文与操作对调"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>对调</span>
                  </button>

                  <button
                    onClick={() => handleCopy("result", processResult.result)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                  >
                    {copiedKey === "result" ? (
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
