'use client'
import { useApp } from '@/lib/context'

interface Props {
  size?: number
  fontSize?: number
  style?: React.CSSProperties
}

/** Shows the player's AI avatar if available, otherwise their initial in accent color. */
export default function PlayerAvatar({ size = 26, fontSize = 11, style }: Props) {
  const { game } = useApp()
  const initial = (game.playerName?.[0] ?? 'Y').toUpperCase()

  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: game.avatarUrl ? 'transparent' : 'var(--accent)',
        backgroundImage: game.avatarUrl ? `url(${game.avatarUrl})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'grid', placeItems: 'center',
        fontSize, fontWeight: 800, color: '#fff',
        ...style,
      }}
    >
      {!game.avatarUrl && initial}
    </div>
  )
}
