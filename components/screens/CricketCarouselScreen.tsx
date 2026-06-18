'use client'
import { useRef, useState, type CSSProperties } from 'react'
import { useApp } from '@/lib/context'

// Cricket intro — "split card" redesign (handoff: cricket carousel). Three tight
// slides: scene image on top (~54%), text on a solid panel below, navy CTA in a
// footer bar. Logic (enter() routing, goTo, swipe) is unchanged from before.
const TOTAL = 3
const NAVY = 'linear-gradient(135deg,#003087,#001a5a)'

export default function CricketCarouselScreen() {
  const { navigate, game, startCricketGame } = useApp()
  const [cur, setCur] = useState(0)
  const touchStartX = useRef(0)

  const goTo = (i: number) => setCur(Math.max(0, Math.min(TOTAL - 1, i)))

  const enter = () => {
    // Resume an in-progress run — startCricketGame would wipe it.
    if (game.world === 'cricket' && game.situation > 0) navigate('live')
    else if (game.playerName) startCricketGame()
    else {
      // Fresh player: remember they came from cricket so name-entry flows straight
      // into the game (saveProfile reads this) instead of bouncing back to Worlds.
      if (typeof window !== 'undefined') localStorage.setItem('lore_pending_world', 'cricket')
      navigate('onboarding')
    }
  }

  const isLast = cur === TOTAL - 1

  // ── shared styles ──
  const imgWrap: CSSProperties = { position: 'relative', height: '54%', flex: 'none' }
  const img: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
  const grain: CSSProperties = { position: 'absolute', inset: 0, background: 'var(--grain)', opacity: 0.3, mixBlendMode: 'overlay', pointerEvents: 'none' }
  const scrim: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,15,.3) 0%, transparent 40%, var(--bg) 100%)' }
  const eyebrow: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 800, letterSpacing: '.14em', color: 'var(--fame)', marginBottom: 14 }
  const big = (size: number): CSSProperties => ({ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: size, lineHeight: 1.07, color: '#fff' })
  const body: CSSProperties = { fontSize: 16, color: 'var(--ink2)', lineHeight: 1.55, marginTop: 13 }
  const av = (first: boolean): CSSProperties => ({ width: 46, height: 46, borderRadius: '50%', border: '2px solid var(--bg)', marginLeft: first ? 0 : -13, background: '#0a1a4a center/cover', objectFit: 'cover' })

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg)', overflow: 'hidden', fontFamily: 'var(--sans)', display: 'flex', flexDirection: 'column' }}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchStartX.current
        if (Math.abs(dx) > 50) goTo(dx < 0 ? cur + 1 : cur - 1)
      }}
    >
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', width: '300%', height: '100%', transform: `translateX(-${cur * 33.333}%)`, transition: 'transform .55s cubic-bezier(.32,.72,0,1)' }}>

          {/* Slide 1 — the breakthrough */}
          <div style={{ width: '33.333%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={imgWrap}>
              <img src="/avatars/cricket-wankhede.png" alt="" style={img} />
              <div style={grain} /><div style={scrim} />
            </div>
            <div style={{ flex: 1, padding: '4px 28px 28px', display: 'flex', flexDirection: 'column' }}>
              <div style={eyebrow}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fame)' }} />MUMBAI INDIANS · IPL · SEASON 1</div>
              <div style={big(36)}>Tum 16 saal ke ho.</div>
              <div style={body}>Saat saal ki mehnat. Aur aaj — Mumbai Indians ne tumhe kharida.</div>
            </div>
          </div>

          {/* Slide 2 — the dressing room */}
          <div style={{ width: '33.333%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={imgWrap}>
              <img src="/avatars/cricket-dressing-room.png" alt="" style={img} />
              <div style={grain} /><div style={scrim} />
            </div>
            <div style={{ flex: 1, padding: '0 28px 28px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', marginTop: -26, marginBottom: 16, position: 'relative', zIndex: 2 }}>
                <img src="/avatars/rohit.png" alt="" style={av(true)} />
                <img src="/avatars/bumrah.png" alt="" style={av(false)} />
                <img src="/avatars/hardik.png" alt="" style={av(false)} />
              </div>
              <div style={big(32)}>Rohit. Bumrah. Hardik.</div>
              <div style={body}>Ab inke saath dressing room. Par yeh tumhe nahi jaante — trust kamaana padega.</div>
            </div>
          </div>

          {/* Slide 3 — the goal */}
          <div style={{ width: '33.333%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={imgWrap}>
              <img src="/avatars/cricket-nets.png" alt="" style={img} />
              <div style={grain} /><div style={scrim} />
            </div>
            <div style={{ flex: 1, padding: '4px 28px 28px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ ...eyebrow, marginBottom: 12 }}>SEASON 1 · THE GOAL</div>
              <div style={big(36)}>India tak pahuncho.</div>
              <div style={body}>Squad ka bharosa jeeto, runs banao. Yahan chha gaye — toh India ka call-up tumhara.</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 18, flexWrap: 'wrap' }}>
                {['MI Debut', 'Main Nets', 'India'].map((step, i) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '6px 10px', borderRadius: 8,
                      background: i === 2 ? 'rgba(255,176,32,.16)' : 'rgba(255,255,255,.05)',
                      color: i === 2 ? 'var(--fame)' : 'var(--ink2)',
                      border: i === 2 ? '1px solid rgba(255,176,32,.4)' : '1px solid transparent',
                    }}>{step}</span>
                    {i < 2 && <span style={{ color: 'var(--ink3)', fontSize: 13 }}>→</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Skip → last slide */}
        <button onClick={() => goTo(TOTAL - 1)} className="lo-press"
          style={{ position: 'absolute', top: 20, right: 18, zIndex: 5, background: 'rgba(8,8,15,.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.14)', color: 'rgba(255,255,255,.85)', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 20, cursor: 'pointer' }}>
          Skip
        </button>
      </div>

      {/* Footer: dots + navy CTA */}
      <div style={{ flex: 'none', padding: '18px 24px 30px', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{ height: 4, borderRadius: 2, width: i === cur ? 20 : 6, background: i === cur ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.28)', transition: 'all .35s' }} />
          ))}
        </div>
        <button onClick={() => (isLast ? enter() : goTo(cur + 1))} className="lo-press"
          style={{ width: '100%', height: 54, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, color: '#fff', background: NAVY, boxShadow: '0 10px 30px rgba(0,48,135,.5)' }}>
          {isLast ? 'Enter the Dressing Room →' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
