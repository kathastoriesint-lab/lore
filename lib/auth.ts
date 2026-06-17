'use client'
// Phone-number login on Supabase Auth.
//
// Flow (preserves guest progress):
//  - New player: they're already in an anonymous session, so we ATTACH the phone
//    to that user (updateUser → 'phone_change' OTP). Same user_id ⇒ their cricket
//    progress carries over.
//  - Returning player: the phone already belongs to an account, so we sign INTO
//    it (signInWithOtp → 'sms' OTP). The throwaway anon session is abandoned.
// The send step reports which path it took so verify uses the matching OTP type.
import { getClient } from './game'

export type OtpMode = 'link' | 'signin'

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

// phone must be E.164, e.g. "+919876543210".
export async function sendPhoneOtp(phone: string): Promise<{ mode: OtpMode } | { error: string }> {
  const sb = getClient()
  try {
    const { data: { user } } = await sb.auth.getUser()
    if (user?.is_anonymous) {
      // Try to link the phone to this guest (keeps their progress).
      const { error } = await sb.auth.updateUser({ phone })
      if (!error) return { mode: 'link' }
      // Phone already in use / not linkable → fall through to sign-in.
    }
    const { error } = await sb.auth.signInWithOtp({ phone })
    if (error) return { error: friendly(error.message) }
    return { mode: 'signin' }
  } catch (e) {
    return { error: friendly(e instanceof Error ? e.message : 'unknown') }
  }
}

export async function verifyPhoneOtp(
  phone: string, token: string, mode: OtpMode,
): Promise<{ ok: true } | { error: string }> {
  try {
    const type = mode === 'link' ? 'phone_change' : 'sms'
    const { error } = await getClient().auth.verifyOtp({ phone, token, type })
    if (error) return { error: friendly(error.message) }
    return { ok: true }
  } catch (e) {
    return { error: friendly(e instanceof Error ? e.message : 'unknown') }
  }
}

// Sign out → next boot creates a fresh anonymous guest session.
export async function signOutToGuest(): Promise<void> {
  try { await getClient().auth.signOut() } catch { /* ignore */ }
}

function friendly(m: string): string {
  if (/already.*registered|already.*in use/i.test(m)) return 'That number is already linked to an account.'
  if (/rate|limit|too many|429/i.test(m)) return 'Too many attempts — wait a minute and try again.'
  if (/otp|token|expired|invalid/i.test(m)) return 'That code didn’t work — re-check it or resend.'
  if (/sms|provider|twilio|messaging/i.test(m)) return 'Couldn’t send the code right now. Try again shortly.'
  if (/phone/i.test(m)) return 'Please enter a valid phone number with country code.'
  return m
}
