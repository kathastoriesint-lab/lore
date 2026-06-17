'use client'
import { useEffect, useRef } from 'react'
import { useApp } from '@/lib/context'
import { fameToFollowers, clamp } from '@/lib/game'
import { getCHChars, getCHSituations } from '@/lib/content'
import PlayerAvatar from './PlayerAvatar'

function followersStr(fame: number): string {
  const n = fameToFollowers(fame)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

interface Props {
  right?: React.ReactNode
  /** Hide the @handle / follower header row — use when the parent already shows this info (e.g. ProfileScreen) */
  hideHeader?: boolean
}

export default function MeterHUD({ right, hideHeader }: Props) {
  const { game } = useApp()
  const isCricket = game.world === 'cricket'

  const fameRef  = useRef<HTMLElement>(null)
  const heatRef  = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLElement>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    const set = () => {
      if (fameRef.current)  fameRef.current.style.width  = `${clamp(game.meters.fame)}%`
      if (heatRef.current)  heatRef.current.style.width  = `${clamp(game.meters.heat)}%`
      if (imageRef.current) imageRef.current.style.width = `${clamp(game.meters.image)}%`
    }
    if (!mountedRef.current) {
      mountedRef.current = true
      if (fameRef.current)  fameRef.current.style.width  = '0%'
      if (heatRef.current)  heatRef.current.style.width  = '0%'
      if (imageRef.current) imageRef.current.style.width = '0%'
    }
    requestAnimationFrame(() => requestAnimationFrame(set))
  }, [game.meters.fame, game.meters.heat, game.meters.image])

  const charData = !isCricket && game.char && game.char !== 'player' ? getCHChars()[game.char] : null
  const handle = charData
    ? `@${charData.handle}`
    : `@${(game.playerName || 'you').toLowerCase().replace(/\s+/g, '')}`
  // Use actual sit.day from data rather than a formula — the formula diverges when
  // days have unequal numbers of situations (e.g. Day 2 has 5 situations, not 3)
  const currentDay = getCHSituations()[game.situation]?.day ?? Math.max(1, Math.ceil((game.situation + 1) / 3))
  const worldLine = isCricket
    ? `Mumbai Indians · Season 1`
    : `Creator House · Day ${currentDay} of 10`

  // Cricket: FORM + FAME + TEAM TRUST. "Team Trust" is the pooled dressing-room
  // standing — distinct from the per-senior trust (Rohit/Hardik) the Live goal card
  // surfaces for the story gates.
  const meters = isCricket
    ? [
        { label: 'FORM',  val: game.meters.fame,  ref: fameRef,  color: 'var(--fame)',  cls: 'fame' },
        { label: 'FAME',  val: game.meters.heat,  ref: heatRef,  color: 'var(--heat)',  cls: 'heat' },
        { label: 'TEAM TRUST', val: game.meters.image, ref: imageRef, color: 'var(--trust)', cls: 'image' },
      ]
    : [
        { label: 'FAME',  val: game.meters.fame,  ref: fameRef,  color: 'var(--fame)',  cls: 'fame' },
        { label: 'HEAT',  val: game.meters.heat,  ref: heatRef,  color: 'var(--heat)',  cls: 'heat' },
        { label: 'TRUST', val: game.meters.image, ref: imageRef, color: 'var(--trust)', cls: 'image' },
      ]

  return (
    <div style={{
      background: 'rgba(8,8,15,.96)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--line)',
      padding: '10px 16px 10px',
      position: 'relative', zIndex: 4, flexShrink: 0,
    }}>
      {/* Row 1: @handle + world·day | followers (hidden when parent already shows this) */}
      {!hideHeader && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PlayerAvatar size={32} fontSize={13} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1.2 }}>{handle}</div>
            <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 1 }}>{worldLine}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div key={`fw${isCricket ? game.meters.heat : game.meters.fame}`} style={{ fontWeight: 800, fontSize: 15, color: '#fff', animation: 'meterFlash .4s ease-out', lineHeight: 1.2 }}>
              {followersStr(isCricket ? game.meters.heat : game.meters.fame)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink3)' }}>followers</div>
          </div>
          {right && <div style={{ flexShrink: 0, marginLeft: 4 }}>{right}</div>}
        </div>
      )}

      {/* Row 2: three meters side by side */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        {meters.map(m => (
          <div key={m.label} style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.06em', color: m.color }}>{m.label}</span>
              <span key={`${m.cls}${m.val}`} style={{ fontSize: 12, fontWeight: 800, color: m.color, animation: 'meterFlash .4s ease-out' }}>{m.val}</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
              <i ref={m.ref} style={{ display: 'block', height: '100%', borderRadius: 3, background: m.color, width: 0, transition: 'width .7s cubic-bezier(.32,.72,0,1)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
