'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useApp } from '@/lib/context'

export default function OnboardingScreen() {
  const { saveProfile } = useApp()
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // No auto-focus — iOS keyboard jump makes screen appear to disappear

  const handleSave = useCallback(async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      await saveProfile(name.trim(), gender)
    } finally {
      setSaving(false)
    }
  }, [name, gender, saving, saveProfile])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
  }, [handleSave])

  const ready = name.trim().length > 0 && !saving

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg)', padding: '0 28px',
      justifyContent: 'center',
    }}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
        Welcome
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 52 }}>
        Tell us once — we'll remember it.
      </div>

      {/* Name */}
      <div style={{ marginBottom: 36 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>
          YOUR NAME
        </label>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={e => setName(e.target.value.slice(0, 24))}
          onKeyDown={handleKey}
          placeholder="Your name..."
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'transparent', border: 'none', outline: 'none',
            borderBottom: `1.5px solid ${name ? 'var(--accent)' : 'rgba(255,255,255,.2)'}`,
            paddingBottom: 10,
            color: '#fff', fontSize: 24,
            fontFamily: 'var(--serif)', fontWeight: 500,
            caretColor: 'var(--accent)',
            transition: 'border-color .2s',
          }}
        />
      </div>

      {/* Gender */}
      <div style={{ marginBottom: 44 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.45)', marginBottom: 6 }}>
          YOU ARE
        </label>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 14 }}>
          This shapes who approaches you inside the story.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['male', 'female'] as const).map(g => (
            <button
              key={g}
              onClick={() => setGender(g)}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 14,
                fontWeight: 700, fontSize: 14, fontFamily: 'var(--sans)',
                background: gender === g ? 'rgba(255,45,120,.15)' : 'rgba(255,255,255,.05)',
                border: `1.5px solid ${gender === g ? 'var(--accent)' : 'rgba(255,255,255,.1)'}`,
                color: gender === g ? 'var(--accent)' : 'rgba(255,255,255,.4)',
                transition: 'all .2s',
              }}
            >
              {g === 'male' ? 'He / Him' : 'She / Her'}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!ready}
        style={{
          width: '100%', padding: '16px 0', borderRadius: 16,
          background: ready ? 'var(--accent)' : 'rgba(255,45,120,.25)',
          color: ready ? '#fff' : 'rgba(255,255,255,.4)',
          fontWeight: 700, fontSize: 16, fontFamily: 'var(--sans)',
          transition: 'all .2s',
        }}
      >
        {saving ? 'Saving...' : 'Enter Lore →'}
      </button>
    </div>
  )
}
