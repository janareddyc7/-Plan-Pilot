import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Workspace } from "@/components/shell/workspace";
import { dentalPlanSchema, procedureSchema } from "@/lib/schemas";
import type { SimulatorInput } from "@/store/simulator-store";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  if (!supabase) redirect("/sign-in?notice=setup");
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/sign-in");
  const planResult = await supabase
    .from("dental_plans")
    .select("id,user_id,rules,source_document_id")
    .order("updated_at", { ascending: false })
    .limit(1);
  const planRow = planResult.data?.[0] as Record<string, unknown> | undefined;
  const parsedPlan = planRow
    ? dentalPlanSchema.safeParse({
        ...(planRow.rules as Record<string, unknown>),
        id: planRow.id,
        userId: planRow.user_id,
        sourceDocumentId: planRow.source_document_id ?? undefined,
      })
    : undefined;
  let input: SimulatorInput | undefined;
  if (parsedPlan?.success) {
    const procedureResult = await supabase
      .from("procedures")
      .select("details")
      .eq("plan_id", parsedPlan.data.id)
      .order("created_at", { ascending: true });
    const procedures = (procedureResult.data ?? []).flatMap((row) => {
      const parsed = procedureSchema.safeParse(row.details);
      return parsed.success ? [parsed.data] : [];
    });
    input = {
      plan: parsedPlan.data,
      procedures,
      originalSchedule: Object.fromEntries(
        procedures.map((procedure) => [
          procedure.id,
          procedure.fixedDate ?? procedure.earliestDate,
        ]),
      ),
    };
  }
  return <Workspace input={input}>{children}</Workspace>;
}
