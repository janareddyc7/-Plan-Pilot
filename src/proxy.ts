import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfig } from "@/lib/supabase/config";
import { safeNext } from "@/lib/auth/redirect";
export async function proxy(request: NextRequest) {
  const config = supabaseConfig();
  const protectedRoute =
    request.nextUrl.pathname.startsWith("/app") ||
    request.nextUrl.pathname === "/reset-password";
  const authEntryRoute = ["/sign-in", "/sign-up"].includes(
    request.nextUrl.pathname,
  );
  if (!config) {
    if (!protectedRoute) return NextResponse.next();
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("notice", "setup");
    return NextResponse.redirect(url);
  }
  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const { data, error } = await supabase.auth.getClaims();
  if (authEntryRoute && !error && data?.claims) {
    const destination = request.nextUrl.searchParams.get("next");
    const target = safeNext(destination);
    const url = new URL(
      ["/sign-in", "/sign-up"].includes(target.split("?")[0]) ? "/app" : target,
      request.url,
    );
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }
  if (protectedRoute && (error || !data?.claims)) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: [
    "/app/:path*",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/auth/:path*",
  ],
};
