import { describe, it, expect } from 'vitest'
import {
  SELECTION_RULES, SELECTION_TRIGGERS, resolveSelectionVerdict, isRecall,
  beatsToAnnouncement, captainTrust, captainTier, buildSelection, trustGateThreshold,
} from '../cricket-selection'
import { resolveCricketEnding } from '../cricket-rules'
import type { GameState } from '../types'

describe('captain helpers', () => {
  it('captainTrust reads hardik with the season default fallback', () => {
    expect(captainTrust({ hardik: 52 })).toBe(52)
    expect(captainTrust({})).toBe(30)
    expect(captainTrust(undefined)).toBe(30)
  })
  it('captainTier bands', () => {
    expect(captainTier(20)).toBe('Sceptical')
    expect(captainTier(35)).toBe('Watching')
    expect(captainTier(50)).toBe('Backing you')
    expect(captainTier(65)).toBe('Vouching')
  })
})

describe('resolveSelectionVerdict', () => {
  it('W1: winnable on story + nets alone', () => {
    expect(resolveSelectionVerdict(1, 52, 38)).toBe('started')     // form-focused path
    expect(resolveSelectionVerdict(1, 45, 45)).toBe('lifeline')    // captain covers the gap
    expect(resolveSelectionVerdict(1, 40, 23)).toBe('benched')     // neglectful path
  })
  it('W2: punishes form-only players on the captain bar', () => {
    expect(resolveSelectionVerdict(2, 68, 44)).toBe('benched')     // 68 form, no room — the lesson
    expect(resolveSelectionVerdict(2, 58, 50)).toBe('started')
    expect(resolveSelectionVerdict(2, 50, 58)).toBe('lifeline')    // captain stakes his name
  })
  it('W3: demands both — or the recall grind', () => {
    expect(resolveSelectionVerdict(3, 64, 58)).toBe('started')
    expect(resolveSelectionVerdict(3, 52, 64)).toBe('lifeline')
    expect(resolveSelectionVerdict(3, 55, 40)).toBe('benched')
    // benched at W2, ground form to the recall bar → forces the door open
    expect(resolveSelectionVerdict(3, 64, 40, [2])).toBe('started')
    expect(resolveSelectionVerdict(3, 63, 40, [2])).toBe('benched') // one short
  })
  it('isRecall marks only the forced-door path', () => {
    expect(isRecall(3, 64, 40, [2])).toBe(true)
    expect(isRecall(3, 70, 60, [2])).toBe(false)  // cleanly started — not a recall story
    expect(isRecall(3, 64, 40, [])).toBe(false)   // never benched
  })
})

describe('beatsToAnnouncement', () => {
  const queue = ['CR2-S1', 'CR2-S2', 'CR2-S3', 'CR2-S4', 'CR2-S5', 'CR2-S6']
  it('counts beats to the next selection trigger inclusively', () => {
    expect(beatsToAnnouncement(queue, 0)).toBe(4) // S1..S4
    expect(beatsToAnnouncement(queue, 3)).toBe(1) // on the trigger beat
  })
  it('null when no selection remains', () => {
    expect(beatsToAnnouncement(['CR2-S13', 'CR2-S14'], 0)).toBeNull()
  })
  it('trigger map covers the three weeks', () => {
    expect(Object.values(SELECTION_TRIGGERS).sort()).toEqual(['SEL-W1', 'SEL-W2', 'SEL-W3'])
  })
})

describe('buildSelection ceremony', () => {
  const game = (form: number, benchedWeeks: number[] = []): GameState => ({
    playerName: 'Arjun', playerGender: 'male', world: 'cricket', char: 'player',
    situation: 0, situationQueue: [], choices: [], meters: { form, fame: 30 } as GameState['meters'],
    flags: { mentorTrust: 0, hypeRisk: 0, roleAcceptance: 0, homeGrounding: 0, allyLoyalty: 0, rivalryScore: 0 },
    runMemory: {}, narrator_done: true, dayUnlockTime: {}, benchedWeeks,
  } as GameState)

  it('started: your name is on the sheet', () => {
    const s = buildSelection('SEL-W1', game(52), { hardik: 40 })!
    expect(s.verdict).toBe('started')
    expect(s.teamSheet.some(r => r.you)).toBe(true)
    expect(s.readout).toMatchObject({ form: 52, formNeed: 48, captain: 40, captainNeed: 34 })
  })
  it('benched: the rival takes the slot', () => {
    const s = buildSelection('SEL-W1', game(40), { hardik: 23 })!
    expect(s.verdict).toBe('benched')
    expect(s.teamSheet.some(r => r.you)).toBe(false)
    expect(s.teamSheet.map(r => r.name)).toContain('Naman Dhir')
  })
  it('lifeline: captain stakes his name', () => {
    const s = buildSelection('SEL-W2', game(50), { hardik: 58 })!
    expect(s.verdict).toBe('lifeline')
    expect(s.captainLine).toContain('Mera call')
  })
  it('W3 recall gets recall copy', () => {
    const s = buildSelection('SEL-W3', game(64, [2]), { hardik: 40 })!
    expect(s.verdict).toBe('started')
    expect(s.recall).toBe(true)
    expect(s.captainLine).toContain('Bench pe baith ke')
  })
  it('trustGateThreshold surfaces the captain bar for the DM goal card', () => {
    expect(trustGateThreshold('hardik', 2)).toBe(SELECTION_RULES[1].start.captain)
    expect(trustGateThreshold('rohit', 2)).toBeNull()
  })
})

describe('resolveCricketEnding (India verdict)', () => {
  it('the four endings resolve on form × captain × bench history', () => {
    expect(resolveCricketEnding(70, 60, 0)).toBe('indiaCall')
    expect(resolveCricketEnding(63, 62, 0)).toBe('captainsBet')   // DM-focused worked path
    expect(resolveCricketEnding(72, 46, 1)).toBe('statsMachine')  // form-only worked path
    expect(resolveCricketEnding(42, 15, 2)).toBe('notYet')        // neglectful worked path
  })
  it('bench history follows you', () => {
    expect(resolveCricketEnding(70, 58, 2)).toBe('notYet')        // benched twice, captain < 60 → forced
    expect(resolveCricketEnding(70, 62, 2)).toBe('captainsBet')   // captain ≥ 60 carries you anyway
    expect(resolveCricketEnding(70, 58, 1)).toBe('indiaCall')     // one bench is survivable
  })
  it('captain without form is a bet, not a call-up', () => {
    expect(resolveCricketEnding(52, 57, 0)).toBe('captainsBet')
    expect(resolveCricketEnding(45, 57, 0)).toBe('notYet')        // form too thin even for the bet
    expect(resolveCricketEnding(45, 62, 0)).toBe('captainsBet')   // unless he's all-in
  })
})
