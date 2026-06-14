'use client'
import { useApp } from '@/lib/context'

export default function WorldIntroScreen() {
  const { startGame, navigate, game } = useApp()

  // Resume an in-progress Creator House run — startGame would wipe it.
  const enter = () => {
    if (game.world === 'creator-house' && game.situation > 0 && game.char) navigate('feed')
    else startGame()
  }

  return (
    <div className="wintro-screen">
      <div className="wintro-cover" />

      <div className="wintro-live">
        <span className="pulse" />
        LIVE · DAY 1 OF 10
      </div>

      <div className="wintro-body">
        <div className="wintro-intro-block">
          <div className="wintro-tl in">
            Creator<br />House.
          </div>
          <div className="wintro-sub in">
            6 creators. Ek villa. 10 din.
          </div>
          <div className="wintro-hook in">
            Tum sabse naye ho. Koi tumhe nahi jaanta — abhi.
          </div>
        </div>

        <div className="wintro-cta-block" style={{ marginTop: 40 }}>
          <button className="wintro-btn-main" onClick={enter}>
            Enter the House →
          </button>
          <button
            onClick={() => navigate('worlds')}
            style={{ marginTop: 14, width: '100%', padding: '12px 0', fontSize: 14, color: 'rgba(255,255,255,.45)', fontWeight: 500 }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
