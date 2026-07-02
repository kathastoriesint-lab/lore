import { describe, it, expect } from 'vitest'
import { buildEviction, playerStatusAt, evictionRisk, evictionTrust } from '../creator-house'
import type { GameState } from '../types'

// Eviction pressure now reads the ALLY BOND (kabir for a male player), not the old
// image/trust meter. With no choices, computeBond(ally).bond == dmTrust[ally], so we
// seed the target bond directly via dmTrust. EV-D3 thresholds: safe >=45, floor 30.
function gameWithBond(bond: number): GameState {
  return {
    playerName: 'Aria', playerGender: 'male', world: 'creator-house',
    char: 'player', situation: 0, situationQueue: [], choices: [],
    meters: { fame: 20 },
    dmTrust: { kabir: bond },   // ally for a male player
    flags: { mentorTrust: 0, hypeRisk: 0, roleAcceptance: 0, homeGrounding: 0, allyLoyalty: 0, rivalryScore: 0 },
    runMemory: {}, narrator_done: true, dayUnlockTime: {},
    pendingEviction: 'EV-D3',
  } as GameState
}

describe('Creator House — ally bond drives eviction (psychological only)', () => {
  it('evictionTrust reads the ally bond from dmTrust', () => {
    expect(evictionTrust(gameWithBond(62))).toBe(62)
  })

  it('player status tiers off the EV-D3 thresholds (45 / floor 30)', () => {
    expect(playerStatusAt('EV-D3', 60)).toBe('safe')
    expect(playerStatusAt('EV-D3', 38)).toBe('risk')
    expect(playerStatusAt('EV-D3', 20)).toBe('critical')
  })

  it('bond safe → a housemate is evicted, player untouched', () => {
    const ev = buildEviction('EV-D3', gameWithBond(60))!
    expect(ev.evicted).toBe('dev')
    expect(ev.playerEvicted).toBeFalsy()
    expect(ev.nominees).not.toContain('player')
  })

  it('bond at risk → player is nominated but survives (housemate still goes)', () => {
    const ev = buildEviction('EV-D3', gameWithBond(38))!
    expect(ev.nominees).toContain('player')
    expect(ev.evicted).toBe('dev')         // you survive by a thread
    expect(ev.playerEvicted).toBeFalsy()
  })

  it('bond critical → player leads the vote but the audience saves them (never evicted)', () => {
    const ev = buildEviction('EV-D3', gameWithBond(20))!
    expect(ev.nominees).toContain('player')   // your name is on the block
    expect(ev.evicted).toBe('dev')            // an NPC still goes — psychological only
    expect(ev.playerEvicted).toBeFalsy()      // the player is NEVER evicted
    expect(ev.audience.player).toBeGreaterThan(35)
    expect(ev.audience.dev!).toBeGreaterThanOrEqual(ev.audience.player!)
  })

  it('evictionRisk readout matches the day + retuned threshold', () => {
    const r = evictionRisk(60, 1)!     // day 1 → next eviction is Day 3
    expect(r.day).toBe(3)
    expect(r.threshold).toBe(45)
    expect(r.status).toBe('safe')
    expect(evictionRisk(20, 1)!.status).toBe('critical')
  })
})
