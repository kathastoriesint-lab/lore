'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import type { CharId, DMMessage } from '@/lib/types'
import { CHARS, DM_TRUST } from '@/lib/data'
import { getCricketChars, getCricketSituations, getCricketTrustGoals, getCricketDMTrustStart } from '@/lib/content'
import { getReplySuggestions } from '@/lib/game'
import { trustMomentFor, trustGateThreshold } from '@/lib/season'
import { relationshipFor, computeBond, bondColor } from '@/lib/relationships'
import { DOSSIERS } from '@/lib/dossier'

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
  const { goBack, showToast, dmChar, dmHistory, dmTrust, sendDM, game, completeTrustMoment } = useApp()

  const allChars = { ...CHARS, ...getCricketChars() }
  const charId = dmChar as CharId | null
  const char = charId ? (allChars[charId] ?? null) : null
  const messages: DMMessage[] = charId ? (dmHistory[charId] ?? []) : []

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const [, tick] = useState(0)
  const hasStarted = messages.length > 0

  // Creator House: establish who this person is to YOU at the top of the thread —
  // crisp + helpful (the dossier is the deep bible; this is the living relationship).
  const chContext = useMemo(() => {
    if (game.world === 'cricket' || !charId) return null
    const d = DOSSIERS[charId]
    const rel = relationshipFor(charId, game.playerGender)
    if (!d || !rel) return null
    const { bond, moments } = computeBond(charId, game.world, game.choices, game.playerName, game.playerGender, dmTrust)
    const latest = moments.length ? moments[moments.length - 1] : null
    return { d, rel, bond, latest }
  }, [game.world, charId, game.playerGender, game.choices, game.playerName, dmTrust])

  // Trust: LLM-scored live value from context, falls back to static default
  const trustVal = charId
    ? (dmTrust[charId] ?? (game.world === 'cricket' ? getCricketDMTrustStart()[charId] : DM_TRUST[charId]) ?? 50)
    : 50
  const trustBand = trustVal < 30 ? 'LOW' : trustVal < 60 ? 'NORMAL' : 'HIGH'

  // Cricket gate-senior goal: if this senior's trust unlocks a week, the chat opens
  // with WHY this conversation matters and HOW to win them over. Makes a redirect
  // from the Live nudge land on a clear objective, not a blank thread.
  const trustGoal = (() => {
    if (game.world !== 'cricket' || !charId) return null
    const goal = getCricketTrustGoals()[charId]
    const need = trustGateThreshold(charId)
    if (!goal || need == null) return null
    return { ...goal, need, met: trustVal >= need }
  })()

  // Floating trust-delta chip: makes every trust change visible at the moment
  // it happens (chat scoring + trust moments) — the DM gym's feedback.
  const prevTrustRef = useRef<number | null>(null)
  const [trustTick, setTrustTick] = useState<{ delta: number; key: number } | null>(null)
  useEffect(() => {
    const prev = prevTrustRef.current
    prevTrustRef.current = trustVal
    if (prev === null || prev === trustVal || !charId) return
    setTrustTick({ delta: trustVal - prev, key: Date.now() })
    const t = setTimeout(() => setTrustTick(null), 1800)
    return () => clearTimeout(t)
  }, [trustVal, charId])

  // Active trust moment (one per interlude) — also collapses Smart Reply so the
  // thread isn't buried under two suggestion cards at once.
  const trustMoment = (game.world === 'cricket' && game.lockExpiresAt
    && !game.interlude?.trustMomentUsed && charId) ? trustMomentFor(charId) : null

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

    // The situation the player is about to face next in the game — lets the
    // suggestion quietly set them up for it.
    const nextSitId = game.situationQueue[game.situation]
    const nextSit = nextSitId ? getCricketSituations().find(s => s.id === nextSitId) : null
    const nextSituation = nextSit ? `${nextSit.title} — ${nextSit.q}` : undefined

    let cancelled = false
    setChipsLoading(true)
    setDynamicChips([])
    getReplySuggestions(charId, messages, game.playerName || 'Yaar', {
      meters: game.meters,
      trustWithChar: trustVal,
      teamTrust: game.world === 'cricket' ? game.meters.image : undefined,
      nextSituation,
      choicesMade: game.choices.length,
      playerGender: game.playerGender,
    })
      .then(suggestions => { if (!cancelled) setDynamicChips(suggestions) })
      .finally(() => { if (!cancelled) setChipsLoading(false) })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charId, messages.length, typing, sending])

  // Send an explicit string (used by the Smart Reply card — tap to send directly).
  const sendText = useCallback(async (raw: string) => {
    const text = raw.trim()
    if (!charId || !text || sending) return
    setInput('')
    setDynamicChips([])
    setSending(true)
    setTyping(true)
    try {
      await sendDM(charId, text)
    } finally {
      setTyping(false)
      setSending(false)
    }
  }, [charId, sending, sendDM])

  const handleSend = useCallback(() => { sendText(input) }, [sendText, input])

  // "Edit" on the Smart Reply card — drop it into the input to tweak before sending.
  const handleEditSuggestion = useCallback((chip: string) => {
    setInput(chip)
    setDynamicChips([])
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
      <div className="dm-trust" style={{ position:'relative' }}>
        {trustTick && (
          <span key={trustTick.key} className="trust-tick" style={{
            color: trustTick.delta > 0 ? 'var(--trust)' : 'var(--heat)',
          }}>
            TRUST {trustTick.delta > 0 ? '+' : ''}{trustTick.delta}
          </span>
        )}
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

        {/* Cricket gate-senior goal — what this trust unlocks + how to win it */}
        {trustGoal && (
          <div style={{
            margin: '4px 4px 14px', padding: '13px 15px', borderRadius: 14,
            background: trustGoal.met ? 'color-mix(in srgb, var(--trust) 12%, var(--surf))' : 'var(--surf)',
            border: `1px solid ${trustGoal.met ? 'color-mix(in srgb, var(--trust) 45%, transparent)' : 'var(--line)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 7 }}>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.12em', color: 'var(--trust)' }}>
                {trustGoal.met ? '✓ GOAL POORA' : 'TUMHARA GOAL'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: trustGoal.met ? 'var(--trust)' : 'var(--ink2)', fontVariantNumeric: 'tabular-nums' }}>
                Bharosa {trustVal} / {trustGoal.need}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600, lineHeight: 1.45 }}>
              {trustGoal.met
                ? `Unlock ho gaya: ${trustGoal.unlocks}.`
                : `Iska bharosa ${trustGoal.need} tak le jao — unlock: ${trustGoal.unlocks}.`}
            </div>
            {!trustGoal.met && (
              <div style={{ marginTop: 9, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.08em', color: 'var(--ink3)' }}>KAISE JEETO</div>
                {trustGoal.tips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 7, fontSize: 12, color: 'var(--ink2)', lineHeight: 1.45 }}>
                    <span style={{ color: 'var(--trust)', flexShrink: 0 }}>→</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Creator House — relationship context (who they are to you, where you stand) */}
        {chContext && (
          <div style={{
            margin: '4px 4px 14px', padding: '12px 14px', borderRadius: 14,
            background: 'var(--surf)', border: '1px solid var(--line)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '.06em', color: chContext.rel.labelColor,
                background: `color-mix(in srgb, ${chContext.rel.labelColor} 16%, transparent)`,
                border: `1px solid color-mix(in srgb, ${chContext.rel.labelColor} 35%, transparent)`,
                padding: '2px 7px', borderRadius: 6,
              }}>{chContext.rel.label.toUpperCase()}</span>
              <span style={{ fontSize: 10, color: 'var(--ink3)', fontWeight: 700 }}>
                BOND <span style={{ color: bondColor(chContext.bond) }}>{chContext.bond}</span>
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5 }}>{chContext.d.tagline}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink3)', lineHeight: 1.5, marginTop: 7 }}>
              {chContext.latest
                ? <>Abhi tak: <span style={{ color: 'var(--ink2)', fontStyle: 'italic' }}>&ldquo;{chContext.latest.text}&rdquo;</span></>
                : 'Pehli baat. Kahani yahin se shuru hoti hai.'}
            </div>
          </div>
        )}

        {!hasStarted && !chContext && (
          <div style={{ height:'100%', display:'grid', placeItems:'center', textAlign:'center', color:'var(--ink3)', padding:'0 28px' }}>
            <div>
              <div style={{ fontSize:22, marginBottom:8 }}>💬</div>
              <div style={{ fontWeight:700, color:'var(--ink)', marginBottom:5 }}>No messages yet</div>
              <div style={{ fontSize:13, lineHeight:1.45 }}>{char.name} will appear here after they message you in the story.</div>
            </div>
          </div>
        )}
        {/* CH thread with no messages: the context card is the opener; nudge a first move */}
        {!hasStarted && chContext && (
          <div style={{ fontSize:12, color:'var(--ink3)', textAlign:'center', padding:'8px 24px', lineHeight:1.5 }}>
            Message bhejo — {char.name.split(' ')[0]} se baat yahin banti ya bigadti hai.
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

      {/* Trust moment — once per interlude, a senior opens something real.
          Answer well: big trust gain. The DM gym's heavy lift. */}
      {trustMoment && charId && (
        <div style={{
          margin: '0 12px 8px', padding: '12px 16px', borderRadius: 14,
          background: 'color-mix(in srgb, var(--trust) 7%, transparent)', border: '1px solid color-mix(in srgb, var(--trust) 22%, transparent)',
        }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.1em', color: 'var(--trust)', marginBottom: 8 }}>
            {char?.name?.toUpperCase()} — REAL TALK
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.55, marginBottom: 12 }}>
            {trustMoment.opener}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {trustMoment.replies.map((r, i) => (
              <button
                key={i}
                onClick={() => completeTrustMoment(charId, trustMoment.opener, r.label, r.response, r.delta)}
                style={{
                  textAlign: 'left', padding: '12px', borderRadius: 12, minHeight: 44,
                  border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.05)',
                  color: 'var(--ink)', fontSize: 12.5, lineHeight: 1.4,
                  fontFamily: 'var(--sans)', cursor: 'pointer',
                }}
              >{r.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Smart Reply — context-aware suggestion (Kavaana-style card).
          Collapsed while a trust moment is open so the thread isn't buried. */}
      {hasStarted && !isLocked && !trustMoment && (dynamicChips.length > 0 || chipsLoading) && (
        <div className="smart-reply">
          <div className="smart-reply-head">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.5.5 1 1.2 1 2h6c0-.8.5-1.5 1-2A6 6 0 0 0 12 3z"/>
            </svg>
            <span>Smart Reply</span>
          </div>
          {chipsLoading ? (
            <div className="smart-reply-card smart-reply-loading">
              <span className="smart-reply-text">Soch raha hoon kya bolun<span className="sr-dots"><i/><i/><i/></span></span>
            </div>
          ) : (
            dynamicChips.slice(0, 1).map((chip, i) => (
              <div key={i} className="smart-reply-card">
                <button className="smart-reply-text-btn" onClick={() => sendText(chip)}>
                  <span className="smart-reply-text">{chip}</span>
                </button>
                <button className="smart-reply-edit" onClick={() => handleEditSuggestion(chip)} aria-label="Edit suggestion">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--ink2)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>
                  </svg>
                  <span>Edit</span>
                </button>
              </div>
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
