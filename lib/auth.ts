'use client'
// Phone-number login via the MSG91 OTP Widget, bridged to a Supabase session.
//
// The MSG91 widget (see LoginScreen) sends + verifies the OTP on the client and
// hands back a JWT. We pass that JWT to the msg91-auth edge function, which
// verifies it with MSG91, links the phone to the current guest (preserving
// progress) or signs into the existing account, and returns a real Supabase
// session that we adopt here. Downstream there's ONE identity: the Supabase user.
import { getClient, ensureSession } from './game'
import { createClient } from './supabase'

export interface AuthInfo {
  isAuthed: boolean
  isAnonymous: boolean
  phone: string | null
}

export async function getAuthInfo(): Promise<AuthInfo> {
  try {
    const { data: { user } } = await getClient().auth.getUser()
    return {
      isAuthed: !!user,
      isAnonymous: !!user?.is_anonymous,
      phone: user?.phone ? `+${user.phone}` : null,
    }
  } catch {
    return { isAuthed: false, isAnonymous: false, phone: null }
  }
}

// Exchange the MSG91 widget's verified-OTP JWT for a real Supabase session.
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
    // supabase-js persists the new session to storage asynchronously (via the
    // SIGNED_IN event), so a caller that reloads immediately can race the write
    // and boot back as a fresh guest. Poll a FRESH client — which reads from
    // cookie storage rather than the in-memory cache — until it sees the new
    // session, so the reload is safe. Cap the wait at ~2s.
    for (let i = 0; i < 20; i++) {
      const { data: { session: persisted } } = await createClient().auth.getSession()
      if (persisted?.access_token === access_token) return { ok: true }
      await new Promise(r => setTimeout(r, 100))
    }
    // Storage never confirmed — surface it rather than reloading into a guest.
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
  if (/not verified|otp/i.test(m)) return 'Couldn’t verify that code — try again.'
  if (/rate|limit|too many|429/i.test(m)) return 'Too many attempts — wait a minute and try again.'
  if (/phone/i.test(m)) return 'Please enter a valid phone number.'
  return m
}
