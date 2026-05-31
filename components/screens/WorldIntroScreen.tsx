'use client'
import { useApp } from '@/lib/context'
import { CHARS } from '@/lib/data'

const CAST: (keyof typeof CHARS)[] = ['reya','kabir','meher','ananya','dev','zoya','rishi','adi']

export default function WorldIntroScreen() {
  const { navigate } = useApp()
  const enter = () => navigate('feed')

  return (
    <div className="wintro-screen">
      {/* Cinematic cover — gradient placeholder */}
      <div className="wintro-cover" />

      {/* LIVE badge */}
      <div className="wintro-live">
        <span className="pulse" />
        LIVE · DAY 1 OF 30
      </div>

      {/* Bottom content */}
      <div className="wintro-content">
        <div className="wintro-title">Creator<br />House.</div>
        <div className="wintro-meta">8 creators. Ek villa. 30 din.</div>

        <div className="wintro-hook">
          <b>Aaj raat, villa khul raha hai.</b> 8 strangers pehli baar mile hain.
          Koi dushman nahi, koi dost nahi — but by morning, alliances ban jaayengi.
        </div>

        <div className="wintro-cast">
          <div className="wintro-avs">
            {CAST.map(id => (
              <div key={id} className={`wintro-av ${CHARS[id].cls}`}>
                {CHARS[id].init}
              </div>
            ))}
          </div>
          <div className="wintro-cast-meta">
            8 creators<br />10k+ playing
          </div>
        </div>

        <div className="wintro-ctas">
          <button className="wintro-btn-main" onClick={enter}>Andar aao →</button>
          <button className="wintro-btn-skip" onClick={enter}>Skip intro</button>
        </div>
      </div>
    </div>
  )
}
