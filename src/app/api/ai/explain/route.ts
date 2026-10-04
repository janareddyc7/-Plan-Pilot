import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { claimReceiptSchema } from "@/lib/schemas";
import { explainReceipts } from "@/lib/ai/explain";
import { AiNotConfiguredError } from "@/lib/ai/extract";
import { renderFinancialExplanation } from "@/lib/ai/render-explanation";

const requestSchema = z.object({
  receipts: z.array(claimReceiptSchema).min(1).max(50),
  language: z.enum(["en", "es"]).default("en"),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase)
    return Response.json(
      { error: { code: "NOT_CONFIGURED", message: "Account services are not configured." } },
      { status: 503 },
    );
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user)
    return Response.json(
      { error: { code: "UNAUTHENTICATED", message: "Sign in to explain a calculation." } },
      { status: 401 },
    );
  let input: z.infer<typeof requestSchema>;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return Response.json(
      { error: { code: "INVALID_REQUEST", message: "Provide valid claim receipts." } },
      { status: 400 },
    );
  }
  try {
    const explanation = await explainReceipts(input);
    return Response.json({
      explanation,
      lines: renderFinancialExplanation(explanation, input.receipts),
    });
  } catch (explanationError) {
    if (explanationError instanceof AiNotConfiguredError)
      return Response.json(
        { error: { code: "AI_NOT_CONFIGURED", message: "Gemini is not configured for explanations." } },
        { status: 503 },
      );
    return Response.json(
      { error: { code: "EXPLANATION_FAILED", message: "The explanation was not generated safely." } },
      { status: 422 },
    );
  }
}
