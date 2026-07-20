'use client'
import { useEffect, useRef, useState } from 'react'
import * as haptics from '@/lib/haptics'
import * as sound from '@/lib/sound'
import { getLang } from '@/lib/lang'

// FeedTabsCoach — a small one-time bar above the tab strip that names the two tabs
// that matter: Feed (the world's reactions) and Messages (character DMs). Icons match
// the real tab icons below it. Same card format as the story CoachBar — eyebrow + Skip
// on top, a full-width "Samajh gaya" button at the bottom. Non-blocking, self-gates.

const KEY = 'weev_coach_feed'

export default function FeedTabsCoach({ delayMs = 900 }: { delayMs?: number }) {
  const [open, setOpen] = useState(false)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let seen = true
    try { seen = !!localStorage.getItem(KEY) } catch { /* ignore */ }
    if (seen) return
    const t = setTimeout(() => setOpen(true), reduced.current ? 300 : delayMs)
    return () => clearTimeout(t)
  }, [delayMs])

  const close = () => {
    try { localStorage.setItem(KEY, '1') } catch { /* ignore */ }
    setOpen(false)
  }
  const done = () => { haptics.select(); sound.prime(); sound.uiTick(); close() }
  const skip = () => { haptics.tap(); close() }

  if (!open) return null

  const row = (icon: React.ReactNode, name: string, desc: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '6px 0' }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,45,120,.12)', border: '1px solid rgba(255,45,120,.25)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{name}</div>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink2)', marginTop: 1 }}>{desc}</div>
      </div>
    </div>
  )

  return (
    // Sits just above the tab strip; icons mirror the tabs below it. Non-blocking.
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 72, zIndex: 40, pointerEvents: 'none', display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{
        pointerEvents: 'auto', width: '100%', maxWidth: 360,
        background: 'linear-gradient(180deg,#1a1020,#140d18)', border: '1px solid rgba(255,45,120,.3)',
        borderRadius: 20, padding: '17px 18px 16px',
        boxShadow: '0 18px 50px rgba(0,0,0,.6), 0 0 26px rgba(255,45,120,.12)',
        fontFamily: 'var(--sans)', animation: reduced.current ? undefined : 'tiUp .4s cubic-bezier(.32,.72,0,1) both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)' }}>{getLang() === 'en' ? 'Two tabs that matter' : 'Neeche do zaroori tab'}</span>
          <button onClick={skip} style={{ background: 'none', border: 'none', color: 'var(--ink3)', fontSize: 11, fontWeight: 700, fontFamily: 'var(--sans)', cursor: 'pointer', letterSpacing: '.04em' }}>Skip</button>
        </div>
        {row(<><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>, 'Feed', getLang() === 'en' ? 'The world reacts — live, on every move' : 'Duniya ki reactions — har move pe live')}
        {row(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />, 'Messages', getLang() === 'en' ? 'Direct DMs from characters — relationships live here' : 'Characters ke seedhe DM — rishte yahin bante hain')}
        <button onClick={done} className="lo-press"
          style={{ marginTop: 14, height: 40, width: '100%', border: 'none', borderRadius: 12, background: 'linear-gradient(120deg,#ff2d78,#c01a5a)', color: '#fff', fontWeight: 800, fontSize: 13.5, fontFamily: 'var(--sans)', cursor: 'pointer' }}>
          {getLang() === 'en' ? 'Got it' : 'Samajh gaya'}
        </button>
      </div>
    </div>
  )
}
