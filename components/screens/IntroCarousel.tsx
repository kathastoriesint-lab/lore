'use client'
import { useRef, useState, useEffect, type CSSProperties } from 'react'

// Shared world-intro treatment — full-bleed cinematic title cards (villa/stadium
// stills under a serif headline), the same cinematic language as the login hero.
// Both Creator House (WorldIntroScreen) and cricket (CricketCarouselScreen) render
// their three player-forward cards through this. Tap or swipe to advance; the last
// card carries the world CTA. `accent` tints the eyebrow + progress + CTA per world.

export interface IntroSlide {
  img: string
  eyebrow: string
  title: string
}

export function IntroCarousel({
  slides, accent, ctaGradient, ctaShadow, cta, onEnter,
}: {
  slides: IntroSlide[]
  accent: string            // eyebrow + segment colour
  ctaGradient: string       // CTA background
  ctaShadow: string         // CTA glow
  cta: string               // final CTA label
  onEnter: () => void
}) {
  const [cur, setCur] = useState(0)
  const touchStartX = useRef(0)
  const reduced = useRef(false)
  const TOTAL = slides.length
  const isLast = cur === TOTAL - 1

  useEffect(() => {
    reduced.current = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }, [])

  const buzz = (ms = 8) => { try { navigator.vibrate?.(ms) } catch { /* unsupported */ } }
  const goTo = (i: number) => { const n = Math.max(0, Math.min(TOTAL - 1, i)); if (n !== cur) buzz(6); setCur(n) }
  const advance = () => { buzz(10); isLast ? onEnter() : setCur(cur + 1) }

  const s = slides[cur]
  const anim = reduced.current ? undefined : 'tiUp .7s cubic-bezier(.32,.72,0,1) both'

  const wrap: CSSProperties = { position: 'relative', width: '100%', height: '100%', background: 'var(--bg)', overflow: 'hidden', fontFamily: 'var(--sans)', color: '#fff' }

  return (
    <div
      style={wrap}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchStartX.current
        if (Math.abs(dx) > 48) goTo(dx < 0 ? cur + 1 : cur - 1)
      }}
    >
      {/* Full-bleed still — crossfades between cards */}
      <div key={s.img} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${s.img})`, backgroundSize: 'cover', backgroundPosition: 'center', animation: reduced.current ? undefined : 'fadeUp .6s ease both' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,6,12,.5) 0%, rgba(6,6,12,.16) 40%, rgba(6,6,12,.96) 86%)' }} />
      {/* Grain */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--grain)', opacity: .28, mixBlendMode: 'overlay', pointerEvents: 'none' }} />

      {/* Tap-to-advance surface (below the chrome) */}
      <div onClick={advance} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} />

      {/* Segmented progress */}
      <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', gap: 5, zIndex: 4 }}>
        {slides.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,.2)' }}>
            <div style={{ height: '100%', borderRadius: 2, background: accent, width: i <= cur ? '100%' : 0, transition: 'width .45s cubic-bezier(.32,.72,0,1)' }} />
          </div>
        ))}
      </div>

      {/* Skip → last card */}
      {!isLast && (
        <button onClick={() => goTo(TOTAL - 1)} className="lo-press"
          style={{ position: 'absolute', top: 34, right: 18, zIndex: 5, background: 'rgba(8,8,15,.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.14)', color: 'rgba(255,255,255,.85)', fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600, padding: '7px 14px', borderRadius: 20, cursor: 'pointer' }}>
          Skip
        </button>
      )}

      {/* Bottom copy block */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 28px 40px', zIndex: 3, pointerEvents: 'none' }}>
        <div key={`e${cur}`} style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.17em', textTransform: 'uppercase', color: accent, animation: anim ? 'tiUp .7s cubic-bezier(.32,.72,0,1) .05s both' : undefined }}>{s.eyebrow}</div>
        <div key={`t${cur}`} style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 38, lineHeight: 1.08, letterSpacing: '-.01em', maxWidth: 330, marginTop: 12, animation: anim ? 'tiUp .7s cubic-bezier(.32,.72,0,1) .18s both' : undefined }}>{s.title}</div>

        {isLast ? (
          <button onClick={onEnter} className="lo-press"
            style={{ pointerEvents: 'auto', width: '100%', height: 54, marginTop: 28, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 800, color: '#fff', background: ctaGradient, boxShadow: `0 12px 30px ${ctaShadow}` }}>
            {cta}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 22, fontSize: 9, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', animation: 'cuePulse 1.9s ease-in-out infinite' }}>
            Tap to continue
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
          </div>
        )}
      </div>
    </div>
  )
}
