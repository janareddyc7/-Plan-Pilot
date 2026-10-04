import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { procedureSchema } from "@/lib/schemas";

const idSchema = z.uuid();
const requestSchema = z.object({ planId: idSchema, procedure: procedureSchema });

export async function GET(request: Request) {
  const context = await authenticated();
  if (!context.ok) return context.response;
  const planId = new URL(request.url).searchParams.get("planId");
  if (!planId || !idSchema.safeParse(planId).success)
    return Response.json({ error: { code: "INVALID_PLAN_ID", message: "planId is required." } }, { status: 400 });
  const result = await context.client.from("procedures").select("id,details,plan_id,scenario_id").eq("plan_id", planId).order("created_at", { ascending: true });
  if (result.error)
    return Response.json({ error: { code: "PROCEDURE_READ_FAILED", message: "Procedures could not be loaded." } }, { status: 502 });
  const procedures = (result.data ?? []).flatMap((row: Record<string, unknown>) => {
    const parsed = procedureSchema.safeParse(row.details);
    return parsed.success ? [parsed.data] : [];
  });
  return Response.json({ procedures });
}

export async function POST(request: Request) {
  return saveProcedure(request);
}

export async function PUT(request: Request) {
  return saveProcedure(request);
}

export async function DELETE(request: Request) {
  const context = await authenticated();
  if (!context.ok) return context.response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !idSchema.safeParse(id).success)
    return Response.json({ error: { code: "INVALID_ID", message: "Procedure id is required." } }, { status: 400 });
  const result = await context.client.from("procedures").delete().eq("id", id);
  if (result.error)
    return Response.json({ error: { code: "PROCEDURE_DELETE_FAILED", message: "Procedure could not be deleted." } }, { status: 502 });
  return new Response(null, { status: 204 });
}

async function saveProcedure(request: Request) {
  const context = await authenticated();
  if (!context.ok) return context.response;
  let input: z.infer<typeof requestSchema>;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: { code: "INVALID_PROCEDURE", message: "Provide a valid procedure and planId." } }, { status: 400 });
  }
  const result = await context.client
    .from("procedures")
    .upsert(
      {
        id: input.procedure.id,
        user_id: context.user.id,
        plan_id: input.planId,
        details: input.procedure,
      },
      { onConflict: "id" },
    )
    .select("id,details")
    .single();
  if (result.error)
    return Response.json({ error: { code: "PROCEDURE_SAVE_FAILED", message: "Procedure could not be saved." } }, { status: 502 });
  const parsed = procedureSchema.safeParse(result.data.details);
  if (!parsed.success)
    return Response.json({ error: { code: "PROCEDURE_INVALID_AFTER_SAVE", message: "The saved procedure did not pass validation." } }, { status: 500 });
  return Response.json({ procedure: parsed.data }, { status: request.method === "POST" ? 201 : 200 });
}

async function authenticated() {
  const client = await createClient();
  if (!client)
    return { ok: false as const, response: Response.json({ error: { code: "NOT_CONFIGURED", message: "Account services are not configured." } }, { status: 503 }) };
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    return { ok: false as const, response: Response.json({ error: { code: "UNAUTHENTICATED", message: "Sign in to manage procedures." } }, { status: 401 }) };
  return { ok: true as const, client, user: data.user };
}
