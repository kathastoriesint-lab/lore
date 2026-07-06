import { describe, it, expect } from 'vitest'
import { stampTime } from '@/lib/dm-time'
import type { DMMessage } from '@/lib/types'

const m = (role: 'me' | 'char', t: number, day = 1, phase = 'MORNING'): DMMessage =>
  ({ role, text: `msg@${t}`, day, phase, t })

describe('stampTime — a typed reply must land after the STORY-latest message', () => {
  it('in-order history: new reply = last.t + 1', () => {
    const history = [m('char', 540), m('me', 541), m('char', 543)]
    expect(stampTime(history).t).toBe(544)
  })

  it('OUT-OF-ORDER history: anchors to MAX t, never sorts into the middle (the reported bug)', () => {
    // Array-last is t=541, but the real story-latest is t=560 (injected out of order).
    const history = [m('char', 540), m('char', 560), m('me', 541)]
    const stamped = stampTime(history)
    expect(stamped.t).toBe(561) // max t + 1, not array-last+1 (542)
    // The typed reply sorts strictly after EVERY existing message — nothing jumps below it.
    expect(history.every(msg => (msg.t as number) < stamped.t!)).toBe(true)
  })

  it('continues the latest story DAY even if an earlier day was appended last', () => {
    const history = [m('char', 400, 2), m('char', 560, 1)] // day 2 is later story-time
    const stamped = stampTime(history)
    expect(stamped.day).toBe(2)
    expect(stamped.t).toBe(401)
  })

  it('empty history → 9:00 morning', () => {
    expect(stampTime([])).toMatchObject({ day: 1, phase: 'MORNING', t: 540 })
  })
})
