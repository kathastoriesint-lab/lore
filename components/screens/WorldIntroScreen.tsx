'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'

export default function WorldIntroScreen() {
  const { startGame, navigate } = useApp()
  const [lines, setLines] = useState([false, false, false])
  const [showCta, setShowCta] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const t = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }

  useEffect(() => {
    t(300,  () => setLines(p => { const n=[...p]; n[0]=true; return n }))
    t(1100, () => setLines(p => { const n=[...p]; n[1]=true; return n }))
    t(2200, () => setLines(p => { const n=[...p]; n[2]=true; return n }))
    t(3200, () => setShowCta(true))
    return () => { timers.current.forEach(clearTimeout) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const skipToEnter = useCallback(() => {
    timers.current.forEach(clearTimeout)
    setLines([true, true, true])
    setShowCta(true)
  }, [])

  return (
    <div className="wintro-screen">
      <div className="wintro-cover" />

      <button className="wintro-skip" onClick={skipToEnter}>Skip →</button>

      <div className="wintro-live">
        <span className="pulse" />
        LIVE · DAY 1 OF 10
      </div>

      <div className="wintro-body">
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

        {showCta && (
          <div className="wintro-cta-block" style={{ marginTop: 40, animation: 'fadeUp .4s ease-out' }}>
            <button
              className="wintro-btn-main"
              onClick={startGame}
            >
              Ghar mein aao →
            </button>
            <button
              onClick={() => navigate('worlds')}
              style={{ marginTop: 14, width: '100%', padding: '12px 0', fontSize: 14, color: 'rgba(255,255,255,.45)', fontWeight: 500 }}
            >
              Baad mein
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
