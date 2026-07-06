'use client'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useApp } from '@/lib/context'
import type { CharId, Choice, ChoicePost, Meters, CricketMeters, Reaction, Character } from '@/lib/types'
import type { PostCommentOption } from '@/lib/data'
import { getCricketChars, getCHChars, getCHPostComments } from '@/lib/content'
import { applyDeltas, resolveTokens, fameToFollowers } from '@/lib/game'
import { derivePosts, deriveOvernightPosts, deriveBeatBuzz, type FeedPost } from '@/lib/feed-posts'
import FeedTabsCoach from '@/components/screens/FeedTabsCoach'
import MeterHUD from '@/components/MeterHUD'
import LiveEntryCard from '@/components/LiveEntryCard'
import CommentComposer from '@/components/CommentComposer'

// Scroll a post to the top of the feed WITHOUT using Element.scrollIntoView — in a
// mobile WebView that bubbles to the window/page scroll and shoves the whole screen
// up, leaving blank space below the tab bar. Scroll ONLY the feed container.
function scrollFeedToPost(postId: string) {
  const sc = document.getElementById('feed-scroll')
  if (!sc) return
  const el = postId ? document.getElementById(postId) : null
  if (!el) { sc.scrollTo({ top: 0, behavior: 'smooth' }); return }
  const delta = el.getBoundingClientRect().top - sc.getBoundingClientRect().top
  sc.scrollTo({ top: Math.max(0, sc.scrollTop + delta), behavior: 'smooth' })
}

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

const postAgeLabel = (ageMinutes = 0, uppercase = false) => {
  const a = Math.max(0, Math.round(ageMinutes))
  let label: string
  if (a === 0) label = 'just now'
  else if (a < 60) label = `${a} min ago`
  else if (a < 24 * 60) label = `${Math.floor(a / 60)}h ago`
  else label = `${Math.floor(a / (24 * 60))}d ago`
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
      <PostImg imageUrl={imageUrl} bg={bg} pos="center top" caption={caption} />
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
  onCommentSent: (postId: string, text: string) => void
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

// Short personas so the AI comment-suggester speaks in-world for cricket posts.
const CRICKET_PERSONA: Record<string, string> = {
  hardik: 'the MI captain — decisive, team-first, no time for ego; approval is earned',
  rohit: 'the senior legend — unhurried, sparing with words, watches who you are becoming',
  surya: 'the warm, expressive senior who loves to teach; calls you champion/bhai',
  bumrah: 'the pace spearhead — minimal, technical, gives feedback once',
  tilak: 'your closest peer in the squad — friendly but measuring',
  naman: 'your direct rival for one middle-order slot — guarded, competitive',
  mahela: 'the head coach / selectorial brain — precise, numbers over adjectives',
}
// Fan-page / non-character accounts — commentable, AI-suggested, but they NEVER
// DM you back (canDM=false). DMs strike only from real story characters.
const FANPAGES: Record<string, { id: string; name: string; handle: string; persona: string }> = {
  paltan:      { id: 'paltanpulse',      name: 'Paltan Pulse', handle: 'paltanpulse',      persona: 'a rabid Mumbai Indians fan & gossip page — hype, banter, hot takes' },
  cricketroom: { id: 'cricketroom_india', name: 'Cricket Room', handle: 'cricketroom_india', persona: 'a big neutral cricket news & opinion page' },
  futurexi:    { id: 'futurexi',         name: 'Future XI',    handle: 'futurexi',         persona: "a talent-scouting page hyping India's next generation" },
}

function CricketSeedFeed({ likedPosts, commentedPosts, postComments, myHandle, onLike, onComment, commentOpen, onHandleComment, onCommentSent, playingCharName, onViewChar }: CricketSeedProps) {
  const cricketChars = { ...getCHChars(), ...getCricketChars() }
  void onHandleComment; void playingCharName

  const seedPost = (id: string, charKey: string, bg: string, caption: string, fullCaption: string, likes: string, time: string, imageUrl?: string) => {
    const char = cricketChars[charKey]
    if (!char) return null
    const liked = likedPosts.has(id)
    const commented = commentedPosts.has(id)
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
        <PostImg imageUrl={imageUrl} bg={bg} caption={caption} />
        <ActionRow
          like={
            <button onClick={() => !liked && onLike(id, char.id as CharId, 3)} style={{ opacity: liked ? 0.6 : 1, cursor: liked ? 'default' : 'pointer' }}>
              <svg viewBox="0 0 24 24" fill={liked ? 'var(--accent)' : 'none'} stroke={liked ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          }
          comment={
            !commented
              ? <button onClick={() => onComment(commentOpen === id ? null : id)}><CommentIcon active={commentOpen===id} /></button>
              : <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          }
          likes={compactCount(likeNum(likes))}
          comments={sideCounts(likeNum(likes)).comments}
        />
        {commentOpen === id && !commented && (
          <CommentComposer
            character={{ id: char.id, name: char.name, handle: char.handle }}
            post={{ caption: fullCaption, imageUrl }}
            persona={CRICKET_PERSONA[charKey]}
            canDM
            onDone={t => onCommentSent(id, t)}
          />
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
              <CommentComposer
                character={FANPAGES.paltan}
                post={{ caption: 'Remember the name. #Paltan 💙' }}
                persona={FANPAGES.paltan.persona}
                canDM={false}
                onDone={t => onCommentSent('paltan-seed', t)}
              />
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
              comment={
                !commentedPosts.has('cricketroom-seed')
                  ? <button onClick={() => onComment(commentOpen === 'cricketroom-seed' ? null : 'cricketroom-seed')}><CommentIcon active={commentOpen==='cricketroom-seed'} /></button>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              }
              likes={compactCount(29441)} comments={sideCounts(29441).comments}
            />
            {commentOpen === 'cricketroom-seed' && !commentedPosts.has('cricketroom-seed') && (
              <CommentComposer
                character={FANPAGES.cricketroom}
                post={{ caption: "Trust takes time. Hype doesn't." }}
                persona={FANPAGES.cricketroom.persona}
                canDM={false}
                onDone={t => onCommentSent('cricketroom-seed', t)}
              />
            )}
            <div className="caption"><b>cricketroom_india</b> Trust takes time. Hype doesn't.</div>
            {postComments['cricketroom-seed'] && (
              <div className="caption cmt-in" style={{ paddingTop: 2, color: 'rgba(255,255,255,.85)' }}><b>{myHandle}</b> {postComments['cricketroom-seed']}</div>
            )}
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
              comment={
                !commentedPosts.has('futurexi-seed')
                  ? <button onClick={() => onComment(commentOpen === 'futurexi-seed' ? null : 'futurexi-seed')}><CommentIcon active={commentOpen==='futurexi-seed'} /></button>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              }
              likes={compactCount(182204)} comments={sideCounts(182204).comments}
            />
            {commentOpen === 'futurexi-seed' && !commentedPosts.has('futurexi-seed') && (
              <CommentComposer
                character={FANPAGES.futurexi}
                post={{ caption: 'This is only the beginning. 🏏' }}
                persona={FANPAGES.futurexi.persona}
                canDM={false}
                onDone={t => onCommentSent('futurexi-seed', t)}
              />
            )}
            <div className="caption"><b>futurexi</b> This is only the beginning. 🏏</div>
            {postComments['futurexi-seed'] && (
              <div className="caption cmt-in" style={{ paddingTop: 2, color: 'rgba(255,255,255,.85)' }}><b>{myHandle}</b> {postComments['futurexi-seed']}</div>
            )}
            <div className="ts" style={{ padding:'2px 14px 12px' }}>2 HOURS AGO</div>
          </div>
        )
      })()}
    </>
  )
}

// Post images fade in when the bitmap is actually ready — no more pop-in.
function PostImg({ imageUrl, bg, pos, caption }: { imageUrl?: string; bg?: string; pos?: string; caption?: string }) {
  const [ready, setReady] = useState(!imageUrl)
  useEffect(() => {
    if (!imageUrl) { setReady(true); return }
    setReady(false)
    let live = true
    const im = new Image()
    im.onload = () => { if (live) setReady(true) }
    im.onerror = () => { if (live) setReady(true) }
    im.src = imageUrl
    if (im.complete) setReady(true)
    return () => { live = false }
  }, [imageUrl])
  return (
    <div className="post-img grain" style={{
      background: imageUrl ? 'none' : bg,
      backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
      backgroundSize: imageUrl ? 'cover' : undefined,
      backgroundPosition: imageUrl ? (pos ?? 'center') : undefined,
      opacity: ready ? 1 : 0,
      transition: 'opacity var(--t-load) ease',
    }}>
      {!imageUrl && <p className="overlay-txt" style={{ fontSize: 14 }}>{caption}</p>}
    </div>
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
  // "N new posts" bar shows on a fresh drop, then collapses the moment you scroll
  // past it — and STAYS gone (with the fresh highlight cleared) until the next
  // drop. Design ref: one scroll dismisses it.
  const [newsDismissed, setNewsDismissed] = useState(false)
  // Immersive feed: once you scroll in, the meters widget + story card collapse
  // (just a corner play button remains) so a full post fills the viewport. Both
  // restore at the top. Two-way, with a little hysteresis to avoid flicker.
  const [feedScrolled, setFeedScrolled] = useState(false)
  useEffect(() => {
    if (screen !== 'feed') return
    const sc = document.getElementById('feed-scroll')
    if (!sc) return
    const onScroll = () => {
      if (sc.scrollTop > 24) setNewsDismissed(true)
      setFeedScrolled(prev => prev ? sc.scrollTop > 20 : sc.scrollTop > 64)
    }
    sc.addEventListener('scroll', onScroll, { passive: true })
    return () => sc.removeEventListener('scroll', onScroll)
  }, [screen])
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
  // Chronology is sacred (founder): newest first. Posts YOU made this week sit
  // on top; the overnight storm is "last night's" news so it slots under them;
  // older weeks follow.
  const completedPosts = useMemo<FeedPost[]>(
    () => {
      // One flat list, sorted newest-first by each post's canonical age (stamped
      // at build time in derivePosts / deriveBeatBuzz / deriveOvernightPosts). The
      // sort key IS the value the post's "N min ago" label reads, so the on-feed
      // order and the shown timestamps can never disagree. Stable sort keeps
      // same-age posts in build order (newest-first).
      const all = [...derivePosts(game), ...deriveBeatBuzz(game), ...deriveOvernightPosts(game)]
      return all.sort((a, b) => (a.ageMinutes ?? 0) - (b.ageMinutes ?? 0))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game.choices, game.char, isCricket, game.aiPosts, game.week, game.selections, game.gateResults],
  )

  // "New posts" = the leading cluster from the LATEST beat (your post + its
  // reactions + the fan buzz). A "X new posts" pill sits at the top of the feed;
  // a "You're all caught up" divider closes the cluster before the older posts.
  const latestStep = useMemo(() => {
    let m = -1
    for (const p of completedPosts) if (p.stepIndex < 9000 && p.stepIndex > m) m = p.stepIndex
    return m
  }, [completedPosts])
  // The new cluster = the leading run of posts that AREN'T from an older beat.
  // Overnight-storm posts (stepIndex >= 9000) count as current, so a week-opening
  // storm sitting at the front doesn't cut the run short.
  const newCount = useMemo(() => {
    const isOld = (p: FeedPost) => p.stepIndex < 9000 && p.stepIndex < latestStep
    let n = 0
    while (n < completedPosts.length && !isOld(completedPosts[n])) n++
    return n
  }, [completedPosts, latestStep])
  // Colored avatar dots for the bar (up to 3 of the new posters).
  const newAvatars = useMemo(() => {
    const seen = new Set<string>(); const out: { color: string; letter: string }[] = []
    for (const p of completedPosts.slice(0, newCount)) {
      const id = p.type === 'authored' ? p.owner.handle : p.char.id
      const color = p.type === 'authored' ? (p.owner.color ?? '#1a2a3a') : (CHAR_COLORS_HEX[p.char.id] ?? '#1a2a3a')
      const letter = (p.type === 'authored' ? p.owner.init : p.char.init) || (id[0] ?? '?').toUpperCase()
      if (seen.has(id)) continue
      seen.add(id); out.push({ color, letter })
      if (out.length >= 3) break
    }
    return out
  }, [completedPosts, newCount])
  // A fresh drop (new latest beat) re-arms the bar + fresh highlight.
  useEffect(() => { setNewsDismissed(false) }, [latestStep])
  const showNewsBar = newCount > 0
  const freshOn = showNewsBar && !newsDismissed

  const scrollFeedTop = useCallback(() => {
    document.getElementById('feed-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const caughtUp = (
    <div key="feed-caughtup">
      <div className="caughtup-card">
        <span className="chk"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
        <h4>You&apos;re all caught up</h4>
        <p>Pichhle 24 ghante ke saare posts dekh liye. Neeche purane posts.</p>
      </div>
      <div className="olderlbl">Purane posts</div>
    </div>
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

  // Land on the NEW content when the feed becomes visible — never wherever it
  // was last scrolled (founder). A composing reveal anchors to that post; any
  // other new outcome snaps to top, where the newest post now lives.
  const lastSeenChoicesRef = useRef(-1)
  useEffect(() => {
    if (screen !== 'feed') return
    const fresh = game.choices.length !== lastSeenChoicesRef.current
    lastSeenChoicesRef.current = game.choices.length
    if (!fresh && !pendingPostReveal) return
    const t = setTimeout(() => {
      if (pendingPostReveal) scrollFeedToPost(`fp-${pendingPostReveal}`)
      else { const sc = document.getElementById('feed-scroll'); if (sc) sc.scrollTop = 0 }
    }, 250)
    return () => clearTimeout(t)
  }, [screen, game.choices.length, pendingPostReveal])

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
    timers.push(setTimeout(() => scrollFeedToPost(`fp-${key}`), 350))
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
      </div>

      {/* Shared HUD. Creator House: followers only (MeterHUD Row 1) — the 3 meters and
          the trust-based eviction status are gone per the goals redesign (crush status
          lives in her DM; the contextual objective gets its own card later). */}
      <div className={`hud-collapse${feedScrolled ? ' collapsed' : ''}`}>
        <MeterHUD />
      </div>

      {/* Scrollable feed */}
      <div id="feed-scroll" className="scroll" style={{ flex: 1 }}>

        {/* Slim "N new posts" bar — collapses the moment you scroll past it (ref) */}
        {showNewsBar && (
          <div className={`nbar${newsDismissed ? ' gone' : ''}`} onClick={scrollFeedTop} role="button">
            <span className="avs">
              {newAvatars.map((a, i) => (
                <span key={i} className="pdot" style={{ background: a.color }}>{a.letter}</span>
              ))}
            </span>
            <span>{newCount} new post{newCount > 1 ? 's' : ''}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M6 13l6 6 6-6" /></svg>
          </div>
        )}

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

        {/* Accumulated posts — newest first: player's own posts + NPC reactions.
            The "You're all caught up" divider is spliced in after the new cluster. */}
        {(() => {
          const els = completedPosts.map((post, i) => {
          const isNew = post.stepIndex === latestStep
          const fresh = i < newCount && freshOn      // in the new cluster, not yet dismissed
          const isOldPost = i >= newCount            // below the caught-up marker
          const clusterCls = `${fresh ? ' fresh' : ''}${isOldPost ? ' old' : ''}`
          const timeLabel = postAgeLabel(post.ageMinutes)
          const timeLabelUpper = postAgeLabel(post.ageMinutes, true)
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
              <div key={post.postId} id={`fp-${aiKey}`} className={`post${clusterCls}`}>
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
                  <button className="pa-item" onClick={() => !liked && likePost(post.postId, pc.likeTarget ?? null, 2)} disabled={pc.isPlayer} style={{ opacity: (!pc.isPlayer && liked) ? 0.7 : 1 }}>
                    <svg viewBox="0 0 24 24" fill={liked ? 'var(--accent)' : 'none'} stroke={liked ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span>{likesStr}</span>
                  </button>
                  {/* Account posts (fan pages) are commentable too — open the AI composer, canDM=false */}
                  {pc.id === '__account' && !pc.isPlayer && !commentedPosts.has(post.postId)
                    ? <button className="pa-item" onClick={() => setCommentPost(commentPost === post.postId ? null : post.postId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><CommentIcon active={commentPost===post.postId} /></button>
                    : <div className="pa-item">
                    <CommentIcon />
                    <span>{shownReactions.length}</span>
                  </div>}
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
                {/* Fan-page (account) post — AI comment composer, never DMs you back */}
                {commentPost === post.postId && pc.id === '__account' && !commentedPosts.has(post.postId) && (
                  <CommentComposer
                    character={{ id: pc.handle, name: pc.handle, handle: pc.handle }}
                    post={{ caption: resolveTokens(post.caption, game.playerName, game.playerGender), imageUrl: post.imageUrl }}
                    persona="a fan / media page that posts about players — hype, banter, hot takes"
                    canDM={false}
                    onDone={t => markCommented(post.postId, t)}
                  />
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
            <div key={post.postId} className={`post${clusterCls}`}>
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
              <div className={`post-img grain ${reactChar.cls}`} style={post.reaction.imageUrl
                ? { backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,.05) 0%, rgba(0,0,0,.12) 55%, rgba(0,0,0,.55) 100%), url(${post.reaction.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: charBg(reactChar.id) }}>
                {!post.reaction.imageUrl && <p className="overlay-txt" style={{ fontSize:14 }}>{resolveTokens(post.reaction.caption, game.playerName, game.playerGender)}</p>}
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
          })
          // divider sits right after the new cluster; if EVERY completed post is
          // new, it renders before the evergreen seed posts instead (below).
          if (newCount > 0 && newCount < els.length) els.splice(newCount, 0, caughtUp)
          return els
        })()}

        {/* Story Drop moved out of the scroll — now a docked LiveEntryCard above the tab bar */}

        {/* All completed posts were new → caught-up divider before the evergreen seeds */}
        {newCount > 0 && newCount >= completedPosts.length && completedPosts.length > 0 && caughtUp}

        {/* Seed posts — world-specific */}
        {isCricket ? (
          <CricketSeedFeed
            likedPosts={likedPosts} commentedPosts={commentedPosts}
            postComments={postComments} myHandle={myHandle}
            onLike={likePost} onComment={setCommentPost}
            commentOpen={commentPost} onHandleComment={handleComment}
            onCommentSent={markCommented}
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
                <CommentComposer
                  character={{ id: 'housewatch_india', name: 'House Watch', handle: 'housewatch_india' }}
                  post={{ caption: 'Pehla din. Thread kal. 👀 #CreatorHouse' }}
                  persona="a savage reality-TV gossip & watch page — screenshots everything, stirs drama"
                  canDM={false}
                  onDone={t => markCommented('housewatch', t)}
                />
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

      {/* Docked story entrypoint — replaces the old in-scroll Story Drop + Live tab.
          Once you scroll into the feed it shrinks to just a corner play button. */}
      {game.char && feedScrolled ? (
        <button className="feed-play-fab" onClick={() => navigate(game.char ? 'live' : 'narrator')} aria-label="Continue story">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </button>
      ) : (
        <LiveEntryCard />
      )}

      {/* First-visit coach — names the Feed + Messages tabs (one-time, non-blocking) */}
      <FeedTabsCoach />

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
