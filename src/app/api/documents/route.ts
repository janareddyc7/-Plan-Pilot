import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const idSchema = z.uuid();

export async function GET() {
  const context = await authenticated();
  if (!context.ok) return context.response;
  const result = await context.client
    .from("documents")
    .select("id,filename,extraction_status,created_at,updated_at")
    .eq("user_id", context.user.id)
    .order("created_at", { ascending: false });
  if (result.error)
    return Response.json(
      {
        error: {
          code: "DOCUMENT_READ_FAILED",
          message: "Documents could not be loaded.",
        },
      },
      { status: 502 },
    );
  return Response.json({ documents: result.data ?? [] });
}

export async function DELETE(request: Request) {
  const context = await authenticated();
  if (!context.ok) return context.response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !idSchema.safeParse(id).success)
    return Response.json(
      { error: { code: "INVALID_ID", message: "Document id is required." } },
      { status: 400 },
    );
  const document = await context.client
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", context.user.id)
    .single();
  if (document.error || !document.data)
    return Response.json(
      { error: { code: "DOCUMENT_NOT_FOUND", message: "Document not found." } },
      { status: 404 },
    );
  const result = await context.client
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", context.user.id);
  if (result.error)
    return Response.json(
      {
        error: {
          code: "DOCUMENT_DELETE_FAILED",
          message:
            "Document metadata could not be deleted. Any linked plan must be updated first.",
        },
      },
      { status: 409 },
    );
  const removed = await context.client.storage
    .from("plan-documents")
    .remove([document.data.storage_path]);
  if (removed.error)
    return Response.json(
      {
        error: {
          code: "DOCUMENT_FILE_DELETE_FAILED",
          message:
            "Metadata was deleted, but the private file needs storage cleanup.",
        },
      },
      { status: 502 },
    );
  return new Response(null, { status: 204 });
}

async function authenticated() {
  const client = await createClient();
  if (!client)
    return {
      ok: false as const,
      response: Response.json(
        {
          error: {
            code: "NOT_CONFIGURED",
            message: "Account services are not configured.",
          },
        },
        { status: 503 },
      ),
    };
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    return {
      ok: false as const,
      response: Response.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "Sign in to manage documents.",
          },
        },
        { status: 401 },
      ),
    };
  return { ok: true as const, client, user: data.user };
}
