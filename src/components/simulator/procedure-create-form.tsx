"use client";

import { useState } from "react";
import { Plus, Save, Sparkles } from "lucide-react";
import { procedureSchema, type Procedure } from "@/lib/schemas";
import { useSimulatorStore } from "@/store/simulator-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const today = new Date().toISOString().slice(0, 10);

export function ProcedureCreateForm({ planId, enabled }: { planId: string; enabled: boolean }) {
  const addProcedure = useSimulatorStore((state) => state.addProcedure);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [serviceClass, setServiceClass] = useState<Procedure["serviceClass"]>("basic");
  const [billed, setBilled] = useState("");
  const [allowed, setAllowed] = useState("");
  const [networkStatus, setNetworkStatus] = useState<Procedure["networkStatus"]>("in-network");
  const [earliestDate, setEarliestDate] = useState(today);
  const [latestDate, setLatestDate] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState("");
  const [interpreting, setInterpreting] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  async function interpret() {
    setInterpreting(true); setMessage(undefined); setReviewNote("");
    try {
      const response = await fetch("/api/ai/extract-care", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: description.trim() }) });
      const body = await response.json() as { candidate?: { name?: string; code?: string; serviceClass?: Procedure["serviceClass"]; networkStatus?: Procedure["networkStatus"]; billedFeeCents?: number; allowedFeeCents?: number }; error?: string };
      if (!response.ok || !body.candidate) throw new Error(body.error || "Could not interpret that description.");
      const value = body.candidate;
      if (value.name) setName(value.name);
      if (value.code) setCode(value.code);
      if (value.serviceClass) setServiceClass(value.serviceClass);
      if (value.networkStatus) setNetworkStatus(value.networkStatus);
      if (value.billedFeeCents !== undefined) setBilled((value.billedFeeCents / 100).toFixed(2));
      if (value.allowedFeeCents !== undefined) setAllowed((value.allowedFeeCents / 100).toFixed(2));
      setReviewNote("Review every field below. Confirm the service class and prices with your insurer and dentist before saving.");
    } catch (failure) { setMessage(failure instanceof Error ? failure.message : "Could not interpret that description."); }
    finally { setInterpreting(false); }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setMessage(undefined);
    const procedure: Procedure = {
      id: crypto.randomUUID(),
      name: name.trim(),
      code: code.trim() || undefined,
      serviceClass,
      estimatedBilledFeeCents: Math.round(Number(billed) * 100),
      estimatedAllowedFeeCents: allowed ? Math.round(Number(allowed) * 100) : undefined,
      networkStatus,
      earliestDate,
      dentistApprovedLatestDate: latestDate || undefined,
      urgent: false,
      isFlexible: true,
      requiresProcedureIds: [],
      serviceDatePolicy: "completion",
      notes: notes.trim(),
    };
    const parsed = procedureSchema.safeParse(procedure);
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check the procedure details.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/procedures", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planId, procedure: parsed.data }),
      });
      const payload = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Procedure could not be saved.");
      addProcedure(parsed.data);
      setName(""); setCode(""); setBilled(""); setAllowed(""); setNotes(""); setLatestDate("");
      setMessage("Procedure added to your plan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Procedure could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-dashed p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><Plus size={16} /></div>
        <div><h2 className="text-sm font-medium">Add a procedure</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Use the estimate from your dentist or treatment plan. You can refine timing after it is saved.</p></div>
      </div>
      {!enabled ? <p className="mt-5 text-xs text-muted-foreground">Save your confirmed plan first, then add care details here.</p> : (
        <><div className="mt-5 rounded-lg border border-border bg-background p-4"><label htmlFor="care-description" className="text-xs font-medium">Describe the care you need</label><p className="mt-1 text-xs text-muted-foreground">Write naturally. Include the quoted price and allowed fee if you have them.</p><textarea id="care-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={4000} rows={3} placeholder="I need a crown. My dentist quoted…" className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"/><Button type="button" variant="outline" disabled={interpreting || description.trim().length < 10} onClick={() => void interpret()} className="mt-3"><Sparkles size={14}/>{interpreting ? "Interpreting…" : "Fill from description"}</Button></div>{reviewNote && <p role="status" className="mt-3 text-xs text-primary">{reviewNote}</p>}<form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Procedure name" value={name} onChange={setName} placeholder="e.g. Crown" />
          <Field label="CDT code (optional)" value={code} onChange={setCode} placeholder="e.g. D2740" />
          <Select label="Service class" value={serviceClass} onChange={(value) => setServiceClass(value as Procedure["serviceClass"])} options={[["preventive", "Preventive"], ["basic", "Basic"], ["major", "Major"]]} />
          <Select label="Network" value={networkStatus} onChange={(value) => setNetworkStatus(value as Procedure["networkStatus"])} options={[["in-network", "In-network"], ["out-of-network", "Out-of-network"]]} />
          <Field label="Billed estimate ($)" value={billed} onChange={setBilled} type="number" min="0" step="0.01" placeholder="0.00" />
          <Field label="Allowed estimate ($, optional)" value={allowed} onChange={setAllowed} type="number" min="0" step="0.01" placeholder="0.00" />
          <Field label="Earliest approved date" value={earliestDate} onChange={setEarliestDate} type="date" />
          <Field label="Latest approved date (optional)" value={latestDate} onChange={setLatestDate} type="date" />
          <label className="text-[11px] text-muted-foreground sm:col-span-2">Notes (optional)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="mt-2 w-full border border-input bg-background px-3 py-2 text-xs text-foreground" /></label>
          <div className="flex items-center justify-between gap-3 sm:col-span-2"><p role="status" className="text-xs text-primary">{message}</p><Button type="submit" disabled={saving}><Save size={14} />{saving ? "Saving…" : "Save procedure"}</Button></div>
        </form></>
      )}
    </Card>
  );
}

function Field({ label, value, onChange, type = "text", min, step, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; min?: string; step?: string; placeholder?: string }) {
  return <label className="text-[11px] text-muted-foreground">{label}<Input type={type} min={min} step={step} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return <label className="text-[11px] text-muted-foreground">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full border border-input bg-background px-3 text-xs text-foreground">{options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>;
}
