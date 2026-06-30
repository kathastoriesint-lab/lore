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
  /** Legacy player-caption field. Creator House still uses this as fallback. */
  caption?: string
  /** Legacy post/comment reactions. Creator House still uses this as fallback. */
  reactions?: Reaction[]
  /**
   * Explicit post surface shown after a choice.
   * - undefined: use legacy fallback for Creator House, no auto-post for cricket
   * - null: no post/card for this choice
   * - object: render this authored post/card
   */
  post?: ChoicePost | ChoicePost[] | null
  /** Conditional outcome resolved from the meters before this choice applies. */
  outcomeGate?: ChoiceOutcomeGate
  /**
   * Explicit DM caused by this choice.
   * - undefined: legacy auto-DM for Creator House only
   * - null: no DM
   * - object: inject this authored DM
   */
  dm?: ChoiceDM | ChoiceDM[] | null
  /** Flag deltas applied when this choice is made */
  flagDeltas?: Partial<GameFlags>
  /** Optional per-character relationship deltas. Cricket can also infer these from Team Trust and involved characters. */
  relationshipDeltas?: Partial<Record<CharId, number>>
  /** Which run-memory slot this choice writes to (match situations only) */
  runWrite?: 'debut' | 'league' | 'clutch' | 'semi' | 'final'
  /** Post-writer "why" framing — the moment/stakes shown above the composer.
   *  Supports a {followers} token. postTag is the eyebrow suffix (e.g. "TUMHARA PEHLA MOVE"). */
  postWhy?: string
  postTag?: string
}

export interface ChoiceOutcomeGate {
  metric: keyof Meters
  threshold: number
  pass: ChoiceOutcome
  fail: ChoiceOutcome
}

export interface ChoiceOutcome {
  title?: string
  note: string
  post?: ChoicePost | ChoicePost[] | null
  dm?: ChoiceDM | ChoiceDM[] | null
}

export interface ChoicePost {
  source: 'player' | 'character' | 'account'
  /** Required when source is character */
  char?: CharId
  /** Account/player display name for account posts */
  name?: string
  /** Account/player handle without @ */
  handle?: string
  /** Avatar initial for account posts */
  avatarText?: string
  /** Small context label, e.g. "MI Paltan · just now" */
  label?: string
  /** Future-proof rendering hook: post, story, scorecard, news, live, etc. */
  surface?: 'post' | 'story' | 'scorecard' | 'news' | 'live' | 'dm' | 'note'
  /** Where this authored post appears. Default: both live preview and feed. */
  display?: 'live-and-feed' | 'live-only' | 'feed-only'
  /** Optional real image asset served from /public. */
  imageUrl?: string
  caption: string
  reactions?: Reaction[]
}

export interface ChoiceDM {
  char: CharId
  text: string
}

/**
 * A streamed story element for the chat-story Live format (Creator House Day 1+).
 * When a Situation has `reader`, LiveScreen renders these bubbles one tap at a time
 * instead of the prose `body[]`. Additive: situations without `reader` render as prose.
 */
export interface ReaderBlock {
  t: 'nar' | 'img' | 'cue'
  /** Narrator line or character cue text (supports {name}/{crush}/… tokens). */
  text?: string
  /** Emphasized narrator line (the stakes beat before the choice). */
  big?: boolean
  /** Image source (scene art or character portrait), served from /public. */
  src?: string
  /** Image height in px. */
  h?: number
  /** Image background-position, e.g. "center top". */
  pos?: string
  /** Cue speaker display name. */
  who?: string
  /** Cue speaker avatar src. */
  avatar?: string
}

export interface Reaction {
  char: CharId | '__fan'
  name?: string
  text: string
}

/**
 * A player post whose caption + reactions were generated live (gpt-4o) when the
 * player composed and hit "Post". Stored per choice (key: `${sit.id}-${letter}`)
 * so the feed renders the same AI text on every replay/reload instead of the
 * authored fallback. The feed streams `reactions` in one at a time on first reveal.
 */
export interface AiPost {
  caption: string
  reactions: Reaction[]
  /** Image shown on the feed for this post (carried from the composer). */
  imageUrl?: string
  /** Final like count to climb toward during the feed reveal. */
  likes?: number
  /** Follower gain to surface as the receipt. */
  followerDelta?: number
  /** DMs to fire as notifications during the reveal. */
  dms?: ChoiceDM[]
  vibe?: string
  /** Feed has finished streaming this post (so it renders static afterwards). */
  revealed?: boolean
}

export interface Situation {
  id: string
  day: number
  slot: string
  tag: string
  title: string
  body: string[]
  /** Optional chat-story stream. When present, LiveScreen renders these bubbles
   *  one tap at a time instead of the prose `body[]`. */
  reader?: ReaderBlock[]
  react?: { char: CharId; text: string } | null
  q: string
  choices: [Choice, Choice]
  feedReaction?: {
    A: { char: CharId; caption: string } | null
    B: { char: CharId; caption: string } | null
  }
  loyaltyChoice?: 'A' | 'B'
}

export interface DMMessage {
  role: 'me' | 'char'
  text: string
  /** Optional post quoted in the thread — e.g. the post you commented on. */
  embed?: { caption: string; imageUrl?: string; handle?: string }
}

export type Screen =
  | 'worlds'
  | 'world-intro'
  | 'cricket-intro'
  | 'cricket-carousel'
  | 'feed'
  | 'narrator'
  | 'live'
  | 'lock'
  | 'eviction'
  | 'nets'
  | 'dm-inbox'
  | 'dm-thread'
  | 'profile'
  | 'profile-global'
  | 'char-profile'
  | 'onboarding'
  | 'login'

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
  /** Per-character relationship trust (cricket world). Persisted so login restores it. */
  dmTrust?: Record<string, number>
  /** Per-character follower counts shown on profiles. Persisted across sessions. */
  charFame?: Record<string, number>
  /** Post IDs the player has liked — prevents re-liking after reload. */
  likedPosts?: string[]
  /** Live-generated player posts (caption + reactions), keyed by `${sit.id}-${letter}`. */
  aiPosts?: Record<string, AiPost>

  // ── Season 1 progression (cricket world) ──────────────────────────────────
  /** Current Match Week (1-7). Absent on pre-season saves → derived on load. */
  week?: number
  /** Lock clock expiry (epoch ms). Non-null = interlude active, Live is locked. */
  lockExpiresAt?: number | null
  /** Dev clock override in ms (persisted from ?clock= at lock start). */
  clockOverrideMs?: number | null
  /** Per-interlude activity usage. Reset when a new week opens. */
  interlude?: {
    netsUsed: number
    trustMomentUsed: boolean
    captionPosted: boolean
    repliesUsed: number
    chatTrustEarned: Record<string, number>
  }
  /** Weeks whose fail-variant beat already played (for "recalled to the XI" flavor). */
  failedWeeks?: number[]

  // ── Creator House evictions ───────────────────────────────────────────────
  /** Eviction id to play before the next situation (set when its trigger completes). */
  pendingEviction?: string | null
  /** Eviction ceremonies already shown (so they fire once). */
  evictionsSeen?: string[]
  /** Housemates evicted so far — gone from the house. */
  evicted?: string[]
}
