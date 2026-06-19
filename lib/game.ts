'use client'
import { createClient } from './supabase'
import type { CharId, GameState, GameFlags, RunMemory, Meters, DMMessage, Situation } from './types'
import { getCricketDMHooks, getCricketSituations, getCHDMHooks, getCHDMMock, getCHSituations } from './content'

// Lazy init — avoids module-level instantiation during SSR/prerender
let _supabase: ReturnType<typeof createClient> | null = null
const supabase = () => { if (!_supabase) _supabase = createClient(); return _supabase }
/** Shared browser Supabase client — reuse this everywhere (one GoTrue instance). */
export const getClient = () => supabase()

const DEFAULT_METERS: Meters = { fame: 20, heat: 50, image: 30 }
const CRICKET_START_METERS: Meters = { fame: 40, heat: 25, image: 20 } // Form 40 · Fame 25 · Team Trust 20

export const DEFAULT_FLAGS: GameFlags = {
  mentorTrust: 0, hypeRisk: 0, roleAcceptance: 0, homeGrounding: 0,
  allyLoyalty: 0, rivalryScore: 0,
}

const DEFAULT_STATE: GameState = {
  playerName: '', playerGender: 'male' as const,
  world: 'creator-house',
  char: null, situation: 0, situationQueue: [], choices: [],
  meters: DEFAULT_METERS, flags: DEFAULT_FLAGS, runMemory: {},
  narrator_done: false, dayUnlockTime: {},
}

export const CRICKET_STARTING_METERS = CRICKET_START_METERS

// ── Situation queue builders ───────────────────────────────────────────────────
export function buildCricketQueue(): string[] {
  return getCricketSituations().filter(s => s.id !== 'CR-S28').map(s => s.id)
}

export function buildCHQueue(meters: Meters, choices: ('A'|'B')[]): string[] {
  void meters; void choices
  return getCHSituations().map(s => s.id)
}

/** Apply flag deltas from a choice, clamping to 0–5. */
export function applyFlagDeltas(flags: GameFlags, deltas?: Partial<GameFlags>): GameFlags {
  if (!deltas) return flags
  const clamp5 = (n: number) => Math.max(0, Math.min(5, n))
  return {
    mentorTrust:    clamp5(flags.mentorTrust    + (deltas.mentorTrust    ?? 0)),
    hypeRisk:       clamp5(flags.hypeRisk       + (deltas.hypeRisk       ?? 0)),
    roleAcceptance: clamp5(flags.roleAcceptance + (deltas.roleAcceptance ?? 0)),
    homeGrounding:  clamp5(flags.homeGrounding  + (deltas.homeGrounding  ?? 0)),
    allyLoyalty:    clamp5(flags.allyLoyalty    + (deltas.allyLoyalty    ?? 0)),
    rivalryScore:   clamp5(flags.rivalryScore   + (deltas.rivalryScore   ?? 0)),
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
// Returns the current session, transparently creating an anonymous Supabase
// session if none exists yet. Supabase persists this session in localStorage,
// so the same browser/device automatically gets the same user_id (and all
// their saved progress) on every future visit — no login step required.
export async function ensureSession() {
  const { data: { session } } = await supabase().auth.getSession()
  if (session) return session
  const { data, error } = await supabase().auth.signInAnonymously()
  if (error) return null
  return data.session ?? null
}

// ── Game state ────────────────────────────────────────────────────────────────
export async function loadGameState(): Promise<GameState> {
  await ensureSession()
  const { data } = await supabase().from('game_state').select('*').maybeSingle()
  if (!data) return DEFAULT_STATE
  const { weekForSituationId } = await import('./season')
  // Guard against old meter format (trust/heat keys from v1)
  const rawMeters = data.meters ?? DEFAULT_METERS
  const meters: Meters = rawMeters?.image !== undefined ? rawMeters as Meters : DEFAULT_METERS
  // Extra fields stored in game_data JSONB column (nullable — old saves won't have it)
  const extra = (data.game_data as Record<string, unknown> | null) ?? {}
  const world = (data.world ?? 'creator-house') as import('./types').World
  const choices = (data.choices ?? []) as ('A'|'B')[]
  const situationQueue = Array.isArray(extra.situationQueue)
    ? (extra.situationQueue as string[])
    : (world === 'cricket' ? buildCricketQueue() : buildCHQueue(meters, choices))
  return {
    playerName: data.player_name ?? '',
    playerGender: (data.player_gender ?? 'male') as 'male' | 'female',
    world,
    char: data.char_id ? data.char_id as CharId : null,
    situation: data.situation,
    situationQueue,
    choices,
    meters,
    flags: (extra.flags as GameFlags) ?? DEFAULT_FLAGS,
    runMemory: (extra.runMemory as RunMemory) ?? {},
    narrator_done: data.narrator_done,
    dayUnlockTime: data.day_unlock_time ?? {},
    avatarUrl: data.avatar_url ?? undefined,
    dmTrust: (extra.dmTrust as Record<string, number>) ?? undefined,
    charFame: (extra.charFame as Record<string, number>) ?? undefined,
    likedPosts: Array.isArray(extra.likedPosts) ? (extra.likedPosts as string[]) : undefined,
    // In-flight save migration: pre-season saves have no week — derive it from
    // the current queue position (weeks overlay the unchanged queue, so the
    // situation index stays valid; no snap-back or replay needed).
    week: typeof extra.week === 'number'
      ? extra.week
      : (world === 'cricket' && Array.isArray(situationQueue) && situationQueue.length > 0
          ? weekForSituationId(situationQueue[Math.min(data.situation ?? 0, situationQueue.length - 1)])
          : undefined),
    lockExpiresAt: typeof extra.lockExpiresAt === 'number' ? extra.lockExpiresAt : null,
    clockOverrideMs: typeof extra.clockOverrideMs === 'number' ? extra.clockOverrideMs : null,
    interlude: (extra.interlude as GameState['interlude']) ?? undefined,
    failedWeeks: Array.isArray(extra.failedWeeks) ? (extra.failedWeeks as number[]) : undefined,
    pendingEviction: typeof extra.pendingEviction === 'string' ? extra.pendingEviction : null,
    evictionsSeen: Array.isArray(extra.evictionsSeen) ? (extra.evictionsSeen as string[]) : undefined,
    evicted: Array.isArray(extra.evicted) ? (extra.evicted as string[]) : undefined,
  }
}

export async function saveGameState(state: GameState, deviceId?: string) {
  const { data: { user } } = await supabase().auth.getUser()
  if (!user) return
  await supabase().from('game_state').upsert({
    user_id: user.id,
    player_name: state.playerName,
    player_gender: state.playerGender,
    world: state.world ?? 'creator-house',
    char_id: state.char,
    situation: state.situation,
    choices: state.choices,
    meters: state.meters,
    narrator_done: state.narrator_done,
    day_unlock_time: state.dayUnlockTime,
    avatar_url: state.avatarUrl ?? null,
    ...(deviceId ? { device_id: deviceId } : {}),
    game_data: {
      situationQueue: state.situationQueue,
      flags: state.flags,
      runMemory: state.runMemory,
      // Relationship + social progress — persisted so every login restores full state
      dmTrust: state.dmTrust ?? {},
      charFame: state.charFame ?? {},
      likedPosts: state.likedPosts ?? [],
      // Season 1 progression
      week: state.week ?? null,
      lockExpiresAt: state.lockExpiresAt ?? null,
      clockOverrideMs: state.clockOverrideMs ?? null,
      interlude: state.interlude ?? null,
      failedWeeks: state.failedWeeks ?? [],
      // Creator House evictions
      pendingEviction: state.pendingEviction ?? null,
      evictionsSeen: state.evictionsSeen ?? [],
      evicted: state.evicted ?? [],
    },
  }, { onConflict: 'user_id' })
}

export async function resetGameState() {
  const { data: { user } } = await supabase().auth.getUser()
  if (user) {
    await supabase().from('game_state').delete().eq('user_id', user.id)
    await supabase().from('dm_messages').delete().eq('user_id', user.id)
  }
  await supabase().auth.signOut({ scope: 'local' })
}

// ── Choice stats ──────────────────────────────────────────────────────────────
export async function recordChoice(situationId: number, choice: 'A' | 'B') {
  try {
    await supabase().rpc('increment_choice', { p_situation: situationId, p_choice: choice })
  } catch {
    // Fallback: rpc not created yet, skip silently
  }
}

export async function getStats(situationId: number): Promise<{ total: number; pctA: number }> {
  const { data } = await supabase()
    .from('situation_stats')
    .select('choice, count')
    .eq('situation_id', situationId)
  if (!data || data.length === 0) return { total: 4218, pctA: 62 }
  const a = data.find(r => r.choice === 'A')?.count ?? 2847
  const b = data.find(r => r.choice === 'B')?.count ?? 1371
  const total = a + b
  return { total, pctA: Math.round((a / total) * 100) }
}

// ── DM messages ───────────────────────────────────────────────────────────────
export async function loadDMs(charId: CharId): Promise<DMMessage[]> {
  await ensureSession()
  const { data } = await supabase()
    .from('dm_messages')
    .select('role, content')
    .eq('char_id', charId)
    .order('created_at', { ascending: true })

  if (!data || data.length === 0) {
    // First time — insert opening hook
    const hook: DMMessage = { role: 'char', text: getCHDMHooks()[charId] ?? getCricketDMHooks()[charId] ?? 'Hey! Kya chal raha hai?' }
    await saveDM(charId, hook)
    return [hook]
  }
  return data.map(r => ({ role: r.role as 'me' | 'char', text: r.content }))
}

export async function saveDM(charId: CharId, msg: DMMessage) {
  const { data: { user } } = await supabase().auth.getUser()
  if (!user) return
  await supabase().from('dm_messages').insert({
    user_id: user.id,
    char_id: charId,
    role: msg.role,
    content: msg.text,
  })
}

// ── Edge function auth ────────────────────────────────────────────────────────
// Authorization header for lore-chat calls. Sends the player's anonymous session
// JWT so the edge function can verify a real Supabase user (blocking keyless
// abuse of the paid OpenAI endpoint). Falls back to the public anon key only if a
// session can't be established — in which case the function will reject the call.
async function loreChatAuth(): Promise<string> {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  try {
    const session = await ensureSession()
    return `Bearer ${session?.access_token ?? anon}`
  } catch {
    return `Bearer ${anon}`
  }
}

// ── Trust delta scoring via LLM ───────────────────────────────────────────────
// Calls the same Edge Function in trust_score mode to get a -20..+20 delta.
// Runs in parallel with nothing — called after the reply is known.
export async function scoreTrustDelta(
  charId: CharId,
  playerMessage: string,
  charReply: string,
  currentTrust?: number
): Promise<number> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  try {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/lore-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await loreChatAuth(),
      },
      body: JSON.stringify({
        mode: 'trust_score',
        character_id: charId,
        current_trust: currentTrust ?? null,
        trust_band: currentTrust == null ? null : currentTrust < 30 ? 'low' : currentTrust < 60 ? 'normal' : 'high',
        messages: [
          { role: 'user', content: playerMessage },
          { role: 'assistant', content: charReply },
        ],
      }),
    })
    if (!resp.ok) return 0
    const json = await resp.json()
    return typeof json.delta === 'number' ? json.delta : 0
  } catch {
    return 0
  }
}

// ── Dynamic reply suggestions via LLM ─────────────────────────────────────────
// Called after a character reply lands — returns ONE in-voice, in-context reply
// grounded in the character's last message, the player's meters/trust, and the
// upcoming game situation. Falls back to [] on error.
export async function getReplySuggestions(
  charId: CharId,
  history: DMMessage[],
  playerName: string,
  ctx?: { meters?: Meters; trustWithChar?: number; teamTrust?: number; nextSituation?: string; choicesMade?: number; playerGender?: 'male' | 'female' }
): Promise<string[]> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

  const msgs = history
    .filter((_, i) => !(i === 0 && history[0].role === 'char'))
    .slice(-6)
    .map(m => ({ role: m.role === 'me' ? 'user' : 'assistant', content: m.text }))

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 14000)

  try {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/lore-chat`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await loreChatAuth(),
      },
      body: JSON.stringify({
        mode: 'suggest_replies',
        character_id: charId,
        messages: msgs,
        player_name: playerName,
        player_meters: ctx?.meters ?? null,
        trust_with_char: ctx?.trustWithChar ?? null,
        team_trust: ctx?.teamTrust ?? null,
        next_situation: ctx?.nextSituation ?? null,
        choices_made: ctx?.choicesMade ?? null,
        player_gender: ctx?.playerGender ?? 'male',
      }),
    })
    clearTimeout(timer)
    if (!resp.ok) return []
    const json = await resp.json()
    return Array.isArray(json.suggestions) ? json.suggestions.filter((s: unknown) => typeof s === 'string') : []
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

// ── AI reply via Supabase Edge Function ──────────────────────────────────────
export async function getAIReply(
  charId: CharId,
  history: DMMessage[],
  playerName: string,
  gameState?: { char: string | null; meters: Meters; choices: string[]; situation: number; world?: string; flags?: GameFlags; story?: string; trustWithChar?: number; trustBand?: 'low' | 'normal' | 'high'; trustGuidance?: string; teamTrust?: number; playerGender?: 'male' | 'female' }
): Promise<string> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

  const msgs = history
    .filter((_, i) => !(i === 0 && history[0].role === 'char'))
    .slice(-8)
    .map(m => ({ role: m.role === 'me' ? 'user' : 'assistant', content: m.text }))

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 18000)

  try {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/lore-chat`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': await loreChatAuth(),
      },
      body: JSON.stringify({
        character_id: charId,
        messages: msgs,
        player_name: playerName,
        player_gender: gameState?.playerGender ?? 'male',
        player_char: gameState?.char ?? null,
        player_meters: gameState?.meters ?? null,
        player_choices: gameState?.choices ?? null,
        player_flags: gameState?.flags ?? null,
        player_story: gameState?.story ?? null,
        trust_with_char: gameState?.trustWithChar ?? null,
        trust_band: gameState?.trustBand ?? null,
        trust_guidance: gameState?.trustGuidance ?? null,
        team_trust: gameState?.teamTrust ?? null,
        current_day: gameState ? (gameState.world === 'cricket' ? gameState.situation + 1 : Math.ceil((gameState.situation + 1) / 3)) : 1,
      }),
    })
    clearTimeout(timer)
    if (!resp.ok) throw new Error('api-error')

    const reader = resp.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = '', result = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value)
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') return result || pickMock(charId)
        try {
          const json = JSON.parse(data)
          const token = json.choices?.[0]?.delta?.content
          if (token) result += token
        } catch { /* skip */ }
      }
    }
    return result || pickMock(charId)
  } catch {
    clearTimeout(timer)
    return pickMock(charId)
  }
}

function pickMock(charId: CharId): string {
  const arr = getCHDMMock()[charId] ?? []
  return arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : 'Haan yaar.'
}

// ── Meter helpers ─────────────────────────────────────────────────────────────
export function clamp(n: number) { return Math.max(0, Math.min(100, Math.round(n))) }

export function applyDeltas(meters: Meters, deltas: Meters): Meters {
  return {
    fame:  clamp(meters.fame  + deltas.fame),
    heat:  clamp(meters.heat  + deltas.heat),
    image: clamp(meters.image + deltas.image),
  }
}

// charMeters not needed in v2 (fixed POV), kept for compat
export function charMeters(_charId: CharId): Meters {
  return DEFAULT_METERS
}

// ── Token resolution ──────────────────────────────────────────────────────────
export function resolveTokens(text: string, playerName: string, playerGender: 'male' | 'female', friendName = 'Maddy'): string {
  const male = playerGender === 'male'
  const crush = male ? 'Ananya' : 'Kabir'
  const ally  = male ? 'Kabir'  : 'Ananya'
  return text
    .replaceAll('{name}', playerName || 'Tum')
    .replaceAll('{friend}', friendName)
    .replaceAll('{crush}', crush)
    .replaceAll('{ally}', ally)
    // Gendered word forms, always written {token|male-form/female-form}:
    //   {p|…}  → player & same-gender refs (the ally is always the player's gender)
    //   {x|…}  → crush & opposite-gender refs (the crush is always the opposite gender)
    .replace(/\{p\|([^/|}]*)\/([^|}]*)\}/g, (_m, a, b) => (male ? a : b))
    .replace(/\{x\|([^/|}]*)\/([^|}]*)\}/g, (_m, a, b) => (male ? b : a))
    // *text* → <em>text</em> for italic rendering in dangerouslySetInnerHTML
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

// ── Loyalty scoring ───────────────────────────────────────────────────────────
export function allyLoyalty(choices: ('A' | 'B')[], situations: import('./types').Situation[]): number {
  let n = 0
  for (let i = 0; i < choices.length && i < situations.length; i++) {
    if (situations[i].loyaltyChoice && choices[i] === situations[i].loyaltyChoice) n++
  }
  return n
}

// ── Ending resolution ─────────────────────────────────────────────────────────
// Creator House ships TWO reachable endings (CEO review, 2026-06): the old 4-ending
// model collapsed to 94.6% "Heart" with Brand + Dark Horse mathematically impossible.
// Fame and Heat are the two "who you become" axes; whichever ends higher decides.
// (Image/Trust no longer maps to an ending — it drives eviction-night pressure.)
//   fame > heat → The Main Character (celebrity)
//   else        → The Heart (the most-talked-about, the emotional core)
// Both are genuinely reachable: a fame-leaning playstyle lands Main, a heat-leaning
// one lands Heart. The tie defaults to Heart.
export function resolveEnding(m: Meters): 'heart' | 'main' {
  return m.fame > m.heat ? 'main' : 'heart'
}

// ── Fame → followers ──────────────────────────────────────────────────────────
export function fameToFollowers(fame: number): number {
  return Math.round(fame * fame * 120 + fame * 1000)
}
