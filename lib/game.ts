'use client'
import { createClient } from './supabase'
import type { CharId, GameState, Meters, DMMessage } from './types'
import { CHARS, DM_HOOKS, DM_MOCK } from './data'

// Lazy init — avoids module-level instantiation during SSR/prerender
let _supabase: ReturnType<typeof createClient> | null = null
const supabase = () => { if (!_supabase) _supabase = createClient(); return _supabase }

const DEFAULT_METERS: Meters = { fame: 15, trust: 60, heat: 5 }
const DEFAULT_STATE: GameState = {
  char: null, situation: 0, choices: [],
  meters: DEFAULT_METERS, narrator_done: false,
  dayUnlockTime: {},
}

// ── Auth ──────────────────────────────────────────────────────────────────────
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
  return {
    char: data.char_id,
    situation: data.situation,
    choices: data.choices ?? [],
    meters: data.meters ?? DEFAULT_METERS,
    narrator_done: data.narrator_done,
    dayUnlockTime: data.day_unlock_time ?? {},
  }
}

export async function saveGameState(state: GameState) {
  const { data: { user } } = await supabase().auth.getUser()
  if (!user) return
  await supabase().from('game_state').upsert({
    user_id: user.id,
    char_id: state.char,
    situation: state.situation,
    choices: state.choices,
    meters: state.meters,
    narrator_done: state.narrator_done,
    day_unlock_time: state.dayUnlockTime,
  }, { onConflict: 'user_id' })
}

export async function resetGameState() {
  const { data: { user } } = await supabase().auth.getUser()
  if (!user) return
  await supabase().from('game_state').delete().eq('user_id', user.id)
  await supabase().from('dm_messages').delete().eq('user_id', user.id)
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
    const hook: DMMessage = { role: 'char', text: DM_HOOKS[charId] }
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
  gameState?: { char: string | null; meters: { fame: number; trust: number; heat: number }; choices: string[]; situation: number }
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
        current_day: gameState ? Math.ceil((gameState.situation + 1) / 3) : 1,
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
  const arr = DM_MOCK[charId]
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Meter helpers ─────────────────────────────────────────────────────────────
export function clamp(n: number) { return Math.max(0, Math.min(100, Math.round(n))) }

export function applyDeltas(meters: Meters, deltas: Meters): Meters {
  return {
    fame:  clamp(meters.fame  + deltas.fame),
    trust: clamp(meters.trust + deltas.trust),
    heat:  clamp(meters.heat  + deltas.heat),
  }
}

export function charMeters(charId: CharId): Meters {
  const c = CHARS[charId]
  return { fame: c.fame, trust: c.trust, heat: c.heat }
}
