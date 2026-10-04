"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { BenefitsChat } from "./benefits-chat";

export function DashboardChat() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
    {open && <div id="dashboard-assistant" role="dialog" aria-modal="false" aria-label="Ask PlanPilot" className="w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5"><span className="text-xs font-semibold">Ask PlanPilot</span><button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><X size={16}/></button></div>
      <BenefitsChat compact />
    </div>}
    <button type="button" aria-expanded={open} aria-controls="dashboard-assistant" onClick={() => setOpen((value) => !value)} className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/25 bg-primary px-4 text-xs font-medium text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <MessageCircle size={15}/>{open ? "Close help" : "Ask PlanPilot"}
    </button>
  </div>;
}
