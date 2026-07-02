'use client'
import { useMemo, useState } from 'react'
import { useApp } from '@/lib/context'
import { NET_SESSIONS, INTERLUDE_CAPS } from '@/lib/season'
import { asCricket } from '@/lib/game'
import { analytics } from '@/lib/analytics'

// Interlude Form grind: 30-second one-choice scenes against the diminishing
// schedule (+4/+2/+1). The risky option reads your current Form through its
// threshold — the same drill plays out differently at Form 30 vs Form 55.
export default function NetsScreen() {
  const { game, goBack, completeNetSession } = useApp()
  const [phase, setPhase] = useState<'scene' | 'outcome'>('scene')
  // title snapshotted at choice time — `session` advances to the next drill the
  // moment netsUsed increments, so the outcome must not read it live.
  const [outcome, setOutcome] = useState<{ note: string; gain: number; passed: boolean | null; title: string } | null>(null)

  const used = game.interlude?.netsUsed ?? 0
  const capped = used >= INTERLUDE_CAPS.netSessions

  // Rotate through the drill pool so back-to-back sessions differ
  const session = useMemo(() => NET_SESSIONS[used % NET_SESSIONS.length], [used])

  const baseGain = INTERLUDE_CAPS.netGains[Math.min(used, INTERLUDE_CAPS.netGains.length - 1)] ?? 1

  const choose = (risky: boolean) => {
    if (capped || phase === 'outcome') return
    let gain = baseGain
    let note: string
    let passed: boolean | null = null
    if (risky) {
      passed = asCricket(game.meters).form > session.risky.threshold
      gain = Math.max(1, baseGain + (passed ? 1 : -1))
      note = passed ? session.risky.pass : session.risky.fail
    } else {
      note = session.safe.note
    }
    setOutcome({ note, gain, passed, title: session.title })
    setPhase('outcome')
    completeNetSession(gain)
    analytics.track('net_session_completed', 'cricket', {
      session_id: session.id,
      risky,
      passed,
      form_gain: gain,
      sessions_used: used + 1,
    })
  }

  // Capped — body needs rest
  if (capped && phase !== 'outcome') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)', padding: '0 28px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', color: 'var(--ink3)', marginBottom: 12 }}>NETS — CLOSED</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, lineHeight: 1.5 }}>
            Teen sessions ho gaye. Physio ne lights band karwa di — &ldquo;Recovery bhi training hai, champ.&rdquo;
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 14, lineHeight: 1.6 }}>
            More nets when the next match week opens. Until then — the room is awake, and the feed never sleeps.
          </div>
        </div>
        <div style={{ paddingBottom: 48 }}>
          <button onClick={() => goBack()} style={{
            width: '100%', padding: '15px 0', borderRadius: 14, border: '1px solid rgba(255,255,255,.15)',
            background: 'rgba(255,255,255,.06)', color: 'var(--ink)', fontWeight: 700, fontSize: 14,
            fontFamily: 'var(--sans)', cursor: 'pointer',
          }}>← Back</button>
        </div>
      </div>
    )
  }

  // Outcome view
  if (phase === 'outcome' && outcome) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)', padding: '0 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: outcome.passed !== false
            ? 'radial-gradient(ellipse 120% 50% at 50% -10%, color-mix(in srgb, var(--trust) 12%, transparent) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 120% 50% at 50% -10%, color-mix(in srgb, var(--fame) 10%, transparent) 0%, transparent 70%)',
        }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', color: 'var(--ink3)', marginBottom: 12 }}>
            {outcome.title.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, lineHeight: 1.55 }}>
            {outcome.note}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 22,
            background: 'color-mix(in srgb, var(--trust) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--trust) 30%, transparent)',
            borderRadius: 10, padding: '8px 14px', alignSelf: 'flex-start',
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: 'var(--trust)' }}>
              FORM +{outcome.gain}
            </span>
            <span style={{ fontSize: 11, color: 'var(--ink3)' }}>
              → {asCricket(game.meters).form}
            </span>
          </div>
        </div>
        <div style={{ paddingBottom: 48, position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {used < INTERLUDE_CAPS.netSessions && (
            <button onClick={() => { setPhase('scene'); setOutcome(null) }} style={{
              width: '100%', padding: '15px 0', borderRadius: 14, border: 'none',
              background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 14,
              fontFamily: 'var(--sans)', cursor: 'pointer',
            }}>One more session ({INTERLUDE_CAPS.netSessions - used} left) →</button>
          )}
          <button onClick={() => goBack()} style={{
            width: '100%', padding: '13px 0', borderRadius: 14, border: '1px solid rgba(255,255,255,.12)',
            background: 'transparent', color: 'var(--ink3)', fontWeight: 600, fontSize: 13,
            fontFamily: 'var(--sans)', cursor: 'pointer',
          }}>← Back to the dressing room</button>
        </div>
      </div>
    )
  }

  // Scene + choice
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ padding: '52px 24px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', color: 'var(--fame)' }}>
            NETS · SESSION {used + 1} OF {INTERLUDE_CAPS.netSessions}
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.08em', color: 'var(--ink3)' }}>
            FORM {asCricket(game.meters).form}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 23, fontWeight: 600, marginTop: 10, lineHeight: 1.3 }}>
          {session.title}
        </div>
        <div style={{ fontSize: 14.5, color: 'var(--ink2)', lineHeight: 1.7, marginTop: 16 }}>
          {session.scene}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
          <button onClick={() => choose(false)} style={{
            width: '100%', padding: '15px 16px', borderRadius: 14, textAlign: 'left',
            border: '1px solid rgba(255,255,255,.14)', background: 'var(--surf)',
            color: 'var(--ink)', fontWeight: 600, fontSize: 14, fontFamily: 'var(--sans)',
            cursor: 'pointer', lineHeight: 1.4,
          }}>{session.safe.label}</button>
          <button onClick={() => choose(true)} style={{
            width: '100%', padding: '15px 16px', borderRadius: 14, textAlign: 'left',
            border: '1px solid rgba(255,45,120,.35)', background: 'rgba(255,45,120,.08)',
            color: 'var(--ink)', fontWeight: 600, fontSize: 14, fontFamily: 'var(--sans)',
            cursor: 'pointer', lineHeight: 1.4,
          }}>{session.risky.label}</button>
          <button onClick={() => goBack()} style={{
            background: 'none', border: 'none', color: 'var(--ink3)', fontSize: 12,
            fontWeight: 600, padding: '12px 0', minHeight: 44, cursor: 'pointer', fontFamily: 'var(--sans)',
          }}>← Not now</button>
        </div>
      </div>
      <div style={{ height: 16 }} />
    </div>
  )
}
