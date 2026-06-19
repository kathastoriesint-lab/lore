// Creator House — Eviction Night.
// Built ON TOP OF the existing storyline: the Day 3 and Day 7 eviction beats already
// exist as situations (D3-1..D3-3 pre-vote scramble + loyalty test; D7-1..D7-2 the vote).
// The outcomes were scripted in code comments ([VOTE: Dev always evicted Day 3], etc.).
// This turns that comment into a real ceremony — nominations, house votes, an audience
// bar, a live tally, and the reveal — without changing the surrounding storyline.
//
// Voice: roman-Hinglish, the way real users talk.

import type { CharId, GameState, Situation } from './types'
import { getCHSituations } from './content'
import { allyLoyalty } from './game'

export interface HouseVote { voter: CharId; target: CharId; line: string }

export interface EvictionNight {
  id: string
  day: number
  intro: string
  nominees: CharId[]
  evicted: CharId
  houseVotes: HouseVote[]
  /** Public-vote share among nominees (sums ~100 across nominees). */
  audience: Partial<Record<CharId, number>>
  goodbye: string          // evicted housemate's parting line
  aftermath: string        // one line that lands after the chair empties
  /** True when the EVICTED is the player — the run ends (real loss). */
  playerEvicted?: boolean
}

// situationId that, once completed, triggers an eviction night before the next beat.
export const EVICTION_TRIGGERS: Record<string, string> = {
  'D3-3': 'EV-D3',
  'D7-2': 'EV-D7',
}

// ── Eviction-night TENSION: TRUST drives follower pressure (psychological only) ──
// TRUST (the `image` meter — "logon ka bharosa") is who has your back at a vote.
// The player is NEVER actually evicted — your followers always keep you — but the
// threat is real on screen. TRUST decides how close it gets:
//   trust >= threshold → SAFE: a housemate goes, your name never comes up.
//   floor <= trust < threshold → ON THE BLOCK: your name comes up, you survive.
//   trust < floor → FOLLOWER PRESSURE peaks: your name leads the vote, your followers
//                   save you anyway — but the house noticed. (Never a real loss.)
export const EVICTION_SAFETY: Record<string, { day: number; threshold: number; floor: number }> = {
  'EV-D3': { day: 3, threshold: 28, floor: 16 },  // lenient — TRUST starts at 30
  'EV-D7': { day: 7, threshold: 40, floor: 26 },  // by now you should have built it
}

export type RiskStatus = 'safe' | 'risk' | 'critical'

/** The next eviction the player is heading toward, given the current day. */
export function nextEvictionFor(currentDay: number): { id: string; day: number; threshold: number; floor: number } | null {
  if (currentDay <= 3) return { id: 'EV-D3', ...EVICTION_SAFETY['EV-D3'] }
  if (currentDay <= 7) return { id: 'EV-D7', ...EVICTION_SAFETY['EV-D7'] }
  return null
}

/** Eviction-risk readout for the Live focus card. */
export function evictionRisk(trust: number, currentDay: number):
  | { day: number; threshold: number; floor: number; trust: number; status: RiskStatus }
  | null {
  const ev = nextEvictionFor(currentDay)
  if (!ev) return null
  const status: RiskStatus = trust >= ev.threshold ? 'safe' : trust >= ev.floor ? 'risk' : 'critical'
  return { day: ev.day, threshold: ev.threshold, floor: ev.floor, trust, status }
}

/** True if the player themselves is on the chopping block at this eviction. */
export function playerStatusAt(evId: string, trust: number): RiskStatus {
  const s = EVICTION_SAFETY[evId]
  if (!s) return 'safe'
  return trust >= s.threshold ? 'safe' : trust >= s.floor ? 'risk' : 'critical'
}

function loyaltyOf(game: GameState): number {
  const sits = game.situationQueue
    .map(id => getCHSituations().find(s => s.id === id))
    .filter(Boolean) as Situation[]
  return allyLoyalty(game.choices, sits)
}

// Build the full ceremony payload from game state at trigger time. Choices don't change
// during the ceremony, so this can be recomputed safely inside the screen.
export function buildEviction(id: string, game: GameState): EvictionNight | null {
  const base = buildBaseEviction(id, game)
  if (!base) return null

  // Option B: the player's TRUST decides their own fate at the vote.
  const status = playerStatusAt(id, game.meters.image)
  if (status === 'safe') return base

  const ally: CharId = game.playerGender === 'male' ? 'kabir' : 'ananya'

  if (status === 'critical') {
    // Follower pressure peaks — your name leads the vote and it looks lost... but your
    // followers keep you in. You stay; the house NPC still goes. (Psychological only —
    // the player is never evicted.) The house noticed how close it got.
    return {
      ...base,
      nominees: ['player', ...base.nominees],
      houseVotes: [
        { voter: 'ria',  target: 'player',     line: 'Naye banda ka bharosa hi nahi bana ghar mein. Dekhte hain followers kya kehte hain.' },
        { voter: 'zoya', target: 'player',     line: 'Tumne kisi ko apna nahi banaya. Risky hai tumhaare liye. 💅' },
        { voter: ally,   target: base.evicted, line: 'Main tumhaare saath hoon — chahe ghar kuch bhi kahe.' },
      ],
      // High share = closest to eviction; base.evicted (an NPC) still tops it, you sit just under.
      audience: { [base.evicted]: 44, player: 40, ...Object.fromEntries(base.nominees.filter(n => n !== base.evicted).map(n => [n, 16])) },
      aftermath: base.aftermath + ' Tumhaara naam aakhir tak top pe gunja — followers ne bachaya, bas. Ghar ne note kar liya: trust nahi banaya toh akele pad jaoge.',
    }
  }

  // status === 'risk' — your name comes up, but you survive comfortably.
  return {
    ...base,
    nominees: ['player', ...base.nominees],
    audience: { [base.evicted]: 46, player: 33, ...Object.fromEntries(base.nominees.filter(n => n !== base.evicted).map(n => [n, 21])) },
    aftermath: base.aftermath + ' Aur tumhaara naam bhi aaya — TRUST banaye rakho, warna har baar yeh tension rahegi.',
  }
}

function buildBaseEviction(id: string, game: GameState): EvictionNight | null {
  const male = game.playerGender === 'male'
  const ally: CharId = male ? 'kabir' : 'ananya'

  if (id === 'EV-D3') {
    // Zoya's naam sab ke moonh pe tha — par ghar Dev ko jaana padta hai. The twist.
    return {
      id, day: 3,
      intro: 'Pehli eviction night. Do naam khatre mein. Lights down, ek hi spotlight.',
      nominees: ['dev', 'zoya'],
      evicted: 'dev',
      houseVotes: [
        { voter: 'ria',    target: 'dev',  line: 'Numbers game hai. Dev ke paas the hi nahi. Sorry not sorry.' },
        { voter: 'kabir',  target: 'dev',  line: 'Bhai personal kuch nahi... bas content ke hisaab se. 😬' },
        { voter: 'ananya', target: 'zoya', line: 'Main Zoya ko vote kar rahi hoon. Usse darr lagta hai mujhe.' },
      ],
      audience: { dev: 58, zoya: 42 },
      goodbye: 'Brand deals aate rahenge. Discipline kabhi nahi rukti. Main wapas aaunga. 💪',
      aftermath: 'Subah Dev ki khaali kursi sabse pehle dikhti hai. Koi kuch nahi bolta.',
    }
  }

  if (id === 'EV-D7') {
    const loyal = loyaltyOf(game) >= 2
    const evicted: CharId = loyal ? 'zoya' : ally
    const allyName = male ? 'Kabir' : 'Ananya'
    return {
      id, day: 7,
      intro: 'Doosri eviction. Is baar daav personal hai — tumhaara apna banda line pe hai.',
      nominees: ['zoya', ally],
      evicted,
      houseVotes: loyal
        ? [
            { voter: 'ria',   target: 'zoya', line: 'Zoya ka game over. Maine bahut dekh liya. 👀' },
            { voter: ally === 'kabir' ? 'ananya' : 'kabir', target: 'zoya', line: 'Tumne stand liya — main bhi le rahi/raha hoon. Zoya jaaye.' },
          ]
        : [
            { voter: 'ria',   target: ally, line: `Tumhaara "banda" akela pad gaya. Koi publicly saath nahi tha.` },
            { voter: 'zoya',  target: ally, line: 'Smile ke peeche maine ginti rakhi thi. Aaj kaam aayi. 💅' },
          ],
      audience: loyal ? { zoya: 61, [ally]: 39 } : { [ally]: 55, zoya: 45 },
      goodbye: loyal
        ? 'Sab ko smile dikhati rahi. Aaj sab ne asli chehra dekh liya. Bye babies. 💅'
        : `Tu publicly saath khada hota toh main aaj yahan na hota. ${''}Yaad rakhna. 😔`,
      aftermath: loyal
        ? 'Zoya gayi. Ghar thoda halka, thoda khaali. Tumne apna banda bacha liya.'
        : `${allyName} chala gaya. Loyalty sirf private mein thi — aur yahan woh kaafi nahi hoti.`,
    }
  }

  return null
}
