import { describe, it, expect } from 'vitest'
import {
  clamp, applyDeltas, fameToFollowers, resolveEnding, resolveTokens, charMeters, migrateMeters,
  snapshotWorld,
} from '../game'
import type { GameState } from '../types'

describe('clamp', () => {
  it('keeps value in 0-100', () => {
    expect(clamp(50)).toBe(50)
    expect(clamp(-5)).toBe(0)
    expect(clamp(105)).toBe(100)
    expect(clamp(0)).toBe(0)
    expect(clamp(100)).toBe(100)
  })
  it('rounds to nearest int', () => {
    expect(clamp(50.7)).toBe(51)
  })
})

describe('applyDeltas', () => {
  it('applies the CH fame delta (fame-only shape)', () => {
    expect(applyDeltas({ fame: 20 }, { fame: 5 })).toEqual({ fame: 25 })
  })
  it('applies cricket deltas per key (form/fame/trust)', () => {
    expect(applyDeltas({ form: 40, fame: 25, trust: 20 }, { form: 5, fame: -3, trust: 2 }))
      .toEqual({ form: 45, fame: 22, trust: 22 })
  })
  it('clamps at 0 and 100 and ignores absent keys', () => {
    expect(applyDeltas({ form: 2, fame: 98, trust: 50 }, { form: -10, fame: 10 }))
      .toEqual({ form: 0, fame: 100, trust: 50 })
  })
})

describe('fameToFollowers', () => {
  it('returns 0 followers at fame 0', () => {
    expect(fameToFollowers(0)).toBe(0)
  })
  it('returns positive follower count at fame > 0', () => {
    expect(fameToFollowers(20)).toBeGreaterThan(0)
    expect(fameToFollowers(100)).toBeGreaterThan(fameToFollowers(50))
  })
  it('scales superlinearly (fame 100 >> fame 50)', () => {
    expect(fameToFollowers(100)).toBeGreaterThan(fameToFollowers(50) * 2)
  })
})

describe('resolveEnding', () => {
  // CH v4 2×2 (followers × crush bond): fameHigh = fame>=45, bondHigh = bond>=55.
  it('won — both goals high', () => {
    expect(resolveEnding(70, 70)).toBe('won')
  })
  it('feedQueen — followers high, bond low', () => {
    expect(resolveEnding(70, 30)).toBe('feedQueen')
  })
  it('worthMore — bond high, followers low', () => {
    expect(resolveEnding(30, 70)).toBe('worthMore')
  })
  it('chewedUp — both low', () => {
    expect(resolveEnding(20, 20)).toBe('chewedUp')
  })
})

describe('migrateMeters', () => {
  it('maps an old cricket {fame,heat,image} row to {form,fame} (pooled trust dies)', () => {
    expect(migrateMeters({ fame: 40, heat: 25, image: 20 }, 'cricket')).toEqual({ form: 40, fame: 25 })
  })
  it('keeps only fame for a creator-house row', () => {
    expect(migrateMeters({ fame: 20, heat: 50, image: 30 }, 'creator-house')).toEqual({ fame: 20 })
  })
  it('strips the trust key from a refactor-era cricket row', () => {
    expect(migrateMeters({ form: 55, fame: 30, trust: 44 }, 'cricket')).toEqual({ form: 55, fame: 30 })
  })
  it('passes a v2 cricket row through unchanged', () => {
    expect(migrateMeters({ form: 55, fame: 30 }, 'cricket')).toEqual({ form: 55, fame: 30 })
  })
})

describe('resolveTokens', () => {
  it('replaces {name} with playerName', () => {
    expect(resolveTokens('Hello {name}!', 'Rohan', 'male')).toBe('Hello Rohan!')
  })
  it('uses Tum as fallback when name is empty', () => {
    expect(resolveTokens('Hello {name}!', '', 'male')).toBe('Hello Tum!')
  })
  it('resolves {crush} and {ally} for male', () => {
    const result = resolveTokens('{ally} aur {crush}', 'X', 'male')
    expect(result).toContain('Kabir')   // ally for male
    expect(result).toContain('Ananya')  // crush for male
  })
  it('resolves {crush} and {ally} for female', () => {
    const result = resolveTokens('{ally} aur {crush}', 'X', 'female')
    expect(result).toContain('Ananya')  // ally for female
    expect(result).toContain('Kabir')   // crush for female
  })
  it('strips a leaked LEADING stage-cue from a line', () => {
    expect(resolveTokens('(shaant) Jo hona hai ho jaayega.', 'X', 'male')).toBe('Jo hona hai ho jaayega.')
    expect(resolveTokens('(bahar se, voice note) Bhai ro mat', 'X', 'male')).toBe('Bhai ro mat')
  })
  it('never strips a numeric score or an inline mid-line aside', () => {
    expect(resolveTokens('Score (29) tha', 'X', 'male')).toBe('Score (29) tha')
    expect(resolveTokens('routine (parody hai relax) #Day1', 'X', 'male')).toBe('routine (parody hai relax) #Day1')
  })
})

describe('charMeters', () => {
  it('returns default CH meters (fame only) for any charId', () => {
    expect(charMeters('ria')).toEqual({ fame: 20 })
  })
})

describe('snapshotWorld (world-switch stash)', () => {
  const cricket = {
    playerName: 'Nabh', playerGender: 'male', avatarUrl: '/a.png',
    world: 'cricket', char: 'player',
    situation: 9, situationQueue: ['CR2-S1', 'CR2-S2'], choices: ['A', 'B'],
    meters: { form: 62, fame: 40 }, flags: {}, runMemory: { debutRuns: 40 },
    narrator_done: true, dayUnlockTime: {}, week: 2,
    selections: { 'SEL-W1': 'started' }, benchedWeeks: [], gateResults: { 'CR2-S7': 'pass' },
    // cross-world shared blobs — must NOT be stashed
    dmTrust: { hardik: 55 }, likedPosts: ['p1'], postComments: { p2: 'gg' },
    stash: {},
  } as unknown as GameState

  it('captures the narrative fields (situation, meters, week, selections)', () => {
    const s = snapshotWorld(cricket)
    expect(s.situation).toBe(9)
    expect(s.meters).toEqual({ form: 62, fame: 40 })
    expect(s.week).toBe(2)
    expect(s.selections).toEqual({ 'SEL-W1': 'started' })
    expect(s.gateResults).toEqual({ 'CR2-S7': 'pass' })
    expect(s.world).toBe('cricket')
  })

  it('excludes identity + cross-world shared blobs (dmTrust/likes/stash)', () => {
    const s = snapshotWorld(cricket) as Record<string, unknown>
    expect('playerName' in s).toBe(false)
    expect('playerGender' in s).toBe(false)
    expect('avatarUrl' in s).toBe(false)
    expect('dmTrust' in s).toBe(false)
    expect('likedPosts' in s).toBe(false)
    expect('postComments' in s).toBe(false)
    expect('stash' in s).toBe(false)
  })

  it('round-trips: restoring the snapshot recovers the world exactly', () => {
    const stashed = snapshotWorld(cricket)
    // simulate switching to CH then back: identity is kept, narrative restored
    const restored = { playerName: 'Nabh', playerGender: 'male', world: 'creator-house', situation: 0, ...stashed } as GameState
    expect(restored.world).toBe('cricket')
    expect(restored.situation).toBe(9)
    expect(restored.meters).toEqual({ form: 62, fame: 40 })
    expect(restored.playerName).toBe('Nabh')
  })
})
