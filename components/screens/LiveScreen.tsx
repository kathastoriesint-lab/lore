'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
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
  const { navigate, showToast, game, makeChoice, openDMThread, advanceSituation } = useApp()

  const char = game.char ? CHARS[game.char] : null
  const situation = game.situation
  const sit = situation < SITUATIONS.length ? SITUATIONS[situation] : null
  const isFinale = situation >= SITUATIONS.length

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
  const [showFlash, setShowFlash] = useState(false)
  const [flashText, setFlashText] = useState('')
  const [flashChar, setFlashChar] = useState<CharId | null>(null)
  const [reactions, setReactions] = useState<boolean[]>([false, false, false])
  const [showPost, setShowPost] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [showNext, setShowNext] = useState(false)
  const [stats, setStats] = useState<{ total: number; pctA: number } | null>(null)
  const [postCaption, setPostCaption] = useState('')
  const [postChar, setPostChar] = useState<CharId | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset choice state when situation changes
  useEffect(() => {
    setChosen(null)
    setDisabled(false)
    setShowFlash(false)
    setFlashText('')
    setFlashChar(null)
    setReactions([false, false, false])
    setShowPost(false)
    setLikeCount(0)
    setShowNext(false)
    setStats(null)
    setPostCaption('')
    setPostChar(null)
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

    const ch = sit.choices[idx]
    const reactChar = ch.reactions[0]?.char !== '__fan' ? ch.reactions[0]?.char as CharId : null

    // Show flash overlay
    setFlashText(ch.s)
    setFlashChar(reactChar || (char?.id ?? null))
    setShowFlash(true)

    await makeChoice(idx)

    setTimeout(() => {
      setShowFlash(false)

      // Show reaction post
      setPostCaption(ch.caption)
      setPostChar(char?.id ?? null)
      setShowPost(true)

      // Animate like count 0 → 1200
      let count = 0
      const step = () => {
        count += Math.ceil((1200 - count) / 8)
        if (count >= 1200) {
          setLikeCount(1200)
          return
        }
        setLikeCount(count)
        requestAnimationFrame(step)
      }
      requestAnimationFrame(step)

      // Show reactions one by one
      ch.reactions.forEach((_, i) => {
        setTimeout(() => {
          setReactions(prev => { const n = [...prev]; n[i] = true; return n })
        }, 800 * (i + 1))
      })

      // Show next button after last reaction
      setTimeout(() => {
        setShowNext(true)
      }, 800 * ch.reactions.length + 600)
    }, 950)
  }, [disabled, sit, char, makeChoice])

  const handleNext = useCallback(() => {
    advanceSituation()
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [advanceSituation])

  // Navigate to tabs
  const handleTab = useCallback((tab: string) => {
    if (tab === 'home') navigate('worlds')
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

            {/* Character reaction */}
            {(() => {
              const reactChar = CHARS[sit.react.char]
              return (
                <div className="sit-react">
                  <div className={`av ${reactChar.cls}`} style={{ width: 26, height: 26, fontSize: 11 }}>
                    {reactChar.init}
                  </div>
                  <div className="react-body">
                    <div className="rn">{reactChar.name}</div>
                    <div className={`react-bubble ${reactChar.cls}`}>{sit.react.text}</div>
                  </div>
                </div>
              )
            })()}

            {/* Reaction posts (appear after choice) */}
            {showPost && sit.choices[chosen!] && (
              <div style={{ marginTop: 20 }}>
                {/* Your post */}
                <div style={{
                  borderRadius: 16, overflow: 'hidden', marginBottom: 12,
                  background: `linear-gradient(135deg, color-mix(in srgb, var(--cc) 80%, #000) 0%, #000 100%)`,
                }} className={char.cls}>
                  <div style={{ padding: '16px 16px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div className={`av ${char.cls}`} style={{ width: 26, height: 26, fontSize: 11 }}>{char.init}</div>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{char.handle}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.4 }}>{postCaption}</div>
                  </div>
                  <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{likeCount.toLocaleString()} likes</span>
                  </div>
                </div>

                {/* Character reactions */}
                {sit.choices[chosen!].reactions.map((r, i) => {
                  const isUser = r.char === '__fan'
                  const rChar = isUser ? null : CHARS[r.char as CharId]
                  return (
                    <div key={i} className={`reaction${reactions[i] ? ' in' : ''}`}>
                      <div
                        className={rChar ? `av ${rChar.cls}` : 'av'}
                        style={{ width: 26, height: 26, fontSize: 11, background: rChar ? undefined : '#333' }}
                      >
                        {rChar ? rChar.init : (r.name?.[0] ?? 'F')}
                      </div>
                      <div className="rb">
                        <div className="rn">{rChar ? rChar.name : (r.name ?? 'fan')}</div>
                        <div className="rbub">{r.text}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Bottom spacing */}
        {sit && <div style={{ height: 240 }} />}
      </div>

      {/* Choice / next button sticky area */}
      {sit && (
        <div className="choice-wrap">
          {/* Next situation button */}
          {showNext && (
            <button className="next-btn" onClick={handleNext}>
              {situation + 1 < SITUATIONS.length ? 'NEXT SITUATION →' : 'FINALE DEKHO →'}
            </button>
          )}

          {/* Choice buttons */}
          {!showNext && (
            <>
              <div className="choice-q">{sit.q}</div>
              {sit.choices.map((ch, i) => (
                <button
                  key={i}
                  className={`choice${chosen === i ? ' chosen' : ''}`}
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
          )}
        </div>
      )}

      {/* Tab bar */}
      <div className="tabbar">
        <button className="tab" onClick={() => handleTab('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 3c-2.5 3-4 5.7-4 9s1.5 6 4 9"/>
            <path d="M12 3c2.5 3 4 5.7 4 9s-1.5 6-4 9"/>
            <path d="M3 12h18"/>
          </svg>
          <span>Worlds</span>
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

      {/* Flash overlay */}
      <div className={`flash${showFlash ? ' show' : ''}`}>
        {flashChar && (
          <div className={`av ${CHARS[flashChar]?.cls ?? ''}`} style={{ width: 64, height: 64, fontSize: 26 }}>
            {CHARS[flashChar]?.init ?? '?'}
          </div>
        )}
        <div className="ft">{flashText}</div>
      </div>
    </div>
  )
}
