import { beforeEach, describe, expect, it, vi } from "vitest";
const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser } }) }));
import { GET } from "@/app/api/auth/session/route";
describe("server session verification", () => {
  beforeEach(() => getUser.mockReset());
  it("accepts a verified session without exposing credentials", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user" } }, error: null });
    const result = await GET();
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ authenticated: true });
    expect(result.headers.get("cache-control")).toContain("no-store");
  });
  it("rejects missing sessions", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await GET()).status).toBe(401);
  });
  it("distinguishes blocked connectivity from bad credentials", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: { name: "AuthRetryableFetchError" } });
    expect((await GET()).status).toBe(503);
  });
});
