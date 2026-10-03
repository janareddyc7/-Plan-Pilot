import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
export default async function Page() {
  const supabase = await createClient();
  const result = await supabase?.auth.getUser();
  return (
    <section className="rounded-md border border-border bg-card p-8">
      <h1 className="text-2xl font-medium">Account settings</h1>
      <p className="mt-6 text-sm text-muted-foreground">Signed in as</p>
      <p className="mt-2">{result?.data.user?.email}</p>
      <Link
        className="mt-6 inline-block text-sm text-primary underline"
        href="/forgot-password"
      >
        Send a password reset email
      </Link>
    </section>
  );
}
