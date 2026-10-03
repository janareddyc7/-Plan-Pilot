"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main id="main" className="mx-auto max-w-xl p-12">
      <h1 className="text-2xl font-medium">Something didn’t load.</h1>
      <p className="my-6 text-muted-foreground">
        Please try again in a moment.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
