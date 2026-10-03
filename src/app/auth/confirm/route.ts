import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { classifyCallbackError } from "@/lib/auth/callback-error";
export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const client = await createClient();
  if (!client)
    return NextResponse.redirect(new URL("/sign-in?error=setup", request.url));
  if (
    client &&
    token_hash &&
    (type === "signup" || type === "recovery" || type === "email")
  ) {
    const { error } = await client.auth.verifyOtp({ token_hash, type });
    if (!error)
      return NextResponse.redirect(
        new URL(type === "recovery" ? "/reset-password" : "/app", request.url),
      );
    return NextResponse.redirect(
      new URL(`/sign-in?error=${classifyCallbackError(error)}`, request.url),
    );
  }
  return NextResponse.redirect(new URL("/sign-in?error=missing", request.url));
}
