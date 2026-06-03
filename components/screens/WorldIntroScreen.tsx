'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import { CHARS } from '@/lib/data'

type CharId = 'ria'|'kabir'|'meher'|'dev'|'ananya'|'zoya'|'rishi'|'adi'
const CAST: CharId[] = ['ria','kabir','meher','dev','ananya','zoya','rishi','adi']

const CHAR_DESC: Record<CharId, string> = {
  ria:    'Luxury lifestyle. 24. The house alpha.',
  kabir:  "Everyone's friend. Nobody's ally.",
  meher:  'Warm, wise — and watching everything.',
  dev:    'Fitness, brands. Loyalty for sale.',
  ananya: '19. Viral dancer. Just wants respect.',
  zoya:   'Sweet on camera. Sharp off it.',
  rishi:  'Records everything. Always.',
  adi:    'Newest here. Still figuring it out.',
}

function speak(_text: string) {
  // Narration removed — animation only
}

export default function WorldIntroScreen() {
  const { navigate } = useApp()

  // line visibility for world intro
  const [lines, setLines] = useState([false, false, false])
  // character parade: which chars are revealed
  const [revealedChars, setRevealedChars] = useState<number>(-1)
  const [activeChar, setActiveChar] = useState<number>(-1)
  const [showCta, setShowCta] = useState(false)
  const [phase, setPhase] = useState<'world'|'chars'|'cta'>('world')

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const t = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }

  const enter = useCallback(() => {
    timers.current.forEach(clearTimeout)
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    navigate('narrator')
  }, [navigate])

  useEffect(() => {
    // Phase 1 — world intro lines
    t(200,  () => speak("Creator House. Eight rising creators. One villa. Thirty days. Tonight the house opens for the very first time."))
    t(300,  () => setLines(p => { const n=[...p]; n[0]=true; return n }))
    t(1100, () => setLines(p => { const n=[...p]; n[1]=true; return n }))
    t(2200, () => setLines(p => { const n=[...p]; n[2]=true; return n }))
    t(3800, () => setPhase('chars'))

    return () => { timers.current.forEach(clearTimeout) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 2 — character parade
  useEffect(() => {
    if (phase !== 'chars') return

    const introScript = CAST.map(id =>
      `${CHARS[id].name}. ${CHAR_DESC[id]}`
    ).join('. ')
    speak(`Let me introduce the players. ${introScript}. Eight characters. Who do you want to be?`)

    CAST.forEach((_, i) => {
      t(i * 1300, () => {
        setActiveChar(i)
        setRevealedChars(i)
      })
    })

    t(CAST.length * 1300 + 600, () => {
      setActiveChar(-1)
      setShowCta(true)
      setPhase('cta')
    })
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="wintro-screen">
      <div className="wintro-cover" />

      {/* Skip */}
      <button className="wintro-skip" onClick={enter}>Skip →</button>

      {/* LIVE badge */}
      <div className="wintro-live">
        <span className="pulse" />
        LIVE · DAY 1 OF 30
      </div>

      {/* Content area */}
      <div className="wintro-body">

        {/* World intro lines */}
        <div className="wintro-intro-block">
          <div className={`wintro-tl${lines[0] ? ' in' : ''}`}>
            Creator<br />House.
          </div>
          <div className={`wintro-sub${lines[1] ? ' in' : ''}`}>
            8 creators. Ek villa. 30 din.
          </div>
          <div className={`wintro-hook${lines[2] ? ' in' : ''}`}>
            Tonight, the house opens. And someone is already playing.
          </div>
        </div>

        {/* Character parade */}
        {phase !== 'world' && (
          <div className="wintro-cast-list">
            {CAST.map((id, i) => {
              const char = CHARS[id]
              const revealed = i <= revealedChars
              const isCurrent = i === activeChar
              return (
                <div
                  key={id}
                  className={`wintro-cast-row${revealed ? ' in' : ''}${isCurrent ? ' active' : ''}`}
                >
                  <div className={`av ${char.cls} wintro-cast-av`}>{char.init}</div>
                  <div className="wintro-cast-info">
                    <span className="wintro-cast-name">{char.name}</span>
                    <span className="wintro-cast-desc">{CHAR_DESC[id]}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA */}
        {showCta && (
          <div className="wintro-cta-block">
            <div className="wintro-cta-q">Who do you want to be?</div>
            <button className="wintro-btn-main" onClick={enter}>
              Choose your character →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
