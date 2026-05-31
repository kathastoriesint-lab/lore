export type CharId = 'reya'|'kabir'|'meher'|'dev'|'ananya'|'zoya'|'rishi'|'adi'

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
  q: string
  choices: [Choice, Choice]
}

export interface DMMessage {
  role: 'me' | 'char'
  text: string
}

export type Screen =
  | 'worlds'
  | 'feed'
  | 'narrator'
  | 'live'
  | 'dm-inbox'
  | 'dm-thread'

export interface GameState {
  char: CharId | null
  situation: number
  choices: ('A' | 'B')[]
  meters: Meters
  narrator_done: boolean
}
