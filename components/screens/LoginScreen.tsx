'use client'
import { useCallback, useState } from 'react'
import { useApp } from '@/lib/context'
import { sendOTP } from '@/lib/game'

export default function LoginScreen() {
  const { navigate, setPendingEmail } = useApp()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = useCallback(async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await sendOTP(trimmed)
      setPendingEmail(trimmed)
      navigate('otp')
    } catch {
      setError('Could not send code. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [email, navigate, setPendingEmail])

  return (
    <div className="login-screen">
      <div className="login-glow" />
      <div className="login-logo-wrap">
        <svg viewBox="0 0 88 88" fill="none" width="80" height="80" className="login-mark">
          <defs>
            <linearGradient id="llg1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff2d78"/>
              <stop offset=".5" stopColor="#ff8a3d"/>
              <stop offset="1" stopColor="#ffd24d"/>
            </linearGradient>
          </defs>
          <circle cx="44" cy="44" r="40" stroke="url(#llg1)" strokeWidth="3.5"
            strokeDasharray="60 20 30 15 45 20" strokeLinecap="round" fill="none"
            className="login-ring-outer"/>
          <circle cx="44" cy="44" r="30" stroke="#ff2d78" strokeWidth="2"
            strokeDasharray="35 10 20 8" strokeLinecap="round" fill="none" opacity=".5"
            className="login-ring-mid"/>
          <circle cx="44" cy="44" r="18" stroke="#ff2d78" strokeWidth="2.2" fill="none"/>
          <circle cx="44" cy="44" r="5.5" fill="#ffd24d" className="login-ring-dot"/>
        </svg>
        <div className="login-wordmark">Lore</div>
        <div className="login-tagline">Enter the world.<br />Shape what happens.</div>
      </div>
      <div className="login-form">
        <div className="login-form-lbl">Your email</div>
        <input
          className="login-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
        />
        {error && <div className="login-error">{error}</div>}
        <button className="login-cta" onClick={handleSubmit} disabled={loading || !email.trim()}>
          {loading ? 'Sending code…' : 'Continue →'}
        </button>
        <div className="login-hint">
          Your progress saves to your account — play on any device.
        </div>
      </div>
    </div>
  )
}
