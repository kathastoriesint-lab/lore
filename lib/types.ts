export type CharId =
  // Creator House
  | 'ria'|'kabir'|'dev'|'ananya'|'zoya'|'meher'|'rishi'|'adi'
  // Indian Dressing Room
  | 'hardik'|'rohit'|'surya'|'bumrah'|'tilak'|'coach'|'friend'
  |'naman'|'robin'|'mahela'

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
  condition?: (meters: Meters) => boolean
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
  char: CharId | null
  situation: number
  choices: ('A' | 'B')[]
  meters: Meters
  narrator_done: boolean
  dayUnlockTime: Record<number, number>
  avatarUrl?: string   // player's AI-generated avatar (or raw photo while generating)
}
