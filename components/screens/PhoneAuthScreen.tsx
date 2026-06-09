'use client'
import { useState, useRef, useEffect } from 'react'
import { getFirebaseAuth, verifyPhoneOTP } from '@/lib/firebase'
import { createClient } from '@/lib/supabase'
import type { ConfirmationResult } from 'firebase/auth'

export default function PhoneAuthScreen({ onSuccess }: { onSuccess: () => void }) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const confirmRef = useRef<ConfirmationResult | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verifierRef = useRef<any>(null)
  const phoneRef = useRef('')

  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
  const phoneDigits = phone.replace(/\D/g, '')
  const phoneValid = phoneDigits.length >= 10

  // Keep phoneRef in sync so handleSendOTP always reads latest value
  useEffect(() => { phoneRef.current = phone }, [phone])

  // Initialize a single invisible reCAPTCHA verifier on mount, tied to a container div.
  // Using a div (not the button) avoids React double-effect clearing a button-bound widget.
  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let verifier: any = null

    ;(async () => {
      const auth = await getFirebaseAuth()
      const { RecaptchaVerifier } = await import('firebase/auth')
      if (cancelled) return
      verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
      await verifier.render()
      if (cancelled) { try { verifier.clear() } catch {} return }
      verifierRef.current = verifier
    })().catch(e => console.error('[reCAPTCHA init]', e))

    return () => {
      cancelled = true
      try { verifier?.clear() } catch {}
      verifierRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSendOTP() {
    if (!phoneValid || loading || !verifierRef.current) return
    setError(null)
    setLoading(true)
    try {
      const auth = await getFirebaseAuth()
      const { signInWithPhoneNumber } = await import('firebase/auth')
      const ph = phoneRef.current.startsWith('+') ? phoneRef.current : `+91${phoneRef.current}`
      confirmRef.current = await signInWithPhoneNumber(auth, ph, verifierRef.current)
      setStep('otp')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'OTP bhejne mein error hua')
      // Reset verifier after failure so next attempt gets a fresh token
      try { verifierRef.current?.clear() } catch {}
      verifierRef.current = null
      const auth = await getFirebaseAuth()
      const { RecaptchaVerifier } = await import('firebase/auth')
      const v = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
      await v.render().catch(() => {})
      verifierRef.current = v
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOTP() {
    if (!confirmRef.current) return
    setError(null)
    setLoading(true)
    try {
      const idToken = await verifyPhoneOTP(confirmRef.current, otp.trim())
      const res = await fetch('/api/auth/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail ?? body.error ?? 'Auth failed')
      }
      const { hashed_token } = await res.json()
      const { error: otpError } = await createClient().auth.verifyOtp({
        token_hash: hashed_token,
        type: 'magiclink',
      })
      if (otpError) throw new Error(otpError.message)
      onSuccess()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification fail ho gaya')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)', padding:'0 28px' }}>
      {/* Header */}
      <div style={{ paddingTop:60, paddingBottom:40 }}>
        <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.14em', color:'var(--accent)', marginBottom:16 }}>
          LORE
        </div>
        <div style={{ fontFamily:'var(--serif)', fontWeight:600, fontSize:32, lineHeight:1.15, marginBottom:10 }}>
          {step === 'phone' ? 'Apna number dalo' : 'OTP dalo'}
        </div>
        <div style={{ fontSize:14, color:'var(--ink2)', lineHeight:1.6 }}>
          {step === 'phone'
            ? 'Ek SMS aayega — phir game shuru hoga.'
            : `Code bheja gaya ${formattedPhone} pe.`}
        </div>
      </div>

      {/* Phone input */}
      {step === 'phone' && (
        <div style={{ marginBottom:32 }}>
          <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'.1em', color:'rgba(255,255,255,.45)', marginBottom:14 }}>
            MOBILE NUMBER
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/[^\d+]/g, '').slice(0, 15))}
            onKeyDown={e => {
              if (e.key === 'Enter' && phoneValid) handleSendOTP()
            }}
            placeholder="+91 XXXXX XXXXX"
            autoFocus
            style={{
              width:'100%', boxSizing:'border-box',
              background:'transparent', border:'none', outline:'none',
              borderBottom:`1.5px solid ${phone ? 'var(--accent)' : 'rgba(255,255,255,.2)'}`,
              paddingBottom:10, color:'#fff', fontSize:24,
              fontFamily:'var(--serif)', fontWeight:500, caretColor:'var(--accent)',
              transition:'border-color .2s',
            }}
          />
        </div>
      )}

      {/* OTP input */}
      {step === 'otp' && (
        <div style={{ marginBottom:32 }}>
          <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'.1em', color:'rgba(255,255,255,.45)', marginBottom:14 }}>
            VERIFICATION CODE
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
            onKeyDown={e => { if (e.key === 'Enter' && otp.length === 6) handleVerifyOTP() }}
            placeholder="· · · · · ·"
            autoFocus
            style={{
              width:'100%', boxSizing:'border-box',
              background:'transparent', border:'none', outline:'none',
              borderBottom:`1.5px solid ${otp ? 'var(--accent)' : 'rgba(255,255,255,.2)'}`,
              paddingBottom:10, color:'#fff', fontSize:36, letterSpacing:'0.35em',
              fontFamily:'var(--serif)', fontWeight:500, caretColor:'var(--accent)',
              transition:'border-color .2s',
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ fontSize:13, color:'#FF5C3A', marginBottom:20, lineHeight:1.5 }}>
          {error}
        </div>
      )}

      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" />

      {/* Buttons */}
      {step === 'phone' ? (
        <button
          onClick={handleSendOTP}
          style={{
            width:'100%', padding:'16px 0', borderRadius:16, border:'none',
            background: phoneValid ? 'var(--accent)' : 'rgba(255,45,120,.25)',
            color: phoneValid ? '#fff' : 'rgba(255,255,255,.4)',
            fontWeight:700, fontSize:16, fontFamily:'var(--sans)',
            transition:'all .2s',
            cursor: phoneValid && !loading ? 'pointer' : 'default',
            boxShadow: phoneValid ? '0 8px 24px rgba(255,45,120,.35)' : 'none',
          }}
        >
          {loading ? 'Bhej raha hoon...' : 'OTP Bhejo →'}
        </button>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <button
            onClick={handleVerifyOTP}
            disabled={otp.length !== 6 || loading}
            style={{
              width:'100%', padding:'16px 0', borderRadius:16, border:'none',
              background: otp.length === 6 ? 'var(--accent)' : 'rgba(255,45,120,.25)',
              color: otp.length === 6 ? '#fff' : 'rgba(255,255,255,.4)',
              fontWeight:700, fontSize:16, fontFamily:'var(--sans)',
              transition:'all .2s', cursor: otp.length === 6 ? 'pointer' : 'default',
              boxShadow: otp.length === 6 ? '0 8px 24px rgba(255,45,120,.35)' : 'none',
            }}
          >
            {loading ? 'Verify ho raha hai...' : 'Verify Karo →'}
          </button>
          <button
            onClick={() => { setStep('phone'); setOtp(''); setError(null) }}
            style={{
              width:'100%', padding:'12px 0', borderRadius:14,
              background:'transparent', color:'rgba(255,255,255,.4)',
              fontWeight:600, fontSize:13, fontFamily:'var(--sans)',
              border:'1px solid rgba(255,255,255,.1)', cursor:'pointer',
            }}
          >
            ← Wapas jaao
          </button>
        </div>
      )}
    </div>
  )
}
