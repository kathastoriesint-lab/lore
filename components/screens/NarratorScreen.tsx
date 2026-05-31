'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import type { CharId } from '@/lib/types'
import { CHARS, NARR_LINES, NARR_CHARS, PLAYABLE, LOCKED } from '@/lib/data'


const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="1.8">
    <rect x="5" y="11" width="14" height="9" rx="2"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
  </svg>
)

export default function NarratorScreen() {
  const { navigate, setChar, showToast } = useApp()

  // Phase 1: animate lines in
  const totalLines = NARR_LINES.length + NARR_CHARS.length + 1 // +1 for final question
  const [visibleLines, setVisibleLines] = useState<boolean[]>(Array(totalLines).fill(false))
  const [showPicker, setShowPicker] = useState(false)
  const [selected, setSelected] = useState<CharId | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // NARR_LINES: 0,1,2 at 300ms intervals
    NARR_LINES.forEach((_, i) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => { const n = [...prev]; n[i] = true; return n })
      }, 300 + i * 300)
      timers.push(t)
    })

    // Gap after NARR_LINES, then NARR_CHARS at 520ms intervals
    const narr_base = 300 + NARR_LINES.length * 300 + 400
    NARR_CHARS.forEach((_, i) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => {
          const n = [...prev]
          n[NARR_LINES.length + i] = true
          return n
        })
      }, narr_base + i * 520)
      timers.push(t)
    })

    // Final line: "Tum kaun banna chahte ho?"
    const finalDelay = narr_base + NARR_CHARS.length * 520 + 200
    const tf = setTimeout(() => {
      setVisibleLines(prev => {
        const n = [...prev]
        n[NARR_LINES.length + NARR_CHARS.length] = true
        return n
      })
    }, finalDelay)
    timers.push(tf)

    // Show picker 700ms after final line
    const tp = setTimeout(() => {
      setShowPicker(true)
    }, finalDelay + 700)
    timers.push(tp)

    timersRef.current = timers
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSkip = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    setVisibleLines(Array(totalLines).fill(true))
    setShowPicker(true)
  }, [totalLines])

  const handleCTA = useCallback(() => {
    if (!selected) return
    setChar(selected)
    navigate('live', { replace: true })
  }, [selected, setChar, navigate])

  const selectedChar = selected ? CHARS[selected] : null

  return (
    <div className="narrator">
      {/* Lines scroll */}
      <div className="narr-scroll">
        <div className="narr-col">
          {/* NARR_LINES */}
          {NARR_LINES.map((line, i) => (
            <div key={i} className={`narr-line${visibleLines[i] ? ' in' : ''}`}>
              <div className={line.cls}>{line.text}</div>
            </div>
          ))}

          {/* Gap */}
          <div className="narr-gap" />

          {/* NARR_CHARS */}
          {NARR_CHARS.map(([charId, desc], i) => {
            const char = CHARS[charId]
            const lineIdx = NARR_LINES.length + i
            return (
              <div key={charId} className={`narr-line${visibleLines[lineIdx] ? ' in' : ''}`}>
                <div className={`narr-char ${char.cls}`}>
                  <div className="dot" />
                  <div>
                    <div className="nm">{char.name}</div>
                    <div className="ds">{desc}</div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Final question */}
          <div className={`narr-line${visibleLines[NARR_LINES.length + NARR_CHARS.length] ? ' in' : ''}`}>
            <div className="narr-final">Tum kaun banna chahte ho?</div>
          </div>
        </div>
      </div>

      {/* Skip button */}
      <button className="skip-btn" onClick={handleSkip}>Skip →</button>

      {/* Character picker sheet */}
      <div className={`picker${showPicker ? ' up' : ''}`}>
        <div className="picker-h">Choose your character</div>
        <div className="picker-sub">30 days. One shot.</div>

        {/* Playable characters */}
        {PLAYABLE.map(({ id, tag }) => {
          const char = CHARS[id]
          const isSel = selected === id
          return (
            <button
              key={id}
              className={`pchar ${char.cls}${isSel ? ' sel' : ''}`}
              onClick={() => setSelected(isSel ? null : id)}
            >
              <div className={`av ${char.cls}`} style={{ width: 40, height: 40, fontSize: 16 }}>
                {char.init}
              </div>
              <div className="info">
                <div className="nm">{char.name}</div>
                <div className="role">{char.role}</div>
                <div className="stats">
                  <span>Fame {char.fame}</span>
                  <span>Trust {char.trust}</span>
                  <span>Heat {char.heat}</span>
                </div>
                <div className="tag">{tag}</div>
              </div>
              <div className="arrow">{isSel ? '✓' : '›'}</div>
            </button>
          )
        })}

        {/* Locked characters */}
        <div className="locked-grid">
          {LOCKED.map((id) => {
            const char = CHARS[id]
            return (
              <button
                key={id}
                className={`pchar locked ${char.cls}`}
                onClick={() => showToast('Jald unlock hoga 🔥')}
              >
                <div className={`av ${char.cls}`} style={{ width: 32, height: 32, fontSize: 13 }}>
                  {char.init}
                </div>
                <div className="nm" style={{ fontSize: 13 }}>{char.name}</div>
                <div className="role" style={{ fontSize: 10 }}>{char.fame}F · {char.trust}T</div>
                <div className="locked-pill">
                  <LockIcon /> SOON
                </div>
              </button>
            )
          })}
        </div>

        {/* Bottom spacing for CTA */}
        <div style={{ height: 80 }} />
      </div>

      {/* CTA button */}
      <button
        className={`picker-cta${selected ? ' up' : ''}`}
        onClick={handleCTA}
        disabled={!selected}
      >
        {selectedChar ? `Play as ${selectedChar.name} →` : 'Choose a character'}
      </button>
    </div>
  )
}
