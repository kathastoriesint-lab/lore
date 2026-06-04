import { describe, it, expect } from 'vitest'
import {
  clamp, applyDeltas, fameToFollowers, resolveEnding, resolveTokens, charMeters,
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
  it('applies positive deltas', () => {
    const result = applyDeltas({ fame: 20, heat: 50, image: 30 }, { fame: 5, heat: -3, image: 2 })
    expect(result.fame).toBe(25)
    expect(result.heat).toBe(47)
    expect(result.image).toBe(32)
  })
  it('clamps at 0 and 100', () => {
    const result = applyDeltas({ fame: 2, heat: 98, image: 50 }, { fame: -10, heat: 10, image: 0 })
    expect(result.fame).toBe(0)
    expect(result.heat).toBe(100)
    expect(result.image).toBe(50)
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
  it('returns heart when heat is dominant and gap ≥ 8', () => {
    expect(resolveEnding({ fame: 40, heat: 80, image: 40 })).toBe('heart')
  })
  it('returns main when fame is dominant and gap ≥ 8', () => {
    expect(resolveEnding({ fame: 80, heat: 40, image: 40 })).toBe('main')
  })
  it('returns brand when image is dominant and gap ≥ 8', () => {
    expect(resolveEnding({ fame: 40, heat: 40, image: 80 })).toBe('brand')
  })
  it('returns dark when no meter dominates by gap ≥ 8', () => {
    expect(resolveEnding({ fame: 50, heat: 50, image: 50 })).toBe('dark')
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
  it('returns default meters for any charId', () => {
    const m = charMeters('ria')
    expect(m).toEqual({ fame: 20, heat: 50, image: 30 })
  })
})
