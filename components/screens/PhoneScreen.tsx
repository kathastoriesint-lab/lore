'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { sendPhoneOTP } from '@/lib/game'

export default function PhoneScreen() {
  const { navigate, setPhone } = useApp()
  const [digits, setDigits] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const handleSubmit = useCallback(async () => {
    const phone = `+91${digits}`
    if (digits.length !== 10 || loading) return
    setLoading(true)
    setError('')
    try {
      await sendPhoneOTP(phone)
      setPhone(phone)
      navigate('otp')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [digits, loading, navigate, setPhone])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setDigits(val)
    setError('')
  }, [])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }, [handleSubmit])

  const ready = digits.length === 10 && !loading

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg)', padding: '0 28px',
      justifyContent: 'center',
    }}>
      {/* Wordmark */}
      <div style={{
        fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 600,
        color: '#fff', letterSpacing: '-.01em', marginBottom: 8,
      }}>
        Lore
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 52 }}>
        India ka sabse bada interactive story platform
      </div>

      {/* Phone input */}
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>
        APNA NUMBER BATAO
      </label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1.5px solid ${digits.length === 10 ? 'var(--accent)' : 'rgba(255,255,255,.2)'}`,
        paddingBottom: 10, marginBottom: 10,
        transition: 'border-color .2s',
      }}>
        <span style={{ fontSize: 20, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--sans)', fontWeight: 500, flexShrink: 0 }}>+91</span>
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          value={digits}
          onChange={handleChange}
          onKeyDown={handleKey}
          placeholder="9876543210"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 24, fontFamily: 'var(--sans)', fontWeight: 500,
            color: '#fff', caretColor: 'var(--accent)', letterSpacing: '.05em',
          }}
        />
      </div>

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
        {loading ? 'Bhej raha hoon...' : 'OTP Bhejo →'}
      </button>

      <div style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,.3)', textAlign: 'center', lineHeight: 1.6 }}>
        Continue karke aap hamare Terms aur Privacy Policy se agree karte ho
      </div>
    </div>
  )
}
