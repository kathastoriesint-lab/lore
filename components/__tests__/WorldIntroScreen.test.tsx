import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppContext } from '@/lib/context'
import WorldIntroScreen from '@/components/screens/WorldIntroScreen'
import type { AppCtx } from '@/lib/context'

function makeCtx(overrides: Partial<AppCtx> = {}): AppCtx {
  return {
    screen: 'world-intro',
    prevScreen: null,
    dmChar: null,
    saveProfile: vi.fn(),
    game: { playerName: 'Test', playerGender: 'male', world: 'creator-house' as const, char: null, situation: 0, situationQueue: [], choices: [], meters: { fame: 20 }, flags: { mentorTrust:0, hypeRisk:0, roleAcceptance:0, homeGrounding:0, allyLoyalty:0, rivalryScore:0 }, runMemory: {}, narrator_done: false, dayUnlockTime: {} },
    dmHistory: {},
    dmLastUpdated: {},
    dmTrust: {},
    relationshipAlerts: [],
    charFame: {},
    likedPosts: new Set(),
    postComments: {},
    addPostComment: () => {},
    toast: null,
    viewingCharId: null,
    impactNotif: null,
    showImpact: vi.fn(),
    pendingPostReveal: null,
    setPendingPostReveal: vi.fn(),
    upsertAiPost: vi.fn(),
    dmNotif: null,
    notifyDM: vi.fn(),
    followerReceipt: null,
    showFollowerReceipt: vi.fn(),
    hudReaction: null,
    setHudReaction: vi.fn(),
    likePost: vi.fn(),
    applyFeedDeltas: vi.fn(),
    injectCharDM: vi.fn(),
    setViewingChar: vi.fn(),
    advanceSituation: vi.fn(),
    navigate: vi.fn(),
    goBack: vi.fn(),
    showToast: vi.fn(),
    setChar: vi.fn(),
    startGame: vi.fn(),
    startCricketGame: vi.fn(),
    dmBadgeCount: 0,
    clearDmBadge: vi.fn(),
    makeChoice: vi.fn(),
    sendDM: vi.fn(),
    openDMThread: vi.fn(),
    resetGame: vi.fn(),
    resolveSelection: vi.fn(),
    skipWeekWait: vi.fn(),
    dmStorySession: null,
    startDmStorySession: vi.fn(),
    resolveEviction: vi.fn(),
    ...overrides,
  }
}

function renderWithCtx(ctx: Partial<AppCtx> = {}) {
  const value = makeCtx(ctx)
  return { ...render(<AppContext.Provider value={value}><WorldIntroScreen /></AppContext.Provider>), value }
}

// The intro is now a full-bleed cinematic 3-card carousel (shared IntroCarousel):
// the top-right "Skip" jumps to the last card, which shows the "Enter the villa →"
// CTA. That CTA routes into the first beat (enter() → startGame() on a fresh run).
describe('WorldIntroScreen', () => {
  it('renders the Skip button on the first card', () => {
    renderWithCtx()
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument()
  })

  it('calls startGame when the Enter CTA is clicked (fresh run)', () => {
    const startGame = vi.fn()
    renderWithCtx({ startGame })
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
    fireEvent.click(screen.getByRole('button', { name: /Enter the villa/i }))
    expect(startGame).toHaveBeenCalled()
  })

  it('Skip jumps to the last card (the Enter the villa CTA appears)', () => {
    renderWithCtx()
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
    expect(screen.getByRole('button', { name: /Enter the villa/i })).toBeInTheDocument()
  })
})
