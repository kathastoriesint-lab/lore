'use client'
import { useEffect, useState } from 'react'
import { useApp } from '@/lib/context'
import type { CharId } from '@/lib/types'

// Personas that shape each creator's DM reaction. The crush + ally are ROLE-based
// (the same dynamic whether the crush is Ananya or Kabir) and resolved per player
// gender below — so a female player's Kabir-crush speaks with the crush voice.
const CHAR_PERSONAS: Record<string, string> = {
  ria: "the house's polished queen bee — image-obsessed, cutting, never rattled",
  zoya: 'a sharp schemer who reads everyone and plays mind-games — sweet, then savage',
  dev: 'the quiet observer — dry humor, allergic to drama',
}
const CRUSH_PERSONA = 'the one you share a history with from a few years ago — guarded, real, an unspoken almost-something, quietly watching you'
const ALLY_PERSONA  = 'your loud, loyal ride-or-die — warm, all heart, hypes you up and films the chaos'

interface Props {
  character: { id: string; name: string; handle: string }
  post: { caption: string; imageUrl?: string }
  onDone: (text: string) => void
  /** Override the auto-derived persona (used for cricket chars + fan-page accounts). */
  persona?: string
  /** Whether a reaction to this comment can DM the player. FALSE for fan pages /
   *  non-character accounts — DMs strike ONLY from real story characters (founder). */
  canDM?: boolean
}

// On a post: 2 AI comment suggestions + a free-type box. Sending a comment on a
// REAL character's post fires that character's DM (sentiment-matched); fan-page /
// non-character posts are commentable but never DM you back (canDM=false).
export default function CommentComposer({ character, post, onDone, persona: personaProp, canDM = true }: Props) {
  const { notifyDM, game } = useApp()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestState, setSuggestState] = useState<'loading' | 'ready' | 'empty'>('loading')
  const [draft, setDraft] = useState('')
  const [sent, setSent] = useState(false)
  const persona = personaProp ?? (() => {
    if (character.id === 'kabir' || character.id === 'ananya') {
      const isCrush = game.playerGender === 'male' ? character.id === 'ananya' : character.id === 'kabir'
      return isCrush ? CRUSH_PERSONA : ALLY_PERSONA
    }
    return CHAR_PERSONAS[character.id] || 'a Creator House contestant'
  })()

  useEffect(() => {
    let alive = true
    fetch('/api/lore-post', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'comment-suggest', character: { name: character.name, persona }, caption: post.caption }),
    })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (!alive) return
        const sug = Array.isArray(d?.suggestions) ? d.suggestions : []
        setSuggestions(sug)
        setSuggestState(sug.length ? 'ready' : 'empty')
      })
      .catch(() => { if (alive) setSuggestState('empty') })
    return () => { alive = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const send = async (text: string) => {
    if (!text.trim() || sent) return
    setSent(true)
    let sentiment = 'boring'; let reply = ''
    try {
      const res = await fetch('/api/lore-post', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'comment-react', character: { name: character.name, persona }, caption: post.caption, comment: text.trim() }),
      })
      if (res.ok) { const d = await res.json(); sentiment = d.sentiment || 'boring'; reply = d.reply || '' }
    } catch { /* no reply on failure */ }
    // Trigger rules by tone:
    //   spicy / negative → always DM (drama is the point)
    //   positive         → DM once per character (first nice comment lands)
    //   boring           → no DM (a forgettable comment gets no reaction)
    let fired = new Set<string>()
    try { fired = new Set(JSON.parse(localStorage.getItem('lore_comment_dm_v1') || '[]')) } catch {}
    const alwaysFire = sentiment === 'negative' || sentiment === 'spicy'
    const firstPositive = sentiment === 'positive' && !fired.has(character.id)
    // canDM gates the whole DM path: fan pages never text you back.
    if (canDM && reply && (alwaysFire || firstPositive)) {
      fired.add(character.id)
      try { localStorage.setItem('lore_comment_dm_v1', JSON.stringify([...fired])) } catch {}
      setTimeout(() => notifyDM(character.id as CharId, reply, { caption: post.caption, imageUrl: post.imageUrl, handle: character.handle }), 700)
    }
    setTimeout(() => onDone(text.trim()), 1000)
  }

  if (sent) {
    return <div className="comment-sheet"><div className="comment-sheet-label">Comment posted ✓</div></div>
  }

  return (
    <div className="comment-sheet">
      <div className="comment-sheet-label">Comment on @{character.handle}&apos;s post</div>
      {suggestState === 'loading'
        ? <div className="comment-option" style={{ opacity: .55 }}>AI suggestions aa rahe hain…</div>
        : suggestState === 'empty'
          ? <div className="comment-option" style={{ opacity: .55 }}>Apna comment neeche likho 👇</div>
          : suggestions.map(s => <button key={s} className="comment-option" onClick={() => send(s)}>{s}</button>)}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(draft) }}
          placeholder="Apna comment likho…"
          style={{ flex: 1, background: 'var(--surf2,#0f0f12)', border: '1px solid var(--line)', borderRadius: 10, padding: '9px 12px', color: '#fff', fontFamily: 'var(--sans)', fontSize: 13, outline: 'none' }}
        />
        <button className="comment-option" style={{ width: 'auto', padding: '0 16px', opacity: draft.trim() ? 1 : .5 }} onClick={() => send(draft)}>Send</button>
      </div>
    </div>
  )
}
