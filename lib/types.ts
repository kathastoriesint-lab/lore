export type CharId =
  // Creator House
  | 'ria'|'kabir'|'dev'|'ananya'|'zoya'|'meher'|'rishi'|'adi'
  // Indian Dressing Room
  | 'hardik'|'rohit'|'surya'|'bumrah'|'tilak'|'coach'|'friend'
  |'naman'|'robin'|'mahela'
  // Player sentinel — used in cricket so the player plays as themselves, not an NPC
  | 'player'

export type World = 'creator-house' | 'cricket'

export interface Character {
  id: CharId
  name: string
  handle: string
  cls: string
  init: string
  fame: number
  role: string
}

export interface Meters { fame: number; heat: number; image: number }

/** Hidden flags — tracked per world, stored in GameState.flags */
export interface GameFlags {
  // Cricket
  mentorTrust: number     // 0–5: earned from humble/coachable choices
  hypeRisk: number        // 0–5: earned from fame-seeking choices
  roleAcceptance: number  // 0–5: earned from role-first choices
  homeGrounding: number   // 0–5: earned from family/coach choices
  // Creator House
  allyLoyalty: number     // 0–3: how loyal player has been to ally
  rivalryScore: number    // 0–3: how escalated the rival relationship is
}

/** Match / innings memory for cricket — written by match situations */
export interface RunMemory {
  debutRuns?: number;   debutBalls?: number
  leagueRuns?: number;  leagueBalls?: number
  clutchRuns?: number;  clutchBalls?: number
  semiRuns?: number;    semiBalls?: number
  finalRuns?: number;   finalBalls?: number
  matchImpact?: 'low' | 'solid' | 'high' | 'matchwinner'
}

export interface Choice {
  t: string
  s: string
  deltas: Meters
  caption: string
  reactions: Reaction[]
  /** Flag deltas applied when this choice is made */
  flagDeltas?: Partial<GameFlags>
  /** Which run-memory slot this choice writes to (match situations only) */
  runWrite?: 'debut' | 'league' | 'clutch' | 'semi' | 'final'
}

export interface Reaction {
  char: CharId | '__fan'
  name?: string
  text: string
}

export interface Situation {
  id: string
  day: number
  slot: string
  tag: string
  title: string
  body: string[]
  react: { char: CharId; text: string }
  q: string
  choices: [Choice, Choice]
  feedReaction?: {
    A: { char: CharId; caption: string } | null
    B: { char: CharId; caption: string } | null
  }
  loyaltyChoice?: 'A' | 'B'
  condition?: (meters: Meters, flags: GameFlags) => boolean
}

export interface DMMessage {
  role: 'me' | 'char'
  text: string
}

export type Screen =
  | 'worlds'
  | 'world-intro'
  | 'cricket-intro'
  | 'feed'
  | 'narrator'
  | 'live'
  | 'dm-inbox'
  | 'dm-thread'
  | 'profile'
  | 'char-profile'
  | 'onboarding'

export interface GameState {
  playerName: string
  playerGender: 'male' | 'female'
  world: World
  /** NPC the player is playing as (Creator House), or 'player' sentinel (cricket) */
  char: CharId | null
  /** Index into situationQueue (replaces raw integer counter) */
  situation: number
  /** Ordered list of situation IDs for this playthrough.
   *  Conditionals are inserted at the right index — no index shift on previous items. */
  situationQueue: string[]
  choices: ('A' | 'B')[]
  meters: Meters
  flags: GameFlags
  runMemory: RunMemory
  narrator_done: boolean
  dayUnlockTime: Record<number, number>
  avatarUrl?: string
}
