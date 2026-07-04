// Shared derivation of a player's run → feed posts + key-decision timeline.
// Single source of truth for FeedScreen and the world profile (both replay
// game.choices step-by-step to reconstruct what the player posted and decided).
import type { CharId, Character, Choice, ChoicePost, GameState, Meters, CricketMeters, Reaction, Situation } from './types'
import { getVisibleSituations } from './ch-rules'
import { weekForSituationId } from './season'
import { resolveGateOutcome, resolveSituationForReplay, variantCtxFor } from './variants'
import { getCricketChars, getCHChars, getCricketSituations } from './content'
import { applyDeltas, chCharForGender } from './game'

// Character post-card colours (must echo .c-{id}{--cc} in globals.css).
export const CHAR_COLORS_HEX: Record<string, string> = {
  ria:'#b03a5e', kabir:'#2a6f8f', dev:'#3a7a4a', ananya:'#8a4ab0', zoya:'#aa6a8a',
  meher:'#b07a2a', rishi:'#4a8a2a', adi:'#d4581a',
  hardik:'#003087', rohit:'#1a3a6e', surya:'#004080', bumrah:'#0a1a4a',
  tilak:'#2a5a8f', coach:'#4a3a1a', friend:'#3a6a4a', player:'#FF2D78',
}

// Plausible like counts (cycled by post index), per world.
export const feedLikes = (index: number, isCricket: boolean) => {
  const base = isCricket ? [94102, 128441, 76220, 183004, 52018, 211908] : [18420, 22810, 14390, 31502, 9024, 27118]
  return base[index % base.length].toLocaleString('en-IN')
}

const asArray = <T,>(value: T | T[] | null | undefined): T[] =>
  value == null ? [] : Array.isArray(value) ? value : [value]

export type FeedPost =
  | { type: 'npc'; postId: string; sit: Situation; stepIndex: number; postOffset: number; choice: 'A'|'B'; reaction: { char: string; caption: string }; char: Character }
  | {
      type: 'authored'
      postId: string
      sit: Situation
      stepIndex: number
      postOffset: number
      choice: 'A'|'B'
      caption: string
      imageUrl?: string
      owner: { id: string; cls: string; init: string; handle: string; avatarUrl?: string; color: string; isPlayer: boolean; likeTarget?: CharId }
      label?: string
      reactions: Reaction[]
      /** Authored comment options (cricket comment hooks) — replies move bonds. */
      comments?: import('./data').PostCommentOption[]
    }

// Replay the run → feed posts (newest first). Mirrors the original FeedScreen logic.
export function derivePosts(game: GameState): FeedPost[] {
  const isCricket = game.world === 'cricket'
  if (game.choices.length === 0) return []
  const allChars: Record<string, Character> = { ...getCHChars(), ...getCricketChars() }
  const STARTING_METERS: Meters = isCricket ? { form: 40, fame: 25 } : { fame: 20 }
  let meters: Meters = { ...STARTING_METERS }
  const posts: FeedPost[] = []
  const playerCharObj = (isCricket || game.char === 'player')
    ? { id: 'player' as CharId, cls: '', init: (game.playerName?.[0] ?? 'N').toUpperCase(), name: game.playerName || 'Player', handle: (game.playerName || 'player').toLowerCase().replace(/\s+/g, ''), fame: 0, role: '' }
    : game.char ? (allChars[game.char] ?? null) : null
  const cricketSitMap = isCricket ? Object.fromEntries(getCricketSituations().map(s => [s.id, s])) : {}

  for (let i = 0; i < game.choices.length; i++) {
    const letter = game.choices[i]
    const rawSit: Situation | undefined = isCricket
      ? cricketSitMap[game.situationQueue[i]]
      : getVisibleSituations(meters, game.choices.slice(0, i) as ('A'|'B')[])[i]
    // Cricket: re-apply the variant the player actually chose in (persisted in
    // variantSeen), so the replayed post matches what they saw.
    const sit = rawSit && isCricket
      ? resolveSituationForReplay(rawSit, game, variantCtxFor(game, game.dmTrust ?? {}, weekForSituationId(rawSit.id)))
      : rawSit
    if (!sit) continue
    const ch = sit.choices[letter === 'A' ? 0 : 1]

    const reaction = sit.feedReaction?.[letter]
    if (reaction && (reaction.account || reaction.imageUrl)) {
      // Fan-account reactions (and photo reactions) use the full authored-post
      // rendering — avatar chip, photo card, like/comment row.
      const owner = reaction.account
        ? { id: '__account', cls: '', init: reaction.account.avatarText ?? reaction.account.name[0]?.toUpperCase() ?? 'F', handle: reaction.account.handle, color: '#003087', isPlayer: false }
        : (() => {
            const c = allChars[chCharForGender(reaction.char!, game.playerGender) as CharId]
            return c ? { id: c.id, cls: c.cls, init: c.init, handle: c.handle, avatarUrl: `/avatars/${c.id}.png`, color: CHAR_COLORS_HEX[c.id] ?? '#1a1a2e', isPlayer: false, likeTarget: c.id as CharId } : null
          })()
      if (owner) posts.push({ type: 'authored', postId: `react-${sit.id}-${letter}`, sit, stepIndex: i, postOffset: 2, choice: letter, caption: reaction.caption, imageUrl: reaction.imageUrl, owner, reactions: [] })
    } else if (reaction && !isCricket && reaction.char) {
      // Render the gender-correct creator (crush/ally swap for female players).
      const char = allChars[chCharForGender(reaction.char, game.playerGender) as CharId]
      if (char) posts.push({ type: 'npc', postId: `react-${sit.id}-${letter}`, sit, stepIndex: i, postOffset: 2, choice: letter, reaction: { char: reaction.char, caption: reaction.caption }, char })
    } else if (reaction && isCricket && reaction.char) {
      const char = allChars[reaction.char]
      if (char) posts.push({ type: 'npc', postId: `react-${sit.id}-${letter}`, sit, stepIndex: i, postOffset: 2, choice: letter, reaction: { char: reaction.char, caption: reaction.caption }, char })
    }

    const legacyPost: ChoicePost | null = ch?.caption ? { source: 'player', caption: ch.caption, reactions: ch.reactions ?? [] } : null
    const outcome = ch ? (resolveGateOutcome(ch, meters, game.dmTrust ?? {}, game.gateResults, sit.id)?.outcome ?? null) : null
    const authoredPosts = asArray(outcome?.post !== undefined ? outcome.post : (ch?.post !== undefined ? ch.post : (isCricket ? null : legacyPost)))
      .filter(post => post.display !== 'live-only')
    if (authoredPosts.length > 0 && playerCharObj) {
      authoredPosts.forEach((authoredPost, postIndex) => {
        const owner = (() => {
          if (authoredPost.source === 'account') {
            const handle = authoredPost.handle ?? authoredPost.name?.toLowerCase().replace(/\s+/g, '') ?? 'update'
            return { id: '__account', cls: '', init: authoredPost.avatarText ?? (authoredPost.name ?? handle)[0]?.toUpperCase() ?? 'U', handle, color: '#003087', isPlayer: false }
          }
          if (authoredPost.source === 'character' && authoredPost.char) {
            const c = allChars[chCharForGender(authoredPost.char, game.playerGender) as CharId]
            if (!c) return null
            return { id: c.id, cls: c.cls, init: c.init, handle: c.handle, avatarUrl: `/avatars/${c.id}.png`, color: CHAR_COLORS_HEX[c.id] ?? '#1a1a2e', isPlayer: false, likeTarget: c.id as CharId }
          }
          return { id: playerCharObj.id, cls: playerCharObj.cls, init: playerCharObj.init, handle: authoredPost.handle ?? (game.playerName || playerCharObj.handle).toLowerCase().replace(/\s+/g, ''), avatarUrl: playerCharObj.id === 'player' ? game.avatarUrl : `/avatars/${playerCharObj.id}.png`, color: CHAR_COLORS_HEX[playerCharObj.id] ?? '#1a1a2e', isPlayer: true, likeTarget: playerCharObj.id as CharId }
        })()
        if (owner) {
          // Live-generated player post overrides the authored caption/reactions
          // (same key the compose flow writes: `${sit.id}-${letter}`).
          const ai = owner.isPlayer ? game.aiPosts?.[`${sit.id}-${letter}`] : undefined
          posts.push({ type: 'authored', postId: `post-${sit.id}-${letter}-${postIndex}`, sit, stepIndex: i, postOffset: postIndex * 2, choice: letter, caption: ai?.caption ?? authoredPost.caption, imageUrl: ai?.imageUrl ?? authoredPost.imageUrl, owner, label: authoredPost.label, reactions: ai?.reactions?.length ? ai.reactions : (authoredPost.reactions ?? []), comments: authoredPost.comments })
        }
      })
    }

    if (ch) meters = applyDeltas(meters, ch.deltas)
  }
  return posts.reverse()
}

export interface KeyDecision {
  id: string
  when: string       // eyebrow, e.g. "WEEK 1 · NETS" / "DAY 2"
  title: string      // the choice the player made
  outcome: string    // meter-delta summary in the world's labels
  color: string      // dominant meter colour
}


// ── Morning-after storm ───────────────────────────────────────────────────────
// Overnight fan/analyst posts assembled from YOUR run — persisted verdicts, gate
// results and exact runMemory numbers — prepended to the feed when a new week
// opens. Deterministic from saved state → replay-safe on every device.
const OVERNIGHT_ACCOUNTS = {
  paltanpulse: { id: '__account', cls: '', init: 'P', handle: 'paltanpulse', color: '#003087', name: 'Paltan Pulse' },
  cricketroom: { id: '__account', cls: '', init: 'C', handle: 'cricketroom_india', color: '#1a2a3a', name: 'Cricket Room India' },
  memeovers: { id: '__account', cls: '', init: 'M', handle: 'memeovers', color: '#3a1a2a', name: 'Meme Overs' },
}

export function deriveOvernightPosts(game: GameState): FeedPost[] {
  if (game.world !== 'cricket') return []
  const name = game.playerName || 'the kid'
  const sits = getCricketSituations()
  const sitFallback = sits[0]
  const out: FeedPost[] = []
  const mk = (key: keyof typeof OVERNIGHT_ACCOUNTS, id: string, caption: string, imageUrl?: string) => {
    const acc = OVERNIGHT_ACCOUNTS[key]
    out.push({
      type: 'authored', postId: 'overnight-' + id, sit: sitFallback, stepIndex: 9000 + out.length, postOffset: 0,
      choice: 'A', caption, imageUrl,
      owner: { id: acc.id, cls: acc.cls, init: acc.init, handle: acc.handle, color: acc.color, isPlayer: false },
      label: acc.name + ' · overnight', reactions: [],
    })
  }
  const sel = game.selections ?? {}
  const gates = game.gateResults ?? {}
  const rm = game.runMemory ?? {}
  const week = game.week ?? 1

  // After SEL-W1 (week 2 open): the sheet verdict is public news.
  if (week >= 2 && sel['SEL-W1']) {
    if (sel['SEL-W1'] === 'started') mk('paltanpulse', 'w1', `TEAM SHEET OUT: 16 saal ka debut aaj raat Wankhede pe. No.5 — ${name}. Neend kis kis ki udi? 🔥`, '/generated/cricket-posts/cr2-s5-sheet.png')
    else if (sel['SEL-W1'] === 'lifeline') mk('cricketroom', 'w1', `Sources: coaching room ne form sheet dikhayi, captain ne apna naam. Aaj raat ka No.5 — ${name} — Hardik ki personal call hai.`, '/generated/cricket-posts/cr2-s5-selection.png')
    else mk('paltanpulse', 'w1', `WHERE IS ${name.toUpperCase()}?? MI buys a prodigy and BENCHES him?? #JusticeFor${name.replace(/\s+/g, '')} 😤`, '/generated/cricket-posts/cr-s27-player.png')
  }
  // After the debut gate (S7) resolves and week 3 opens: the knock is history.
  if (week >= 3 && gates['CR2-S7']) {
    if (gates['CR2-S7'] === 'pass') mk('paltanpulse', 'w2', `${rm.debutRuns ?? 40}(${rm.debutBalls ?? 26})${sel['SEL-W1'] === 'benched' ? ' AS A SUB' : ' ON DEBUT'}. Okay MI, hum dekh rahe hain 💙 Ab isse XI se bahar mat karna.`, '/generated/cricket-posts/cr-s25-pass.png')
    else mk('memeovers', 'w2', `debut ${rm.debutRuns ?? 12}(${rm.debutBalls ?? 14}) — hype train ka pehla station aa gaya. utarna hai kisi ko? 💀`, '/generated/cricket-posts/cr-s25-fail.png')
    if (sel['SEL-W2'] === 'benched') mk('cricketroom', 'w2b', `Week 2 sheet: ${name} OUT. Storm ke baad ki khamoshi hamesha zyada loud hoti hai. Eliminator se pehle wapas aana hoga — wapas aana hai toh form dikhana hoga — 64 ka number bola ja raha hai.`, '/generated/cricket-posts/cr2-s12-net64.png')
  }
  return out
}

// Replay the run → a newest-first timeline of the choices the player made,
// with a one-line meter-delta outcome (honest — derived straight from deltas).
export function deriveKeyDecisions(game: GameState): KeyDecision[] {
  const isCricket = game.world === 'cricket'
  if (game.choices.length === 0) return []
  const STARTING_METERS: Meters = isCricket ? { form: 40, fame: 25 } : { fame: 20 }
  let meters: Meters = { ...STARTING_METERS }
  const cricketSitMap = isCricket ? Object.fromEntries(getCricketSituations().map(s => [s.id, s])) : {}
  // label + colour per meter slot, world-aware
  const META: Record<string, { label: string; color: string }> = isCricket
    ? { form: { label: 'Form', color: '#FFB020' }, fame: { label: 'Fame', color: '#FF5C3A' }, trust: { label: 'Team trust', color: '#3DD6C8' } }
    : { fame: { label: 'Fame', color: '#FFB020' } }
  const out: KeyDecision[] = []
  for (let i = 0; i < game.choices.length; i++) {
    const letter = game.choices[i]
    const rawSit: Situation | undefined = isCricket
      ? cricketSitMap[game.situationQueue[i]]
      : getVisibleSituations(meters, game.choices.slice(0, i) as ('A'|'B')[])[i]
    const sit = rawSit && isCricket
      ? resolveSituationForReplay(rawSit, game, variantCtxFor(game, game.dmTrust ?? {}, weekForSituationId(rawSit.id)))
      : rawSit
    if (!sit) continue
    const ch = sit.choices[letter === 'A' ? 0 : 1]
    const d = ch.deltas as Record<string, number | undefined>
    const dv = (s: string) => d[s] ?? 0
    // dominant changed meter → colour
    const slots = Object.keys(META)
    const dominant = slots.slice().sort((a, b) => Math.abs(dv(b)) - Math.abs(dv(a)))[0]
    const outcome = slots
      .filter(s => dv(s) !== 0)
      .map(s => `${META[s].label} ${dv(s) > 0 ? '+' : ''}${dv(s)}`)
      .join(' · ') || 'No meter change'
    const tag = (sit.tag || '').replace(/[⚡✨🔥]/gu, '').replace(/\s+/g, ' ').trim().toUpperCase()
    out.push({
      id: `${sit.id}-${letter}`,
      when: tag || (isCricket ? `SITUATION ${i + 1}` : `DAY ${sit.day}`),
      title: ch.t,
      outcome,
      color: META[dominant].color,
    })
    meters = applyDeltas(meters, ch.deltas)
  }
  return out.reverse()
}
