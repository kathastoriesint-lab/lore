'use client'
import { useApp } from '@/lib/context'
import { weekForSituationId } from '@/lib/season'
import { ruleFor, captainTrust, captainTier, beatsToAnnouncement } from '@/lib/cricket-selection'
import { asCricket } from '@/lib/game'

// Persistent goal banner — always answers: what am I aiming at, how close, where to go.
// Two goals, one heartbeat: FORM + CAPTAIN'S TRUST vs the next squad announcement.
//  • focus — Live: "SQUAD ANNOUNCEMENT · in N beats" + both goal bars
//  • slim  — one-liner pinned atop DM screens
//  • full  — full breakdown (selection gate card / detours)
type Variant = 'full' | 'slim' | 'focus'

export default function GoalCard({ variant = 'full' }: { variant?: Variant }) {
  const { game, dmTrust, navigate, openDMThread } = useApp()

  if (game.world !== 'cricket') return null

  // The week whose selection we're driving toward: the CURRENT beat's week
  // (falls back to game.week for the post-trigger window).
  const curId = game.situationQueue[Math.min(game.situation, Math.max(0, game.situationQueue.length - 1))]
  const week = curId ? weekForSituationId(curId) : (game.week ?? 1)
  const rule = ruleFor(week)
  const form = asCricket(game.meters).form
  const captain = captainTrust(dmTrust)
  const beats = beatsToAnnouncement(game.situationQueue, game.situation)
  const announcementReady = !!game.pendingSelection
  const seasonOver = beats === null && !announcementReady

  if (seasonOver) return null

  const formOk = form >= rule.start.form
  const captainOk = captain >= rule.start.captain
  const ready = formOk && captainOk

  const bar = (val: number, need: number, color: string) => (
    <span style={{ position: 'relative', flex: 1, height: 4, borderRadius: 3, background: 'rgba(255,255,255,.09)', overflow: 'hidden', display: 'block' }}>
      <span style={{ display: 'block', width: `${Math.min(100, val)}%`, height: '100%', background: color, transition: 'width .5s ease' }} />
      <span style={{ position: 'absolute', left: `${Math.min(100, need)}%`, top: 0, bottom: 0, width: 1.5, background: 'rgba(255,255,255,.55)' }} />
    </span>
  )

  // ── SLIM (DM screens) ───────────────────────────────────────────────────────
  if (variant === 'slim') {
    return (
      <button
        onClick={() => { if (announcementReady) navigate('selection') }}
        style={{
          display: 'block', width: '100%', textAlign: 'left', border: 'none',
          background: 'var(--surf)', borderBottom: '1px solid var(--line)',
          padding: '12px 16px', minHeight: 44, cursor: announcementReady ? 'pointer' : 'default',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.1em', color: ready ? 'var(--trust)' : 'var(--fame)' }}>
            {announcementReady ? 'TEAM SHEET READY' : `SELECTION W${week}`}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Form {form}/{rule.start.form} · Captain {captain}/{rule.start.captain}
          </span>
        </div>
      </button>
    )
  }

  // ── FOCUS (Live) — the founder's reference: split columns, big numbers,
  //    a tick at the target, and exactly what's missing in the meter's color. ──
  if (variant === 'focus') {
    const col = (
      icon: string, label: string, val: number, need: number, color: string,
      onTap?: () => void,
    ) => {
      const gap = Math.max(0, need - val)
      const inner = (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 11 }}>{icon}</span>
            <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>{label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 19, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{val}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink3)' }}>/ {need}</span>
          </div>
          <div style={{ position: 'relative', height: 7, borderRadius: 5, background: 'rgba(255,255,255,.09)', margin: '9px 0 7px' }}>
            <div style={{ width: `${Math.min(100, val)}%`, height: '100%', borderRadius: 5, background: color, transition: 'width .6s cubic-bezier(.32,.72,0,1)' }} />
            <div style={{ position: 'absolute', left: `${Math.min(100, need)}%`, top: -2.5, bottom: -2.5, width: 2.5, borderRadius: 2, background: 'rgba(255,255,255,.75)' }} />
          </div>
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.08em', color: gap > 0 ? color : 'var(--trust)' }}>
            {gap > 0 ? `+${gap} CHAHIYE` : 'READY ✓'}
          </div>
        </>
      )
      return onTap
        ? <button onClick={onTap} style={{ flex: 1, background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', minWidth: 0 }}>{inner}</button>
        : <div style={{ flex: 1, minWidth: 0 }}>{inner}</div>
    }
    return (
      <div style={{ margin: '10px 14px 0', background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 18, padding: '13px 15px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ color: 'var(--fame)', fontSize: 10 }}>◆</span>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: '#fff', whiteSpace: 'nowrap' }}>SQUAD ANNOUNCEMENT</span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ background: 'var(--fame)', color: '#08080F', fontSize: 9.5, fontWeight: 800, letterSpacing: '.04em', borderRadius: 30, padding: '3px 9px', whiteSpace: 'nowrap' }}>
              {announcementReady ? 'READY' : `${beats} BEAT${beats === 1 ? '' : 'S'}`}
            </span>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.06em', color: 'var(--ink3)', whiteSpace: 'nowrap' }}>
              {announcementReady ? `WK ${week}` : `LEFT · WK ${week}`}
            </span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 15 }}>
          {col('🏏', 'FORM', form, rule.start.form, '#FFB020')}
          <div style={{ width: 1, background: 'var(--line)', margin: '2px 0' }} />
          {col('🤝', 'TRUST', captain, rule.start.captain, 'var(--trust)', () => openDMThread('hardik'))}
        </div>
        {announcementReady && (
          <button onClick={() => navigate('selection')} style={{
            width: '100%', marginTop: 12, padding: '11px 0', borderRadius: 12, border: 'none',
            background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: 13,
            fontFamily: 'var(--sans)', cursor: 'pointer',
          }}>Squad announcement →</button>
        )}
      </div>
    )
  }

  // ── FULL — legacy breakdown (kept for any remaining callers) ─────────────────
  const compact = false as boolean
  return (
    <div style={{
      margin: compact ? '10px 14px 0' : 0,
      background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 16,
      padding: compact ? '12px 14px' : '16px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.12em', color: announcementReady ? 'var(--trust)' : 'var(--fame)' }}>
          {announcementReady
            ? 'SQUAD ANNOUNCEMENT — READY'
            : `SQUAD ANNOUNCEMENT · ${beats === 1 ? 'AFTER THIS BEAT' : `IN ${beats} BEATS`}`}
        </span>
        <span style={{ fontSize: 10, color: 'var(--ink3)', marginLeft: 'auto' }}>Week {week}</span>
      </div>

      {/* THE loud objective — one specific chase, always answering "what now?" */}
      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 10 }}>
        🎯 {ready
          ? 'Sheet pakki lag rahi hai — DM mein baat karke pakka karo'
          : !captainOk && !formOk
            ? `Form +${rule.start.form - form} aur Hardik +${rule.start.captain - captain} — dono is sheet se pehle`
            : !captainOk
              ? `Hardik ko ${rule.start.captain} tak le jao — is hafte ki sheet ke liye`
              : `Form ${rule.start.form} chahiye — agla beat sab badal sakta hai`}
      </div>

      {/* FORM */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, color: '#FFB020', width: compact ? 44 : 92 }}>🏏 {compact ? '' : 'FORM '}{form}</span>
        {bar(form, rule.start.form, '#FFB020')}
        <span style={{ fontSize: 10, fontWeight: 700, color: formOk ? 'var(--trust)' : 'var(--ink3)', width: 40, textAlign: 'right' }}>
          {formOk ? '✓' : `${rule.start.form} req`}
        </span>
      </div>

      {/* CAPTAIN'S TRUST — tappable, routes into Hardik's DM (that's where it's built) */}
      <button
        onClick={() => openDMThread('hardik')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--trust)', width: compact ? 44 : 92, textAlign: 'left' }}>🧢 {compact ? '' : 'CAPTAIN '}{captain}</span>
        {bar(captain, rule.start.captain, 'var(--trust)')}
        <span style={{ fontSize: 10, fontWeight: 700, color: captainOk ? 'var(--trust)' : 'var(--ink3)', width: 40, textAlign: 'right' }}>
          {captainOk ? '✓' : `${rule.start.captain} req`}
        </span>
      </button>

      {!compact && (
        <div style={{ fontSize: 10.5, color: 'var(--ink3)', marginTop: 10, lineHeight: 1.5 }}>
          {ready
            ? 'Dono bars clear. Sheet pe naam pakka lag raha hai.'
            : !captainOk
              ? `Captain ka bharosa ${captain} (${captainTier(captain)}). DM pe baat karo — wahi build hota hai. Lifeline bar: ${rule.lifeline.captain}.`
              : 'Form kam hai — ab captain ko itna jeeto ki woh naam laga de.'}
        </div>
      )}

      {announcementReady && (
        <button onClick={() => navigate('selection')} style={{
          width: '100%', marginTop: 12, padding: '11px 0', borderRadius: 12, border: 'none',
          background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: 13,
          fontFamily: 'var(--sans)', cursor: 'pointer',
        }}>Squad announcement →</button>
      )}
    </div>
  )
}
