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

// Per-world meters. Creator House tracks only fame (rendered as follower count);
// the cricket world (Indian Dressing Room) tracks Form/Fame/Trust. heat/image are
// gone. `.fame` is the common key, so union call sites that only read fame compile;
// cricket-only reads (.form) narrow via asCricket() in lib/game.ts.
export interface CHMeters { fame: number }
export interface CricketMeters { form: number; fame: number }
export type Meters = CHMeters | CricketMeters

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
  // Cricket v2 story markers (0/1; optional — absence = 0). Written by beats,
  // feed comments, and DM missions; read back by later beats' variants/lines.
  pressCocky?: number     // cocky headline at the first presser
  likedOutrage?: number   // liked the fan-outrage posts while benched
  clapback?: number       // clapped back at the pile-on
  ownedIt?: number        // owned the leak in front of the room
  deflected?: number      // PR-deflected the leak
  lifelineOwed?: number   // captain staked his name on you
  tradeNoise?: number     // agent floated a trade rumor
  briefedPress?: number   // planted your numbers with a journalist
  ownMethod?: number      // defended your own method in the slump
  benchImpact?: number    // won the eliminator from the bench (the plan)
  recalled?: number       // forced the W3 recall from the bench (form grind)
  talkedRole?: number     // DM mission: messaged Hardik about the role
  facedRohit?: number     // DM mission: faced Rohit before the 9am meeting
  clearedNaman?: number   // DM mission: straight talk with Naman
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
  /** Meter deltas — CH authors only { fame }; cricket authors { form?, fame?, trust? }. */
  deltas: Partial<{ form: number; fame: number; trust: number }>
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
  /** DM mission: the story sends YOU to open a senior's thread and talk to them
   *  in a particular manner (the brief). Completing the exchange sets flags[flag];
   *  HOW it went is the trust delta the LLM scores. */
  dmMission?: { char: CharId; brief: string; hint?: string; flag: keyof GameFlags }
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
  /** 'form'/'fame' read the meters; 'charTrust' reads dmTrust[charId] — the DM
   *  payoff gates (e.g. Hardik's impact-sub call). Results are PERSISTED in
   *  GameState.gateResults at choice time, so any input is replay-safe. */
  metric: 'form' | 'fame' | 'charTrust'
  /** Required when metric === 'charTrust'. */
  charId?: string
  threshold: number
  /** Senior-trust assists lower the bar — DM engagement literally saving your
   *  knock (e.g. Bumrah ≥ 36 → threshold −4, pass copy quotes his advice). */
  assists?: { charId: string; min: number; thresholdDelta: number }[]
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
  /** Authored comment options on this post (cricket comment hooks) — the player's
   *  reply moves bonds the story reads back. Rendered by FeedScreen. */
  comments?: import('./data').PostCommentOption[]
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
  /** Conditional line — rendered only when the condition matches (trust-aware
   *  tone swaps). Display-only: `when` lines must never carry outcomes. */
  when?: VariantCond
}

/** Weekly squad verdict — how the selection ceremony resolved. */
export type SelectionVerdict = 'started' | 'benched' | 'lifeline'

// ── Beat variants — the story reacting to your state ─────────────────────────
/** Condition for a variant or a conditional reader line. `benched`/`started`/
 *  `lifeline` read the persisted selection verdict that opened the beat's week;
 *  `charTrust` reads live per-senior trust; `flag` reads GameFlags. */
export interface VariantCond {
  benched?: boolean
  /** True for verdict 'started' OR 'lifeline' (you're playing). */
  started?: boolean
  /** Exactly the captain's-lifeline verdict. */
  lifeline?: boolean
  charTrust?: { charId: string; gte?: number; lt?: number }
  flag?: { key: keyof GameFlags; gte: number }
  /** Reads a PERSISTED outcomeGate result of an earlier beat (e.g. the media
   *  storm keying on whether your debut knock passed). Replay-safe. */
  gate?: { sitId: string; is: 'pass' | 'fail' }
}

/** An authored alternate version of a beat. The FIRST matching variant overlays
 *  its fields onto the base situation. Replay safety: the variant index active
 *  at choice time is persisted (GameState.variantSeen), so any variant may
 *  change anything — the feed replay re-applies the same variant by index. */
export interface SituationVariant {
  when: VariantCond
  title?: string
  tag?: string
  q?: string
  reader?: ReaderBlock[]
  choices?: [Choice, Choice]
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

/** The world's background reaction on the feed after a choice. Either a
 *  character's post (char) or a fan/meme account's (account). imageUrl routes
 *  it through the full authored-post rendering (photo card). */
export interface FeedReactionSpec {
  char?: CharId
  account?: { name: string; handle: string; avatarText?: string }
  caption: string
  imageUrl?: string
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
  /** State-reactive alternate versions of this beat (selection verdicts, trust
   *  bands, flags). Resolved by resolveSituationVariant (lib/variants.ts). */
  variants?: SituationVariant[]
  react?: { char: CharId; text: string } | null
  q: string
  choices: [Choice, Choice]
  feedReaction?: {
    A: FeedReactionSpec | null
    B: FeedReactionSpec | null
  }
  loyaltyChoice?: 'A' | 'B'
}

export interface DMMessage {
  role: 'me' | 'char'
  text: string
  /** Optional post quoted in the thread — e.g. the post you commented on. */
  embed?: { caption: string; imageUrl?: string; handle?: string }
  /** Narrative timing (WhatsApp-style thread) — all optional, see lib/dm-time.ts.
      day = story day, phase = MORNING/AFTERNOON/EVENING/NIGHT, t = in-story
      minute-of-day for the per-message clock, note = event line for the divider. */
  day?: number
  phase?: string
  t?: number
  note?: string
}

export type Screen =
  | 'worlds'
  | 'world-intro'
  | 'cricket-intro'
  | 'cricket-carousel'
  | 'feed'
  | 'narrator'
  | 'live'
  | 'selection'
  | 'eviction'
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

  // ── Season progression (cricket world) ────────────────────────────────────
  /** Current Match Week (1-3). Absent on pre-season saves → derived on load. */
  week?: number
  /** Per-selection-window activity usage (the optional grind before each squad
   *  announcement). Reset when a selection window opens. */
  interlude?: {
    captionPosted: boolean
    repliesUsed: number
    chatTrustEarned: Record<string, number>
    /** Distinct characters chatted with this window (earn-a-skip slate). */
    charsChatted: string[]
  }
  /** Selection ceremony id to play before the next beat (free-flow squad gate). */
  pendingSelection?: string | null
  /** Match calendar: epoch ms when the next match-week's story unlocks (7am next
   *  morning). Null/past = open. Earn-a-skip clears it early. */
  weekUnlockAt?: number | null
  /** Persisted squad verdicts by ceremony id — replay-safe ground truth for variants. */
  selections?: Record<string, SelectionVerdict>
  /** Weeks whose verdict was 'benched' (convenience for variants + endings). */
  benchedWeeks?: number[]
  /** Persisted outcomeGate results by situation id — feed replay reads these
   *  instead of recomputing (gates may read dmTrust, which isn't replayable). */
  gateResults?: Record<string, 'pass' | 'fail'>
  /** Variant index (into sit.variants) active when the player chose, by situation
   *  id; absent/-1 = base beat. The feed replay re-applies the same variant. */
  variantSeen?: Record<string, number>
  /** Active DM mission: the story sent YOU to open this conversation. */
  activeMission?: { char: CharId; brief: string; hint?: string; flag: keyof GameFlags } | null

  // ── Creator House evictions ───────────────────────────────────────────────
  /** Eviction id to play before the next situation (set when its trigger completes). */
  pendingEviction?: string | null
  /** Eviction ceremonies already shown (so they fire once). */
  evictionsSeen?: string[]
  /** Housemates evicted so far — gone from the house. */
  evicted?: string[]
}
