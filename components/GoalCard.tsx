'use client'
import { useApp } from '@/lib/context'
import { getWeek, evaluateGate, surfaceHint, SEASON_WEEKS } from '@/lib/season'

// Persistent goal banner — the legibility fix. Always answers:
// what am I aiming at, how close am I, where do I go.
// Full variant sits under MeterHUD (Live/Feed); slim variant pins atop DM screens.
export default function GoalCard({ slim = false }: { slim?: boolean }) {
  const { game, dmTrust, navigate } = useApp()

  if (game.world !== 'cricket') return null
  const week = game.week ?? 1
  if (week >= SEASON_WEEKS.length && !game.lockExpiresAt) return null

  const nextWeek = getWeek(Math.min(week + 1, SEASON_WEEKS.length))
  if (nextWeek.gate.length === 0) return null

  const { passed, gaps } = evaluateGate(nextWeek.gate, game.meters, dmTrust)
  const firstUnmet = gaps.find(g => !g.passed)
  const locked = !!game.lockExpiresAt

  const accent = passed ? '#ffd24d' : '#ffb13d'

  if (slim) {
    return (
      <button
        onClick={() => { if (locked) navigate('lock') }}
        style={{
          display: 'block', width: '100%', textAlign: 'left', border: 'none',
          background: 'rgba(255,177,61,.08)', borderBottom: '1px solid rgba(255,177,61,.18)',
          padding: '8px 16px', cursor: locked ? 'pointer' : 'default',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.1em', color: accent }}>
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

  return (
    <button
      onClick={() => { if (locked) navigate('lock') }}
      style={{
        display: 'block', width: 'calc(100% - 24px)', margin: '8px 12px 0', textAlign: 'left',
        background: passed ? 'rgba(255,210,77,.1)' : 'rgba(255,177,61,.07)',
        border: `1px solid ${passed ? 'rgba(255,210,77,.35)' : 'rgba(255,177,61,.2)'}`,
        borderRadius: 12, padding: '10px 14px', cursor: locked ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', color: accent }}>
          {passed ? '✓ GOAL MET' : 'NEXT GOAL'}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>
          Week {Math.min(week + 1, SEASON_WEEKS.length)} — {nextWeek.name}
        </span>
      </div>

      {gaps.map(g => (
        <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.06em', color: g.passed ? '#3ddc84' : 'var(--ink3)', width: 92, flexShrink: 0 }}>
            {g.passed ? '✓ ' : ''}{g.label}
          </span>
          <span style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
            <span style={{
              display: 'block', height: '100%', borderRadius: 2,
              width: `${Math.min(100, (g.current / g.threshold) * 100)}%`,
              background: g.passed ? '#3ddc84' : accent,
              transition: 'width .5s ease',
            }} />
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: g.passed ? '#3ddc84' : 'var(--ink2)', width: 44, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
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
