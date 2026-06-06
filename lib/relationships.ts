/**
 * Relationship / Bond system
 *
 * Bonds are earned from real play. Every time a character reacts to your
 * choice in a situation, that becomes a "moment" with them. Their actual
 * words (the reaction text) determine the bond delta — supportive words
 * raise it, cold/suspicious words lower it. DM exchanges (LLM-scored,
 * stored in dmTrust) adjust it further.
 *
 * Nothing here is hand-authored per-situation. It all derives from the
 * existing situation content, so it stays in sync automatically.
 */

import { getVisibleSituations } from './data'
import { CRICKET_SITUATIONS } from './cricket-data'
import { resolveTokens, applyDeltas } from './game'

// ── Relationship metadata ──────────────────────────────────────────────────────

export interface Relationship {
  label: string          // badge: "YOUR ARCHRIVAL"
  labelColor: string     // badge color
  tagline: string        // short line under name in the list
  about: string          // longer bio on the character profile
  base: number           // starting bond (0-100)
  spectrumLeft: string   // left end of bond bar
  spectrumRight: string  // right end of bond bar
}

// Creator House — kabir/ananya labels resolved by gender (crush vs ally) at runtime
const CREATOR_REL: Record<string, Relationship> = {
  ria: {
    label: 'YOUR ARCHRIVAL', labelColor: '#FF5C3A',
    tagline: 'Luxury lifestyle · The alpha',
    about: 'Untouchable. Everything curated — the light, the angles, the silences. She was the face of last season and she knows you went viral the week she went quiet. She hasn\'t forgotten the timing.',
    base: 22, spectrumLeft: 'Rival', spectrumRight: 'Respect',
  },
  kabir: {
    label: 'YOUR ALLY', labelColor: '#3DD6C8',
    tagline: 'Comedy · Chaos merchant · 890K',
    about: 'Everyone\'s friend, nobody\'s ally — except maybe yours. He engineers the drama and films it. The question is never whether he likes you. It\'s whether you\'re useful to his story.',
    base: 60, spectrumLeft: 'Distant', spectrumRight: 'Ride or Die',
  },
  ananya: {
    label: 'YOUR CRUSH', labelColor: '#3DD6C8',
    tagline: 'Dance creator · 19 · Genuine in a house of masks',
    about: 'Went viral overnight and never slept since. The only person in the house whose emotions are exactly what they appear to be. Desperate to be seen as more than the dance girl.',
    base: 50, spectrumLeft: 'Strangers', spectrumRight: 'Something Real',
  },
  dev: {
    label: 'THE WILD CARD', labelColor: '#FFB020',
    tagline: 'Fitness · Transactional · 340K',
    about: 'Loyalty for sale to the highest bidder. Reliable as long as your numbers serve his. Behind the grindset is a man in debt and afraid of being seen as replaceable.',
    base: 35, spectrumLeft: 'Cold', spectrumRight: 'Trusted',
  },
  zoya: {
    label: 'THE SCHEMER', labelColor: '#FFB020',
    tagline: 'Beauty · Sweet on cam, sharp off it',
    about: 'On camera: "Hii babies." Off camera: she says exactly what hurts most, at exactly the right time. She feeds information to the gossip accounts. She\'s watching you decide what you are.',
    base: 38, spectrumLeft: 'Wary', spectrumRight: 'Trusted',
  },
  meher: {
    label: 'THE CONFIDANT', labelColor: '#3DD6C8',
    tagline: 'Lifestyle · The house\'s emotional anchor',
    about: 'Warm, wise, everyone trusts her. The most strategically intelligent person in the room — she just never gets her hands dirty. Scripts her "spontaneous" emotional videos.',
    base: 50, spectrumLeft: 'Distant', spectrumRight: 'Inner Circle',
  },
  rishi: {
    label: 'THE OBSERVER', labelColor: '#FFB020',
    tagline: 'Vlogs · Records everything',
    about: 'Loyal to no one — not malicious, just sees everything as content. Feeds footage to Kabir for reach. Your moments are interesting footage to him. For the right arrangement, he might share.',
    base: 45, spectrumLeft: 'Cold', spectrumRight: 'Trusted',
  },
  adi: {
    label: 'THE NEW ONE', labelColor: '#FFB020',
    tagline: 'Content · 22 · Still figuring it out',
    about: 'Genuinely new, no enemies yet. Desperately wants to belong. Good instincts, no experience with this level of social game.',
    base: 50, spectrumLeft: 'Strangers', spectrumRight: 'Allies',
  },
}

// Indian Dressing Room — no gender swap
const CRICKET_REL: Record<string, Relationship> = {
  hardik: {
    label: 'THE CAPTAIN', labelColor: '#3DD6C8',
    tagline: 'Captain · Decides if you play',
    about: 'He carries the dressing room. He decides who plays, who sits, who gets a real chance. His approval is earned two ways only: role clarity and execution under pressure. He is watching how you handle the noise.',
    base: 35, spectrumLeft: 'Unproven', spectrumRight: 'Trusted',
  },
  rohit: {
    label: 'THE MENTOR', labelColor: '#3DD6C8',
    tagline: 'Senior · One line changes everything',
    about: 'Won everything there is to win. Speaks rarely — when he does, people listen. He remembers being your age and not knowing if he belonged. He won\'t protect you from difficulty, but he won\'t let you feel alone in it.',
    base: 40, spectrumLeft: 'Watching', spectrumRight: 'Backed',
  },
  surya: {
    label: 'THE GUIDE', labelColor: '#3DD6C8',
    tagline: 'Senior · Teaches the impossible',
    about: 'Plays cricket like jazz. Trained harder than anyone knows to make it look casual. Genuinely warm — not strategically, just constitutionally. He knows lonely young players make worse decisions, so he stays close.',
    base: 50, spectrumLeft: 'New Kid', spectrumRight: 'Protege',
  },
  bumrah: {
    label: 'THE STANDARD', labelColor: '#FFB020',
    tagline: 'Spearhead · The hardest mirror',
    about: 'He is the standard. Not because he performs for others, but because he holds himself to a level most don\'t understand. Feedback once, clearly, technically. Listen and he gives you more. Don\'t and he stops.',
    base: 35, spectrumLeft: 'Untested', spectrumRight: 'Respected',
  },
  tilak: {
    label: 'THE BENCHMARK', labelColor: '#3DD6C8',
    tagline: 'Young gun · The bar you\'re measured against',
    about: 'Two years older and already trusted. Not because he was louder — because he understood his role before anyone told him. Not threatened by you. Watching if you\'re worth the energy.',
    base: 55, spectrumLeft: 'Rivals', spectrumRight: 'Brothers',
  },
  coach: {
    label: 'YOUR ANCHOR', labelColor: '#3DD6C8',
    tagline: 'Coach Sir · Knows you since the cement pitch',
    about: 'Knew you when you batted on a cement pitch with a tape-ball. Sent you to the academy. The only person in your new world unimpressed by Mumbai Indians. Proud, but worried you\'ll forget how to bat on a cement pitch.',
    base: 72, spectrumLeft: 'Drifting', spectrumRight: 'Grounded',
  },
  friend: {
    label: 'YOUR PERSON', labelColor: '#3DD6C8',
    tagline: 'Maddy · The only DM with no agenda',
    about: 'Friends since school — before the auction, before the viral clip, before the jersey. Aggressively normal. Quietly terrified he\'s losing you. The only person who wants nothing from you except for you to reply.',
    base: 85, spectrumLeft: 'Fading', spectrumRight: 'Day One',
  },
  mahela: {
    label: 'THE STRATEGIST', labelColor: '#FFB020',
    tagline: 'Head coach · Sees the whole board',
    about: 'Selection logic and role clarity. He maps your weaknesses into plans before you\'ve admitted them. Young players who pretend they have no gaps lose his time. The ones who name them earn it.',
    base: 40, spectrumLeft: 'Unread', spectrumRight: 'Project',
  },
}

const CRICKET_IDS = new Set(['hardik','rohit','surya','bumrah','tilak','coach','friend','mahela','naman','robin'])

/** Resolve a character's relationship metadata, gender-aware for Creator House crush/ally. */
export function relationshipFor(charId: string, gender: 'male' | 'female'): Relationship | null {
  if (CRICKET_IDS.has(charId)) return CRICKET_REL[charId] ?? null

  // Creator House: crush = opposite gender, ally = same gender. kabir/ananya swap.
  if (charId === 'kabir' || charId === 'ananya') {
    const rel = { ...CREATOR_REL[charId]! }
    const isCrush = gender === 'male' ? charId === 'ananya' : charId === 'kabir'
    if (isCrush) { rel.label = 'YOUR CRUSH'; rel.labelColor = '#3DD6C8' }
    else         { rel.label = 'YOUR ALLY';  rel.labelColor = '#3DD6C8' }
    return rel
  }
  return CREATOR_REL[charId] ?? null
}

// ── Bond computation from play ──────────────────────────────────────────────────

// Words/emoji that signal warmth vs coldness in reaction text.
const POS = ['respect','proud','love','shukriya','samjha','samjhi','better','achha','sahi','welcome','best','genuine','good','khush','🔥','🤝','💙','🥺','🫶','😭','💪','🏏']
const NEG = ['noted','interesting','hmm','careful','regret','filing','suspicious','plotting','dangerous','cowardice','naive','overconfident','wrong','ouch','desperate','😬','🙄','😔','💅','👀']

export function sentimentDelta(text: string): number {
  const t = text.toLowerCase()
  const pos = POS.some(w => t.includes(w))
  const neg = NEG.some(w => t.includes(w))
  if (pos && !neg) return 4
  if (neg && !pos) return -5
  if (pos && neg)  return 1
  return 1 // any interaction is a small positive — you're building something
}

export interface BondMoment {
  sitId: string
  day: number
  tag: string
  title: string
  text: string      // the character's actual reaction line (resolved)
  delta: number     // bond change from this moment
}

export interface BondResult {
  bond: number          // 0-100
  moments: BondMoment[] // newest first
  latestPost?: string   // their most recent feed caption involving you (resolved)
}

/**
 * Walk the player's choices and compute a character's bond + the moments
 * that built it. Pure + deterministic.
 */
export function computeBond(
  charId: string,
  world: 'creator-house' | 'cricket',
  choices: ('A' | 'B')[],
  playerName: string,
  gender: 'male' | 'female',
  dmTrust?: Record<string, number>,
): BondResult {
  const rel = relationshipFor(charId, gender)
  const base = rel?.base ?? 50
  const r = (text: string) => resolveTokens(text, playerName, gender).replace(/\{friend\}/g, 'Maddy')

  const moments: BondMoment[] = []
  let latestPost: string | undefined

  if (world === 'cricket') {
    for (let i = 0; i < choices.length; i++) {
      const sit = CRICKET_SITUATIONS[i]
      if (!sit) continue
      const letter = choices[i]
      const ch = sit.choices[letter === 'A' ? 0 : 1]
      collectMoment(charId, sit, ch, letter, r, moments)
      const fr = sit.feedReaction?.[letter]
      if (fr && fr.char === charId) latestPost = r(fr.caption)
    }
  } else {
    let meters = { fame: 20, heat: 50, image: 30 }
    for (let i = 0; i < choices.length; i++) {
      const letter = choices[i]
      const sits = getVisibleSituations(meters, choices.slice(0, i) as ('A'|'B')[])
      const sit = sits[i]
      if (!sit) continue
      const ch = sit.choices[letter === 'A' ? 0 : 1]
      collectMoment(charId, sit, ch, letter, r, moments)
      const fr = sit.feedReaction?.[letter]
      if (fr && fr.char === charId) latestPost = r(fr.caption)
      if (ch) meters = applyDeltas(meters, ch.deltas)
    }
  }

  // Sum deltas, fold in any live DM trust adjustment.
  let bond = base + moments.reduce((s, m) => s + m.delta, 0)
  if (dmTrust && dmTrust[charId] != null) {
    bond += (dmTrust[charId] - base) // DM exchanges nudge the bond from its base
  }
  bond = Math.max(0, Math.min(100, Math.round(bond)))

  moments.reverse() // newest first
  return { bond, moments, latestPost }
}

// Helper: if charId appears in this chosen choice's reactions, record a moment.
function collectMoment(
  charId: string,
  sit: import('./types').Situation,
  ch: import('./types').Choice | undefined,
  letter: 'A' | 'B',
  r: (t: string) => string,
  out: BondMoment[],
) {
  if (!ch) return
  // Their reaction line on your post (their own words)
  const reaction = ch.reactions?.find(rx => rx.char === charId)
  // Or they posted publicly in response (feedReaction)
  const fr = sit.feedReaction?.[letter]
  const frMine = fr && fr.char === charId ? fr : null

  if (!reaction && !frMine) return

  const text = reaction ? r(reaction.text) : r(frMine!.caption)
  out.push({
    sitId: sit.id,
    day: sit.day,
    tag: sit.tag,
    title: sit.title,
    text,
    delta: sentimentDelta(text),
  })
}

/** Characters to show in THE HOUSE list for a world (excludes player + fan accounts). */
export function houseCast(world: 'creator-house' | 'cricket'): string[] {
  return world === 'cricket'
    ? ['hardik', 'rohit', 'surya', 'bumrah', 'tilak', 'coach', 'friend']
    : ['ria', 'kabir', 'ananya', 'dev', 'zoya']
}

/** Position word for a bond value, used as the current label on the spectrum. */
export function bondWord(bond: number, rel: Relationship | null): string {
  if (!rel) return ''
  if (bond <= 15) return rel.spectrumLeft.toUpperCase()
  if (bond >= 82) return rel.spectrumRight.toUpperCase()
  if (bond < 35) return 'WARY'
  if (bond < 55) return 'WARMING'
  if (bond < 70) return 'CLOSE'
  return 'TIGHT'
}

/** Color for a bond value — uses meter trio only (DESIGN.md). */
export function bondColor(bond: number): string {
  if (bond >= 65) return '#3DD6C8'   // --trust
  if (bond >= 40) return '#FFB020'   // --fame
  return 'rgba(255,255,255,0.09)'    // faded — no new colour
}
