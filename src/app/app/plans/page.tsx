"use client";
import { PlanEditor } from "@/components/insurance/plan-editor";
import { ProcedureEditor } from "@/components/simulator/procedure-editor";
import { useSimulatorStore } from "@/store/simulator-store";
export default function Page() {
  return <PlanPage />;
}
function PlanPage() { const plan = useSimulatorStore(state => state.plan); const procedures = useSimulatorStore(state => state.procedures); return <div className="space-y-5"><PlanEditor plan={plan} /><div><p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">Recommended care</p><div className="grid gap-4 lg:grid-cols-2">{procedures.map(procedure => <ProcedureEditor key={procedure.id} procedure={procedure} />)}</div></div></div>; }
