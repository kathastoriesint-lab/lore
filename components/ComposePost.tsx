'use client'
import { useEffect, useRef, useState } from 'react'
import * as haptics from '@/lib/haptics'
import * as sound from '@/lib/sound'

export interface ComposeCtx {
  playerName: string
  day: number
  beatTitle: string
  sceneSummary: string
  choiceText: string
  /** 'cricket' | 'creator-house' — steers the AI caption/reaction voice. */
  world?: string
  characters: { id: string; name: string; persona?: string }[]
}

type Tone = 'bold' | 'funny' | 'mysterious'
const TONES: { key: Tone; em: string; label: string; desc: string }[] = [
  { key: 'bold', em: '🔥', label: 'Bold', desc: 'confident' },
  { key: 'funny', em: '😎', label: 'Funny', desc: 'witty' },
  { key: 'mysterious', em: '🙂', label: 'Mystery', desc: 'kam shabd' },
]
const VIBE: Record<Tone, 'Bold' | 'Funny' | 'Mysterious'> = { bold: 'Bold', funny: 'Funny', mysterious: 'Mysterious' }

interface Props {
  playerName: string
  avatarUrl?: string
  imageUrl?: string
  ctx: ComposeCtx
  fallbackCaption: string
  /** Why you're posting — the moment + stakes, shown at the top of the writer. */
  why?: { eyebrow: string; line: string; sub: string }
  onShare: (caption: string, reactions?: { char: string; name?: string; text: string }[]) => void
  onBack: () => void
}

// Screen A — the post writer (design handoff). Pick a vibe; the caption is written
// by gpt-4o and types itself out (~42 cps) with a blinking caret; a big "Share to
// feed" button commits it. Mirrors the handoff state machine.
export default function ComposePost({ playerName, avatarUrl, imageUrl, ctx, fallbackCaption, onShare, onBack }: Props) {
  const [tone, setTone] = useState<Tone | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genText, setGenText] = useState('')
  const [caption, setCaption] = useState('')
  const [posting, setPosting] = useState(false)
  const twRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const toneRef = useRef<Tone | null>(null)
  // World reactions, pre-fetched the moment the caption is known so Share is instant.
  const reactionsRef = useRef<{ caption: string; reactions: { char: string; name?: string; text: string }[] } | null>(null)
  const handle = (playerName || 'you').toLowerCase().replace(/\s+/g, '')

  useEffect(() => () => { if (twRef.current) clearInterval(twRef.current) }, [])

  const typeOut = (text: string) => {
    if (twRef.current) clearInterval(twRef.current)
    const t0 = performance.now(); const cps = 42
    twRef.current = setInterval(() => {
      const n = Math.min(text.length, Math.floor((performance.now() - t0) / 1000 * cps) + 1)
      setGenText(text.slice(0, n))
      if (n >= text.length) { if (twRef.current) clearInterval(twRef.current); twRef.current = null; setCaption(text); setGenerating(false) }
    }, 34)
  }

  const genCaption = async (t: Tone) => {
    if (twRef.current) clearInterval(twRef.current)
    setTone(t); toneRef.current = t
    setGenerating(true); setGenText(''); setCaption('')
    let text = ''
    try {
      const res = await fetch('/api/lore-post', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'caption', vibe: VIBE[t], ctx }),
      })
      if (res.ok) { const d = await res.json(); text = typeof d.caption === 'string' ? d.caption : '' }
    } catch { /* fall back below */ }
    text = (text || '').trim().replace(/^["'“”]+|["'“”]+$/g, '').split('\n')[0].trim()
    if (!text) text = fallbackCaption
    if (toneRef.current !== t) return // vibe switched mid-generation — drop stale result
    // Pre-fetch the world's reactions for this caption (background) so Share is instant.
    reactionsRef.current = null
    fetch('/api/lore-post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'reactions', caption: text, ctx }) })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d && Array.isArray(d.reactions) && d.reactions.length && toneRef.current === t) reactionsRef.current = { caption: text, reactions: d.reactions } })
      .catch(() => {})
    typeOut(text)
  }

  const capEmpty = !generating && !caption && !genText
  const capThinking = generating && genText === ''
  const capShow = (generating && genText !== '') || (!!caption && !generating)
  const capText = generating ? genText : caption
  const ready = !!caption && !generating
  const shareLabel = generating ? 'AI likh raha hai…' : (caption ? 'Share to feed' : 'Pehle ek vibe chuno')

  return (
    <div className="pw-screen">
      {/* App bar — title only, no step chrome */}
      <div className="pw-bar">
        <button className="pw-back" onClick={onBack} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span className="pw-title">New post</span>
        <span style={{ width: 38 }} />
      </div>

      <div className="pw-body">
        {/* Author */}
        <div className="pw-head">
          <div className="pw-av" style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}>{!avatarUrl && (playerName?.[0] ?? 'N').toUpperCase()}</div>
          <div>
            <div className="pw-n">@{handle}</div>
            <div className="pw-sub">{ctx.world === 'cricket' ? 'Mumbai Indians · Season 1' : `Creator House · Day ${ctx.day}`}</div>
          </div>
        </div>

        {/* Image */}
        {imageUrl && <div className="pw-img" style={{ backgroundImage: `url(${imageUrl})` }} />}

        {/* Caption */}
        <div className="pw-cap">
          {capEmpty && <span className="pw-ph">Ek vibe chuno — AI caption likh dega ✨</span>}
          {capThinking && <span className="pw-think">likh raha hoon<i /><i className="d2" /><i className="d3" /></span>}
          {capShow && <span>{capText}{generating && <span className="pw-caret" />}</span>}
        </div>

        <div className="pw-div" />

        {/* Vibe picker — buttons are self-explanatory, no label needed */}
        <div className="pw-tones">
          {TONES.map(t => (
            <button key={t.key} className={`pw-tone${tone === t.key ? ' sel' : ''}`} onClick={() => genCaption(t.key)} disabled={generating}>
              <div className="pw-em">{t.em}</div>
              <div className="pw-tn">{t.label}</div>
              <div className="pw-td">{t.desc}</div>
            </button>
          ))}
        </div>
        {ready && <div className="pw-regen">↻ Doosra vibe</div>}
      </div>

      {/* Sticky footer — just the action */}
      <div className="pw-foot">
        <button className={`pw-share${(ready && !posting) ? '' : ' off'}`} onClick={() => { if (!ready || posting) return; setPosting(true); sound.postDone(); haptics.success(); onShare(caption, reactionsRef.current?.caption === caption ? reactionsRef.current.reactions : undefined) }}>
          {posting ? 'Posting…' : shareLabel}
          {ready && !posting && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>}
        </button>
      </div>
    </div>
  )
}
