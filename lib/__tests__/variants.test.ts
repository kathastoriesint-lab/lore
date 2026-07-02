import { describe, it, expect } from 'vitest'
import { matchCond, resolveVariantIndex, applyVariant, resolveSituationVariant, resolveSituationForReplay, variantCtxFor, type VariantCtx } from '../variants'
import type { Situation } from '../types'
import { DEFAULT_FLAGS } from '../game'

const ctx = (over: Partial<VariantCtx> = {}): VariantCtx => ({
  weekVerdict: undefined,
  dmTrust: {},
  flags: { ...DEFAULT_FLAGS },
  gateResults: {},
  ...over,
})

const CHOICE = (t: string) => ({ t, s: '', deltas: { fame: 1 } })

const baseSit = (over: Partial<Situation> = {}): Situation => ({
  id: 'CR2-S7', day: 5, slot: 'Night', tag: '⚡ WANKHEDE', title: 'Pehli Gend',
  body: [], q: 'Kya karte ho?',
  choices: [CHOICE('A-base'), CHOICE('B-base')] as Situation['choices'],
  ...over,
})

describe('matchCond', () => {
  it('matches selection verdicts (benched / started / lifeline)', () => {
    expect(matchCond({ benched: true }, ctx({ weekVerdict: 'benched' }))).toBe(true)
    expect(matchCond({ benched: true }, ctx({ weekVerdict: 'started' }))).toBe(false)
    // started covers both playing verdicts
    expect(matchCond({ started: true }, ctx({ weekVerdict: 'started' }))).toBe(true)
    expect(matchCond({ started: true }, ctx({ weekVerdict: 'lifeline' }))).toBe(true)
    expect(matchCond({ started: true }, ctx({ weekVerdict: 'benched' }))).toBe(false)
    expect(matchCond({ lifeline: true }, ctx({ weekVerdict: 'lifeline' }))).toBe(true)
    expect(matchCond({ lifeline: true }, ctx({ weekVerdict: 'started' }))).toBe(false)
  })
  it('matches charTrust bands (gte / lt)', () => {
    expect(matchCond({ charTrust: { charId: 'rohit', gte: 46 } }, ctx({ dmTrust: { rohit: 50 } }))).toBe(true)
    expect(matchCond({ charTrust: { charId: 'rohit', gte: 46 } }, ctx({ dmTrust: { rohit: 45 } }))).toBe(false)
    expect(matchCond({ charTrust: { charId: 'rohit', lt: 46 } }, ctx({ dmTrust: { rohit: 30 } }))).toBe(true)
    // unknown senior never matches (no accidental variant on missing data)
    expect(matchCond({ charTrust: { charId: 'rohit', lt: 46 } }, ctx())).toBe(false)
  })
  it('matches flags and persisted gate results', () => {
    expect(matchCond({ flag: { key: 'pressCocky', gte: 1 } }, ctx({ flags: { ...DEFAULT_FLAGS, pressCocky: 1 } }))).toBe(true)
    expect(matchCond({ flag: { key: 'pressCocky', gte: 1 } }, ctx())).toBe(false)
    expect(matchCond({ gate: { sitId: 'CR2-S7', is: 'pass' } }, ctx({ gateResults: { 'CR2-S7': 'pass' } }))).toBe(true)
    expect(matchCond({ gate: { sitId: 'CR2-S7', is: 'pass' } }, ctx({ gateResults: { 'CR2-S7': 'fail' } }))).toBe(false)
    expect(matchCond({ gate: { sitId: 'CR2-S7', is: 'fail' } }, ctx())).toBe(false)
  })
  it('requires ALL specified keys to hold', () => {
    const c = { benched: true, charTrust: { charId: 'hardik', gte: 46 } }
    expect(matchCond(c, ctx({ weekVerdict: 'benched', dmTrust: { hardik: 50 } }))).toBe(true)
    expect(matchCond(c, ctx({ weekVerdict: 'benched', dmTrust: { hardik: 40 } }))).toBe(false)
  })
})

describe('resolveSituationVariant', () => {
  const sit = baseSit({
    variants: [
      { when: { benched: true }, title: 'Dugout Se', choices: [CHOICE('A-bench'), CHOICE('B-bench')] as Situation['choices'] },
      { when: { charTrust: { charId: 'rohit', gte: 46 } }, title: 'Rohit Ka 6 AM' },
    ],
  })
  it('applies the FIRST matching variant', () => {
    const out = resolveSituationVariant(sit, ctx({ weekVerdict: 'benched', dmTrust: { rohit: 60 } }))
    expect(out.title).toBe('Dugout Se')
    expect(out.choices[0].t).toBe('A-bench')
  })
  it('falls through to later variants, keeps base fields not overlaid', () => {
    const out = resolveSituationVariant(sit, ctx({ weekVerdict: 'started', dmTrust: { rohit: 60 } }))
    expect(out.title).toBe('Rohit Ka 6 AM')
    expect(out.choices[0].t).toBe('A-base') // variant had no choices override
  })
  it('returns the base beat when nothing matches', () => {
    expect(resolveSituationVariant(sit, ctx({ weekVerdict: 'started' })).title).toBe('Pehli Gend')
  })
  it('filters conditional reader lines (tone swaps)', () => {
    const s = baseSit({
      reader: [
        { t: 'nar', text: 'always' },
        { t: 'cue', who: 'Surya', text: 'tease', when: { flag: { key: 'hypeRisk', gte: 1 } } },
        { t: 'cue', who: 'Surya', text: 'neutral', when: { flag: { key: 'hypeRisk', gte: 99 } } },
      ],
    })
    const out = resolveSituationVariant(s, ctx({ flags: { ...DEFAULT_FLAGS, hypeRisk: 1 } }))
    expect(out.reader!.map(b => b.text)).toEqual(['always', 'tease'])
  })
})

describe('replay safety (variantSeen)', () => {
  const sit = baseSit({
    variants: [{ when: { charTrust: { charId: 'rohit', gte: 46 } }, title: 'Rohit Ka 6 AM', choices: [CHOICE('A-high'), CHOICE('B-high')] as Situation['choices'] }],
  })
  it('re-applies the persisted variant even when live trust has drifted', () => {
    // player chose while rohit trust was high; later it dropped below the band
    const out = resolveSituationForReplay(sit, { variantSeen: { 'CR2-S7': 0 } }, ctx({ dmTrust: { rohit: 20 } }))
    expect(out.title).toBe('Rohit Ka 6 AM')
    expect(out.choices[0].t).toBe('A-high')
  })
  it('persisted base (-1) wins over a live match', () => {
    const out = resolveSituationForReplay(sit, { variantSeen: { 'CR2-S7': -1 } }, ctx({ dmTrust: { rohit: 60 } }))
    expect(out.title).toBe('Pehli Gend')
  })
  it('falls back to live resolution when the beat has no persisted entry', () => {
    const out = resolveSituationForReplay(sit, {}, ctx({ dmTrust: { rohit: 60 } }))
    expect(out.title).toBe('Rohit Ka 6 AM')
  })
})

describe('variantCtxFor', () => {
  it('reads the week verdict from persisted selections', () => {
    const c = variantCtxFor(
      { selections: { 'SEL-W2': 'benched' }, flags: { ...DEFAULT_FLAGS }, gateResults: { x: 'pass' } },
      { hardik: 44 },
      2,
    )
    expect(c.weekVerdict).toBe('benched')
    expect(c.gateResults).toEqual({ x: 'pass' })
    expect(variantCtxFor({ selections: {}, flags: { ...DEFAULT_FLAGS } }, {}, 1).weekVerdict).toBeUndefined()
  })
})
