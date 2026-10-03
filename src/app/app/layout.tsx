import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Workspace } from "@/components/shell/workspace";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  if (!supabase) redirect("/sign-in?notice=setup");
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/sign-in");
  return <Workspace>{children}</Workspace>;
}
