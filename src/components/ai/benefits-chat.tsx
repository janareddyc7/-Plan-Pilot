"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, MicOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "assistant"; content: string };
type SpeechRecognitionResultLike = { isFinal: boolean; [index: number]: { transcript: string } };
type SpeechRecognitionEventLike = Event & { resultIndex?: number; results: { length: number; [index: number]: SpeechRecognitionResultLike } };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechRecognitionWindow = Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
type ContextMeta = {
  hasPlan: boolean;
  planName?: string;
  procedureCount: number;
  generatedAt: string;
  lastPlanUpdate?: string;
  currentBenefitYear?: string;
  planOnlyRemainingBeforeSavedCare?: string;
  remainingAfterSavedCareForCurrentYear?: string;
};

const starterQuestions = [
  "Why did my remaining benefits change?",
  "Explain my latest receipt",
  "What does my deductible mean?",
];

export function BenefitsChat({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [context, setContext] = useState<ContextMeta>();
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const detection = window.setTimeout(() => {
      const speechWindow = window as SpeechRecognitionWindow;
      setSpeechSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));
    }, 0);
    return () => {
      window.clearTimeout(detection);
      recognitionRef.current?.stop();
    };
  }, []);

  async function send(contentOverride?: string) {
    const content = (contentOverride ?? question).trim();
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

  function askStarter(questionText: string) {
    if (busy) return;
    void send(questionText);
  }

  function toggleListening() {
    if (busy) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const speechWindow = window as SpeechRecognitionWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setError("Voice input is not supported in this browser. You can type your question instead.");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length }, (_, index) => event.results[index]?.[0]?.transcript ?? "").join(" ").trim();
      if (transcript) setQuestion((current) => `${current.trim()}${current.trim() ? " " : ""}${transcript}`);
    };
    recognition.onerror = (event) => {
      setListening(false);
      const message = event.error === "not-allowed" ? "Microphone access was blocked. Allow it in your browser or type your question instead." : "Voice input stopped. You can try again or type your question.";
      setError(message);
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setError("");
    setListening(true);
    recognition.start();
  }

  return <section className={compact ? "p-4" : "rounded-xl border border-border bg-card p-5 sm:p-6"} aria-label="Benefits assistant">
    {!compact && <div className="flex items-center gap-2 text-primary"><Sparkles size={16}/><h2 className="text-sm font-semibold">Ask PlanPilot</h2></div>}
    <p className="text-xs leading-5 text-muted-foreground">Ask about your confirmed plan, saved care, receipts, or how to use PlanPilot. You can type or speak.</p>
    <div className="mt-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-[10px] leading-4 text-muted-foreground" role="status">
      {context?.hasPlan
        ? <div>
          <p>Using <span className="font-medium text-foreground">{context.planName}</span> · {context.procedureCount} saved {context.procedureCount === 1 ? "procedure" : "procedures"} · read-only context{context.lastPlanUpdate ? ` · updated ${new Date(context.lastPlanUpdate).toLocaleDateString()}` : ""}</p>
          {context.planOnlyRemainingBeforeSavedCare && context.remainingAfterSavedCareForCurrentYear && <p className="mt-1 text-[10px]">Plan-only remaining: <span className="font-medium text-foreground">{context.planOnlyRemainingBeforeSavedCare}</span> · after saved care: <span className="font-medium text-foreground">{context.remainingAfterSavedCareForCurrentYear}</span>{context.currentBenefitYear ? ` · ${context.currentBenefitYear}` : ""}</p>}
        </div>
        : "The assistant uses your confirmed plan after your first question. Until then, it gives general guidance only."}
    </div>
    {messages.length === 0 && <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Suggested questions">
      {starterQuestions.map((starter) => <button key={starter} type="button" onClick={() => askStarter(starter)} className="rounded-full border border-border bg-background px-2.5 py-1.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/30 hover:text-foreground">{starter}</button>)}
    </div>}
    <div className="mt-4 max-h-64 min-h-24 space-y-3 overflow-y-auto" role="log" aria-live="polite">
      {messages.length === 0 && <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">Your answers are grounded in confirmed plan rules and engine receipts. The AI explains; the calculation engine supplies the dollars.</p>}
      {messages.map((message, index) => <p key={index} className={`max-w-[95%] whitespace-pre-wrap rounded-lg px-3 py-2 text-xs leading-5 ${message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{message.content}</p>)}
      {busy && <p className="text-xs text-muted-foreground">Thinking…</p>}
    </div>
    <form className="mt-4 flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); void send(); }}>
      <label className="sr-only" htmlFor="benefits-question">Question</label>
      <div className="relative min-w-0 flex-1">
        <input id="benefits-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1200} placeholder={listening ? "Listening…" : "Ask a benefits question…"} className="mt-0 h-10 w-full pr-11 text-xs" />
        {speechSupported && <button type="button" onClick={toggleListening} disabled={busy} aria-label={listening ? "Stop voice input" : "Start voice input"} title={listening ? "Stop voice input" : "Speak your question"} className={`absolute right-1.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${listening ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"}`}>
          {listening ? <MicOff size={14} /> : <Mic size={14} />}
        </button>}
      </div>
      <Button type="submit" disabled={busy || !question.trim()} aria-label="Send question" className="h-10 min-h-10 w-10 shrink-0 px-0"><ArrowUp size={16}/></Button>
    </form>
    <p className="mt-2 text-[10px] leading-4 text-muted-foreground" aria-live="polite">{listening ? "Listening now. Your transcript stays editable before you send it." : "PlanPilot does not store or upload audio; only the transcript is sent."}</p>
    {error && <p className="mt-3 text-xs text-destructive" role="alert">{error}</p>}
  </section>;
}
