'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { verifyEmailOTP, sendEmailOTP, loadGameState } from '@/lib/game'

export default function OTPScreen() {
  const ctx = useApp()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(60)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300)
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0 }
        return c - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const handleVerify = useCallback(async () => {
    if (otp.length < 6 || loading || !ctx.phone) return
    setLoading(true)
    setError('')
    try {
      await verifyEmailOTP(ctx.phone, otp)
      const state = await loadGameState()
      ctx.navigate(state.playerName ? 'worlds' : 'onboarding')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Wrong code. Try again.')
    } finally {
      setLoading(false)
    }
  }, [otp, loading, ctx])

  const handleResend = useCallback(async () => {
    if (countdown > 0 || !ctx.phone) return
    try {
      await sendEmailOTP(ctx.phone)
      setCountdown(60)
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) { clearInterval(timerRef.current!); return 0 }
          return c - 1
        })
      }, 1000)
    } catch { /* ignore */ }
  }, [countdown, ctx.phone])

  const masked = ctx.phone
    ? ctx.phone.replace(/(.{2}).+(@.+)/, '$1•••$2')
    : ''

  const ready = otp.length >= 6 && !loading

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg)', padding: '0 28px',
      justifyContent: 'center',
    }}>
      <button
        onClick={() => ctx.navigate('phone')}
        style={{ position: 'absolute', top: 56, left: 20, fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}
      >
        ← Back
      </button>

      <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
        Check your email
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 44 }}>
        We sent a 6-digit code to {masked}
      </div>

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={otp}
        onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 8)); setError('') }}
        onKeyDown={e => { if (e.key === 'Enter') handleVerify() }}
        placeholder="——————"
        style={{
          width: '100%', background: 'transparent', border: 'none', outline: 'none',
          borderBottom: `1.5px solid ${otp.length >= 6 ? 'var(--accent)' : 'rgba(255,255,255,.2)'}`,
          paddingBottom: 10, marginBottom: 10,
          fontSize: 36, fontFamily: 'var(--sans)', fontWeight: 600,
          color: '#fff', caretColor: 'var(--accent)',
          letterSpacing: '0.35em', textAlign: 'center',
          transition: 'border-color .2s',
        }}
      />

      {error && (
        <div style={{ fontSize: 13, color: '#FF5C3A', textAlign: 'center', marginBottom: 8 }}>{error}</div>
      )}

      <div style={{ height: 32 }} />

      <button
        onClick={handleVerify}
        disabled={!ready}
        style={{
          width: '100%', padding: '16px 0', borderRadius: 16,
          background: ready ? 'var(--accent)' : 'rgba(255,45,120,.25)',
          color: ready ? '#fff' : 'rgba(255,255,255,.4)',
          fontWeight: 700, fontSize: 16, fontFamily: 'var(--sans)',
          transition: 'all .2s',
        }}
      >
        {loading ? 'Verifying...' : 'Verify →'}
      </button>

      <button
        onClick={handleResend}
        disabled={countdown > 0}
        style={{
          marginTop: 20, fontSize: 13, fontWeight: 600,
          color: countdown > 0 ? 'rgba(255,255,255,.3)' : 'var(--accent)',
          transition: 'color .2s',
        }}
      >
        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
      </button>
    </div>
  )
}
