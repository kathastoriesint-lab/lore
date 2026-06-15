'use client'
import { useApp } from '@/lib/context'
import { SITUATIONS } from '@/lib/data'

// Persistent Creator House status — the CH equivalent of the cricket goal card.
// WorldIntroScreen establishes the rules once (and is skippable); this keeps the
// stakes visible DURING play: what day it is, when the next eviction hits, whether
// you're safe, and which ending you're trending toward.

const idToDay: Record<string, number> = Object.fromEntries(SITUATIONS.map(s => [s.id, s.day]))
const TOTAL_DAYS = 10

// Survival proxy: IMAGE is the "log ka bharosa" meter — who has your back at a vote.
function standing(image: number): { text: string; color: string } {
  if (image >= 45) return { text: 'Safe — ghar tumhaare saath hai', color: 'var(--trust)' }
  if (image >= 25) return { text: 'Thoda risky — apne log banao', color: 'var(--fame)' }
  return { text: 'Khatre mein — eviction mein naam aa sakta hai', color: 'var(--heat)' }
}

// What you're playing toward — the leading meter decides your ending (matches the intro).
function trending(m: { fame: number; heat: number; image: number }): string {
  const max = Math.max(m.fame, m.heat, m.image)
  const spread = max - Math.min(m.fame, m.heat, m.image)
  if (spread < 12) return 'Dark Horse — sab balanced'
  if (m.fame === max) return 'The Main Character (FAME)'
  if (m.image === max) return 'The Brand Empire (IMAGE)'
  return 'Dil ka rishta (HEAT)'
}

function nextThreat(day: number): string {
  if (day < 3) return 'Eviction Night · Din 3'
  if (day < 7) return 'Eviction Night · Din 7'
  if (day < TOTAL_DAYS) return 'Finale · Din 10'
  return 'Finale · aaj'
}

export default function CHStatusCard() {
  const { game } = useApp()
  if (game.world !== 'creator-house') return null

  const sitId = game.situationQueue[game.situation] ?? game.situationQueue[game.situationQueue.length - 1]
  const day = (sitId && idToDay[sitId]) || 1
  const st = standing(game.meters.image)

  return (
    <div style={{
      width: 'calc(100% - 24px)', margin: '8px 12px 0',
      background: 'var(--surf)', border: '1px solid var(--line)',
      borderRadius: 12, padding: '10px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: 'var(--ink)' }}>
          DAY {day} <span style={{ color: 'var(--ink3)' }}>OF {TOTAL_DAYS}</span>
        </span>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.04em', color: 'var(--ink3)' }}>
          {nextThreat(day)}
        </span>
      </div>

      {/* day progress — neutral track, single accent fill */}
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,.08)', overflow: 'hidden', marginBottom: 9 }}>
        <div style={{ width: `${(day / TOTAL_DAYS) * 100}%`, height: '100%', borderRadius: 2, background: 'var(--ink3)' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.color, flexShrink: 0 }} />
        <span style={{ fontSize: 11.5, color: 'var(--ink2)' }}>{st.text}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink3)' }}>
        Trending: <span style={{ color: 'var(--ink2)', fontWeight: 600 }}>{trending(game.meters)}</span>
      </div>
    </div>
  )
}
