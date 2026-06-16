'use client'
import { useApp } from '@/lib/context'
import { getWeek, evaluateGate, surfaceHint, weekForSituationId, SEASON_WEEKS } from '@/lib/season'
import { CRICKET_CHARS } from '@/lib/cricket-data'
import type { CharId } from '@/lib/types'

// Persistent goal banner — always answers: what am I aiming at, how close, where to go.
//  • full  — the lock-screen interlude card (all gate rows + hint)
//  • slim  — one-liner pinned atop DM screens
//  • focus — Live: the ONE number that matters, big and unmistakable. No 3-meter
//            HUD competes with it on Live, so the gap (40 → 45) reads instantly.
type Variant = 'full' | 'slim' | 'focus'

export default function GoalCard({ variant = 'full' }: { variant?: Variant }) {
  const { game, dmTrust, navigate, openDMThread } = useApp()

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

  // ── FOCUS (Live) — three tiers, no clutter ───────────────────────────────────
  // Self-contained week math: BOTH the stage you're on and the goal you're chasing
  // derive from the CURRENT situation's week, so STAGE N and GOAL (week N+1) are
  // always consecutive and can never print the same name. (The outer week/nextWeek
  // off game.week is for the lock-screen variants, where game.week is authoritative.)
  if (variant === 'focus') {
    const curSitId = game.situationQueue[game.situation]
    const curWeekNum = curSitId ? weekForSituationId(curSitId) : (game.week ?? 1)
    const curWeek = getWeek(curWeekNum)
    const posInWeek = curSitId ? Math.max(0, curWeek.situationIds.indexOf(curSitId)) + 1 : 1
    const weekLen = curWeek.situationIds.length

    // The goal is the entry gate of the NEXT stage. On the final stage there's no
    // further gate to chase, so the focus card hides itself.
    const goalWeekNum = curWeekNum + 1
    if (goalWeekNum > SEASON_WEEKS.length) return null
    const goalWeek = getWeek(goalWeekNum)
    const { gaps: gGaps } = evaluateGate(goalWeek.gate, game.meters, dmTrust)
    const single = gGaps.length === 1

    // A DM-surfaced trust gate names a specific person to go talk to. Pull the
    // charId off the gate so the row can route straight into their chat.
    const dmReq = goalWeek.gate.find(r => r.kind === 'charTrust') as { charId: string } | undefined
    const dmCharId = dmReq?.charId as CharId | undefined
    const dmCharName = dmCharId ? (CRICKET_CHARS[dmCharId]?.name.split(' ')[0] ?? dmCharId) : null
    const openTrustDM = (e: React.MouseEvent) => { if (dmCharId) { e.stopPropagation(); openDMThread(dmCharId) } }

    // Short, concrete name for what clearing this stage unlocks (the "what is The
    // Nets" answer, compressed to one phrase).
    const UNLOCK_SHORT: Record<number, string> = {
      2: 'Main nets group',
      3: 'Wankhede debut',
      4: 'Apni jagah pakki',
      5: 'Seniors ka bharosa',
      6: 'India tumhari baat kare',
      7: 'India ka call-up',
    }
    const unlock = UNLOCK_SHORT[goalWeekNum] ?? goalWeek.name

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
        {/* Tier 1 — context: LIVE + which stage, how far in (one muted line) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 11 }}>
          <span className="live-badge" style={{ margin: 0, flexShrink: 0 }}><span className="pulse" />LIVE</span>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.05em', color: 'var(--ink3)', textAlign: 'right' }}>
            STAGE {curWeekNum} · {curWeek.name.toUpperCase()} · {posInWeek}/{weekLen}
          </span>
        </div>

        {single ? (() => {
          const g = gGaps[0]
          const remaining = Math.max(0, g.threshold - g.current)
          return (
            <>
              {/* Tier 2 — hero: the one number, and the gap */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 9 }}>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>{g.label}</span>
                  <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 34, lineHeight: 1, color: g.passed ? 'var(--trust)' : accent, fontVariantNumeric: 'tabular-nums' }}>
                    {g.current}
                  </span>
                  <span style={{ fontSize: 16, color: 'var(--ink3)', fontWeight: 600 }}>→ {g.threshold}</span>
                </span>
              </div>
              {bar(g.current, g.threshold, g.passed)}
              {/* Tier 3 — caption: what clearing this unlocks. A DM-trust gate
                  points at the person and is tappable straight into their chat. */}
              {g.surface === 'dms' && dmCharName && !g.passed ? (
                <button
                  onClick={openTrustDM}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', marginTop: 9,
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    fontFamily: 'var(--sans)', fontSize: 11.5, color: 'var(--trust)', lineHeight: 1.4,
                  }}
                >
                  → {dmCharName} se DM pe baat karke trust banao
                </button>
              ) : (
                <div style={{ fontSize: 12, fontWeight: 700, color: g.passed ? 'var(--trust)' : accent, marginTop: 9, lineHeight: 1.4 }}>
                  {g.passed ? `✓ ${unlock} ready` : `→ ${unlock} ke liye ${remaining} aur`}
                </div>
              )}
            </>
          )
        })() : (
          // multi-gate (the call-up): a compact row per requirement. A DM-trust
          // row is tappable straight into that person's chat.
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {gGaps.map(g => {
              const isDm = g.surface === 'dms' && !!dmCharId && !g.passed
              return (
                <div
                  key={g.label}
                  onClick={isDm ? openTrustDM : undefined}
                  style={{ cursor: isDm ? 'pointer' : 'default' }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.06em', color: g.passed ? 'var(--trust)' : 'var(--ink3)' }}>
                      {g.passed ? '✓ ' : ''}{g.label}{isDm ? ' →' : ''}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: g.passed ? 'var(--trust)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                      {g.current} <span style={{ color: 'var(--ink3)', fontSize: 12 }}>→ {g.threshold}</span>
                    </span>
                  </div>
                  {bar(g.current, g.threshold, g.passed)}
                  {isDm && (
                    <div style={{ fontSize: 10.5, color: 'var(--trust)', marginTop: 5 }}>
                      → {dmCharName} se DM pe baat karke trust banao
                    </div>
                  )}
                </div>
              )
            })}
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
