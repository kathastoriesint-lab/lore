import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppContext } from '@/lib/context'
import WorldIntroScreen from '@/components/screens/WorldIntroScreen'
import type { AppCtx } from '@/lib/context'

// Minimal context value for testing
function makeCtx(overrides: Partial<AppCtx> = {}): AppCtx {
  return {
    screen: 'world-intro',
    prevScreen: null,
    dmChar: null,
    game: { playerName: '', playerGender: 'male', char: null, situation: 0, choices: [], meters: { fame: 20, heat: 50, image: 30 }, narrator_done: false, dayUnlockTime: {} },
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

  it('does not call startGame when name is empty', () => {
    const startGame = vi.fn()
    const { value } = renderWithCtx({ startGame })
    // Skip to form
    fireEvent.click(screen.getByText('Skip →'))
    // Try to submit with empty name
    const btn = screen.getByRole('button', { name: /Enter the House/i })
    expect(btn).toBeDisabled()
    expect(startGame).not.toHaveBeenCalled()
  })

  it('calls startGame with trimmed name and gender on submit', () => {
    const startGame = vi.fn()
    renderWithCtx({ startGame })
    fireEvent.click(screen.getByText('Skip →'))
    const input = screen.getByPlaceholderText('Tumhara naam...')
    fireEvent.change(input, { target: { value: '  Rohan  ' } })
    fireEvent.click(screen.getByRole('button', { name: /Enter the House/i }))
    expect(startGame).toHaveBeenCalledWith('Rohan', 'male')
  })

  it('gender toggle switches between male and female', () => {
    const startGame = vi.fn()
    renderWithCtx({ startGame })
    fireEvent.click(screen.getByText('Skip →'))
    // default is male, switch to female
    fireEvent.click(screen.getByText('She / Her'))
    const input = screen.getByPlaceholderText('Tumhara naam...')
    fireEvent.change(input, { target: { value: 'Priya' } })
    fireEvent.click(screen.getByRole('button', { name: /Enter the House/i }))
    expect(startGame).toHaveBeenCalledWith('Priya', 'female')
  })
})
