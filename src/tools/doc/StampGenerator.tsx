import React, { useState, useEffect } from "react";
import {
  Stamp,
  Download,
  Sliders,
  Sparkles,
  Circle,
  Square,
  Building2,
  FileCheck2,
  FileSpreadsheet,
  Receipt,
  UserCheck,
  RotateCw,
} from "lucide-react";
import {
  StampShape,
  StampStandardType,
  StampCenterType,
  StampOptions,
  OFFICIAL_STAMP_PRESETS,
  STAMP_COLORS,
  renderOfficialStamp,
} from "./stampUtils";

export default function StampGenerator() {
  const [standardType, setStandardType] = useState<StampStandardType>("official_seal");
  const [shape, setShape] = useState<StampShape>("circle");
  const [companyName, setCompanyName] = useState<string>("北京智能创新科技股份有限公司");
  const [subText, setSubText] = useState<string>("");
  const [taxNumber, setTaxNumber] = useState<string>("91110108MA01234567");
  const [securityCode, setSecurityCode] = useState<string>("1101080000000");
  const [branchCode, setBranchCode] = useState<string>("(1)");
  const [centerType, setCenterType] = useState<StampCenterType>("star");
  const [centerText, setCenterText] = useState<string>("专用");
  const [color, setColor] = useState<string>("#C8161D");
  const [noiseStrength, setNoiseStrength] = useState<number>(0.12);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  const [stampDataUrl, setStampDataUrl] = useState<string>("");

  // Re-generate official stamp DataURL
  useEffect(() => {
    const opts: StampOptions = {
      standardType,
      shape,
      companyName,
      subText,
      taxNumber,
      securityCode,
      branchCode,
      centerType,
      centerText,
      color,
      size: 600,
      noiseStrength,
      agingBlur: 0,
      rotationAngle,
    };
    const url = renderOfficialStamp(opts);
    setStampDataUrl(url);
  }, [
    standardType,
    shape,
    companyName,
    subText,
    taxNumber,
    securityCode,
    branchCode,
    centerType,
    centerText,
    color,
    noiseStrength,
    rotationAngle,
  ]);

  const handleApplyPreset = (presetId: StampStandardType) => {
    const preset = OFFICIAL_STAMP_PRESETS.find((p) => p.id === presetId);
    if (!preset || !preset.config) return;

    setStandardType(presetId);
    if (preset.config.shape) setShape(preset.config.shape);
    if (preset.config.companyName) setCompanyName(preset.config.companyName);
    if (preset.config.subText !== undefined) setSubText(preset.config.subText);
    if (preset.config.taxNumber) setTaxNumber(preset.config.taxNumber);
    if (preset.config.securityCode !== undefined) setSecurityCode(preset.config.securityCode);
    if (preset.config.branchCode !== undefined) setBranchCode(preset.config.branchCode);
    if (preset.config.centerType) setCenterType(preset.config.centerType);
    if (preset.config.color) setColor(preset.config.color);
  };

  const handleDownload = () => {
    if (!stampDataUrl) return;
    const link = document.createElement("a");
    link.href = stampDataUrl;
    link.download = `stamp_${standardType}_${Date.now()}.png`;
    link.click();
  };

  const getPresetIcon = (id: StampStandardType) => {
    switch (id) {
      case "official_seal":
        return <Building2 className="w-4 h-4" />;
      case "contract_seal":
        return <FileCheck2 className="w-4 h-4" />;
      case "finance_seal":
        return <FileSpreadsheet className="w-4 h-4" />;
      case "invoice_seal":
        return <Receipt className="w-4 h-4" />;
      case "legal_person_seal":
        return <UserCheck className="w-4 h-4" />;
      default:
        return <Stamp className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Stamp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              电子印章与业务印章生成
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              遵循国家印章标准与国税发票章规范，纯本地 Canvas 实时生成标准企业公章、合同章、发票章与个人名章
            </p>
          </div>
        </div>
      </div>

      {/* Official Standard Presets Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>国家标准印章类型选择</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {OFFICIAL_STAMP_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                standardType === p.id
                  ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold shadow-2xs ring-2 ring-rose-500/20"
                  : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {getPresetIcon(p.id)}
                <span>{p.name}</span>
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-normal">
                {p.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Settings Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>印章版面与要素配置</span>
            </span>
          </div>

          {/* Dynamic Form based on Standard Type */}
          <div className="space-y-4 text-xs">
            {/* Primary Name Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {standardType === "legal_person_seal"
                  ? "印章名称 / 个人姓名"
                  : "单位全称 (上弧仿宋体文字)"}
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={
                  standardType === "legal_person_seal"
                    ? "如: 张三之印、李四印信"
                    : "如: 北京某某网络科技股份有限公司"
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Standard Circular / Contract / Finance Fields */}
            {standardType !== "invoice_seal" && standardType !== "legal_person_seal" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    业务类型名称 (中部横排文字)
                  </label>
                  <input
                    type="text"
                    value={subText}
                    onChange={(e) => setSubText(e.target.value)}
                    placeholder="法定公章可留空，或输入: 合同专用章、财务专用章"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    13 位防伪序列编码 (下弧数字串)
                  </label>
                  <input
                    type="text"
                    value={securityCode}
                    onChange={(e) => setSecurityCode(e.target.value)}
                    placeholder="如: 1101080000000 (留空不显示)"
                    className="w-full px-3.5 py-2.5 font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Invoice Specific Fields (国税发 [2011] 7 号标准) */}
            {standardType === "invoice_seal" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    统一社会信用代码 (18 位中排纳税人识别号)
                  </label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="91110108MA01234567"
                    className="w-full px-3.5 py-2.5 font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    发票章机构分支编号 (下部文字)
                  </label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="如: (1)、(2) 或留空"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Ink Color & Style Customization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  标准印泥色彩
                </span>
                <div className="flex flex-wrap gap-2">
                  {STAMP_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.color)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        color === c.color
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold shadow-2xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span>{c.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  中心图案规范
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCenterType("star")}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      centerType === "star"
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    标准五角星
                  </button>
                  <button
                    onClick={() => setCenterType("none")}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      centerType === "none"
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    无中心图
                  </button>
                </div>
              </div>
            </div>

            {/* Aging & Texture Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>物理印泥做旧与纸张斑驳感</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">
                    {Math.round(noiseStrength * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.6"
                  step="0.02"
                  value={noiseStrength}
                  onChange={(e) => setNoiseStrength(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400">
                  模拟真实印泥渗透纸张纤维的不规则微小间隙
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>手工盖印轻微倾斜角度</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">{rotationAngle}°</span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  step="1"
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400">
                  真实盖印时常带有 -3° ~ 5° 的自然手工倾角
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Live Preview & Download Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between gap-6">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-full text-center pb-2 border-b border-slate-100 dark:border-slate-800">
            印章真实渲染预览
          </div>

          <div
            className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center w-full aspect-square shadow-inner overflow-hidden"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)",
              backgroundSize: "16px 16px",
            }}
          >
            {stampDataUrl ? (
              <img
                src={stampDataUrl}
                alt="电子公章预览"
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  imageRendering: "pixelated",
                }}
                className="max-h-full max-w-full object-contain transition-transform duration-150 drop-shadow-xs"
              />
            ) : (
              <div className="text-xs text-slate-400">正在生成预览...</div>
            )}
          </div>

          <div className="w-full space-y-2">
            <button
              onClick={handleDownload}
              disabled={!stampDataUrl}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>下载透明背景高清印章 PNG</span>
            </button>
            <div className="text-[11px] text-center text-slate-400">
              透明背景 600×600 矢量级超清 PNG，可直接叠加盖印至合同与文档
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
