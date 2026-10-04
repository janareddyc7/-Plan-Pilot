import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { dentalPlanSchema } from "@/lib/schemas";

const requestSchema = z.object({ plan: dentalPlanSchema });
const idSchema = z.uuid();

export async function GET(request: Request) {
  const context = await authenticated();
  if (!context.ok) return context.response;
  const id = new URL(request.url).searchParams.get("id");
  if (id && !idSchema.safeParse(id).success)
    return Response.json({ error: { code: "INVALID_ID", message: "Plan id is invalid." } }, { status: 400 });
  let query = context.client.from("dental_plans").select("id,user_id,name,rules,source_document_id,created_at,updated_at").order("updated_at", { ascending: false });
  if (id) query = query.eq("id", id);
  const result = await query;
  if (result.error)
    return Response.json({ error: { code: "PLAN_READ_FAILED", message: "Plans could not be loaded." } }, { status: 502 });
  const plans = (result.data ?? []).flatMap((row: Record<string, unknown>) => {
    const parsed = dentalPlanSchema.safeParse({
      ...(row.rules as Record<string, unknown>),
      id: row.id,
      userId: row.user_id,
      sourceDocumentId: row.source_document_id ?? undefined,
    });
    return parsed.success ? [parsed.data] : [];
  });
  return Response.json(id ? { plan: plans[0] ?? null } : { plans });
}

export async function POST(request: Request) {
  return savePlan(request);
}

export async function PUT(request: Request) {
  return savePlan(request);
}

export async function DELETE(request: Request) {
  const context = await authenticated();
  if (!context.ok) return context.response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !idSchema.safeParse(id).success)
    return Response.json({ error: { code: "INVALID_ID", message: "Plan id is required." } }, { status: 400 });
  const result = await context.client.from("dental_plans").delete().eq("id", id);
  if (result.error)
    return Response.json({ error: { code: "PLAN_DELETE_FAILED", message: "Plan could not be deleted." } }, { status: 502 });
  return new Response(null, { status: 204 });
}

async function savePlan(request: Request) {
  const context = await authenticated();
  if (!context.ok) return context.response;
  let input: z.infer<typeof requestSchema>;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: { code: "INVALID_PLAN", message: "Provide a complete valid plan." } }, { status: 400 });
  }
  const plan = { ...input.plan, userId: context.user.id };
  const result = await context.client
    .from("dental_plans")
    .upsert(
      {
        id: plan.id,
        user_id: context.user.id,
        name: plan.name,
        rules: plan,
        source_document_id: plan.sourceDocumentId ?? null,
      },
      { onConflict: "id" },
    )
    .select("id,user_id,name,rules,source_document_id")
    .single();
  if (result.error)
    return Response.json({ error: { code: "PLAN_SAVE_FAILED", message: "Plan could not be saved." } }, { status: 502 });
  const parsed = dentalPlanSchema.safeParse({
    ...(result.data.rules as Record<string, unknown>),
    id: result.data.id,
    userId: result.data.user_id,
    sourceDocumentId: result.data.source_document_id ?? undefined,
  });
  if (!parsed.success)
    return Response.json({ error: { code: "PLAN_INVALID_AFTER_SAVE", message: "The saved plan did not pass validation." } }, { status: 500 });
  return Response.json({ plan: parsed.data }, { status: request.method === "POST" ? 201 : 200 });
}

async function authenticated() {
  const client = await createClient();
  if (!client)
    return { ok: false as const, response: Response.json({ error: { code: "NOT_CONFIGURED", message: "Account services are not configured." } }, { status: 503 }) };
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    return { ok: false as const, response: Response.json({ error: { code: "UNAUTHENTICATED", message: "Sign in to manage plans." } }, { status: 401 }) };
  return { ok: true as const, client, user: data.user };
}
