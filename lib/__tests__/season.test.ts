import { describe, it, expect } from 'vitest'
import {
  SEASON_WEEKS, weekForSituationId, isWeekEnd, snapToWeekStart,
  INTERLUDE_CAPS, SENIORS, DM_DAILY_BUDGET,
} from '@/lib/season'
import { SELECTION_TRIGGERS } from '@/lib/cricket-selection'

// The v2 season queue is SEASON_WEEKS itself (content ships in Phase 5; the
// drift guard against cricket-data lives in content.test.ts).
const queue = SEASON_WEEKS.flatMap(w => w.situationIds)

describe('season structure (v2 — 3 match weeks)', () => {
  it('is 14 beats across 3 weeks, each id unique and CR2-prefixed', () => {
    expect(SEASON_WEEKS).toHaveLength(3)
    expect(queue).toHaveLength(14)
    expect(new Set(queue).size).toBe(14)
    expect(queue.every(id => id.startsWith('CR2-S'))).toBe(true)
  })

  it('maps situation ids to their week', () => {
    expect(weekForSituationId('CR2-S1')).toBe(1)
    expect(weekForSituationId('CR2-S7')).toBe(2)  // the debut knock
    expect(weekForSituationId('CR2-S14')).toBe(3) // the India verdict
  })

  it('every selection trigger is the beat BEFORE its week-crossing (ceremony sits between)', () => {
    for (const [sitId, selId] of Object.entries(SELECTION_TRIGGERS)) {
      const idx = queue.indexOf(sitId)
      expect(idx).toBeGreaterThanOrEqual(0)
      const week = weekForSituationId(sitId)
      expect(selId).toBe(`SEL-W${week}`)
      // The next beat is the verdict-variant beat of the SAME week (W1/W2) or the
      // eliminator (W3) — either way it exists.
      expect(queue[idx + 1]).toBeDefined()
    }
  })

  it('detects week-end boundaries on the queue', () => {
    // Week 1 = S1..S5 → index 4 ends it
    expect(isWeekEnd(queue, 4)).toBe(true)
    expect(isWeekEnd(queue, 3)).toBe(false)
    // Last beat of the season is also a week end
    expect(isWeekEnd(queue, queue.length - 1)).toBe(true)
  })

  it('snaps an in-flight save to its week start', () => {
    expect(snapToWeekStart(queue, 0)).toEqual({ index: 0, week: 1 })
    // CR2-S8 (index 7) is mid-week-2 → snaps to CR2-S6 (index 5)
    expect(snapToWeekStart(queue, 7)).toEqual({ index: 5, week: 2 })
  })
})

describe('grind loop (selection windows)', () => {

  it('DM economy: daily free-chat budget is defined and sane', () => {
    expect(DM_DAILY_BUDGET).toBeGreaterThanOrEqual(5)
    expect(DM_DAILY_BUDGET).toBeLessThanOrEqual(30)
  })

  it('chat trust is the trust surface (generic trust-moments removed)', () => {
    expect(INTERLUDE_CAPS.chatTrustPerChar).toBe(4)
    expect(SENIORS).toContain('hardik')
  })
})
