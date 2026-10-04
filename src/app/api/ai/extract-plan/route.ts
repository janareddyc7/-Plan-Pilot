import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { extractPdfText } from "@/lib/documents/pdf-text";
import {
  AiNotConfiguredError,
  extractPlanFromText,
} from "@/lib/ai/extract";

export const runtime = "nodejs";

const requestSchema = z
  .object({
    documentId: z.uuid().optional(),
    text: z.string().max(140_000).optional(),
  })
  .refine((value) => Boolean(value.documentId || value.text?.trim()), {
    message: "Provide a documentId or plan text.",
  });

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase)
    return Response.json(
      { error: { code: "NOT_CONFIGURED", message: "Account services are not configured." } },
      { status: 503 },
    );
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user)
    return Response.json(
      { error: { code: "UNAUTHENTICATED", message: "Sign in to extract a plan." } },
      { status: 401 },
    );

  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await request.json());
  } catch {
    return Response.json(
      { error: { code: "INVALID_REQUEST", message: "Provide a documentId or plan text." } },
      { status: 400 },
    );
  }

  try {
    let text = body.text;
    let pages;
    let document;
    if (body.documentId) {
      const result = await supabase
        .from("documents")
        .select("id,filename,storage_path")
        .eq("id", body.documentId)
        .single();
      if (result.error || !result.data)
        return Response.json(
          { error: { code: "DOCUMENT_NOT_FOUND", message: "That plan document is not available." } },
          { status: 404 },
        );
      document = result.data;
      const download = await supabase.storage.from("plan-documents").download(document.storage_path);
      if (download.error || !download.data)
        return Response.json(
          { error: { code: "DOCUMENT_UNAVAILABLE", message: "The private plan document could not be opened." } },
          { status: 502 },
        );
      const extracted = await extractPdfText(new Uint8Array(await download.data.arrayBuffer()));
      if (extracted.isScanned) {
        await supabase.from("documents").update({ extraction_status: "failed" }).eq("id", document.id);
        return Response.json({ manualRequired: true, message: "This scanned PDF needs manual entry." });
      }
      text = extracted.text;
      pages = extracted.pages;
    }
    const extraction = await extractPlanFromText({
      text: text ?? "",
      pages,
      documentId: body.documentId,
    });
    if (document)
      await supabase.from("documents").update({ extraction_status: "extracted" }).eq("id", document.id);
    return Response.json({ extraction, manualRequired: false });
  } catch (error) {
    if (error instanceof AiNotConfiguredError)
      return Response.json(
        { error: { code: "AI_NOT_CONFIGURED", message: "The AI system is not configured. Use manual entry for now." } },
        { status: 503 },
      );
    return Response.json(
      { error: { code: "EXTRACTION_FAILED", message: "Plan extraction failed. Use manual entry and verify the PDF." } },
      { status: 422 },
    );
  }
}
