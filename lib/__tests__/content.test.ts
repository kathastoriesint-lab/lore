import { describe, it, expect } from 'vitest'
import cricketBundled from '@/public/content/cricket-v1.json'
import { CRICKET_SITUATIONS, CRICKET_CHARS, CRICKET_ENDING_DATA } from '@/lib/cricket-data'
import { isValidCricketContent } from '@/lib/content'

// Drift guard: the committed JSON must match the TS authoring source. If someone
// edits lib/cricket-data.ts without re-running `npm run publish:content` (or the
// prebuild hook), this fails — catching a stale bundled fallback before ship.
describe('content publish round-trip', () => {
  it('published cricket JSON matches the TS source', () => {
    expect(cricketBundled.situations).toEqual(JSON.parse(JSON.stringify(CRICKET_SITUATIONS)))
    expect(cricketBundled.chars).toEqual(JSON.parse(JSON.stringify(CRICKET_CHARS)))
    expect(cricketBundled.endingData).toEqual(JSON.parse(JSON.stringify(CRICKET_ENDING_DATA)))
  })
})

// Fallback safety: a malformed remote publish must be rejected so the app keeps
// using last-known-good / bundled content instead of bricking.
describe('content validation', () => {
  it('accepts the bundled content (the fallback is always valid)', () => {
    expect(isValidCricketContent(cricketBundled)).toBe(true)
  })

  it('rejects malformed remote content', () => {
    expect(isValidCricketContent(null)).toBe(false)
    expect(isValidCricketContent({})).toBe(false)
    // empty situations
    expect(isValidCricketContent({ version: 1, situations: [], chars: {}, endingData: {} })).toBe(false)
    // a situation missing its choices array
    expect(isValidCricketContent({ version: 1, situations: [{ id: 'x' }], chars: {}, endingData: {} })).toBe(false)
    // bad version type
    expect(isValidCricketContent({ version: 'x', situations: cricketBundled.situations, chars: {}, endingData: {} })).toBe(false)
  })
})
