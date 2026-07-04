'use client'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useApp } from '@/lib/context'
import type { CharId, Choice, ChoicePost, Meters, CricketMeters, Reaction, Character } from '@/lib/types'
import type { PostCommentOption } from '@/lib/data'
import { getCricketChars, getCHChars, getCHPostComments } from '@/lib/content'
import { applyDeltas, resolveTokens, fameToFollowers } from '@/lib/game'
import { derivePosts, deriveOvernightPosts, type FeedPost } from '@/lib/feed-posts'
import MeterHUD from '@/components/MeterHUD'
import LiveEntryCard from '@/components/LiveEntryCard'
import CommentComposer from '@/components/CommentComposer'

// Inline character background — color-mix(var(--cc)) fails without a parent with the CSS class
const CHAR_COLORS_HEX: Record<string, string> = {
  ria:'#b03a5e', kabir:'#2a6f8f', dev:'#3a7a4a', ananya:'#8a4ab0', zoya:'#aa6a8a',
  meher:'#b07a2a', rishi:'#4a8a2a', adi:'#d4581a',
  hardik:'#003087', rohit:'#1a3a6e', surya:'#004080', bumrah:'#0a1a4a',
  tilak:'#2a5a8f', coach:'#4a3a1a', friend:'#3a6a4a', player:'#FF2D78',
}
const charBg = (id: string) => {
  const c = CHAR_COLORS_HEX[id] ?? '#1a1a2e'
  // Character color stays vivid through midpoint, fades to deep dark at bottom-right
  // Keeps visual richness while preserving caption legibility at bottom
  return `linear-gradient(to bottom, ${c}bb 0%, ${c}66 55%, #0a0a18 100%)`
}

const feedLikes = (index: number, isCricket: boolean) => {
  const base = isCricket ? [94102, 128441, 76220, 183004, 52018, 211908] : [18420, 22810, 14390, 31502, 9024, 27118]
  return base[index % base.length].toLocaleString('en-IN')
}

const postAgeLabel = (stepIndex: number, completedChoices: number, offsetMinutes = 0, uppercase = false) => {
  const currentStep = Math.max(0, completedChoices - 1)
  const ageMinutes = Math.max(0, (currentStep - stepIndex) * 45 + offsetMinutes)
  let label: string
  if (ageMinutes === 0) label = 'just now'
  else if (ageMinutes < 60) label = `${ageMinutes} min ago`
  else if (ageMinutes < 24 * 60) label = `${Math.floor(ageMinutes / 60)}h ago`
  else label = `${Math.floor(ageMinutes / (24 * 60))}d ago`
  return uppercase ? label.toUpperCase() : label
}

const postContextLabel = (label: string | undefined, fallback: string, time: string) => {
  const clean = label?.replace(/\s*·\s*(just now|\d+\s*(?:m|h|d)|\d+\s*(?:min|mins|minutes?)\s+ago)$/i, '').trim()
  return `${clean || fallback} · ${time}`
}

const asArray = <T,>(value: T | T[] | null | undefined): T[] => {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

const Heart = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'var(--accent)' : 'none'} stroke={filled ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

// Comment icon used across the feed action row.
const CommentIcon = ({ active }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
)

// Compact counts for the feed action row (2.1M, 324.2K, 2.7K) — matches the mock.
const compactCount = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  : n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  : String(n)
const likeNum = (s: string) => parseInt(s.replace(/[^0-9]/g, ''), 10) || 0
// Plausible comment count derived from a like number, so every post shows a
// comment tally even when only likes were authored.
const sideCounts = (likes: number) => ({
  comments: compactCount(Math.max(3, Math.round(likes * 0.004))),
})

// Unified action row — like + comment, each with its count inline (♡ · 💬).
// `like`/`comment` are the post's own (interactive) nodes; counts are strings.
function ActionRow({ like, comment, likes, comments, tail }: {
  like: ReactNode; comment: ReactNode
  likes: string; comments: string; tail?: ReactNode
}) {
  return (
    <div className="post-actions pa-counts">
      <div className="pa-item">{like}<span>{likes}</span></div>
      <div className="pa-item">{comment}<span>{comments}</span></div>
      {tail}
    </div>
  )
}

interface SeedPostProps {
  id: string
  charId: string
  onViewChar: (id: CharId) => void
  bg: string
  caption: string
  fullCaption: string
  likes: string
  time: string
  imageUrl?: string
  likedPosts: Set<string>
  commentedPosts: Set<string>
  myComment?: string
  myHandle?: string
  onLike: (id: string, charId: CharId, delta: number) => void
  onComment: (id: string | null) => void
  commentOpen: string | null
  comments: import('@/lib/data').PostCommentOption[]
  onHandleComment: (charId: string, postId: string, opt: import('@/lib/data').PostCommentOption) => void
  playingCharName: string
  onCommentSent: (postId: string, text: string) => void
}

function SeedPost({ id, charId, onViewChar, bg, caption, fullCaption, likes, time, imageUrl, likedPosts, commentedPosts, onLike, onComment, commentOpen, onCommentSent, playingCharName, myComment, myHandle }: SeedPostProps) {
  const char = getCHChars()[charId as CharId]
  if (!char) return null
  const isOpen = commentOpen === id
  const liked = likedPosts.has(id)
  const commented = commentedPosts.has(id)
  return (
    <div className="post">
      <div className="post-head">
        <button
          className={`av ${char.cls}`}
          style={{ width:34, height:34, fontSize:14, padding:0, backgroundImage:`url(/avatars/${charId}.png)`, backgroundSize:'cover', backgroundPosition:'center', border:'none', cursor:'pointer' }}
          onClick={() => onViewChar(char.id)}
        >
          <span style={{ opacity:0 }}>{char.init}</span>
        </button>
        <div className="post-id">
          <div className="h">{char.handle}</div>
          <div className="s">{time.toLowerCase()}</div>
        </div>
        <button className="icon-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>
      </div>
      <div className="post-img grain" style={{
        background: imageUrl ? 'none' : bg,
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: imageUrl ? 'cover' : undefined,
        backgroundPosition: imageUrl ? 'center top' : undefined,
      }}>
        {!imageUrl && <p className="overlay-txt" style={{ fontSize:14 }}>{caption}</p>}
      </div>
      <ActionRow
        like={
          <button onClick={() => !liked && onLike(id, char.id, 3)} style={{ opacity: liked ? 0.6 : 1, cursor: liked ? 'default' : 'pointer' }}>
            <Heart filled={liked} />
          </button>
        }
        comment={
          !commented
            ? <button onClick={() => onComment(isOpen ? null : id)}><CommentIcon active={isOpen} /></button>
            : <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
        likes={compactCount(likeNum(likes))}
        comments={sideCounts(likeNum(likes)).comments}
      />
      {isOpen && !commented && (
        <CommentComposer
          character={{ id: char.id, name: char.name, handle: char.handle }}
          post={{ caption: fullCaption, imageUrl }}
          onDone={t => onCommentSent(id, t)}
        />
      )}
      <div className="caption"><b>{char.handle}</b> {fullCaption}</div>
      {myComment && (
        <div className="caption cmt-in" style={{ paddingTop: 2, color: 'rgba(255,255,255,.85)' }}><b>{myHandle}</b> {myComment}</div>
      )}
      <div className="ts" style={{ padding:'2px 14px 12px' }}>{time}</div>
    </div>
  )
}

// ── Cricket seed posts ────────────────────────────────────────────────────────
interface CricketSeedProps {
  likedPosts: Set<string>
  commentedPosts: Set<string>
  postComments: Record<string, string>
  myHandle: string
  onLike: (id: string, charId: CharId, delta: number) => void
  onComment: (id: string | null) => void
  commentOpen: string | null
  onHandleComment: (charId: string, postId: string, opt: PostCommentOption) => void
  playingCharName: string
  onViewChar: (id: CharId) => void
}

const CRICKET_COMMENTS: Record<string, PostCommentOption[]> = {
  hardik: [
    { text: 'Captain energy 🔥 Paltan ready hai', deltas:{ form:3, fame:2, trust:3 }, toast:'Hardik saw this. Trust +3' },
    { text: 'What role should I focus on?', deltas:{ form:2, fame:0, trust:4 }, toast:'Good question. Trust +4' },
    { text: 'I\'m ready for any situation', deltas:{ form:2, fame:1, trust:3 }, toast:'Hardik approves. Trust +3' },
  ],
  rohit: [
    { text: 'Tempo advice please Ro bhai 🙏', deltas:{ form:3, fame:0, trust:4 }, toast:'Rohit noticed. Form +3' },
    { text: 'Shot tha 🔥', deltas:{ form:4, fame:1, trust:2 }, toast:'Rohit smiles. Form +4' },
    { text: 'This is everything 💙', deltas:{ form:3, fame:0, trust:3 }, toast:'Rohit approves. Form +3' },
  ],
  surya: [
    { text: 'Legend 😄 Field dekh phir pagal ban', deltas:{ form:4, fame:2, trust:2 }, toast:'Surya liked this 🔥' },
    { text: 'Teach me the angles please 🙏', deltas:{ form:3, fame:1, trust:3 }, toast:'Surya says come to nets. Form +3' },
    { text: 'Champion energy 💙', deltas:{ form:4, fame:2, trust:1 }, toast:'Surya energy unlocked. Fame +4' },
  ],
  bumrah: [
    { text: 'Learning from the best 🏏', deltas:{ form:2, fame:0, trust:4 }, toast:'Bumrah noted this. Trust +4' },
    { text: 'Still learning slower ball timing', deltas:{ form:3, fame:0, trust:5 }, toast:'Bumrah respects honesty. Form +3' },
    { text: 'Nets tomorrow?', deltas:{ form:2, fame:0, trust:4 }, toast:'Bumrah approves. Form +3' },
  ],
  tilak: [
    { text: 'Role model hai bhai 💙', deltas:{ form:3, fame:1, trust:3 }, toast:'Tilak trusts you more. Trust +3' },
    { text: 'Sikhta rehta hoon', deltas:{ form:2, fame:0, trust:4 }, toast:'Tilak respects this. Trust +4' },
    { text: 'Same energy 🔥', deltas:{ form:3, fame:2, trust:2 }, toast:'Young table approved. Trust +2' },
  ],
}

function CricketSeedFeed({ likedPosts, commentedPosts, postComments, myHandle, onLike, onComment, commentOpen, onHandleComment, playingCharName, onViewChar }: CricketSeedProps) {
  const cricketChars = { ...getCHChars(), ...getCricketChars() }

  const seedPost = (id: string, charKey: string, bg: string, caption: string, fullCaption: string, likes: string, time: string, imageUrl?: string) => {
    const char = cricketChars[charKey]
    if (!char) return null
    const liked = likedPosts.has(id)
    const commented = commentedPosts.has(id)
    const comments = CRICKET_COMMENTS[charKey] ?? []
    return (
      <div key={id} className="post">
        <div className="post-head">
          <button className={`av ${char.cls}`}
            style={{ width:34, height:34, fontSize:14, padding:0, backgroundImage:`url(/avatars/${charKey}.png)`, backgroundSize:'cover', backgroundPosition:'center', border:'none', cursor:'pointer' }}
            onClick={() => onViewChar(char.id as CharId)}>
            <span style={{ opacity:0 }}>{char.init}</span>
          </button>
          <div className="post-id">
            <div className="h">{char.handle}</div>
            <div className="s">{time.toLowerCase()}</div>
          </div>
          <button className="icon-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>
        </div>
        <div className="post-img grain" style={{
          background: imageUrl ? 'none' : bg,
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: imageUrl ? 'cover' : undefined,
          backgroundPosition: imageUrl ? 'center' : undefined,
        }}>
          {!imageUrl && <p className="overlay-txt" style={{ fontSize:14 }}>{caption}</p>}
        </div>
        <ActionRow
          like={
            <button onClick={() => !liked && onLike(id, char.id as CharId, 3)} style={{ opacity: liked ? 0.6 : 1, cursor: liked ? 'default' : 'pointer' }}>
              <svg viewBox="0 0 24 24" fill={liked ? 'var(--accent)' : 'none'} stroke={liked ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          }
          comment={
            comments.length > 0 && !commented
              ? <button onClick={() => onComment(commentOpen === id ? null : id)}><CommentIcon active={commentOpen===id} /></button>
              : <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          }
          likes={compactCount(likeNum(likes))}
          comments={sideCounts(likeNum(likes)).comments}
        />
        {commentOpen === id && comments.length > 0 && !commented && (
          <div className="comment-sheet">
            <div className="comment-sheet-label">Comment as {playingCharName}</div>
            {comments.map((opt, j) => (
              <button key={j} className="comment-option" onClick={() => onHandleComment(charKey, id, opt)}>{opt.text}</button>
            ))}
          </div>
        )}
        <div className="caption"><b>{char.handle}</b> {fullCaption}</div>
        {postComments[id] && (
          <div className="caption cmt-in" style={{ paddingTop: 2, color: 'rgba(255,255,255,.85)' }}><b>{myHandle}</b> {postComments[id]}</div>
        )}
        <div className="ts" style={{ padding:'2px 14px 12px' }}>{time}</div>
      </div>
    )
  }

  return (
    <>
      {/* Hardik */}
      {seedPost('hardik-seed', 'hardik', '',
        '"Ready rehna. Role-ready hota hai, reel-ready nahi." — Wankhede ki pehli practice. Season 1 starts now. 💙',
        'Team set hai. Kaam shuru. #MumbaiIndians #IPL',
        '284,102', '3 HOURS AGO', '/generated/cricket-posts/seed-hardik.png')}

      {/* Rohit */}
      {seedPost('rohit-seed', 'rohit', '',
        'Pehle 12 ball survive karo. Phir game tumhara. Simple nahi. Lekin sach. 🏏',
        'Tempo. Bas. #Cricket #MumbaiIndians',
        '512,884', '5 HOURS AGO', '/generated/cricket-posts/seed-rohit.png')}

      {/* @paltanpulse gossip account */}
      {(() => {
        const hwLiked = likedPosts.has('paltan-seed')
        const hwCommented = commentedPosts.has('paltan-seed')
        return (
          <div className="post">
            <div className="post-head">
              <div className="av" style={{ width:34, height:34, fontSize:11, background:'#003087', fontWeight:800, display:'grid', placeItems:'center', borderRadius:'50%' }}>P</div>
              <div className="post-id">
                <div className="h">paltanpulse</div>
                <div className="s">2.1M followers · 1h ago</div>
              </div>
              <button className="icon-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>
            </div>
            <div className="post-img grain" style={{ backgroundImage:'url(/generated/cricket-posts/seed-paltanpulse.png)', backgroundSize:'cover', backgroundPosition:'center' }} />
            <ActionRow
              like={
                <button onClick={() => !hwLiked && onLike('paltan-seed', 'hardik' as CharId, 1)} style={{ opacity: hwLiked ? 0.6 : 1, cursor: hwLiked ? 'default' : 'pointer' }}>
                  <svg viewBox="0 0 24 24" fill={hwLiked ? 'var(--accent)':'none'} stroke={hwLiked ? 'var(--accent)':'#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              }
              comment={
                !hwCommented
                  ? <button onClick={() => onComment(commentOpen === 'paltan-seed' ? null : 'paltan-seed')}><CommentIcon active={commentOpen==='paltan-seed'} /></button>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              }
              likes={compactCount(94102)} comments={sideCounts(94102).comments}
            />
            {commentOpen === 'paltan-seed' && !hwCommented && (
              <div className="comment-sheet">
                <div className="comment-sheet-label">Comment as {playingCharName}</div>
                {[
                  { text:'Paltan tum sahi ho 💙 Dekho mujhe', deltas:{ form:5, fame:2, trust:2 }, toast:'Paltan noticed you. Fame +5' },
                  { text:'Nervous thoda, excited zyada 🏏', deltas:{ form:3, fame:1, trust:3 }, toast:'Relatable energy. Fame +3' },
                  { text:'Abhi sirf kaam. Baaki sab baad mein 💙', deltas:{ form:2, fame:0, trust:4 }, toast:'Trust move. Image +4' },
                ] .map((opt, i) => (
                  <button key={i} className="comment-option" onClick={() => onHandleComment('paltan', 'paltan-seed', opt)}>{opt.text}</button>
                ))}
              </div>
            )}
            <div className="caption"><b>paltanpulse</b> Remember the name. #Paltan 💙</div>
            {postComments['paltan-seed'] && (
              <div className="caption cmt-in" style={{ paddingTop: 2, color: 'rgba(255,255,255,.85)' }}><b>{myHandle}</b> {postComments['paltan-seed']}</div>
            )}
            <div className="ts" style={{ padding:'2px 14px 12px' }}>1 HOUR AGO</div>
          </div>
        )
      })()}

      {/* Surya */}
      {seedPost('surya-seed', 'surya', 'linear-gradient(135deg,#004080,#001a40)',
        'Freedom ka matlab random nahi hota. Field dekh, phir pagal ban. T20 mein yahi farak hai. 😄🏏',
        'Range-hitting session done. #SKY #MumbaiIndians',
        '891,204', '2 HOURS AGO', '/generated/cricket-posts/seed-surya.png')}

      {/* Bumrah */}
      {seedPost('bumrah-seed', 'bumrah', '',
        'Nets mein ego nahi chalta. Bas information. Good players adjust after one mistake.',
        'Work. Always. #Bumrah #MumbaiIndians',
        '1,204,441', '4 HOURS AGO', '/generated/cricket-posts/seed-bumrah.png')}

      {/* @cricketroom_india */}
      {(() => {
        const crLiked = likedPosts.has('cricketroom-seed')
        return (
          <div className="post">
            <div className="post-head">
              <div className="av" style={{ width:34, height:34, fontSize:10, background:'#1a2a3a', fontWeight:800, display:'grid', placeItems:'center', borderRadius:'50%', color:'rgba(255,255,255,.7)' }}>CR</div>
              <div className="post-id">
                <div className="h">cricketroom_india</div>
                <div className="s">890K followers · 45m ago</div>
              </div>
            </div>
            <div className="post-img grain" style={{ backgroundImage:'url(/generated/cricket-posts/seed-cricketroom.png)', backgroundSize:'cover', backgroundPosition:'center' }} />
            <ActionRow
              like={
                <button onClick={() => !crLiked && onLike('cricketroom-seed', 'rohit' as CharId, 1)} style={{ opacity: crLiked ? 0.6 : 1, cursor: crLiked ? 'default' : 'pointer' }}>
                  <svg viewBox="0 0 24 24" fill={crLiked?'var(--accent)':'none'} stroke={crLiked?'var(--accent)':'#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              }
              comment={<CommentIcon />}
              likes={compactCount(29441)} comments={sideCounts(29441).comments}
            />
            <div className="caption"><b>cricketroom_india</b> Trust takes time. Hype doesn't.</div>
            <div className="ts" style={{ padding:'2px 14px 12px' }}>45 MINUTES AGO</div>
          </div>
        )
      })()}

      {/* Tilak */}
      {seedPost('tilak-seed', 'tilak', 'linear-gradient(135deg,#2a5a8f,#0a1a40)',
        'Hype sabko milta hai kabhi na kabhi. Trust repeat performances se milta hai. Season 1 is just the beginning. 💙',
        'Process pe raho. #TilakVarma #MumbaiIndians',
        '342,108', '6 HOURS AGO', '/generated/cricket-posts/seed-tilak.png')}

      {/* @futurexi */}
      {(() => {
        const fxLiked = likedPosts.has('futurexi-seed')
        return (
          <div className="post">
            <div className="post-head">
              <div className="av" style={{ width:34, height:34, fontSize:10, background:'#2a1a4a', fontWeight:800, display:'grid', placeItems:'center', borderRadius:'50%' }}>FX</div>
              <div className="post-id">
                <div className="h">futurexi</div>
                <div className="s">1.4M followers · 2h ago</div>
              </div>
            </div>
            <div className="post-img grain" style={{ backgroundImage:'url(/generated/cricket-posts/seed-futurexi.png)', backgroundSize:'cover', backgroundPosition:'center' }} />
            <ActionRow
              like={
                <button onClick={() => !fxLiked && onLike('futurexi-seed', 'tilak' as CharId, 2)} style={{ opacity: fxLiked ? 0.6 : 1, cursor: fxLiked ? 'default' : 'pointer' }}>
                  <svg viewBox="0 0 24 24" fill={fxLiked?'var(--accent)':'none'} stroke={fxLiked?'var(--accent)':'#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              }
              comment={<CommentIcon />}
              likes={compactCount(182204)} comments={sideCounts(182204).comments}
            />
            <div className="caption"><b>futurexi</b> This is only the beginning. 🏏</div>
            <div className="ts" style={{ padding:'2px 14px 12px' }}>2 HOURS AGO</div>
          </div>
        )
      })()}
    </>
  )
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

export default function FeedScreen() {
  const { navigate, goBack, showToast, game, screen, likePost, likedPosts, postComments, addPostComment, applyFeedDeltas, setViewingChar, dmBadgeCount, relationshipAlerts, pendingPostReveal, setPendingPostReveal, upsertAiPost, notifyDM, setHudReaction } = useApp()

  // Mark how many posts the player has "seen" — recorded only while the Feed is the
  // ACTIVE screen (Slots keep every screen mounted). The Live sheet's "N new" badge
  // reads this: new posts ≈ choices played since the Feed was last open.
  useEffect(() => {
    if (screen === 'feed' && typeof window !== 'undefined') {
      localStorage.setItem('lore_feed_seen_choices', String(game.choices.length))
    }
  }, [screen, game.choices.length])
  const [revealCount, setRevealCount] = useState(0)
  const [liveLikes, setLiveLikes] = useState(0)
  const [gainShown, setGainShown] = useState(false)
  const [climbing, setClimbing] = useState(false)
  const revealKeyRef = useRef<string | null>(null)
  const [commentPost, setCommentPost] = useState<string | null>(null)
  // Posted comments are PERSISTED game state (postId → text) — the Set is derived.
  const commentedPosts = useMemo(() => new Set(Object.keys(postComments)), [postComments])
  const myHandle = (game.playerName || 'you').toLowerCase().replace(/\s+/g, '')

  // World intro overlay
  const [showIntro, setShowIntro] = useState(false)
  const [introGone, setIntroGone] = useState(false)
  const [introLines, setIntroLines] = useState<boolean[]>([false, false, false, false, false, false])

  // Show world intro overlay on first visit to feed (after world-intro screen)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('lore_feed_seen')
      if (!seen) {
        localStorage.setItem('lore_feed_seen', '1')
        setShowIntro(true)
        const delays = [200, 500, 900, 1300, 1700, 2100]
        delays.forEach((d, i) => {
          setTimeout(() => {
            setIntroLines(prev => { const next = [...prev]; next[i] = true; return next })
          }, d)
        })
      }
    }
  }, [])

  const dismissIntro = useCallback(() => {
    setIntroGone(true)
    setTimeout(() => setShowIntro(false), 500)
  }, [])

  const isCricket = game.world === 'cricket'

  // Tab bar (Live is no longer a tab — it's entered via the docked LiveEntryCard)
  const handleTab = useCallback((tab: string) => {
    if (tab === 'profile') navigate('profile')
    else if (tab === 'dms') navigate('dm-inbox')
  }, [navigate])


  const allChars = { ...getCHChars(), ...getCricketChars() }
  const playingChar = game.char ? (allChars[game.char] ?? null) : null
  const worldLabel = isCricket ? 'Indian Dressing Room' : 'Creator House'

  // Player's run → feed posts (newest first). Shared with the world profile.
  // Overnight storm first (the morning newspaper), then the replayed run.
  const completedPosts = useMemo<FeedPost[]>(
    () => [...deriveOvernightPosts(game), ...derivePosts(game)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game.choices, game.char, isCricket, game.aiPosts, game.week, game.selections, game.gateResults],
  )

  const handleComment = useCallback((postKey: string, postId: string, opt: PostCommentOption) => {
    setCommentPost(null)
    addPostComment(postId, opt.text)
    const charName = allChars[postKey]?.name
    applyFeedDeltas(opt.deltas, postKey, charName, opt.relationshipDeltas)
  }, [applyFeedDeltas, addPostComment])

  // Mark a post commented + close the sheet (AI comment path; the DM trigger lives
  // inside CommentComposer).
  const markCommented = useCallback((postId: string, text: string) => {
    setCommentPost(null)
    addPostComment(postId, text)
  }, [addPostComment])

  // Stream a freshly-posted player post: reactions appear one at a time, likes
  // climb, the follower receipt shows, and any DM lands as an app-wide notification.
  useEffect(() => {
    if (!pendingPostReveal) return
    const key = pendingPostReveal
    if (revealKeyRef.current === key) return
    const ai = game.aiPosts?.[key]
    if (!ai) return
    revealKeyRef.current = key
    const n = ai.reactions?.length ?? 0
    const target = ai.likes ?? 9000
    const gain = ai.followerDelta ?? 0
    const dms = ai.dms ?? []
    const followersNow = fameToFollowers(game.meters.fame)
    const seed = Math.round(target * 0.03)
    setRevealCount(0); setLiveLikes(seed); setClimbing(true); setGainShown(false)
    const timers: ReturnType<typeof setTimeout>[] = []
    // Land the player ON their new post — not wherever the feed was scrolled —
    // so the streaming reactions/likes play in view.
    timers.push(setTimeout(() => {
      document.getElementById(`fp-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 350))
    const rafs: number[] = []
    // After a beat: pop the gain chip, animate the HUD followers, climb the likes (RAF
    // ease-out), stream comments one at a time, then fire the DM notification.
    timers.push(setTimeout(() => {
      setGainShown(true)
      setHudReaction({ base: followersNow - gain, gain, key })
      const t0 = performance.now()
      const step = (now: number) => {
        let p = Math.min(1, (now - t0) / 2400); p = 1 - Math.pow(1 - p, 3)
        setLiveLikes(Math.round(seed + (target - seed) * p))
        if (p < 1) rafs.push(requestAnimationFrame(step)); else { setLiveLikes(target); setClimbing(false) }
      }
      rafs.push(requestAnimationFrame(step))
      for (let i = 0; i < n; i++) timers.push(setTimeout(() => setRevealCount(c => Math.max(c, i + 1)), 1100 + i * 950))
      // Reaction DMs quote the post they're reacting to — the first one carries
      // the post as an embed (Maddy sending your own post back at you).
      const postEmbed = { caption: ai.caption, imageUrl: ai.imageUrl, handle: (game.playerName || 'you').toLowerCase().replace(/\s+/g, '') }
      dms.forEach((d, i) => timers.push(setTimeout(() => notifyDM(d.char, d.text, i === 0 ? postEmbed : undefined), 1100 + n * 950 + i * 900)))
      timers.push(setTimeout(() => {
        upsertAiPost(key, { revealed: true }); setPendingPostReveal(null); setHudReaction(null); revealKeyRef.current = null
      }, 1100 + n * 950 + dms.length * 900 + 600))
    }, 420))
    return () => { timers.forEach(clearTimeout); rafs.forEach(cancelAnimationFrame) }
  }, [pendingPostReveal, game.aiPosts, game.meters.fame, setHudReaction, notifyDM, upsertAiPost, setPendingPostReveal])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <StatusBar />

      {/* App bar */}
      <div className="appbar feed-appbar">
        <div className="row1">
          <button
            onClick={() => navigate('worlds')}
            style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color:'var(--ink2)', fontSize:13, fontWeight:600, fontFamily:'var(--sans)', padding:'12px 4px', minHeight:44 }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            Exit
          </button>
          <div className="feed-title">
            {playingChar ? (
              <span>
                {worldLabel}
                <span style={{ fontSize:10, color: isCricket ? '#FFB020' : 'var(--accent)', fontWeight:700, marginLeft:7, letterSpacing:'.04em' }}>
                  ● {(game.playerName || 'You').toUpperCase()}
                </span>
              </span>
            ) : worldLabel}
          </div>
          <button className="icon-btn" onClick={() => navigate('profile')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </button>
        </div>
        <div className="feed-live" style={isCricket ? { color: '#FFB020' } : {}}>
          <div className="pulse" style={isCricket ? { background: '#FFB020' } : {}} />
          {isCricket
            ? `LIVE — MUMBAI INDIANS · WEEK ${game.week ?? 1} OF 3`
            : `LIVE — CREATOR HOUSE · DAY ${Math.min(10, Math.ceil((game.situation + 1) / 3))} OF 10`}
        </div>
      </div>

      {/* Shared HUD. Creator House: followers only (MeterHUD Row 1) — the 3 meters and
          the trust-based eviction status are gone per the goals redesign (crush status
          lives in her DM; the contextual objective gets its own card later). */}
      <MeterHUD />

      {/* Scrollable feed */}
      <div className="scroll" style={{ flex: 1 }}>

        {/* Relationship fallout posts — only when an individual trust crosses below 30 */}
        {isCricket && relationshipAlerts.map((alert, i) => {
          const timeLabel = i === 0 ? 'just now' : `${i + 1} min ago`
          return (
            <div key={alert.id} className="post" style={{ borderTop: '2px solid rgba(255,45,120,.3)', background: 'rgba(255,45,120,.04)' }}>
              <div className="post-head">
                <div className="av" style={{ width:34, height:34, fontSize:14, background:'#0047AB' }}>P</div>
                <div className="post-id">
                  <div className="h">{alert.handle}</div>
                  <div className="s" style={{ color: 'var(--accent)' }}>
                    {postContextLabel('Paltan Pulse · fan page', 'MI Season 1', timeLabel)}
                  </div>
                </div>
                <button className="icon-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>
              </div>
              <div
                className="post-img grain"
                style={{
                  background: 'linear-gradient(to bottom, #0047ABbb 0%, #0047AB66 55%, #0a0a18 100%)',
                  alignItems:'flex-end',
                }}
              >
                <p className="overlay-txt" style={{ fontSize:14, textShadow:'0 1px 8px rgba(0,0,0,.7)' }}>{resolveTokens(alert.caption, game.playerName, game.playerGender)}</p>
              </div>
              <ActionRow
                like={<svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
                comment={<CommentIcon />}
                likes={compactCount(likeNum(feedLikes(i, isCricket)))} comments={sideCounts(likeNum(feedLikes(i, isCricket))).comments}
              />
              <div className="caption"><b>{alert.handle}</b> {resolveTokens(alert.caption, game.playerName, game.playerGender)}</div>
              <div className="ts" style={{ padding:'2px 14px 12px' }}>{timeLabel.toUpperCase()}</div>
            </div>
          )
        })}

        {/* Accumulated posts — newest first: player's own posts + NPC reactions */}
        {completedPosts.map((post, i) => {
          const isNew = i === 0
          const timeLabel = postAgeLabel(post.stepIndex, game.choices.length, post.postOffset)
          const timeLabelUpper = postAgeLabel(post.stepIndex, game.choices.length, post.postOffset, true)
          if (post.type === 'authored') {
            const pc = post.owner
            const liked = likedPosts.has(post.postId)
            // Live-generated player post: stream its reactions + climbing likes.
            const aiKey = `${post.sit.id}-${post.choice}`
            const ai = pc.isPlayer ? game.aiPosts?.[aiKey] : undefined
            const isRevealing = !!ai && pendingPostReveal === aiKey
            const likesVal = ai ? (isRevealing ? liveLikes : (ai.likes ?? 0)) : likeNum(feedLikes(i, isCricket))
            const likesStr = compactCount(likesVal)
            const shownReactions = ai ? (isRevealing ? post.reactions.slice(0, revealCount) : post.reactions) : post.reactions.slice(0, 1)
            return (
              <div key={post.postId} id={`fp-${aiKey}`} className="post" style={isNew ? { borderTop: '2px solid rgba(255,45,120,.3)', background: 'rgba(255,45,120,.04)' } : {}}>
                <div className="post-head">
                  <div className={pc.cls ? `av ${pc.cls}` : 'av'} style={{ width:34, height:34, fontSize:14, background: pc.avatarUrl ? undefined : pc.color, backgroundImage: pc.avatarUrl ? `url(${pc.avatarUrl})` : undefined, backgroundSize:'cover', backgroundPosition:'center' }}>
                    {!pc.avatarUrl && pc.init}
                  </div>
                  <div className="post-id">
                    <div className="h">{pc.handle} {pc.isPlayer && <span style={{ fontSize:10, color:'var(--accent)', fontWeight:700, marginLeft:4 }}>YOU</span>}</div>
                    <div className="s" style={{ color: isNew ? 'var(--accent)' : 'var(--ink3)' }}>
                      {postContextLabel(post.label, isCricket ? 'MI Season 1' : 'Creator House', timeLabel)}
                    </div>
                  </div>
                  {isRevealing && gainShown
                    ? <span className={`feed-gchip${(ai!.followerDelta ?? 0) < 0 ? ' drop' : ''}`}>{((ai!.followerDelta ?? 0) >= 0 ? '▲ +' : '▼ ') + Math.abs(ai!.followerDelta ?? 0).toLocaleString('en-IN')}</span>
                    : <button className="icon-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>}
                </div>
                <div
                  className={`post-img grain ${pc.cls}`}
                  style={{
                    background: post.imageUrl
                      ? `linear-gradient(to bottom, rgba(0,0,0,.05) 0%, rgba(0,0,0,.12) 52%, rgba(0,0,0,.62) 100%), url(${post.imageUrl}) center/cover`
                      : pc.id === '__account'
                        ? `linear-gradient(to bottom, ${pc.color}bb 0%, ${pc.color}66 55%, #0a0a18 100%)`
                        : charBg(pc.id),
                    alignItems:'flex-end',
                  }}
                >
                  {!post.imageUrl && (
                    <p className="overlay-txt" style={{ fontSize:14, textShadow:'0 1px 8px rgba(0,0,0,.7)' }}>{resolveTokens(post.caption, game.playerName, game.playerGender)}</p>
                  )}
                </div>
                <div className="post-actions pa-counts">
                  <button className="pa-item" onClick={() => !liked && pc.likeTarget && likePost(post.postId, pc.likeTarget, 2)} disabled={pc.isPlayer} style={{ opacity: (!pc.isPlayer && liked) ? 0.7 : 1 }}>
                    <svg viewBox="0 0 24 24" fill={liked ? 'var(--accent)' : 'none'} stroke={liked ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span>{likesStr}</span>
                  </button>
                  <div className="pa-item">
                    <CommentIcon />
                    <span>{shownReactions.length}</span>
                  </div>
                  {isRevealing && climbing && <span className="feed-livetag" style={{ marginLeft: 'auto' }}>▲ live</span>}
                </div>
                <div className="caption"><b>{pc.handle}</b> {resolveTokens(post.caption, game.playerName, game.playerGender)}</div>
                {/* Threaded reactions — NPC + fan comments on your post (streamed for AI posts) */}
                {shownReactions.length > 0 && (
                  <div style={{ padding: '4px 14px 4px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {shownReactions.map((rx, j) => {
                      const isFan = rx.char === '__fan'
                      const rxChar = isFan ? null : (allChars[rx.char as CharId] ?? null)
                      return (
                        <div key={j} className={`caption${isRevealing ? ' cmt-in' : ''}`} style={{ padding: 0, color: 'rgba(255,255,255,.78)' }}>
                          <b>{isFan ? (rx.name ?? 'fan') : (rxChar?.handle ?? rx.char)}</b> {resolveTokens(rx.text, game.playerName, game.playerGender)}
                        </div>
                      )
                    })}
                  </div>
                )}
                {postComments[post.postId] && (
                  <div className="caption cmt-in" style={{ padding: '2px 14px 0', color: 'rgba(255,255,255,.85)' }}><b>{myHandle}</b> {postComments[post.postId]}</div>
                )}
                {/* Authored comment hooks — your reply moves real bonds (story reads it back) */}
                {!pc.isPlayer && (post.comments?.length ?? 0) > 0 && !commentedPosts.has(post.postId) && (
                  <div style={{ padding: '2px 14px 6px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.08em', color: 'var(--ink3)' }}>REPLY KARO — sab dekh rahe hain</div>
                    {post.comments!.map((opt, j) => (
                      <button key={j} className="comment-option" onClick={() => handleComment(pc.id, post.postId, opt)}>{opt.text}</button>
                    ))}
                  </div>
                )}
                <div className="ts" style={{ padding:'2px 14px 12px' }}>{timeLabelUpper}</div>
              </div>
            )
          }

          // NPC feedReaction post
          const reactChar = post.char
          const liked = likedPosts.has(post.postId)
          const commented = commentedPosts.has(post.postId)
          return (
            <div key={post.postId} className="post" style={isNew ? { borderTop: '2px solid rgba(255,45,120,.3)', background: 'rgba(255,45,120,.04)' } : {}}>
              <div className="post-head">
                <button
                  className={`av ${reactChar.cls}`}
                  style={{ width:34, height:34, fontSize:14, padding:0, backgroundImage:`url(/avatars/${reactChar.id}.png)`, backgroundSize:'cover', backgroundPosition:'center', border:'none', cursor:'pointer' }}
                  onClick={() => setViewingChar(reactChar.id)}
                >
                  <span style={{ opacity:0 }}>{reactChar.init}</span>
                </button>
                <div className="post-id">
                  <div className="h">{reactChar.handle}</div>
                  <div className="s" style={{ color: isNew ? 'var(--accent)' : 'var(--ink3)' }}>
                    {(isCricket ? 'MI Season 1' : 'Creator House') + ` · ${timeLabel}`}
                  </div>
                </div>
                <button className="icon-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>
              </div>
              <div className={`post-img grain ${reactChar.cls}`} style={{ background: charBg(reactChar.id) }}>
                <p className="overlay-txt" style={{ fontSize:14 }}>{resolveTokens(post.reaction.caption, game.playerName, game.playerGender)}</p>
              </div>
              <ActionRow
                like={
                  <button onClick={() => !liked && likePost(post.postId, reactChar.id, 2)} style={{ opacity: liked ? 0.6 : 1, cursor: liked ? 'default' : 'pointer' }}>
                    <svg viewBox="0 0 24 24" fill={liked ? 'var(--accent)' : 'none'} stroke={liked ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                }
                comment={
                  !commented
                    ? <button onClick={() => setCommentPost(commentPost === post.postId ? null : post.postId)}><CommentIcon active={commentPost===post.postId} /></button>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                }
                likes={compactCount(likeNum(feedLikes(i, isCricket)))} comments={sideCounts(likeNum(feedLikes(i, isCricket))).comments}
              />
              <div className="caption"><b>{reactChar.handle}</b> {resolveTokens(post.reaction.caption, game.playerName, game.playerGender)}</div>
              {postComments[post.postId] && (
                <div className="caption cmt-in" style={{ paddingTop: 2, color: 'rgba(255,255,255,.85)' }}><b>{myHandle}</b> {postComments[post.postId]}</div>
              )}
              {commentPost === post.postId && !commented && (
                <CommentComposer
                  character={{ id: reactChar.id, name: reactChar.name, handle: reactChar.handle }}
                  post={{ caption: resolveTokens(post.reaction.caption, game.playerName, game.playerGender) }}
                  onDone={t => markCommented(post.postId, t)}
                />
              )}
              <div className="ts" style={{ padding:'2px 14px 12px' }}>{timeLabelUpper}</div>
            </div>
          )
        })}

        {/* Story Drop moved out of the scroll — now a docked LiveEntryCard above the tab bar */}

        {/* Seed posts — world-specific */}
        {isCricket ? (
          <CricketSeedFeed
            likedPosts={likedPosts} commentedPosts={commentedPosts}
            postComments={postComments} myHandle={myHandle}
            onLike={likePost} onComment={setCommentPost}
            commentOpen={commentPost} onHandleComment={handleComment}
            playingCharName={game.playerName || 'You'}
            onViewChar={setViewingChar}
          />
        ) : (
          <>
        {/* Ria */}
        <SeedPost
          id="ria-seed" myComment={postComments['ria-seed']} charId="ria" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#b03a5e,#4a0820)"
          caption="Pehla din. Pehla room. Pehle mujhe. Kuch cheezein change nahi honti. 🤍"
          fullCaption="Kaafi log poochte hain — 'Ria, tujhe stress nahi hota?' Stress? Main stress ko content mein convert karti hoon. 🤍"
          likes="84,291" time="6 HOURS AGO"
          imageUrl="/generated/creator-house-posts/seed-ria.png"
          likedPosts={likedPosts} commentedPosts={commentedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={getCHPostComments().ria}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'} onCommentSent={markCommented} myHandle={myHandle}
        />

        {/* Zoya */}
        <SeedPost
          id="zoya-seed" myComment={postComments['zoya-seed']} charId="zoya" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#aa6a8a,#2a0a1a)"
          caption="Naye log. Naye vibes. Is ghar mein sab interesting lagte hain. Especially ek. 👀🫶"
          fullCaption="Day 1 done. Chai piya. Kuch connections bane. Kuch strategies bhi. #CreatorHouse"
          likes="29,441" time="5 HOURS AGO"
          imageUrl="/generated/creator-house-posts/seed-zoya.png"
          likedPosts={likedPosts} commentedPosts={commentedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={getCHPostComments().zoya}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'} onCommentSent={markCommented} myHandle={myHandle}
        />

        {/* housewatch_india gossip account */}
        {(() => {
          const hwLiked = likedPosts.has('hw-seed')
          const hwCommented = commentedPosts.has('housewatch')
          return (
            <div className="post">
              <div className="post-head">
                <div className="av" style={{ width:34, height:34, fontSize:14, background:'#1c1c26', fontWeight:800 }}>H</div>
                <div className="post-id">
                  <div className="h">housewatch_india</div>
                  <div className="s">2.8M followers · 2h ago</div>
                </div>
                <button className="icon-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>
              </div>
              <div className="post-img grain" style={{ backgroundImage:'url(/generated/creator-house-posts/seed-villa.png)', backgroundSize:'cover', backgroundPosition:'center' }} />
              <ActionRow
                like={
                  <button onClick={() => !hwLiked && likePost('hw-seed', 'ria', 1)} style={{ opacity: hwLiked ? 0.6 : 1, cursor: hwLiked ? 'default' : 'pointer' }}>
                    <svg viewBox="0 0 24 24" fill={hwLiked ? 'var(--accent)' : 'none'} stroke={hwLiked ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                }
                comment={
                  !hwCommented
                    ? <button onClick={() => setCommentPost(commentPost === 'housewatch' ? null : 'housewatch')}><CommentIcon active={commentPost==='housewatch'} /></button>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                }
                likes={compactCount(94102)} comments={sideCounts(94102).comments}
              />
              {commentPost === 'housewatch' && !hwCommented && (
                <div className="comment-sheet">
                  <div className="comment-sheet-label">Comment as {playingChar?.name ?? 'you'}</div>
                  {getCHPostComments().housewatch.map((opt, i) => (
                    <button key={i} className="comment-option" onClick={() => handleComment('housewatch', 'housewatch', opt)}>{opt.text}</button>
                  ))}
                </div>
              )}
              <div className="caption"><b>housewatch_india</b> Pehla din. Thread kal. 👀 #CreatorHouse</div>
              {postComments['housewatch'] && (
                <div className="caption cmt-in" style={{ paddingTop: 2, color: 'rgba(255,255,255,.85)' }}><b>{myHandle}</b> {postComments['housewatch']}</div>
              )}
              <div className="ts" style={{ padding:'2px 14px 12px' }}>2 HOURS AGO</div>
            </div>
          )
        })()}

        {/* Kabir */}
        <SeedPost
          id="kabir-seed" myComment={postComments['kabir-seed']} charId="kabir" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#2a6f8f,#0a2a40)"
          caption="&quot;Is ghar mein sab serious ho jaate hain jab camera on hota hai. Main serious tab hota hoon jab camera off hota hai.&quot; 😭👀"
          fullCaption="Camera ka psychology. Day 1 observation thread kal. 😭"
          likes="41,882" time="3 HOURS AGO"
          imageUrl="/generated/creator-house-posts/seed-kabir.png"
          likedPosts={likedPosts} commentedPosts={commentedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={getCHPostComments().kabir}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'} onCommentSent={markCommented} myHandle={myHandle}
        />

        {/* Dev */}
        <SeedPost
          id="dev-seed" myComment={postComments['dev-seed']} charId="dev" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#3a7a4a,#0a2a1a)"
          caption="5AM. Gym done. Creator House Day 1 different hai. Numbers aayenge. Always do. 💪📈"
          fullCaption="Grind never stops. Villa ya gym — same mindset. #CreatorHouse #Fitness"
          likes="18,204" time="4 HOURS AGO"
          imageUrl="/generated/creator-house-posts/seed-dev.png"
          likedPosts={likedPosts} commentedPosts={commentedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={getCHPostComments().dev}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'} onCommentSent={markCommented} myHandle={myHandle}
        />

        {/* Ananya */}
        <SeedPost
          id="ananya-seed" myComment={postComments['ananya-seed']} charId="ananya" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#8a4ab0,#3a1660)"
          caption="2.1M views raat mein. Subah uthke dekha toh ro padi. Phir Ria ko bataya. Usne bola... 'nice.' 🥺✨"
          fullCaption="2.1M. Ro padi. Tumhara pyaar 🥺✨"
          likes="2,108,441" time="45 MINUTES AGO"
          imageUrl="/generated/creator-house-posts/seed-ananya.png"
          likedPosts={likedPosts} commentedPosts={commentedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={getCHPostComments().ananya}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'} onCommentSent={markCommented} myHandle={myHandle}
        />

          <div style={{ height: 20 }} />
          </>
        )}
        {isCricket && <div style={{ height: 20 }} />}
      </div>

      {/* Docked story entrypoint — replaces the old in-scroll Story Drop + Live tab */}
      <LiveEntryCard />

      {/* Tab bar — Feed · Messages · Profile (Live is entered via the card above) */}
      <div className="tabbar">
        <button className="tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>
          <span>Feed</span>
        </button>
        <button className="tab" onClick={() => handleTab('dms')} style={{ position: 'relative' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {dmBadgeCount > 0 && <div className="badge-num" style={{ top:0, right:8 }}>{dmBadgeCount > 9 ? '9+' : dmBadgeCount}</div>}
          <span>Messages</span>
        </button>
        <button className="tab" onClick={() => handleTab('profile')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <span>Profile</span>
        </button>
      </div>

      {/* World intro overlay */}
      {showIntro && !game.narrator_done && (
        <div className={`world-intro${introGone ? ' gone' : ''}`}
          style={isCricket ? { background: 'linear-gradient(160deg,#001540 0%,#08080F 60%)' } : {}}>
          <div className={`wi-line${introLines[0] ? ' in' : ''}`}>
            <div className="wi-pre" style={isCricket ? { color: '#FFB020' } : {}}>
              <div className="pulse" style={isCricket ? { background: '#FFB020' } : {}} />
              {isCricket ? 'LIVE · IPL SEASON 1 · MUMBAI INDIANS' : 'LIVE · DAY 1 OF 10'}
            </div>
          </div>
          <div className={`wi-line${introLines[1] ? ' in' : ''}`}>
            <div className="wi-title">{isCricket ? 'Indian Dressing Room.' : 'Creator House.'}</div>
          </div>
          <div className={`wi-line${introLines[2] ? ' in' : ''}`}>
            <div className="wi-meta">{isCricket ? 'Mumbai Indians. Wankhede. Your first IPL.' : '6 creators. Ek villa. 10 din ka experiment.'}</div>
          </div>
          <div className={`wi-line${introLines[3] ? ' in' : ''}`}>
            <div className="wi-drama" style={isCricket ? { borderLeftColor: '#003087', background: 'rgba(0,48,135,.1)' } : {}}>
              {isCricket
                ? <><b>Auction ho gayi. Draft ho gaya. Ab dressing room hai.</b> Hardik ka role, Rohit ki silence, Bumrah ka pehla over — sab tumse alag zyada jaante hain. Par abhi nahi. Yeh season tumhara bhi hai.</>
                : <><b>Aaj raat, villa khul raha hai.</b> 6 creators pehli baar mile hain. Koi dushman nahi, koi dost nahi — but by morning, alliances ban jaayengi. Tum kaun banna chahte ho?</>}
            </div>
          </div>
          <div className={`wi-line${introLines[4] ? ' in' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
              <div className="wi-chars">
                {(isCricket ? ['hardik','rohit','surya','bumrah','tilak'] : ['ria','kabir','ananya','dev','zoya']).map((id) => {
                  const c = allChars[id]
                  if (!c) return null
                  return (
                    <div key={id} className={`av ${c.cls}`} style={{ width: 32, height: 32, fontSize: 13, backgroundImage:`url(/avatars/${id}.png)`, backgroundSize:'cover', backgroundPosition:'center' }}>
                      <span style={{ opacity:0 }}>{c.init}</span>
                    </div>
                  )
                })}
              </div>
              <div className="wi-chars-label">{isCricket ? 'Mumbai Indians · IPL 2026' : '6 creators · 1.2M following'}</div>
            </div>
          </div>
          <div className={`wi-line${introLines[5] ? ' in' : ''}`}>
            <div className="wi-cta">
              <button className="wi-btn" style={isCricket ? { background: '#003087', boxShadow: '0 8px 24px rgba(0,48,135,.4)' } : {}} onClick={dismissIntro}>
                {isCricket ? 'Enter Dressing Room →' : 'Enter the House →'}
              </button>
              <button className="wi-skip-btn" onClick={dismissIntro}>Skip</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
