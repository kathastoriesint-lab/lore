// Narrative timing for DM threads — gives the WhatsApp-style "DAY 2 · MORNING"
// section dividers + a per-message in-story clock ("9:02"). Times are NOT real
// wall-clock: they're derived from the story beat's day + phase so the thread
// reads cohesively under its day/phase badge. All fields are optional on
// DMMessage, so older (un-timed) messages render without a stamp.
import type { DMMessage } from './types'

export type DMTimeMeta = { day?: number; phase?: string; note?: string }

// Phase → base minute-of-day. Messages within a beat fan out a couple minutes each.
const PHASE_BASE: Record<string, number> = {
  MORNING: 9 * 60,    // 9:00
  AFTERNOON: 14 * 60, // 2:00
  EVENING: 19 * 60,   // 7:00
  NIGHT: 23 * 60,     // 11:00
}

export function phaseFromTag(tag?: string): string {
  const t = (tag || '').toUpperCase()
  if (t.includes('NIGHT') || t.includes('RAAT')) return 'NIGHT'
  if (t.includes('EVENING') || t.includes('SHAAM')) return 'EVENING'
  if (t.includes('AFTERNOON') || t.includes('NOON') || t.includes('DOPEHAR')) return 'AFTERNOON'
  return 'MORNING'
}

const TITLE: Record<string, string> = {
  MORNING: 'MORNING', AFTERNOON: 'AFTERNOON', EVENING: 'EVENING', NIGHT: 'NIGHT',
}
export const phaseLabel = (phase?: string) => TITLE[(phase || '').toUpperCase()] ?? 'MORNING'

// Minute-of-day → "9:02" (12-hour, no AM/PM — the phase divider supplies context).
export function fmtClock(t?: number): string {
  if (typeof t !== 'number') return ''
  const m = ((Math.round(t) % 1440) + 1440) % 1440
  let h = Math.floor(m / 60)
  const mm = m % 60
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${mm.toString().padStart(2, '0')}`
}

// Narrative timestamp for a NEW message appended to `history`.
// - Story message (meta has day+phase): anchored to the phase's base time and
//   nudged forward per message already in that day+phase segment. `note` rides
//   on the FIRST message of a new segment so the divider can show the event.
// - Free-chat message (no meta): continues a minute after the last timed message.
export function stampTime(
  history: DMMessage[],
  meta?: DMTimeMeta,
): Pick<DMMessage, 'day' | 'phase' | 't' | 'note'> {
  const last = [...history].reverse().find(m => typeof m.t === 'number')

  if (meta?.day && meta?.phase) {
    const base = PHASE_BASE[meta.phase] ?? 12 * 60
    const inSeg = history.filter(m => m.day === meta.day && m.phase === meta.phase).length
    let t = base + inSeg * 2
    if (last && typeof last.t === 'number' && last.t >= t) t = last.t + 1
    return {
      day: meta.day,
      phase: meta.phase,
      t,
      ...(inSeg === 0 && meta.note ? { note: meta.note } : {}),
    }
  }

  // Free-chat (a typed reply): anchor AFTER the STORY-latest message (max day,t),
  // not merely the array-last one. Messages can be injected out of arrival order
  // (that's why the thread sorts by day,t) — if array-last precedes the real latest,
  // a typed reply gets a timestamp that sorts into the MIDDLE and the message before
  // it appears to jump below it (reported bug).
  const storyLast = history.reduce<DMMessage | undefined>((best, m) => {
    if (typeof m.t !== 'number') return best
    if (!best) return m
    const md = m.day ?? 1, bd = best.day ?? 1
    return (md > bd || (md === bd && (m.t as number) > (best.t as number))) ? m : best
  }, undefined)

  if (storyLast && typeof storyLast.t === 'number') {
    return { day: storyLast.day ?? 1, phase: storyLast.phase ?? 'MORNING', t: storyLast.t + 1 }
  }

  return { day: 1, phase: 'MORNING', t: 9 * 60 }
}
