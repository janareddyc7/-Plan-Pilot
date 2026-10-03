import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Check the cookie session on the server before navigating to protected pages. */
export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const client = await createClient();
    if (!client)
      return NextResponse.json(
        { authenticated: false },
        { status: 503, headers },
      );
    const { data, error } = await client.auth.getUser();
    if (error?.name === "AuthRetryableFetchError")
      return NextResponse.json(
        { authenticated: false },
        { status: 503, headers },
      );
    return NextResponse.json(
      { authenticated: !!data.user },
      { status: data.user && !error ? 200 : 401, headers },
    );
  } catch {
    return NextResponse.json(
      { authenticated: false },
      { status: 503, headers },
    );
  }
}
