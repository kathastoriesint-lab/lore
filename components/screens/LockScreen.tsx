'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import { getWeek, evaluateGate, SEASON_WEEKS } from '@/lib/season'
import { resolveTokens } from '@/lib/game'
import { analytics } from '@/lib/analytics'
import GoalCard from '@/components/GoalCard'

function fmtCountdown(ms: number): string {
  if (ms <= 0) return '00:00'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// The interlude hub. Live is locked behind the match calendar; the player
// grinds Nets/DMs/Feed (or just hangs out) until the gate is met or the
// clock runs out. Diegetic throughout — this is a squad-selection wait,
// never an energy bar.
export default function LockScreen() {
  const { game, dmTrust, navigate, resolveInterlude, restartInterlude, screen } = useApp()
  const [now, setNow] = useState(Date.now())
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const expiredTracked = useRef(false)

  const week = game.week ?? 1
  const nextWeekNo = Math.min(week + 1, SEASON_WEEKS.length)
  const nextWeek = getWeek(nextWeekNo)
  const { passed, gaps } = useMemo(
    () => evaluateGate(nextWeek.gate, game.meters, dmTrust),
    [nextWeek, game.meters, dmTrust],
  )

  const expiresAt = game.lockExpiresAt ?? 0
  const remaining = expiresAt - now
  const expired = remaining <= 0

  // Tick the clock
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // lock_expired — the gate-tuning signal (fires once per interlude view)
  useEffect(() => {
    if (expired && !passed && !expiredTracked.current) {
      expiredTracked.current = true
      analytics.track('lock_expired', 'cricket', {
        week: nextWeekNo,
        meters: game.meters,
        gate_gap: gaps.filter(g => !g.passed).map(g => `${g.label}:${g.current}/${g.threshold}`).join(','),
      })
    }
  }, [expired, passed, nextWeekNo, game.meters, gaps])

  // No active lock (e.g. direct nav) — bounce back to live. Gated on being the
  // visible screen: Slots keep every screen mounted, so an unguarded effect here
  // would hijack all navigation whenever no lock is active.
  useEffect(() => {
    if (screen === 'lock' && !game.lockExpiresAt) navigate('live', { replace: true })
  }, [screen, game.lockExpiresAt, navigate])
  if (!game.lockExpiresAt) return null

  const isHardGate = !!nextWeek.hardGate
  const announcementReady = passed || expired
  const variant: 'success' | 'fail' = passed ? 'success' : 'fail'
  const beatText = resolveTokens(
    passed ? nextWeek.successBeat : nextWeek.failBeat,
    game.playerName, game.playerGender,
  )

  // ── Announcement overlay ──
  if (showAnnouncement) {
    const hardFail = isHardGate && !passed
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        background: 'var(--bg)', padding: '0 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: passed
            ? 'radial-gradient(ellipse 120% 50% at 50% -10%, rgba(255,210,77,.16) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 120% 50% at 50% -10%, rgba(255,255,255,.06) 0%, transparent 70%)',
        }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.16em', color: passed ? '#ffd24d' : 'var(--ink3)', marginBottom: 14 }}>
            {hardFail ? 'SELECTORS’ VERDICT' : 'SQUAD ANNOUNCEMENT'}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, lineHeight: 1.45, color: 'var(--ink)' }}>
            {beatText}
          </div>
        </div>
        <div style={{ paddingBottom: 48, position: 'relative' }}>
          {hardFail ? (
            <button
              onClick={() => { restartInterlude(); setShowAnnouncement(false); expiredTracked.current = false }}
              style={{
                width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
                background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 15,
                fontFamily: 'var(--sans)', cursor: 'pointer',
              }}
            >
              Next selectors&rsquo; meeting →
            </button>
          ) : (
            <button
              onClick={() => { resolveInterlude(variant); navigate('live', { replace: true }) }}
              style={{
                width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
                background: passed ? '#ffd24d' : 'var(--accent)', color: passed ? '#1a1208' : '#fff',
                fontWeight: 800, fontSize: 15, fontFamily: 'var(--sans)', cursor: 'pointer',
                boxShadow: passed ? '0 8px 32px rgba(255,210,77,.35)' : 'none',
              }}
            >
              Week {nextWeekNo}: {nextWeek.name} →
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Interlude hub ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{ padding: '52px 20px 4px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', color: 'var(--ink3)' }}>
          BETWEEN MATCHES
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, marginTop: 6, lineHeight: 1.3 }}>
          {nextWeek.lockCopy}
        </div>
      </div>

      {/* Clock */}
      <div style={{ padding: '14px 20px 4px', display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>
          {announcementReady ? 'DECISION IN' : 'SQUAD DECISION IN'}
        </span>
        <span style={{
          fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600,
          color: announcementReady ? '#ffd24d' : 'var(--ink)', fontVariantNumeric: 'tabular-nums',
        }}>
          {announcementReady ? 'NOW' : fmtCountdown(remaining)}
        </span>
      </div>

      {/* Goal card */}
      <GoalCard />

      {/* Announcement CTA when ready */}
      {announcementReady && (
        <div style={{ padding: '14px 12px 0' }}>
          <button
            onClick={() => setShowAnnouncement(true)}
            style={{
              width: '100%', padding: '15px 0', borderRadius: 14, border: 'none',
              background: passed ? '#ffd24d' : 'var(--accent)', color: passed ? '#1a1208' : '#fff',
              fontWeight: 800, fontSize: 15, fontFamily: 'var(--sans)', cursor: 'pointer',
              boxShadow: passed ? '0 8px 32px rgba(255,210,77,.35)' : '0 8px 28px rgba(255,45,120,.3)',
            }}
          >
            {passed ? 'See the squad announcement →' : 'The announcement is out →'}
          </button>
        </div>
      )}

      {/* Activities */}
      <div style={{ padding: '18px 12px 0', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', color: 'var(--ink3)', padding: '0 4px' }}>
          UNTIL THEN
        </div>

        {[
          {
            id: 'nets', title: 'Hit the nets', sub: `Form work — ${3 - (game.interlude?.netsUsed ?? 0)} sessions left today`,
            meter: 'FORM +', color: 'var(--fame)', screen: 'nets' as const,
            disabled: (game.interlude?.netsUsed ?? 0) >= 3,
          },
          {
            id: 'dms', title: 'The group chat is alive', sub: 'Talk to the room — trust is earned in DMs',
            meter: 'TRUST +', color: 'var(--trust)', screen: 'dm-inbox' as const, disabled: false,
          },
          {
            id: 'feed', title: 'India is talking', sub: 'Work your feed — post, reply, be seen',
            meter: 'FAME +', color: 'var(--heat)', screen: 'feed' as const, disabled: false,
          },
        ].map(a => (
          <button
            key={a.id}
            onClick={() => { if (!a.disabled) navigate(a.screen) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left',
              background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 16,
              padding: '14px 16px', cursor: a.disabled ? 'default' : 'pointer',
              opacity: a.disabled ? 0.45 : 1, width: '100%',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{a.title}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink3)', marginTop: 3 }}>
                {a.disabled ? 'Body needs rest — more tomorrow' : a.sub}
              </div>
            </div>
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: '.06em', color: a.color,
              border: `1px solid color-mix(in srgb, ${a.color} 40%, transparent)`,
              background: `color-mix(in srgb, ${a.color} 12%, transparent)`,
              padding: '3px 8px', borderRadius: 6, flexShrink: 0,
            }}>{a.meter}</span>
          </button>
        ))}

        <div style={{ fontSize: 11, color: 'var(--ink3)', padding: '6px 4px 0', lineHeight: 1.5 }}>
          Or just hang out — the room remembers who shows up.
        </div>
      </div>

      <div style={{ height: 28 }} />
    </div>
  )
}
