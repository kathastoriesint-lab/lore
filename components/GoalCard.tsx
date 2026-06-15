'use client'
import { useApp } from '@/lib/context'
import { getWeek, evaluateGate, surfaceHint, SEASON_WEEKS } from '@/lib/season'

// Persistent goal banner — always answers: what am I aiming at, how close, where to go.
//  • full  — the lock-screen interlude card (all gate rows + hint)
//  • slim  — one-liner pinned atop DM screens
//  • focus — Live: the ONE number that matters, big and unmistakable. No 3-meter
//            HUD competes with it on Live, so the gap (40 → 45) reads instantly.
type Variant = 'full' | 'slim' | 'focus'

export default function GoalCard({ variant = 'full' }: { variant?: Variant }) {
  const { game, dmTrust, navigate } = useApp()

  if (game.world !== 'cricket') return null
  const week = game.week ?? 1
  if (week >= SEASON_WEEKS.length && !game.lockExpiresAt) return null

  const nextWeek = getWeek(Math.min(week + 1, SEASON_WEEKS.length))
  if (nextWeek.gate.length === 0) return null

  const { passed, gaps } = evaluateGate(nextWeek.gate, game.meters, dmTrust)
  const firstUnmet = gaps.find(g => !g.passed)
  const locked = !!game.lockExpiresAt
  const accent = 'var(--fame)'

  // ── SLIM (DM screens) ───────────────────────────────────────────────────────
  if (variant === 'slim') {
    return (
      <button
        onClick={() => { if (locked) navigate('lock') }}
        style={{
          display: 'block', width: '100%', textAlign: 'left', border: 'none',
          background: 'var(--surf)', borderBottom: '1px solid var(--line)',
          padding: '12px 16px', minHeight: 44, cursor: locked ? 'pointer' : 'default',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.1em', color: passed ? 'var(--trust)' : accent }}>
            {passed ? 'GOAL MET' : 'NEXT'}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {nextWeek.name}{firstUnmet ? ` · ${firstUnmet.label} ${firstUnmet.current}/${firstUnmet.threshold}` : ' · ready'}
          </span>
          {firstUnmet && (
            <span style={{ width: 52, height: 3, borderRadius: 2, background: 'rgba(255,255,255,.1)', overflow: 'hidden', flexShrink: 0 }}>
              <span style={{ display: 'block', width: `${Math.min(100, (firstUnmet.current / firstUnmet.threshold) * 100)}%`, height: '100%', background: accent }} />
            </span>
          )}
        </div>
      </button>
    )
  }

  // ── FOCUS (Live) — the one number you're optimizing, big ─────────────────────
  if (variant === 'focus') {
    const single = gaps.length === 1
    const bar = (cur: number, target: number, met: boolean) => (
      <span style={{ display: 'block', height: 7, borderRadius: 4, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
        <span style={{ display: 'block', height: '100%', borderRadius: 4, width: `${Math.min(100, (cur / target) * 100)}%`, background: met ? 'var(--trust)' : accent, transition: 'width .5s ease' }} />
      </span>
    )
    return (
      <div
        onClick={() => { if (locked) navigate('lock') }}
        style={{
          width: 'calc(100% - 24px)', margin: '8px 12px 0', cursor: locked ? 'pointer' : 'default',
          background: 'var(--surf)', border: '1px solid var(--line)',
          borderRadius: 14, padding: '12px 16px',
        }}
      >
        {/* header: LIVE + week name */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="live-badge" style={{ margin: 0 }}><span className="pulse" />LIVE</span>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.08em', color: passed ? 'var(--trust)' : 'var(--ink3)' }}>
            {passed ? 'GOAL READY' : `GOAL · ${nextWeek.name.toUpperCase()}`}
          </span>
        </div>

        {single ? (() => {
          const g = gaps[0]
          const remaining = Math.max(0, g.threshold - g.current)
          return (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>{g.label}</span>
                {!g.passed && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink2)' }}>
                    {remaining} aur chahiye
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 9 }}>
                <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 40, lineHeight: 1, color: g.passed ? 'var(--trust)' : accent, fontVariantNumeric: 'tabular-nums' }}>
                  {g.current}
                </span>
                <span style={{ fontSize: 18, color: 'var(--ink3)', fontWeight: 600 }}>→ {g.threshold}</span>
              </div>
              {bar(g.current, g.threshold, g.passed)}
              <div style={{ fontSize: 11.5, color: 'var(--ink3)', marginTop: 9, lineHeight: 1.4 }}>
                {g.passed ? '✓ Goal poora — squad announcement aa raha hai' : `→ ${surfaceHint(g)}`}
              </div>
            </>
          )
        })() : (
          // multi-gate (the finale): a compact focused row per requirement
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {gaps.map(g => (
              <div key={g.label}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.06em', color: g.passed ? 'var(--trust)' : 'var(--ink3)' }}>
                    {g.passed ? '✓ ' : ''}{g.label}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: g.passed ? 'var(--trust)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                    {g.current} <span style={{ color: 'var(--ink3)', fontSize: 12 }}>→ {g.threshold}</span>
                  </span>
                </div>
                {bar(g.current, g.threshold, g.passed)}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── FULL (lock-screen interlude) ─────────────────────────────────────────────
  return (
    <button
      onClick={() => { if (locked) navigate('lock') }}
      style={{
        display: 'block', width: 'calc(100% - 24px)', margin: '8px 12px 0', textAlign: 'left',
        background: 'var(--surf)', border: '1px solid var(--line)',
        borderRadius: 12, padding: '10px 14px', cursor: locked ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', color: passed ? 'var(--trust)' : accent }}>
          {passed ? '✓ GOAL MET' : 'NEXT GOAL'}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>
          Week {Math.min(week + 1, SEASON_WEEKS.length)} — {nextWeek.name}
        </span>
      </div>

      {gaps.map(g => (
        <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.06em', color: g.passed ? 'var(--trust)' : 'var(--ink3)', width: 92, flexShrink: 0 }}>
            {g.passed ? '✓ ' : ''}{g.label}
          </span>
          <span style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
            <span style={{
              display: 'block', height: '100%', borderRadius: 2,
              width: `${Math.min(100, (g.current / g.threshold) * 100)}%`,
              background: g.passed ? 'var(--trust)' : accent,
              transition: 'width .5s ease',
            }} />
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: g.passed ? 'var(--trust)' : 'var(--ink2)', width: 44, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
            {g.current}/{g.threshold}
          </span>
        </div>
      ))}

      {firstUnmet && (
        <div style={{ fontSize: 10.5, color: 'var(--ink3)', marginTop: 7, lineHeight: 1.4 }}>
          → {surfaceHint(firstUnmet)}
        </div>
      )}
      {passed && locked && (
        <div style={{ fontSize: 10.5, color: accent, marginTop: 7, fontWeight: 700 }}>
          → Squad announcement is ready. Tap to see it.
        </div>
      )}
    </button>
  )
}
