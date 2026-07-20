'use client'
import { useApp } from '@/lib/context'
import { getCHSituations } from '@/lib/content'
import { evictionRisk, evictionTrust } from '@/lib/creator-house'
import { tr } from '@/lib/lang'

// Creator House eviction risk — the CH equivalent of cricket's focused goal.
// In CH, your ALLY BOND (who has your back at the vote) decides how close eviction gets.
//   focus (Live)  → the ONE number you optimise: your eviction risk + the safety line.
//   slim  (Feed)  → a one-liner under the 3-meter overview.

const idToDay: Record<string, number> = Object.fromEntries(getCHSituations().map(s => [s.id, s.day]))
const TOTAL_DAYS = 10

// Follower-pressure tiers (psychological only — the player is never actually evicted).
// Severity ramp: teal (safe) → gold (on the block) → orange (name leading the vote).
const STATUS = {
  safe:     { word: 'SAFE',          color: 'var(--trust)' },
  risk:     { word: 'ON THE BLOCK',  color: 'var(--fame)' },
  critical: { word: 'NAME LEADING',  color: 'var(--heat)' },
} as const

export default function CHStatusCard({ variant = 'focus' }: { variant?: 'focus' | 'slim' }) {
  const { game } = useApp()
  if (game.world !== 'creator-house') return null

  const sitId = game.situationQueue[game.situation] ?? game.situationQueue[game.situationQueue.length - 1]
  const day = (sitId && idToDay[sitId]) || 1
  const risk = evictionRisk(evictionTrust(game), day)

  // After the last eviction (day > 7) it's the finale stretch — no eviction to fear.
  if (!risk) {
    if (variant === 'slim') {
      return (
        <div style={{ padding: '10px 16px', background: 'var(--surf)', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink2)' }}>
            {tr(`FINALE · Din ${TOTAL_DAYS} — sab evictions survive kar li`, `FINALE · Day ${TOTAL_DAYS} — survived every eviction`)}
          </span>
        </div>
      )
    }
    return (
      <div style={{ width: 'calc(100% - 24px)', margin: '8px 12px 0', background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 16px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)', marginBottom: 4 }}>{tr('FINALE AA RAHA HAI', 'FINALE INCOMING')}</div>
        <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.45 }}>{tr(`Sari evictions nikal gayi. Day ${TOTAL_DAYS} ko tumhaari kahani tay hoti hai.`, `Every eviction is behind you. Day ${TOTAL_DAYS} decides your story.`)}</div>
      </div>
    )
  }

  const st = STATUS[risk.status]
  const safe = risk.status === 'safe'

  // ── SLIM (Feed) ──
  if (variant === 'slim') {
    return (
      <div style={{ padding: '10px 16px', background: 'var(--surf)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>{tr(`DIN ${risk.day} EVICTION`, `DAY ${risk.day} EVICTION`)}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: st.color }}>{st.word}</span>
          <span style={{ fontSize: 11, color: 'var(--ink3)', marginLeft: 'auto' }}>TRUST {Math.round(risk.trust)}/{risk.threshold}</span>
        </div>
      </div>
    )
  }

  // ── FOCUS (Live) — the one number you optimise ──
  const remaining = Math.max(0, risk.threshold - risk.trust)
  return (
    <div style={{
      width: 'calc(100% - 24px)', margin: '8px 12px 0',
      background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 14, padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>FOLLOWERS WATCHING</span>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.06em', color: 'var(--ink3)' }}>{tr(`DIN ${risk.day} EVICTION · DAY ${day}/${TOTAL_DAYS}`, `DAY ${risk.day} EVICTION · DAY ${day}/${TOTAL_DAYS}`)}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 9 }}>
        <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 28, lineHeight: 1, color: st.color }}>{st.word}</span>
        <span style={{ fontSize: 12, color: 'var(--ink3)' }}>TRUST {Math.round(risk.trust)} · safe at {risk.threshold}</span>
      </div>

      {/* TRUST bar with the safety line marked */}
      <div style={{ position: 'relative', height: 7, borderRadius: 4, background: 'rgba(255,255,255,.08)', overflow: 'hidden', marginBottom: 9 }}>
        <span style={{ display: 'block', height: '100%', borderRadius: 4, width: `${Math.min(100, risk.trust)}%`, background: st.color, transition: 'width .5s ease' }} />
        <span style={{ position: 'absolute', top: -2, bottom: -2, left: `${risk.threshold}%`, width: 2, background: 'var(--ink2)' }} />
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--ink3)', lineHeight: 1.4 }}>
        {safe
          ? tr('→ Ghar tumhaare saath hai. Eviction night pe naam nahi aayega.', "→ The house has your back. Your name won't come up on eviction night.")
          : tr(`→ ${remaining} TRUST aur chahiye — DM mein log se trust banao. Naam top pe aaya toh followers bachate hain, par ghar note karta hai.`, `→ ${remaining} more TRUST needed — build it with people in the DMs. If your name tops the vote, your followers save you — but the house remembers.`)}
      </div>
    </div>
  )
}
