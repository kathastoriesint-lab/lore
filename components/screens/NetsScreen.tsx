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
  const { game, goBack, completeNetSession, screen } = useApp()
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
            Nets ab agle selection window mein khulenge. Tab tak — DMs mein baat karo, feed pe duniya chal rahi hai.
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

  // Outcome view — the dopamine beat: verdict word + a BIG animated form pop.
  if (phase === 'outcome' && outcome) {
    const verdict = outcome.passed === true ? 'CLEAN HIT' : outcome.passed === false ? 'BEAT HUE — PAR SEEKHA' : 'SOLID SESSION'
    const vColor = outcome.passed === false ? '#FFB020' : 'var(--trust)'
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)', padding: '0 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 120% 50% at 50% -10%, color-mix(in srgb, ${vColor} 14%, transparent) 0%, transparent 70%)`,
        }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', color: 'var(--ink3)', marginBottom: 10 }}>
            {outcome.title.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 600, lineHeight: 1.05, color: vColor, animation: 'netPop .55s cubic-bezier(.2,1.4,.4,1) both' }}>
            {verdict}
          </div>
          {/* the number is the hit */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 18, animation: 'netPop .55s cubic-bezier(.2,1.4,.4,1) .12s both' }}>
            <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 56, lineHeight: 1, color: 'var(--trust)' }}>+{outcome.gain}</span>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.1em', color: 'var(--trust)' }}>FORM</span>
            <span style={{ fontSize: 13, color: 'var(--ink3)', fontWeight: 700 }}>→ ab {asCricket(game.meters).form}</span>
          </div>
          <div style={{ height: 7, borderRadius: 5, background: 'rgba(255,255,255,.08)', marginTop: 16, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, asCricket(game.meters).form)}%`, height: '100%', borderRadius: 5, background: '#FFB020', transition: 'width .9s cubic-bezier(.32,.72,0,1)' }} />
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600, lineHeight: 1.55, marginTop: 20, color: 'var(--ink2)' }}>
            {outcome.note}
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

  // Scene + choice — a real training moment: photo, visible stakes on both options.
  const form = asCricket(game.meters).form
  const riskyOk = form > session.risky.threshold
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      {/* cinematic header */}
      <div style={{
        height: 168, position: 'relative', flexShrink: 0,
        backgroundImage: 'url(/generated/cricket-posts/cr-s15-player.png)',
        backgroundSize: 'cover', backgroundPosition: 'center 22%',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,15,.25), var(--bg))' }} />
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', color: 'var(--fame)' }}>
            NETS · SESSION {used + 1} OF {INTERLUDE_CAPS.netSessions}
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: '#FFB020' }}>
            🏏 FORM {form}
          </div>
        </div>
      </div>
      <div style={{ padding: '14px 24px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 23, fontWeight: 600, lineHeight: 1.3 }}>
          {session.title}
        </div>
        <div style={{ fontSize: 14.5, color: 'var(--ink2)', lineHeight: 1.7, marginTop: 12 }}>
          {session.scene}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
          <button onClick={() => choose(false)} style={{
            width: '100%', padding: '15px 16px', borderRadius: 14, textAlign: 'left',
            border: '1px solid rgba(255,255,255,.14)', background: 'var(--surf)',
            color: 'var(--ink)', fontWeight: 600, fontSize: 14, fontFamily: 'var(--sans)',
            cursor: 'pointer', lineHeight: 1.4,
          }}>
            {session.safe.label}
            <span style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--trust)', marginTop: 5 }}>+{baseGain} FORM pakka</span>
          </button>
          <button onClick={() => choose(true)} style={{
            width: '100%', padding: '15px 16px', borderRadius: 14, textAlign: 'left',
            border: '1px solid rgba(255,45,120,.35)', background: 'rgba(255,45,120,.08)',
            color: 'var(--ink)', fontWeight: 600, fontSize: 14, fontFamily: 'var(--sans)',
            cursor: 'pointer', lineHeight: 1.4,
          }}>
            {session.risky.label}
            {/* the stake is VISIBLE — no hidden coin-flip */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--accent)' }}>+{baseGain + 1} FORM agar nikla</span>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '.05em', padding: '2px 8px', borderRadius: 30,
                background: riskyOk ? 'rgba(61,214,200,.13)' : 'rgba(255,92,58,.13)',
                color: riskyOk ? 'var(--trust)' : 'var(--heat)',
              }}>Form {session.risky.threshold}+ chahiye · {riskyOk ? 'tum ready ho' : 'abhi risky hai'}</span>
            </span>
          </button>
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
