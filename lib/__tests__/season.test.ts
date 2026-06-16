import { describe, it, expect } from 'vitest'
import {
  SEASON_WEEKS, weekForSituationId, isWeekEnd, snapToWeekStart,
  evaluateGate, getWeek, parseClockOverride, NET_SESSIONS, INTERLUDE_CAPS,
  TRUST_MOMENTS, trustMomentFor, SENIORS,
} from '@/lib/season'
import { CRICKET_SITUATIONS } from '@/lib/cricket-data'

// Same construction as buildCricketQueue (its require() doesn't resolve under vitest ESM)
const queue = CRICKET_SITUATIONS.filter(s => s.id !== 'CR-S28').map(s => s.id)

describe('season structure', () => {
  it('covers the full cricket queue exactly once (29 beats, CR-S28 excluded)', () => {
    const allIds = SEASON_WEEKS.flatMap(w => w.situationIds)
    expect(allIds).toHaveLength(29)
    expect(new Set(allIds).size).toBe(29)
    expect(allIds).not.toContain('CR-S28')
    // Every queue id belongs to a week, in queue order
    expect(allIds).toEqual(queue)
  })

  it('maps situation ids to their week', () => {
    expect(weekForSituationId('CR-S1')).toBe(1)
    expect(weekForSituationId('CR-S12')).toBe(3) // the debut beat
    expect(weekForSituationId('CR-S30')).toBe(7)
  })

  it('detects week-end boundaries on the real queue', () => {
    // CR-S4 is the last beat of week 1 → index 3
    expect(isWeekEnd(queue, 3)).toBe(true)
    expect(isWeekEnd(queue, 0)).toBe(false)
    expect(isWeekEnd(queue, 2)).toBe(false)
    // CR-S13 ends week 3 (5 beats: S9-S13) → index 12
    expect(queue[12]).toBe('CR-S13')
    expect(isWeekEnd(queue, 12)).toBe(true)
    // Last beat of the season is also a week end
    expect(isWeekEnd(queue, queue.length - 1)).toBe(true)
  })

  it('snaps an in-flight save to its week start', () => {
    expect(snapToWeekStart(queue, 0)).toEqual({ index: 0, week: 1 })
    // CR-S10 (index 9) is mid-week-3 → snaps to CR-S9 (index 8)
    expect(snapToWeekStart(queue, 9)).toEqual({ index: 8, week: 3 })
  })
})

describe('gate evaluation', () => {
  const meters = { fame: 50, heat: 30, image: 40 } // FORM 50, FAME 30, TRUST 40

  it('week 1 has no gate; weeks 2-7 all do', () => {
    expect(getWeek(1).gate).toHaveLength(0)
    for (let w = 2; w <= 7; w++) expect(getWeek(w).gate.length).toBeGreaterThan(0)
  })

  it('passes a met meter gate and fails an unmet one', () => {
    const w2 = evaluateGate(getWeek(2).gate, meters, {}) // FORM 45 needed, have 50
    expect(w2.passed).toBe(true)
    const w4 = evaluateGate(getWeek(4).gate, meters, {}) // FORM 60 needed, have 50
    expect(w4.passed).toBe(false)
    expect(w4.gaps[0]).toMatchObject({ label: 'FORM', current: 50, threshold: 60, surface: 'nets' })
  })

  it('reads per-character dmTrust for trust gates', () => {
    const w5 = getWeek(5).gate // rohit >= 50
    expect(evaluateGate(w5, meters, { rohit: 49 }).passed).toBe(false)
    expect(evaluateGate(w5, meters, { rohit: 50 }).passed).toBe(true)
    // hardik's trust doesn't satisfy a rohit gate
    expect(evaluateGate(w5, meters, { hardik: 90 }).passed).toBe(false)
  })

  it("week 7 (India call-up) needs Form + Hardik's trust; Fame is not required", () => {
    const w7 = getWeek(7).gate
    expect(w7).toHaveLength(2) // Fame dropped — selection is merit + captain's belief
    const good = { fame: 64, heat: 60, image: 10 } // FORM 64
    expect(evaluateGate(w7, good, { hardik: 55 }).passed).toBe(true)
    expect(evaluateGate(w7, good, { hardik: 54 }).passed).toBe(false)
    // it's pinned to Hardik now — another senior's trust doesn't satisfy it
    expect(evaluateGate(w7, good, { rohit: 99 }).passed).toBe(false)
    // Fame (heat slot) is no longer gated — zero Fame still passes if Form + Hardik met
    expect(evaluateGate(w7, { fame: 64, heat: 0, image: 0 }, { hardik: 55 }).passed).toBe(true)
    // Form short fails the whole gate
    expect(evaluateGate(w7, { ...good, fame: 63 }, { hardik: 60 }).passed).toBe(false)
  })

  it('week 7 is the only hard gate', () => {
    expect(SEASON_WEEKS.filter(w => w.hardGate).map(w => w.week)).toEqual([7])
  })
})

describe('lock clock + caps', () => {
  it('parses ?clock= overrides', () => {
    expect(parseClockOverride('5m')).toBe(300_000)
    expect(parseClockOverride('30s')).toBe(30_000)
    expect(parseClockOverride('2h')).toBe(7_200_000)
    expect(parseClockOverride(null)).toBeNull()
    expect(parseClockOverride('abc')).toBeNull()
  })

  it('nets schedule is diminishing and matches the session cap', () => {
    expect(INTERLUDE_CAPS.netGains).toHaveLength(INTERLUDE_CAPS.netSessions)
    expect(INTERLUDE_CAPS.netGains).toEqual([4, 2, 1])
  })

  it('trust moments exist for seniors, with a strong-positive and a weak/negative reply', () => {
    expect(TRUST_MOMENTS.length).toBeGreaterThanOrEqual(3)
    TRUST_MOMENTS.forEach(m => {
      expect(SENIORS).toContain(m.charId)
      expect(Math.max(...m.replies.map(r => r.delta))).toBeGreaterThanOrEqual(4)
      expect(Math.min(...m.replies.map(r => r.delta))).toBeLessThanOrEqual(0)
    })
    expect(trustMomentFor('rohit')).not.toBeNull()
    expect(trustMomentFor('tilak')).toBeNull()
  })

  it('has at least 3 authored net drills with both choice variants', () => {
    expect(NET_SESSIONS.length).toBeGreaterThanOrEqual(3)
    NET_SESSIONS.forEach(s => {
      expect(s.safe.note.length).toBeGreaterThan(20)
      expect(s.risky.pass.length).toBeGreaterThan(20)
      expect(s.risky.fail.length).toBeGreaterThan(20)
      expect(s.risky.threshold).toBeGreaterThan(0)
    })
  })
})
