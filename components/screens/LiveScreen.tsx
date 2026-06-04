'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import type { CharId } from '@/lib/types'
import { CHARS, SITUATIONS, getVisibleSituations } from '@/lib/data'
import { getStats, clamp, resolveEnding, resolveTokens } from '@/lib/game'
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

export default function LiveScreen() {
  const { navigate, game, makeChoice, advanceSituation, injectCharDM } = useApp()
  // Tracks when we're mid-choice-flow so the situation-change effect doesn't clear showPost
  const inFlowRef = useRef(false)

  const char = game.char ? CHARS[game.char] : null
  // Shorthand: resolve {name}/{ally}/{crush} tokens using current player state
  const r = (text: string) => resolveTokens(text, game.playerName, game.playerGender)

  // Get visible situations for current meters/choices
  const visibleSituations = getVisibleSituations(game.meters, game.choices)

  const situation = game.situation
  const sit = situation < visibleSituations.length ? visibleSituations[situation] : null
  const isFinale = situation >= visibleSituations.length

  // Day-lock: detect if next situation is in a future day that hasn't unlocked yet
  const prevSit = situation > 0 ? visibleSituations[situation - 1] : null
  const isDayLocked = sit && prevSit && sit.day > prevSit.day &&
    game.dayUnlockTime[sit.day] != null &&
    game.dayUnlockTime[sit.day] > Date.now()

  // Countdown timer for locked day
  const [countdown, setCountdown] = useState('')
  useEffect(() => {
    if (!isDayLocked || !sit) return
    const update = () => {
      const ms = game.dayUnlockTime[sit.day] - Date.now()
      if (ms <= 0) { setCountdown('00:00:00'); return }
      const h = Math.floor(ms / 3_600_000)
      const m = Math.floor((ms % 3_600_000) / 60_000)
      const s = Math.floor((ms % 60_000) / 1_000)
      setCountdown(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    update()
    const t = setInterval(update, 1_000)
    return () => clearInterval(t)
  }, [isDayLocked, sit, game.dayUnlockTime])

  // Effective react (v2: no per-char override, just sit.react)
  const effectiveReact = sit ? sit.react : null


  // Choice state
  const [chosen, setChosen] = useState<0 | 1 | null>(null)
  const [showImpact, setShowImpact] = useState(false)
  const [showPost, setShowPost] = useState(false)
  const [stats, setStats] = useState<{ total: number; pctA: number } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  // Ref-based processing guard — synchronously prevents double-tap between React renders
  const processingRef = useRef(false)
  // Timer cleanup refs to prevent post-unmount fires
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

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

  const handleChoice = useCallback(async (idx: 0 | 1) => {
    if (processingRef.current || !sit) return
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

    addTimer(() => { scrollRef.current?.scrollTo({ top: 400, behavior: 'smooth' }) }, 200)

    const firstReactor = ch.reactions.find(r => r.char !== '__fan')
    if (firstReactor) {
      addTimer(() => { injectCharDM(firstReactor.char as CharId, firstReactor.text) }, 1200)
    }

    // Show "Posted to feed ✓", advance situation (+ single Supabase write), then navigate
    addTimer(() => {
      setShowPost(true)
      advanceSituation()  // ONE write: meters+choices (from makeChoice) + situation
      addTimer(() => {
        // Reset all choice state so the NEXT situation is playable when user returns to Live
        inFlowRef.current = false
        setChosen(null)
        setShowImpact(false)
        setShowPost(false)
        processingRef.current = false
        timersRef.current = []
        navigate('feed')
      }, 1800)
    }, 500)
  }, [sit, makeChoice, advanceSituation, navigate, injectCharDM])


  // Navigate to tabs
  const handleTab = useCallback((tab: string) => {
    if (tab === 'home') navigate('feed')
    else if (tab === 'profile') navigate('profile')
  }, [navigate])

  // Finale arc — uses resolveEnding
  const endingKey = isFinale ? resolveEnding(game.meters) : null
  const finaleArc = endingKey ? FINALE_DATA[endingKey] : null

  if (!char) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
        <div style={{ fontSize: 16, color: 'var(--ink2)', textAlign: 'center' }}>Apna naam aur gender batao pehle</div>
        <button
          style={{ padding: '14px 28px', background: 'var(--accent)', color: '#fff', borderRadius: 14, fontWeight: 700, fontSize: 16 }}
          onClick={() => navigate('world-intro')}
        >
          Shuru karo →
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <StatusBar />

      {/* Shared HUD — avatar + name + followers + 3 meters */}
      <MeterHUD right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, color: 'var(--ink3)', fontWeight: 600 }}>
            Day {visibleSituations[situation]?.day ?? 1}
          </span>
          <div className="live-badge">
            <div className="pulse" />
            LIVE
          </div>
        </div>
      } />

      {/* Main scroll */}
      <div className="live-scroll" ref={scrollRef}>

        {/* Day-lock screen — next day not yet unlocked */}
        {isDayLocked && sit && (
          <div className="day-lock-screen">
            <div className="day-lock-bg" />
            <div className="day-lock-card">
              <div className="day-lock-tag">⚡ DAY {sit.day} · UNLOCKS IN</div>
              <div className="day-lock-countdown">{countdown}</div>
              <button className="day-lock-btn" disabled>
                COME BACK IN {countdown.split(':')[0]}h {countdown.split(':')[1]}m
              </button>
            </div>
          </div>
        )}

        {/* Finale screen */}
        {isFinale && finaleArc && (
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20, minHeight: '60%', justifyContent: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>CREATOR HOUSE — FINALE</div>
            <div style={{
              fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 36, lineHeight: 1.1,
              color: finaleArc.color
            }}>
              {finaleArc.arc}
            </div>
            <div style={{ fontSize: 15, color: 'var(--ink2)', lineHeight: 1.55 }}>{finaleArc.sub}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <div style={{ padding: '10px 16px', background: `color-mix(in srgb, ${finaleArc.color} 20%, transparent)`, border: `1px solid color-mix(in srgb, ${finaleArc.color} 40%, transparent)`, borderRadius: 12, fontSize: 12, fontWeight: 700, color: finaleArc.color }}>
                Fame {game.meters.fame}
              </div>
              <div style={{ padding: '10px 16px', background: 'color-mix(in srgb, #FF5C3A 20%, transparent)', border: '1px solid color-mix(in srgb, #FF5C3A 40%, transparent)', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#FF5C3A' }}>
                Heat {game.meters.heat}
              </div>
              <div style={{ padding: '10px 16px', background: 'color-mix(in srgb, #3DD6C8 20%, transparent)', border: '1px solid color-mix(in srgb, #3DD6C8 40%, transparent)', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#3DD6C8' }}>
                Image {game.meters.image}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <button
                style={{ width: '100%', height: 54, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 14 }}
                onClick={() => navigate('profile')}
              >
                Profile dekho →
              </button>
              <button
                style={{ width: '100%', height: 48, background: 'transparent', color: 'var(--ink3)', fontWeight: 500, fontSize: 14, borderRadius: 14, border: '1px solid var(--line)' }}
                onClick={() => navigate('feed')}
              >
                Feed dekho →
              </button>
            </div>
          </div>
        )}

        {/* Situation */}
        {sit && (
          <div className="situation">
            <div className="sit-tag">{sit.tag}</div>
            <div className="sit-title">{sit.title}</div>
            <div className="sit-body">
              {sit.body.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: r(p) }} />
              ))}
            </div>

            {/* Character reaction */}
            {effectiveReact && (() => {
              const reactChar = CHARS[effectiveReact.char]
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
                    <div className="rn">{reactChar.name}</div>
                    <div className={`react-bubble ${reactChar.cls}`}>{r(effectiveReact.text)}</div>
                  </div>
                </div>
              )
            })()}

            {/* ── Impact section (Hybrid A+C design) ── */}
            {showImpact && chosen !== null && sit.choices[chosen] && (() => {
              const ch = sit.choices[chosen]
              const d = ch.deltas
              return (
                <div style={{ marginTop: 20 }}>
                  {/* Impact chips row */}
                  <div className="impact-chips-row">
                    {d.fame !== 0 && (
                      <div className={`impact-chip${d.fame > 0 ? ' positive' : ' negative'} fame`}>
                        {d.fame > 0 ? '+' : ''}{d.fame} ⭐
                      </div>
                    )}
                    {d.heat !== 0 && (
                      <div className={`impact-chip${d.heat > 0 ? ' positive' : ' negative'} heat`}>
                        {d.heat > 0 ? '+' : ''}{d.heat} 🔥
                      </div>
                    )}
                    {d.image !== 0 && (
                      <div className={`impact-chip${d.image > 0 ? ' positive' : ' negative'} image`}>
                        {d.image > 0 ? '+' : ''}{d.image} 🤝
                      </div>
                    )}
                  </div>

                  {/* Consequence banner */}
                  {(game.meters.heat > 75 || game.meters.image < 20) && (
                    <div className="consequence-banner">
                      {game.meters.heat > 75
                        ? '⚠ Heat critical — someone will address this publicly'
                        : '⚠ Image low — brands are watching'}
                    </div>
                  )}

                  {/* "Posted to feed" confirmation — then auto-navigate */}
                  {showPost && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: '14px 16px',
                        background: 'rgba(255,45,120,.08)',
                        border: '1px solid rgba(255,45,120,.22)',
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        animation: 'fadeUp .35s ease-out',
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,45,120,.18)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)' }}>Posted to feed</div>
                        <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>Ghar react kar raha hai... feed dekho →</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        {/* Bottom spacing */}
        {sit && <div style={{ height: 240 }} />}
      </div>

      {/* Choice area — sticky bottom, hidden after choice */}
      {sit && chosen === null && (
        <div className="choice-wrap">
          <div className="choice-q">{r(sit.q)}</div>
          {sit.choices.map((ch, i) => (
            <button
              key={i}
              className="choice"
              onClick={() => handleChoice(i as 0 | 1)}
            >
              <div className="ct">{r(ch.t)}</div>
              <div className="cs">{r(ch.s)}</div>
            </button>
          ))}
          {stats && (
            <div className="social-proof">
              {stats.total.toLocaleString()} played · {stats.pctA}% chose A
            </div>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div className="tabbar">
        <button className="tab" onClick={() => handleTab('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>
          </svg>
          <span>Feed</span>
        </button>
        <button className="tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L4.5 13.5H11L9 22l9-12h-6.5L13 2z" strokeLinejoin="round"/>
          </svg>
          <span>Live</span>
        </button>
        <button className="tab" onClick={() => handleTab('profile')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <span>Profile</span>
        </button>
      </div>

    </div>
  )
}
