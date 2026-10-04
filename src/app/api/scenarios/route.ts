import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { scenarioSchema } from "@/lib/schemas";

const idSchema = z.uuid();
const requestSchema = z.object({ name: z.string().min(1).max(120).optional(), scenario: scenarioSchema });

export async function GET(request: Request) {
  const context = await authenticated();
  if (!context.ok) return context.response;
  const id = new URL(request.url).searchParams.get("id");
  if (id && !idSchema.safeParse(id).success)
    return Response.json({ error: { code: "INVALID_ID", message: "Scenario id is invalid." } }, { status: 400 });
  let query = context.client.from("scenarios").select("id,name,snapshot,created_at,updated_at").order("updated_at", { ascending: false });
  if (id) query = query.eq("id", id);
  const result = await query;
  if (result.error)
    return Response.json({ error: { code: "SCENARIO_READ_FAILED", message: "Scenarios could not be loaded." } }, { status: 502 });
  const scenarios = (result.data ?? []).flatMap((row: Record<string, unknown>) => {
    const parsed = scenarioSchema.safeParse({ ...(row.snapshot as Record<string, unknown>), id: row.id });
    return parsed.success ? [{ id: row.id, name: row.name, scenario: parsed.data, createdAt: row.created_at, updatedAt: row.updated_at }] : [];
  });
  return Response.json(id ? { scenario: scenarios[0] ?? null } : { scenarios });
}

export async function POST(request: Request) {
  return saveScenario(request);
}

export async function PUT(request: Request) {
  return saveScenario(request);
}

export async function DELETE(request: Request) {
  const context = await authenticated();
  if (!context.ok) return context.response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !idSchema.safeParse(id).success)
    return Response.json({ error: { code: "INVALID_ID", message: "Scenario id is required." } }, { status: 400 });
  const result = await context.client.from("scenarios").delete().eq("id", id);
  if (result.error)
    return Response.json({ error: { code: "SCENARIO_DELETE_FAILED", message: "Scenario could not be deleted." } }, { status: 502 });
  return new Response(null, { status: 204 });
}

async function saveScenario(request: Request) {
  const context = await authenticated();
  if (!context.ok) return context.response;
  let input: z.infer<typeof requestSchema>;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: { code: "INVALID_SCENARIO", message: "Provide a complete valid scenario." } }, { status: 400 });
  }
  const scenario = {
    ...input.scenario,
    planSnapshot: { ...input.scenario.planSnapshot, userId: context.user.id },
  };
  const parsedScenario = scenarioSchema.safeParse(scenario);
  if (!parsedScenario.success)
    return Response.json({ error: { code: "INVALID_SCENARIO", message: "The scenario snapshot is invalid." } }, { status: 400 });
  const result = await context.client
    .from("scenarios")
    .upsert(
      {
        id: parsedScenario.data.id,
        user_id: context.user.id,
        plan_id: parsedScenario.data.planSnapshot.id,
        name: input.name ?? "Untitled scenario",
        snapshot: parsedScenario.data,
      },
      { onConflict: "id" },
    )
    .select("id,name,snapshot,created_at,updated_at")
    .single();
  if (result.error)
    return Response.json({ error: { code: "SCENARIO_SAVE_FAILED", message: "Save the plan before saving this scenario." } }, { status: 502 });
  return Response.json({ scenario: { id: result.data.id, name: result.data.name, scenario: result.data.snapshot } }, { status: request.method === "POST" ? 201 : 200 });
}

async function authenticated() {
  const client = await createClient();
  if (!client)
    return { ok: false as const, response: Response.json({ error: { code: "NOT_CONFIGURED", message: "Account services are not configured." } }, { status: 503 }) };
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    return { ok: false as const, response: Response.json({ error: { code: "UNAUTHENTICATED", message: "Sign in to manage scenarios." } }, { status: 401 }) };
  return { ok: true as const, client, user: data.user };
}
