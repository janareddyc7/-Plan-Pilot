export const callbackMessages = {
  network:
    "We couldn’t reach the account service. Please try signing in again in a moment.",
  browser:
    "This link could not finish signing you in. Open it in the browser where you created your account, or try signing in with your email and password—your email may already be confirmed.",
  expired:
    "This email link has expired or was already used. Try signing in, or request a new confirmation email below.",
  missing:
    "This link is missing its confirmation details. Use the complete link from your latest email.",
  setup:
    "Account services are not configured yet. Please try again after setup is complete.",
  callback:
    "We couldn’t complete email confirmation. Try signing in, or request a new confirmation email below.",
} as const;

export type CallbackError = keyof typeof callbackMessages;
export function classifyCallbackError(error: unknown): CallbackError {
  const value = error as {
    code?: string;
    name?: string;
    status?: number;
  } | null;
  if (
    value?.name === "AuthRetryableFetchError" ||
    value?.name === "TypeError" ||
    (value?.status && value.status >= 500)
  )
    return "network";
  if (
    value?.code === "pkce_code_verifier_not_found" ||
    value?.code === "bad_code_verifier"
  )
    return "browser";
  if (
    value?.code === "otp_expired" ||
    value?.code === "flow_state_expired" ||
    value?.code === "flow_state_not_found"
  )
    return "expired";
  return "callback";
}
export function callbackMessage(code: string) {
  return Object.hasOwn(callbackMessages, code)
    ? callbackMessages[code as CallbackError]
    : callbackMessages.callback;
}
