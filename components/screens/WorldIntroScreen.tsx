'use client'
import { useRef, useState, type CSSProperties } from 'react'
import { useApp } from '@/lib/context'

// Creator House intro — "split card" carousel, the SAME treatment as the cricket
// Dressing Room intro (CricketCarouselScreen): scene image on top (~54%), text on a
// solid panel below, pink CTA in a footer bar. Three narrative slides pull you into
// the house fast: the villa (you went viral) → the cast → the goal. Logic (enter()
// routing, goTo, swipe) mirrors cricket. (Handoff: creator carousel, 2026-06.)
const TOTAL = 3
const PINK = 'linear-gradient(135deg,#ff2d78,#7a1140)'

// The five housemates you walk in on (you make six).
const CAST = ['ria', 'kabir', 'ananya', 'zoya', 'dev']

export default function WorldIntroScreen() {
  const { startGame, navigate, game } = useApp()
  const [cur, setCur] = useState(0)
  const touchStartX = useRef(0)

  const goTo = (i: number) => setCur(Math.max(0, Math.min(TOTAL - 1, i)))

  // Resume an in-progress Creator House run — startGame would wipe it. Land on Live
  // (the engine), mirroring cricket. (DD1, CEO/design review 2026-06.)
  const enter = () => {
    if (game.world === 'creator-house' && game.situation > 0 && game.char) navigate('live')
    else startGame()
  }

  const isLast = cur === TOTAL - 1

  // ── shared styles (mirror CricketCarouselScreen) ──
  const imgWrap: CSSProperties = { position: 'relative', height: '48%', flex: 'none' }
  const img: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
  const grain: CSSProperties = { position: 'absolute', inset: 0, background: 'var(--grain)', opacity: 0.3, mixBlendMode: 'overlay', pointerEvents: 'none' }
  const scrim: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,15,.3) 0%, transparent 40%, var(--bg) 100%)' }
  const eyebrow: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 800, letterSpacing: '.14em', color: 'var(--accent)', marginBottom: 14 }
  const big = (size: number): CSSProperties => ({ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: size, lineHeight: 1.07, color: '#fff' })
  const body: CSSProperties = { fontSize: 15, color: 'var(--ink2)', lineHeight: 1.5, marginTop: 12 }
  const av = (first: boolean): CSSProperties => ({ width: 46, height: 46, borderRadius: '50%', border: '2px solid var(--bg)', marginLeft: first ? 0 : -13, background: '#2a0d1c center/cover', objectFit: 'cover' })
  // Text panel: scrolls within itself if a slide's copy runs long, so nothing ever
  // clips off-screen on a short device. (No-overflow guard for the carousel.)
  const panel: CSSProperties = { flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px 28px 22px', display: 'flex', flexDirection: 'column' }
  // Slide 2's avatar row overlaps UP into the image (negative margin + z-index), so this
  // panel must NOT clip — keep overflow visible. Its copy is short, so no overflow risk.
  const panel2: CSSProperties = { flex: 1, padding: '0 28px 22px', display: 'flex', flexDirection: 'column' }

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

          {/* Slide 1 — you went viral, the house called */}
          <div style={{ width: '33.333%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={imgWrap}>
              <img src="/avatars/seed-villa.png" alt="" style={img} />
              <div style={grain} /><div style={scrim} />
            </div>
            <div style={panel}>
              <div style={eyebrow}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />CREATOR HOUSE · GOA · SEASON 1</div>
              <div style={big(32)}>Tum viral ho gaye.</div>
              <div style={body}>Sahi video, sahi waqt. Aur ab — Creator House ne tumhe bulaya. 6 creators, ek villa, 10 din.</div>
            </div>
          </div>

          {/* Slide 2 — the cast */}
          <div style={{ width: '33.333%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={imgWrap}>
              <img src="/avatars/scene-terrace-night.png" alt="" style={img} />
              <div style={grain} /><div style={scrim} />
            </div>
            <div style={panel2}>
              <div style={{ display: 'flex', marginTop: -26, marginBottom: 16, position: 'relative', zIndex: 2 }}>
                {CAST.map((id, i) => <img key={id} src={`/avatars/${id}.png`} alt="" style={av(i === 0)} />)}
              </div>
              <div style={big(30)}>Ria. Kabir. Ananya.</div>
              <div style={body}>Sab apna game khel rahe hain. Koi dost banega, koi dushman — par abhi tumhe koi nahi jaanta.</div>
            </div>
          </div>

          {/* Slide 3 — the goal */}
          <div style={{ width: '33.333%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={imgWrap}>
              <img src="/avatars/scene-challenge.png" alt="" style={img} />
              <div style={grain} /><div style={scrim} />
            </div>
            <div style={panel}>
              <div style={{ ...eyebrow, marginBottom: 12 }}>SEASON 1 · THE GOAL</div>
              <div style={big(32)}>Finale tak pahuncho.</div>
              <div style={body}>Followers badhao, sahi log apne saath rakho, eviction nights nikaalo. Internet dekh raha hai — chha gaye toh finale tumhara.</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 18, flexWrap: 'wrap' }}>
                {['Day 1', 'Eviction Nights', 'Finale'].map((step, i) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '6px 10px', borderRadius: 8,
                      background: i === 2 ? 'rgba(255,45,120,.16)' : 'rgba(255,255,255,.05)',
                      color: i === 2 ? 'var(--accent)' : 'var(--ink2)',
                      border: i === 2 ? '1px solid rgba(255,45,120,.4)' : '1px solid transparent',
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

      {/* Footer: dots + pink CTA */}
      <div style={{ flex: 'none', padding: '18px 24px 30px', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{ height: 4, borderRadius: 2, width: i === cur ? 20 : 6, background: i === cur ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.28)', transition: 'all .35s' }} />
          ))}
        </div>
        <button onClick={() => (isLast ? enter() : goTo(cur + 1))} className="lo-press"
          style={{ width: '100%', height: 54, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, color: '#fff', background: PINK, boxShadow: '0 10px 30px rgba(255,45,120,.5)' }}>
          {isLast ? 'Enter the House →' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
