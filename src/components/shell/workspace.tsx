"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  ArrowUpRight,
  House,
} from "lucide-react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { SignOut } from "@/components/auth/sign-out";

const links = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/plans", label: "My plan", icon: FileText },
  { href: "/app/scenarios", label: "Saved scenarios", icon: FolderOpen },
  { href: "/app/settings", label: "Settings", icon: Settings },
];
export function Workspace({
  children,
  guest = false,
}: {
  children: React.ReactNode;
  guest?: boolean;
}) {
  const path = usePathname();
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[196px_minmax(0,1fr)]">
      <aside className="border-b border-border bg-sidebar/60 px-4 py-5 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:border-r">
        <div className="px-2">
          <Brand />
        </div>
        <p className="mb-3 mt-9 hidden px-3 text-[9px] uppercase tracking-[.18em] text-muted-foreground lg:block">
          Workspace
        </p>
        <nav
          aria-label="Workspace"
          className="mt-5 flex flex-wrap gap-1 lg:mt-0 lg:flex-col"
        >
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href || (guest && href === "/app");
            return (
              <Link
                key={href}
                href={guest ? (href === "/app" ? "/demo" : "/sign-in") : href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-xs transition-colors ${active ? "bg-card font-medium text-foreground shadow-control" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
              >
                <Icon size={15} strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden border-t border-border px-3 pt-5 lg:block">
          <p className="font-serif text-lg italic">A little more clarity.</p>
          <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
            Plan confidently.
            <br />
            Care comes first.
          </p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-border px-5 lg:px-8">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">Workspace</span>
            <span className="text-border">/</span>
            <span>
              {links.find((item) => item.href === path)?.label ?? "Overview"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <House size={13} /> Home
            </Link>
            {guest ? (
              <Button asChild variant="outline">
                <Link href="/sign-in">
                  Sign in <ArrowUpRight size={13} />
                </Link>
              </Button>
            ) : (
              <SignOut />
            )}
          </div>
        </header>
        <main id="main" className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
          {children}
        </main>
        <footer className="mx-auto max-w-7xl px-5 pb-6 text-[10px] leading-5 text-muted-foreground lg:px-8">
          Planning estimates. Confirm coverage with your insurer and treatment
          timing with your dentist.
        </footer>
      </div>
    </div>
  );
}
