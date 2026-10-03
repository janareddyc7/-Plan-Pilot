"use client";

import { useRef, useState } from "react";
import { FileUp, LoaderCircle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { aiExtractionResultSchema, type AiExtractionResult } from "@/lib/schemas";

export function PlanUpload({
  onExtraction,
  onManualFallback,
}: {
  onExtraction: (result: AiExtractionResult, documentId: string) => void;
  onManualFallback: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  async function upload() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a PDF first.");
      return;
    }
    setBusy(true);
    setError(undefined);
    setMessage(undefined);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/documents/upload", { method: "POST", body });
      const payload = (await response.json()) as {
        error?: { message?: string };
        extraction?: unknown;
        document?: { id?: string };
        manualRequired?: boolean;
        message?: string;
      };
      if (!response.ok) throw new Error(payload.error?.message ?? "The PDF could not be uploaded.");
      if (payload.extraction && payload.document?.id) {
        const parsed = aiExtractionResultSchema.safeParse(payload.extraction);
        if (!parsed.success) throw new Error("The extraction response needs manual review.");
        onExtraction(parsed.data, payload.document.id);
        setMessage("Draft fields extracted. Review every value before using estimates.");
      } else {
        const fallback = payload.message ?? "Enter the plan details manually to continue.";
        setMessage(fallback);
        if (payload.manualRequired) onManualFallback(fallback);
      }
    } catch (uploadError) {
      const text = uploadError instanceof Error ? uploadError.message : "Upload failed. Try again.";
      setError(text);
      onManualFallback(text);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-primary/25 bg-secondary/25">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary">
            <FileUp size={13} /> Import a plan
          </p>
          <h2 className="mt-2 font-serif text-2xl">Start with the document.</h2>
          <p className="mt-2 max-w-xl text-xs leading-5 text-muted-foreground">
            Upload a text-based benefits PDF. Gemini will suggest fields with page quotes; nothing
            reaches the calculation engine until you confirm it.
          </p>
        </div>
        <ShieldCheck className="hidden shrink-0 text-primary sm:block" size={20} />
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          aria-label="Dental plan PDF"
          className="block min-w-0 flex-1 text-xs file:mr-3 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:py-2 file:text-xs file:font-medium"
        />
        <Button type="button" onClick={upload} disabled={busy}>
          {busy ? <LoaderCircle className="animate-spin" size={14} /> : <FileUp size={14} />}
          {busy ? "Reading plan…" : "Upload & extract"}
        </Button>
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground">
        Private storage · PDF only · 10 MB limit · scanned PDFs use manual entry
      </p>
      {message && <p className="mt-4 text-xs text-primary" role="status">{message}</p>}
      {error && <p className="mt-4 text-xs text-destructive" role="alert">{error}</p>}
    </Card>
  );
}

