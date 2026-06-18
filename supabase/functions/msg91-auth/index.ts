// MSG91 OTP Widget → Supabase session bridge.
//
// The MSG91 widget verifies the phone OTP on the client and returns a JWT. This
// function verifies that JWT server-side with MSG91 (authkey), resolves the
// phone to a Supabase user (linking the caller's anonymous guest so progress
// carries over, or signing into an existing account), and mints a REAL Supabase
// session (access + refresh) which the client then adopts.
//
// Deploy:  supabase functions deploy msg91-auth --no-verify-jwt
// Secret:  supabase secrets set MSG91_AUTH_KEY=...
// (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are auto-injected.)
// Use the native Deno.serve global (no deno.land/std import) — one fewer remote
// fetch at bundle time, and the pattern Supabase Edge Functions now recommend.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = ["https://lore-next-wine.vercel.app", "https://lore-next-ashy.vercel.app"];
function corsFor(origin: string): Record<string, string> {
  const ok = ALLOWED_ORIGINS.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
const json = (b: unknown, status: number, cors: Record<string, string>) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

// Pull the verified mobile out of MSG91's verifyAccessToken response. The exact
// field isn't documented, so try the common ones, then any phone-like digit run.
// Returns digits-only (no '+'), matching how auth.users stores phone.
function pickPhone(vd: Record<string, unknown>): string {
  const data = (vd?.data ?? {}) as Record<string, unknown>;
  const candidates = [vd?.message, vd?.mobile, vd?.phone, vd?.identifier, data.mobile, data.phone, data.identifier];
  for (const c of candidates) {
    const digits = String(c ?? "").replace(/\D/g, "");
    if (digits.length >= 8 && digits.length <= 15) return digits;
  }
  // Last resort: scan the whole stringified response for an 8-15 digit run.
  const m = JSON.stringify(vd).match(/\d{8,15}/);
  return m ? m[0] : "";
}

Deno.serve(async (req) => {
  const cors = corsFor(req.headers.get("Origin") ?? "");
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const SB_URL = Deno.env.get("SUPABASE_URL")!;
  const SB_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SB_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const MSG91_AUTH_KEY = Deno.env.get("MSG91_AUTH_KEY");
  if (!MSG91_AUTH_KEY) return json({ error: "MSG91 not configured" }, 500, cors);

  let msg91Token = "";
  try { msg91Token = (await req.json())?.msg91Token ?? ""; } catch { /* */ }
  if (!msg91Token) return json({ error: "missing msg91Token" }, 400, cors);

  // 1. Verify the widget's JWT with MSG91 → confirms the OTP was actually verified.
  const vr = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ authkey: MSG91_AUTH_KEY, "access-token": msg91Token }),
  });
  const vd = await vr.json().catch(() => ({}));
  if (!vr.ok || vd?.type !== "success") return json({ error: "otp not verified" }, 401, cors);

  // MSG91's verifyAccessToken response field for the verified mobile isn't
  // documented, so check the likely candidates and fall back to any phone-like
  // digit run. If none is found, log the shape (the OTP was valid) so we can fix
  // the field name from the function logs on the first real test.
  const phone = pickPhone(vd);
  if (!phone) {
    console.error("msg91 verified but no phone found in response:", JSON.stringify(vd));
    return json({ error: "no phone in token" }, 401, cors);
  }

  const admin = createClient(SB_URL, SB_SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });

  // 2. Caller's current anonymous user (if any) — so we can preserve guest progress.
  let anonUserId: string | null = null;
  const callerJwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (callerJwt) {
    const { data } = await admin.auth.getUser(callerJwt);
    if (data.user?.is_anonymous) anonUserId = data.user.id;
  }

  // 3. Resolve the target user: returning account > link guest > create new.
  let userId: string;
  const { data: existing } = await admin.rpc("get_user_id_by_phone", { phone_number: phone });
  if (existing) {
    userId = existing as string;           // returning user → their saved game loads
  } else if (anonUserId) {
    const { error } = await admin.auth.admin.updateUserById(anonUserId, { phone, phone_confirm: true });
    if (error) return json({ error: "link failed: " + error.message }, 500, cors);
    userId = anonUserId;                    // guest upgraded in place → progress preserved
  } else {
    const { data, error } = await admin.auth.admin.createUser({ phone, phone_confirm: true });
    if (error || !data.user) {
      console.error("createUser failed:", error);
      return json({ error: "create failed: " + (error?.message ?? "unknown") }, 500, cors);
    }
    userId = data.user.id;
  }

  // 4. Mint a real Supabase session: set a throwaway password, then sign in with
  //    it server-side. The password never leaves the server; the client gets a
  //    genuine GoTrue session (with refresh).
  // NOTE: bcrypt (GoTrue) rejects passwords >72 chars. One UUID (122 bits of
  // entropy) + a complexity suffix = 40 chars — plenty, and safely under the cap.
  const pwd = `${crypto.randomUUID()}Aa1!`;
  const { error: pwErr } = await admin.auth.admin.updateUserById(userId, { password: pwd });
  if (pwErr) {
    console.error("session prep (set password) failed:", pwErr);
    return json({ error: "session prep failed: " + pwErr.message }, 500, cors);
  }

  const anonClient = createClient(SB_URL, SB_ANON, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: signIn, error: siErr } = await anonClient.auth.signInWithPassword({ phone, password: pwd });
  if (siErr || !signIn.session) {
    console.error("sign-in after prep failed:", siErr);
    return json({ error: "sign-in failed: " + (siErr?.message ?? "no session returned") }, 500, cors);
  }

  return json({
    access_token: signIn.session.access_token,
    refresh_token: signIn.session.refresh_token,
  }, 200, cors);
});
