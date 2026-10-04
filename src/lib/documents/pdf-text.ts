import "server-only";
import path from "node:path";
import { pathToFileURL } from "node:url";

export interface PdfPageText {
  page: number;
  text: string;
}

export interface PdfTextResult {
  pages: PdfPageText[];
  text: string;
  pageCount: number;
  characterCount: number;
  isScanned: boolean;
}

export class PdfTextExtractionError extends Error {
  constructor(message = "This PDF could not be read.") {
    super(message);
    this.name = "PdfTextExtractionError";
  }
}

/** Extracts selectable text while retaining page boundaries for citations. */
export async function extractPdfText(data: Uint8Array): Promise<PdfTextResult> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const standardFontDataUrl = pathToFileURL(path.join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts")).toString() + "/";
    const document = await loadPdf(pdfjs, data, standardFontDataUrl);
    const pages: PdfPageText[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      pages.push({ page: pageNumber, text });
      page.cleanup();
    }

    const text = pages
      .map(({ page, text: pageText }) => `[[PAGE ${page}]]\n${pageText}`)
      .join("\n\n")
      .trim();
    const characterCount = pages.reduce((total, page) => total + page.text.length, 0);

    return {
      pages,
      text,
      pageCount: pages.length,
      characterCount,
      // A scanned/image-only document has no useful selectable text. Do not
      // send it to the model and pretend the extraction is trustworthy.
      isScanned: characterCount < 80,
    };
  } catch {
    const fallback = extractSimplePdfText(data);
    if (fallback) return fallback;
    throw new PdfTextExtractionError();
  }
}

async function loadPdf(
  pdfjs: typeof import("pdfjs-dist/legacy/build/pdf.mjs"),
  data: Uint8Array,
  standardFontDataUrl: string,
) {
  try {
    const task = pdfjs.getDocument({ data, useWorkerFetch: false, disableFontFace: true, standardFontDataUrl });
    return await task.promise;
  } catch {
    // A few insurer exports contain font metadata that PDF.js rejects on its
    // first pass. Retry with the default font handling before giving up.
    const retry = pdfjs.getDocument({ data, useWorkerFetch: false, standardFontDataUrl });
    return await retry.promise;
  }
}

/**
 * Last-resort reader for simple text PDFs. This is deliberately narrow: it
 * only reads literal Tj text operators and never executes embedded content.
 * PDF.js remains the primary parser for normal insurer exports.
 */
function extractSimplePdfText(data: Uint8Array): PdfTextResult | undefined {
  const source = new TextDecoder("latin1").decode(data);
  if (!source.startsWith("%PDF-")) return undefined;
  const pages = [...source.matchAll(/stream\s*([\s\S]*?)\s*endstream/g)]
    .map((match, index) => {
      const text = [...match[1].matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj/g)]
        .map((item) => item[1]
          .replaceAll("\\(", "(")
          .replaceAll("\\)", ")")
          .replaceAll("\\\\", "\\"))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      return { page: index + 1, text };
    })
    .filter((page) => page.text.length > 0);
  if (!pages.length) return undefined;
  const text = pages.map(({ page, text: pageText }) => `[[PAGE ${page}]]\n${pageText}`).join("\n\n");
  return { pages, text, pageCount: pages.length, characterCount: text.length, isScanned: text.length < 80 };
}
