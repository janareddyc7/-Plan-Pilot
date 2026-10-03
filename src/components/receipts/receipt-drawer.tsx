"use client";
import { useEffect, useRef } from "react";
import type { ClaimReceipt } from "@/lib/schemas";
import { X } from "lucide-react";
const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const rows = [["billedFee", "Billed fee"], ["allowedAmount", "Allowed amount"], ["networkWriteOff", "Network write-off"], ["outOfNetworkGap", "Out-of-network gap"], ["deductibleRemainingBefore", "Deductible before"], ["deductibleApplied", "Deductible applied"], ["deductibleRemainingAfter", "Deductible after"], ["coveredBase", "Covered base"], ["coveragePercent", "Coverage"], ["tentativeInsurerPayment", "Payment before annual cap"], ["annualMaximumRemainingBefore", "Annual maximum before"], ["annualMaxCapReduction", "Payment reduced by cap"], ["finalInsurerPayment", "Plan payment"], ["patientPayment", "Your share, including deductible"], ["annualMaximumRemainingAfter", "Annual maximum after"]] as const;
export function ReceiptDrawer({ receipt, onClose }: { receipt?: ClaimReceipt; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (receipt) dialog.current?.showModal();
    else dialog.current?.close();
  }, [receipt]);
  return <dialog ref={dialog} onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} aria-labelledby="receipt-title" className="fixed inset-y-0 left-auto right-0 m-0 h-svh max-h-svh w-full max-w-sm border-l border-border bg-card p-0 text-foreground shadow-preview backdrop:bg-foreground/20">
    {receipt && <div className="px-6 py-5">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] uppercase tracking-widest text-primary">Estimate details</p><h2 id="receipt-title" className="mt-2 font-serif text-2xl">Every dollar, explained.</h2></div><button autoFocus aria-label="Close receipt" onClick={onClose} className="rounded-md p-2 hover:bg-muted"><X size={16} /></button></div>
      <p className="mt-3 text-[11px] text-muted-foreground">Service {receipt.date} · year starting {receipt.benefitYear}</p>
      <div className="mt-5 divide-y divide-border border-y border-border">{rows.map(([field, label]) => <div key={field} className="flex justify-between gap-4 py-2.5 text-[11px]"><span className="text-muted-foreground">{label}</span><span className="tabular-nums">{field === "coveragePercent" ? `${receipt[field]}%` : money(receipt[field])}</span></div>)}</div>
      <details className="mt-5 text-xs"><summary className="cursor-pointer font-medium">Sources & assumptions</summary><ul className="mt-3 space-y-2 text-[11px] leading-5 text-muted-foreground">{receipt.assumptions.map(note => <li key={note}>{note}</li>)}{[...new Set(Object.values(receipt.provenance).map(value => `${value.source}: ${value.note}`))].map(note => <li key={note}>{note}</li>)}</ul></details>
    </div>}
  </dialog>;
}
