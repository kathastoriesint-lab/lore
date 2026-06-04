# Creator House v2 — Technical Architecture

**Status:** Draft for review
**Last updated:** 2026-06-03
**Companion to:** `creator-house-world-bible-v2.md`
**Target:** Saturday user-testing launch

---

## The one decision everything hangs on: the feed is *derived*, not *stored*

The Living Feed (your choices become posts that persist and accumulate replies) looks
like it needs a new database — a posts table, a comments table, write-on-every-choice,
real-time sync. It does not.

**The feed is a pure function of state you already have:**

```
feed = buildFeed(game.choices, playerName, playerGender, situations)
```

Every authored post already exists inside the situation data — each choice carries a
`caption` (your post) and `reactions` (the comments on it). The feed is just a
**projection** of the choices you've made so far. Nothing new to store. It persists for
free because `game.choices` already persists. It can't desync because there's no second
source of truth. It replays perfectly because it's deterministic.

This is the Layer-3 call: don't build an event store when the event store already exists
(`game.choices` IS the event log).

```
   STORED FEED (rejected)              DERIVED FEED (chosen)
   ─────────────────────              ──────────────────────
   choice ─▶ write post row           choice ─▶ (already in game.choices)
          ─▶ write 3 comment rows
          ─▶ feed reads table         feed = buildFeed(game.choices, ...)
   • new tables, new sync             • zero new storage
   • write failure = lost post        • can't lose a post
   • dedupe / ordering bugs           • deterministic, replayable
   • needed for AI replies (later)    • authored content only (enough for Sat)
```

When we add AI-generated replies or real-time fan trickle later (v3), *those* ephemeral
bits get their own lightweight store. The authored spine stays derived.

---

## Data model

### Situation (simplified + extended)

The old model carried `choicesByChar` / `reactByChar` for 3 playable characters. The
fixed-"you" model kills that — every situation is single-POV. Net simplification.

```ts
interface Situation {
  id: string                 // stable, e.g. "d1-morning" — used for feed post ids + audio keys
  day: number                // 1–10, drives day-gating
  slot: string               // "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT" | "MIDNIGHT"
  tag: string                // "⚡ DAY 1 · MORNING"
  title: string
  body: string[]             // narrator-lens prose, second person, audio-ready
  reactor: { char: CharId; text: string }   // NPC line before the choice
  question: string
  choices: [Choice, Choice]

  // NEW — future-ready, all optional, empty for Saturday
  media?: MediaRef           // hero image/video for this situation
  audioUrl?: string          // narration VO for body[]

  // NEW — pivot mechanic
  loyaltyChoice?: 'A' | 'B'  // if set, picking this option grants +1 allyLoyalty

  // NEW — conditional appearance
  condition?: (s: GameState) => boolean   // situation only shows if true (e.g. Fame < 25)
}

interface Choice {
  t: string                  // choice title
  s: string                  // one-line framing
  deltas: Meters             // { fame, heat, image }
  caption: string            // → becomes YOUR feed post
  reactions: Reaction[]      // → become the comments on your post (2 NPC + 1 fan)
  feedReaction?: {           // → an NPC's OWN post that drops in response (the house reacts around you)
    char: CharId
    caption: string
  }
}

interface Reaction {
  char: CharId | '__fan'
  name?: string              // fan handle when char === '__fan'
  text: string
}

interface MediaRef {
  type: 'image' | 'video'
  url: string
  poster?: string            // video thumbnail
}
```

Note: `feedReaction` moves from the situation level onto the **choice** level — choice A
and choice B produce different NPC posts. (Current code already keys it by choice; this
just makes it structurally correct.)

### Meters (renamed)

```ts
interface Meters { fame: number; heat: number; image: number }
// migration: old trust → heat, old heat → image. fame unchanged.
```

### GameState (what persists)

```ts
interface GameState {
  playerName: string         // NEW — collected at onboarding
  playerGender: 'male'|'female'  // NEW — drives crush/ally swap + pronouns
  situation: number          // index into the ordered, condition-filtered situation list
  choices: ('A'|'B')[]       // the event log — the feed derives from this
  meters: Meters
  dayUnlockTime: Record<number, number>   // day-gate timestamps
  // everything else DERIVES — see below
}
```

### What derives (no storage needed)

| Derived value | Computed from |
|---|---|
| The entire feed | `choices` + `playerName/Gender` + situations |
| `allyLoyalty` (0–3) | walk `choices`, count picks where `situation.loyaltyChoice` matched |
| Who's evicted, and when | `situation` progress + `allyLoyalty` (deterministic, see pivot) |
| Day 7 pivot outcome | `allyLoyalty >= 2 ? evict Zoya : evict Kabir` |
| The ending | `meters` run through the resolution order |
| Follower counts | `f(meters.fame)` |

Two new Supabase columns: `player_name text`, `player_gender text`. That's the whole
schema delta. Everything else rides on the existing `game_state` row.

---

## The feed builder (the heart of it)

```ts
// Pure function. Runs at render. No side effects, no storage.
function buildFeed(game: GameState, situations: Situation[]): FeedPost[] {
  const posts: FeedPost[] = []

  for (let i = 0; i < game.choices.length; i++) {
    const sit = situations[i]
    const choice = game.choices[i]
    const ch = sit.choices[choice === 'A' ? 0 : 1]

    // 1. YOUR post — your caption + the reactions as threaded comments
    posts.push({
      id: `${sit.id}-you`,
      kind: 'player',
      author: '__you',
      caption: resolveTokens(ch.caption, game),
      comments: ch.reactions.map(r => ({ ...r, text: resolveTokens(r.text, game) })),
      seq: i * 2,
    })

    // 2. The house reacting around you — an NPC's own post (if authored)
    if (ch.feedReaction) {
      posts.push({
        id: `${sit.id}-npc`,
        kind: 'npc',
        author: ch.feedReaction.char,
        caption: resolveTokens(ch.feedReaction.caption, game),
        comments: [],
        seq: i * 2 + 1,
      })
    }
  }

  posts.reverse()                          // newest first
  return [...posts, ...SEED_POSTS]         // pre-house world at the bottom
}
```

The feed is reverse-chronological: your latest post on top, your history below it, the
seed posts (the world before you arrived) at the very bottom. Over 32 situations it grows
from 4 seed posts to ~35+. Scrolling it = reading your season back.

**Animation layer (ephemeral, not state):** the single newest post gets `isNew` and
animates its comments rolling in one by one — the same staggered reaction effect that
currently lives inside Live, now happening in the feed. Pure UI, no persistence.

---

## Token resolution (name + gender)

One pure function, applied to every piece of rendered text (body, reactor, captions,
reactions):

```ts
function resolveTokens(text: string, game: GameState): string {
  const crush = game.playerGender === 'male' ? 'Ananya' : 'Kabir'
  const ally  = game.playerGender === 'male' ? 'Kabir'  : 'Ananya'
  return text
    .replaceAll('{name}', game.playerName)
    .replaceAll('{crush}', crush)
    .replaceAll('{ally}', ally)
    .replaceAll('{he/she}', game.playerGender === 'male' ? 'woh' : 'woh')  // Hinglish: often neutral
    // English-context pronouns where needed:
    .replaceAll('{They}', game.playerGender === 'male' ? 'He' : 'She')
    .replaceAll('{them}', game.playerGender === 'male' ? 'him' : 'her')
}
```

Most situation text names fixed characters directly (Ria, Dev, Zoya). Only the ~4
crush/ally beats use tokens. Hinglish is gender-light by default (woh, unhe, tujhe), which
keeps most lines gender-neutral for free — the tokens carry the load only where identity
matters.

---

## Screens + navigation

### New screens

| Screen | Purpose | New? |
|---|---|---|
| `onboarding` | Name input + gender select (replaces character select) | NEW |
| `cinematic-intro` | Character reveals with relationship labels | NEW (upgrade of world-intro) |
| `feed` | The Living Feed — home base | exists, rework |
| `live` | Situation player — read scene, choose | exists, rework |
| `vote` | Eviction night — pick who to vote out | NEW |
| `eviction` | Reveal who leaves + farewell scene | NEW |
| `ending` | Final arc outcome from meters | NEW |
| `profile` | Your stats, posts, meters | exists, meter rename |

`dm-inbox` / `dm-thread` stay in the codebase but are unreachable for Saturday (DMs cut).

### The loop

```
worlds
   │ tap Creator House
   ▼
cinematic-intro ── reveals Ria/Kabir/Ananya/Dev/Zoya with relationship labels
   │
   ▼
onboarding ── "Tumhara naam?" + gender → sets playerName, playerGender, starting meters
   │
   ▼
feed ◀──────────────────────────────────────────────┐
   │  shows: [next Story Drop card] + your posts +   │
   │         house reactions + seed posts            │
   │ tap Story Drop                                  │
   ▼                                                 │
live ── narrator body (audio-ready) → reactor → 2 choices
   │ choose
   ▼
impact ── meters animate, "Posted to feed ✓"
   │ auto-return (your new post is now top of feed, reactions roll in)
   ├─────────────────────────────────────────────────┘
   │
   │  [day boundary reached?]
   ├── Day 3 / Day 7 / Day 9 eviction night:
   │      live (pre-vote scenes) → vote → eviction → feed
   │
   └── Day 10:
          live (finale) → ending
```

**After-choice navigation — the hybrid model:** the instant feedback (meters moving, first
reaction) shows briefly in Live, then we drop the player back to the feed where the post
now lives permanently with all reactions animating in. Live is the focused decision
moment; the feed is the persistent record and the launch point for the next story drop.
The player never has to hunt for "what happened" — it's the top of their feed.

---

## State: persist vs derive (the whole picture)

```
  PERSISTED (Supabase game_state row)        DERIVED (computed at render)
  ───────────────────────────────────        ────────────────────────────
  player_name          ← NEW column          feed (buildFeed)
  player_gender        ← NEW column          allyLoyalty (count tagged choices)
  situation (index)                          evicted set + pivot outcome
  choices[]            ← the event log        ending (resolveEnding)
  meters {fame,heat,image}                   follower counts
  day_unlock_time                            relationship labels (gender swap)
```

Supabase migration:
```sql
ALTER TABLE game_state ADD COLUMN player_name text;
ALTER TABLE game_state ADD COLUMN player_gender text;
```

(`day_unlock_time` column from the prior plan still needs adding if not already done.)

---

## Eviction + pivot logic (deterministic)

```ts
function allyLoyalty(game, situations): number {
  let n = 0
  for (let i = 0; i < game.choices.length; i++) {
    const lc = situations[i].loyaltyChoice
    if (lc && game.choices[i] === lc) n++
  }
  return n   // 0–3
}

function evictionFor(day: number, loyalty: number): CharId | null {
  if (day < 3) return null
  if (day >= 3 && day < 7) return 'dev'           // Day 3 always Dev
  const kabirSaved = loyalty >= 2
  if (day >= 7 && day < 9) return kabirSaved ? 'zoya' : 'kabir'   // Day 7 pivot
  if (day >= 9) return kabirSaved ? 'kabir' : 'zoya'             // Day 9 the survivor
  return null
}
```

Vote screen: player taps a character. We apply the scripted eviction regardless, but if
`tappedChar === scriptedEvictee`, apply `heat += 3` ("you read the room"). The vote feels
real; the outcome is authored.

---

## Ending resolution

```ts
function resolveEnding(m: Meters): Ending {
  if (m.heat  >= 65) return ENDINGS.heart          // relationships first — most on-brand
  if (m.fame  >= 70) return ENDINGS.mainCharacter
  if (m.image >= 60) return ENDINGS.brand
  return ENDINGS.darkHorse                          // balanced-player fallback
}
```

---

## Media + audio (future-ready, off for Saturday)

Both `media` and `audioUrl` are optional fields on `Situation`. For Saturday every
situation ships with both empty — pure text. The render path checks for them:

```
if (sit.media?.type === 'video') render <VideoHero src={sit.media.url} poster=... />
else if (sit.media?.type === 'image') render <ImageHero ... />
else render the text-only scene (Saturday default)

if (sit.audioUrl) show a play button that reads body[] aloud
```

Three hero-video moments planned for v3: cinematic intro, one eviction night, the finale.
Audio: narration VO per situation, droppable whenever recorded/TTS'd, zero rework because
the body is already written as read-aloud narration.

---

## Build sequence

1. **Meter rename** — `trust→heat`, `heat→image` across types, game.ts, all deltas, UI labels. Mechanical, do first.
2. **GameState + Supabase** — add `playerName`, `playerGender`; the 2 columns; wire load/save.
3. **Token resolver** — `resolveTokens()`, unit-test the gender/name swaps.
4. **Onboarding screen** — name + gender, sets starting meters, replaces character select.
5. **buildFeed + FeedScreen rework** — derived feed, persistent posts, reaction animation moves here.
6. **Live rework** — narrator-lens body, choice → impact → return-to-feed; drop `choicesByChar`.
7. **Vote / Eviction / Ending screens** — new, deterministic logic above.
8. **Cinematic intro** — character reveals + relationship labels.
9. **Content** — generate 32 situations against the bible, wire into data.ts.
10. **media/audioUrl fields** — add to type now (empty), render path guards.

Steps 1–8 are the engine (mostly mechanical + a few new screens). Step 9 is the content
pass. They can run partly in parallel — engine on the existing 26 situations as a harness,
swap content in once generated.

---

## Open risks / things to crack in eng-review

1. **Day-gating vs binge testing.** The 6-hour real-time gate blocks a full playthrough in
   one test session. Need an env flag (`LORE_DAY_GATE_MS`) to drop it to ~0 for Saturday.
2. **Feed length performance.** 35+ posts with images is fine, but the reaction-animation
   on the newest post must not re-trigger when scrolling. Memoize built feed; key animation
   off post id, not render.
3. **Condition-filtered situation index.** If conditional situations appear/disappear based
   on meters, the `situation` index must stay stable mid-playthrough. Resolve the visible
   list once per day, not per render, to avoid an index shifting under the player.
4. **Resume mid-arc.** A returning player rebuilds the entire feed from `choices` on load —
   verify the newest post doesn't re-animate every cold start (only animate on a fresh choice).
5. **Onboarding gender + existing saves.** Players with an old anonymous save have no
   `player_gender`. Default + force the onboarding screen if null.
