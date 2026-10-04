"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ClaimReceipt } from "@/lib/schemas";
import {
  fallbackFinancialExplanation,
  type RenderedExplanationLine,
} from "@/lib/ai/render-explanation";

export function AiExplanation({ receipts }: { receipts: ClaimReceipt[] }) {
  const [result, setResult] = useState<{ signature: string; lines: RenderedExplanationLine[] }>();
  const [failedSignature, setFailedSignature] = useState<string>();
  const signature = receipts.map((receipt) => receipt.id).join(",");
  const fallbackLines = useMemo(() => fallbackFinancialExplanation(receipts), [receipts]);
  const activeResult = result?.signature === signature ? result.lines : undefined;
  const lines = activeResult ?? fallbackLines;
  const source = activeResult ? "gemini" : "engine";
  const loading = !activeResult && failedSignature !== signature;

  useEffect(() => {
    let cancelled = false;
    if (!receipts.length) return;
    fetch("/api/ai/explain", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ receipts, language: "en" }),
    })
      .then(async (response) => {
        if (!response.ok) return undefined;
        return (await response.json()) as { lines?: RenderedExplanationLine[] };
      })
      .then((payload) => {
        if (!cancelled && payload?.lines?.length) setResult({ signature, lines: payload.lines });
      })
      .catch(() => {
        if (!cancelled) setFailedSignature(signature);
      })
      .finally(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [receipts, signature]);

  if (!receipts.length) return null;
  return (
    <Card className="p-5">
      <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary">
        <Sparkles size={13} /> Explain the estimate
      </p>
      <h2 className="mt-2 font-serif text-xl">A clearer read on the math.</h2>
      <ul className="mt-4 space-y-3 text-xs leading-5 text-muted-foreground">
        {lines.map((line) => <li key={`${line.receiptId}-${line.template}`}>{line.text}</li>)}
      </ul>
      <p className="mt-4 text-[10px] text-muted-foreground">
        {loading ? "Checking explanation references…" : source === "gemini" ? "Gemini selected typed receipt references; amounts come from the engine." : "Engine-generated fallback; no AI key is required."}
      </p>
    </Card>
  );
}
