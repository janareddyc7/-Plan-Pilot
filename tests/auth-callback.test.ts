import { describe, it, expect } from "vitest";
import {
  classifyCallbackError,
  callbackMessage,
} from "@/lib/auth/callback-error";
describe("email callback errors", () => {
  it("does not mislabel network failures as expired links", () => {
    expect(
      classifyCallbackError({ name: "AuthRetryableFetchError", status: 0 }),
    ).toBe("network");
    expect(classifyCallbackError(new TypeError("fetch failed"))).toBe(
      "network",
    );
    expect(classifyCallbackError({ status: 503 })).toBe("network");
  });
  it("distinguishes browser verifier issues from expired tokens", () => {
    expect(
      classifyCallbackError({ code: "pkce_code_verifier_not_found" }),
    ).toBe("browser");
    expect(classifyCallbackError({ code: "bad_code_verifier" })).toBe(
      "browser",
    );
    expect(classifyCallbackError({ code: "otp_expired" })).toBe("expired");
  });
  it("only presents approved error messages", () => {
    expect(callbackMessage("<script>untrusted</script>")).toBe(
      callbackMessage("callback"),
    );
    expect(classifyCallbackError(null)).toBe("callback");
  });
});
