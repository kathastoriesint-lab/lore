'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  /** Who's sliding into the DMs + the message they're "typing in". */
  notif: { id: string; name: string; text: string }
  /** Reply CTA — opens the live DM thread. */
  onOpen: () => void
  /** Swipe-down / backdrop — read later (dismiss the sheet). */
  onDismiss: () => void
}

// The "DM Arrival" moment (design handoff: lead with "types in", thumb zone).
// A bottom sheet rises over the dimmed screen, the character shows a typing
// indicator, then the message types itself out (~40 cps). When done, the Reply
// CTA breathes. Timing is setTimeout/setInterval + wall-clock counts so it stays
// correct even if the tab is backgrounded (entrance is transform-only).
export default function DMArrivalSheet({ notif, onOpen, onDismiss }: Props) {
  const [stage, setStage] = useState<'typing' | 'typed' | 'ready'>('typing')
  const [text, setText] = useState('')
  const [avBroken, setAvBroken] = useState(false)  // missing avatar → initials, never a broken-image icon
  const [writing, setWriting] = useState(false)
  const twRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const bootRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const full = notif.text
    // 1500ms typing indicator, then type the message out at ~40 cps.
    bootRef.current = setTimeout(() => {
      setStage('typed'); setText(''); setWriting(true)
      const start = performance.now(); const cps = 40
      twRef.current = setInterval(() => {
        const n = Math.min(full.length, Math.floor((performance.now() - start) / 1000 * cps) + 1)
        setText(full.slice(0, n))
        if (n >= full.length) {
          if (twRef.current) clearInterval(twRef.current)
          setWriting(false); setStage('ready')
        }
      }, 30)
    }, 1500)
    return () => {
      if (bootRef.current) clearTimeout(bootRef.current)
      if (twRef.current) clearInterval(twRef.current)
    }
  }, [notif.text])

  const ready = stage === 'ready'

  return (
    <>
      <div className="dma-backdrop" onClick={onDismiss} aria-hidden />
      <div className="dma-sheet" role="dialog" aria-label={`New message from ${notif.name}`}>
        <div className="dma-grab" />
        <div className="dma-row">
          <span className="dma-av">
            <span className="ring" />
            {avBroken
              ? <span className="dma-av-fb">{(notif.name?.[0] ?? '?').toUpperCase()}</span>
              : <img src={`/avatars/${notif.id}.png`} alt="" onError={() => setAvBroken(true)} />}
            <span className="on" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="dma-who">
              {notif.name}
              <span className="dma-tag">{stage === 'typing' ? 'is typing' : 'New DM'}</span>
              <span className="dma-now">now</span>
            </div>
            <div className="dma-prev">
              {stage === 'typing' ? (
                <>
                  <span className="ph0">message likh raha hai </span>
                  <span className="dma-dots"><i /><i className="b" /><i className="c" /></span>
                </>
              ) : (
                <span>{text}{writing && <span className="dma-caret" />}</span>
              )}
            </div>
          </div>
        </div>
        <button className={`dma-cta${ready ? '' : ' wait'}`} onClick={() => ready && onOpen()} disabled={!ready}>
          {ready ? (
            <>Reply to {notif.name}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </>
          ) : `${notif.name} type kar raha hai…`}
        </button>
        <button className="dma-dismiss" onClick={onDismiss}>Swipe down to read later</button>
      </div>
    </>
  )
}
