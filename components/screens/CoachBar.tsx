'use client'
import { useEffect, useRef, useState } from 'react'
import * as haptics from '@/lib/haptics'
import * as sound from '@/lib/sound'

// CoachBar — a single one-time, NON-BLOCKING coach tip, bottom-anchored so it never
// covers the scene above it (the in-code rule that removed the prior full-scrim tour).
// Placed contextually: one on the first beat's narration ("tap to advance"), one on
// the first choice screen. Each fires once ever, gated by its own `storageKey`.

export default function CoachBar({
  storageKey, eyebrow, title, body, cta = 'Samajh gaya', delayMs = 1100,
}: {
  storageKey: string
  eyebrow: string
  title: string
  body: string
  cta?: string
  delayMs?: number
}) {
  const [open, setOpen] = useState(false)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let seen = true
    try { seen = !!localStorage.getItem(storageKey) } catch { /* ignore */ }
    if (seen) return
    // Let the scene register first — never pre-empt the moment it's teaching.
    const t = setTimeout(() => setOpen(true), reduced.current ? 350 : delayMs)
    return () => clearTimeout(t)
  }, [storageKey, delayMs])

  const close = () => {
    try { localStorage.setItem(storageKey, '1') } catch { /* ignore */ }
    setOpen(false)
  }
  const done = () => { haptics.select(); sound.prime(); sound.uiTick(); close() }
  const skip = () => { haptics.tap(); close() }

  if (!open) return null

  return (
    // Bottom-anchored, no full scrim: the scene above stays visible & readable.
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 70, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 300, background: 'linear-gradient(180deg, transparent, rgba(4,4,10,.82) 62%)', pointerEvents: 'none' }} />
      <div
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
          <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)' }}>{eyebrow}</span>
          <button onClick={skip} style={{ background: 'none', border: 'none', color: 'var(--ink3)', fontSize: 11, fontWeight: 700, fontFamily: 'var(--sans)', cursor: 'pointer', letterSpacing: '.04em' }}>Skip</button>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 19, lineHeight: 1.14, color: '#fff', marginTop: 8 }}>{title}</div>
        <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.55, color: 'var(--ink2)', marginTop: 7 }}>{body}</div>
        <button onClick={done} className="lo-press"
          style={{ marginTop: 14, height: 40, width: '100%', border: 'none', borderRadius: 12, background: 'linear-gradient(120deg,#ff2d78,#c01a5a)', color: '#fff', fontWeight: 800, fontSize: 13.5, fontFamily: 'var(--sans)', cursor: 'pointer' }}>
          {cta}
        </button>
      </div>
    </div>
  )
}
