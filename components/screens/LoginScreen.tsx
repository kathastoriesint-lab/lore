'use client'
import { useState, type CSSProperties } from 'react'
import { useApp } from '@/lib/context'
import { sendPhoneOtp, verifyPhoneOtp, type OtpMode } from '@/lib/auth'

// Phone-number login. Keeps the player's guest progress by linking the phone to
// their existing anonymous session (see lib/auth.ts). On success we full-reload
// so the app re-boots as the now-permanent user.
export default function LoginScreen() {
  const { navigate, goBack } = useApp()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [cc, setCc] = useState('+91')
  const [num, setNum] = useState('')
  const [code, setCode] = useState('')
  const [mode, setMode] = useState<OtpMode>('link')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const phone = `${cc}${num.replace(/\D/g, '')}`
  const phoneValid = /^\+\d{8,15}$/.test(phone)

  async function send() {
    if (!phoneValid || busy) return
    setBusy(true); setErr(null)
    const r = await sendPhoneOtp(phone)
    setBusy(false)
    if ('error' in r) { setErr(r.error); return }
    setMode(r.mode); setStep('otp'); setCode('')
  }

  async function verify() {
    if (code.length < 4 || busy) return
    setBusy(true); setErr(null)
    const r = await verifyPhoneOtp(phone, code.trim(), mode)
    if ('error' in r) { setBusy(false); setErr(r.error); return }
    // Re-boot as the signed-in user (loads their save; merges/keeps progress).
    if (typeof window !== 'undefined') window.location.reload()
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
          <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric" autoFocus placeholder="6-digit code"
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
            <button onClick={verify} disabled={code.length < 4 || busy} style={primary}>
              {busy ? 'Verifying…' : 'Verify & continue'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
              <button onClick={() => { setStep('phone'); setErr(null) }} style={{ background: 'none', border: 'none', color: 'var(--ink3)', fontSize: 13, cursor: 'pointer' }}>Change number</button>
              <button onClick={send} disabled={busy} style={{ background: 'none', border: 'none', color: 'var(--fame)', fontSize: 13, cursor: 'pointer' }}>Resend code</button>
            </div>
          </>
        )}
      </div>

      <div style={{ flex: 1 }} />
      <button onClick={() => navigate('worlds')} style={{ background: 'none', border: 'none', color: 'var(--ink3)', fontSize: 13, cursor: 'pointer', padding: 10 }}>
        Abhi nahi — keep playing as guest
      </button>
    </div>
  )
}
