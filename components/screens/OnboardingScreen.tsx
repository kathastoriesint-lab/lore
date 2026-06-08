'use client'
import { useState, useCallback } from 'react'
import { useApp } from '@/lib/context'

export default function OnboardingScreen() {
  const { saveProfile } = useApp()
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [saving, setSaving] = useState(false)

  const handleSave = useCallback(async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      await saveProfile(name.trim(), gender, undefined)
    } finally {
      setSaving(false)
    }
  }, [name, gender, saving, saveProfile])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg)', padding: '0 28px',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, marginBottom: 48 }}>
        <svg viewBox="0 0 32 32" fill="none" width="40" height="40" style={{ filter: 'drop-shadow(0 0 10px rgba(255,45,120,.5))' }}>
          <defs>
            <linearGradient id="onbG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff2d78"/>
              <stop offset=".55" stopColor="#ff8a3d"/>
              <stop offset="1" stopColor="#ffd24d"/>
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="13.5" stroke="url(#onbG)" strokeWidth="3" strokeDasharray="58 12" strokeLinecap="round"/>
          <circle cx="16" cy="16" r="6.4" stroke="#ff2d78" strokeWidth="2.4"/>
          <circle cx="16" cy="16" r="1.9" fill="#ffd24d"/>
        </svg>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600, marginTop: 12, letterSpacing: '-.01em' }}>
          Lore
        </div>
      </div>

      {/* Name */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', marginBottom: 14 }}>
          YOUR NAME
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value.slice(0, 24))}
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          placeholder="Enter your name"
          autoFocus
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'transparent', border: 'none', outline: 'none',
            borderBottom: `1.5px solid ${name ? 'var(--accent)' : 'rgba(255,255,255,.18)'}`,
            paddingBottom: 10, color: '#fff', fontSize: 26,
            fontFamily: 'var(--serif)', fontWeight: 500, caretColor: 'var(--accent)',
            transition: 'border-color .2s',
          }}
        />
      </div>

      {/* Gender */}
      <div style={{ marginBottom: 40 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', marginBottom: 14 }}>
          YOUR ROLE
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['male', 'female'] as const).map(g => (
            <button
              key={g}
              onClick={() => setGender(g)}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 14,
                fontWeight: 700, fontSize: 14, fontFamily: 'var(--sans)',
                background: gender === g ? 'rgba(255,45,120,.15)' : 'rgba(255,255,255,.06)',
                border: `1.5px solid ${gender === g ? 'var(--accent)' : 'rgba(255,255,255,.14)'}`,
                color: gender === g ? 'var(--accent)' : 'var(--ink2)',
                transition: 'all .2s', cursor: 'pointer',
              }}
            >
              {g === 'male' ? 'He / Him' : 'She / Her'}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleSave}
        disabled={!name.trim() || saving}
        style={{
          width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
          background: name.trim() ? 'var(--accent)' : 'rgba(255,45,120,.22)',
          color: name.trim() ? '#fff' : 'rgba(255,255,255,.35)',
          fontWeight: 700, fontSize: 16, fontFamily: 'var(--sans)',
          transition: 'all .2s', cursor: name.trim() ? 'pointer' : 'default',
          boxShadow: name.trim() ? '0 8px 24px rgba(255,45,120,.35)' : 'none',
        }}
      >
        {saving ? 'Saving...' : 'Start →'}
      </button>
    </div>
  )
}
