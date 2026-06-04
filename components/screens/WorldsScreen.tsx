'use client'
import { useCallback, useRef, useState } from 'react'
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

  const handleTab = useCallback((tab: string) => {
    if (tab === 'live') {
      navigate('feed')
    }
  }, [navigate])

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

          {/* Creator House — dominant LIVE world */}
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
                LIVE
              </div>
              <div className="wc-name">Creator House</div>
              <div className="wc-status">
                <div className="pulse" />
                Day 1 of 10 · Villa opens tonight.
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

          {/* Sharma Niwas */}
          <button
            className="world-card"
            onClick={() => showToast('Coming soon — abhi sirf Creator House live hai')}
          >
            <div
              className="wc-cover"
              style={{ background: 'linear-gradient(135deg,#ffb020,#7a4a00)' }}
            >
              <div className="wc-badge">ONGOING</div>
              <div className="wc-name">Sharma Niwas</div>
              <div className="wc-status">
                The new bahu found the loan papers.
              </div>
            </div>
            <div className="wc-foot">
              <div className="av-stack">
                {['S','P','A'].map((init) => (
                  <div key={init} className="av" style={{ width: 24, height: 24, fontSize: 10, background: '#b07a2a' }}>
                    {init}
                  </div>
                ))}
              </div>
              <div className="wc-meta">9 family members · 840k following</div>
            </div>
          </button>

          {/* Block C */}
          <button
            className={`world-card dim${shakingCard === 'block-c' ? ' shake' : ''}`}
            onClick={() => triggerShake('block-c', 'Jald aa raha hai 🔥')}
          >
            <div
              className="wc-cover"
              style={{ background: 'linear-gradient(135deg,#00c9c8,#075a59)' }}
            >
              <div className="wc-badge">SEASON 1</div>
              <div className="wc-lock"><LockIcon /></div>
              <div className="wc-name">Block C</div>
              <div className="wc-status">College hostel. 6 floors. Zero sleep.</div>
            </div>
            <div className="wc-foot">
              <div className="av-stack">
                {['A','S','R'].map((init) => (
                  <div key={init} className="av" style={{ width: 24, height: 24, fontSize: 10, background: '#075a59' }}>
                    {init}
                  </div>
                ))}
              </div>
              <div className="wc-meta">Coming soon</div>
            </div>
          </button>

          {/* The Shaadi */}
          <button
            className={`world-card dim${shakingCard === 'shaadi' ? ' shake' : ''}`}
            onClick={() => triggerShake('shaadi', 'Jald aa raha hai 🔥')}
          >
            <div
              className="wc-cover"
              style={{ background: 'linear-gradient(135deg,#e0563b,#6e1f12)' }}
            >
              <div className="wc-badge">7 DAYS</div>
              <div className="wc-lock"><LockIcon /></div>
              <div className="wc-name">The Shaadi</div>
              <div className="wc-status">48 hours. 3 families. 1 secret.</div>
            </div>
            <div className="wc-foot">
              <div className="av-stack">
                {['P','A','N'].map((init) => (
                  <div key={init} className="av" style={{ width: 24, height: 24, fontSize: 10, background: '#6e1f12' }}>
                    {init}
                  </div>
                ))}
              </div>
              <div className="wc-meta">Coming soon</div>
            </div>
          </button>

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
        <button className="tab" onClick={() => navigate('profile')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <span>Profile</span>
        </button>
      </div>

      {/* Toast */}
      {/* Toast is rendered by parent via context; individual screens don't render it */}
    </div>
  )
}
