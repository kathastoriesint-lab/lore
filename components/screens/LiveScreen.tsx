'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import type { CharId, Choice, ChoicePost, Meters } from '@/lib/types'
import { CHARS, SITUATIONS, getVisibleSituations } from '@/lib/data'
import { CRICKET_CHARS, CRICKET_SITUATIONS, CRICKET_ENDING_DATA, resolveCricketEnding } from '@/lib/cricket-data'
import { getStats, clamp, resolveEnding, resolveTokens } from '@/lib/game'
import { sentimentDelta } from '@/lib/relationships'
import MeterHUD from '@/components/MeterHUD'


const StatusBar = () => (
  <div className="statusbar">
    <span>9:41</span>
    <span className="sb-right">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="#fff"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M1 4.2a11 11 0 0 1 14 0"/><path d="M3.6 6.9a7 7 0 0 1 8.8 0"/><path d="M6.1 9.5a3 3 0 0 1 3.8 0"/></svg>
      <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="1" y="1" width="20" height="10" rx="2.6" stroke="#fff" strokeOpacity=".45"/><rect x="2.6" y="2.6" width="14.5" height="6.8" rx="1.3" fill="#fff"/><rect x="22.4" y="4" width="1.6" height="4" rx="1" fill="#fff" fillOpacity=".45"/></svg>
    </span>
  </div>
)

const FINALE_DATA = {
  heart: { arc: 'Heat King/Queen', sub: 'Tu viral hai, controversial hai, aur everyone is talking about you. Bura naam bhi naam hota hai.', color: '#FF5C3A' },
  main:  { arc: 'Main Character', sub: 'Har scene tumhara. Har headline tumhara. Yahi hai Creator House.', color: '#FFB020' },
  brand: { arc: 'Brand Icon', sub: 'Brands queue mein hain. Image perfect hai. Creator House ne tumhe polish kiya.', color: '#3DD6C8' },
  dark:  { arc: 'Dark Horse', sub: 'Quietly. Deadly. Is ghar mein sab ne underestimate kiya — aur sab galat the.', color: '#8a4ab0' },
}

const asArray = <T,>(value: T | T[] | null | undefined): T[] => {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

const resolveChoiceOutcome = (choice: Choice, meters: Meters) => {
  const gate = choice.outcomeGate
  if (!gate) return null
  return meters[gate.metric] > gate.threshold ? gate.pass : gate.fail
}

export default function LiveScreen() {
  const { navigate, game, makeChoice, advanceSituation, injectCharDM, dmBadgeCount } = useApp()
  // Tracks when we're mid-choice-flow so the situation-change effect doesn't clear showPost
  const inFlowRef = useRef(false)

  const isCricket = game.world === 'cricket'
  const allChars = isCricket ? { ...CHARS, ...CRICKET_CHARS } : CHARS
  // 'player' is the cricket sentinel — the user plays as themselves, not an NPC.
  // char is null in cricket; use a synthetic player object only where post-card needs it.
  const char = game.char && game.char !== 'player' ? allChars[game.char] : null
  const playerChar = isCricket ? {
    id: 'player' as CharId, cls: '', init: (game.playerName?.[0] ?? 'N').toUpperCase(),
    name: game.playerName || 'Player', handle: (game.playerName || 'player').toLowerCase(),
    fame: 0, role: '',
  } : null

  // Shorthand: resolve tokens using current player state
  const r = (text: string) => resolveTokens(text, game.playerName, game.playerGender)

  // Build situation lookup map from the active world's list
  const allSituations = isCricket
    ? Object.fromEntries(CRICKET_SITUATIONS.map(s => [s.id, s]))
    : Object.fromEntries(getVisibleSituations(game.meters, game.choices).map(s => [s.id, s]))

  // Resolve current and adjacent situations by ID from the queue
  const situation = game.situation
  const queue = game.situationQueue
  const sit = queue[situation] ? allSituations[queue[situation]] ?? null : null
  const isFinale = situation >= queue.length

  // Day-lock: detect if next situation is in a future day that hasn't unlocked yet
  const prevSit = situation > 0 && queue[situation - 1] ? allSituations[queue[situation - 1]] ?? null : null
  const isDayLocked = sit && prevSit && sit.day > prevSit.day &&
    game.dayUnlockTime[sit.day] != null &&
    game.dayUnlockTime[sit.day] > Date.now()

  // Countdown timer for locked day
  const [countdown, setCountdown] = useState('')
  const [, forceUpdate] = useState(0)  // triggers re-render when timer expires
  useEffect(() => {
    if (!isDayLocked || !sit) return
    const update = () => {
      const ms = game.dayUnlockTime[sit.day] - Date.now()
      if (ms <= 0) {
        setCountdown('00:00:00')
        forceUpdate(n => n + 1)  // re-render so isDayLocked re-evaluates to false
        return
      }
      const h = Math.floor(ms / 3_600_000)
      const m = Math.floor((ms % 3_600_000) / 60_000)
      const s = Math.floor((ms % 60_000) / 1_000)
      setCountdown(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    update()
    const t = setInterval(update, 1_000)
    return () => clearInterval(t)
  }, [isDayLocked, sit, game.dayUnlockTime])

  // Choice state
  const [chosen, setChosen] = useState<0 | 1 | null>(null)
  const [showImpact, setShowImpact] = useState(false)
  const [showPost, setShowPost] = useState(false)
  const [stats, setStats] = useState<{ total: number; pctA: number } | null>(null)
  // Chapter beat — brief full-screen card between situations
  const [showBeat, setShowBeat] = useState(false)
  const [outcomeFlash, setOutcomeFlash] = useState<{ title: string; note: string; passed: boolean } | null>(null)
  // DM notification banner — shows after injectCharDM fires
  const [dmNotif, setDmNotif] = useState<{ name: string; cls: string; id: string } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  // Ref-based processing guard — synchronously prevents double-tap between React renders
  const processingRef = useRef(false)
  // Timer cleanup refs to prevent post-unmount fires
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  // Snapshot of the situation at choice-time — keeps displayed content pinned to the
  // situation the player chose in even after advanceSituation() increments game.situation.
  const sitSnapshotRef = useRef<NonNullable<typeof sit> | null>(null)
  const displaySit = (chosen !== null && sitSnapshotRef.current) ? sitSnapshotRef.current : sit

  // Effective react — derived from displaySit so it stays pinned during post-choice flow
  const effectiveReact = displaySit ? displaySit.react : null

  // Reset choice state when situation changes (skip during mid-choice flow)
  useEffect(() => {
    if (inFlowRef.current) return  // advanceSituation fires during flow — don't reset UI
    setChosen(null)
    setShowImpact(false)
    setShowPost(false)
    setStats(null)
    processingRef.current = false
    timersRef.current = []
  }, [situation])

  // Clear pending timers on unmount to prevent post-unmount navigate/advanceSituation
  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout) }
  }, [])

  // Load stats for current situation
  useEffect(() => {
    if (sit) {
      getStats(situation).then(setStats).catch(() => setStats({ total: 4218, pctA: 62 }))
    }
  }, [situation, sit])

  const addTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }

  // Inner reset — called after beat (or directly by Go to Feed)
  const doReset = useCallback(() => {
    inFlowRef.current = false
    sitSnapshotRef.current = null
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setChosen(null)
    setShowImpact(false)
    setShowPost(false)
    setShowBeat(false)
    setOutcomeFlash(null)
    processingRef.current = false
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Show chapter beat, then reset after 1.2s
  const resetAfterChoice = useCallback(() => {
    if (isFinale) { doReset(); return }
    setShowBeat(true)
    setTimeout(() => doReset(), 1200)
  }, [isFinale, doReset])

  const goToFeed = useCallback(() => {
    resetAfterChoice()
    navigate('feed')
  }, [resetAfterChoice, navigate])

  const handleChoice = useCallback(async (idx: 0 | 1) => {
    if (processingRef.current || !sit) return
    const preChoiceMeters = { ...game.meters }
    processingRef.current = true
    setChosen(idx)
    setShowImpact(true)

    try {
      // makeChoice updates meters+choices in React state only (no Supabase write yet)
      await makeChoice(idx)
    } catch {
      inFlowRef.current = false
      processingRef.current = false
      setChosen(null)
      setShowImpact(false)
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      return
    }

    const ch = sit.choices[idx]
    inFlowRef.current = true  // freeze situation-change effect during animation
    sitSnapshotRef.current = sit  // freeze displayed content to this situation
    const outcome = resolveChoiceOutcome(ch, preChoiceMeters)
    if (outcome) {
      const passed = outcome === ch.outcomeGate?.pass
      setOutcomeFlash({
        title: outcome.title ?? (passed ? 'YOU PLAYED WELL' : 'OUT EARLY'),
        note: outcome.note,
        passed,
      })
    }

    // Advance situation immediately so "Next Situation" can never race the timer.
    // sitSnapshotRef keeps the render pinned to the current situation's content.
    advanceSituation()

    addTimer(() => { scrollRef.current?.scrollTo({ top: 400, behavior: 'smooth' }) }, 200)

    const firstReactor = ch.reactions?.find(rx => rx.char !== '__fan')
    const dmSource = outcome?.dm !== undefined ? outcome.dm : ch.dm
    const dmsToInject = dmSource === undefined
      ? (firstReactor ? [{ char: firstReactor.char as CharId, text: firstReactor.text }] : [])
      : asArray(dmSource)
    dmsToInject.forEach((dmToInject, dmIndex) => {
      addTimer(() => {
        injectCharDM(dmToInject.char, r(dmToInject.text))
        const reactChar = allChars[dmToInject.char]
        if (reactChar) {
          setDmNotif({ name: reactChar.name, cls: reactChar.cls, id: reactChar.id })
          setTimeout(() => setDmNotif(null), 3000)
        }
      }, 900 + dmIndex * 450)
    })

    // Show post preview after impact card appears
    addTimer(() => { setShowPost(true) }, 600)
  }, [sit, game.meters, makeChoice, advanceSituation, navigate, injectCharDM, isCricket])


  // Navigate to tabs
  const handleTab = useCallback((tab: string) => {
    if (tab === 'home') navigate('feed')
    else if (tab === 'profile') navigate('profile')
    else if (tab === 'dms') navigate('dm-inbox')
  }, [navigate])

  // Finale arc — world-aware
  const endingKey = isFinale
    ? isCricket ? resolveCricketEnding(game.meters) : resolveEnding(game.meters)
    : null
  const finaleArc = endingKey
    ? (isCricket ? CRICKET_ENDING_DATA[endingKey as keyof typeof CRICKET_ENDING_DATA] : FINALE_DATA[endingKey as keyof typeof FINALE_DATA])
    : null

  // game.char === null means no world started yet; 'player' is the cricket sentinel (user plays as themselves)
  if (!game.char) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
        <div style={{ fontSize: 16, color: 'var(--ink2)', textAlign: 'center' }}>Apna naam aur gender batao pehle</div>
        <button
          style={{ padding: '14px 28px', background: 'var(--accent)', color: '#fff', borderRadius: 14, fontWeight: 700, fontSize: 16 }}
          onClick={() => navigate('world-intro')}
        >
          Get started →
        </button>
      </div>
    )
  }

  // Next situation for chapter beat display
  const nextSitForBeat = queue[game.situation] ? allSituations[queue[game.situation]] ?? null : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <StatusBar />

      {/* DM notification banner — slides in from top after a character DMs */}
      {dmNotif && (
        <div style={{
          position: 'absolute', top: 44, left: 12, right: 12, zIndex: 50,
          background: 'rgba(18,18,20,.97)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,.1)', borderRadius: 16,
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
          animation: 'slideUp .35s cubic-bezier(.32,.72,0,1) both',
          boxShadow: '0 8px 30px rgba(0,0,0,.5)',
          cursor: 'pointer',
        }} onClick={() => navigate('dm-inbox')}>
          <div className={`av ${dmNotif.cls}`} style={{ width: 34, height: 34, fontSize: 13, flexShrink: 0, backgroundImage: `url(/avatars/${dmNotif.id}.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{dmNotif.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 1 }}>ne message kiya 💬</div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
        </div>
      )}

      {/* Chapter beat overlay — brief full-screen card between situations */}
      {showBeat && nextSitForBeat && (
        <div style={{
          position: 'absolute', inset: 0, background: 'var(--bg)', zIndex: 40,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          animation: 'fadeIn .25s ease both',
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', color: 'var(--accent)', marginBottom: 4, animation: 'fadeIn .3s ease .1s both', opacity: 0 }}>SITUATION</div>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 80, lineHeight: 1, color: '#fff', animation: 'fadeIn .3s ease .05s both', opacity: 0 }}>
            {game.situation + 1}
          </div>
          <div style={{ fontSize: 16, color: 'var(--ink3)', fontWeight: 500, letterSpacing: '.05em', animation: 'fadeIn .3s ease .1s both', opacity: 0 }}>
            of {queue.length}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 20, color: 'rgba(255,255,255,.6)', marginTop: 6, animation: 'fadeIn .3s ease .2s both', opacity: 0 }}>
            {nextSitForBeat.title}
          </div>
        </div>
      )}

      {/* Match outcome flash — used for gated cricket beats like debut result */}
      {outcomeFlash && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 60,
          background: outcomeFlash.passed
            ? 'radial-gradient(circle at 50% 32%, rgba(61,214,200,.28), transparent 32%), linear-gradient(180deg,#061a18 0%,#020308 100%)'
            : 'radial-gradient(circle at 50% 32%, rgba(255,92,58,.30), transparent 32%), linear-gradient(180deg,#1c0806 0%,#020308 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 26, textAlign: 'center',
          animation: 'fadeIn .18s ease both',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '.18em',
            color: outcomeFlash.passed ? '#3DD6C8' : '#FF5C3A',
            marginBottom: 12,
          }}>MATCH RESULT</div>
          <div style={{
            fontFamily: 'var(--serif)', fontWeight: 700, lineHeight: .92,
            fontSize: 54, color: '#fff', maxWidth: 330,
            textShadow: outcomeFlash.passed ? '0 0 34px rgba(61,214,200,.32)' : '0 0 34px rgba(255,92,58,.32)',
          }}>{outcomeFlash.title}</div>
          <div style={{
            marginTop: 18, maxWidth: 330, fontSize: 15, lineHeight: 1.45,
            color: 'rgba(255,255,255,.74)',
          }}>{r(outcomeFlash.note)}</div>
          <div style={{
            marginTop: 24, height: 4, width: 150, borderRadius: 999,
            background: 'rgba(255,255,255,.12)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: '100%',
              background: outcomeFlash.passed ? '#3DD6C8' : '#FF5C3A',
              animation: 'meterFlash 1.8s ease both',
            }} />
          </div>
          <button
            onClick={() => setOutcomeFlash(null)}
            style={{
              marginTop: 34,
              width: 'min(310px, 100%)',
              minHeight: 58,
              borderRadius: 18,
              background: outcomeFlash.passed ? '#3DD6C8' : '#FF5C3A',
              color: outcomeFlash.passed ? '#031615' : '#fff',
              border: 'none',
              fontSize: 17,
              fontWeight: 900,
              fontFamily: 'var(--sans)',
              cursor: 'pointer',
              boxShadow: outcomeFlash.passed ? '0 14px 38px rgba(61,214,200,.22)' : '0 14px 38px rgba(255,92,58,.22)',
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Shared HUD */}
      <MeterHUD right={
        <div className="live-badge">
          <div className="pulse" />
          LIVE
        </div>
      } />

      {/* Day-lock overlay — sits above scroll, MeterHUD, sticky buttons, and tab bar */}
      {isDayLocked && sit && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'var(--bg)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '32px 28px',
        }}>
          {/* Subtle glow */}
          <div style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: 260, height: 260, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,45,120,.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Day complete badge */}
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '.12em',
            color: 'var(--accent)', marginBottom: 16, opacity: 0.8,
            animation: 'fadeIn .4s ease both',
          }}>
            {isCricket ? 'SEASON 1 · IPL' : 'CREATOR HOUSE'}
          </div>

          {/* Large day number */}
          <div style={{
            fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 72, lineHeight: 1,
            color: '#fff', marginBottom: 6,
            animation: 'fadeIn .4s ease .1s both', opacity: 0,
          }}>
            Day {sit.day - 1}
          </div>
          <div style={{
            fontSize: 16, color: 'var(--ink2)', marginBottom: 8,
            animation: 'fadeIn .4s ease .15s both', opacity: 0,
          }}>
            complete
          </div>

          {/* Divider */}
          <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,.12)', margin: '20px 0',
            animation: 'fadeIn .4s ease .2s both', opacity: 0 }} />

          {/* Next day teaser */}
          <div style={{
            fontSize: 13, color: 'var(--ink3)', marginBottom: 8, textAlign: 'center',
            animation: 'fadeIn .4s ease .25s both', opacity: 0,
          }}>
            Day {sit.day} unlocks in
          </div>

          {/* Countdown */}
          <div style={{
            fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 48, lineHeight: 1,
            color: 'var(--ink)', letterSpacing: '.02em', fontVariantNumeric: 'tabular-nums',
            marginBottom: 32,
            animation: 'fadeIn .4s ease .3s both', opacity: 0,
          }}>
            {countdown}
          </div>

          {/* CTA buttons */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 12, width: '100%',
            animation: 'fadeIn .4s ease .4s both', opacity: 0,
          }}>
            <button
              onClick={() => navigate('feed')}
              style={{
                width: '100%', height: 54, background: 'var(--accent)', color: '#fff',
                fontWeight: 700, fontSize: 15, borderRadius: 14, border: 'none',
                cursor: 'pointer', fontFamily: 'var(--sans)',
                boxShadow: '0 8px 24px rgba(255,45,120,.35)',
              }}
            >
              Go to Feed →
            </button>
            <button
              onClick={() => navigate('dm-inbox')}
              style={{
                width: '100%', height: 50, background: 'rgba(255,255,255,.07)', color: 'var(--ink2)',
                fontWeight: 600, fontSize: 14, borderRadius: 14,
                border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', fontFamily: 'var(--sans)',
              }}
            >
              Go to Messages →
            </button>
          </div>

          {/* Small note */}
          <div style={{
            marginTop: 24, fontSize: 12, color: 'var(--ink3)', textAlign: 'center',
            animation: 'fadeIn .4s ease .5s both', opacity: 0,
          }}>
            Come back when the timer ends — the next scene is waiting.
          </div>
        </div>
      )}

      {/* Main scroll */}
      <div className="live-scroll" ref={scrollRef}>

        {/* Finale screen */}
        {isFinale && finaleArc && (
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20, minHeight: '60%', justifyContent: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>{isCricket ? 'INDIAN DRESSING ROOM — SEASON FINALE' : 'CREATOR HOUSE — FINALE'}</div>
            <div style={{
              fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 36, lineHeight: 1.1,
              color: finaleArc.color
            }}>
              {finaleArc.arc}
            </div>
            <div style={{ fontSize: 15, color: 'var(--ink2)', lineHeight: 1.55 }}>{finaleArc.sub}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <div style={{ padding: '10px 16px', background: `color-mix(in srgb, ${finaleArc.color} 20%, transparent)`, border: `1px solid color-mix(in srgb, ${finaleArc.color} 40%, transparent)`, borderRadius: 12, fontSize: 12, fontWeight: 700, color: finaleArc.color }}>
                {isCricket ? '🏏 Form' : '⭐ Fame'} {game.meters.fame}
              </div>
              <div style={{ padding: '10px 16px', background: 'color-mix(in srgb, #FF5C3A 20%, transparent)', border: '1px solid color-mix(in srgb, #FF5C3A 40%, transparent)', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#FF5C3A' }}>
                {isCricket ? '⭐ Fame' : '🔥 Heat'} {game.meters.heat}
              </div>
              <div style={{ padding: '10px 16px', background: 'color-mix(in srgb, #3DD6C8 20%, transparent)', border: '1px solid color-mix(in srgb, #3DD6C8 40%, transparent)', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#3DD6C8' }}>
                🤝 {isCricket ? 'Trust' : 'Image'} {game.meters.image}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <button
                style={{ width: '100%', height: 54, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 14 }}
                onClick={() => navigate('profile')}
              >
                View Profile →
              </button>
              <button
                style={{ width: '100%', height: 48, background: 'transparent', color: 'var(--ink3)', fontWeight: 500, fontSize: 14, borderRadius: 14, border: '1px solid var(--line)' }}
                onClick={() => navigate('feed')}
              >
                View Feed →
              </button>
            </div>
          </div>
        )}

        {/* Situation — use displaySit (snapshot) so the content stays pinned
             to the situation the player chose in, even after advanceSituation() fires */}
        {displaySit && (
          <div className="situation">
            <div className="sit-tag" style={{ display:'flex', alignItems:'center', gap:6 }}>
              {displaySit.tag}
              <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:9, fontWeight:800, color:'#ff3b3b', letterSpacing:'.04em' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#ff3b3b', display:'inline-block' }} />
                LIVE
              </span>
            </div>
            <div className="sit-title">{r(displaySit.title)}</div>
            <div className="sit-body">
              {displaySit.body.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: r(p) }} />
              ))}
            </div>

            {/* Character reaction */}
            {effectiveReact && (() => {
              // Swap kabir↔ananya for female players: kabir=ally for male, ananya=crush for male — roles flip
              const reactCharId: CharId = game.playerGender === 'female'
                ? effectiveReact.char === 'kabir' ? 'ananya'
                : effectiveReact.char === 'ananya' ? 'kabir'
                : effectiveReact.char
                : effectiveReact.char
              const reactChar = allChars[reactCharId]
              return (
                <div className="sit-react">
                  <div
                    className={`av ${reactChar.cls}`}
                    style={{ width:26, height:26, fontSize:11,
                      backgroundImage:`url(/avatars/${reactChar.id}.png)`,
                      backgroundSize:'cover', backgroundPosition:'center' }}
                  >
                    <span style={{ opacity:0 }}>{reactChar.init}</span>
                  </div>
                  <div className="react-body">
                    <div className="rn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {reactChar.name}
                      {/* T3: Bond delta chip — show after choice is made */}
                      {showImpact && (() => {
                        const delta = sentimentDelta(r(effectiveReact.text))
                        if (delta === 0) return null
                        const pos = delta > 0
                        return (
                          <span style={{
                            fontSize: 12, fontWeight: 700, letterSpacing: '.01em',
                            color: pos ? '#3DD6C8' : '#FF5C3A',
                            background: pos ? 'rgba(61,214,200,.12)' : 'rgba(255,92,58,.12)',
                            padding: '2px 8px', borderRadius: 6,
                          }}>
                            {pos ? '+' : ''}{delta} bond
                          </span>
                        )
                      })()}
                    </div>
                    <div className={`react-bubble ${reactChar.cls}`}>{r(effectiveReact.text)}</div>
                  </div>
                </div>
              )
            })()}

            {/* ── Post-choice: collapsible impact + player post + reactions ── */}
            {showImpact && chosen !== null && displaySit!.choices[chosen] && (() => {
              const ch = displaySit!.choices[chosen]
              const d = ch.deltas
              const isCritical = game.meters.heat > 75
              // B3: before values (current = after delta was applied)
              const before = {
                fame:  Math.max(0, game.meters.fame  - d.fame),
                heat:  Math.max(0, game.meters.heat  - d.heat),
                image: Math.max(0, game.meters.image - d.image),
              }
              // Inline char color — must match .c-{id}{--cc} in globals.css (DESIGN.md compliant)
              const CHAR_COLORS: Record<string, string> = {
                ria:'#c41060', kabir:'#8a1840', dev:'#7a1535', ananya:'#b03060', zoya:'#a02858',
                meher:'#952050', rishi:'#6a1030', adi:'#b54070',
                hardik:'#003087', rohit:'#1a3a6e', surya:'#004080', bumrah:'#0a1a4a',
                tilak:'#2a5a8f', coach:'#3a2a5a', friend:'#1a4a6a', player:'#FF2D78',
              }
              const legacyPost: ChoicePost | null = ch.caption
                ? { source: 'player', caption: ch.caption, reactions: ch.reactions ?? [] }
                : null
              const outcome = resolveChoiceOutcome(ch, before)
              const postSource = outcome?.post !== undefined ? outcome.post : (ch.post !== undefined ? ch.post : legacyPost)
              const postSpecs = asArray(postSource)
                .filter(post => post.display !== 'feed-only')
              const resolvePostOwner = (postSpec: ChoicePost) => {
                if (!postSpec) return null
                if (postSpec.source === 'account') {
                  const handle = postSpec.handle ?? postSpec.name?.toLowerCase().replace(/\s+/g, '') ?? 'update'
                  return {
                    id: '__account',
                    cls: '',
                    init: postSpec.avatarText ?? (postSpec.name ?? handle)[0]?.toUpperCase() ?? 'U',
                    name: postSpec.name ?? handle,
                    handle,
                    avatarUrl: undefined as string | undefined,
                    color: '#003087',
                  }
                }
                if (postSpec.source === 'character' && postSpec.char) {
                  const c = allChars[postSpec.char]
                  if (!c) return null
                  return {
                    id: c.id,
                    cls: c.cls,
                    init: c.init,
                    name: c.name,
                    handle: c.handle,
                    avatarUrl: `/avatars/${c.id}.png`,
                    color: CHAR_COLORS[c.id] ?? '#1a1a2e',
                  }
                }
                const playerOwner = isCricket
                  ? playerChar
                  : (char
                      ? (game.playerGender === 'female'
                          ? char.id === 'kabir' ? allChars['ananya'] : char.id === 'ananya' ? allChars['kabir'] : char
                          : char)
                      : null)
                if (!playerOwner) return null
                return {
                  id: playerOwner.id,
                  cls: playerOwner.cls,
                  init: playerOwner.init,
                  name: playerOwner.name,
                  handle: postSpec.handle ?? (game.playerName || playerOwner.handle || 'you').toLowerCase().replace(/\s+/g, ''),
                  avatarUrl: isCricket ? game.avatarUrl : `/avatars/${playerOwner.id}.png`,
                  color: CHAR_COLORS[playerOwner.id] ?? '#1a1a2e',
                }
              }

              // Compact delta summary for collapsed state
              const deltaSummary = [
                d.fame  !== 0 ? `${d.fame > 0 ? '+' : ''}${d.fame}⭐` : null,
                d.heat  !== 0 ? `${d.heat > 0 ? '+' : ''}${d.heat}🔥` : null,
                d.image !== 0 ? `${d.image > 0 ? '+' : ''}${d.image}🤝` : null,
              ].filter(Boolean).join('  ')

              return (
                <div style={{ marginTop: 16 }}>

                  {/* Impact card — always expanded, no toggle */}
                  <div className={`impact-card${isCritical ? ' danger' : ''}`} style={{ marginTop: 0 }}>
                      {/* Always-expanded detail rows */}
                      {true && (
                        <>
                          {d.fame !== 0 && (
                            <div className="impact-row fame" style={{ borderTop: '1px solid rgba(255,255,255,.05)' }}>
                              <div className="impact-row-glow" />
                              <div className="impact-delta">{d.fame > 0 ? '+' : ''}{d.fame}</div>
                              <div className="impact-meta">
                                <div className="impact-mlabel">{isCricket ? '🏏 FORM' : '⭐ FAME'}</div>
                                <div className="impact-bar-track"><div className="impact-bar-fill" style={{ width: `${Math.max(0, Math.min(100, game.meters.fame))}%` }} /></div>
                                <div className="impact-consequence">{before.fame} → {game.meters.fame}</div>
                              </div>
                            </div>
                          )}
                          {d.heat !== 0 && (
                            <div className={`impact-row heat${d.heat < 0 ? ' negative' : ''}`} style={{ borderTop: '1px solid rgba(255,255,255,.05)' }}>
                              <div className="impact-row-glow" />
                              <div className="impact-delta">{d.heat > 0 ? '+' : ''}{d.heat}</div>
                              <div className="impact-meta">
                                <div className="impact-mlabel">{isCricket ? '⭐ FAME' : '🔥 HEAT'}</div>
                                <div className="impact-bar-track"><div className="impact-bar-fill" style={{ width: `${Math.max(0, Math.min(100, game.meters.heat))}%` }} /></div>
                                <div className="impact-consequence">{before.heat} → {game.meters.heat}{isCritical ? ' ⚠️' : ''}</div>
                              </div>
                            </div>
                          )}
                          {d.image !== 0 && (
                            <div className="impact-row image" style={{ borderTop: '1px solid rgba(255,255,255,.05)' }}>
                              <div className="impact-row-glow" />
                              <div className="impact-delta">{d.image > 0 ? '+' : ''}{d.image}</div>
                              <div className="impact-meta">
                                <div className="impact-mlabel">{isCricket ? '🤝 TRUST' : '🤝 IMAGE'}</div>
                                <div className="impact-bar-track"><div className="impact-bar-fill" style={{ width: `${Math.max(0, Math.min(100, game.meters.image))}%` }} /></div>
                                <div className="impact-consequence">{before.image} → {game.meters.image}</div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                  </div>

                  {/* Player post + reactions — shown after post is ready */}
                  {/* Caption starting with "*(" is a meta-note (no public post was made) */}
                  {showPost && postSpecs.map((postSpec, postIndex) => {
                    const postOwner = resolvePostOwner(postSpec)
                    if (!postOwner) return null
                    const hasRealPost = !!postSpec.caption && !postSpec.caption.startsWith('*(')
                    const postReactions = postSpec.reactions ?? []
                    const postBg = `linear-gradient(to bottom, ${postOwner.color}bb 0%, ${postOwner.color}66 55%, #0a0a18 100%)`
                    return (
                      <div key={`${displaySit!.id}-${chosen}-${postIndex}`} style={{ marginTop: 12, background: '#0f0f18', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)', animation: 'slideUp .4s cubic-bezier(.32,.72,0,1) both' }}>
                        {/* Post header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                          <div
                            className={postOwner.cls ? `av ${postOwner.cls}` : 'av'}
                            style={{
                              width: 32, height: 32, fontSize: 12, flexShrink: 0,
                              background: postOwner.avatarUrl ? 'transparent' : postOwner.color,
                              backgroundImage: postOwner.avatarUrl ? `url(${postOwner.avatarUrl})` : undefined,
                              backgroundSize: 'cover', backgroundPosition: 'center',
                            }}
                          >
                            {!postOwner.avatarUrl && postOwner.init}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>@{postOwner.handle}</div>
                            <div style={{ fontSize: 10, color: 'var(--ink3)' }}>{postSpec.label ?? `just now · ${isCricket ? 'MI Season 1' : 'Creator House'}`}</div>
                          </div>
                          {hasRealPost
                            ? <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'rgba(255,45,120,.12)', padding: '3px 8px', borderRadius: 20 }}>✓ POSTED</div>
                            : <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink3)', background: 'rgba(255,255,255,.06)', padding: '3px 8px', borderRadius: 20 }}>offline</div>
                          }
                        </div>

                        {hasRealPost ? (
                          /* Post image — caption pinned to bottom */
                          <div style={{ margin: '0 12px', borderRadius: 10, background: postBg, aspectRatio: '4/3', position: 'relative', overflow: 'hidden' }}>
                            <p style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0, margin: 0,
                              padding: '32px 14px 14px',
                              fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14,
                              color: 'rgba(255,255,255,.95)', lineHeight: 1.45,
                              background: 'linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 100%)',
                              textShadow: '0 1px 6px rgba(0,0,0,.5)',
                            }}>{r(postSpec.caption)}</p>
                          </div>
                        ) : (
                          /* No post made — quiet offline note */
                          <div style={{ margin: '0 12px 12px', padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink3)', lineHeight: 1.5 }}>
                              {r(postSpec.caption).replace(/<\/?em>/g, '').replace(/^\(|\)$/g, '')}
                            </div>
                          </div>
                        )}

                        {/* Reactions as threaded comments */}
                        {postReactions.length > 0 && (
                          <div style={{ padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {postReactions.map((rx, j) => {
                              const isFan = rx.char === '__fan'
                              const rxChar = isFan ? null : (
                                game.playerGender === 'female'
                                  ? rx.char === 'kabir' ? allChars['ananya'] : rx.char === 'ananya' ? allChars['kabir'] : allChars[rx.char as CharId]
                                  : allChars[rx.char as CharId]
                              )
                              return (
                                <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                                  {isFan || !rxChar ? (
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1e1e2a', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 800, color: 'var(--ink3)', flexShrink: 0, border: '1px solid rgba(255,255,255,.06)' }}>
                                      {(rx.name ?? 'fan')[0].toUpperCase()}
                                    </div>
                                  ) : (
                                    <div className={`av ${rxChar.cls}`} style={{ width: 24, height: 24, fontSize: 9, flexShrink: 0, backgroundImage: `url(/avatars/${rxChar.id}.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                      <span style={{ opacity: 0 }}>{rxChar.init}</span>
                                    </div>
                                  )}
                                  <div style={{ fontSize: 12, lineHeight: 1.45, color: 'rgba(255,255,255,.88)' }}>
                                    <span style={{ fontWeight: 700, marginRight: 5 }}>
                                      {isFan || !rxChar ? `@${rx.name ?? 'fan'}` : rxChar.name}
                                    </span>
                                    {isFan && (
                                      <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--ink3)', background: 'rgba(255,255,255,.07)', padding: '1px 5px', borderRadius: 4, marginRight: 5 }}>FAN</span>
                                    )}
                                    {r(rx.text)}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        )}

        {/* Bottom spacing so content isn't hidden under sticky bar */}
        {displaySit && <div style={{ height: 160 }} />}
      </div>

      {/* Sticky bottom — choices before pick, CTAs after */}
      {displaySit && (
        <div className="choice-wrap">
          {chosen === null ? (
            <>
              <div className="choice-q">{r(displaySit.q)}</div>
              {displaySit.choices.map((ch, i) => (
                <button key={i} className="choice" onClick={() => handleChoice(i as 0 | 1)}>
                  <div className="ct">{r(ch.t)}</div>
                  <div className="cs">{r(ch.s)}</div>
                </button>
              ))}
              {stats && (
                <div className="social-proof">
                  {stats.total.toLocaleString()} played · {stats.pctA}% chose A
                </div>
              )}
            </>
          ) : showPost ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={resetAfterChoice}
                style={{ flex: 2, height: 50, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)' }}
              >
                Next Situation →
              </button>
              <button
                onClick={goToFeed}
                style={{ flex: 1, height: 50, background: 'rgba(255,255,255,.07)', color: 'var(--ink2)', fontWeight: 600, fontSize: 13, borderRadius: 14, border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', fontFamily: 'var(--sans)' }}
              >
                Go to Feed
              </button>
            </div>
          ) : (
            /* chosen but showPost not yet — show a brief loading state */
            <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="pulse" style={{ width: 8, height: 8 }} />
            </div>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div className="tabbar">
        <button className="tab" onClick={() => handleTab('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>
          <span>Feed</span>
        </button>
        {isCricket && (
          <button className="tab" onClick={() => handleTab('dms')} style={{ position: 'relative' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {dmBadgeCount > 0 && <div className="badge-num" style={{ top:0, right:8 }}>{dmBadgeCount > 9 ? '9+' : dmBadgeCount}</div>}
            <span>Messages</span>
          </button>
        )}
        <button className="tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4.5 13.5H11L9 22l9-12h-6.5L13 2z" strokeLinejoin="round"/></svg>
          <span>Live</span>
        </button>
        <button className="tab" onClick={() => handleTab('profile')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <span>Profile</span>
        </button>
      </div>


    </div>
  )
}
