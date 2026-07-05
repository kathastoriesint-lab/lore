import { describe, it, expect } from 'vitest'
import { derivePosts } from '@/lib/feed-posts'
import type { GameState } from '@/lib/types'

function chGame(choices: ('A' | 'B')[]): GameState {
  return {
    world: 'creator-house',
    playerName: 'Arjun',
    playerGender: 'male',
    char: 'player',
    situation: choices.length,
    situationQueue: [],
    choices,
    meters: { fame: 25 },
    flags: {},
    dmTrust: {},
  } as unknown as GameState
}

// Regression: the gossip/commentary accounts (housewatch_india, creator.tea) carry
// no authored image in the v4 content, so before the CH fill map they rendered on a
// blank blue gradient. Every account post must now get a backdrop image.
describe('Creator House feed image fill', () => {
  it('backs every image-less gossip/account post with an image (no blank gradient)', () => {
    const posts = derivePosts(chGame(['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B']))
    const acctPosts = posts.filter(
      (p): p is Extract<typeof p, { type: 'authored' }> => p.type === 'authored' && p.owner.id === '__account',
    )
    expect(acctPosts.length).toBeGreaterThan(0)
    for (const p of acctPosts) {
      expect(p.imageUrl, `account post @${p.owner.handle} should carry an image`).toBeTruthy()
    }
    // and at least one draws from the new Creator House gossip/buzz pool
    expect(
      acctPosts.some(p => (p.imageUrl || '').includes('/generated/creator-house-posts/ch-feed-')),
    ).toBe(true)
  })

  it('female player: same fill holds (gender-resolved char + gossip accounts)', () => {
    const g = chGame(['A', 'B', 'A', 'B', 'A', 'B'])
    g.playerGender = 'female'
    const posts = derivePosts(g)
    const acctPosts = posts.filter(
      (p): p is Extract<typeof p, { type: 'authored' }> => p.type === 'authored' && p.owner.id === '__account',
    )
    for (const p of acctPosts) expect(p.imageUrl).toBeTruthy()
  })
})
