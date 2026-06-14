'use client'
import { useRef, useState } from 'react'
import { useApp } from '@/lib/context'

const TOTAL = 4
const PINK = '#ff2d78'

// Establishes the Creator House game BEFORE you enter Live: the 3 meters, the
// eviction nights (how you can go home), how you survive, and what you're
// ultimately playing toward (the 4 endings). Mirrors the cricket carousel.
const METERS = [
  { label: 'FAME',  color: 'var(--fame)',  val: 'Kitne log tumhe dekh rahe hain', pct: 22 },
  { label: 'HEAT',  color: 'var(--heat)',  val: 'Ghar mein kitni baat tumhaari',  pct: 50 },
  { label: 'IMAGE', color: 'var(--trust)', val: 'Logon aur brands ka bharosa',     pct: 30 },
]

const ENDINGS = [
  { dot: 'var(--fame)',  label: 'Sabse zyada FAME',  note: 'The Main Character — poora ghar tumhaari kahani.' },
  { dot: 'var(--heat)',  label: 'Sabse zyada HEAT',  note: 'Dil ka rishta — ek connection jo sab yaad rakhenge.' },
  { dot: 'var(--trust)', label: 'Sabse zyada IMAGE', note: 'The Brand Empire — deals, paisa, respect.' },
  { dot: 'var(--ink3)',  label: 'Sab balance',       note: 'Dark Horse — jise koi aata nahi dekhta.' },
]

export default function WorldIntroScreen() {
  const { startGame, navigate, game } = useApp()
  const [cur, setCur] = useState(0)
  const touchStartX = useRef(0)

  const goTo = (i: number) => setCur(Math.max(0, Math.min(TOTAL - 1, i)))

  // Resume an in-progress Creator House run — startGame would wipe it.
  const enter = () => {
    if (game.world === 'creator-house' && game.situation > 0 && game.char) navigate('feed')
    else startGame()
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

          {/* Slide 1 — Premise */}
          <div className="cc-slide">
            <div className="cc-live-badge" style={{ color: PINK }}>
              <span className="cc-live-dot" style={{ background: PINK }} />
              LIVE · DAY 1 OF 10
            </div>
            <div className="cc-big">Creator House.</div>
            <div className="cc-body">
              6 creators. Ek villa. 10 din.<br /><br />
              Tum sabse naye ho. Koi tumhe nahi jaanta — abhi.
              Har post, har choice, har DM tumhaari jagah banaayega ya bigaadega.
            </div>
          </div>

          {/* Slide 2 — The 3 meters */}
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
            <div className="cc-body" style={{ marginTop: 18 }}>
              Har choice in teeno ko hilaati hai. Jo cheez viral karti hai, wahi aksar
              dosti todti hai.
            </div>
          </div>

          {/* Slide 3 — Eviction + survival */}
          <div className="cc-slide">
            <div className="cc-big" style={{ fontSize: 30 }}>
              Har kuch din mein — Eviction Night.
            </div>
            <div className="cc-body" style={{ marginTop: 18 }}>
              <b style={{ color: 'var(--ink)' }}>Din 3</b> aur <b style={{ color: 'var(--ink)' }}>Din 7</b> ko
              ghar kisi ek ko bahar bhejta hai — house ka vote + audience.<br /><br />
              Bachne ka tareeka? <b style={{ color: PINK }}>Log.</b> Jo tumse jude hain,
              wahi tumhe bachate hain.<br /><br />
              Apne bande ke saath wafadaar raho — warna eviction night woh ja sakta hai,
              tumhaare haathon.
            </div>
          </div>

          {/* Slide 4 — The win / outcome + CTA */}
          <div className="cc-slide">
            <div className="cc-big" style={{ fontSize: 30 }}>
              10 din baad — tum kaun ban-te ho?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, width: '100%' }}>
              {ENDINGS.map(e => (
                <div key={e.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: e.dot, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{e.label}</div>
                    <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.45)', lineHeight: 1.45 }}>{e.note}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cc-body" style={{ marginTop: 18 }}>
              Jo meter sabse upar — wahi tumhaara ending. Tumhaari kahani, tumhaari choice.
            </div>
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

      {/* Enter CTA (last slide) */}
      {isLast && (
        <div className="cc-cta-wrap">
          <button
            className="cc-enter-btn"
            onClick={enter}
            style={{ background: `linear-gradient(135deg, ${PINK}, #7a1140)`, boxShadow: '0 10px 32px rgba(255,45,120,.45)' }}
          >
            Enter the House →
          </button>
          <button
            onClick={() => navigate('worlds')}
            style={{ marginTop: 12, width: '100%', padding: '10px 0', fontSize: 14, color: 'rgba(255,255,255,.45)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Skip
          </button>
        </div>
      )}
    </div>
  )
}
