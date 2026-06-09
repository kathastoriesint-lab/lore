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
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)', position:'relative', overflow:'hidden' }}>

      {/* Atmospheric top glow */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
        background:'radial-gradient(ellipse 130% 44% at 50% -8%, rgba(255,45,120,.2) 0%, transparent 68%)',
      }} />

      {/* World ambient strip — fills the empty bottom */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:200,
        pointerEvents:'none', zIndex:0,
        background:'linear-gradient(to top, rgba(0,20,70,.5) 0%, transparent 100%)',
      }}>
        <div style={{ position:'absolute', bottom:28, left:0, right:0, display:'flex', justifyContent:'center', gap:18 }}>
          {['INDIAN DRESSING ROOM', 'CREATOR HOUSE', 'COLLEGE HOSTEL'].map((w, i) => (
            <div key={w} style={{
              fontSize:9, fontWeight:800, letterSpacing:'.1em',
              color:`rgba(255,255,255,${i === 0 ? '.16' : '.07'})`,
              whiteSpace:'nowrap',
            }}>{w}</div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', flex:1, padding:'0 28px' }}>

        {/* Brand mark */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:60, paddingBottom:6 }}>
          <svg viewBox="0 0 32 32" fill="none" width="44" height="44" style={{ filter:'drop-shadow(0 0 14px rgba(255,45,120,.55))' }}>
            <defs>
              <linearGradient id="authG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ff2d78"/>
                <stop offset=".55" stopColor="#ff8a3d"/>
                <stop offset="1" stopColor="#ffd24d"/>
              </linearGradient>
            </defs>
            <circle cx="16" cy="16" r="13.5" stroke="url(#authG)" strokeWidth="3" strokeDasharray="58 12" strokeLinecap="round"/>
            <circle cx="16" cy="16" r="6.4" stroke="#ff2d78" strokeWidth="2.4"/>
            <circle cx="16" cy="16" r="1.9" fill="#ffd24d"/>
          </svg>
          <div style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:600, marginTop:10, letterSpacing:'-.01em' }}>
            Lore
          </div>
        </div>

        {/* Tagline */}
        <div style={{ textAlign:'center', marginBottom:44, marginTop:8 }}>
          <div style={{ fontSize:12, color:'var(--ink3)', fontWeight:500, letterSpacing:'.03em', lineHeight:1.6 }}>
            Kuch kahaniyan sirf padhi jaati hain.{'\n'}Kuch jeeni padti hain.
          </div>
        </div>

        {/* Step: phone */}
        {step === 'phone' && (
          <>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontFamily:'var(--serif)', fontWeight:600, fontSize:29, lineHeight:1.2, marginBottom:8 }}>
                Apna number dalo
              </div>
              <div style={{ fontSize:13, color:'var(--ink2)', lineHeight:1.65 }}>
                Ek SMS aayega — phir tumhari duniya shuru hogi.
              </div>
            </div>

            <div style={{ marginBottom:32 }}>
              <label style={{ display:'block', fontSize:10, fontWeight:800, letterSpacing:'.12em', color:'var(--ink3)', marginBottom:12 }}>
                MOBILE NUMBER
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^\d+]/g, '').slice(0, 15))}
                onKeyDown={e => { if (e.key === 'Enter' && phoneValid) handleSendOTP() }}
                placeholder="+91 XXXXX XXXXX"
                autoFocus
                style={{
                  width:'100%', boxSizing:'border-box',
                  background:'transparent', border:'none', outline:'none',
                  borderBottom:`1.5px solid ${phone ? 'var(--accent)' : 'rgba(255,255,255,.2)'}`,
                  paddingBottom:12, color:'#fff', fontSize:26,
                  fontFamily:'var(--serif)', fontWeight:500, caretColor:'var(--accent)',
                  transition:'border-color .2s',
                }}
              />
            </div>

            {error && (
              <div style={{ fontSize:13, color:'var(--heat)', marginBottom:16, lineHeight:1.5 }}>{error}</div>
            )}

            <button
              onClick={handleSendOTP}
              style={{
                width:'100%', padding:'16px 0', borderRadius:16, border:'none',
                background: phoneValid ? 'var(--accent)' : 'rgba(255,45,120,.18)',
                color: phoneValid ? '#fff' : 'rgba(255,255,255,.28)',
                fontWeight:700, fontSize:16, fontFamily:'var(--sans)',
                transition:'all .2s',
                cursor: phoneValid && !loading ? 'pointer' : 'default',
                boxShadow: phoneValid ? '0 8px 28px rgba(255,45,120,.4)' : 'none',
              }}
            >
              {loading ? 'Bhej raha hoon...' : phoneValid ? 'OTP Bhejo →' : 'Number daalo pehle'}
            </button>
          </>
        )}

        {/* Step: OTP */}
        {step === 'otp' && (
          <>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontFamily:'var(--serif)', fontWeight:600, fontSize:29, lineHeight:1.2, marginBottom:8 }}>
                Code daalo
              </div>
              <div style={{ fontSize:13, color:'var(--ink2)', lineHeight:1.65 }}>
                6-digit code bheja {formattedPhone} pe.
              </div>
            </div>

            <div style={{ marginBottom:32 }}>
              <label style={{ display:'block', fontSize:10, fontWeight:800, letterSpacing:'.12em', color:'var(--ink3)', marginBottom:12 }}>
                VERIFICATION CODE
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => { if (e.key === 'Enter' && otp.length === 6) handleVerifyOTP() }}
                placeholder="· · · · · ·"
                autoFocus
                style={{
                  width:'100%', boxSizing:'border-box',
                  background:'transparent', border:'none', outline:'none',
                  borderBottom:`1.5px solid ${otp ? 'var(--accent)' : 'rgba(255,255,255,.2)'}`,
                  paddingBottom:12, color:'#fff', fontSize:36, letterSpacing:'0.35em',
                  fontFamily:'var(--serif)', fontWeight:500, caretColor:'var(--accent)',
                  transition:'border-color .2s',
                }}
              />
            </div>

            {error && (
              <div style={{ fontSize:13, color:'var(--heat)', marginBottom:16, lineHeight:1.5 }}>{error}</div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6 || loading}
                style={{
                  width:'100%', padding:'16px 0', borderRadius:16, border:'none',
                  background: otp.length === 6 ? 'var(--accent)' : 'rgba(255,45,120,.18)',
                  color: otp.length === 6 ? '#fff' : 'rgba(255,255,255,.28)',
                  fontWeight:700, fontSize:16, fontFamily:'var(--sans)',
                  transition:'all .2s', cursor: otp.length === 6 ? 'pointer' : 'default',
                  boxShadow: otp.length === 6 ? '0 8px 28px rgba(255,45,120,.4)' : 'none',
                }}
              >
                {loading ? 'Verify ho raha hai...' : otp.length === 6 ? 'Andar Jao →' : `${6 - otp.length} digit aur`}
              </button>
              <button
                onClick={() => { setStep('phone'); setOtp(''); setError(null) }}
                style={{
                  width:'100%', padding:'12px 0', borderRadius:14,
                  background:'transparent', color:'var(--ink3)',
                  fontWeight:600, fontSize:13, fontFamily:'var(--sans)',
                  border:'1px solid rgba(255,255,255,.1)', cursor:'pointer',
                }}
              >
                ← Number badlo
              </button>
            </div>
          </>
        )}
      </div>

      {/* reCAPTCHA — hidden, no visual footprint */}
      <div id="recaptcha-container" style={{ position:'absolute', bottom:-100, left:0 }} />
    </div>
  )
}
