import { AuthForm } from "@/components/auth/auth-form";
import { supabaseConfig } from "@/lib/supabase/config";
import { safeNext } from "@/lib/auth/redirect";
import { callbackMessage } from "@/lib/auth/callback-error";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      {params.error && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {callbackMessage(params.error)}
        </p>
      )}
      <AuthForm
        mode="sign-in"
        configured={!!supabaseConfig()}
        next={safeNext(params.next)}
      />
    </>
  );
}
