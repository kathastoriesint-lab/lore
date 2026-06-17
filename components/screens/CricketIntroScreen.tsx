'use client'
import { useApp } from '@/lib/context'
import { getCricketChars, getCricketNarrChars } from '@/lib/content'

export default function CricketIntroScreen() {
  const { startCricketGame, navigate, game } = useApp()

  const handleEnter = () => {
    // Resume an in-progress run — startCricketGame would wipe situation/meters/trust.
    if (game.world === 'cricket' && game.situation > 0) {
      navigate('live')
    } else if (game.playerName) {
      startCricketGame()
    } else {
      navigate('onboarding')
    }
  }

  return (
    <div className="wintro-screen" style={{ background: 'linear-gradient(160deg, #001540 0%, #08080F 60%)' }}>
      <div className="wintro-cover" style={{ background: 'linear-gradient(160deg, rgba(0,48,135,.6) 0%, transparent 70%)' }} />

      <div className="wintro-content">
        {/* Badge */}
        <div className="wi-line in">
          <div className="wi-pre" style={{ color: 'var(--fame)' }}>
            <div className="pulse" style={{ background: 'var(--fame)' }} />
            MUMBAI INDIANS · IPL SEASON 1
          </div>
        </div>

        {/* Title */}
        <div className="wi-line in">
          <div className="wi-title" style={{ fontSize: 28, lineHeight: 1.15 }}>Indian<br />Dressing Room</div>
        </div>

        {/* Premise */}
        <div className="wi-line in">
          <div className="wi-meta" style={{ marginBottom: 0 }}>
            You are a 16-year-old batting prodigy. Mumbai Indians just bought you.
          </div>
          <div className="wi-drama" style={{ borderLeftColor: 'var(--c-rohit, #003087)', background: 'rgba(0,48,135,.1)', marginTop: 12 }}>
            The internet calls you the future. The dressing room asks a simpler question:
            <br /><br />
            <b style={{ color: 'var(--fame)' }}>Can you actually play?</b>
          </div>
        </div>

        {/* Cast */}
        <div className="wintro-chars" style={{ marginTop: 20 }}>
          {getCricketNarrChars().map(([id, desc]) => {
            const ch = getCricketChars()[id]
            if (!ch) return null
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                <div
                  className={`av ${ch.cls}`}
                  style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0, backgroundImage: `url(/avatars/${id}.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <span style={{ opacity: 0 }}>{ch.init}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{ch.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink3)', lineHeight: 1.45, marginTop: 2, whiteSpace: 'pre-line' }}>
                    {desc}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Meters */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {[
            { label: '🏏 FORM', color: 'var(--fame)',  desc: 'Cricket credibility' },
            { label: '⭐ FAME', color: 'var(--heat)',  desc: 'Public attention' },
            { label: '🤝 TRUST', color: 'var(--trust)', desc: 'Dressing room belief' },
          ].map(m => (
            <div key={m.label} style={{ flex: 1, background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: m.color, letterSpacing: '.06em' }}>{m.label}</div>
              <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 3 }}>{m.desc}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="wi-cta" style={{ marginTop: 20 }}>
          <button className="wi-btn" style={{ background: '#003087', boxShadow: '0 8px 24px rgba(0,48,135,.4)' }} onClick={handleEnter}>
            Enter Dressing Room →
          </button>
          <button className="wi-skip-btn" onClick={() => navigate('worlds')}>← Back to Worlds</button>
        </div>
      </div>
    </div>
  )
}
