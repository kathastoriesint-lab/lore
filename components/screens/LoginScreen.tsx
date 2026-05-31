'use client'
import { useCallback, useState } from 'react'
import { useApp } from '@/lib/context'
import { sendOTP } from '@/lib/game'

export default function LoginScreen() {
  const { navigate, setPendingEmail, showToast } = useApp()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = useCallback(async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await sendOTP(trimmed)
      setPendingEmail(trimmed)
      navigate('otp')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('rate') || msg.includes('429')) {
        setError('Too many attempts. Please wait a few minutes.')
      } else {
        setError('Something went wrong. Please try again.')
      }
      showToast('Could not send code — try again')
    } finally {
      setLoading(false)
    }
  }, [email, navigate, setPendingEmail, showToast])

  return (
    <div className="login-screen">
      {/* Glow behind logo */}
      <div className="login-glow" />

      {/* Animated Lore logo — centered */}
      <div className="login-logo-wrap">
        <div className="login-mark">
          <svg viewBox="0 0 88 88" fill="none" width="88" height="88">
            <defs>
              <linearGradient id="llg1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ff2d78"/>
                <stop offset=".5" stopColor="#ff8a3d"/>
                <stop offset="1" stopColor="#ffd24d"/>
              </linearGradient>
              <linearGradient id="llg2" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffd24d"/>
                <stop offset=".5" stopColor="#ff2d78" stopOpacity=".45"/>
                <stop offset="1" stopColor="#ff2d78" stopOpacity=".1"/>
              </linearGradient>
            </defs>
            {/* Outer ring — spins forward */}
            <circle className="login-ring-outer" cx="44" cy="44" r="40"
              stroke="url(#llg1)" strokeWidth="3.5"
              strokeDasharray="60 20 30 15 45 20" strokeLinecap="round"
              fill="none"/>
            {/* Middle ring — counter-spins */}
            <circle className="login-ring-mid" cx="44" cy="44" r="30"
              stroke="url(#llg2)" strokeWidth="2"
              strokeDasharray="35 10 20 8" strokeLinecap="round"
              fill="none" opacity=".65"/>
            {/* Inner ring — static */}
            <circle cx="44" cy="44" r="18" stroke="#ff2d78" strokeWidth="2.2" fill="none"/>
            {/* Center dot — pulses */}
            <circle className="login-ring-dot" cx="44" cy="44" r="5.5" fill="#ffd24d"/>
          </svg>
        </div>
        <div className="login-wordmark">Lore</div>
        <div className="login-tagline">
          Some stories you watch.<br />Some you live.
        </div>
      </div>

      {/* Bottom-anchored form */}
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
        <button
          className="login-cta"
          onClick={handleSubmit}
          disabled={loading || !email.trim()}
        >
          {loading ? 'Sending code…' : 'Continue →'}
        </button>
        <div className="login-hint">We'll send a 6-digit code. No password needed.</div>
      </div>
    </div>
  )
}
