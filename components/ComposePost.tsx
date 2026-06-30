'use client'
import { useEffect, useRef, useState } from 'react'

export interface ComposeCtx {
  playerName: string
  day: number
  beatTitle: string
  sceneSummary: string
  choiceText: string
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
export default function ComposePost({ playerName, avatarUrl, imageUrl, ctx, fallbackCaption, why, onShare, onBack }: Props) {
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
      {/* App bar */}
      <div className="pw-bar">
        <button className="pw-back" onClick={onBack} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span className="pw-title">New post</span>
        <span className="pw-step">Step 2 of 4 · Post</span>
      </div>

      <div className="pw-body">
        {/* Why you're posting — the moment + stakes */}
        {why && (
          <div className="pw-why">
            <div className="pw-why-ic">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
            </div>
            <div className="pw-why-body">
              <div className="pw-why-eye">{why.eyebrow}</div>
              <div className="pw-why-line">{why.line}</div>
              {why.sub && (
                <div className="pw-why-sub">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
                  {why.sub}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Author */}
        <div className="pw-head">
          <div className="pw-av" style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}>{!avatarUrl && (playerName?.[0] ?? 'N').toUpperCase()}</div>
          <div>
            <div className="pw-n">@{handle}</div>
            <div className="pw-sub">Creator House · Day {ctx.day}</div>
          </div>
        </div>

        {/* Image */}
        {imageUrl && <div className="pw-img" style={{ backgroundImage: `url(${imageUrl})` }} />}

        {/* Caption */}
        <div className="pw-cap">
          {capEmpty && <span className="pw-ph">Vibe pick karo — AI tumhare liye caption likh dega ✨</span>}
          {capThinking && <span className="pw-think">likh raha hoon<i /><i className="d2" /><i className="d3" /></span>}
          {capShow && <span>{capText}{generating && <span className="pw-caret" />}</span>}
        </div>

        <div className="pw-div" />

        {/* Vibe picker */}
        <div className="pw-tonelbl">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.2 5.6L20 9l-4.5 3.7L17 19l-5-3.3L7 19l1.5-6.3L4 9l5.8-.4z" /></svg>
          Write with AI — pick a vibe
        </div>
        <div className="pw-tones">
          {TONES.map(t => (
            <button key={t.key} className={`pw-tone${tone === t.key ? ' sel' : ''}`} onClick={() => genCaption(t.key)} disabled={generating}>
              <div className="pw-em">{t.em}</div>
              <div className="pw-tn">{t.label}</div>
              <div className="pw-td">{t.desc}</div>
            </button>
          ))}
        </div>
        {ready && <div className="pw-regen">↻ Doosra vibe try karo — naya caption aayega</div>}
      </div>

      {/* Sticky footer */}
      <div className="pw-foot">
        <button className={`pw-share${(ready && !posting) ? '' : ' off'}`} onClick={() => { if (!ready || posting) return; setPosting(true); onShare(caption, reactionsRef.current?.caption === caption ? reactionsRef.current.reactions : undefined) }}>
          {posting ? 'Posting…' : shareLabel}
          {ready && !posting && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>}
        </button>
        <div className="pw-footnote">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7z" /></svg>
          Share karte hi feed pe live — ghar real-time react karega.
        </div>
      </div>
    </div>
  )
}
