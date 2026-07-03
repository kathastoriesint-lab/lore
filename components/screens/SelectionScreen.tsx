'use client'
import { useEffect, useMemo, useState } from 'react'
import { useApp } from '@/lib/context'
import { buildSelection } from '@/lib/cricket-selection'
import { getCricketChars } from '@/lib/content'

// Squad Selection — the weekly ceremony (EvictionScreen's cricket sibling).
// Phases: intro → team sheet (one name per tap) → verdict hero → captain/coach
// lines → readout. The final CTA persists the verdict (resolveSelection) and
// returns to Live, where the next beat renders its verdict variant.
type Phase = 'intro' | 'sheet' | 'verdict' | 'lines' | 'readout'

export default function SelectionScreen() {
  const { game, dmTrust, navigate, resolveSelection, screen } = useApp()

  const sel = useMemo(
    () => (game.pendingSelection ? buildSelection(game.pendingSelection, game, dmTrust) : null),
    [game, dmTrust],
  )

  const [phase, setPhase] = useState<Phase>('intro')
  const [namesShown, setNamesShown] = useState(0)

  // Guard: no pending selection (direct nav / after resolve) → back to live.
  useEffect(() => {
    if (screen === 'selection' && !game.pendingSelection) navigate('live', { replace: true })
  }, [screen, game.pendingSelection, navigate])

  if (!sel) return null

  const verdictColor = sel.verdict === 'benched' ? 'var(--heat)' : sel.verdict === 'lifeline' ? '#FFB020' : 'var(--trust)'
  const verdictWord = sel.verdict === 'benched' ? 'BENCHED' : sel.verdict === 'lifeline' ? "CAPTAIN'S CALL" : sel.recall ? 'RECALLED' : 'STARTING'

  const advance = () => {
    if (phase === 'intro') setPhase('sheet')
    else if (phase === 'sheet') {
      if (namesShown < sel.teamSheet.length) setNamesShown(n => n + 1)
      else setPhase('verdict')
    }
    else if (phase === 'verdict') setPhase('lines')
    else if (phase === 'lines') setPhase('readout')
    else {
      resolveSelection()
      navigate('live', { replace: true })
    }
  }

  const hardik = getCricketChars()['hardik']

  const wrap: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)',
    position: 'relative', overflow: 'hidden', padding: '0 24px',
  }
  const glow: React.CSSProperties = {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `radial-gradient(ellipse 120% 45% at 50% 0%, color-mix(in srgb, ${verdictColor} 13%, transparent) 0%, transparent 65%)`,
  }
  const cta = (hero = false): React.CSSProperties => ({
    width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
    background: hero ? verdictColor : 'rgba(255,255,255,.06)',
    color: hero ? '#08080F' : 'var(--ink)', fontWeight: 800, fontSize: 15,
    fontFamily: 'var(--sans)', cursor: 'pointer',
    boxShadow: hero ? `0 8px 28px color-mix(in srgb, ${verdictColor} 35%, transparent)` : 'none',
  })

  return (
    <div style={wrap}>
      <div style={glow} />

      {/* Kicker */}
      <div style={{ paddingTop: 56, textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span className="pulse" style={{ background: verdictColor }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', color: verdictColor }}>
            SQUAD ANNOUNCEMENT · WEEK {sel.week}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 6 }}>{sel.matchLabel}</div>
      </div>

      {/* ── INTRO ── */}
      {phase === 'intro' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, lineHeight: 1.4, textAlign: 'center' }}>
            {sel.intro}
          </div>
        </div>
      )}

      {/* ── TEAM SHEET — one name per tap; slot 5 is the moment of truth ── */}
      {phase === 'sheet' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: 'var(--ink3)', textAlign: 'center', marginBottom: 10 }}>
            TEAM SHEET
          </div>
          {sel.teamSheet.slice(0, namesShown).map((row, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, borderRadius: 14, padding: '13px 16px',
              background: row.you ? `color-mix(in srgb, ${verdictColor} 12%, var(--surf))` : 'var(--surf)',
              border: `1px solid ${row.you ? verdictColor : 'var(--line)'}`,
              animation: 'evVoteIn .35s ease-out',
            }}>
              <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 15, color: 'var(--ink3)', width: 20 }}>{i + 1}</span>
              <span style={{ fontWeight: row.you ? 800 : 600, fontSize: 15, color: row.you ? '#fff' : 'var(--ink)' }}>
                {row.name}{row.you ? ' — TUM' : ''}
              </span>
            </div>
          ))}
          {namesShown >= sel.teamSheet.length && !sel.teamSheet.some(r => r.you) && (
            <div style={{ fontSize: 13, color: 'var(--heat)', textAlign: 'center', marginTop: 10, fontWeight: 700 }}>
              Tumhara naam sheet pe nahi hai.
            </div>
          )}
        </div>
      )}

      {/* ── VERDICT HERO ── */}
      {phase === 'verdict' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', color: 'var(--ink3)' }}>WEEK {sel.week} · {sel.verdict === 'benched' ? 'NOT IN THE XI' : 'IN THE XI'}</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 42, fontWeight: 600, color: verdictColor, marginTop: 14, textAlign: 'center', lineHeight: 1.15, padding: '0 12px' }}>
            {verdictWord}
          </div>
          {sel.verdict === 'lifeline' && (
            <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>
              Form sheet ne mana kiya. Captain ne apna naam laga diya.
            </div>
          )}
          {sel.recall && (
            <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>
              Bench se wapas — nets ne darwaza khol diya.
            </div>
          )}
        </div>
      )}

      {/* ── CAPTAIN + COACH LINES ── */}
      {phase === 'lines' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', gap: 14 }}>
          <div style={{ display: 'flex', gap: 12, background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 16, padding: '14px 16px' }}>
            <div className={`av ${hardik?.cls ?? ''}`} style={{ width: 42, height: 42, fontSize: 15, flexShrink: 0, backgroundImage: 'url(/avatars/hardik.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <span style={{ opacity: 0 }}>{hardik?.init ?? 'H'}</span>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.08em', color: 'var(--ink3)' }}>HARDIK · CAPTAIN</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.5, marginTop: 4, fontStyle: 'italic' }}>&ldquo;{sel.captainLine}&rdquo;</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 16, padding: '14px 16px' }}>
            <div className="av" style={{ width: 42, height: 42, fontSize: 15, flexShrink: 0, background: '#1a3a6e', display: 'grid', placeItems: 'center', color: '#fff' }}>M</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.08em', color: 'var(--ink3)' }}>MAHELA · HEAD COACH</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.5, marginTop: 4, fontStyle: 'italic' }}>&ldquo;{sel.coachLine}&rdquo;</div>
            </div>
          </div>
        </div>
      )}

      {/* ── READOUT / AFTERMATH — the two goals, honestly ── */}
      {phase === 'readout' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, lineHeight: 1.5, textAlign: 'center', marginBottom: 26 }}>
            {sel.aftermath}
          </div>
          {[
            { label: '🏏 FORM', val: sel.readout.form, need: sel.readout.formNeed, color: '#FFB020' },
            { label: "🧢 CAPTAIN'S TRUST", val: sel.readout.captain, need: sel.readout.captainNeed, color: 'var(--trust)' },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', color: row.color }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: row.val >= row.need ? 'var(--trust)' : 'var(--heat)' }}>
                  {row.val} / {row.need} needed
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 5, background: 'rgba(255,255,255,.07)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${Math.min(100, row.val)}%`, height: '100%', borderRadius: 5, background: row.color, transition: 'width .8s ease' }} />
                <div style={{ position: 'absolute', left: `${Math.min(100, row.need)}%`, top: -2, bottom: -2, width: 2, background: 'rgba(255,255,255,.6)' }} />
              </div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--ink3)', textAlign: 'center', marginTop: 10 }}>
            Captain ka bharosa DMs mein banta hai. Form nets aur match mein.
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ paddingBottom: 44, position: 'relative' }}>
        <button onClick={advance} style={cta(phase === 'verdict' || phase === 'readout')}>
          {phase === 'intro' && 'Team sheet dekho →'}
          {phase === 'sheet' && (namesShown < sel.teamSheet.length ? 'Agla naam →' : 'Verdict →')}
          {phase === 'verdict' && 'Captain kya bola? →'}
          {phase === 'lines' && 'Numbers dekho →'}
          {phase === 'readout' && 'Wapas game mein →'}
        </button>
      </div>
    </div>
  )
}
