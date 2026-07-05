import { describe, it, expect } from 'vitest'
import cricketBundled from '@/public/content/cricket-v15.json'
import chBundled from '@/public/content/creator-house-v4.json'
import { CRICKET_SITUATIONS, CRICKET_CHARS, CRICKET_ENDING_DATA } from '@/lib/cricket-data'
import { isValidCricketContent, isValidCHContent } from '@/lib/content'

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

  it('accepts the bundled Creator House content', () => {
    expect(isValidCHContent(chBundled)).toBe(true)
  })

  // Regression: a CH publish carrying valid situations/chars but missing an
  // accessor bundle key (postComments) once passed validation and crashed the
  // Feed at render via getCHPostComments().ria. The validator must now reject it
  // so the good bundled/LKG content stays live.
  it('rejects CH content missing accessor bundle keys', () => {
    const { postComments, ...missingPostComments } = chBundled as Record<string, unknown>
    void postComments
    expect(isValidCHContent(missingPostComments)).toBe(false)
    const { dossiers, ...missingDossiers } = chBundled as Record<string, unknown>
    void dossiers
    expect(isValidCHContent(missingDossiers)).toBe(false)
    const { dmOrder, ...missingDmOrder } = chBundled as Record<string, unknown>
    void dmOrder
    expect(isValidCHContent(missingDmOrder)).toBe(false)
  })
})
