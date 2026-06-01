'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import type { CharId } from '@/lib/types'
import { CHARS, SITUATIONS } from '@/lib/data'
import { getStats, clamp } from '@/lib/game'


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

const FINALES = [
  { condition: (f: number, _t: number, h: number) => h > 50, arc: 'Villain Era', sub: 'The internet has a new villain. Congrats — bura naam bhi naam hota hai.', color: '#FF5C3A' },
  { condition: (_f: number, t: number, _h: number) => t > 60, arc: 'Fan Favourite', sub: 'Is ghar ka dil tum ho. Audience tumhare saath hai. Always.', color: '#3DD6C8' },
  { condition: (f: number, _t: number, _h: number) => f > 70, arc: 'Main Character', sub: 'Har scene tumhara. Har headline tumhara. Yahi hai Creator House.', color: '#FFB020' },
  { condition: () => true, arc: 'Dark Horse', sub: 'Quietly. Deadly. Week 2 mein duniya dekhi. Abhi toh trailer tha.', color: '#8a4ab0' },
]

export default function LiveScreen() {
  const { navigate, showToast, game, makeChoice, openDMThread, advanceSituation, injectCharDM } = useApp()

  const char = game.char ? CHARS[game.char] : null

  // Filter situations to only those visible for the current character
  const visibleSituations = SITUATIONS.filter(s =>
    !s.chars || (game.char && s.chars.includes(game.char))
  )

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

  // Per-character react and choices overrides
  const effectiveReact = sit ? (sit.reactByChar?.[game.char!] ?? sit.react) : null
  const effectiveChoices = sit ? (sit.choicesByChar?.[game.char!] ?? sit.choices) : null

  // Meter bar refs
  const fameBarRef = useRef<HTMLElement>(null)
  const trustBarRef = useRef<HTMLElement>(null)
  const heatBarRef = useRef<HTMLElement>(null)

  // Animate meters
  useEffect(() => {
    const set = () => {
      if (fameBarRef.current) fameBarRef.current.style.width = `${clamp(game.meters.fame)}%`
      if (trustBarRef.current) trustBarRef.current.style.width = `${clamp(game.meters.trust)}%`
      if (heatBarRef.current) heatBarRef.current.style.width = `${clamp(game.meters.heat)}%`
    }
    // Reset to 0 first, then animate
    if (fameBarRef.current) fameBarRef.current.style.width = '0%'
    if (trustBarRef.current) trustBarRef.current.style.width = '0%'
    if (heatBarRef.current) heatBarRef.current.style.width = '0%'
    requestAnimationFrame(() => requestAnimationFrame(set))
  }, [game.meters.fame, game.meters.trust, game.meters.heat])

  // Choice state
  const [chosen, setChosen] = useState<0 | 1 | null>(null)
  const [disabled, setDisabled] = useState(false)
  const [showImpact, setShowImpact] = useState(false)   // impact chips appear immediately
  const [showPost, setShowPost] = useState(false)        // IG post slides up
  const [reactions, setReactions] = useState<boolean[]>([false, false, false])
  const [likeCount, setLikeCount] = useState(0)
  const [showNext, setShowNext] = useState(false)
  const [stats, setStats] = useState<{ total: number; pctA: number } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset choice state when situation changes
  useEffect(() => {
    setChosen(null)
    setDisabled(false)
    setShowImpact(false)
    setShowPost(false)
    setReactions([false, false, false])
    setLikeCount(0)
    setShowNext(false)
    setStats(null)
  }, [situation])

  // Load stats for current situation
  useEffect(() => {
    if (sit) {
      getStats(situation).then(setStats).catch(() => setStats({ total: 4218, pctA: 62 }))
    }
  }, [situation, sit])

  const handleChoice = useCallback(async (idx: 0 | 1) => {
    if (disabled || !sit) return
    setChosen(idx)
    setDisabled(true)

    // Show impact chips immediately — no waiting
    setShowImpact(true)

    await makeChoice(idx)

    const ch = sit.choices[idx]

    // Scroll impact area into view
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: 400, behavior: 'smooth' })
    }, 200)

    // Auto-DM from first non-fan reactor (world reacts to your choice)
    const firstReactor = ch.reactions.find(r => r.char !== '__fan')
    if (firstReactor) {
      setTimeout(() => {
        injectCharDM(firstReactor.char as CharId, firstReactor.text)
      }, 1200)
    }

    // IG post slides up after brief pause
    setTimeout(() => {
      setShowPost(true)

      // Animate like count
      let count = 0
      const step = () => {
        count += Math.ceil((1247 - count) / 8)
        if (count >= 1247) { setLikeCount(1247); return }
        setLikeCount(count)
        requestAnimationFrame(step)
      }
      requestAnimationFrame(step)

      // Stagger reactions as IG comments
      ch.reactions.forEach((_, i) => {
        setTimeout(() => {
          setReactions(prev => { const n = [...prev]; n[i] = true; return n })
        }, 650 * (i + 1))
      })

      // Next button after last reaction
      setTimeout(() => setShowNext(true), 650 * ch.reactions.length + 500)
    }, 500)
  }, [disabled, sit, makeChoice])

  const handleNext = useCallback(() => {
    advanceSituation()
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [advanceSituation])

  // Navigate to tabs
  const handleTab = useCallback((tab: string) => {
    if (tab === 'home') navigate('feed')
    else if (tab === 'messages') navigate('dm-inbox')
    else if (tab === 'profile') showToast('Profile jald aayega 🔥')
  }, [navigate, showToast])

  // Finale arc
  const finaleArc = isFinale
    ? FINALES.find(f => f.condition(game.meters.fame, game.meters.trust, game.meters.heat)) ?? FINALES[FINALES.length - 1]
    : null

  if (!char) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
        <div style={{ fontSize: 16, color: 'var(--ink2)', textAlign: 'center' }}>Pehle apna character chuno</div>
        <button
          style={{ padding: '14px 28px', background: 'var(--accent)', color: '#fff', borderRadius: 14, fontWeight: 700, fontSize: 16 }}
          onClick={() => navigate('narrator')}
        >
          Character chuno →
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <StatusBar />

      {/* HUD */}
      <div className="live-head">
        <div className={`av ${char.cls}`} style={{ width: 28, height: 28, fontSize: 12 }}>
          {char.init}
        </div>
        <div className="nm">{char.name}</div>
        <div className="ctr">Situation {Math.min(situation + 1, SITUATIONS.length)} of {SITUATIONS.length}</div>
        <div className="live-badge">
          <div className="pulse" />
          LIVE
        </div>
      </div>

      {/* Meter strip */}
      <div className="meters" style={{ position: 'relative' }}>
        <div className="meter fame">
          <div className="ml">
            <div className="mlabel">⭐ FAME</div>
            <div key={`f${game.meters.fame}`} className="mval mval-flash">{game.meters.fame}</div>
          </div>
          <div className="bar"><i ref={fameBarRef} /></div>
        </div>
        <div className="meter trust">
          <div className="ml">
            <div className="mlabel">🤝 TRUST</div>
            <div key={`t${game.meters.trust}`} className="mval mval-flash">{game.meters.trust}</div>
          </div>
          <div className="bar"><i ref={trustBarRef} /></div>
        </div>
        <div className="meter heat">
          <div className="ml">
            <div className="mlabel">🔥 HEAT</div>
            <div key={`h${game.meters.heat}`} className="mval mval-flash">{game.meters.heat}</div>
          </div>
          <div className="bar"><i ref={heatBarRef} /></div>
        </div>
      </div>

      {/* Main scroll */}
      <div className="live-scroll" ref={scrollRef}>

        {/* Day-lock screen — next day not yet unlocked */}
        {isDayLocked && sit && (
          <div className="day-lock-screen">
            <div className="day-lock-bg" />
            <div className="day-lock-card">
              <div className="day-lock-tag">⚡ DAY {sit.day} · UNLOCKS IN</div>
              <div className="day-lock-countdown">{countdown}</div>
              {sit.dayTeaser && (
                <div className="day-lock-teaser">"{sit.dayTeaser}"</div>
              )}
              <button className="day-lock-btn" disabled>
                COME BACK IN {countdown.split(':')[0]}h {countdown.split(':')[1]}m
              </button>
            </div>
          </div>
        )}

        {/* Finale screen */}
        {isFinale && finaleArc && (
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20, minHeight: '60%', justifyContent: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>WEEK 1 COMPLETE</div>
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
              <div style={{ padding: '10px 16px', background: 'color-mix(in srgb, #3DD6C8 20%, transparent)', border: '1px solid color-mix(in srgb, #3DD6C8 40%, transparent)', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#3DD6C8' }}>
                Trust {game.meters.trust}
              </div>
              <div style={{ padding: '10px 16px', background: 'color-mix(in srgb, #FF5C3A 20%, transparent)', border: '1px solid color-mix(in srgb, #FF5C3A 40%, transparent)', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#FF5C3A' }}>
                Heat {game.meters.heat}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <button
                style={{ width: '100%', height: 54, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 14 }}
                onClick={() => navigate('dm-inbox')}
              >
                DMs check karo →
              </button>
              <button
                style={{ width: '100%', height: 48, background: 'transparent', color: 'var(--ink3)', fontWeight: 500, fontSize: 14, borderRadius: 14, border: '1px solid var(--line)' }}
                onClick={() => openDMThread('reya')}
              >
                Reya ka reaction →
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
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>

            {/* Character reaction — uses per-char override if present */}
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
                    <div className={`react-bubble ${reactChar.cls}`}>{effectiveReact.text}</div>
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
                    {d.trust !== 0 && (
                      <div className={`impact-chip${d.trust > 0 ? ' positive' : ' negative'} trust`}>
                        {d.trust > 0 ? '+' : ''}{d.trust} 🤝
                      </div>
                    )}
                    {d.heat !== 0 && (
                      <div className={`impact-chip${d.heat > 0 ? ' positive' : ' negative'} heat`}>
                        {d.heat > 0 ? '+' : ''}{d.heat} 🔥
                      </div>
                    )}
                  </div>

                  {/* Consequence banner */}
                  {(game.meters.heat > 60 || game.meters.trust < 30) && (
                    <div className="consequence-banner">
                      {game.meters.heat > 60
                        ? '⚠ Heat critical — someone will address this publicly'
                        : '⚠ Trust low — your allies are questioning you'}
                    </div>
                  )}

                  {/* Instagram post slides up */}
                  {showPost && (
                    <div className={`ig-impact-post${showPost ? ' in' : ''}`}>
                      {/* Post header */}
                      <div className="ig-post-head">
                        <div
                          className={`av ${char.cls}`}
                          style={{
                            width: 34, height: 34, fontSize: 14,
                            backgroundImage: `url(/avatars/${char.id}.png)`,
                            backgroundSize: 'cover', backgroundPosition: 'center',
                          }}
                        >
                          <span style={{ opacity:0 }}>{char.init}</span>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{char.handle}</div>
                          <div style={{ fontSize: 10, color: 'var(--ink3)' }}>just now</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 800, letterSpacing: '.06em', color: 'var(--accent)', background: 'rgba(255,45,120,.1)', border: '1px solid rgba(255,45,120,.2)', borderRadius: 10, padding: '3px 8px' }}>
                          POST
                        </div>
                      </div>

                      {/* Post image */}
                      <div
                        className="ig-post-img grain"
                        style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--cc,#333) 70%, #000) 0%, #000 100%)` }}
                      >
                        <p className="overlay-txt" style={{ fontSize: 15, padding: '0 20px' }}>
                          {ch.caption}
                        </p>
                      </div>

                      {/* Post actions */}
                      <div style={{ padding: '8px 14px 4px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <div style={{ flex:1 }} />
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{likeCount.toLocaleString()} likes</span>
                      </div>

                      {/* Comments appearing as IG comments */}
                      <div style={{ paddingBottom: 8 }}>
                        {ch.reactions.map((r, i) => {
                          const rChar = r.char !== '__fan' ? CHARS[r.char as CharId] : null
                          if (r.char !== '__fan' && !rChar) return null // GAP 3: guard against typo char IDs
                          return (
                            <div
                              key={i}
                              style={{
                                display: 'flex', gap: 8, padding: '5px 14px',
                                opacity: reactions[i] ? 1 : 0,
                                transform: reactions[i] ? 'none' : 'translateY(6px)',
                                transition: 'opacity .35s ease, transform .35s ease',
                              }}
                            >
                              <div
                                className={rChar ? `av ${rChar.cls}` : 'av'}
                                style={{
                                  width: 22, height: 22, fontSize: 9, flex: '0 0 auto',
                                  background: rChar ? undefined : '#333',
                                  backgroundImage: rChar ? `url(/avatars/${rChar.id}.png)` : undefined,
                                  backgroundSize: 'cover', backgroundPosition: 'center',
                                }}
                              >
                                <span style={{ opacity:0 }}>{rChar ? rChar.init : (r.name?.[0] ?? 'F')}</span>
                              </div>
                              <div>
                                <span style={{ fontWeight: 700, fontSize: 11, marginRight: 6 }}>
                                  {rChar ? rChar.name : (r.name ?? 'fan')}
                                </span>
                                <span style={{ fontSize: 12, lineHeight: 1.4 }}>{r.text}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Next button inside post area */}
                      {showNext && (
                        <button className="next-btn" style={{ margin: '8px 14px 14px', width: 'calc(100% - 28px)' }} onClick={handleNext}>
                          {situation + 1 < SITUATIONS.length ? 'NEXT SITUATION →' : 'FINALE DEKHO →'}
                        </button>
                      )}
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

      {/* Choice area — sticky bottom, transforms after choice */}
      {sit && !showNext && (
        <div className="choice-wrap">
          {chosen === null ? (
            // Pre-choice: question + two buttons
            <>
              <div className="choice-q">{sit.q}</div>
              {sit.choices.map((ch, i) => (
                <button
                  key={i}
                  className="choice"
                  disabled={disabled}
                  onClick={() => handleChoice(i as 0 | 1)}
                >
                  <div className="ct">{ch.t}</div>
                  <div className="cs">{ch.s}</div>
                </button>
              ))}
              {stats && (
                <div className="social-proof">
                  {stats.total.toLocaleString()} played · {stats.pctA}% chose A
                </div>
              )}
            </>
          ) : (
            // Post-choice: chosen locked/glowing, unchosen faded
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sit.choices.map((ch, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 14, padding: '12px 14px',
                    border: chosen === i ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,.07)',
                    background: chosen === i ? 'rgba(255,45,120,.1)' : 'rgba(255,255,255,.04)',
                    opacity: chosen === i ? 1 : 0.28,
                    transition: 'all .3s ease',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  {chosen === i && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 11, fontWeight: 800 }}>✓</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: chosen === i ? '#fff' : 'var(--ink2)' }}>{ch.t}</div>
                    {chosen === i && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>{ch.s}</div>}
                  </div>
                </div>
              ))}
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
        <button className="tab" onClick={() => handleTab('messages')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
          <span>Messages</span>
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
