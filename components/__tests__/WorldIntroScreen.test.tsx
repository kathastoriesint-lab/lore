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
    game: { playerName: 'Test', playerGender: 'male', world: 'creator-house' as const, char: null, situation: 0, situationQueue: [], choices: [], meters: { fame: 20, heat: 50, image: 30 }, flags: { mentorTrust:0, hypeRisk:0, roleAcceptance:0, homeGrounding:0, allyLoyalty:0, rivalryScore:0 }, runMemory: {}, narrator_done: false, dayUnlockTime: {} },
    dmHistory: {},
    dmLastUpdated: {},
    dmTrust: {},
    relationshipAlerts: [],
    charFame: {},
    likedPosts: new Set(),
    toast: null,
    viewingCharId: null,
    impactNotif: null,
    showImpact: vi.fn(),
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
    resolveInterlude: vi.fn(),
    restartInterlude: vi.fn(),
    completeNetSession: vi.fn(),
    completeTrustMoment: vi.fn(),
    resolveEviction: vi.fn(),
    ...overrides,
  }
}

function renderWithCtx(ctx: Partial<AppCtx> = {}) {
  const value = makeCtx(ctx)
  return { ...render(<AppContext.Provider value={value}><WorldIntroScreen /></AppContext.Provider>), value }
}

// The intro is a 4-slide carousel: slides 0-2 show "Next →", the last slide shows
// the "Enter the House →" CTA and a bottom "Skip" (back to worlds).
const SLIDES = 4
const advanceToLastSlide = () => {
  for (let i = 0; i < SLIDES - 1; i++) fireEvent.click(screen.getByText('Next →'))
}

describe('WorldIntroScreen', () => {
  it('renders the Skip button', () => {
    renderWithCtx()
    expect(screen.getByText('Skip →')).toBeInTheDocument()
  })

  it('calls startGame when the Enter CTA is clicked', () => {
    const startGame = vi.fn()
    renderWithCtx({ startGame })
    advanceToLastSlide()
    fireEvent.click(screen.getByRole('button', { name: /Enter the House/i }))
    expect(startGame).toHaveBeenCalled()
  })

  it('navigates to worlds when the bottom Skip is clicked', () => {
    const navigate = vi.fn()
    renderWithCtx({ navigate })
    advanceToLastSlide()
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
    expect(navigate).toHaveBeenCalledWith('worlds')
  })
})
