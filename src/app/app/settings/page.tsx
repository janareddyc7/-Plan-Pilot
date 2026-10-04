import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function Page() {
  const supabase = await createClient();
  const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  return <div className="mx-auto max-w-3xl space-y-5">
    <div><p className="eyebrow text-primary">Settings</p><h1 className="mt-2 text-3xl font-medium tracking-tight">Your account.</h1><p className="mt-2 text-sm text-muted-foreground">Manage your sign-in and keep your plan details current.</p></div>
    <Card className="p-5"><div className="flex items-center gap-2 text-sm font-medium"><LockKeyhole size={16} className="text-primary"/> Account access</div><p className="mt-4 text-xs text-muted-foreground">Signed in as</p><p className="mt-1 text-sm">{data.user?.email ?? "Your account"}</p><Link href="/forgot-password" className="mt-4 inline-block text-xs font-medium text-primary underline underline-offset-4">Reset your password</Link></Card>
    <Card className="p-5"><div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck size={16} className="text-primary"/> Your planning data</div><p className="mt-3 text-xs leading-6 text-muted-foreground">Review your plan and care details whenever an estimate changes. The dashboard assistant can answer questions about how to use PlanPilot, but it cannot verify your insurer’s coverage or your dentist’s timing.</p><Link href="/app/plans" className="mt-4 inline-block text-xs font-medium text-primary underline underline-offset-4">Review plan and care</Link></Card>
  </div>;
}
