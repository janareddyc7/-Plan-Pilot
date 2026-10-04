"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { scenarioSchema, type Scenario } from "@/lib/schemas";
import { useSimulatorStore } from "@/store/simulator-store";

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const restoreScenario = useSimulatorStore((state) => state.restoreScenario);
  const [scenario, setScenario] = useState<Scenario>();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>();
  useEffect(() => {
    fetch(`/api/scenarios?id=${encodeURIComponent(params.id)}`)
      .then(async (response) => {
        const payload = (await response.json()) as { scenario?: { name: string; scenario: unknown }; error?: { message?: string } };
        if (!response.ok || !payload.scenario) throw new Error(payload.error?.message ?? "Scenario not found.");
        const parsed = scenarioSchema.safeParse(payload.scenario.scenario);
        if (!parsed.success) throw new Error("This saved scenario is invalid.");
        setScenario(parsed.data);
        setName(payload.scenario.name);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Scenario not found."))
      .finally(() => setLoading(false));
  }, [params.id]);
  async function remove() {
    if (!window.confirm("Delete this saved scenario?")) return;
    const response = await fetch(`/api/scenarios?id=${encodeURIComponent(params.id)}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Scenario could not be deleted.");
      return;
    }
    router.push("/app/scenarios");
  }
  if (loading) return <p className="flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="animate-spin" size={14} /> Loading scenario…</p>;
  if (!scenario) return <Card className="p-8"><h1 className="font-serif text-2xl">Scenario unavailable.</h1><p className="mt-2 text-xs text-destructive">{message}</p><Button asChild variant="outline" className="mt-5"><Link href="/app/scenarios"><ArrowLeft size={13} /> Back to scenarios</Link></Button></Card>;
  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/app/scenarios" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={13} /> Saved scenarios</Link>
      <div><p className="text-[10px] uppercase tracking-widest text-primary">Saved scenario</p><h1 className="mt-2 font-serif text-3xl">{name}</h1><p className="mt-2 text-xs text-muted-foreground">Created {new Date(scenario.timestamp).toLocaleString()}</p></div>
      <Card className="grid gap-4 p-5 sm:grid-cols-3"><Metric label="Patient estimate" value={money(scenario.summary.patientPaymentCents)} /><Metric label="Plan contribution" value={money(scenario.summary.insurerPaymentCents)} /><Metric label="Potential savings" value={scenario.potentialSavingsCents === undefined ? "—" : money(scenario.potentialSavingsCents)} /></Card>
      <Card className="p-5"><p className="text-xs leading-5 text-muted-foreground">This restores the typed plan, procedures, dates and receipt inputs into the deterministic simulator. It does not treat the saved estimate as a guarantee of reimbursement.</p><div className="mt-5 flex flex-wrap gap-2"><Button onClick={() => { restoreScenario(scenario); router.push("/app"); }}><Check size={13} /> Restore in simulator</Button><Button variant="outline" onClick={remove}><Trash2 size={13} /> Delete</Button></div>{message && <p role="status" className="mt-3 text-xs text-destructive">{message}</p>}</Card>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] text-muted-foreground">{label}</p><p className="mt-1 text-lg tabular-nums">{value}</p></div>;
}
