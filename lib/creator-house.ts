// Creator House — Eviction Night.
// Built ON TOP OF the existing storyline: the Day 3 and Day 7 eviction beats already
// exist as situations (D3-1..D3-3 pre-vote scramble + loyalty test; D7-1..D7-2 the vote).
// The outcomes were scripted in code comments ([VOTE: Dev always evicted Day 3], etc.).
// This turns that comment into a real ceremony — nominations, house votes, an audience
// bar, a live tally, and the reveal — without changing the surrounding storyline.
//
// Voice: roman-Hinglish, the way real users talk.

import type { CharId, GameState, Situation } from './types'
import { getCHSituations, getCHChars } from './content'
import { allyLoyalty, allyId, resolveTokens, fameToFollowers } from './game'
import { computeBond } from './relationships'
import { tr } from './lang'

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
  'D4-1': 'EV-D4',   // Kabir's cinematic eviction — fired only when NOT shielded (see page.tsx)
  'D7-2': 'EV-D7',
}

// ── Eviction-night TENSION: your ALLY BOND drives follower pressure (psychological) ──
// The image/TRUST meter is gone. Who has your back at a vote is now your ALLY — so the
// pressure reads off your ally bond (0–100, the same "Bond" shown on the Profile). The
// player is NEVER actually evicted — your followers always keep you — but the threat is
// real on screen. The ally bond decides how close it gets:
//   bond >= threshold → SAFE: a housemate goes, your name never comes up.
//   floor <= bond < threshold → ON THE BLOCK: your name comes up, you survive.
//   bond < floor → FOLLOWER PRESSURE peaks: your name leads the vote, followers save you
//                  anyway — but the house noticed. (Never a real loss.)
// Thresholds retuned to the bond scale (base ~50): by Day 7 you must have actively built
// the ally bond to sit safe.
export const EVICTION_SAFETY: Record<string, { day: number; threshold: number; floor: number }> = {
  'EV-D3': { day: 3, threshold: 45, floor: 30 },  // lenient — ally bond starts ~50
  'EV-D7': { day: 7, threshold: 60, floor: 45 },  // by now you should have built it
}

/** Eviction-night pressure signal (0–100): the strength of your ALLY bond — they're
 *  who defends you at the vote. Replaces the old TRUST/image meter. */
export function evictionTrust(game: GameState): number {
  return computeBond(allyId(game.playerGender), 'creator-house', game.choices, game.playerName, game.playerGender, game.dmTrust ?? {}).bond
}

/**
 * DM story-context for Creator House — the twin of cricket's buildStorySummary.
 * Grounds an AI DM reply in the villa arc: the day, the follower stakes, the
 * romance "spine", who's been evicted, and the choices so far. Returns a prompt
 * string (never null) — meaningful from Day 1, even before the first choice, so
 * housemates always reply aware of where the story actually is.
 */
export function chStorySummary(game: GameState, dmTrust: Record<string, number> = {}): string {
  const sits = getCHSituations()
  const sitMap: Record<string, Situation> = Object.fromEntries(sits.map(s => [s.id, s]))
  const queue = game.situationQueue.length ? game.situationQueue : sits.map(s => s.id)
  const gender = game.playerGender
  const name = game.playerName || 'the newcomer'
  const rt = (t: string) => resolveTokens(t, name, gender)
  const crushCid: CharId = gender === 'female' ? 'kabir' : 'ananya'
  const ally = allyId(gender)
  const chars = getCHChars()
  const crushName = chars[crushCid]?.name ?? 'their crush'
  const allyName = chars[ally]?.name ?? 'their closest ally'

  // WHAT HAS HAPPENED — the choices so far (tokens resolved to real names).
  const lines: string[] = []
  game.choices.forEach((letter, idx) => {
    const sit = queue[idx] ? sitMap[queue[idx]] : null
    const choice = sit?.choices[letter === 'A' ? 0 : 1]
    if (sit && choice) lines.push(`- ${rt(sit.title)}: chose "${rt(choice.t).slice(0, 60)}"`)
  })

  // CURRENT SITUATION — the present-tense truth the character MUST reply from.
  const now: string[] = []
  const day = Math.min(10, Math.ceil((game.situation + 1) / 3))
  now.push(`It is Day ${day} of 10 in the Creator House — a reality content villa where FOLLOWERS are survival (every public vote is a follower; run low and you get evicted).`)
  const followers = fameToFollowers(game.meters.fame)
  now.push(`${name} has about ${followers.toLocaleString('en-IN')} followers right now.`)
  const crushBond = Math.round(computeBond(crushCid, 'creator-house', game.choices, name, gender, dmTrust).bond)
  now.push(`ROMANCE (the "spine"): ${name} and ${crushName} share a real history — they met 3 years ago, before the show. Closeness with ${crushName} right now: ${crushBond}/100. This tension runs under everything.`)
  if (game.flags?.allyEvicted) {
    now.push(`EVICTION: ${allyName} — ${name}'s closest ally — has already been EVICTED and is GONE. Never speak as if ${allyName} is still in the house.`)
  } else if (game.flags?.savedAlly) {
    now.push(`EVICTION: on the danger night ${name} spent their own standing to SHIELD ${allyName}; Dev was evicted instead. ${allyName} is still here and owes ${name}.`)
  }
  const curSit = sitMap[queue[game.situation]]
  if (curSit) now.push(`Where the story is RIGHT NOW: "${rt(curSit.title)}"${curSit.tag ? ` — ${curSit.tag}` : ''}.`)

  const parts: string[] = []
  parts.push(`CURRENT SITUATION — this is TRUE RIGHT NOW inside the Creator House. Ground every reply in it: the day, the follower stakes, the romance with ${crushName}, and who has been evicted. You are a housemate texting between filming — react to where the story actually is, never invent plot.\n` + now.map(l => '- ' + l).join('\n'))
  if (lines.length) parts.push(`WHAT HAS HAPPENED (${name}'s choices so far):\n` + lines.join('\n'))
  return parts.join('\n\n')
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

  // The player's ALLY BOND decides their own fate at the vote.
  const status = playerStatusAt(id, evictionTrust(game))
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
        { voter: 'ria',  target: 'player',     line: tr('Naye banda ka bharosa hi nahi bana ghar mein. Dekhte hain followers kya kehte hain.', 'The new one never earned this house\'s trust. Let\'s see what the followers have to say.') },
        { voter: 'zoya', target: 'player',     line: tr('Tumne kisi ko apna nahi banaya. Risky hai tumhaare liye. 💅', 'You never made anyone here your own. That\'s a dangerous way to play. 💅') },
        { voter: ally,   target: base.evicted, line: tr('Main tumhaare saath hoon — chahe ghar kuch bhi kahe.', 'I\'m with you — whatever this house says.') },
      ],
      // High share = closest to eviction; base.evicted (an NPC) still tops it, you sit just under.
      audience: { [base.evicted]: 44, player: 40, ...Object.fromEntries(base.nominees.filter(n => n !== base.evicted).map(n => [n, 16])) },
      aftermath: base.aftermath + tr(' Tumhaara naam aakhir tak top pe gunja — followers ne bachaya, bas. Ghar ne note kar liya: trust nahi banaya toh akele pad jaoge.', ' Your name led the vote until the very end — the followers saved you, nothing else. The house took note: build trust, or stand alone.'),
    }
  }

  // status === 'risk' — your name comes up, but you survive comfortably.
  return {
    ...base,
    nominees: ['player', ...base.nominees],
    audience: { [base.evicted]: 46, player: 33, ...Object.fromEntries(base.nominees.filter(n => n !== base.evicted).map(n => [n, 21])) },
    aftermath: base.aftermath + tr(' Aur tumhaara naam bhi aaya — TRUST banaye rakho, warna har baar yeh tension rahegi.', ' And your name came up too — keep the TRUST alive, or this dread comes back every single vote.'),
  }
}

function buildBaseEviction(id: string, game: GameState): EvictionNight | null {
  const male = game.playerGender === 'male'
  const ally: CharId = male ? 'kabir' : 'ananya'

  if (id === 'EV-D3') {
    // Zoya's naam sab ke moonh pe tha — par ghar Dev ko jaana padta hai. The twist.
    return {
      id, day: 3,
      intro: tr('Pehli eviction night. Do naam khatre mein. Lights down, ek hi spotlight.', 'The first eviction night. Two names in danger. Lights down — one spotlight.'),
      nominees: ['dev', 'zoya'],
      evicted: 'dev',
      houseVotes: [
        { voter: 'ria',    target: 'dev',  line: tr('Numbers game hai. Dev ke paas the hi nahi. Sorry not sorry.', 'It\'s a numbers game. Dev never had them. Sorry not sorry.') },
        { voter: 'kabir',  target: 'dev',  line: tr('Bhai personal kuch nahi... bas content ke hisaab se. 😬', 'Nothing personal, bro... purely a content decision. 😬') },
        { voter: 'ananya', target: 'zoya', line: tr('Main Zoya ko vote kar rahi hoon. Usse darr lagta hai mujhe.', 'I\'m voting Zoya. She scares me.') },
      ],
      audience: { dev: 58, zoya: 42 },
      goodbye: tr('Brand deals aate rahenge. Discipline kabhi nahi rukti. Main wapas aaunga. 💪', 'The brand deals will keep coming. Discipline never stops. I\'ll be back. 💪'),
      aftermath: tr('Subah Dev ki khaali kursi sabse pehle dikhti hai. Koi kuch nahi bolta.', 'In the morning, Dev\'s empty chair is the first thing everyone sees. Nobody says a word.'),
    }
  }

  if (id === 'EV-D4') {
    // Day-4 eviction — the ally. Only reached when the player did NOT shield them
    // (page.tsx gates the trigger on !savedAlly), so this always evicts the ally.
    // Two nominees (ally + Zoya) so the vote is a real choice like EV-D3 — the result
    // is scripted (the ally goes) but the ceremony reads like a real eviction night.
    const allyName = male ? 'Kabir' : 'Ananya'
    const other: CharId = male ? 'ananya' : 'kabir'   // the other housemate votes to save the ally
    return {
      id, day: 4,
      intro: tr('Doosri danger raat ka faisla. Do naam khatre mein — lights down, ek spotlight.', 'The second danger night\'s verdict. Two names in danger — lights down, one spotlight.'),
      nominees: [ally, 'zoya'],
      evicted: ally,
      houseVotes: [
        { voter: 'ria',  target: ally,   line: tr('Danger night mein numbers bolte hain. Support nahi bana na... 😬', 'On a danger night, the numbers do the talking. You never built the support... 😬') },
        { voter: other,  target: 'zoya', line: tr(`Zoya ka naam jaana chahiye. Main soch-samajh ke vote de ${male ? 'rahi' : 'raha'} hoon.`, 'It\'s Zoya\'s name that should go. I\'m casting this vote with my eyes open.') },
      ],
      audience: { [ally]: 58, zoya: 42 },
      goodbye: tr('Ro mat yaar 😅. Har koi apni ladta hai. Tu jeet — mere liye bhi.', 'Hey, don\'t cry 😅. Everyone fights their own fight in here. Win this — for me too.'),
      aftermath: tr(`${allyName} ${male ? 'chala gaya' : 'chali gayi'}. Ghar mein ek ${allyName}-shaped khaali jagah.`, `${allyName} is gone. The house has a ${allyName}-shaped hole in it now.`),
    }
  }

  if (id === 'EV-D7') {
    const loyal = loyaltyOf(game) >= 2
    const evicted: CharId = loyal ? 'zoya' : ally
    const allyName = male ? 'Kabir' : 'Ananya'
    return {
      id, day: 7,
      intro: tr('Doosri eviction. Is baar daav personal hai — tumhaara apna banda line pe hai.', 'The second eviction. This time it\'s personal — your own person is on the line.'),
      nominees: ['zoya', ally],
      evicted,
      houseVotes: loyal
        ? [
            { voter: 'ria',   target: 'zoya', line: tr('Zoya ka game over. Maine bahut dekh liya. 👀', 'Zoya\'s game is over. I\'ve seen more than enough. 👀') },
            { voter: ally === 'kabir' ? 'ananya' : 'kabir', target: 'zoya', line: tr('Tumne stand liya — main bhi le rahi/raha hoon. Zoya jaaye.', 'You took a stand — so I\'m taking one too. Zoya goes.') },
          ]
        : [
            { voter: 'ria',   target: ally, line: tr(`Tumhaara "banda" akela pad gaya. Koi publicly saath nahi tha.`, `Your "person" ended up standing alone. Nobody stood with them in public.`) },
            { voter: 'zoya',  target: ally, line: tr('Smile ke peeche maine ginti rakhi thi. Aaj kaam aayi. 💅', 'Behind the smile, I was keeping count. Tonight it paid off. 💅') },
          ],
      audience: loyal ? { zoya: 61, [ally]: 39 } : { [ally]: 55, zoya: 45 },
      goodbye: loyal
        ? tr('Sab ko smile dikhati rahi. Aaj sab ne asli chehra dekh liya. Bye babies. 💅', 'I kept smiling for all of you. Tonight you finally saw the real face. Bye babies. 💅')
        : tr(`Tu publicly saath ${male ? 'khada hota' : 'khadi hoti'} toh main aaj yahan na ${male ? 'hota' : 'hoti'}. Yaad rakhna. 😔`, 'If you had stood with me in public, I wouldn\'t be leaving tonight. Remember that. 😔'),
      aftermath: loyal
        ? tr('Zoya gayi. Ghar thoda halka, thoda khaali. Tumne apna banda bacha liya.', 'Zoya is gone. The house feels lighter — and a little emptier. You saved your person.')
        : tr(`${allyName} ${male ? 'chala gaya' : 'chali gayi'}. Loyalty sirf private mein thi — aur yahan woh kaafi nahi hoti.`, `${allyName} is gone. The loyalty only ever lived in private — and in this house, that\'s never enough.`),
    }
  }

  return null
}
