'use client'
import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { useApp } from '@/lib/context'
import { completeMsg91Login } from '@/lib/auth'

// Phone login via the MSG91 OTP Widget. The widget sends + verifies the OTP and
// returns a JWT; completeMsg91Login() exchanges it for a Supabase session (which
// links the guest's progress). On success we full-reload as the signed-in user.

declare global {
  interface Window {
    initSendOTP?: (config: Record<string, unknown>) => void
    sendOtp?: (identifier: string, success: (d: unknown) => void, failure: (e: unknown) => void) => void
    verifyOtp?: (otp: string, success: (d: unknown) => void, failure: (e: unknown) => void) => void
    retryOtp?: (channel: string | null, success: (d: unknown) => void, failure: (e: unknown) => void) => void
  }
}

// MSG91 widget id + client token are PUBLIC by design (embedded in the browser
// widget). Committed as defaults so the deployed app works without extra env;
// override via env if they ever change. (The server authkey is NOT here — it's
// a Supabase edge-fn secret used only by msg91-auth.)
const WIDGET_ID = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || '366671733063373330303731'
const TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || '533925TdinOE5GXgE6a32ef1cP1'
// OTP length MUST match the MSG91 widget's configured OTP length (set to 4 in the
// MSG91 dashboard). Drives the input cap, placeholder, submit gate, and auto-submit.
const OTP_LENGTH = Number(process.env.NEXT_PUBLIC_MSG91_OTP_LENGTH) || 4

function loadWidget(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'))
    if (window.initSendOTP) return resolve()
    const urls = ['https://verify.msg91.com/otp-provider.js', 'https://verify.phone91.com/otp-provider.js']
    let i = 0
    const attempt = () => {
      const s = document.createElement('script')
      s.src = urls[i]; s.async = true
      s.onload = () => resolve()
      s.onerror = () => { i++; i < urls.length ? attempt() : reject(new Error('script load failed')) }
      document.head.appendChild(s)
    }
    attempt()
  })
}

// The widget returns the verified JWT in various shapes; normalise it.
function extractToken(d: unknown): string {
  if (typeof d === 'string') return d
  const o = (d ?? {}) as Record<string, unknown>
  return String(o.message ?? o.access_token ?? o['access-token'] ?? o.accessToken ?? '')
}

// MSG91 hands its failure callbacks an OBJECT ({message,type,...}), not a string —
// so a `typeof e === 'string'` check always discarded the real reason. Pull the
// actual message out (and log the raw payload) so the user/logs see WHY it failed.
function errText(e: unknown, fallback: string): string {
  if (typeof window !== 'undefined') console.error('[msg91]', e)
  if (typeof e === 'string') return e || fallback
  const o = (e ?? {}) as Record<string, unknown>
  const data = (o.data ?? {}) as Record<string, unknown>
  const m = o.message ?? o.msg ?? o.error ?? data.message
  return typeof m === 'string' && m.trim() ? m : fallback
}

export default function LoginScreen() {
  const { navigate, goBack, game } = useApp()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [cc, setCc] = useState('+91')
  const [num, setNum] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const ready = useRef(false)

  useEffect(() => {
    let alive = true
    if (!WIDGET_ID || !TOKEN_AUTH) { setErr('Login isn’t configured yet.'); return }
    loadWidget()
      .then(() => {
        if (!alive) return
        window.initSendOTP?.({ widgetId: WIDGET_ID, tokenAuth: TOKEN_AUTH, exposeMethods: true, success: () => {}, failure: () => {} })
        ready.current = true
      })
      .catch(() => { if (alive) setErr('Couldn’t load the verification widget — check your connection.') })
    return () => { alive = false }
  }, [])

  const phone = `${cc}${num.replace(/\D/g, '')}`
  const phoneValid = /^\+\d{8,15}$/.test(phone)

  function send() {
    if (!phoneValid || busy) return
    if (!ready.current || !window.sendOtp) { setErr('Still loading — try again in a second.'); return }
    setBusy(true); setErr(null)
    window.sendOtp(
      phone.replace('+', ''),
      () => { setBusy(false); setStep('otp'); setCode('') },
      (e) => { setBusy(false); setErr(errText(e, 'Couldn’t send the code. Try again.')) },
    )
  }

  function verify(codeArg?: string) {
    const c = (codeArg ?? code).replace(/\D/g, '')
    if (c.length < OTP_LENGTH || busy) return
    if (!window.verifyOtp) { setErr('Verification not ready — resend the code.'); return }
    setBusy(true); setErr(null)
    window.verifyOtp(
      c,
      async (d) => {
        const token = extractToken(d)
        if (!token) { setBusy(false); setErr('Verification failed — try again.'); return }
        const r = await completeMsg91Login(token)
        if ('error' in r) { setBusy(false); setErr(r.error); return }
        if (typeof window !== 'undefined') window.location.reload()
      },
      (e) => { setBusy(false); setErr(errText(e, 'That code didn’t work — re-check or resend.')) },
    )
  }

  function resend() {
    if (!window.retryOtp || busy) return
    setErr(null)
    window.retryOtp(null, () => { setErr('New code bhej diya ✅') }, (e) => setErr(errText(e, 'Couldn’t resend.')))
  }

  const input: CSSProperties = {
    background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 12,
    color: 'var(--ink)', fontSize: 17, padding: '14px 14px', fontFamily: 'var(--sans)', outline: 'none',
  }
  const primary: CSSProperties = {
    width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', marginTop: 18,
    background: phoneValid || step === 'otp' ? 'var(--accent)' : 'var(--surf)',
    color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: 'var(--sans)',
    cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)', padding: '52px 22px 28px' }}>
      <button onClick={goBack} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--ink3)', fontSize: 14, cursor: 'pointer', marginBottom: 24 }}>← Back</button>

      <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.25 }}>
        {step === 'phone' ? 'Apni progress save karo' : 'Code daalo'}
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 8, lineHeight: 1.5 }}>
        {step === 'phone'
          ? 'Number daalo taaki tumhari story kisi bhi phone pe wapas mile. OTP aayega.'
          : `Humne ${phone} pe ek code bheja. Neeche daalo.`}
      </div>

      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column' }}>
        {step === 'phone' ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={cc} onChange={e => setCc(e.target.value)} inputMode="tel"
              style={{ ...input, width: 64, textAlign: 'center' }} aria-label="Country code" />
            <input value={num} onChange={e => setNum(e.target.value)} inputMode="numeric" autoFocus
              placeholder="98765 43210" style={{ ...input, flex: 1 }} aria-label="Phone number"
              onKeyDown={e => { if (e.key === 'Enter') send() }} />
          </div>
        ) : (
          <input value={code}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH)
              setCode(v)
              if (v.length === OTP_LENGTH) verify(v)   // auto-submit once the full code is in
            }}
            inputMode="numeric" autoFocus placeholder={`${OTP_LENGTH}-digit code`} maxLength={OTP_LENGTH}
            style={{ ...input, letterSpacing: '.3em', textAlign: 'center', fontSize: 22 }}
            aria-label="OTP code" onKeyDown={e => { if (e.key === 'Enter') verify() }} />
        )}

        {err && <div style={{ color: 'var(--heat)', fontSize: 12.5, marginTop: 10 }}>{err}</div>}

        {step === 'phone' ? (
          <button onClick={send} disabled={!phoneValid || busy} style={primary}>
            {busy ? 'Sending…' : 'Send code'}
          </button>
        ) : (
          <>
            <button onClick={() => verify()} disabled={code.length < OTP_LENGTH || busy} style={primary}>
              {busy ? 'Verifying…' : 'Verify & continue'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
              <button onClick={() => { setStep('phone'); setErr(null) }} style={{ background: 'none', border: 'none', color: 'var(--ink3)', fontSize: 13, cursor: 'pointer' }}>Change number</button>
              <button onClick={resend} disabled={busy} style={{ background: 'none', border: 'none', color: 'var(--fame)', fontSize: 13, cursor: 'pointer' }}>Resend code</button>
            </div>
          </>
        )}
      </div>

      <div style={{ flex: 1 }} />
      <button onClick={() => navigate(game.playerName ? 'worlds' : 'onboarding')} style={{ background: 'none', border: 'none', color: 'var(--ink3)', fontSize: 13, cursor: 'pointer', padding: 10 }}>
        Abhi nahi — keep playing as guest
      </button>
    </div>
  )
}
