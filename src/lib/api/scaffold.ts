import "server-only";
import { createClient } from "@/lib/supabase/server";
export async function unavailableFeature(feature: string) {
  const supabase = await createClient();
  if (!supabase)
    return Response.json(
      {
        error: {
          code: "NOT_CONFIGURED",
          message: "Account services are not configured.",
        },
      },
      { status: 503 },
    );
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims)
    return Response.json(
      { error: { code: "UNAUTHENTICATED", message: "Sign in to continue." } },
      { status: 401 },
    );
  return Response.json(
    {
      error: {
        code: "NOT_IMPLEMENTED",
        message: `${feature} is reserved for the next implementation milestone.`,
      },
    },
    { status: 501 },
  );
}
