"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
export function SignOut() {
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
            // A full navigation clears cached protected pages after cookie removal.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.assign("/");
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
