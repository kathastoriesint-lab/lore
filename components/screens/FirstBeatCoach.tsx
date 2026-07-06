'use client'
import { useEffect, useRef, useState } from 'react'

// First-beat coach — a one-time, NON-BLOCKING bottom sheet that teaches the core
// loop the first time a player lands in a story beat (either world). It sits at the
// bottom so the opening narration above stays fully visible — honoring the in-code
// rule that onboarding "must not cover scene one" (a prior full-scrim coach tour was
// removed for exactly that). Fires once ever, gated on localStorage; fully skippable.

const SEEN_KEY = 'weev_first_beat_coach'

type Tip = { eyebrow: string; title: string; body: string }

const TIPS: Record<'cricket' | 'creator-house', Tip[]> = {
  'creator-house': [
    { eyebrow: 'Kaise chalta hai', title: 'Kahani tumhare tap pe chalti hai', body: 'Har line tumhare tap pe khulti hai. Jaldi nahi — scene ko jeeyo.' },
    { eyebrow: 'Tumhari pehli choice', title: 'Koi sahi-galat nahi', body: 'Fiction tolo, numbers nahi. Jo tumhe sach lage — wahi chuno.' },
    { eyebrow: 'Consequence', title: 'Choice = ek real post', body: 'Tumhara move Feed pe post banta hai — ghar react karta hai. Aur characters seedha DM karte hain.' },
  ],
  cricket: [
    { eyebrow: 'Kaise chalta hai', title: 'Kahani tumhare tap pe chalti hai', body: 'Har line tumhare tap pe aati hai. Jaldi nahi — scene ko mehsoos karo.' },
    { eyebrow: 'Tumhari pehli choice', title: 'Koi sahi-galat nahi', body: 'Fiction tolo, stats nahi. Jo tumhe sach lage — wahi chuno.' },
    { eyebrow: 'Consequence', title: 'Choice = ek real move', body: 'Form aur captain ka trust har choice pe hilte hain — aur seniors tumhe seedha DM karte hain.' },
  ],
}

export default function FirstBeatCoach({ world, delayMs = 1300 }: { world: 'cricket' | 'creator-house'; delayMs?: number }) {
  const [open, setOpen] = useState(false)
  const [i, setI] = useState(0)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let seen = true
    try { seen = !!localStorage.getItem(SEEN_KEY) } catch { /* ignore */ }
    if (seen) return
    // Let the opening line reveal first — never pre-empt scene one.
    const t = setTimeout(() => setOpen(true), reduced.current ? 400 : delayMs)
    return () => clearTimeout(t)
  }, [delayMs])

  const finish = () => {
    try { localStorage.setItem(SEEN_KEY, '1') } catch { /* ignore */ }
    setOpen(false)
  }
  const buzz = (ms = 8) => { try { navigator.vibrate?.(ms) } catch { /* unsupported */ } }
  const next = () => { buzz(8); i < tips.length - 1 ? setI(i + 1) : finish() }

  const tips = TIPS[world]
  if (!open) return null
  const tip = tips[i]
  const isLast = i === tips.length - 1

  return (
    // Bottom-anchored, no full scrim: the narration above stays visible & readable.
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 70, pointerEvents: 'none' }}>
      {/* Soft bottom-only wash so the card reads, without covering scene one */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, background: 'linear-gradient(180deg, transparent, rgba(4,4,10,.82) 62%)', pointerEvents: 'none' }} />
      <div
        key={i}
        style={{
          position: 'relative', margin: '0 16px 22px', pointerEvents: 'auto',
          background: 'linear-gradient(180deg,#1a1020,#140d18)', border: '1px solid rgba(255,45,120,.3)',
          borderRadius: 20, padding: '17px 18px 16px',
          boxShadow: '0 18px 50px rgba(0,0,0,.6), 0 0 26px rgba(255,45,120,.12)',
          animation: reduced.current ? undefined : 'tiUp .4s cubic-bezier(.32,.72,0,1) both',
          fontFamily: 'var(--sans)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)' }}>{tip.eyebrow} · {i + 1}/{tips.length}</span>
          <button onClick={finish} style={{ background: 'none', border: 'none', color: 'var(--ink3)', fontSize: 11, fontWeight: 700, fontFamily: 'var(--sans)', cursor: 'pointer', letterSpacing: '.04em' }}>Skip</button>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 19, lineHeight: 1.14, color: '#fff', marginTop: 8 }}>{tip.title}</div>
        <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.55, color: 'var(--ink2)', marginTop: 7 }}>{tip.body}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 14 }}>
          {/* progress dots */}
          <div style={{ display: 'flex', gap: 5, flex: 1 }}>
            {tips.map((_, k) => (
              <span key={k} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: 3, background: k === i ? 'var(--accent)' : 'rgba(255,255,255,.2)', transition: 'all .3s' }} />
            ))}
          </div>
          <button onClick={next} className="lo-press"
            style={{ height: 40, padding: '0 20px', border: 'none', borderRadius: 12, background: 'linear-gradient(120deg,#ff2d78,#c01a5a)', color: '#fff', fontWeight: 800, fontSize: 13.5, fontFamily: 'var(--sans)', cursor: 'pointer' }}>
            {isLast ? 'Chalo' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
