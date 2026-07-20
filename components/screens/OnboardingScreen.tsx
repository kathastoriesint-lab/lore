'use client'
import { useState, useCallback, useEffect } from 'react'
import { useApp } from '@/lib/context'
import * as haptics from '@/lib/haptics'
import * as sound from '@/lib/sound'
import { getLang, setLang, type AppLang } from '@/lib/lang'
import { initContent } from '@/lib/content'

// First-run identity. Cinematic ambient hero loop (same treatment as Login) +
// a warm form: name + gender, fixed CTA. saveProfile handles all navigation
// (resumes a pending world, or lands on Worlds). Redesign per the Android handoff.

// Reuse the Login ambient stills — cross-faded as a slow backdrop. (Web-light JPEGs.)
const HERO_FRAMES = ['/login-hero-1.jpg', '/login-hero-3.jpg', '/login-hero-2.jpg']
const HERO_INTERVAL = 4500

const eyebrow: React.CSSProperties = {
  fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: 'var(--ink3)',
}

export default function OnboardingScreen() {
  const { saveProfile } = useApp()
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [lang, setLangState] = useState<AppLang>(() => getLang())
  const pickLang = useCallback((l: AppLang) => {
    setLangState(l)
    setLang(l)
    // Re-run the content init so the chosen language's bundles are live before
    // the first world entry (initContent is idempotent + cheap for bundled en).
    initContent().catch(() => {})
  }, [])
  const [saving, setSaving] = useState(false)
  const [heroIdx, setHeroIdx] = useState(0)

  // Ambient hero cross-fade (paused for users who prefer reduced motion).
  useEffect(() => {
    if (HERO_FRAMES.length < 2) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_FRAMES.length), HERO_INTERVAL)
    return () => clearInterval(t)
  }, [])

  const handleSave = useCallback(async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    haptics.success(); sound.confirm() // identity confirmed
    try {
      await saveProfile(name.trim(), gender, undefined)
    } finally {
      setSaving(false)
    }
  }, [name, gender, saving, saveProfile])

  const ready = !!name.trim()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)', fontFamily: 'var(--sans)' }}>

      {/* scrollable body */}
      <div className="scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* ===== HERO — ambient cross-fade loop (same as Login) ===== */}
        <div style={{ position: 'relative', height: 268, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px', overflow: 'hidden' }}>
          {HERO_FRAMES.map((src, i) => (
            <img
              key={src} src={src} alt="" aria-hidden="true"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                opacity: i === heroIdx ? 0.62 : 0,
                transform: i === heroIdx ? 'scale(1.06)' : 'scale(1)',
                transition: 'opacity 1.4s ease, transform 5s ease',
              }}
            />
          ))}
          <div style={{ position: 'absolute', inset: 0, background: 'var(--grain)', opacity: 0.4, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,15,.5), rgba(8,8,15,.2) 38%, var(--bg))' }} />

          {/* orbit mark */}
          <div style={{ position: 'relative', width: 54, height: 54, marginBottom: 14, filter: 'drop-shadow(0 0 20px rgba(255,45,120,.55))' }}>
            <svg viewBox="0 0 32 32" fill="none" width={54} height={54}>
              <defs><linearGradient id="onbMark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff2d78" /><stop offset=".55" stopColor="#ff8a3d" /><stop offset="1" stopColor="#ffd24d" /></linearGradient></defs>
              <circle cx="16" cy="16" r="13.5" stroke="url(#onbMark)" strokeWidth="3" strokeDasharray="58 12" strokeLinecap="round" style={{ transformOrigin: 'center', animation: 'loreSpin 14s linear infinite' }} />
              <circle cx="16" cy="16" r="6.4" stroke="#ff2d78" strokeWidth="2.4" />
              <circle cx="16" cy="16" r="1.9" fill="#ffd24d" />
            </svg>
          </div>
          <div style={{ position: 'relative', fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 32, color: '#fff', letterSpacing: '.5px' }}>Welcome to Weev</div>
          <div style={{ position: 'relative', fontSize: 14.5, color: 'var(--ink2)', marginTop: 6, lineHeight: 1.45 }}>Live in any world you want.</div>
        </div>

        {/* ===== FORM — centred in the space between hero and CTA ===== */}
        <div style={{ padding: '26px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ ...eyebrow, marginBottom: 10 }}>YOUR NAME</div>
          <input
            value={name}
            onChange={e => setName(e.target.value.slice(0, 24))}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            placeholder="Enter your name"
            autoFocus
            style={{
              width: '100%', height: 56, boxSizing: 'border-box', padding: '0 18px',
              background: 'var(--surf)', border: '1px solid var(--accent)', borderRadius: 14,
              color: '#fff', fontSize: 17, fontFamily: 'var(--sans)', outline: 'none', caretColor: 'var(--accent)',
            }}
          />
          <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 9 }}>This is how characters will address you in the story.</div>

          <div style={{ ...eyebrow, margin: '24px 0 10px' }}>STORY LANGUAGE</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {([['hi', 'Hinglish', 'देसी वाला मज़ा'], ['en', 'English', 'For everyone']] as const).map(([id, label, sub]) => {
              const on = lang === id
              return (
                <button
                  key={id}
                  className="lo-press"
                  onClick={() => pickLang(id)}
                  style={{
                    flex: 1, height: 58, borderRadius: 12, cursor: 'pointer',
                    fontFamily: 'var(--sans)', fontSize: 14, fontWeight: on ? 700 : 600,
                    color: on ? '#fff' : 'var(--ink2)',
                    background: on ? 'rgba(255,45,120,.12)' : 'var(--surf)',
                    border: `1px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                    transition: 'all .15s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                  }}
                >
                  <span>{label}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 500, color: on ? 'var(--ink2)' : 'var(--ink3)' }}>{sub}</span>
                </button>
              )
            })}
          </div>

          <div style={{ ...eyebrow, margin: '24px 0 10px' }}>YOU ARE</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {([['male', 'Male'], ['female', 'Female']] as const).map(([id, label]) => {
              const on = gender === id
              return (
                <button
                  key={id}
                  className="lo-press"
                  onClick={() => setGender(id)}
                  style={{
                    flex: 1, height: 50, borderRadius: 12, cursor: 'pointer',
                    fontFamily: 'var(--sans)', fontSize: 14, fontWeight: on ? 700 : 600,
                    color: on ? '#fff' : 'var(--ink2)',
                    background: on ? 'rgba(255,45,120,.12)' : 'var(--surf)',
                    border: `1px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                    transition: 'all .15s',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== fixed CTA ===== */}
      <div style={{ flex: 'none', padding: '14px 24px 28px' }}>
        <button
          className="lo-press"
          onClick={handleSave}
          disabled={!ready || saving}
          style={{
            width: '100%', height: 54, border: 'none', borderRadius: 14,
            background: 'var(--accent)', color: '#fff',
            fontWeight: 700, fontSize: 16, fontFamily: 'var(--sans)',
            boxShadow: ready ? 'var(--sh-cta, 0 8px 24px rgba(255,45,120,.35))' : 'none',
            cursor: ready && !saving ? 'pointer' : 'default',
            opacity: ready && !saving ? 1 : 0.45,
            transition: 'opacity .2s',
          }}
        >
          {saving ? 'Saving…' : 'Choose your world →'}
        </button>
      </div>
    </div>
  )
}
