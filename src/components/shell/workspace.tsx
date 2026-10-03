import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { SignOut } from "@/components/auth/sign-out";
export function Workspace({
  children,
  guest = false,
}: {
  children: React.ReactNode;
  guest?: boolean;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[230px_1fr]">
      <aside className="border-b border-border p-6 lg:border-r">
        <Brand />
        <nav
          aria-label="Workspace"
          className="mt-8 flex flex-wrap gap-2 lg:flex-col"
        >
          {[
            ["/app", "Overview", LayoutDashboard],
            ["/app/plans", "My plan", FileText],
            ["/app/scenarios", "Saved scenarios", FolderOpen],
            ["/app/settings", "Settings", Settings],
          ].map(([href, label, Icon]) => {
            const I = Icon as typeof Settings;
            return (
              <Link
                key={String(href)}
                href={guest ? "/sign-in" : String(href)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-primary"
              >
                <I size={17} />
                {String(label)}
              </Link>
            );
          })}
        </nav>
        <p className="mt-8 text-xs leading-6 text-muted-foreground">
          AI proposes.
          <br />
          You verify.
          <br />
          Code computes.
        </p>
      </aside>
      <div>
        <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-5 lg:px-10">
          <span className="text-sm text-muted-foreground">
            {guest ? "Guest workspace preview" : "Personal workspace"}
          </span>
          {guest ? (
            <Button asChild variant="outline">
              <Link href="/sign-up">
                Create account <ArrowUpRight size={15} />
              </Link>
            </Button>
          ) : (
            <SignOut />
          )}
        </header>
        <main id="main" className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
          {children}
        </main>
        <footer className="px-6 py-6 text-xs leading-6 text-muted-foreground lg:px-10">
          Educational estimates based on supplied plan rules and fees. Verify
          coverage, procedure coding, network status, claim date, and clinical
          scheduling with your insurer and dentist.
        </footer>
      </div>
    </div>
  );
}
