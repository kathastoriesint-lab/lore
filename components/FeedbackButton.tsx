'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'

const EMOJIS = ['🐛 Bug', '✨ Idea', '😍 Love it', '😤 Annoying', '❓ Confused']

export default function FeedbackButton() {
  const { screen, game } = useApp()
  const [devMode, setDevMode] = useState(false)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Only enable when ?dev=1 is in the URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDevMode(new URLSearchParams(window.location.search).has('dev'))
    }
  }, [])

  const handleOpen = useCallback(() => {
    setOpen(true)
    setSent(false)
    setText('')
    setTimeout(() => inputRef.current?.focus(), 150)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/feedback`,
        {
          method: 'POST',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            screen,
            world: game.world ?? 'creator-house',
            situation: game.situation,
            feedback: text.trim(),
            emoji: emoji.split(' ')[0],
          }),
        }
      )
      setSent(true)
      setText('')
      setTimeout(() => setOpen(false), 1800)
    } catch {
      // silent — don't block the user
    } finally {
      setSending(false)
    }
  }, [text, sending, screen, game.world, game.situation, emoji])

  if (!devMode) return null

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          style={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(255,45,120,.9)',
            backdropFilter: 'blur(8px)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            zIndex: 9999,
            boxShadow: '0 4px 20px rgba(255,45,120,.4)',
          }}
        >
          💬
        </button>
      )}

      {/* Feedback sheet */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8,8,15,.85)',
            backdropFilter: 'blur(16px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '0 0 env(safe-area-inset-bottom, 0)',
          }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div style={{
            background: '#16161e',
            borderRadius: '20px 20px 0 0',
            padding: '20px 20px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Feedback</div>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>
                  Screen: <span style={{ color: 'var(--accent)' }}>{screen}</span>
                  {' · '}Situation {game.situation + 1}
                  {game.world === 'cricket' ? ' · Cricket' : ' · Creator House'}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.08)', border: 'none', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Emoji type selector */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: `1px solid ${emoji === e ? 'var(--accent)' : 'rgba(255,255,255,.1)'}`,
                    background: emoji === e ? 'rgba(255,45,120,.12)' : 'transparent',
                    color: emoji === e ? 'var(--accent)' : 'var(--ink2)',
                    fontSize: 12,
                    fontWeight: emoji === e ? 700 : 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--sans)',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>

            {/* Text input */}
            {sent ? (
              <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 28 }}>
                ✅
                <div style={{ fontSize: 14, color: 'var(--ink2)', marginTop: 8 }}>Got it — thanks!</div>
              </div>
            ) : (
              <>
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="What's wrong or what could be better?"
                  rows={4}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,.06)',
                    border: '1px solid rgba(255,255,255,.12)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    color: '#fff',
                    fontSize: 15,
                    fontFamily: 'var(--sans)',
                    resize: 'none',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim() || sending}
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 14,
                    background: text.trim() ? 'var(--accent)' : 'rgba(255,45,120,.3)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: text.trim() ? 'pointer' : 'default',
                    fontFamily: 'var(--sans)',
                  }}
                >
                  {sending ? 'Sending...' : 'Send Feedback →'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
