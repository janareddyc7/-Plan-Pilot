import { AuthForm } from "@/components/auth/auth-form";
import { supabaseConfig } from "@/lib/supabase/config";
export default function Page() {
  return <AuthForm mode="forgot-password" configured={!!supabaseConfig()} />;
}
