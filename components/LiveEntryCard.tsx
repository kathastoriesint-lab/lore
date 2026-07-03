'use client'
import { useCallback } from 'react'
import { useApp } from '@/lib/context'
import { getVisibleSituations } from '@/lib/ch-rules'
import { getCricketSituations, getCricketChars } from '@/lib/content'
import { weekForSituationId } from '@/lib/season'
import { resolveTokens, asCricket } from '@/lib/game'
import { captainTrust } from '@/lib/cricket-selection'
import { resolveCricketEnding } from '@/lib/cricket-rules'

// The India verdict ARRIVES — the season's climax lands in Coach Sir's thread
// (typing dots, exact numbers, YOUR name) before any finale screen. This is
// the product thesis at its peak: the letter arrives; you don't walk to it.
const VERDICT_DMS: Record<string, string[]> = {
  indiaCall: [
    'Beta. Phone uthao. SELECTOR ka call tha. Seedha Mumbai se.',
    'INDIA A squad — tumhara naam LIST MEIN HAI. Bola unhone: runs bhi, aur dressing room bhi. Dono.',
    '11 saal ka tha tu jab maine bola tha — yeh din aayega. AA GAYA. 🇮🇳',
  ],
  captainsBet: [
    'Beta, list aa gayi. India A — naam hai tumhara.',
    "Selector ne khud bola: 'Hardik ne apna naam laga diya iske liye.' Captain ka bharosa tumhe le gaya.",
    'Ab yeh bharosa NIBHANA hai. Yahi asli kaam shuru hota hai.',
  ],
  statsMachine: [
    'Beta, India A list mein naam aa gaya. Numbers ne darwaza khola.',
    'Par ek sach bhi sun — call pe kisi ne tumhara naam garmi se nahi liya. Kamra abhi thanda hai.',
    'Runs darwaze kholte hain. Rishte kamre garam karte hain. Agli baar — dono.',
  ],
  notYet: [
    'Beta. List aayi. Is baar naam nahi hai.',
    "Suno mujhe. 16 saal mein 'not yet' ka matlab 'never' NAHI hota. Kabhi nahi hota.",
    'Kal subah 6 baje academy. Pehli ball se phir shuru. Main wahan rahunga — jaise hamesha tha.',
  ],
}

export default function LiveEntryCard() {
  const { game, navigate, openDMThread, injectCharDM, startDmStorySession, dmTrust, dmHistory } = useApp()
  const isCricket = game.world === 'cricket'
  const visibleSits = isCricket ? getCricketSituations() : getVisibleSituations(game.meters, game.choices)
  const nextSit = visibleSits[game.situation]

  const enterLive = useCallback(() => {
    navigate(game.char ? 'live' : 'narrator')
  }, [navigate, game.char])

  // Deliver THE call into the coach thread once; after that the card goes to the
  // finale screen. Delivered = the first verdict bubble already sits in the thread
  // (server-persisted, so this survives reloads and devices).
  const ending = isCricket ? resolveCricketEnding(asCricket(game.meters).form, captainTrust(dmTrust), (game.benchedWeeks ?? []).length) : 'notYet'
  const verdictLines = VERDICT_DMS[ending] ?? VERDICT_DMS.notYet
  const verdictDelivered = (dmHistory['coach'] ?? []).some(m => m.text === verdictLines[0])

  const deliverVerdict = useCallback(() => {
    if (!verdictDelivered) {
      const meta = { day: 11, phase: 'EVENING', note: 'India ki list' }
      verdictLines.forEach(text => injectCharDM('coach', text, undefined, meta))
      startDmStorySession('coach')
    }
    openDMThread('coach')
  }, [verdictDelivered, verdictLines, injectCharDM, startDmStorySession, openDMThread])

  // The full season has been played. Cricket: first the CALL arrives (coach DM),
  // then the card routes to the Live finale ceremony.
  if (!nextSit) {
    if (isCricket) return (
      <div className="le-wrap">
        <button className="le-cta cricket" onClick={verdictDelivered ? enterLive : deliverVerdict}>
          <div className="le-row">
            <div className="le-play">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="le-eye">SEASON FINALE · INDIA LIST</div>
              <div className="le-ttl">{verdictDelivered ? 'Verdict aa gaya 🏏' : 'Coach Sir calling… 📞'}</div>
              <div className="le-sub">{verdictDelivered ? 'Season ka hisaab dekho' : 'List nikli hai — coach ka phone aa raha hai'}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </button>
      </div>
    )
    return (
      <div className="le-wrap">
        <div className="le-cta" style={{ cursor: 'default' }}>
          <div className="le-row">
            <div className="le-play" style={{ background: 'rgba(255,255,255,.14)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="le-eye">SEASON 1 COMPLETE</div>
              <div className="le-ttl">10 din khatam 🎬</div>
              <div className="le-sub">Tumne poora ghar jee liya. Naya season jald…</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const eyebrow = isCricket
    ? `WEEK ${weekForSituationId(nextSit.id)} · ${nextSit.tag.replace(/^[^A-Za-z]*/, '').trim() || 'NEXT'}`
    : `NEXT CHOICE · DAY ${nextSit.day}`
  const title = resolveTokens(nextSit.title ?? '', game.playerName, game.playerGender)
  const sub = resolveTokens(nextSit.body[0] ?? '', game.playerName, game.playerGender)
    .replace(/<[^>]+>/g, '').slice(0, 76)

  const missionChar = game.activeMission ? getCricketChars()[game.activeMission.char] : null

  return (
    <div className="le-wrap">
      {missionChar && (
        <button
          onClick={() => openDMThread(game.activeMission!.char)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%', marginBottom: 8,
            background: 'color-mix(in srgb, var(--accent) 12%, rgba(8,8,15,.96))',
            border: '1px solid color-mix(in srgb, var(--accent) 45%, transparent)',
            borderRadius: 14, padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, backgroundImage: `url(/avatars/${game.activeMission!.char}.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: 'var(--accent)' }}>📌 STORY MISSION</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', marginTop: 2 }}>{missionChar.name.split(' ')[0]} wait kar raha hai — baat shuru karo</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      )}
      <button className={`le-cta${isCricket ? ' cricket' : ''}`} onClick={enterLive}>
        <div className="le-row">
          <div className="le-play">
            <span />
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><polygon points="7,4 20,12 7,20" /></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="le-eye">{eyebrow}</div>
            <div className="le-ttl">{title}</div>
            <div className="le-sub">{sub}…</div>
          </div>
          <svg className="le-chev" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </div>
      </button>
    </div>
  )
}
