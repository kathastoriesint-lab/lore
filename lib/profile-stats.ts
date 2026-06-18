// Lightweight cross-world identity stats for the Global profile. Game state only
// holds the CURRENT world, so these accumulate in localStorage across worlds/runs.
const WORLDS_KEY = 'lore_worlds_entered'
const CHOICES_KEY = 'lore_total_choices'
const STREAK_KEY = 'lore_streak'
const LASTDAY_KEY = 'lore_last_day'

const ls = () => (typeof window !== 'undefined' ? window.localStorage : null)
const today = () => new Date().toISOString().slice(0, 10)
const yesterday = () => new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

/** Record that the player has entered a world (deduped). */
export function recordWorldEntered(world: string) {
  const s = ls(); if (!s) return
  try {
    const set = new Set<string>(JSON.parse(s.getItem(WORLDS_KEY) || '[]'))
    set.add(world)
    s.setItem(WORLDS_KEY, JSON.stringify([...set]))
  } catch { /* ignore */ }
}

/** Count one (or more) committed choices toward the lifetime total. */
export function bumpChoices(n = 1) {
  const s = ls(); if (!s) return
  try { s.setItem(CHOICES_KEY, String((parseInt(s.getItem(CHOICES_KEY) || '0', 10) || 0) + n)) } catch { /* ignore */ }
}

/** Call on boot: +1 streak on a new consecutive day, reset to 1 if a day was skipped. */
export function touchDayStreak() {
  const s = ls(); if (!s) return
  try {
    const last = s.getItem(LASTDAY_KEY)
    if (last === today()) return
    const prev = parseInt(s.getItem(STREAK_KEY) || '0', 10) || 0
    s.setItem(STREAK_KEY, String(last === yesterday() ? prev + 1 : 1))
    s.setItem(LASTDAY_KEY, today())
  } catch { /* ignore */ }
}

export interface ProfileStats { worlds: number; choices: number; streak: number }

export function getProfileStats(): ProfileStats {
  const s = ls()
  if (!s) return { worlds: 0, choices: 0, streak: 0 }
  let worlds = 0, choices = 0, streak = 0
  try { worlds = new Set<string>(JSON.parse(s.getItem(WORLDS_KEY) || '[]')).size } catch { /* ignore */ }
  try { choices = parseInt(s.getItem(CHOICES_KEY) || '0', 10) || 0 } catch { /* ignore */ }
  try { streak = parseInt(s.getItem(STREAK_KEY) || '0', 10) || 0 } catch { /* ignore */ }
  return { worlds, choices, streak }
}
