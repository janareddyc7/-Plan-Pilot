import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/redirect";
import { classifyCallbackError } from "@/lib/auth/callback-error";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const client = await createClient();
  if (!client)
    return NextResponse.redirect(new URL("/sign-in?error=setup", request.url));
  const upstreamError = request.nextUrl.searchParams.get("error_code");
  if (upstreamError)
    return NextResponse.redirect(
      new URL(
        `/sign-in?error=${classifyCallbackError({ code: upstreamError })}`,
        request.url,
      ),
    );
  if (client && code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(
          safeNext(request.nextUrl.searchParams.get("next")),
          request.url,
        ),
      );
    return NextResponse.redirect(
      new URL(`/sign-in?error=${classifyCallbackError(error)}`, request.url),
    );
  }
  return NextResponse.redirect(new URL("/sign-in?error=missing", request.url));
}
