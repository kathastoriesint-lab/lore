'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { sendEmailOTP } from '@/lib/game'

export default function PhoneScreen() {
  const { navigate, setPhone } = useApp()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handleSubmit = useCallback(async () => {
    if (!isValidEmail(email) || loading) return
    setLoading(true)
    setError('')
    try {
      await sendEmailOTP(email)
      setPhone(email)
      navigate('otp')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }, [email, loading, navigate, setPhone])

  const ready = isValidEmail(email) && !loading

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg)', padding: '0 28px',
      justifyContent: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 600,
        color: '#fff', letterSpacing: '-.01em', marginBottom: 8,
      }}>
        Lore
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 52 }}>
        India's biggest interactive story platform
      </div>

      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>
        YOUR EMAIL
      </label>
      <input
        ref={inputRef}
        type="email"
        inputMode="email"
        value={email}
        onChange={e => { setEmail(e.target.value); setError('') }}
        onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
        placeholder="you@example.com"
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'transparent', border: 'none', outline: 'none',
          borderBottom: `1.5px solid ${isValidEmail(email) ? 'var(--accent)' : 'rgba(255,255,255,.2)'}`,
          paddingBottom: 10, marginBottom: 10,
          fontSize: 20, fontFamily: 'var(--sans)', fontWeight: 500,
          color: '#fff', caretColor: 'var(--accent)',
          transition: 'border-color .2s',
        }}
      />

      {error && (
        <div style={{ fontSize: 13, color: '#FF5C3A', marginBottom: 8 }}>{error}</div>
      )}

      <div style={{ height: 32 }} />

      <button
        onClick={handleSubmit}
        disabled={!ready}
        style={{
          width: '100%', padding: '16px 0', borderRadius: 16,
          background: ready ? 'var(--accent)' : 'rgba(255,45,120,.25)',
          color: ready ? '#fff' : 'rgba(255,255,255,.4)',
          fontWeight: 700, fontSize: 16, fontFamily: 'var(--sans)',
          transition: 'all .2s',
        }}
      >
        {loading ? 'Sending code...' : 'Send Code →'}
      </button>

      <div style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,.3)', textAlign: 'center', lineHeight: 1.6 }}>
        By continuing, you agree to our Terms and Privacy Policy
      </div>
    </div>
  )
}
