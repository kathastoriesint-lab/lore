'use client'
import { useRef, useState } from 'react'
import { useApp } from '@/lib/context'

const TOTAL = 3

const METERS = [
  { label: 'FORM',  color: '#FFB020', val: 'Kya tum khelna jaante ho?', pct: 18 },
  { label: 'FAME',  color: '#FFD24D', val: 'Duniya kya sochti hai?',    pct: 28 },
  { label: 'TRUST', color: '#3DD6C8', val: 'Dressing room ka yakeen?',  pct: 10 },
]

export default function CricketCarouselScreen() {
  const { navigate, game, startCricketGame } = useApp()
  const [cur, setCur] = useState(0)
  const touchStartX = useRef(0)

  const goTo = (i: number) => setCur(Math.max(0, Math.min(TOTAL - 1, i)))

  const enter = () => {
    if (game.playerName) startCricketGame()
    else navigate('onboarding')
  }

  const isLast = cur === TOTAL - 1

  return (
    <div
      className="cc-root"
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchStartX.current
        if (Math.abs(dx) > 50) goTo(dx < 0 ? cur + 1 : cur - 1)
      }}
    >
      <button className="cc-skip-btn" onClick={enter}>Skip →</button>

      <div className="cc-dots">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} className={`cc-dot${i === cur ? ' active' : ''}`} />
        ))}
      </div>

      <div className="cc-slides-window">
        <div className="cc-slides-track" style={{ transform: `translateX(-${cur * 100}%)` }}>

          {/* Slide 1 — The Breakthrough */}
          <div className="cc-slide">
            <div className="cc-live-badge">
              <span className="cc-live-dot" />
              LIVE — IPL · MUMBAI INDIANS · SEASON 1
            </div>
            <div className="cc-big">Tum 16 saal ke ho.</div>
            <div className="cc-body">
              Saat saal se cricket khel rahe ho. Aur aaj — tumhaara
              pehla bada breakthrough.<br /><br />
              Mumbai Indians ne tumhe kharida hai. Yeh tumhaari
              cricketing story ka Season 1 hai.
            </div>
          </div>

          {/* Slide 2 — The Dressing Room */}
          <div className="cc-slide">
            <div className="cc-big">Rohit. Hardik. Bumrah.</div>
            <div className="cc-body">
              Ab tum inn superstars ke saath dressing room
              share karoge.<br /><br />
              Par yeh log tumhe nahi jaante — abhi. Wankhede ka
              dressing room utna warm nahi hota jitna TV par dikhta hai.<br /><br />
              Trust kamaana padega.
            </div>
            <div className="cc-avatars">
              {[
                { init: 'R', name: 'Rohit' },
                { init: 'J', name: 'Bumrah' },
                { init: 'H', name: 'Hardik' },
              ].map(a => (
                <div key={a.name} className="cc-av-wrap">
                  <div className="cc-av">{a.init}</div>
                  <div className="cc-av-name">{a.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide 3 — Meters */}
          <div className="cc-slide">
            <div className="cc-big" style={{ fontSize: 30 }}>
              Teen cheezein matter karti hain.
            </div>
            <div className="cc-meters">
              {METERS.map(m => (
                <div key={m.label} className="cc-meter-row">
                  <div className="cc-meter-head">
                    <span className="cc-meter-label" style={{ color: m.color }}>{m.label}</span>
                    <span className="cc-meter-val">{m.val}</span>
                  </div>
                  <div className="cc-meter-track">
                    <div className="cc-meter-fill" style={{ background: m.color, width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="cc-body" style={{ marginTop: 16 }}>Har choice inhein badlegi.</div>
          </div>

        </div>
      </div>

      {/* Back / Next nav (slides 0–2) */}
      {!isLast && (
        <div className="cc-nav">
          <button
            className="cc-back-btn"
            onClick={() => goTo(cur - 1)}
            style={{ opacity: cur === 0 ? 0 : 1, pointerEvents: cur === 0 ? 'none' : 'all' }}
          >
            ← Back
          </button>
          <button className="cc-next-btn" onClick={() => goTo(cur + 1)}>
            Next →
          </button>
        </div>
      )}

      {/* Enter CTA (slide 4) */}
      {isLast && (
        <div className="cc-cta-wrap">
          <button className="cc-enter-btn" onClick={enter}>
            Enter the Dressing Room →
          </button>
          <div className="cc-coming-soon">Season 2 · Season 3 · coming soon</div>
        </div>
      )}
    </div>
  )
}
