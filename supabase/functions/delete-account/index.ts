// Full account deletion — the in-app "Delete account" button calls this.
//
// Verifies the caller's Supabase JWT, deletes ALL their data (game_state +
// dm_messages), then deletes the auth user itself via the service role (which
// the client can never do directly). This is what makes in-app deletion remove
// the phone-number account, not just the gameplay data.
//
// Deploy:  supabase functions deploy delete-account
// (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-injected — no extra secrets.)
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

Deno.serve(async (req) => {
  const cors = corsFor(req.headers.get("origin") ?? "");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405, cors);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Identify the caller from their JWT.
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "no token" }, 401, cors);

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (userErr || !user) return json({ error: "invalid session" }, 401, cors);

  // 1) Delete all of the user's data.
  await admin.from("game_state").delete().eq("user_id", user.id);
  await admin.from("dm_messages").delete().eq("user_id", user.id);

  // 2) Delete the auth account itself (removes the phone-number record).
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return json({ error: "account delete failed", detail: delErr.message }, 500, cors);

  return json({ ok: true }, 200, cors);
});
