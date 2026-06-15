'use client'
import { useEffect, useMemo, useState } from 'react'
import { useApp } from '@/lib/context'
import { CHARS } from '@/lib/data'
import { buildEviction } from '@/lib/creator-house'
import { resolveTokens } from '@/lib/game'
import PlayerAvatar from '@/components/PlayerAvatar'
import type { CharId } from '@/lib/types'

// Eviction Night — the ceremony. Phases: intro → nominations → house votes (one at a
// time) → audience bar → live tally → reveal → empty chair. Diegetic and dramatic;
// this is the moment the storyline's scripted eviction is supposed to FEEL real.
type Phase = 'intro' | 'nominees' | 'votes' | 'tally' | 'reveal' | 'aftermath'

function Avatar({ id, size = 64, dim = false }: { id: CharId; size?: number; dim?: boolean }) {
  // The player can be a nominee / the evicted — render their own avatar.
  if (id === 'player') {
    return (
      <div style={{ opacity: dim ? 0.35 : 1, filter: dim ? 'grayscale(1)' : 'none', transition: 'opacity .6s, filter .6s' }}>
        <PlayerAvatar size={size} fontSize={size * 0.34} />
      </div>
    )
  }
  const c = CHARS[id]
  return (
    <div className={`av ${c?.cls ?? ''}`} style={{
      width: size, height: size, fontSize: size * 0.34, flexShrink: 0, opacity: dim ? 0.35 : 1,
      backgroundImage: `url(/avatars/${id}.png)`, backgroundSize: 'cover', backgroundPosition: 'center',
      filter: dim ? 'grayscale(1)' : 'none', transition: 'opacity .6s, filter .6s',
    }}>
      <span style={{ opacity: 0 }}>{c?.init}</span>
    </div>
  )
}

export default function EvictionScreen() {
  const { game, navigate, resolveEviction, screen } = useApp()
  const name = (s: string) => resolveTokens(s, game.playerName, game.playerGender)
  // Name/handle that work for the player sentinel too.
  const dispName = (id: CharId) => id === 'player' ? (game.playerName || 'Tum') : (CHARS[id]?.name ?? '')
  const dispHandle = (id: CharId) => id === 'player' ? 'you' : (CHARS[id]?.handle ?? '')

  const ev = useMemo(
    () => (game.pendingEviction ? buildEviction(game.pendingEviction, game) : null),
    [game.pendingEviction, game.playerGender, game.choices, game.situationQueue],
  )

  const [phase, setPhase] = useState<Phase>('intro')
  const [voteIdx, setVoteIdx] = useState(0)   // how many house votes revealed
  const [tallyShown, setTallyShown] = useState(false)

  // Guard: no pending eviction (e.g. direct nav / after resolve) → back to live.
  useEffect(() => {
    if (screen === 'eviction' && !game.pendingEviction) navigate('live', { replace: true })
  }, [screen, game.pendingEviction, navigate])

  // Animate the tally bars in once we reach the tally phase.
  useEffect(() => {
    if (phase === 'tally') { const t = setTimeout(() => setTallyShown(true), 150); return () => clearTimeout(t) }
  }, [phase])

  if (!ev) return null

  const advance = () => {
    if (phase === 'intro') setPhase('nominees')
    else if (phase === 'nominees') setPhase('votes')
    else if (phase === 'votes') {
      // Reveal votes one at a time; once all are shown, the next press → tally.
      if (voteIdx < ev.houseVotes.length) setVoteIdx(v => v + 1)
      else setPhase('tally')
    }
    else if (phase === 'tally') setPhase('reveal')
    else if (phase === 'reveal') setPhase('aftermath')
    else {
      // If the PLAYER was voted out, the run is over → resolveEviction ends it and
      // sends them back to Worlds. Otherwise back into the house.
      resolveEviction()
      navigate(ev.playerEvicted ? 'worlds' : 'live', { replace: true })
    }
  }

  const wrap: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)',
    position: 'relative', overflow: 'hidden', padding: '0 24px',
  }
  const glow: React.CSSProperties = {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 120% 45% at 50% 0%, color-mix(in srgb, var(--heat) 14%, transparent) 0%, transparent 65%)',
  }
  const cta = (hero = false): React.CSSProperties => ({
    width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
    background: hero ? 'var(--heat)' : 'rgba(255,255,255,.06)',
    color: hero ? '#fff' : 'var(--ink)', fontWeight: 800, fontSize: 15,
    fontFamily: 'var(--sans)', cursor: 'pointer',
    boxShadow: hero ? '0 8px 28px color-mix(in srgb, var(--heat) 35%, transparent)' : 'none',
  })

  return (
    <div style={wrap}>
      <div style={glow} />

      {/* Kicker */}
      <div style={{ paddingTop: 56, textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span className="pulse" style={{ background: 'var(--heat)' }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', color: 'var(--heat)' }}>
            EVICTION NIGHT · DAY {ev.day}
          </span>
        </div>
      </div>

      {/* ── INTRO ── */}
      {phase === 'intro' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 27, fontWeight: 600, lineHeight: 1.4, textAlign: 'center' }}>
            {name(ev.intro)}
          </div>
        </div>
      )}

      {/* ── NOMINEES ── */}
      {phase === 'nominees' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: 'var(--ink3)', textAlign: 'center', marginBottom: 28 }}>
            KHATRE MEIN
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 36 }}>
            {ev.nominees.map(id => (
              <div key={id} style={{ textAlign: 'center' }}>
                <div style={{ borderRadius: '50%', padding: 3, background: 'color-mix(in srgb, var(--heat) 50%, transparent)', display: 'inline-block' }}>
                  <Avatar id={id} size={84} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}>{dispName(id)}</div>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>@{dispHandle(id)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HOUSE VOTES ── */}
      {phase === 'votes' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: 'var(--ink3)', textAlign: 'center', marginBottom: 8 }}>
            GHAR VOTE KAR RAHA HAI
          </div>
          {ev.houseVotes.slice(0, voteIdx).map((v, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 16, padding: '12px 14px', animation: 'evVoteIn .35s ease-out' }}>
              <Avatar id={v.voter} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.45, fontStyle: 'italic' }}>&ldquo;{name(v.line)}&rdquo;</div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.05em', color: 'var(--heat)', marginTop: 5 }}>
                  → {dispName(v.target).toUpperCase()} KO VOTE
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── AUDIENCE TALLY ── */}
      {phase === 'tally' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: 'var(--ink3)', textAlign: 'center', marginBottom: 24 }}>
            PUBLIC VOTE · LIVE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {ev.nominees.map(id => {
              const pct = ev.audience[id] ?? 0
              const isOut = id === ev.evicted
              return (
                <div key={id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                    <Avatar id={id} size={34} />
                    <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{dispName(id)}</span>
                    <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 18, color: isOut ? 'var(--heat)' : 'var(--ink2)' }}>
                      {tallyShown ? pct : 0}%
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 5, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                    <div style={{ width: `${tallyShown ? pct : 0}%`, height: '100%', borderRadius: 5, transition: 'width 1s ease', background: isOut ? 'var(--heat)' : 'rgba(255,255,255,.25)' }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', textAlign: 'center', marginTop: 22 }}>
            Sabse zyada vote — woh ghar jaata hai.
          </div>
        </div>
      )}

      {/* ── REVEAL ── */}
      {phase === 'reveal' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <Avatar id={ev.evicted} size={104} />
          <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, marginTop: 18 }}>{dispName(ev.evicted)}</div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', color: 'var(--heat)', marginTop: 8 }}>
            GHAR CHHODNA HOGA
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'rgba(255,255,255,.85)', lineHeight: 1.5, marginTop: 22, textAlign: 'center' }}>
            &ldquo;{name(ev.goodbye)}&rdquo;
          </div>
        </div>
      )}

      {/* ── AFTERMATH ── */}
      {phase === 'aftermath' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <Avatar id={ev.evicted} size={84} dim />
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: 'var(--ink3)', marginTop: 16 }}>
            KHAALI KURSI
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, lineHeight: 1.45, marginTop: 16, textAlign: 'center' }}>
            {name(ev.aftermath)}
          </div>
        </div>
      )}

      {/* CTA — one clear button per phase (votes reveals one vote per press) */}
      {(
        <div style={{ paddingBottom: 44, position: 'relative' }}>
          <button onClick={advance} style={cta(phase === 'reveal' || phase === 'aftermath')}>
            {phase === 'intro' && 'Nominations dekho →'}
            {phase === 'nominees' && 'Voting shuru karo →'}
            {phase === 'votes' && (voteIdx < ev.houseVotes.length ? 'Agla vote →' : 'Public vote dekho →')}
            {phase === 'tally' && 'Result reveal karo →'}
            {phase === 'reveal' && 'Aage badho →'}
            {phase === 'aftermath' && (ev.playerEvicted ? 'Ghar se bahar →' : 'House mein wapas →')}
          </button>
        </div>
      )}
    </div>
  )
}
