import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-xl p-12">
      <h1 className="text-3xl font-medium">We couldn’t find that page.</h1>
      <p className="mt-4 text-muted-foreground">
        It may not exist yet or may no longer be available.
      </p>
      <Link href="/" className="mt-6 inline-block text-primary underline">
        Return home
      </Link>
    </main>
  );
}
