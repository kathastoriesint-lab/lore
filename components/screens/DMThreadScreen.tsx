'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import type { CharId, DMMessage } from '@/lib/types'
import { CHARS, DM_TRUST, DM_QUICK } from '@/lib/data'
import { CRICKET_CHARS, CRICKET_DM_MOCK } from '@/lib/cricket-data'

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
  const { goBack, showToast, dmChar, dmHistory, dmTrust, sendDM } = useApp()

  const allChars = { ...CHARS, ...CRICKET_CHARS }
  const charId = dmChar as CharId | null
  const char = charId ? (allChars[charId] ?? null) : null
  const messages: DMMessage[] = charId ? (dmHistory[charId] ?? []) : []

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)

  // Trust: LLM-scored live value from context, falls back to static default
  const trustVal = charId
    ? (dmTrust[charId] ?? DM_TRUST[charId] ?? 50)
    : 50

  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    const el = chatRef.current
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
  }, [messages.length, typing])

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

  const handleQuickChip = useCallback((chip: string) => {
    setInput(chip)
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

  const CRICKET_QUICK: Partial<Record<string, string[]>> = {
    hardik: ['Role ke baare mein baat karni thi', 'Bench pe hoon — kya karu?', 'Kal match mein nervous hoon'],
    rohit:  ['Tempo kya hota hai exactly?', 'Pehli ball ke baare mein advice do', 'Kuch dekha mujhme?'],
    surya:  ['Woh angle wala shot kaise?', 'Field reading sikhao', 'Kal nets pe aaun?'],
    bumrah: ['Aaj over better tha?', 'Wrist position batao', 'Slower ball kab maaru?'],
    tilak:  ['Dressing room mein kaise fit hoon?', 'Role clarity kaise aati hai?', 'Hardik ne kya bola?'],
    coach:  ['Video bhejun kya?', 'Footwork pe kya fix karna hai?', 'Ghabra raha hoon yaar'],
    friend: ['Bhai kya chal raha hai', 'Ghar yaad aa raha hai', 'Koi sun nahi raha yahan'],
  }
  const quickChips = (charId ? (DM_QUICK[charId] ?? CRICKET_QUICK[charId] ?? []) : [])

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
        <div className={`av ${char.cls}`} style={{ width:30, height:30, fontSize:13, flexShrink:0, backgroundImage:`url(/avatars/${charId}.png)`, backgroundSize:'cover', backgroundPosition:'center' }}>
          <span style={{opacity:0}}>{char.init}</span>
        </div>
        <div className="tinfo">
          <div className="tn">{char.name}</div>
          <div className="tsub">{['hardik','rohit','surya','bumrah','tilak','coach','friend'].includes(charId ?? '') ? 'Mumbai Indians · Online' : 'Creator House · Online'}</div>
        </div>
        <button className="icon-btn" onClick={() => showToast('Video call coming soon 📹')}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
        </button>
      </div>

      {/* Trust meter — updates live as conversation grows */}
      <div className="dm-trust">
        <div className="tl">
          <span>TRUST LEVEL</span>
          <span key={trustVal} style={{ animation:'meterFlash .4s ease-out' }}>{trustVal}%</span>
        </div>
        <div className="bar">
          <i style={{ width:`${trustVal}%`, transition:'width .6s ease' }} />
        </div>
      </div>

      {/* Messages rendered directly from context — no local copy */}
      <div className="chat" ref={chatRef}>
        {messages.map((msg, i) => {
          const isIn = msg.role === 'char'
          const isOut = msg.role === 'me'
          const prevMsg = i > 0 ? messages[i - 1] : null
          const showAvatar = isIn && (!prevMsg || prevMsg.role !== 'char')

          return (
            <div key={i} style={{ display:'flex', flexDirection:'column' }}>
              {showAvatar && (
                <div className="msg-av">
                  <div className={`av ${char.cls}`} style={{ width:22, height:22, fontSize:10, backgroundImage:`url(/avatars/${charId}.png)`, backgroundSize:'cover', backgroundPosition:'center' }}><span style={{opacity:0}}>{char.init}</span></div>
                  <div className="lbl">{char.name}</div>
                </div>
              )}
              <div className={`msg${isIn ? ' in' : ''}${isOut ? ' out' : ''}`}>
                {msg.text}
              </div>
            </div>
          )
        })}

        {/* Typing indicator while waiting for AI reply */}
        {typing && (
          <div style={{ display:'flex', flexDirection:'column' }}>
            <div className="msg-av">
              <div className={`av ${char.cls}`} style={{ width:22, height:22, fontSize:10 }}>{char.init}</div>
              <div className="lbl">{char.name}</div>
            </div>
            <div className="typing"><i /><i /><i /></div>
          </div>
        )}
      </div>

      {/* Quick reply chips */}
      <div className="quick-chips">
        {quickChips.map((chip, i) => (
          <button key={i} className="chip" onClick={() => handleQuickChip(chip)}>{chip}</button>
        ))}
      </div>

      {/* Input bar */}
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
