// Shared derivation of a player's run → feed posts + key-decision timeline.
// Single source of truth for FeedScreen and the world profile (both replay
// game.choices step-by-step to reconstruct what the player posted and decided).
import type { CharId, Character, Choice, ChoicePost, GameState, Meters, Reaction, Situation } from './types'
import { getVisibleSituations } from './ch-rules'
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

const resolveChoiceOutcome = (choice: Choice, meters: Meters) => {
  const gate = choice.outcomeGate
  if (!gate) return null
  return meters[gate.metric] > gate.threshold ? gate.pass : gate.fail
}

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
    }

// Replay the run → feed posts (newest first). Mirrors the original FeedScreen logic.
export function derivePosts(game: GameState): FeedPost[] {
  const isCricket = game.world === 'cricket'
  if (game.choices.length === 0) return []
  const allChars: Record<string, Character> = { ...getCHChars(), ...getCricketChars() }
  const STARTING_METERS = isCricket ? { fame: 40, heat: 25, image: 20 } : { fame: 20, heat: 50, image: 30 }
  let meters: Meters = { ...STARTING_METERS }
  const posts: FeedPost[] = []
  const playerCharObj = (isCricket || game.char === 'player')
    ? { id: 'player' as CharId, cls: '', init: (game.playerName?.[0] ?? 'N').toUpperCase(), name: game.playerName || 'Player', handle: (game.playerName || 'player').toLowerCase().replace(/\s+/g, ''), fame: 0, role: '' }
    : game.char ? (allChars[game.char] ?? null) : null
  const cricketSitMap = isCricket ? Object.fromEntries(getCricketSituations().map(s => [s.id, s])) : {}

  for (let i = 0; i < game.choices.length; i++) {
    const letter = game.choices[i]
    const sit: Situation | undefined = isCricket
      ? cricketSitMap[game.situationQueue[i]]
      : getVisibleSituations(meters, game.choices.slice(0, i) as ('A'|'B')[])[i]
    if (!sit) continue
    const ch = sit.choices[letter === 'A' ? 0 : 1]

    const reaction = isCricket ? null : sit.feedReaction?.[letter]
    if (reaction) {
      // Render the gender-correct creator (crush/ally swap for female players).
      const char = allChars[chCharForGender(reaction.char, game.playerGender) as CharId]
      if (char) posts.push({ type: 'npc', postId: `react-${sit.id}-${letter}`, sit, stepIndex: i, postOffset: 2, choice: letter, reaction, char })
    }

    const legacyPost: ChoicePost | null = ch?.caption ? { source: 'player', caption: ch.caption, reactions: ch.reactions ?? [] } : null
    const outcome = ch ? resolveChoiceOutcome(ch, meters) : null
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
          posts.push({ type: 'authored', postId: `post-${sit.id}-${letter}-${postIndex}`, sit, stepIndex: i, postOffset: postIndex * 2, choice: letter, caption: ai?.caption ?? authoredPost.caption, imageUrl: ai?.imageUrl ?? authoredPost.imageUrl, owner, label: authoredPost.label, reactions: ai?.reactions?.length ? ai.reactions : (authoredPost.reactions ?? []) })
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

// Replay the run → a newest-first timeline of the choices the player made,
// with a one-line meter-delta outcome (honest — derived straight from deltas).
export function deriveKeyDecisions(game: GameState): KeyDecision[] {
  const isCricket = game.world === 'cricket'
  if (game.choices.length === 0) return []
  const STARTING_METERS = isCricket ? { fame: 40, heat: 25, image: 20 } : { fame: 20, heat: 50, image: 30 }
  let meters: Meters = { ...STARTING_METERS }
  const cricketSitMap = isCricket ? Object.fromEntries(getCricketSituations().map(s => [s.id, s])) : {}
  // label + colour per meter slot, world-aware
  const META: Record<keyof Meters, { label: string; color: string }> = isCricket
    ? { fame: { label: 'Form', color: '#FFB020' }, heat: { label: 'Fame', color: '#FF5C3A' }, image: { label: 'Team trust', color: '#3DD6C8' } }
    : { fame: { label: 'Fame', color: '#FFB020' }, heat: { label: 'Heat', color: '#FF5C3A' }, image: { label: 'Trust', color: '#3DD6C8' } }
  const out: KeyDecision[] = []
  for (let i = 0; i < game.choices.length; i++) {
    const letter = game.choices[i]
    const sit: Situation | undefined = isCricket
      ? cricketSitMap[game.situationQueue[i]]
      : getVisibleSituations(meters, game.choices.slice(0, i) as ('A'|'B')[])[i]
    if (!sit) continue
    const ch = sit.choices[letter === 'A' ? 0 : 1]
    const d = ch.deltas
    // dominant changed meter → colour
    const slots: (keyof Meters)[] = ['fame', 'heat', 'image']
    const dominant = slots.slice().sort((a, b) => Math.abs(d[b]) - Math.abs(d[a]))[0]
    const outcome = slots
      .filter(s => d[s] !== 0)
      .map(s => `${META[s].label} ${d[s] > 0 ? '+' : ''}${d[s]}`)
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
