import { describe, it, expect } from 'vitest'
import { derivePosts, deriveBeatBuzz, deriveOvernightPosts, type FeedPost } from '../feed-posts'
import { getCricketSituations } from '../content'
import type { GameState } from '../types'

// The feed's real assembly (mirrors FeedScreen.completedPosts): one flat list of
// every post, sorted newest-first by each post's canonical `ageMinutes`.
function assembleFeed(game: GameState): FeedPost[] {
  return [...derivePosts(game), ...deriveBeatBuzz(game), ...deriveOvernightPosts(game)]
    .sort((a, b) => (a.ageMinutes ?? 0) - (b.ageMinutes ?? 0))
}

function buildGame(playedCount: number, week: number, extra: Partial<GameState> = {}): GameState {
  const queue = getCricketSituations().map(s => s.id)
  return {
    playerName: 'Arjun', playerGender: 'male', world: 'cricket', char: 'player',
    situation: playedCount, situationQueue: queue,
    choices: Array.from({ length: playedCount }, () => 'A'),
    meters: { form: 55, fame: 40 } as GameState['meters'],
    flags: { mentorTrust: 0, hypeRisk: 0, roleAcceptance: 0, homeGrounding: 0, allyLoyalty: 0, rivalryScore: 0 },
    runMemory: { debutRuns: 52, debutBalls: 30 }, narrator_done: true, dayUnlockTime: {}, benchedWeeks: [],
    dmTrust: { hardik: 40 }, week, ...extra,
  } as GameState
}

describe('feed ordering — newest post on top, by time posted', () => {
  it('ages are monotonically non-decreasing down the feed (no older post sits above a newer one)', () => {
    const feed = assembleFeed(buildGame(6, 2, { selections: { 'SEL-W1': 'started' } }))
    expect(feed.length).toBeGreaterThan(1)
    for (let i = 1; i < feed.length; i++) {
      expect(feed[i].ageMinutes ?? 0).toBeGreaterThanOrEqual(feed[i - 1].ageMinutes ?? 0)
    }
  })

  it('the very top post is the freshest — and belongs to the latest beat', () => {
    const feed = assembleFeed(buildGame(6, 2, { selections: { 'SEL-W1': 'started' } }))
    const minAge = Math.min(...feed.map(p => p.ageMinutes ?? 0))
    expect(feed[0].ageMinutes ?? 0).toBe(minAge)   // top = freshest
    expect(feed[0].stepIndex).toBe(5)              // latest beat = choices.length - 1 (buzz shares this stepIndex)
  })

  it('fan buzz sits just under your own post, never above it', () => {
    const feed = assembleFeed(buildGame(6, 2, { selections: { 'SEL-W1': 'started' } }))
    const buzz = feed.filter(p => p.postId.startsWith('buzz-'))
    expect(buzz.length).toBeGreaterThan(0)
    // every buzz post is at least as old as the freshest post (age 0), i.e. below the top
    for (const b of buzz) expect(b.ageMinutes ?? 0).toBeGreaterThan(0)
  })

  it('overnight "last night" storm stays monotonic — sits at the week seam, not jumbled', () => {
    // 12 beats played (into week 3): the overnight storm about last week should
    // land BETWEEN this-week's fresh beats and last-week's older ones.
    const feed = assembleFeed(buildGame(12, 3, {
      selections: { 'SEL-W1': 'started', 'SEL-W2': 'started' },
      gateResults: { 'CR2-S7': 'pass' },
    }))
    const overnight = feed.filter(p => p.postId.startsWith('overnight-'))
    expect(overnight.length).toBeGreaterThan(0)
    // monotonic through the whole feed, overnight included
    for (let i = 1; i < feed.length; i++) {
      expect(feed[i].ageMinutes ?? 0).toBeGreaterThanOrEqual(feed[i - 1].ageMinutes ?? 0)
    }
    // overnight is older than the freshest post but newer than the oldest post
    const ages = feed.map(p => p.ageMinutes ?? 0)
    for (const o of overnight) {
      expect(o.ageMinutes ?? 0).toBeGreaterThan(ages[0])
      expect(o.ageMinutes ?? 0).toBeLessThan(ages[ages.length - 1])
    }
  })
})
