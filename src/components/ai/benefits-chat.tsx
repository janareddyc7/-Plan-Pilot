"use client";

import { useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "assistant"; content: string };
type ContextMeta = { hasPlan: boolean; planName?: string; procedureCount: number; generatedAt: string; lastPlanUpdate?: string };

export function BenefitsChat({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [context, setContext] = useState<ContextMeta>();

  async function send() {
    const content = question.trim();
    if (!content || busy) return;
    const next: Message[] = [...messages, { role: "user" as const, content }].slice(-12);
    setMessages(next);
    setQuestion("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const payload = await response.json() as { reply?: string; error?: string; context?: ContextMeta };
      if (!response.ok || !payload.reply) throw new Error(payload.error || "No answer was returned.");
      if (payload.context) setContext(payload.context);
      setMessages([...next, { role: "assistant", content: payload.reply }]);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }

  return <section className={compact ? "p-4" : "rounded-xl border border-border bg-card p-5 sm:p-6"} aria-label="Benefits assistant">
    {!compact && <div className="flex items-center gap-2 text-primary"><Sparkles size={16}/><h2 className="text-sm font-semibold">Ask PlanPilot</h2></div>}
    <p className="text-xs leading-5 text-muted-foreground">Ask about benefits or how to use PlanPilot. Your personal costs appear in the dashboard receipts.</p>
    <div className="mt-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-[10px] leading-4 text-muted-foreground" role="status">
      {context?.hasPlan
        ? <>Using <span className="font-medium text-foreground">{context.planName}</span> · {context.procedureCount} saved {context.procedureCount === 1 ? "procedure" : "procedures"} · read-only context{context.lastPlanUpdate ? ` · updated ${new Date(context.lastPlanUpdate).toLocaleDateString()}` : ""}</>
        : "The assistant uses your confirmed plan after your first question. Until then, it gives general guidance only."}
    </div>
    <div className="mt-4 max-h-64 min-h-24 space-y-3 overflow-y-auto" role="log" aria-live="polite">
      {messages.length === 0 && <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">Try “What does an annual maximum mean?” or “How do I check if a dentist is in network?”</p>}
      {messages.map((message, index) => <p key={index} className={`max-w-[95%] whitespace-pre-wrap rounded-lg px-3 py-2 text-xs leading-5 ${message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{message.content}</p>)}
      {busy && <p className="text-xs text-muted-foreground">Thinking…</p>}
    </div>
    <form className="mt-4 flex items-end gap-2" onSubmit={(event) => { event.preventDefault(); void send(); }}>
      <label className="sr-only" htmlFor="benefits-question">Question</label>
      <input id="benefits-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1200} placeholder="Ask a benefits question…" className="mt-0 min-w-0 flex-1" />
      <Button type="submit" disabled={busy || !question.trim()} aria-label="Send question"><ArrowUp size={16}/></Button>
    </form>
    {error && <p className="mt-3 text-xs text-destructive" role="alert">{error}</p>}
  </section>;
}
