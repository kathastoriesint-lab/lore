'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import type { CharId, DMMessage } from '@/lib/types'
import { CHARS, DM_TRUST, DM_QUICK } from '@/lib/data'

const StatusBar = () => (
  <div className="statusbar">
    <span>9:41</span>
    <span className="sb-right">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="#fff"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M1 4.2a11 11 0 0 1 14 0"/><path d="M3.6 6.9a7 7 0 0 1 8.8 0"/><path d="M6.1 9.5a3 3 0 0 1 3.8 0"/></svg>
      <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="1" y="1" width="20" height="10" rx="2.6" stroke="#fff" strokeOpacity=".45"/><rect x="2.6" y="2.6" width="14.5" height="6.8" rx="1.3" fill="#fff"/><rect x="22.4" y="4" width="1.6" height="4" rx="1" fill="#fff" fillOpacity=".45"/></svg>
    </span>
  </div>
)

export default function DMThreadScreen() {
  const { goBack, showToast, dmChar, dmHistory, sendDM } = useApp()

  const charId = dmChar as CharId | null
  const char = charId ? CHARS[charId] : null
  // Source of truth — render these directly, no local copy
  const messages: DMMessage[] = charId ? (dmHistory[charId] ?? []) : []

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)

  // Typewriter for last incoming char message only
  const [typewritingIdx, setTypewritingIdx] = useState<number | null>(null)
  const [typewrittenText, setTypewrittenText] = useState('')
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevLenRef = useRef(0)

  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    const el = chatRef.current
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
  }, [messages.length, typewrittenText, typing])

  // Detect new char message and start typewriter
  useEffect(() => {
    if (messages.length <= prevLenRef.current) {
      prevLenRef.current = messages.length
      return
    }
    prevLenRef.current = messages.length
    const lastIdx = messages.length - 1
    const lastMsg = messages[lastIdx]
    if (lastMsg?.role !== 'char') return

    // Start typewriter on this message
    setTypewritingIdx(lastIdx)
    setTypewrittenText('')
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
    const text = lastMsg.text
    const msPerChar = text.length > 120 ? 10 : 18
    let i = 0
    typingIntervalRef.current = setInterval(() => {
      i++
      setTypewrittenText(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(typingIntervalRef.current!)
        setTypewritingIdx(null)
      }
    }, msPerChar)
  }, [messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(async () => {
    if (!charId || !input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    setTyping(true)
    try {
      await sendDM(charId, text)
    } finally {
      setTyping(false)
      setSending(false)
    }
  }, [charId, input, sending, sendDM])

  const handleQuickChip = useCallback((text: string) => {
    setInput(text)
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }, [handleSend])

  if (!char || !charId) {
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', alignItems:'center', justifyContent:'center' }}>
        <div style={{ color:'var(--ink2)', fontSize:15 }}>No character selected</div>
        <button style={{ marginTop:16, color:'var(--accent)', fontWeight:600, padding:12 }} onClick={goBack}>Go back</button>
      </div>
    )
  }

  const trustVal = DM_TRUST[charId] ?? 50
  const quickChips = DM_QUICK[charId] ?? []

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <StatusBar />

      {/* Thread header */}
      <div className="appbar thread-head">
        <button className="icon-btn" onClick={goBack} style={{ flexShrink:0 }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div className={`av ${char.cls}`} style={{ width:30, height:30, fontSize:13, flexShrink:0 }}>{char.init}</div>
        <div className="tinfo">
          <div className="tn">{char.name}</div>
          <div className="tsub">Creator House · Online</div>
        </div>
        <button className="icon-btn" onClick={() => showToast('Video call coming soon 📹')}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
        </button>
      </div>

      {/* Trust meter */}
      <div className="dm-trust">
        <div className="tl"><span>TRUST LEVEL</span><span>{trustVal}%</span></div>
        <div className="bar"><i style={{ width:`${trustVal}%` }} /></div>
      </div>

      {/* Messages — render directly from context, no local copy */}
      <div className="chat" ref={chatRef}>
        {messages.map((msg, i) => {
          const isIn = msg.role === 'char'
          const isOut = msg.role === 'me'
          const prevMsg = i > 0 ? messages[i - 1] : null
          const showAvatar = isIn && (!prevMsg || prevMsg.role !== 'char')
          const isTypewriting = typewritingIdx === i

          return (
            <div key={i} style={{ display:'flex', flexDirection:'column' }}>
              {showAvatar && (
                <div className="msg-av">
                  <div className={`av ${char.cls}`} style={{ width:22, height:22, fontSize:10 }}>{char.init}</div>
                  <div className="lbl">{char.name}</div>
                </div>
              )}
              <div className={`msg${isIn ? ' in' : ''}${isOut ? ' out' : ''}`}>
                {isTypewriting ? typewrittenText : msg.text}
                {isTypewriting && <span style={{ opacity:.5 }}>|</span>}
              </div>
            </div>
          )
        })}

        {typing && typewritingIdx === null && (
          <div className="typing"><i /><i /><i /></div>
        )}
      </div>

      {/* Quick chips */}
      <div className="quick-chips">
        {quickChips.map((chip, i) => (
          <button key={i} className="chip" onClick={() => handleQuickChip(chip)}>{chip}</button>
        ))}
      </div>

      {/* Input */}
      <div className="input-bar">
        <div className="field">
          <input
            ref={inputRef}
            type="text"
            placeholder={`Message ${char.name}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
        </div>
        <button className="send-btn" onClick={handleSend} disabled={!input.trim() || sending}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
