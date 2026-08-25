export type StampShape = "circle" | "oval" | "rectangle";
export type StampStandardType =
  | "official_seal" // 标准企业公章 (40mm/42mm 圆形)
  | "contract_seal" // 合同专用章 (40mm 圆形)
  | "finance_seal" // 财务专用章 (38mm/40mm 圆形)
  | "invoice_seal" // 国家税务总局标准发票专用章 (40x30mm 椭圆)
  | "legal_person_seal" // 法人名章 (20x20mm 方形)
  | "custom"; // 自定义印章

export type StampCenterType = "star" | "text" | "none";

export interface StampOptions {
  standardType: StampStandardType;
  shape: StampShape;
  companyName: string; // 单位/企业名称 (上弧)
  subText?: string; // 业务名称 (如: "合同专用章"、"财务专用章"、"发票专用章")
  taxNumber?: string; // 18位统一社会信用代码 (发票章中排)
  securityCode?: string; // 13位防伪编码 (公章下弧)
  branchCode?: string; // 发票章底部编号 (如 "(1)"、"(2)")
  centerType: StampCenterType;
  centerText?: string; // 中心文字 (当 centerType="text" 时)
  color: string; // 印泥颜色 (标准中国红 #C8161D / #D32020 / 鲜红 #E53333)
  size: number; // 画布输出物理尺寸 px (默认 600 高清)
  borderWidthRatio?: number; // 边框粗细比例
  noiseStrength: number; // 做旧斑驳与印泥渗透强度 (0 ~ 1)
  agingBlur: number; // 边缘油墨晕染渗透 (0 ~ 3px)
  rotationAngle: number; // 盖印倾斜角 (-30° ~ 30°)
}

/**
 * 常用标准印泥色彩
 */
export const STAMP_COLORS = [
  { name: "国标朱红 (推荐)", color: "#C8161D" },
  { name: "印泥大红", color: "#D32020" },
  { name: "鲜艳红", color: "#E53333" },
  { name: "深枣红", color: "#A81117" },
  { name: "财务纯蓝", color: "#0047AB" },
  { name: "商务深紫", color: "#5C1349" },
];

/**
 * 国家标准印章预设模版
 */
export const OFFICIAL_STAMP_PRESETS: {
  id: StampStandardType;
  name: string;
  desc: string;
  config: Partial<StampOptions>;
}[] = [
  {
    id: "official_seal",
    name: "标准法定公章",
    desc: "符合 GA 241 规范 · 40mm/42mm 圆形 · 仿宋瘦长字形 · 中心 14mm 星 + 13 位防伪码",
    config: {
      standardType: "official_seal",
      shape: "circle",
      companyName: "北京智能创新科技股份有限公司",
      subText: "",
      securityCode: "1101080000000",
      centerType: "star",
      color: "#C8161D",
    },
  },
  {
    id: "contract_seal",
    name: "标准合同专用章",
    desc: "40mm 圆形 · 中心五角星 + 正下方横排合同专用章 + 防伪编码",
    config: {
      standardType: "contract_seal",
      shape: "circle",
      companyName: "北京企业控股集团有限公司",
      subText: "合同专用章",
      securityCode: "91110108MA0000000X",
      centerType: "star",
      color: "#D32020",
    },
  },
  {
    id: "finance_seal",
    name: "标准财务专用章",
    desc: "38mm/40mm 圆形 · 中心五角星 + 正下方横排财务专用章",
    config: {
      standardType: "finance_seal",
      shape: "circle",
      companyName: "北京远大国际供应链有限公司",
      subText: "财务专用章",
      securityCode: "1101081234567",
      centerType: "star",
      color: "#C8161D",
    },
  },
  {
    id: "invoice_seal",
    name: "国家税务总局标准发票专用章",
    desc: "国税 2011 第 7 号公告 · 40×30mm 椭圆 · 统一信用代码 + 发票专用章",
    config: {
      standardType: "invoice_seal",
      shape: "oval",
      companyName: "北京鼎盛电子商务股份有限公司",
      taxNumber: "91110108MA01234567",
      subText: "发票专用章",
      branchCode: "(1)",
      centerType: "none",
      color: "#C8161D",
    },
  },
  {
    id: "legal_person_seal",
    name: "法定代表人名章",
    desc: "20×20mm 方形 · 传统回文排版 · 个人私章",
    config: {
      standardType: "legal_person_seal",
      shape: "rectangle",
      companyName: "张三之印",
      subText: "",
      centerType: "none",
      color: "#C8161D",
    },
  },
];

/**
 * 绘制标准五角星 (严格按照国家印章规范比例，外接圆直径约 14mm / 40mm = 35%)
 */
export function drawStandardStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string
) {
  const spikes = 5;
  const innerRadius = radius * 0.382; // 黄金分割比内缩星尖
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * radius;
    y = cy + Math.sin(rot) * radius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - radius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/**
 * 沿上圆弧绘制中文机构名称
 * 遵循中国公章标准：字高通常为 4.0mm - 4.5mm，字宽约为 2.5mm - 3.0mm (宽高比 ~0.66 瘦长仿宋体)
 */
export function drawCircularTopText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  charHeight: number, // 字高 (如 4.2mm 对应 size * 0.105)
  charWidth: number, // 字宽 (如 2.8mm 对应 size * 0.070)
  color: string
) {
  if (!text) return;
  const chars = text.split("");
  const len = chars.length;
  if (len === 0) return;

  ctx.save();
  // 遵循国标优先采用标准仿宋体与宋体
  ctx.font = `bold ${charHeight}px "STFangsong", "FangSong", "SimSun", "Songti SC", "STSong", serif`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 字宽/字高比例 (2.8mm / 4.2mm ≈ 0.667 瘦长汉字)
  const widthRatio = Math.max(0.55, Math.min(0.8, charWidth / charHeight));

  // 中国公章标准规范：企业全称铺满除底部防伪区外的整个圆环
  // 底部留出约 80° ~ 88° 的防伪编码区，上环文字跨度覆盖约 265° ~ 275° (1.48 PI ~ 1.53 PI)
  const fullMaxSpan = Math.PI * 1.52; // 最大跨度 ~274°
  const fullMinSpan = Math.PI * 1.42; // 最小跨度 ~255°

  const naturalSpan = (len - 1) * ((charWidth * 1.45) / radius);
  const totalAngle = len > 1 ? Math.max(fullMinSpan, Math.min(fullMaxSpan, naturalSpan)) : 0;

  const startAngle = -Math.PI / 2 - totalAngle / 2;
  const angleStep = len > 1 ? totalAngle / (len - 1) : 0;

  chars.forEach((char, i) => {
    const angle = len > 1 ? startAngle + i * angleStep : -Math.PI / 2;
    ctx.save();
    // 移动至圆弧字符中心
    ctx.translate(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    // 旋转：字脚朝圆心，字头朝外
    ctx.rotate(angle + Math.PI / 2);
    // 按标准瘦长比例拉伸
    ctx.scale(widthRatio, 1.0);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });

  ctx.restore();
}

/**
 * 沿下圆弧绘制 13 位防伪序列码（标准字高 1.2mm ~ 1.5mm）
 */
export function drawCircularBottomCode(
  ctx: CanvasRenderingContext2D,
  code: string,
  cx: number,
  cy: number,
  radius: number,
  charHeight: number,
  color: string
) {
  if (!code) return;
  const chars = code.split("");
  const len = chars.length;
  if (len === 0) return;

  ctx.save();
  ctx.font = `bold ${charHeight}px "Arial", "OCR-B", "Consolas", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 底部下弧防伪编码跨度约 90° ~ 110°
  const maxSpan = Math.PI * 0.65;
  const charSpacing = Math.min(0.062, maxSpan / Math.max(len, 1));
  const totalAngle = len > 1 ? Math.min(maxSpan, (len - 1) * charSpacing) : 0;

  const startAngle = Math.PI / 2 - totalAngle / 2;
  const angleStep = len > 1 ? totalAngle / (len - 1) : 0;

  chars.forEach((char, i) => {
    const angle = len > 1 ? startAngle + i * angleStep : Math.PI / 2;
    ctx.save();
    ctx.translate(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    ctx.rotate(angle - Math.PI / 2);
    ctx.scale(0.85, 1.0);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });

  ctx.restore();
}

/**
 * 沿椭圆弧绘制企业名称（发票专用章标准：字高 4.2mm，字宽 2.8mm）
 */
export function drawOvalTopText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  charHeight: number,
  charWidth: number,
  color: string
) {
  if (!text) return;
  const chars = text.split("");
  const len = chars.length;
  if (len === 0) return;

  ctx.save();
  ctx.font = `bold ${charHeight}px "STFangsong", "FangSong", "SimSun", "Songti SC", serif`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const widthRatio = Math.max(0.55, Math.min(0.8, charWidth / charHeight));
  const maxSpan = Math.PI * 1.32; // 发票章上弧饱满跨度 ~238°
  const minSpan = Math.PI * 1.15;
  const naturalSpan = (len - 1) * ((charWidth * 1.45) / rx);
  const totalAngle = len > 1 ? Math.max(minSpan, Math.min(maxSpan, naturalSpan)) : 0;

  const startAngle = -Math.PI / 2 - totalAngle / 2;
  const angleStep = len > 1 ? totalAngle / (len - 1) : 0;

  chars.forEach((char, i) => {
    const angle = len > 1 ? startAngle + i * angleStep : -Math.PI / 2;
    ctx.save();
    ctx.translate(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
    ctx.rotate(angle + Math.PI / 2);
    ctx.scale(widthRatio, 1.0);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });

  ctx.restore();
}

/**
 * 物理印泥斑驳与做旧真实质感处理
 */
export function applyStampTextureFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  noiseStrength: number,
  blurAmount: number = 0
) {
  if (noiseStrength <= 0 && blurAmount <= 0) return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const totalPixels = width * height;

  if (noiseStrength > 0) {
    const count = Math.floor(totalPixels * noiseStrength * 0.18);
    for (let i = 0; i < count; i++) {
      const pIdx = Math.floor(Math.random() * totalPixels) * 4;
      if (data[pIdx + 3] > 40) {
        const dropRatio = Math.random();
        if (dropRatio > 0.35) {
          data[pIdx + 3] = Math.max(0, data[pIdx + 3] - Math.floor(Math.random() * 220));
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * 纯前端按照中国国家印章标准渲染印章并返回高清 PNG DataURL
 */
export function renderOfficialStamp(options: StampOptions): string {
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  const size = options.size || 600; // 基准 600px 对应 40mm 印章 (1mm ≈ 15px)
  const isOval = options.shape === "oval";
  canvas.width = size;
  canvas.height = isOval ? Math.round(size * 0.75) : size;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "";

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const color = options.color || "#C8161D";

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ── A. 圆形公章 / 合同专用章 / 财务专用章 (40mm / 42mm / 38mm) ──
  if (options.shape === "circle") {
    // 边线宽标准 1.0mm ~ 1.2mm (约占直径的 2.5% ~ 3.0%)
    const borderWidth = Math.max(3, Math.round(size * 0.025));
    const outerRadius = size / 2 - borderWidth * 2;

    // 1. 绘制外圈边线
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();

    // 2. 上弧企业名称 (国标：字高 4.0mm - 4.5mm，字宽 2.5mm - 3.0mm)
    // 40mm 直径对应字高 10.5%，字宽 7.0%
    const charHeight = Math.round(size * 0.105);
    const charWidth = Math.round(size * 0.07);
    const topRadius = outerRadius - charHeight * 0.65;
    drawCircularTopText(
      ctx,
      options.companyName,
      cx,
      cy,
      topRadius,
      charHeight,
      charWidth,
      color
    );

    // 3. 中心五角星 (国标：五角星严格位于印章正中心)
    if (options.centerType === "star") {
      // 存在横排业务文字时五角星适配为 11mm (半径 ~13%)，无横排文字时为标准 14mm (半径 17.5%)
      const starRadius = options.subText
        ? Math.round(size * 0.13)
        : Math.round(size * 0.175);
      drawStandardStar(ctx, cx, cy, starRadius, color);
    } else if (options.centerType === "text" && options.centerText) {
      ctx.save();
      const centerFontSize = Math.round(size * 0.08);
      ctx.font = `bold ${centerFontSize}px "STFangsong", "SimSun", serif`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(options.centerText, cx, cy);
      ctx.restore();
    }

    // 4. 横排业务名称 (如 "合同专用章"、"财务专用章"，字高 4.0mm，字宽 2.8mm，排布在五角星正下方)
    if (options.subText) {
      ctx.save();
      const subHeight = Math.round(size * 0.065); // 标准字高 4.0mm
      const subWidth = Math.round(size * 0.046); // 标准字宽 2.8mm
      const widthRatio = subWidth / subHeight; // 瘦长字形 (~0.70)

      ctx.font = `bold ${subHeight}px "STFangsong", "FangSong", "SimSun", serif`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const subChars = options.subText.split("");
      const subLen = subChars.length;
      const subSpacing = subWidth * 1.32;
      const subTotalWidth = (subLen - 1) * subSpacing;
      const subStartX = cx - subTotalWidth / 2;
      // 位于中心五角星下方，距中心点约 18.5% 直径，留出清晰充足的间隔
      const subY = cy + Math.round(size * 0.185);

      subChars.forEach((ch, idx) => {
        const charX = subStartX + idx * subSpacing;
        ctx.save();
        ctx.translate(charX, subY);
        ctx.scale(widthRatio, 1.0);
        ctx.fillText(ch, 0, 0);
        ctx.restore();
      });

      ctx.restore();
    }

    // 5. 底部环形 13 位防伪编码 (国标：字高 1.2mm ~ 1.5mm，对应约 3.5%)
    if (options.securityCode) {
      const codeFontSize = Math.round(size * 0.035);
      const codeRadius = outerRadius - codeFontSize * 1.35;
      drawCircularBottomCode(
        ctx,
        options.securityCode,
        cx,
        cy,
        codeRadius,
        codeFontSize,
        color
      );
    }
  }
  // ── B. 发票专用章 (国税发 [2011] 7 号标准 40×30mm 椭圆) ──
  else if (options.shape === "oval") {
    const borderWidth = Math.max(3, Math.round(size * 0.022));
    const rx = canvas.width / 2 - borderWidth * 2;
    const ry = canvas.height / 2 - borderWidth * 2;

    // 1. 外圈椭圆边框
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();

    // 2. 顶部上弧纳税人名称 (字高 4.2mm，字宽 2.8mm)
    const charHeight = Math.round(size * 0.095);
    const charWidth = Math.round(size * 0.063);
    const topRx = rx - charHeight * 0.65;
    const topRy = ry - charHeight * 0.65;
    drawOvalTopText(ctx, options.companyName, cx, cy, topRx, topRy, charHeight, charWidth, color);

    // 3. 中部第一行：18 位纳税人识别号 (统一社会信用代码，字高 2.2mm)
    if (options.taxNumber) {
      ctx.save();
      const taxFontSize = Math.round(size * 0.048);
      ctx.font = `bold ${taxFontSize}px "Arial", "OCR-B", sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(options.taxNumber, cx, cy - size * 0.038);
      ctx.restore();
    }

    // 4. 中部第二行：“发票专用章”五个大字 (字高 4.5mm，字宽 3.0mm)
    const invoiceText = options.subText || "发票专用章";
    ctx.save();
    const invHeight = Math.round(size * 0.10);
    const invWidth = Math.round(size * 0.068);
    const invRatio = invWidth / invHeight;

    ctx.font = `bold ${invHeight}px "STFangsong", "FangSong", "SimSun", serif`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const invChars = invoiceText.split("");
    const invLen = invChars.length;
    const invSpacing = invWidth * 1.32;
    const invTotalWidth = (invLen - 1) * invSpacing;
    const invStartX = cx - invTotalWidth / 2;
    const invY = cy + size * 0.075;

    invChars.forEach((ch, idx) => {
      const charX = invStartX + idx * invSpacing;
      ctx.save();
      ctx.translate(charX, invY);
      ctx.scale(invRatio, 1.0);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });

    ctx.restore();

    // 5. 底部印章分支编号 (如 "(1)")
    if (options.branchCode) {
      ctx.save();
      const branchFontSize = Math.round(size * 0.036);
      ctx.font = `bold ${branchFontSize}px "Arial", sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(options.branchCode, cx, cy + ry * 0.68);
      ctx.restore();
    }
  }
  // ── C. 法定代表人名章 (传统方形 20×20mm) ──
  else {
    const pad = Math.round(size * 0.08);
    const rw = canvas.width - pad * 2;
    const rh = canvas.height - pad * 2;
    const borderWidth = Math.max(3, Math.round(size * 0.02));

    // 1. 边框
    ctx.save();
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = color;
    ctx.strokeRect(pad, pad, rw, rh);
    ctx.restore();

    // 2. 方章文字排版：4字回文排版（右上、右下、左上、左下）
    const text = options.companyName || "张三之印";
    ctx.save();
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (text.length === 4) {
      const charHeight = Math.round(rw * 0.38);
      const charWidth = Math.round(rw * 0.28);
      const widthRatio = charWidth / charHeight;

      ctx.font = `bold ${charHeight}px "STFangsong", "FangSong", "SimSun", serif`;
      const colRightX = cx + rw * 0.22;
      const colLeftX = cx - rw * 0.22;
      const rowTopY = cy - rh * 0.22;
      const rowBottomY = cy + rh * 0.22;

      // 右上
      ctx.save();
      ctx.translate(colRightX, rowTopY);
      ctx.scale(widthRatio, 1.0);
      ctx.fillText(text[0], 0, 0);
      ctx.restore();

      // 右下
      ctx.save();
      ctx.translate(colRightX, rowBottomY);
      ctx.scale(widthRatio, 1.0);
      ctx.fillText(text[1], 0, 0);
      ctx.restore();

      // 左上
      ctx.save();
      ctx.translate(colLeftX, rowTopY);
      ctx.scale(widthRatio, 1.0);
      ctx.fillText(text[2], 0, 0);
      ctx.restore();

      // 左下
      ctx.save();
      ctx.translate(colLeftX, rowBottomY);
      ctx.scale(widthRatio, 1.0);
      ctx.fillText(text[3], 0, 0);
      ctx.restore();
    } else {
      const fontSize = Math.round((rw / Math.max(text.length, 2)) * 0.9);
      ctx.font = `bold ${fontSize}px "STFangsong", "FangSong", "SimSun", serif`;
      ctx.fillText(text, cx, cy);
    }
    ctx.restore();
  }

  // 做旧质感与渗透处理
  if (options.noiseStrength > 0) {
    applyStampTextureFilter(ctx, canvas.width, canvas.height, options.noiseStrength, options.agingBlur);
  }

  return canvas.toDataURL("image/png");
}
