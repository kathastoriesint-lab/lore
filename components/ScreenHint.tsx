'use client'
import { useEffect, useState } from 'react'

// One-time contextual hint — a small bottom card that explains a surface the
// FIRST time the player lands on it (feed / messages / nets), then never again.
// Founder call (Jul 3): "wherever a new screen comes we should tell what to do
// once." This is NOT an upfront tour (those tested badly) — it appears in the
// moment, one line, one dismiss.
const KEY = 'lore_hints_v1'

const seen = (id: string) => {
  try { return !!(JSON.parse(localStorage.getItem(KEY) || '{}'))[id] } catch { return false }
}
const mark = (id: string) => {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '{}')
    all[id] = 1
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {}
}

export default function ScreenHint({ id, icon, title, body, active = true }: {
  id: string
  icon: string
  title: string
  body: string
  /** only show while the host screen is actually visible */
  active?: boolean
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!active) return
    if (!seen(id)) {
      const t = setTimeout(() => setShow(true), 650)
      return () => clearTimeout(t)
    }
  }, [id, active])

  if (!show) return null

  return (
    <div style={{
      position: 'absolute', left: 14, right: 14, bottom: 86, zIndex: 60,
      background: 'color-mix(in srgb, var(--surf) 92%, #000)', border: '1px solid var(--line)',
      borderRadius: 16, padding: '14px 15px', boxShadow: '0 14px 40px rgba(0,0,0,.5)',
      animation: 'evVoteIn .4s cubic-bezier(.32,.72,0,1) both',
    }}>
      <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 20, lineHeight: 1 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5, marginTop: 3 }}>{body}</div>
        </div>
      </div>
      <button
        onClick={() => { mark(id); setShow(false) }}
        style={{
          width: '100%', marginTop: 11, padding: '10px 0', borderRadius: 11, border: 'none',
          background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: 12.5,
          fontFamily: 'var(--sans)', cursor: 'pointer',
        }}
      >Samajh gaya ✓</button>
    </div>
  )
}
