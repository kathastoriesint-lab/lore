'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import { verifyOTP } from '@/lib/game'

export default function OTPScreen() {
  const { navigate, pendingEmail } = useApp()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(600)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  const verify = useCallback(async (code: string) => {
    if (!pendingEmail || loading) return
    setLoading(true); setError('')
    try {
      await verifyOTP(pendingEmail, code)
      navigate('worlds', { replace: true })
    } catch {
      setError('Wrong or expired code. Try again.')
      setOtp('')
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }, [pendingEmail, loading, navigate])

  const handleChange = useCallback((val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 6)
    setOtp(digits); setError('')
    if (digits.length === 6) verify(digits)
  }, [verify])

  const boxes = Array.from({ length: 6 }, (_, i) => ({
    digit: otp[i] ?? '',
    active: otp.length === i && !loading,
    filled: i < otp.length,
  }))

  return (
    <div className="otp-screen">
      <button className="otp-back" onClick={() => navigate('login', { replace: true })}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        Back
      </button>
      <div className="otp-icon">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#FF2D78" strokeWidth="1.8" strokeLinecap="round">
          <rect x="2" y="4" width="20" height="16" rx="3"/>
          <path d="M2 8l8.5 5.5a3 3 0 0 0 3 0L22 8"/>
        </svg>
      </div>
      <div className="otp-title">Check your email</div>
      <div className="otp-sub">Code sent to<br/><span className="otp-email">{pendingEmail || 'your email'}</span></div>
      <div className="otp-boxes-wrap" onClick={() => inputRef.current?.focus()}>
        <input ref={inputRef} className="otp-hidden-input" type="text" inputMode="numeric"
          autoComplete="one-time-code" maxLength={6} value={otp}
          onChange={e => handleChange(e.target.value)} disabled={loading}/>
        <div className="otp-boxes">
          {boxes.map((b, i) => (
            <div key={i} className={`otp-box${b.active ? ' active' : ''}${b.filled ? ' filled' : ''}`}>
              {loading && b.filled ? '·' : b.digit}
            </div>
          ))}
        </div>
      </div>
      {error && <div className="otp-error">{error}</div>}
      <div className="otp-timer">
        {seconds > 0
          ? `Expires in ${mins}:${secs}`
          : <button className="otp-resend-btn" onClick={() => navigate('login', { replace: true })}>Resend code</button>
        }
      </div>
      <div className="otp-spacer"/>
      <div className="otp-verify-hint">{loading ? 'Verifying…' : 'Enter all 6 digits'}</div>
      <button className="login-cta" onClick={() => verify(otp)} disabled={otp.length < 6 || loading}>
        {loading ? 'Verifying…' : 'Verify →'}
      </button>
    </div>
  )
}
