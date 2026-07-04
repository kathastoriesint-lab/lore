// Season structure for the cricket world (Indian Dressing Room) — v2.
//
// 14 beats (CR2-S1..S14) across 3 Match Weeks. FREE-FLOW: no real-time locks.
// Each week's last regular beat triggers a SELECTION window (lib/cricket-selection):
// the player may grind (nets/DMs/feed — capped per window) and then taps into the
// squad-announcement ceremony. The verdict variant-keys the next beat.
//
// Two goals: FORM (meters.form) + CAPTAIN'S TRUST (dmTrust['hardik']).

export const SENIORS = ['rohit', 'hardik', 'bumrah', 'surya'] as const

export interface SeasonWeek {
  week: number
  name: string
  /** Situation ids belonging to this week, in queue order. */
  situationIds: string[]
}

export const SEASON_WEEKS: SeasonWeek[] = [
  { week: 1, name: 'Arrival',       situationIds: ['CR2-S1', 'CR2-S2', 'CR2-S3', 'CR2-S4', 'CR2-S5'] },
  { week: 2, name: 'The Debut',     situationIds: ['CR2-S6', 'CR2-S7', 'CR2-S8', 'CR2-S9', 'CR2-S10'] },
  { week: 3, name: 'The Reckoning', situationIds: ['CR2-S11', 'CR2-S12', 'CR2-S13', 'CR2-S14'] },
]

// ── DM economy ───────────────────────────────────────────────────────────────
// DMs are open all season (no interlude gating). Free-chat allowance per senior
// per real day — keeps threads alive daily without infinite grinding. Mission /
// story-injected exchanges don't consume it. v1-tunable.
export const DM_DAILY_BUDGET = 20

// ── Grind caps (per selection window; reset when a window opens) ─────────────
export const INTERLUDE_CAPS = {  chatTrustPerChar: 4,      // chat-trust cap per character per window (raised from 2
                            // when generic trust-moments were removed — the evening
                            // companion conversation is now the trust-building surface)
  captionPosts: 1,          // spicy +3 Fame / safe +1 Fame
  commentReplies: 3,        // +1 Fame each
} as const

export interface InterludeState {
  captionPosted: boolean
  repliesUsed: number
  /** Casual-chat trust earned this window, per character (for the cap). */
  chatTrustEarned: Record<string, number>
  /** Distinct characters chatted with this window (earn-a-skip slate). */
  charsChatted: string[]
}

export const FRESH_INTERLUDE: InterludeState = {
  captionPosted: false,
  repliesUsed: 0,
  chatTrustEarned: {},
  charsChatted: [],
}

// ── Nets micro-sessions (interlude Form grind) ───────────────────────────────
// 30-second scenes: one choice, threshold-gated narration. Form gain follows the
// on whether current Form clears its threshold — same drill reads differently
// at Form 30 vs Form 55, which is the free replay variation.

// ── Lookups ───────────────────────────────────────────────────────────────────
const idToWeek = new Map<string, number>()
SEASON_WEEKS.forEach(w => w.situationIds.forEach(id => idToWeek.set(id, w.week)))

/** Which week a situation id belongs to (1-based). */
export function weekForSituationId(id: string): number {
  return idToWeek.get(id) ?? 1
}

export function getWeek(week: number): SeasonWeek {
  return SEASON_WEEKS[Math.min(Math.max(week, 1), SEASON_WEEKS.length) - 1]
}

/** True if this queue index is the last beat of its week. */
export function isWeekEnd(queue: string[], index: number): boolean {
  const id = queue[index]
  if (!id) return false
  const w = weekForSituationId(id)
  const next = queue[index + 1]
  if (!next) return true // end of season
  return weekForSituationId(next) !== w
}

/** Map an in-flight save's queue index to the start index of its containing week. */
export function snapToWeekStart(queue: string[], index: number): { index: number; week: number } {
  const id = queue[Math.min(index, queue.length - 1)]
  const week = id ? weekForSituationId(id) : 1
  const startId = getWeek(week).situationIds[0]
  const startIdx = queue.indexOf(startId)
  return { index: startIdx >= 0 ? startIdx : 0, week }
}
