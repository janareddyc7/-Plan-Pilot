"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AiExtractionResult } from "@/lib/schemas";

export function PlanTextIntake({ onExtraction }: { onExtraction: (value: AiExtractionResult) => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function interpret() {
    if (text.trim().length < 20) { setError("Describe at least one benefit rule in a little more detail."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/ai/extract-plan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: text.trim() }) });
      const body = await response.json() as { extraction?: AiExtractionResult; error?: { message?: string } };
      if (!response.ok || !body.extraction) throw new Error(body.error?.message || "Could not interpret your plan description.");
      onExtraction(body.extraction);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not interpret your description."); }
    finally { setBusy(false); }
  }
  return <Card className="p-5"><div className="flex items-center gap-2 text-sm font-medium"><Sparkles size={15} className="text-primary"/> Describe your coverage</div><p className="mt-2 text-xs leading-6 text-muted-foreground">Paste or type the rules in your own words, such as your annual maximum, deductible, coverage percentages, and renewal date. The AI system will propose fields for your review; it will not calculate your costs.</p><label className="mt-4 block text-xs font-medium" htmlFor="plan-description">What does your plan cover?</label><textarea id="plan-description" value={text} onChange={(event) => setText(event.target.value)} maxLength={8000} rows={4} placeholder="My plan has an annual maximum of…" className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"/><div className="mt-3 flex items-center justify-between gap-3"><p role="alert" className="text-xs text-destructive">{error}</p><Button type="button" disabled={busy || text.trim().length < 20} onClick={() => void interpret()}>{busy ? "Interpreting…" : "Review suggested rules"}</Button></div></Card>;
}
