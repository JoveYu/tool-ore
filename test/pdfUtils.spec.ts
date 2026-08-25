import { describe, it, expect } from "vitest";
import {
  parsePageRange,
  getPdfInfo,
  mergePdfFiles,
  splitOrExtractPdf,
  rotatePdfPages,
  addWatermarkToPdf,
} from "../src/tools/doc/pdfUtils";
import { PDFDocument } from "pdf-lib";

async function createSamplePdf(pageCount: number = 3): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([400, 300]);
    page.drawText(`Page ${i + 1}`);
  }
  return await doc.save();
}

describe("PDF Utilities", () => {
  it("parses page ranges accurately", () => {
    expect(parsePageRange("1-3, 5", 10)).toEqual([0, 1, 2, 4]);
    expect(parsePageRange("2, 4, 6-7", 10)).toEqual([1, 3, 5, 6]);
    expect(parsePageRange("", 5)).toEqual([0, 1, 2, 3, 4]);
    expect(parsePageRange("100-200", 5)).toEqual([]);
  });

  it("reads PDF info correctly", async () => {
    const pdfBytes = await createSamplePdf(4);
    const info = await getPdfInfo(pdfBytes.buffer as ArrayBuffer);
    expect(info.pageCount).toBe(4);
    expect(info.pages.length).toBe(4);
    expect(info.pages[0].width).toBe(400);
  });

  it("merges multiple PDFs into one", async () => {
    const pdfA = await createSamplePdf(2);
    const pdfB = await createSamplePdf(3);

    const merged = await mergePdfFiles([
      pdfA.buffer as ArrayBuffer,
      pdfB.buffer as ArrayBuffer,
    ]);
    const info = await getPdfInfo(merged.buffer as ArrayBuffer);
    expect(info.pageCount).toBe(5);
  });

  it("extracts specific pages from PDF", async () => {
    const pdf = await createSamplePdf(6);
    const extracted = await splitOrExtractPdf(pdf.buffer as ArrayBuffer, [0, 2, 4]);
    const info = await getPdfInfo(extracted.buffer as ArrayBuffer);
    expect(info.pageCount).toBe(3);
  });

  it("rotates PDF pages", async () => {
    const pdf = await createSamplePdf(2);
    const rotated = await rotatePdfPages(pdf.buffer as ArrayBuffer, 90);
    const doc = await PDFDocument.load(rotated);
    expect(doc.getPage(0).getRotation().angle).toBe(90);
  });

  it("adds watermark to PDF", async () => {
    const pdf = await createSamplePdf(2);
    const watermarked = await addWatermarkToPdf(pdf.buffer as ArrayBuffer, {
      text: "CONFIDENTIAL",
      opacity: 0.3,
      size: 40,
    });
    expect(watermarked.length).toBeGreaterThan(pdf.length);
  });
});
