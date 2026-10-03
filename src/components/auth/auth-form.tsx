"use client";
import Link from "next/link";
import { useState } from "react";
import { safeNext } from "@/lib/auth/redirect";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  MailCheck,
  Check,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { emailSchema, passwordSchema } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export type AuthMode =
  "sign-in" | "sign-up" | "forgot-password" | "reset-password";
const titles = {
  "sign-in": "Welcome back.",
  "sign-up": "Make it your space.",
  "forgot-password": "Let’s get you back in.",
  "reset-password": "A fresh start.",
};
export function AuthForm({
  mode,
  configured,
  next = "/app",
}: {
  mode: AuthMode;
  configured: boolean;
  next?: string;
}) {
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resending, setResending] = useState(false);
  async function openWorkspace(destination: string) {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(
        response.status === 503
          ? "You signed in, but this server cannot reach Supabase. Retry when the local server has network access."
          : "Your session could not be verified. Allow cookies for this site and sign in again.",
      );
    }
    window.location.assign(safeNext(destination));
  }
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string; password: string }>();
  async function resendConfirmation() {
    if (!(await trigger("email"))) return;
    setResending(true);
    setFailed(false);
    setMessage("");
    try {
      const { error } = await createClient().auth.resend({
        type: "signup",
        email: getValues("email"),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setMessage(
        "If this address has an unconfirmed account, a new confirmation email is on its way. Use the latest link in this browser.",
      );
    } catch {
      setFailed(true);
      setMessage(
        "We couldn’t resend the email. Please wait a minute and try again.",
      );
    } finally {
      setResending(false);
    }
  }
  const submit = handleSubmit(async (values) => {
    setMessage("");
    setFailed(false);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword(values);
        if (error) throw error;
        await openWorkspace(next);
      }
      if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { emailRedirectTo: `${origin}/auth/callback` },
        });
        if (error) throw error;
        if (data.session) {
          await openWorkspace("/app");
        } else
          setMessage(
            "Check your email to confirm your account. Open the link in this same browser, then sign in.",
          );
      }
      if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          values.email,
          { redirectTo: `${origin}/auth/callback?next=/reset-password` },
        );
        if (error) throw error;
        setMessage(
          "If an account exists for that address, you’ll receive a password reset email.",
        );
      }
      if (mode === "reset-password") {
        const { error } = await supabase.auth.updateUser({
          password: values.password,
        });
        if (error) throw error;
        setMessage("Password updated. You can return to your workspace.");
      }
    } catch (error: unknown) {
      setFailed(true);
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";
      setMessage(
        error instanceof Error &&
          (error.message.startsWith("You signed in") ||
            error.message.startsWith("Your session"))
          ? error.message
          : code === "over_email_send_rate_limit" ||
              code === "over_request_rate_limit"
            ? "Too many requests. Please wait a few minutes before trying again."
            : code === "email_not_confirmed"
              ? "Please confirm your email using the link in your inbox, then sign in."
              : mode === "sign-in"
                ? "Unable to sign in. Check your details and confirm your email, then try again."
                : "We couldn’t complete that request. Try again or request a new email link.",
      );
    }
  });
  return (
    <>
      <p className="eyebrow text-primary">
        {mode === "sign-up"
          ? "Let’s get you started"
          : "Your PlanPilot account"}
      </p>
      <h1 className="mt-2 font-serif text-3xl font-normal leading-tight tracking-tight">
        {titles[mode]}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {mode === "sign-up"
          ? "One account. A clearer view of your dental benefits."
          : mode === "forgot-password"
            ? "Enter your email and we’ll send a recovery link."
            : mode === "reset-password"
              ? "Choose a new password with at least 12 characters."
              : "Sign in to your personal planning workspace."}
      </p>
      {!configured && (
        <p
          className="mt-6 rounded-xl bg-muted p-4 text-sm leading-6 text-primary"
          role="status"
        >
          Account access will be available once setup is complete. You can
          explore the public preview now.
        </p>
      )}
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        {mode !== "reset-password" && (
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={!configured || isSubmitting}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email", {
                validate: (value) => {
                  const result = emailSchema.safeParse(value);
                  return result.success || "Enter a valid email address.";
                },
              })}
            />
            {errors.email && (
              <p id="email-error" className="mt-2 text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
        )}
        {mode !== "forgot-password" && (
          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={
                  mode === "sign-in"
                    ? "Enter your password"
                    : "Create a strong password"
                }
                className="pr-14"
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                disabled={!configured || isSubmitting}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                {...register("password", {
                  validate: (value) =>
                    mode === "sign-in"
                      ? !!value || "Enter your password."
                      : passwordSchema.safeParse(value).success ||
                        "Use 12–128 characters.",
                })}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-2 flex h-10 w-10 items-center justify-center rounded-sm text-muted-foreground hover:text-primary"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {mode !== "sign-in" && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check size={12} />
                Use at least 12 characters.
              </p>
            )}
            {errors.password && (
              <p id="password-error" className="mt-2 text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        )}
        <Button
          className="mt-2 min-h-10 w-full"
          disabled={!configured || isSubmitting || resending}
          type="submit"
        >
          {isSubmitting
            ? "Please wait…"
            : mode === "sign-in"
              ? "Sign in"
              : mode === "sign-up"
                ? "Create account"
                : mode === "forgot-password"
                  ? "Send reset link"
                  : "Update password"}
          {isSubmitting ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <ArrowRight size={16} />
          )}
        </Button>
        {message && (
          <div
            className={`flex gap-3 border p-4 ${failed ? "border-destructive/30 bg-destructive/5" : "border-primary/20 bg-secondary/50"}`}
          >
            {!failed && (
              <MailCheck size={20} className="mt-0.5 shrink-0 text-primary" />
            )}
            <p
              role={failed ? "alert" : "status"}
              className={`text-sm leading-6 ${failed ? "text-destructive" : "text-primary"}`}
            >
              {message}
            </p>
          </div>
        )}
      </form>
      {(mode === "sign-in" || mode === "sign-up") && (
        <button
          type="button"
          onClick={resendConfirmation}
          disabled={!configured || isSubmitting || resending}
          className="mt-4 text-xs text-primary underline underline-offset-4 disabled:opacity-50"
        >
          {resending ? "Sending confirmation…" : "Resend confirmation email"}
        </button>
      )}
      <div className="mt-6 flex flex-wrap justify-between gap-4 text-sm text-primary">
        {mode === "sign-in" ? (
          <>
            <Link href="/sign-up">Create an account</Link>
            <Link href="/forgot-password">Forgot password?</Link>
          </>
        ) : (
          <Link href="/sign-in">
            {mode === "sign-up"
              ? "Already have an account? Sign in →"
              : "Back to sign in"}
          </Link>
        )}
        {mode === "reset-password" && <Link href="/app">Open workspace</Link>}
      </div>
    </>
  );
}
