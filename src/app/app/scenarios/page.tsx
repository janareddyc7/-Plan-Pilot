"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, FolderOpen, LoaderCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ScenarioListItem = {
  id: string;
  name: string;
  scenario: { summary: { patientPaymentCents: number }; timestamp: string };
  updatedAt?: string;
};

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export default function Page() {
  const [scenarios, setScenarios] = useState<ScenarioListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  useEffect(() => {
    fetch("/api/scenarios")
      .then(async (response) => {
        const payload = (await response.json()) as { scenarios?: ScenarioListItem[]; error?: { message?: string } };
        if (!response.ok) throw new Error(payload.error?.message ?? "Scenarios could not be loaded.");
        setScenarios(payload.scenarios ?? []);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Scenarios could not be loaded."))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-primary">Saved work</p>
        <h1 className="mt-2 font-serif text-3xl">Scenarios to revisit.</h1>
        <p className="mt-2 text-xs text-muted-foreground">Restore a saved schedule comparison without losing the receipt math behind it.</p>
      </div>
      {loading && <p className="flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="animate-spin" size={14} /> Loading saved scenarios…</p>}
      {error && <p role="alert" className="border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
      {!loading && !error && scenarios.length === 0 && (
        <Card className="p-8"><FolderOpen className="mb-5 text-primary" size={28} /><h2 className="font-serif text-2xl">Nothing saved yet.</h2><p className="mt-2 max-w-lg text-xs leading-5 text-muted-foreground">Use Save snapshot on the dashboard after comparing dates. Your plan and receipts stay owner-scoped in Supabase.</p><Button asChild className="mt-5"><Link href="/app">Open dashboard <ArrowUpRight size={13} /></Link></Button></Card>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        {scenarios.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Saved scenario</p><h2 className="mt-2 font-serif text-xl">{item.name}</h2></div><span className="text-[10px] text-muted-foreground">{new Date(item.updatedAt ?? item.scenario.timestamp).toLocaleDateString()}</span></div>
            <div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-[10px] text-muted-foreground">Patient estimate</p><p className="mt-1 text-xl tabular-nums">{money(item.scenario.summary.patientPaymentCents)}</p></div><Button asChild variant="outline"><Link href={`/app/scenarios/${item.id}`}>Open <ArrowUpRight size={13} /></Link></Button></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
