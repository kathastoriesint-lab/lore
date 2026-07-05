import { describe, it, expect } from 'vitest'
import { chStorySummary } from '@/lib/creator-house'
import type { GameState } from '@/lib/types'

// Minimal CH game state; only the fields chStorySummary reads matter.
function chGame(over: Partial<Omit<GameState, 'flags'>> & { flags?: Record<string, number> } = {}): GameState {
  return {
    world: 'creator-house',
    playerName: 'Arjun',
    playerGender: 'male',
    char: 'player',
    situation: 0,
    situationQueue: [],   // falls back to full CH beat order
    choices: [],
    meters: { fame: 25 },
    flags: {},
    ...over,
  } as unknown as GameState
}

describe('chStorySummary — CH DM arc context', () => {
  it('grounds a Day-1 DM even before any choice (never null/empty)', () => {
    const s = chStorySummary(chGame(), {})
    expect(s).toBeTruthy()
    expect(s).toContain('Day 1 of 10')
    expect(s.toLowerCase()).toContain('followers')
    expect(s).toContain('CURRENT SITUATION')
    // No choices yet → no history section.
    expect(s).not.toContain('WHAT HAS HAPPENED')
  })

  it('names the crush by player gender (male → Ananya, female → Kabir)', () => {
    expect(chStorySummary(chGame({ playerGender: 'male' }), {})).toContain('Ananya')
    expect(chStorySummary(chGame({ playerGender: 'female' }), {})).toContain('Kabir')
  })

  it('resolves {crush} tokens in the current beat title (no raw tokens leak)', () => {
    // situation 6 == D3-1 "{crush} Ka Collab" in the v4 beat order.
    const s = chStorySummary(chGame({ situation: 6 }), {})
    expect(s).toContain('Ananya Ka Collab')
    expect(s).not.toContain('{crush}')
    expect(s).not.toContain('{x|')
  })

  it('lists what has happened once choices exist', () => {
    const s = chStorySummary(chGame({ situation: 2, choices: ['A', 'B'] }), {})
    expect(s).toContain('WHAT HAS HAPPENED')
    expect(s).toContain('Pehla Kadam') // D1-1, the first beat title
  })

  it('reflects the ally-evicted branch', () => {
    const s = chStorySummary(chGame({ flags: { allyEvicted: 1 }, situation: 12 }), {})
    expect(s).toContain('EVICTED')
    expect(s).toContain('Kabir') // male player's ally
  })

  it('reflects the ally-saved branch (Dev evicted instead)', () => {
    const s = chStorySummary(chGame({ flags: { savedAlly: 1 }, situation: 12 }), {})
    expect(s).toContain('SHIELD')
    expect(s).toContain('Dev was evicted')
  })
})
