import { describe, it, expect } from 'vitest'
import {
  clamp, applyDeltas, fameToFollowers, resolveEnding, resolveTokens, charMeters, migrateMeters,
} from '../game'

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
  // Two-ending model (2026-07): followers(fame) vs crush bond; fame >= bond → main.
  it('returns main when followers lead the crush bond', () => {
    expect(resolveEnding(80, 40)).toBe('main')
  })
  it('returns heart when the crush bond leads', () => {
    expect(resolveEnding(40, 80)).toBe('heart')
  })
  it('ties to main when followers === bond', () => {
    expect(resolveEnding(50, 50)).toBe('main')
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
})

describe('charMeters', () => {
  it('returns default CH meters (fame only) for any charId', () => {
    expect(charMeters('ria')).toEqual({ fame: 20 })
  })
})
