import { createClient } from "@/lib/supabase/server";
import { extractPlanFromText, AiNotConfiguredError } from "@/lib/ai/extract";
import { extractPdfText } from "@/lib/documents/pdf-text";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase)
    return Response.json(
      { error: { code: "NOT_CONFIGURED", message: "Account services are not configured." } },
      { status: 503 },
    );

  const { data: userData, error: authError } = await supabase.auth.getUser();
  const user = userData.user;
  if (authError || !user)
    return Response.json(
      { error: { code: "UNAUTHENTICATED", message: "Sign in to upload a plan." } },
      { status: 401 },
    );

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File))
    return Response.json(
      { error: { code: "FILE_REQUIRED", message: "Choose a PDF to upload." } },
      { status: 400 },
    );
  if (file.type !== "application/pdf")
    return Response.json(
      { error: { code: "PDF_REQUIRED", message: "PlanPilot currently accepts PDF plan documents." } },
      { status: 415 },
    );
  if (file.size > MAX_FILE_SIZE)
    return Response.json(
      { error: { code: "FILE_TOO_LARGE", message: "PDFs must be 10 MB or smaller." } },
      { status: 413 },
    );

  const documentId = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "plan.pdf";
  const storagePath = `${user.id}/${documentId}-${safeName}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const upload = await supabase.storage.from("plan-documents").upload(storagePath, bytes, {
    contentType: "application/pdf",
    cacheControl: "3600",
    upsert: false,
  });
  if (upload.error)
    return Response.json(
      { error: { code: "UPLOAD_FAILED", message: "The plan could not be stored. Try again." } },
      { status: 502 },
    );

  const insert = await supabase.from("documents").insert({
    id: documentId,
    user_id: user.id,
    filename: file.name,
    storage_path: storagePath,
    extraction_status: "pending",
  });
  if (insert.error) {
    await supabase.storage.from("plan-documents").remove([storagePath]);
    return Response.json(
      { error: { code: "DOCUMENT_RECORD_FAILED", message: "The plan upload could not be registered." } },
      { status: 502 },
    );
  }

  let extracted;
  try {
    extracted = await extractPdfText(bytes);
  } catch {
    await markFailed(supabase, documentId);
    return Response.json({
      document: { id: documentId, filename: file.name, extractionStatus: "failed" },
      manualRequired: true,
      message: "This PDF could not be read. Enter the plan details manually.",
    });
  }

  if (extracted.isScanned) {
    await markFailed(supabase, documentId);
    return Response.json({
      document: { id: documentId, filename: file.name, extractionStatus: "failed" },
      manualRequired: true,
      message: "This looks like a scanned PDF without selectable text. Enter the plan details manually.",
    });
  }

  try {
    const extraction = await extractPlanFromText({
      text: extracted.text,
      pages: extracted.pages,
      documentId,
    });
    await supabase
      .from("documents")
      .update({ extraction_status: "extracted" })
      .eq("id", documentId);
    return Response.json({
      document: { id: documentId, filename: file.name, extractionStatus: "extracted" },
      extraction,
      manualRequired: false,
    });
  } catch (error) {
    await markFailed(supabase, documentId);
    const message =
      error instanceof AiNotConfiguredError
        ? "Gemini is not configured yet. Your PDF is private and ready; enter the plan details manually for now."
        : "The PDF was uploaded, but its plan rules need manual entry. Review the document and continue below.";
    return Response.json({
      document: { id: documentId, filename: file.name, extractionStatus: "failed" },
      manualRequired: true,
      message,
    });
  }
}

async function markFailed(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>, documentId: string) {
  await supabase.from("documents").update({ extraction_status: "failed" }).eq("id", documentId);
}

