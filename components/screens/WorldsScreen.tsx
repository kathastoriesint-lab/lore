'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'

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

const LoreLogo = () => (
  <svg className="lore-mark" viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ff2d78"/>
        <stop offset=".55" stopColor="#ff8a3d"/>
        <stop offset="1" stopColor="#ffd24d"/>
      </linearGradient>
    </defs>
    <circle className="ring" cx="16" cy="16" r="13.5" stroke="url(#lg)" strokeWidth="3" strokeDasharray="58 12" strokeLinecap="round"/>
    <circle cx="16" cy="16" r="6.4" stroke="#ff2d78" strokeWidth="2.4"/>
    <circle cx="16" cy="16" r="1.9" fill="#ffd24d"/>
  </svg>
)

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="1.8">
    <rect x="5" y="11" width="14" height="9" rx="2"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
  </svg>
)

export default function WorldsScreen() {
  const { navigate, showToast, game } = useApp()
  const [shakingCard, setShakingCard] = useState<string | null>(null)
  const shakeTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const [appIntroSlide, setAppIntroSlide] = useState(0)
  const [showAppIntro, setShowAppIntro] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('seen_app_intro')) {
      const t = setTimeout(() => setShowAppIntro(true), 550)
      return () => clearTimeout(t)
    }
  }, [])

  const dismissAppIntro = useCallback(() => {
    localStorage.setItem('seen_app_intro', '1')
    setShowAppIntro(false)
  }, [])

  const nextAppIntro = useCallback(() => {
    if (appIntroSlide < 2) setAppIntroSlide(s => s + 1)
    else dismissAppIntro()
  }, [appIntroSlide, dismissAppIntro])

  const handleTab = useCallback((tab: string) => {
    if (tab === 'live') {
      if (game.world === 'cricket') navigate('feed')
      else navigate('world-intro')
    }
  }, [navigate, game.world])

  const triggerShake = useCallback((cardId: string, msg: string) => {
    setShakingCard(cardId)
    showToast(msg)
    if (shakeTimers.current[cardId]) clearTimeout(shakeTimers.current[cardId])
    shakeTimers.current[cardId] = setTimeout(() => setShakingCard(null), 500)
  }, [showToast])

  const handleCreatorHouse = useCallback(() => {
    navigate('world-intro')
  }, [navigate])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StatusBar />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 20px 12px' }}>
        <div className="worlds-head">
          <div className="lore-logo">
            <LoreLogo />
            <div>
              <div className="logo">Lore</div>
              <div className="logo-sub">Live your story</div>
            </div>
          </div>
        </div>
        <button className="icon-btn" onClick={() => showToast('Notifications coming soon')}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
      </div>

      {/* World list */}
      <div className="scroll">
        <div className="world-list">

          {/* Indian Dressing Room — lead world for India */}
          <button
            className="world-card"
            onClick={() => navigate(
              // In-progress run resumes where it left off (LiveScreen redirects
              // to the lock screen if an interlude is active). Carousel only
              // plays for fresh runs — re-entering must never wipe progress.
              game.world === 'cricket' && game.situation > 0 ? 'live' : 'cricket-carousel'
            )}
            style={{ boxShadow: '0 0 0 1.5px rgba(0,48,135,.5), 0 12px 40px rgba(0,48,135,.25)' }}
          >
            <div
              className="wc-cover"
              style={{ background: 'linear-gradient(135deg,#003087,#001540)', height: 210 }}
            >
              <div className="wc-badge" style={{ color: '#FFB020' }}>
                <div className="pulse" style={{ background: '#FFB020' }} />
                LIVE · SEASON 1
              </div>
              <div className="wc-name">Indian Dressing Room</div>
              <div className="wc-status">
                <div className="pulse" style={{ background: '#FFB020' }} />
                16 saal. Mumbai Indians. Pehla IPL.
              </div>
            </div>
            <div className="wc-foot">
              <div className="av-stack">
                {[
                  { init: 'H', cls: 'c-hardik' },
                  { init: 'R', cls: 'c-rohit' },
                  { init: 'S', cls: 'c-surya' },
                  { init: 'J', cls: 'c-bumrah' },
                ].map((c) => (
                  <div key={c.init} className={`av ${c.cls}`} style={{ width: 24, height: 24, fontSize: 10 }}>
                    {c.init}
                  </div>
                ))}
              </div>
              <div className="wc-meta">Mumbai Indians · 30 situations · 5 endings</div>
            </div>
          </button>

          {/* Creator House */}
          <button
            className={`world-card${shakingCard === 'creator-house' ? ' shake' : ''}`}
            onClick={handleCreatorHouse}
            style={{ boxShadow: '0 0 0 1.5px rgba(255,45,120,.35), 0 12px 40px rgba(255,45,120,.18)' }}
          >
            <div
              className="wc-cover"
              style={{ background: 'linear-gradient(135deg,#ff2d78,#7a1140)', height: 210 }}
            >
              <div className="wc-badge">
                <div className="pulse" />
                LIVE · SEASON 1
              </div>
              <div className="wc-name">Creator House</div>
              <div className="wc-status">
                <div className="pulse" />
                6 creators. Ek villa. 10 din.
              </div>
            </div>
            <div className="wc-foot">
              <div className="av-stack">
                {(['R','K','M','A'] as const).map((init, i) => {
                  const cls = ['c-reya','c-kabir','c-meher','c-ananya'][i]
                  return (
                    <div key={init} className={`av ${cls}`} style={{ width: 24, height: 24, fontSize: 10 }}>
                      {init}
                    </div>
                  )
                })}
              </div>
              <div className="wc-meta">6 creators · 1.2M following</div>
            </div>
          </button>

          {/* Locked worlds — coming soon */}
          {[
            { id: 'college-hostel',   name: 'College Hostel',    sub: 'Ragging, crush, exams, politics.', gradient: 'linear-gradient(135deg,#1a5a3a,#0a2a1a)', accent: '#2a9a6a' },
            { id: 'indian-mythology', name: 'Indian Mythology',  sub: 'Gods, wars, dharma, destiny.',      gradient: 'linear-gradient(135deg,#7a3a1a,#3a1a0a)', accent: '#FFB020' },
            { id: 'corporate-drama',  name: 'Corporate Drama',   sub: 'Office politics. Real money.',      gradient: 'linear-gradient(135deg,#1a2a5a,#0a1020)', accent: '#6a8aff' },
          ].map(w => (
            <button
              key={w.id}
              className={`world-card${shakingCard === w.id ? ' shake' : ''}`}
              onClick={() => triggerShake(w.id, 'Yeh world jald aayega 🔐')}
              style={{ opacity: 0.72 }}
            >
              <div className="wc-cover" style={{ background: w.gradient, height: 140 }}>
                <div className="wc-badge" style={{ color: w.accent, borderColor: `${w.accent}44` }}>
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="5" y="11" width="14" height="9" rx="2"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                  </svg>
                  COMING SOON
                </div>
                <div className="wc-name" style={{ fontSize: 22, opacity: 0.9 }}>{w.name}</div>
                <div className="wc-status" style={{ opacity: 0.6 }}>{w.sub}</div>
              </div>
            </button>
          ))}

        </div>
      </div>

      {/* Tab bar */}
      <div className="tabbar">
        <button className="tab active" onClick={() => {}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 3c-2.5 3-4 5.7-4 9s1.5 6 4 9"/>
            <path d="M12 3c2.5 3 4 5.7 4 9s-1.5 6-4 9"/>
            <path d="M3 12h18"/>
          </svg>
          <span>Worlds</span>
        </button>
        <button className="tab" onClick={() => navigate('profile-global')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <span>Profile</span>
        </button>
      </div>

      {/* Toast */}
      {/* Toast is rendered by parent via context; individual screens don't render it */}

      {/* App Intro Overlay */}
      <div className={`app-intro-overlay${showAppIntro ? ' show' : ''}`}>
        <div className="app-intro-sheet">
          <div className="app-intro-handle" />
          <div className="app-intro-window">
            <div className="app-intro-track" style={{ transform: `translateX(-${appIntroSlide * 100}%)` }}>

              {/* Slide 1 — What is Lore */}
              <div className="app-intro-slide">
                <div className="app-intro-logo">
                  <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
                    <defs>
                      <linearGradient id="aiG" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#ff2d78"/>
                        <stop offset=".55" stopColor="#ff8a3d"/>
                        <stop offset="1" stopColor="#ffd24d"/>
                      </linearGradient>
                    </defs>
                    <circle cx="16" cy="16" r="13.5" stroke="url(#aiG)" strokeWidth="3" strokeDasharray="58 12" strokeLinecap="round"/>
                    <circle cx="16" cy="16" r="6.4" stroke="#ff2d78" strokeWidth="2.4"/>
                    <circle cx="16" cy="16" r="1.9" fill="#ffd24d"/>
                  </svg>
                  <span>Lore</span>
                </div>
                <div className="app-intro-h">Pick a world.<br />Become a character.</div>
                <p className="app-intro-p">
                  Every choice has fallout.<br /><br />
                  This isn&apos;t a story you read —<br />it&apos;s a world you live in.
                </p>
              </div>

              {/* Slide 2 — How it works */}
              <div className="app-intro-slide">
                <div className="app-intro-h">Teen tarike hain duniya jeene ke.</div>
                <div className="app-intro-rows">
                  <div className="app-intro-row">
                    <div className="app-intro-row-dot" style={{ background: 'var(--accent)' }} />
                    <div>
                      <div className="app-intro-row-label">Live</div>
                      <div className="app-intro-row-sub">Choices karo. Har choice ka fallout hota hai — meters pe, relationships pe.</div>
                    </div>
                  </div>
                  <div className="app-intro-row">
                    <div className="app-intro-row-dot" style={{ background: 'var(--trust)' }} />
                    <div>
                      <div className="app-intro-row-label">DMs</div>
                      <div className="app-intro-row-sub">Characters tumse baat karte hain. Trust ke saath unka tone badalta hai.</div>
                    </div>
                  </div>
                  <div className="app-intro-row">
                    <div className="app-intro-row-dot" style={{ background: 'var(--fame)' }} />
                    <div>
                      <div className="app-intro-row-label">Feed</div>
                      <div className="app-intro-row-sub">Duniya tumhari moves pe react karti hai. Viral ya forgotten — tumhare haath mein.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3 — CTA */}
              <div className="app-intro-slide" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                <div className="app-intro-h" style={{ fontSize: 36 }}>Ab shuru karo.</div>
                <p className="app-intro-p" style={{ marginTop: 16 }}>
                  Ek world chunno.<br />Apni story jeeo.
                </p>
              </div>

            </div>
          </div>

          <div className="app-intro-dots">
            {[0, 1, 2].map(i => (
              <span key={i} className={`app-intro-dot${i === appIntroSlide ? ' active' : ''}`} />
            ))}
          </div>

          <div className="app-intro-foot">
            <button className="app-intro-cta-btn" onClick={nextAppIntro}>
              {appIntroSlide === 2 ? 'Duniya Chunno →' : 'Next →'}
            </button>
            {appIntroSlide < 2 && (
              <button className="app-intro-skip-btn" onClick={dismissAppIntro}>Skip</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
