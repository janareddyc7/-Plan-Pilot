"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
export function SignOut() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <div>
      <Button
        variant="ghost"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          try {
            const { error } = await createClient().auth.signOut();
            if (error) throw error;
            router.replace("/");
            router.refresh();
          } catch {
            setError("Unable to sign out. Please retry.");
            setPending(false);
          }
        }}
      >
        Sign out
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
