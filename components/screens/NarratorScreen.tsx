'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import { getCHChars, getCHNarrLines, getCHNarrChars } from '@/lib/content'

// Creator House intro: you ARE yourself — the new creator who just moved in.
// This is a "meet the house" beat (the cast you're walking into), then you enter
// as yourself. The situations are all written newcomer-POV ({ally}=Kabir/Ananya,
// {crush}, {p|...}), so the player is the 'player' self-sentinel, never a housemate.
export default function NarratorScreen() {
  const { navigate, setChar } = useApp()
  const CHARS = getCHChars()
  const NARR_LINES = getCHNarrLines()
  const NARR_CHARS = getCHNarrChars()

  const totalLines = NARR_LINES.length + NARR_CHARS.length + 1 // +1 for final line
  const [visibleLines, setVisibleLines] = useState<boolean[]>(Array(totalLines).fill(false))
  const [showCTA, setShowCTA] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    NARR_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(prev => { const n = [...prev]; n[i] = true; return n }), 300 + i * 300))
    })
    const narrBase = 300 + NARR_LINES.length * 300 + 400
    NARR_CHARS.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(prev => { const n = [...prev]; n[NARR_LINES.length + i] = true; return n }), narrBase + i * 520))
    })
    const finalDelay = narrBase + NARR_CHARS.length * 520 + 200
    timers.push(setTimeout(() => setVisibleLines(prev => { const n = [...prev]; n[NARR_LINES.length + NARR_CHARS.length] = true; return n }), finalDelay))
    timers.push(setTimeout(() => setShowCTA(true), finalDelay + 600))
    timersRef.current = timers
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSkip = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    setVisibleLines(Array(totalLines).fill(true))
    setShowCTA(true)
  }, [totalLines])

  // Enter as yourself — 'player' is the self-sentinel (same as cricket).
  const handleEnter = useCallback(() => {
    setChar('player')
    navigate('feed', { replace: true })
  }, [setChar, navigate])

  return (
    <div className="narrator">
      <div className="narr-scroll">
        <div className="narr-col">
          {NARR_LINES.map((line, i) => (
            <div key={i} className={`narr-line${visibleLines[i] ? ' in' : ''}`}>
              <div className={line.cls}>{line.text}</div>
            </div>
          ))}

          <div className="narr-gap" />

          {/* Meet the house — the cast you're walking into */}
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

          {/* Final line — newcomer framing */}
          <div className={`narr-line${visibleLines[NARR_LINES.length + NARR_CHARS.length] ? ' in' : ''}`}>
            <div className="narr-final">Sab apni jagah bana chuke hain. Ab teri baari.</div>
          </div>
        </div>
      </div>

      <button className="skip-btn" onClick={handleSkip}>Skip →</button>

      {/* Single CTA — enter as yourself */}
      <button
        className={`picker-cta${showCTA ? ' up' : ''}`}
        onClick={handleEnter}
        disabled={!showCTA}
      >
        Ghar mein kadam rakho →
      </button>
    </div>
  )
}
