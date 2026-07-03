'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import { buildSelection } from '@/lib/cricket-selection'
import { getCricketChars } from '@/lib/content'

// Squad Selection — the weekly ceremony, per the founder's "Squad Announcement
// redesign" prototype (1b): names DROP one by one on their own (no taps), the
// No.5 slot holds with typing dots — the "is it me?" dread — then the verdict
// lands full-size in serif ON the sheet. Then captain/coach lines → readout.
type Phase = 'intro' | 'sheet' | 'lines' | 'readout'

const NAME_MS = 720          // cadence between name drops
const VERDICT_HOLD_MS = 950  // dots hold on the final slot before the verdict

export default function SelectionScreen() {
  const { game, dmTrust, navigate, resolveSelection, screen } = useApp()

  const sel = useMemo(
    () => (game.pendingSelection ? buildSelection(game.pendingSelection, game, dmTrust) : null),
    [game, dmTrust],
  )

  const [phase, setPhase] = useState<Phase>('intro')
  const [step, setStep] = useState(0)          // names revealed so far
  const [resolved, setResolved] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Guard: no pending selection (direct nav / after resolve) → back to live.
  useEffect(() => {
    if (screen === 'selection' && !game.pendingSelection) navigate('live', { replace: true })
  }, [screen, game.pendingSelection, navigate])

  // Screens stay mounted (Slot pattern): a NEW selection must restart the
  // ceremony from intro — else week 2/3 open on week 1's leftover readout
  // phase and the reveal is silently skipped.
  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setPhase('intro'); setStep(0); setResolved(false)
  }, [game.pendingSelection])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout) }, [])

  if (!sel) return null

  const nRows = sel.teamSheet.length
  const lastIdx = nRows - 1
  const youIn = sel.verdict !== 'benched'
  const verdictColor = sel.verdict === 'benched' ? 'var(--heat)' : sel.verdict === 'lifeline' ? '#FFB020' : 'var(--trust)'
  const verdictWord = sel.verdict === 'benched' ? 'BENCHED' : sel.verdict === 'lifeline' ? "CAPTAIN'S CALL" : sel.recall ? 'RECALLED' : 'STARTING'
  const verdictSub = sel.verdict === 'benched'
    ? 'Tumhara naam sheet pe nahi hai. Orange bib, drinks duty — path wapas maidan se jaata hai.'
    : sel.verdict === 'lifeline'
      ? 'Form sheet ne mana kiya. Captain ne apna naam laga diya.'
      : sel.recall
        ? 'Bench se wapas — nets ne darwaza khol diya.'
        : sel.week === 1
          ? 'No.5 · IPL debut, 16 saal. Kal raat Wankhede ki lights tumhare naam.'
          : 'Naam sheet pe hai. Kaam abhi baaki hai.'

  const startReveal = () => {
    setPhase('sheet'); setStep(0); setResolved(false)
    // rows 1..n-1 drop on their own; the final slot holds with dots, then resolves
    for (let i = 1; i <= lastIdx; i++) {
      timersRef.current.push(setTimeout(() => setStep(i), i * NAME_MS))
    }
    timersRef.current.push(setTimeout(() => setResolved(true), lastIdx * NAME_MS + NAME_MS + VERDICT_HOLD_MS))
  }

  const advance = () => {
    if (phase === 'intro') startReveal()
    else if (phase === 'sheet') { if (resolved) setPhase('lines') }
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
    position: 'absolute', inset: 0, pointerEvents: 'none', transition: 'opacity .6s',
    opacity: phase !== 'sheet' || resolved ? 1 : 0,
    background: `radial-gradient(ellipse 120% 45% at 50% 0%, color-mix(in srgb, ${verdictColor} 14%, transparent) 0%, transparent 65%)`,
  }
  const ctaStyle = (hero: boolean, wait: boolean): React.CSSProperties => ({
    width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
    background: wait ? 'rgba(255,255,255,.05)' : hero ? 'var(--accent)' : 'rgba(255,255,255,.06)',
    color: wait ? 'var(--ink3)' : '#fff', fontWeight: 800, fontSize: 15,
    fontFamily: 'var(--sans)', cursor: wait ? 'default' : 'pointer',
    boxShadow: hero && !wait ? '0 10px 30px rgba(255,45,120,.3)' : 'none',
    transition: 'background .3s, color .3s',
  })

  const rowBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surf)',
    border: '1px solid var(--line)', borderRadius: 14, padding: '14px 17px',
    animation: 'evVoteIn .42s cubic-bezier(.32,.72,0,1) both',
  }

  return (
    <div style={wrap}>
      <div style={glow} />

      {/* Kicker */}
      <div style={{ paddingTop: 52, textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span className="pulse" style={{ background: resolved || phase !== 'sheet' ? verdictColor : 'var(--fame)' }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', color: resolved || phase !== 'sheet' ? verdictColor : 'var(--fame)' }}>
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

      {/* ── THE REVEAL — names drop on their own; the last slot is the dread ── */}
      {phase === 'sheet' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', gap: 9 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: 'var(--ink3)', textAlign: 'center', marginBottom: 8 }}>
            TEAM SHEET
          </div>

          {/* rows 1..n-1 */}
          {sel.teamSheet.slice(0, lastIdx).map((row, i) => (
            i < step && (
              <div key={i} style={rowBase}>
                <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 16, color: 'var(--ink3)', width: 16, textAlign: 'center', flex: 'none' }}>{i + 1}</span>
                <span style={{ fontWeight: 600, fontSize: 15.5, color: 'var(--ink)' }}>{row.name}</span>
              </div>
            )
          ))}

          {/* the held final slot: dots → you / other */}
          {step >= lastIdx && !resolved && (
            <div style={{ ...rowBase, borderStyle: 'dashed', borderColor: '#33333d', background: 'rgba(255,255,255,.02)' }}>
              <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 16, color: 'var(--ink3)', width: 16, textAlign: 'center', flex: 'none' }}>{nRows}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--ink3)', fontSize: 14, fontWeight: 600 }}>
                Aakhri naam
                <span className="typing" style={{ background: 'none', padding: 0 }}><i /><i /><i /></span>
              </span>
            </div>
          )}
          {resolved && (
            <div style={{
              ...rowBase,
              ...(youIn
                ? { border: `1.5px solid ${verdictColor}`, background: `color-mix(in srgb, ${verdictColor} 12%, var(--surf))`, boxShadow: `0 0 26px color-mix(in srgb, ${verdictColor} 20%, transparent)` }
                : { borderColor: '#2a2a33' }),
            }}>
              <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 16, color: 'var(--ink3)', width: 16, textAlign: 'center', flex: 'none' }}>{nRows}</span>
              <span style={{ fontWeight: youIn ? 800 : 600, fontSize: 15.5, color: youIn ? '#fff' : 'var(--ink)' }}>
                {sel.teamSheet[lastIdx]?.you
                  ? `Tum${game.playerName ? ` (${game.playerName})` : ''}`
                  : sel.teamSheet[lastIdx]?.name}
              </span>
              {youIn && (
                <span style={{ marginLeft: 'auto', fontSize: 8.5, fontWeight: 800, letterSpacing: '.1em', color: verdictColor, border: `1px solid color-mix(in srgb, ${verdictColor} 35%, transparent)`, borderRadius: 30, padding: '3px 9px' }}>
                  {sel.week === 1 ? 'DEBUT' : sel.recall ? 'RECALL' : 'IN'}
                </span>
              )}
            </div>
          )}

          {/* the verdict lands full-size, on this screen — no 13px gut-punch */}
          {resolved && (
            <div style={{ padding: '14px 20px 0', textAlign: 'center', animation: 'evVoteIn .5s cubic-bezier(.32,.72,0,1) both' }}>
              <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 40, lineHeight: 1, color: verdictColor }}>{verdictWord}</div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink2)', marginTop: 12, padding: '0 8px' }}>{verdictSub}</div>
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
        <button onClick={advance} style={ctaStyle(phase === 'sheet' || phase === 'readout', phase === 'sheet' && !resolved)}>
          {phase === 'intro' && 'Team sheet dekho →'}
          {phase === 'sheet' && (!resolved ? 'Sheet lag rahi hai…' : 'Captain kya bola? →')}
          {phase === 'lines' && 'Numbers dekho →'}
          {phase === 'readout' && 'Wapas game mein →'}
        </button>
      </div>
    </div>
  )
}
