'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'

export default function WorldIntroScreen() {
  const { startGame } = useApp()

  const [lines, setLines] = useState([false, false, false])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const t = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }

  useEffect(() => {
    t(300,  () => setLines(p => { const n=[...p]; n[0]=true; return n }))
    t(1100, () => setLines(p => { const n=[...p]; n[1]=true; return n }))
    t(2200, () => setLines(p => { const n=[...p]; n[2]=true; return n }))
    t(3400, () => setShowForm(true))
    return () => { timers.current.forEach(clearTimeout) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus input once form appears
  useEffect(() => {
    if (showForm) setTimeout(() => inputRef.current?.focus(), 100)
  }, [showForm])

  const handleStart = useCallback(() => {
    if (!name.trim() || submitting) return
    setSubmitting(true)
    startGame(name.trim(), gender)
    // startGame is synchronous — reset so button works if user navigates back
    setTimeout(() => setSubmitting(false), 2000)
  }, [name, gender, submitting, startGame])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleStart()
  }, [handleStart])

  const skipToForm = useCallback(() => {
    timers.current.forEach(clearTimeout)
    setLines([true, true, true])
    setShowForm(true)
  }, [])

  return (
    <div className="wintro-screen">
      <div className="wintro-cover" />

      <button className="wintro-skip" onClick={skipToForm}>Skip →</button>

      <div className="wintro-live">
        <span className="pulse" />
        LIVE · DAY 1 OF 10
      </div>

      <div className="wintro-body">
        {/* World intro lines */}
        <div className="wintro-intro-block">
          <div className={`wintro-tl${lines[0] ? ' in' : ''}`}>
            Creator<br />House.
          </div>
          <div className={`wintro-sub${lines[1] ? ' in' : ''}`}>
            6 creators. Ek villa. 10 din.
          </div>
          <div className={`wintro-hook${lines[2] ? ' in' : ''}`}>
            Tum sabse naye ho. Koi tumhe nahi jaanta — abhi.
          </div>
        </div>

        {/* Name + gender form */}
        {showForm && (
          <div
            className="wintro-cta-block"
            style={{ marginTop: 32, opacity: 1, animation: 'fadeUp .4s ease-out' }}
          >
            {/* Name — underline style, feels like signing into a story */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.55)', marginBottom: 12 }}>
                APNA NAAM BATAO
              </label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tumhara naam..."
                maxLength={24}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${name ? 'var(--accent)' : 'rgba(255,255,255,.22)'}`,
                  borderRadius: 0,
                  padding: '6px 0',
                  color: '#fff',
                  fontSize: 22,
                  fontFamily: 'var(--serif)',
                  fontWeight: 500,
                  caretColor: 'var(--accent)',
                  outline: 'none',
                  transition: 'border-color .2s ease',
                }}
              />
            </div>

            {/* Gender */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.55)', marginBottom: 4 }}>
                TUM HO
              </label>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginBottom: 12 }}>
                Yeh batata hai kaun tumhare paas aata hai ghar mein.
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
                      border: `1.5px solid ${gender === g ? 'var(--accent)' : 'rgba(255,255,255,.12)'}`,
                      color: gender === g ? 'var(--accent)' : 'rgba(255,255,255,.45)',
                      transition: 'all .2s ease',
                    }}
                  >
                    {g === 'male' ? 'He / Him' : 'She / Her'}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              className="wintro-btn-main"
              onClick={handleStart}
              disabled={!name.trim() || submitting}
              style={{ opacity: name.trim() && !submitting ? 1 : 0.4 }}
            >
              {submitting ? 'Loading...' : 'Enter the House →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
