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
    phone: '',
    setPhone: vi.fn(),
    saveProfile: vi.fn(),
    game: { playerName: 'Test', playerGender: 'male', world: 'creator-house' as const, char: null, situation: 0, choices: [], meters: { fame: 20, heat: 50, image: 30 }, narrator_done: false, dayUnlockTime: {} },
    dmHistory: {},
    dmTrust: {},
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
    ...overrides,
  }
}

function renderWithCtx(ctx: Partial<AppCtx> = {}) {
  const value = makeCtx(ctx)
  return { ...render(<AppContext.Provider value={value}><WorldIntroScreen /></AppContext.Provider>), value }
}

describe('WorldIntroScreen', () => {
  it('renders the Skip button', () => {
    renderWithCtx()
    expect(screen.getByText('Skip →')).toBeInTheDocument()
  })

  it('calls startGame when Enter button is clicked', () => {
    const startGame = vi.fn()
    renderWithCtx({ startGame })
    fireEvent.click(screen.getByText('Skip →'))
    fireEvent.click(screen.getByRole('button', { name: /Ghar mein aao/i }))
    expect(startGame).toHaveBeenCalled()
  })

  it('calls navigate worlds when Baad mein is clicked', () => {
    const navigate = vi.fn()
    renderWithCtx({ navigate })
    fireEvent.click(screen.getByText('Skip →'))
    fireEvent.click(screen.getByRole('button', { name: /Baad mein/i }))
    expect(navigate).toHaveBeenCalledWith('worlds')
  })
})
