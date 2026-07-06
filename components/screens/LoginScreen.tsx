'use client'
import { useState, useEffect, useRef, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react'
import { useApp } from '@/lib/context'
import { completeMsg91Login, completeDemoLogin, DEMO_PHONE_DIGITS, DEMO_OTP, sendEmailOtp, verifyEmailOtp } from '@/lib/auth'

// Phone login via the MSG91 OTP Widget (sends + verifies the OTP, returns a JWT
// that completeMsg91Login exchanges for a Supabase session) OR email login via
// Supabase's native email OTP. On success we full-reload as the signed-in user.
//
// UI redesign (Indian Android handoff): cinematic hero + bottom-sheet form.

declare global {
  interface Window {
    initSendOTP?: (config: Record<string, unknown>) => void
    sendOtp?: (identifier: string, success: (d: unknown) => void, failure: (e: unknown) => void) => void
    verifyOtp?: (otp: string, success: (d: unknown) => void, failure: (e: unknown) => void) => void
    retryOtp?: (channel: string | null, success: (d: unknown) => void, failure: (e: unknown) => void) => void
  }
}

// MSG91 widget id + client token are PUBLIC by design (embedded in the browser
// widget). Committed as defaults; override via env. (Server authkey is NOT here.)
const WIDGET_ID = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || '366671733063373330303731'
const TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || '533925TdinOE5GXgE6a32ef1cP1'
// Phone OTP length MUST match the MSG91 widget config (4). Supabase email OTP is 6.
const OTP_LENGTH = Number(process.env.NEXT_PUBLIC_MSG91_OTP_LENGTH) || 4
const EMAIL_OTP_LENGTH = 6
const RESEND_SECS = 24

// Cinematic hero loop — cricket (Indian Dressing Room) stills, cross-faded as a
// slow ambient backdrop. Web-light JPEGs (~100-150KB each). To add/replace frames,
// drop JPEGs in /public and list them here.
const HERO_FRAMES = ['/login-hero-1.jpg', '/login-hero-3.jpg', '/login-hero-2.jpg']
const HERO_INTERVAL = 5500

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

type Step = 'phone' | 'otp' | 'email' | 'email-otp'

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

// MSG91 hands its failure callbacks an OBJECT ({message,type,...}), not a string;
// pull the real message out so the reason is visible in the UI.
function errText(e: unknown, fallback: string): string {
  if (typeof e === 'string') return e || fallback
  const o = (e ?? {}) as Record<string, unknown>
  const data = (o.data ?? {}) as Record<string, unknown>
  const m = o.message ?? o.msg ?? o.error ?? data.message
  return typeof m === 'string' && m.trim() ? m : fallback
}

export default function LoginScreen() {
  const { navigate, game } = useApp()
  const [step, setStep] = useState<Step>('phone')
  const [num, setNum] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [methodOpen, setMethodOpen] = useState(false)
  const [resendIn, setResendIn] = useState(RESEND_SECS)
  const [heroIdx, setHeroIdx] = useState(0)
  const ready = useRef(false)
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])
  const resendTimer = useRef<ReturnType<typeof setInterval> | null>(null)

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
    return () => { alive = false; if (resendTimer.current) clearInterval(resendTimer.current) }
  }, [])

  // Ambient hero cross-fade (paused for users who prefer reduced motion).
  useEffect(() => {
    if (HERO_FRAMES.length < 2) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_FRAMES.length), HERO_INTERVAL)
    return () => clearInterval(t)
  }, [])

  const digits = num.replace(/\D/g, '')
  const phone = `+91${digits}`
  const phoneValid = digits.length === 10
  const phoneDisplay = `+91 ${digits ? digits.replace(/(\d{5})(\d{0,5})/, '$1 $2').trim() : '98765 43210'}`
  const emailValid = EMAIL_RE.test(email.trim())
  const isEmailOtp = step === 'email-otp'
  const otpLen = isEmailOtp ? EMAIL_OTP_LENGTH : OTP_LENGTH

  // ── OTP boxes (uncontrolled — managed via refs, shared by phone + email) ──
  const otpValue = () => otpRefs.current.map(r => r?.value || '').join('')
  const clearOtp = () => otpRefs.current.forEach(r => { if (r) r.value = '' })

  function startResend() {
    if (resendTimer.current) clearInterval(resendTimer.current)
    setResendIn(RESEND_SECS)
    resendTimer.current = setInterval(() => {
      setResendIn(s => {
        if (s <= 1) { if (resendTimer.current) clearInterval(resendTimer.current); return 0 }
        return s - 1
      })
    }, 1000)
  }

  // ── Phone (MSG91) ──
  const isDemoPhone = digits === DEMO_PHONE_DIGITS
  function send() {
    if (!phoneValid || busy) return
    // Play-review demo number: skip MSG91, go straight to the code step.
    if (isDemoPhone) { setErr(null); setStep('otp'); clearOtp(); startResend(); setTimeout(() => otpRefs.current[0]?.focus(), 60); return }
    if (!ready.current || !window.sendOtp) { setErr('Still loading — try again in a second.'); return }
    setBusy(true); setErr(null)
    window.sendOtp(
      phone.replace('+', ''),
      () => { setBusy(false); setStep('otp'); clearOtp(); startResend(); setTimeout(() => otpRefs.current[0]?.focus(), 60) },
      (e) => { setBusy(false); setErr(errText(e, 'Couldn’t send the code. Try again.')) },
    )
  }
  function verify(codeArg?: string) {
    const c = (codeArg ?? otpValue()).replace(/\D/g, '')
    if (c.length < OTP_LENGTH || busy) return
    // Play-review demo login: fixed code → enter the app as a guest (the anon
    // session already backs saves; the boot gate treats guests as "not logged
    // in", so we navigate in rather than reload — same as "Continue as guest").
    if (isDemoPhone) {
      if (c !== DEMO_OTP) { setErr('That code didn’t work — re-check or resend.'); return }
      setBusy(true); setErr(null)
      completeDemoLogin().then(() => { setBusy(false); navigate(game.playerName ? 'worlds' : 'onboarding') })
      return
    }
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

  // ── Email (Supabase native OTP) ──
  async function sendEmail() {
    if (!emailValid || busy) return
    setBusy(true); setErr(null)
    const r = await sendEmailOtp(email)
    setBusy(false)
    if ('error' in r) { setErr(r.error); return }
    setStep('email-otp'); clearOtp(); startResend(); setTimeout(() => otpRefs.current[0]?.focus(), 60)
  }
  async function verifyEmail(codeArg?: string) {
    const c = (codeArg ?? otpValue()).replace(/\D/g, '')
    if (c.length < EMAIL_OTP_LENGTH || busy) return
    setBusy(true); setErr(null)
    const r = await verifyEmailOtp(email, c)
    if ('error' in r) { setBusy(false); setErr(r.error); clearOtp(); otpRefs.current[0]?.focus(); return }
    if (typeof window !== 'undefined') window.location.reload()
  }

  function resend() {
    if (busy || resendIn > 0) return
    setErr(null); clearOtp(); otpRefs.current[0]?.focus()
    if (isEmailOtp) {
      sendEmailOtp(email).then(r => { if ('error' in r) setErr(r.error); else startResend() })
    } else {
      if (!window.retryOtp) return
      window.retryOtp(null, () => startResend(), (e) => setErr(errText(e, 'Couldn’t resend.')))
    }
  }
  function backFromOtp() {
    if (resendTimer.current) clearInterval(resendTimer.current)
    clearOtp(); setErr(null); setStep(isEmailOtp ? 'email' : 'phone')
  }

  function onOtpInput(i: number, e: FormEvent<HTMLInputElement>) {
    const el = e.currentTarget
    el.value = el.value.replace(/\D/g, '').slice(-1)
    if (err) setErr(null)
    if (el.value && i < otpLen - 1) otpRefs.current[i + 1]?.focus()
    const full = otpValue()
    if (full.length === otpLen) (isEmailOtp ? verifyEmail(full) : verify(full))
  }
  function onOtpKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !e.currentTarget.value && i > 0) otpRefs.current[i - 1]?.focus()
  }

  function continueAsGuest() { setMethodOpen(false); navigate(game.playerName ? 'worlds' : 'onboarding') }
  function continueWithEmail() { setMethodOpen(false); setErr(null); setStep('email') }

  // ── styles ──
  const inputBase: CSSProperties = {
    height: 54, background: 'var(--surf)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-sm)', color: 'var(--ink)', fontSize: 16, fontFamily: 'var(--sans)', outline: 'none',
  }
  const headline: CSSProperties = { fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 25, color: 'var(--ink)', lineHeight: 1.2 }
  const subtext: CSSProperties = { fontSize: 14, color: 'var(--ink2)', marginTop: 8, lineHeight: 1.45 }
  const primaryBtn = (enabled: boolean): CSSProperties => ({
    width: '100%', height: 54, border: 'none', borderRadius: 'var(--r-md)', background: 'var(--accent)',
    color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'var(--sans)', boxShadow: 'var(--sh-cta)',
    cursor: enabled && !busy ? 'pointer' : 'default', opacity: enabled && !busy ? 1 : 0.45,
  })
  const secondaryBtn: CSSProperties = {
    width: '100%', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    background: 'rgba(255,255,255,.08)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)',
    color: 'var(--ink)', fontWeight: 600, fontSize: 15, fontFamily: 'var(--sans)', cursor: 'pointer',
  }
  const linkBtn: CSSProperties = { background: 'none', border: 'none', color: 'var(--ink2)', fontSize: 14, fontFamily: 'var(--sans)', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer', alignSelf: 'center', marginTop: 20, padding: 8 }
  const errLine = err ? <div style={{ color: 'var(--heat)', fontSize: 12.5, marginTop: 12, textAlign: 'center' }}>{err}</div> : null
  const trustLine = (
    <>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center', color: 'var(--ink3)', fontSize: 12, marginTop: 18 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        Only used to save your game. No spam, ever.
      </div>
    </>
  )

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', background: 'var(--bg)', overflow: 'hidden', fontFamily: 'var(--sans)', display: 'flex', flexDirection: 'column' }}>

      {/* ===== HERO ===== */}
      <div style={{ position: 'relative', height: 382, flex: 'none' }}>
        {HERO_FRAMES.map((src, i) => (
          <img key={src} src={src} alt="" aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: i === heroIdx ? 1 : 0, transition: 'opacity 1.2s ease-in-out' }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'var(--grain)', opacity: 0.4, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,15,.35) 0%, rgba(8,8,15,0) 30%, rgba(8,8,15,.55) 72%, var(--bg) 100%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 54, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, filter: 'drop-shadow(0 0 22px rgba(255,45,120,.55))', marginBottom: 14 }}>
            <svg viewBox="0 0 32 32" fill="none" width={56} height={56}>
              <defs><linearGradient id="loreMarkLogin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff2d78" /><stop offset=".55" stopColor="#ff8a3d" /><stop offset="1" stopColor="#ffd24d" /></linearGradient></defs>
              <circle cx="16" cy="16" r="13.5" stroke="url(#loreMarkLogin)" strokeWidth="3" strokeDasharray="58 12" strokeLinecap="round" style={{ transformOrigin: 'center', animation: 'loreSpin 14s linear infinite' }} />
              <circle cx="16" cy="16" r="6.4" stroke="#ff2d78" strokeWidth="2.4" />
              <circle cx="16" cy="16" r="1.9" fill="#ffd24d" />
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 40, color: 'var(--ink)', lineHeight: 1, letterSpacing: '.5px' }}>Weev</div>
          <div style={{ fontSize: 14, color: 'var(--ink2)', marginTop: 8, letterSpacing: '.3px' }}>Live your story</div>
        </div>
      </div>

      {/* ===== SHEET ===== */}
      <div style={{ flex: 1, marginTop: -26, background: 'var(--surf2)', borderRadius: 'var(--r-2xl) var(--r-2xl) 0 0', borderTop: '1px solid rgba(255,255,255,.06)', boxShadow: 'var(--sh-sheet)', padding: '14px 22px 26px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
        <div style={{ width: 38, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.14)', alignSelf: 'center', marginBottom: 22 }} />

        {step === 'phone' && (
          <>
            <div style={headline}>Enter your mobile number</div>
            <div style={subtext}>Continue on any phone, anytime — your story stays saved.</div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <div style={{ ...inputBase, display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', fontWeight: 600, flex: 'none' }}>
                +91
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
              <input value={num} onChange={e => setNum(e.target.value.replace(/\D/g, '').slice(0, 10))}
                inputMode="numeric" autoFocus placeholder="Enter your number" aria-label="Phone number"
                onKeyDown={e => { if (e.key === 'Enter') send() }}
                style={{ ...inputBase, flex: 1, padding: '0 16px', letterSpacing: '.5px' }} />
            </div>

            <button className="lo-press" onClick={send} disabled={!phoneValid || busy} style={{ ...primaryBtn(phoneValid), marginTop: 18 }}>
              {busy ? 'Sending…' : 'Continue'}
            </button>
            {errLine}

            <button onClick={() => setMethodOpen(true)} style={linkBtn}>Or login using another method</button>
            {trustLine}
          </>
        )}

        {step === 'email' && (
          <>
            <div style={headline}>Enter your email</div>
            <div style={subtext}>We’ll email you a code to verify it — your story stays saved.</div>

            <input value={email} onChange={e => setEmail(e.target.value)}
              type="email" inputMode="email" autoComplete="email" autoFocus placeholder="you@example.com" aria-label="Email address"
              onKeyDown={e => { if (e.key === 'Enter') sendEmail() }}
              style={{ ...inputBase, width: '100%', padding: '0 16px', marginTop: 22 }} />

            <button className="lo-press" onClick={sendEmail} disabled={!emailValid || busy} style={{ ...primaryBtn(emailValid), marginTop: 18 }}>
              {busy ? 'Sending…' : 'Continue'}
            </button>
            {errLine}

            <button onClick={() => { setErr(null); setStep('phone') }} style={linkBtn}>← Use phone number instead</button>
            {trustLine}
          </>
        )}

        {(step === 'otp' || step === 'email-otp') && (
          <>
            <div style={headline}>Enter the code</div>
            <div style={subtext}>
              Sent to <span style={{ color: 'var(--ink)' }}>{isEmailOtp ? email : phoneDisplay}</span> ·{' '}
              <span onClick={backFromOtp} style={{ color: 'var(--accent)', cursor: 'pointer' }}>Change</span>
            </div>

            <div style={{ display: 'flex', gap: otpLen > 4 ? 8 : 12, marginTop: 24 }}>
              {Array.from({ length: otpLen }).map((_, i) => (
                <input key={i} ref={el => { otpRefs.current[i] = el }}
                  onInput={e => onOtpInput(i, e)} onKeyDown={e => onOtpKey(i, e)}
                  inputMode="numeric" maxLength={1} autoFocus={i === 0} aria-label={`Code digit ${i + 1}`}
                  style={{ flex: 1, minWidth: 0, maxWidth: 66, height: 64, textAlign: 'center', background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', color: 'var(--ink)', fontSize: otpLen > 4 ? 22 : 26, fontWeight: 700, fontFamily: 'var(--sans)', outline: 'none', caretColor: 'var(--accent)' }} />
              ))}
            </div>

            <div onClick={resend} style={{ fontSize: 13, color: resendIn > 0 ? 'var(--ink3)' : 'var(--fame)', marginTop: 16, cursor: resendIn > 0 ? 'default' : 'pointer' }}>
              {resendIn > 0 ? `Auto-fills from SMS · Resend in 0:${String(resendIn).padStart(2, '0')}` : 'Didn’t get it? Resend code'}
            </div>

            <button className="lo-press" onClick={() => (isEmailOtp ? verifyEmail() : verify())} disabled={busy} style={{ ...primaryBtn(true), marginTop: 24 }}>
              {busy ? 'Verifying…' : 'Verify & continue'}
            </button>
            {errLine}
            <div style={{ flex: 1 }} />
          </>
        )}
      </div>

      {/* ===== "MORE WAYS TO CONTINUE" POPUP ===== */}
      {methodOpen && (
        <>
          <div onClick={() => setMethodOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'var(--scrim-blur)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', animation: 'loFade .2s ease both' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6, background: 'var(--surf2)', borderRadius: 'var(--r-2xl) var(--r-2xl) 0 0', borderTop: '1px solid rgba(255,255,255,.06)', boxShadow: 'var(--sh-sheet)', padding: '14px 22px 30px', animation: 'loSheetUp .28s var(--ease-out) both' }}>
            <div style={{ width: 38, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.14)', margin: '0 auto 18px' }} />
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 19, color: 'var(--ink)', textAlign: 'center' }}>More ways to continue</div>
            <div style={{ fontSize: 13, color: 'var(--ink2)', textAlign: 'center', marginTop: 6, marginBottom: 20 }}>Pick whatever’s easiest for you.</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="lo-press" onClick={continueWithEmail} style={secondaryBtn}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>
                Continue with email
              </button>
              <button className="lo-press" onClick={continueAsGuest} style={secondaryBtn}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Continue as guest
              </button>
            </div>

            <div style={{ fontSize: 11.5, color: 'var(--ink3)', textAlign: 'center', marginTop: 18, lineHeight: 1.45 }}>Guest progress saves on this phone only.</div>
          </div>
        </>
      )}
    </div>
  )
}
