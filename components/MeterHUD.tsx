'use client'
import { useEffect, useRef } from 'react'
import { useApp } from '@/lib/context'
import { CHARS } from '@/lib/data'
import { fameToFollowers, clamp } from '@/lib/game'

function followersStr(fame: number): string {
  const n = fameToFollowers(fame)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

interface Props {
  /** Optional extra element rendered on the right of the top row (e.g. LIVE badge) */
  right?: React.ReactNode
}

export default function MeterHUD({ right }: Props) {
  const { game } = useApp()
  const charId = game.char ?? 'kabir'
  const char = CHARS[charId]

  const fameRef   = useRef<HTMLElement>(null)
  const heatRef   = useRef<HTMLElement>(null)
  const imageRef  = useRef<HTMLElement>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    const set = () => {
      if (fameRef.current)  fameRef.current.style.width  = `${clamp(game.meters.fame)}%`
      if (heatRef.current)  heatRef.current.style.width  = `${clamp(game.meters.heat)}%`
      if (imageRef.current) imageRef.current.style.width = `${clamp(game.meters.image)}%`
    }
    // Reset to 0 only on first mount for the reveal animation; subsequent updates animate from current value
    if (!mountedRef.current) {
      mountedRef.current = true
      if (fameRef.current)  fameRef.current.style.width  = '0%'
      if (heatRef.current)  heatRef.current.style.width  = '0%'
      if (imageRef.current) imageRef.current.style.width = '0%'
    }
    requestAnimationFrame(() => requestAnimationFrame(set))
  }, [game.meters.fame, game.meters.heat, game.meters.image])

  return (
    <div className="meter-hud">
      {/* Top row: avatar + name + followers | optional right slot */}
      <div className="mhud-top">
        <div
          className="av"
          style={{
            width: 26, height: 26, fontSize: 11, flexShrink: 0,
            background: 'var(--accent)', color: '#fff', fontWeight: 800,
          }}
        >
          {(game.playerName?.[0] ?? 'Y').toUpperCase()}
        </div>
        <div className="mhud-identity">
          <div className="mhud-name">{game.playerName || 'You'}</div>
          <div key={`fw${game.meters.fame}`} className="mhud-followers">
            {followersStr(game.meters.fame)} followers
          </div>
        </div>
        {right && <div className="mhud-right">{right}</div>}
      </div>

      {/* Bottom row: three meters — labels change per world */}
      {(() => {
        const isCricket = game.world === 'cricket'
        const labels = isCricket
          ? ['🏏 FORM', '⭐ FAME', '🤝 TRUST']
          : ['⭐ FAME', '🔥 Heat', '🤝 Image']
        return (
          <div className="mhud-bars">
            <div className="meter fame">
              <div className="ml">
                <div className="mlabel">{labels[0]}</div>
                <div key={`f${game.meters.fame}`} className="mval mval-flash">{game.meters.fame}</div>
              </div>
              <div className="bar"><i ref={fameRef} /></div>
            </div>
            <div className="meter heat">
              <div className="ml">
                <div className="mlabel">{labels[1]}</div>
                <div key={`h${game.meters.heat}`} className="mval mval-flash">{game.meters.heat}</div>
              </div>
              <div className="bar"><i ref={heatRef} /></div>
            </div>
            <div className="meter image">
              <div className="ml">
                <div className="mlabel">{labels[2]}</div>
                <div key={`i${game.meters.image}`} className="mval mval-flash">{game.meters.image}</div>
              </div>
              <div className="bar"><i ref={imageRef} /></div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
