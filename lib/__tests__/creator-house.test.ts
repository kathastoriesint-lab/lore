import { describe, it, expect } from 'vitest'
import { buildEviction, playerStatusAt, evictionRisk } from '../creator-house'
import type { GameState } from '../types'

// Minimal game state for the Day-3 eviction (EV-D3 doesn't read loyalty/choices).
function gameWithTrust(image: number): GameState {
  return {
    playerName: 'Aria', playerGender: 'male', world: 'creator-house',
    char: 'player', situation: 0, situationQueue: [], choices: [],
    meters: { fame: 20, heat: 50, image },
    flags: { mentorTrust: 0, hypeRisk: 0, roleAcceptance: 0, homeGrounding: 0, allyLoyalty: 0, rivalryScore: 0 },
    runMemory: {}, narrator_done: true, dayUnlockTime: {},
    pendingEviction: 'EV-D3',
  } as GameState
}

describe('Creator House — TRUST drives eviction (Option B)', () => {
  it('player status tiers off the EV-D3 thresholds (line 28, floor 16)', () => {
    expect(playerStatusAt('EV-D3', 30)).toBe('safe')
    expect(playerStatusAt('EV-D3', 20)).toBe('risk')
    expect(playerStatusAt('EV-D3', 10)).toBe('critical')
  })

  it('TRUST safe → a housemate is evicted, player untouched', () => {
    const ev = buildEviction('EV-D3', gameWithTrust(30))!
    expect(ev.evicted).toBe('dev')
    expect(ev.playerEvicted).toBeFalsy()
    expect(ev.nominees).not.toContain('player')
  })

  it('TRUST at risk → player is nominated but survives (housemate still goes)', () => {
    const ev = buildEviction('EV-D3', gameWithTrust(20))!
    expect(ev.nominees).toContain('player')
    expect(ev.evicted).toBe('dev')         // you survive by a thread
    expect(ev.playerEvicted).toBeFalsy()
  })

  it('TRUST critical → the player is the one voted out', () => {
    const ev = buildEviction('EV-D3', gameWithTrust(10))!
    expect(ev.evicted).toBe('player')
    expect(ev.playerEvicted).toBe(true)
    expect(ev.nominees).toContain('player')
  })

  it('evictionRisk readout matches the day + threshold', () => {
    const r = evictionRisk(30, 1)!     // day 1 → next eviction is Din 3
    expect(r.day).toBe(3)
    expect(r.threshold).toBe(28)
    expect(r.status).toBe('safe')
    expect(evictionRisk(10, 1)!.status).toBe('critical')
  })
})
