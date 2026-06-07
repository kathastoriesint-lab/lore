'use client'
import { createClient } from './supabase'
import type { CharId, GameState, GameFlags, RunMemory, Meters, DMMessage, Situation } from './types'
import { CHARS, DM_HOOKS, DM_MOCK } from './data'
import { CRICKET_DM_HOOKS } from './cricket-data'

// Lazy init — avoids module-level instantiation during SSR/prerender
let _supabase: ReturnType<typeof createClient> | null = null
const supabase = () => { if (!_supabase) _supabase = createClient(); return _supabase }

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
  // Lazy import to avoid circular deps — cricket-data imports from types, not game
  const { CRICKET_SITUATIONS } = require('./cricket-data')
  return (CRICKET_SITUATIONS as Situation[]).filter(s => s.id !== 'CR-S28').map(s => s.id)
}

export function buildCHQueue(meters: Meters, choices: ('A'|'B')[]): string[] {
  const { getVisibleSituations } = require('./data')
  return (getVisibleSituations(meters, choices) as Situation[]).map(s => s.id)
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
export async function getPhoneSession() {
  const { data: { session } } = await supabase().auth.getSession()
  if (!session || !session.user.phone) return null
  return session
}

export async function sendPhoneOTP(phone: string) {
  const { error } = await supabase().auth.signInWithOtp({ phone })
  if (error) throw error
}

export async function verifyPhoneOTP(phone: string, token: string) {
  const { data, error } = await supabase().auth.verifyOtp({ phone, token, type: 'sms' })
  if (error) throw error
  return data.session
}

export async function ensureSession() {
  const { data: { session } } = await supabase().auth.getSession()
  if (session) return session
  const { data, error } = await supabase().auth.signInAnonymously()
  if (error) throw error
  return data.session
}

// ── Game state ────────────────────────────────────────────────────────────────
export async function loadGameState(): Promise<GameState> {
  await ensureSession()
  const { data } = await supabase().from('game_state').select('*').maybeSingle()
  if (!data) return DEFAULT_STATE
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
  }
}

export async function saveGameState(state: GameState) {
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
    game_data: {
      situationQueue: state.situationQueue,
      flags: state.flags,
      runMemory: state.runMemory,
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
    const hook: DMMessage = { role: 'char', text: DM_HOOKS[charId] ?? CRICKET_DM_HOOKS[charId] ?? 'Hey! Kya chal raha hai?' }
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

// ── Trust delta scoring via LLM ───────────────────────────────────────────────
// Calls the same Edge Function in trust_score mode to get a -20..+20 delta.
// Runs in parallel with nothing — called after the reply is known.
export async function scoreTrustDelta(
  charId: CharId,
  playerMessage: string,
  charReply: string
): Promise<number> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  try {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/lore-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        mode: 'trust_score',
        character_id: charId,
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

// ── AI reply via Supabase Edge Function ──────────────────────────────────────
export async function getAIReply(
  charId: CharId,
  history: DMMessage[],
  playerName: string,
  gameState?: { char: string | null; meters: Meters; choices: string[]; situation: number; world?: string; flags?: GameFlags; story?: string; trustWithChar?: number }
): Promise<string> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const msgs = history
    .filter((_, i) => !(i === 0 && history[0].role === 'char'))
    .slice(-8)
    .map(m => ({ role: m.role === 'me' ? 'user' : 'assistant', content: m.text }))

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 12000)

  try {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/lore-chat`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        character_id: charId,
        messages: msgs,
        player_name: playerName,
        player_char: gameState?.char ?? null,
        player_meters: gameState?.meters ?? null,
        player_choices: gameState?.choices ?? null,
        player_flags: gameState?.flags ?? null,
        player_story: gameState?.story ?? null,
        trust_with_char: gameState?.trustWithChar ?? null,
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
  const arr = DM_MOCK[charId] ?? []
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
// Thresholds lowered to 65-70 (from 78) so endings are reachable.
// Starting meters: CH=20/50/30, Cricket=40/25/20.
// ~30 situations × avg net +3 per meter = realistic reach of 65-75 per meter.
export function resolveEnding(m: Meters): 'heart' | 'main' | 'brand' | 'dark' {
  if (m.heat  >= 67 && m.heat  > m.fame  && m.heat  > m.image) return 'heart'
  if (m.fame  >= 67 && m.fame  > m.heat  && m.fame  > m.image) return 'main'
  if (m.image >= 67 && m.image > m.fame  && m.image > m.heat)  return 'brand'
  return 'dark'
}

// ── Fame → followers ──────────────────────────────────────────────────────────
export function fameToFollowers(fame: number): number {
  return Math.round(fame * fame * 120 + fame * 1000)
}
