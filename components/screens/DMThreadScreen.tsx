'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import type { CharId, DMMessage } from '@/lib/types'
import { CHARS, DM_TRUST, DM_QUICK } from '@/lib/data'
import { CRICKET_CHARS } from '@/lib/cricket-data'
import { CRICKET_DM_TRUST_START } from '@/lib/cricket-data'
import { getReplySuggestions } from '@/lib/game'

const DM_CAP = 20

function getDmCap(charId: string) {
  try {
    const raw = localStorage.getItem('lore_dm_cap')
    const all = raw ? JSON.parse(raw) : {}
    return (all[charId] ?? { count: 0, lockedUntil: 0 }) as { count: number; lockedUntil: number }
  } catch { return { count: 0, lockedUntil: 0 } }
}

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
  const { goBack, showToast, dmChar, dmHistory, dmTrust, sendDM, game } = useApp()

  const allChars = { ...CHARS, ...CRICKET_CHARS }
  const charId = dmChar as CharId | null
  const char = charId ? (allChars[charId] ?? null) : null
  const messages: DMMessage[] = charId ? (dmHistory[charId] ?? []) : []

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const [, tick] = useState(0)
  const hasStarted = messages.length > 0

  // Trust: LLM-scored live value from context, falls back to static default
  const trustVal = charId
    ? (dmTrust[charId] ?? (game.world === 'cricket' ? CRICKET_DM_TRUST_START[charId] : DM_TRUST[charId]) ?? 50)
    : 50
  const trustBand = trustVal < 30 ? 'LOW' : trustVal < 60 ? 'NORMAL' : 'HIGH'

  // Cap / lock state — re-reads localStorage on every render (tick keeps it live)
  const capState = charId ? getDmCap(charId) : { count: 0, lockedUntil: 0 }
  const isLocked = capState.lockedUntil > Date.now()
  const msRemaining = isLocked ? capState.lockedUntil - Date.now() : 0
  const msgsLeft = Math.max(0, DM_CAP - capState.count)

  const lockCountdown = (() => {
    const h = Math.floor(msRemaining / 3_600_000)
    const m = Math.floor((msRemaining % 3_600_000) / 60_000)
    const s = Math.floor((msRemaining % 60_000) / 1_000)
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  })()

  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Dynamic reply suggestions — refreshed whenever the character sends a new message
  const [dynamicChips, setDynamicChips] = useState<string[]>([])
  const [chipsLoading, setChipsLoading] = useState(false)

  // Tick every second when locked (for countdown)
  useEffect(() => {
    if (!isLocked) return
    const t = setInterval(() => tick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [isLocked])

  // Scroll to bottom on new messages
  useEffect(() => {
    const el = chatRef.current
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
  }, [messages.length, typing])

  // Refresh reply suggestions once a character's full burst has landed.
  // Gated on !typing && !sending so it fires once after all bubbles arrive,
  // not on every intermediate bubble of a multi-message reply.
  useEffect(() => {
    if (!charId || isLocked || typing || sending) return
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'char') return

    let cancelled = false
    setChipsLoading(true)
    setDynamicChips([])
    getReplySuggestions(charId, messages, game.playerName || 'Yaar')
      .then(suggestions => { if (!cancelled) setDynamicChips(suggestions) })
      .finally(() => { if (!cancelled) setChipsLoading(false) })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charId, messages.length, typing, sending])

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
  const staticChips = (charId ? (DM_QUICK[charId] ?? CRICKET_QUICK[charId] ?? []) : [])
  // Fall back to static chips only while no dynamic suggestion is available (and not actively loading one)
  const quickChips = chipsLoading ? [] : staticChips

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
          <div className="tsub">{
            charId === 'friend' ? 'School friend · Online' :
            charId === 'coach'  ? 'Childhood coach · Online' :
            ['hardik','rohit','surya','bumrah','tilak','naman','robin','mahela'].includes(charId ?? '') ? 'Mumbai Indians · Online' :
            'Creator House · Online'
          }</div>
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
          <span>TRUST LEVEL · {trustBand}</span>
          <span key={trustVal} style={{ animation:'meterFlash .4s ease-out' }}>{trustVal}%</span>
        </div>
        <div className="bar">
          <i style={{ width:`${trustVal}%`, transition:'width .6s ease' }} />
        </div>
      </div>

      {/* Messages rendered directly from context — no local copy */}
      <div className="chat" ref={chatRef}>
        {!hasStarted && (
          <div style={{ height:'100%', display:'grid', placeItems:'center', textAlign:'center', color:'var(--ink3)', padding:'0 28px' }}>
            <div>
              <div style={{ fontSize:22, marginBottom:8 }}>💬</div>
              <div style={{ fontWeight:700, color:'var(--ink)', marginBottom:5 }}>No messages yet</div>
              <div style={{ fontSize:13, lineHeight:1.45 }}>{char.name} will appear here after they message you in the story.</div>
            </div>
          </div>
        )}
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

      {/* Quick reply suggestion(s) */}
      {hasStarted && !isLocked && (
        <div className="quick-chips">
          {dynamicChips.length > 0 ? (
            dynamicChips.map((chip, i) => (
              <button key={i} className="chip-suggestion" onClick={() => handleQuickChip(chip)}>{chip}</button>
            ))
          ) : (
            quickChips.map((chip, i) => (
              <button key={i} className="chip" onClick={() => handleQuickChip(chip)}>{chip}</button>
            ))
          )}
        </div>
      )}

      {/* Locked state */}
      {hasStarted && isLocked && (
        <div style={{
          padding: '16px 20px 20px',
          background: 'rgba(8,8,15,.98)',
          borderTop: '1px solid rgba(255,255,255,.06)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>📵</div>
          <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14, marginBottom: 4 }}>
            {char.name} ne apna phone band kar liya.
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 8 }}>
            Kal baat karna. Opens in {lockCountdown}
          </div>
        </div>
      )}

      {/* Message counter + input bar */}
      {hasStarted && !isLocked && (
        <>
          {msgsLeft <= 5 && msgsLeft > 0 && (
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink3)', padding: '4px 0 2px' }}>
              {msgsLeft} message{msgsLeft !== 1 ? 's' : ''} left before {char.name} goes offline for 6h
            </div>
          )}
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
        </>
      )}
    </div>
  )
}
