'use client'
// Phone-number login via the MSG91 OTP Widget, bridged to a Supabase session.
//
// The MSG91 widget (see LoginScreen) sends + verifies the OTP on the client and
// hands back a JWT. We pass that JWT to the msg91-auth edge function, which
// verifies it with MSG91, links the phone to the current guest (preserving
// progress) or signs into the existing account, and returns a real Supabase
// session that we adopt here. Downstream there's ONE identity: the Supabase user.
import { getClient, ensureSession, resetGameState } from './game'
import { createClient } from './supabase'

// Full account deletion for the in-app "Delete account" button. Calls the
// delete-account edge function (removes the user's data AND the auth account /
// phone record via the service role). If that function isn't deployed yet, it
// falls back to wiping the data + signing out locally — so the button always at
// least removes gameplay data. Always resolves; the caller reloads afterwards.
export async function deleteAccountFully(): Promise<{ ok: true; full: boolean }> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const { data: { session } } = await getClient().auth.getSession()
    const token = session?.access_token
    if (url && token) {
      const res = await fetch(`${url}/functions/v1/delete-account`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        await getClient().auth.signOut({ scope: 'local' })
        return { ok: true, full: true }
      }
    }
  } catch { /* fall through to the local wipe */ }
  await resetGameState() // deletes game_state + dm_messages, signs out local
  return { ok: true, full: false }
}

export interface AuthInfo {
  isAuthed: boolean
  isAnonymous: boolean
  phone: string | null
  email: string | null
}

export async function getAuthInfo(): Promise<AuthInfo> {
  try {
    const { data: { user } } = await getClient().auth.getUser()
    return {
      isAuthed: !!user,
      isAnonymous: !!user?.is_anonymous,
      phone: user?.phone ? `+${user.phone}` : null,
      email: user?.email ?? null,
    }
  } catch {
    return { isAuthed: false, isAnonymous: false, phone: null, email: null }
  }
}

// Exchange the MSG91 widget's verified-OTP JWT for a real Supabase session.
// Reviewer / demo login — a fixed number + code for Google Play review (a
// reviewer can't receive the OTP sent to the owner's phone). It skips MSG91
// entirely and simply establishes the normal anonymous guest session: full
// game access, NO real phone linked, no elevated privileges. Safe to ship.
export const DEMO_PHONE_DIGITS = '9000000000'
export const DEMO_OTP = '0000'

export async function completeDemoLogin(): Promise<{ ok: true } | { error: string }> {
  const session = await ensureSession()
  return session ? { ok: true } : { error: 'Could not start a session.' }
}

export async function completeMsg91Login(msg91Token: string): Promise<{ ok: true } | { error: string }> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // Send the current guest session so the bridge can link its progress to the phone.
    const session = await ensureSession()
    const res = await fetch(`${url}/functions/v1/msg91-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token ?? anon}`,
      },
      body: JSON.stringify({ msg91Token }),
    })
    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      return { error: friendly(e?.error ?? 'login failed') }
    }
    const { access_token, refresh_token } = await res.json()
    if (!access_token || !refresh_token) return { error: 'login failed' }
    const { error } = await getClient().auth.setSession({ access_token, refresh_token })
    if (error) return { error: friendly(error.message) }
    if (await awaitPersistedSession(access_token)) return { ok: true }
    return { error: 'Signed in, but the session didn’t save — please try again.' }
  } catch (e) {
    return { error: friendly(e instanceof Error ? e.message : 'login failed') }
  }
}

// supabase-js persists a new session to cookie storage asynchronously (via the
// SIGNED_IN event), so a caller that reloads immediately can race the write and
// boot back as a guest. Poll a FRESH client (reads storage, not the in-memory
// cache) until it sees the session. Returns true once persisted (cap ~2s).
async function awaitPersistedSession(accessToken: string): Promise<boolean> {
  for (let i = 0; i < 20; i++) {
    const { data: { session } } = await createClient().auth.getSession()
    if (session?.access_token === accessToken) return true
    await new Promise(r => setTimeout(r, 100))
  }
  return false
}

// ── Email OTP (Supabase native — no edge-fn bridge needed) ──────────────────
// Sends a code to the email via Supabase Auth. Requires the email template to
// include {{ .Token }} so a CODE is delivered (not just a magic link).
export async function sendEmailOtp(email: string): Promise<{ ok: true } | { error: string }> {
  try {
    const { error } = await getClient().auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } })
    if (error) return { error: friendly(error.message) }
    return { ok: true }
  } catch (e) {
    return { error: friendly(e instanceof Error ? e.message : 'Couldn’t send the code') }
  }
}

// Verifies the emailed code, adopts the Supabase session, and waits for it to
// persist (same race guard as the phone path) before the caller reloads.
export async function verifyEmailOtp(email: string, token: string): Promise<{ ok: true } | { error: string }> {
  try {
    const { data, error } = await getClient().auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'email' })
    if (error) return { error: friendly(error.message) }
    const at = data.session?.access_token
    if (!at) return { error: 'login failed' }
    if (await awaitPersistedSession(at)) return { ok: true }
    return { error: 'Signed in, but the session didn’t save — please try again.' }
  } catch (e) {
    return { error: friendly(e instanceof Error ? e.message : 'login failed') }
  }
}

// Sign out → next boot creates a fresh anonymous guest session.
export async function signOutToGuest(): Promise<void> {
  try { await getClient().auth.signOut() } catch { /* ignore */ }
}

function friendly(m: string): string {
  if (/rate|limit|too many|429/i.test(m)) return 'Too many attempts — wait a minute and try again.'
  if (/expired/i.test(m)) return 'That code expired — request a new one.'
  if (/valid email|email address|email.*invalid/i.test(m)) return 'Please enter a valid email.'
  if (/not verified|otp|invalid/i.test(m)) return 'Couldn’t verify that code — try again.'
  if (/phone/i.test(m)) return 'Please enter a valid phone number.'
  return m
}
