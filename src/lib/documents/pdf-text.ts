import "server-only";

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
    const loadingTask = pdfjs.getDocument({
      data,
      useWorkerFetch: false,
      disableFontFace: true,
    });
    const document = await loadingTask.promise;
    const pages: PdfPageText[] = [];

    try {
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
    } finally {
      // `destroy` moved to the loading task in newer PDF.js releases.
      await loadingTask.destroy();
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
    throw new PdfTextExtractionError();
  }
}
