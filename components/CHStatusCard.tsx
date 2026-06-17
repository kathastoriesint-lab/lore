'use client'
import { useApp } from '@/lib/context'
import { getCHSituations } from '@/lib/content'
import { evictionRisk } from '@/lib/creator-house'

// Creator House eviction risk — the CH equivalent of cricket's focused goal.
// In CH, TRUST (the "log ka bharosa" meter) decides who survives eviction night.
//   focus (Live)  → the ONE number you optimise: your eviction risk + the safety line.
//   slim  (Feed)  → a one-liner under the 3-meter overview.

const idToDay: Record<string, number> = Object.fromEntries(getCHSituations().map(s => [s.id, s.day]))
const TOTAL_DAYS = 10

const STATUS = {
  safe:     { word: 'SAFE',         color: 'var(--trust)' },
  risk:     { word: 'AT RISK',      color: 'var(--fame)' },
  critical: { word: 'KHATRE MEIN',  color: 'var(--heat)' },
} as const

export default function CHStatusCard({ variant = 'focus' }: { variant?: 'focus' | 'slim' }) {
  const { game } = useApp()
  if (game.world !== 'creator-house') return null

  const sitId = game.situationQueue[game.situation] ?? game.situationQueue[game.situationQueue.length - 1]
  const day = (sitId && idToDay[sitId]) || 1
  const risk = evictionRisk(game.meters.image, day)

  // After the last eviction (day > 7) it's the finale stretch — no eviction to fear.
  if (!risk) {
    if (variant === 'slim') {
      return (
        <div style={{ padding: '10px 16px', background: 'var(--surf)', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink2)' }}>
            FINALE · Din {TOTAL_DAYS} — sab evictions survive kar li
          </span>
        </div>
      )
    }
    return (
      <div style={{ width: 'calc(100% - 24px)', margin: '8px 12px 0', background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 16px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)', marginBottom: 4 }}>FINALE AA RAHA HAI</div>
        <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.45 }}>Sari evictions nikal gayi. Day {TOTAL_DAYS} ko tumhaari kahani tay hoti hai.</div>
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
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>DIN {risk.day} EVICTION</span>
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
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>EVICTION RISK</span>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.06em', color: 'var(--ink3)' }}>DIN {risk.day} · DAY {day}/{TOTAL_DAYS}</span>
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
          ? '→ Ghar tumhaare saath hai. Naam nahi aayega.'
          : `→ ${remaining} TRUST aur chahiye — DMs mein log banao, warna naam aa sakta hai.`}
      </div>
    </div>
  )
}
