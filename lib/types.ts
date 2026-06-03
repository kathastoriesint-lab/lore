export type CharId = 'ria'|'kabir'|'meher'|'dev'|'ananya'|'zoya'|'rishi'|'adi'

export interface Character {
  id: CharId
  name: string
  handle: string
  cls: string
  init: string
  fame: number
  trust: number
  heat: number
  role: string
}

export interface Meters { fame: number; trust: number; heat: number }

export interface Choice {
  t: string
  s: string
  deltas: Meters
  caption: string
  reactions: Reaction[]
}

export interface Reaction {
  char: CharId | '__fan'
  name?: string
  text: string
}

export interface Situation {
  tag: string
  title: string
  body: string[]
  react: { char: CharId; text: string }
  /** Per-character react override — falls back to react if char not present */
  reactByChar?: Partial<Record<CharId, { char: CharId; text: string }>>
  q: string
  choices: [Choice, Choice]
  /** Per-character choices override — falls back to choices if char not present */
  choicesByChar?: Partial<Record<CharId, [Choice, Choice]>>
  /** Which characters see this situation. Undefined = all playable chars. */
  chars?: CharId[]
  /** Day number 1–5. Used for time-gating. */
  day: number
  /** One-line teaser shown on the locked Day N screen */
  dayTeaser?: string
  /** Post that appears in the feed after this situation is completed */
  feedReaction?: {
    A: { char: CharId; caption: string }
    B: { char: CharId; caption: string }
  }
}

export interface DMMessage {
  role: 'me' | 'char'
  text: string
}

export type Screen =
  | 'worlds'
  | 'world-intro'
  | 'feed'
  | 'narrator'
  | 'live'
  | 'dm-inbox'
  | 'dm-thread'
  | 'profile'
  | 'char-profile'
  | 'story-reader'
  | 'world-hub'

export interface GameState {
  char: CharId | null
  situation: number              // index into the filtered (per-char) situations list
  choices: ('A' | 'B')[]
  meters: Meters
  narrator_done: boolean
  /** Timestamps (ms since epoch) when each day unlocks. null = not yet set. */
  dayUnlockTime: Record<number, number>
}
