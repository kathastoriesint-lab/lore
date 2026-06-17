// Supabase "Send SMS" auth hook → delivers the OTP via MSG91 (DLT-compliant
// India SMS). Supabase still GENERATES and VERIFIES the OTP; this hook only
// sends it. So login stays single-system on Supabase — MSG91 is just the pipe.
//
// Deploy:  supabase functions deploy send-sms-hook --no-verify-jwt
// Secrets: supabase secrets set MSG91_AUTH_KEY=... MSG91_TEMPLATE_ID=... SEND_SMS_HOOK_SECRET=v1,whsec_...
// Then: Supabase Dashboard → Auth → Hooks → "Send SMS" → point at this function's
//       URL and paste the same SEND_SMS_HOOK_SECRET.
//
// MSG91 prerequisites (regulatory): a DLT-approved OTP template that contains a
// variable named OTP, plus a registered sender. The template_id goes in MSG91_TEMPLATE_ID.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

interface HookPayload {
  user: { phone?: string };
  sms: { otp?: string };
}

serve(async (req) => {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  // Verify the request genuinely came from Supabase — this endpoint sends paid
  // SMS, so an unverified caller would be a cost-abuse vector.
  const secret = (Deno.env.get("SEND_SMS_HOOK_SECRET") ?? "").replace("v1,whsec_", "");
  let user: HookPayload["user"], sms: HookPayload["sms"];
  try {
    const data = new Webhook(secret).verify(payload, headers) as HookPayload;
    user = data.user;
    sms = data.sms;
  } catch {
    return json({ error: "invalid signature" }, 401);
  }

  const phone = (user?.phone ?? "").replace(/^\+/, ""); // MSG91 wants <cc><number>, no '+'
  const otp = sms?.otp ?? "";
  if (!phone || !otp) return json({ error: "missing phone/otp" }, 400);

  const authkey = Deno.env.get("MSG91_AUTH_KEY");
  const templateId = Deno.env.get("MSG91_TEMPLATE_ID");
  if (!authkey || !templateId) return json({ error: "MSG91 not configured" }, 500);

  // MSG91 Flow API — send the Supabase-generated OTP through a DLT-approved
  // template. The recipient var key (OTP) must match the variable in your template.
  const res = await fetch("https://control.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: { "authkey": authkey, "Content-Type": "application/json" },
    body: JSON.stringify({
      template_id: templateId,
      recipients: [{ mobiles: phone, OTP: otp }],
    }),
  });

  if (!res.ok) {
    console.error("MSG91 send failed:", res.status, await res.text());
    return json({ error: "sms send failed" }, 502);
  }
  return json({}, 200);
});

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
