import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ChoiceSheet from '@/components/ChoiceSheet'

// Guards the shared Live choice surface that BOTH worlds (cricket + Creator House)
// render through. A regression here would break the flagship cricket choice flow,
// so this test gates the ChoiceSheet extraction.
const CHOICES = [
  { trueIdx: 0, t: 'Energy dikhao', s: 'Bond fast' },
  { trueIdx: 1, t: 'Read the room', s: 'Observe first' },
]
const SOCIAL = { total: 4358, pctA: 52 }

describe('ChoiceSheet (shared cricket + Creator House Live surface)', () => {
  it('collapsed: peeks the question as a button; tapping it opens the sheet', () => {
    const onOpen = vi.fn()
    render(
      <ChoiceSheet question="Pehli entry kaise?" choices={CHOICES} sheetOpen={false}
        onOpen={onOpen} onChoose={vi.fn()} social={SOCIAL} isResult={false} />
    )
    // collapsed → the question is carried by a single accent peek button that opens the sheet
    const peek = screen.getByRole('button', { name: /Pehli entry kaise/ })
    fireEvent.click(peek)
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('expanded: shows the question header, both choices, and social proof', () => {
    render(
      <ChoiceSheet question="Pehli entry kaise?" choices={CHOICES} sheetOpen={true}
        onOpen={vi.fn()} onChoose={vi.fn()} social={SOCIAL} isResult={false} />
    )
    expect(screen.getByRole('button', { name: /Energy dikhao/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Read the room/ })).toBeTruthy()
    expect(screen.getByText(/4,358 played · 52% chose A/)).toBeTruthy()
  })

  it('expanded: picking a choice fires onChoose with the TRUE index (not display order)', () => {
    const onChoose = vi.fn()
    // display order swapped: the visually-first card carries trueIdx 1
    const swapped = [
      { trueIdx: 1, t: 'Read the room', s: 'Observe first' },
      { trueIdx: 0, t: 'Energy dikhao', s: 'Bond fast' },
    ]
    render(
      <ChoiceSheet question="Q?" choices={swapped} sheetOpen={true}
        onOpen={vi.fn()} onChoose={onChoose} social={null} isResult={false} />
    )
    fireEvent.click(screen.getByRole('button', { name: /Read the room/ }))
    expect(onChoose).toHaveBeenCalledWith(1)
  })

  it('result: renders the world-specific result content (children), not the choices', () => {
    render(
      <ChoiceSheet question="Q?" choices={CHOICES} sheetOpen={false}
        onOpen={vi.fn()} onChoose={vi.fn()} social={SOCIAL} isResult={true}>
        <div>RESULT CONTENT</div>
      </ChoiceSheet>
    )
    expect(screen.getByText('RESULT CONTENT')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Energy dikhao/ })).toBeNull()
  })
})
