'use client'
import { useCallback } from 'react'
import { useApp } from '@/lib/context'
import { getVisibleSituations } from '@/lib/ch-rules'
import { getCricketSituations } from '@/lib/content'
import { resolveTokens } from '@/lib/game'

// Docked "entry banner" that launches the live story. Rendered above the tab bar
// on both the Feed and the Messages inbox — this is now the ONLY way into Live
// (the bottom-tab "Live" entrypoint was removed). Copy is pulled from the next
// pending situation, so it doubles as a "resume" button mid-beat.
export default function LiveEntryCard() {
  const { game, navigate } = useApp()
  const isCricket = game.world === 'cricket'
  const visibleSits = isCricket ? getCricketSituations() : getVisibleSituations(game.meters, game.choices)
  const nextSit = visibleSits[game.situation]

  const enterLive = useCallback(() => {
    navigate(game.char ? 'live' : 'narrator')
  }, [navigate, game.char])

  // Nothing left to play (all situations resolved) → no banner.
  if (!nextSit) return null

  const eyebrow = isCricket
    ? `SITUATION ${game.situation + 1} · ${nextSit.tag.split('·')[1]?.trim() ?? 'NEXT'}`
    : `NEXT CHOICE · DAY ${nextSit.day}`
  const sub = resolveTokens(nextSit.body[0] ?? '', game.playerName, game.playerGender)
    .replace(/<[^>]+>/g, '').slice(0, 76)

  return (
    <div className="le-wrap">
      <button className={`le-cta${isCricket ? ' cricket' : ''}`} onClick={enterLive}>
        <div className="le-row">
          <div className="le-play">
            <span />
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><polygon points="7,4 20,12 7,20" /></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="le-eye">{eyebrow}</div>
            <div className="le-ttl">{nextSit.title}</div>
            <div className="le-sub">{sub}…</div>
          </div>
          <svg className="le-chev" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </div>
      </button>
    </div>
  )
}
