'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useApp } from '@/lib/context'
import type { CharId } from '@/lib/types'
import { CHARS, POST_COMMENTS, PostCommentOption, getVisibleSituations } from '@/lib/data'
import { CRICKET_CHARS, CRICKET_SITUATIONS } from '@/lib/cricket-data'
import { applyDeltas, resolveTokens } from '@/lib/game'
import MeterHUD from '@/components/MeterHUD'

// Inline character background — color-mix(var(--cc)) fails without a parent with the CSS class
const CHAR_COLORS_HEX: Record<string, string> = {
  ria:'#b03a5e', kabir:'#2a6f8f', dev:'#3a7a4a', ananya:'#8a4ab0', zoya:'#aa6a8a',
  meher:'#b07a2a', rishi:'#4a8a2a', adi:'#d4581a',
  hardik:'#003087', rohit:'#1a3a6e', surya:'#004080', bumrah:'#0a1a4a',
  tilak:'#2a5a8f', coach:'#4a3a1a', friend:'#3a6a4a',
}
const charBg = (id: string) => {
  const c = CHAR_COLORS_HEX[id] ?? '#1a1a2e'
  // Character color stays vivid through midpoint, fades to deep dark at bottom-right
  // Keeps visual richness while preserving caption legibility at bottom
  return `linear-gradient(to bottom, ${c}bb 0%, ${c}66 55%, #0a0a18 100%)`
}

const Heart = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'var(--accent)' : 'none'} stroke={filled ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

interface SeedPostProps {
  id: string
  charId: string
  onViewChar: (id: CharId) => void
  bg: string
  caption: string
  fullCaption: string
  likes: string
  time: string
  likedPosts: Set<string>
  commentedPosts: Set<string>
  onLike: (id: string, charId: CharId, delta: number) => void
  onComment: (id: string | null) => void
  commentOpen: string | null
  comments: import('@/lib/data').PostCommentOption[]
  onHandleComment: (charId: string, postId: string, opt: import('@/lib/data').PostCommentOption) => void
  playingCharName: string
}

function SeedPost({ id, charId, onViewChar, bg, caption, fullCaption, likes, time, likedPosts, commentedPosts, onLike, onComment, commentOpen, comments, onHandleComment, playingCharName }: SeedPostProps) {
  const char = CHARS[charId as CharId]
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
      <div className="post-img grain" style={{ background: bg }}>
        <p className="overlay-txt" style={{ fontSize:14 }}>{caption}</p>
      </div>
      <div className="post-actions">
        <button
          onClick={() => !liked && onLike(id, char.id, 3)}
          style={{ background:'none', border:'none', cursor: liked ? 'default' : 'pointer', display:'flex', alignItems:'center', opacity: liked ? 0.6 : 1 }}
        >
          <Heart filled={liked} />
        </button>
        {!commented ? (
          <button onClick={() => onComment(isOpen ? null : id)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={isOpen ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </button>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        <div className="spacer" />
      </div>
      {isOpen && !commented && (
        <div className="comment-sheet">
          <div className="comment-sheet-label">Comment as {playingCharName}</div>
          {comments.map((opt, i) => (
            <button key={i} className="comment-option" onClick={() => onHandleComment(charId, id, opt)}>{opt.text}</button>
          ))}
        </div>
      )}
      <div className="likes">{likes} likes</div>
      <div className="caption"><b>{char.handle}</b> {fullCaption}</div>
      <div className="ts" style={{ padding:'2px 14px 12px' }}>{time}</div>
    </div>
  )
}

// ── Cricket seed posts ────────────────────────────────────────────────────────
interface CricketSeedProps {
  likedPosts: Set<string>
  commentedPosts: Set<string>
  onLike: (id: string, charId: CharId, delta: number) => void
  onComment: (id: string | null) => void
  commentOpen: string | null
  onHandleComment: (charId: string, postId: string, opt: PostCommentOption) => void
  playingCharName: string
  onViewChar: (id: CharId) => void
}

const CRICKET_COMMENTS: Record<string, PostCommentOption[]> = {
  hardik: [
    { text: 'Captain energy 🔥 Paltan ready hai', deltas:{ fame:3, heat:2, image:3 }, toast:'Hardik saw this. Trust +3' },
    { text: 'What role should I focus on?', deltas:{ fame:2, heat:0, image:4 }, toast:'Good question. Trust +4' },
    { text: 'I\'m ready for any situation', deltas:{ fame:2, heat:1, image:3 }, toast:'Hardik approves. Trust +3' },
  ],
  rohit: [
    { text: 'Tempo advice please Ro bhai 🙏', deltas:{ fame:3, heat:0, image:4 }, toast:'Rohit noticed. Form +3' },
    { text: 'Shot tha 🔥', deltas:{ fame:4, heat:1, image:2 }, toast:'Rohit smiles. Form +4' },
    { text: 'This is everything 💙', deltas:{ fame:3, heat:0, image:3 }, toast:'Rohit approves. Form +3' },
  ],
  surya: [
    { text: 'Legend 😄 Field dekh phir pagal ban', deltas:{ fame:4, heat:2, image:2 }, toast:'Surya liked this 🔥' },
    { text: 'Teach me the angles please 🙏', deltas:{ fame:3, heat:1, image:3 }, toast:'Surya says come to nets. Form +3' },
    { text: 'Champion energy 💙', deltas:{ fame:4, heat:2, image:1 }, toast:'Surya energy unlocked. Fame +4' },
  ],
  bumrah: [
    { text: 'Learning from the best 🏏', deltas:{ fame:2, heat:0, image:4 }, toast:'Bumrah noted this. Trust +4' },
    { text: 'Still learning slower ball timing', deltas:{ fame:3, heat:0, image:5 }, toast:'Bumrah respects honesty. Form +3' },
    { text: 'Nets tomorrow?', deltas:{ fame:2, heat:0, image:4 }, toast:'Bumrah approves. Form +3' },
  ],
  tilak: [
    { text: 'Role model hai bhai 💙', deltas:{ fame:3, heat:1, image:3 }, toast:'Tilak trusts you more. Trust +3' },
    { text: 'Sikhta rehta hoon', deltas:{ fame:2, heat:0, image:4 }, toast:'Tilak respects this. Trust +4' },
    { text: 'Same energy 🔥', deltas:{ fame:3, heat:2, image:2 }, toast:'Young table approved. Trust +2' },
  ],
}

function CricketSeedFeed({ likedPosts, commentedPosts, onLike, onComment, commentOpen, onHandleComment, playingCharName, onViewChar }: CricketSeedProps) {
  const cricketChars = { ...CHARS, ...CRICKET_CHARS }

  const seedPost = (id: string, charKey: string, bg: string, caption: string, fullCaption: string, likes: string, time: string) => {
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
        <div className="post-img grain" style={{ background: bg }}>
          <p className="overlay-txt" style={{ fontSize:14 }}>{caption}</p>
        </div>
        <div className="post-actions">
          <button onClick={() => !liked && onLike(id, char.id as CharId, 3)}
            style={{ background:'none', border:'none', cursor: liked ? 'default' : 'pointer', display:'flex', alignItems:'center', opacity: liked ? 0.6 : 1 }}>
            <svg viewBox="0 0 24 24" fill={liked ? 'var(--accent)' : 'none'} stroke={liked ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          {comments.length > 0 && !commented ? (
            <button onClick={() => onComment(commentOpen === id ? null : id)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={commentOpen===id ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
          ) : comments.length > 0 ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          ) : null}
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          <div className="spacer" />
        </div>
        {commentOpen === id && comments.length > 0 && !commented && (
          <div className="comment-sheet">
            <div className="comment-sheet-label">Comment as {playingCharName}</div>
            {comments.map((opt, j) => (
              <button key={j} className="comment-option" onClick={() => onHandleComment(charKey, id, opt)}>{opt.text}</button>
            ))}
          </div>
        )}
        <div className="likes">{likes} likes</div>
        <div className="caption"><b>{char.handle}</b> {fullCaption}</div>
        <div className="ts" style={{ padding:'2px 14px 12px' }}>{time}</div>
      </div>
    )
  }

  return (
    <>
      {/* Hardik */}
      {seedPost('hardik-seed', 'hardik', 'linear-gradient(to bottom, rgba(0,0,0,.1) 0%, rgba(0,0,0,.55) 100%), url(/avatars/cricket-dressing-room.png) center/cover',
        '"Ready rehna. Role-ready hota hai, reel-ready nahi." — Wankhede ki pehli practice. Season 1 starts now. 💙',
        'Team set hai. Kaam shuru. #MumbaiIndians #IPL',
        '284,102', '3 HOURS AGO')}

      {/* Rohit */}
      {seedPost('rohit-seed', 'rohit', 'linear-gradient(135deg,#1a3a6e,#080818)',
        'Pehle 12 ball survive karo. Phir game tumhara. Simple nahi. Lekin sach. 🏏',
        'Tempo. Bas. #Cricket #MumbaiIndians',
        '512,884', '5 HOURS AGO')}

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
            <div className="post-img grain" style={{ background: '#0a1220' }}>
              <p className="overlay-txt" style={{ fontSize:13, color:'rgba(255,255,255,.8)', lineHeight:1.6 }}>
                MI ne ek 16-year-old batting prodigy draft kiya hai.<br /><br />
                Wankhede mein pehle din ki clip dekhi? Uski aankhen dekho — nervous nahi. Curious hai.<br /><br />
                <span style={{ color:'#FFB020', fontFamily:'var(--sans)', fontSize:11 }}>PALTAN IS WATCHING #MumbaiIndians</span>
              </p>
            </div>
            <div className="post-actions">
              <button onClick={() => !hwLiked && onLike('paltan-seed', 'hardik' as CharId, 1)}
                style={{ background:'none', border:'none', cursor: hwLiked ? 'default':'pointer', display:'flex', alignItems:'center', opacity: hwLiked ? 0.6:1 }}>
                <svg viewBox="0 0 24 24" fill={hwLiked ? 'var(--accent)':'none'} stroke={hwLiked ? 'var(--accent)':'#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              {!hwCommented ? (
                <button onClick={() => onComment(commentOpen === 'paltan-seed' ? null : 'paltan-seed')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={commentOpen==='paltan-seed' ? 'var(--accent)':'#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </button>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              )}
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              <div className="spacer" />
            </div>
            {commentOpen === 'paltan-seed' && !hwCommented && (
              <div className="comment-sheet">
                <div className="comment-sheet-label">Comment as {playingCharName}</div>
                {[
                  { text:'Paltan tum sahi ho 💙 Dekho mujhe', deltas:{fame:5,heat:2,image:2}, toast:'Paltan noticed you. Fame +5' },
                  { text:'Nervous thoda, excited zyada 🏏', deltas:{fame:3,heat:1,image:3}, toast:'Relatable energy. Fame +3' },
                  { text:'Abhi sirf kaam. Baaki sab baad mein 💙', deltas:{fame:2,heat:0,image:4}, toast:'Trust move. Image +4' },
                ] .map((opt, i) => (
                  <button key={i} className="comment-option" onClick={() => onHandleComment('paltan', 'paltan-seed', opt)}>{opt.text}</button>
                ))}
              </div>
            )}
            <div className="likes">94,102 likes</div>
            <div className="caption"><b>paltanpulse</b> Remember the name. #Paltan 💙</div>
            <div className="ts" style={{ padding:'2px 14px 12px' }}>1 HOUR AGO</div>
          </div>
        )
      })()}

      {/* Surya */}
      {seedPost('surya-seed', 'surya', 'linear-gradient(135deg,#004080,#001a40)',
        'Freedom ka matlab random nahi hota. Field dekh, phir pagal ban. T20 mein yahi farak hai. 😄🏏',
        'Range-hitting session done. #SKY #MumbaiIndians',
        '891,204', '2 HOURS AGO')}

      {/* Bumrah */}
      {seedPost('bumrah-seed', 'bumrah', 'linear-gradient(to bottom, rgba(0,0,0,.05) 0%, rgba(0,0,0,.6) 100%), url(/avatars/cricket-nets.png) center/cover',
        'Nets mein ego nahi chalta. Bas information. Good players adjust after one mistake.',
        'Work. Always. #Bumrah #MumbaiIndians',
        '1,204,441', '4 HOURS AGO')}

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
            <div className="post-img grain" style={{ background: '#0d1520' }}>
              <p className="overlay-txt" style={{ fontSize:12, color:'rgba(255,255,255,.7)', lineHeight:1.65 }}>
                MI draft analysis — {new Date().getFullYear()} edition.<br /><br />
                The 16-year-old batting pick is the most interesting call. High ceiling, unknown floor.<br /><br />
                Watch: how does the dressing room use them? That tells you everything about the trust.
                <br /><br />
                <span style={{ color:'#3DD6C8', fontSize:10 }}>THREAD: #MumbaiIndians #IPLDraft</span>
              </p>
            </div>
            <div className="post-actions">
              <button onClick={() => !crLiked && onLike('cricketroom-seed', 'rohit' as CharId, 1)}
                style={{ background:'none', border:'none', cursor: crLiked?'default':'pointer', display:'flex', alignItems:'center', opacity: crLiked?0.6:1 }}>
                <svg viewBox="0 0 24 24" fill={crLiked?'var(--accent)':'none'} stroke={crLiked?'var(--accent)':'#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              <div className="spacer" />
            </div>
            <div className="likes">29,441 likes</div>
            <div className="caption"><b>cricketroom_india</b> Trust takes time. Hype doesn't.</div>
            <div className="ts" style={{ padding:'2px 14px 12px' }}>45 MINUTES AGO</div>
          </div>
        )
      })()}

      {/* Tilak */}
      {seedPost('tilak-seed', 'tilak', 'linear-gradient(135deg,#2a5a8f,#0a1a40)',
        'Hype sabko milta hai kabhi na kabhi. Trust repeat performances se milta hai. Season 1 is just the beginning. 💙',
        'Process pe raho. #TilakVarma #MumbaiIndians',
        '342,108', '6 HOURS AGO')}

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
            <div className="post-img grain" style={{ background: '#180a2a' }}>
              <p className="overlay-txt" style={{ fontSize:12, color:'rgba(255,255,255,.8)', lineHeight:1.6 }}>
                16 years old.<br />Mumbai Indians dressing room.<br />Rohit + SKY + Bumrah around them.<br /><br />
                This is how future India stories start. Remember when you first heard about them.
                <br /><br />
                <span style={{ color:'#FFB020', fontSize:10 }}>#FutureIndia #MumbaiIndians #NextGen</span>
              </p>
            </div>
            <div className="post-actions">
              <button onClick={() => !fxLiked && onLike('futurexi-seed', 'tilak' as CharId, 2)}
                style={{ background:'none', border:'none', cursor: fxLiked?'default':'pointer', display:'flex', alignItems:'center', opacity: fxLiked?0.6:1 }}>
                <svg viewBox="0 0 24 24" fill={fxLiked?'var(--accent)':'none'} stroke={fxLiked?'var(--accent)':'#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              <div className="spacer" />
            </div>
            <div className="likes">182,204 likes</div>
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
  const { navigate, goBack, showToast, game, likePost, likedPosts, applyFeedDeltas, setViewingChar, dmBadgeCount } = useApp()
  const [commentPost, setCommentPost] = useState<string | null>(null)
  const [commentedPosts, setCommentedPosts] = useState<Set<string>>(new Set())

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

  // Enter live/narrator
  const enterLive = useCallback(() => {
    if (game.char) {
      navigate('live')
    } else {
      navigate('narrator')
    }
  }, [navigate, game.char])

  const isCricket = game.world === 'cricket'

  // Tab bar
  const handleTab = useCallback((tab: string) => {
    if (tab === 'live') enterLive()
    else if (tab === 'profile') navigate('profile')
    else if (tab === 'dms') navigate('dm-inbox')
  }, [navigate, enterLive])


  const allChars = { ...CHARS, ...CRICKET_CHARS }
  const playingChar = game.char ? (allChars[game.char] ?? null) : null
  const worldLabel = isCricket ? 'Indian Dressing Room' : 'Creator House'

  // Replay game state step-by-step to find the correct situation for each choice.
  // Simple index-mapping breaks when conditional situations (D4-HEAT, D5-FAME, D6-IMAGE)
  // are inserted mid-list — replaying with the actual meters at each step is correct.
  type FeedPost =
    | { type: 'npc';    postId: string; sit: ReturnType<typeof getVisibleSituations>[0]; choice: 'A'|'B'; reaction: { char: string; caption: string }; char: (typeof CHARS)[keyof typeof CHARS] }
    | { type: 'player'; postId: string; sit: ReturnType<typeof getVisibleSituations>[0]; choice: 'A'|'B'; caption: string; playerChar: (typeof CHARS)[keyof typeof CHARS]; reactions: import('@/lib/types').Reaction[] }

  const completedPosts = useMemo((): FeedPost[] => {
    if (game.choices.length === 0) return []
    const STARTING_METERS = isCricket
      ? { fame: 45, heat: 55, image: 35 }
      : { fame: 20, heat: 50, image: 30 }
    let meters = { ...STARTING_METERS }
    const posts: FeedPost[] = []
    const playerCharObj = game.char ? (allChars[game.char] ?? null) : null

    for (let i = 0; i < game.choices.length; i++) {
      const letter = game.choices[i]
      const sitsAtStep = isCricket
        ? CRICKET_SITUATIONS
        : getVisibleSituations(meters, game.choices.slice(0, i) as ('A'|'B')[])
      const sit = sitsAtStep[i]
      if (!sit) continue
      const ch = sit.choices[letter === 'A' ? 0 : 1]

      // NPC feedReaction post pushed FIRST — after reverse(), it sits below player post
      const reaction = sit.feedReaction?.[letter]
      if (reaction) {
        const char = allChars[reaction.char as CharId]
        if (char) posts.push({ type: 'npc', postId: `react-${sit.id}-${letter}`, sit, choice: letter, reaction, char })
      }

      // Player's own post pushed LAST — after reverse(), it becomes newest (index 0 = NEW badge)
      if (ch?.caption && playerCharObj) {
        posts.push({ type: 'player', postId: `player-${sit.id}-${letter}`, sit, choice: letter, caption: ch.caption, playerChar: playerCharObj, reactions: ch.reactions ?? [] })
      }

      if (ch) meters = applyDeltas(meters, ch.deltas)
    }
    return posts.reverse()
  }, [game.choices, game.char, isCricket])

  // Current visible situations (for Story Drop CTA only)
  const visibleSits = isCricket ? CRICKET_SITUATIONS : getVisibleSituations(game.meters, game.choices)
  const nextSit = visibleSits[game.situation]

  const handleComment = useCallback((postKey: string, postId: string, opt: PostCommentOption) => {
    setCommentPost(null)
    setCommentedPosts(prev => { const n = new Set(prev); n.add(postId); return n })
    const charName = allChars[postKey]?.name
    applyFeedDeltas(opt.deltas, postKey, charName)
  }, [applyFeedDeltas])

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
            ? `LIVE — IPL Season 1 · Mumbai Indians · Situation ${game.situation + 1}`
            : 'LIVE — Day 1 of 10 · 6 creators just arrived'}
        </div>
      </div>

      {/* Shared HUD */}
      <MeterHUD />

      {/* Scrollable feed */}
      <div className="scroll" style={{ flex: 1 }}>

        {/* Accumulated posts — newest first: player's own posts + NPC reactions */}
        {completedPosts.map((post, i) => {
          const isNew = i === 0
          if (post.type === 'player') {
            // Player's own caption post with threaded reactions as comments
            const pc = post.playerChar
            const liked = likedPosts.has(post.postId)
            return (
              <div key={post.postId} className="post" style={isNew ? { borderTop: '2px solid rgba(255,45,120,.3)', background: 'rgba(255,45,120,.04)' } : {}}>
                <div className="post-head">
                  <div className={`av ${pc.cls}`} style={{ width:34, height:34, fontSize:14, backgroundImage:`url(/avatars/${pc.id}.png)`, backgroundSize:'cover', backgroundPosition:'center' }}>
                    <span style={{ opacity:0 }}>{pc.init}</span>
                  </div>
                  <div className="post-id">
                    <div className="h">@{(game.playerName || pc.handle).toLowerCase().replace(/\s+/g,'')} <span style={{ fontSize:10, color:'var(--accent)', fontWeight:700, marginLeft:4 }}>YOU</span></div>
                    <div className="s" style={{ color: isNew ? 'var(--accent)' : 'var(--ink3)' }}>
                      {isCricket ? 'MI Season 1' : 'Creator House'} · {isNew ? 'just now · your post' : `S${post.sit.day}`}
                    </div>
                  </div>
                  {isNew && <div className="new-pill">NEW</div>}
                </div>
                <div className={`post-img grain ${pc.cls}`} style={{ background: charBg(pc.id), alignItems:'flex-end' }}>
                  <p className="overlay-txt" style={{ fontSize:14, textShadow:'0 1px 8px rgba(0,0,0,.7)' }}>{resolveTokens(post.caption, game.playerName, game.playerGender)}</p>
                </div>
                <div className="post-actions">
                  <button
                    onClick={() => !liked && likePost(post.postId, pc.id, 2)}
                    style={{ background:'none', border:'none', cursor: liked ? 'default' : 'pointer', display:'flex', alignItems:'center', opacity: liked ? 0.6 : 1 }}
                  >
                    <svg viewBox="0 0 24 24" fill={liked ? 'var(--accent)' : 'none'} stroke={liked ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  <div className="spacer" />
                </div>
                {/* Threaded reactions — NPC + fan comments on your post */}
                {post.reactions.length > 0 && (
                  <div style={{ padding: '2px 14px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {post.reactions.map((rx, j) => {
                      const isFan = rx.char === '__fan'
                      const rxChar = isFan ? null : (allChars[rx.char as CharId] ?? null)
                      return (
                        <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          {isFan || !rxChar ? (
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2a2a38', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 700, color: 'var(--ink3)', flexShrink: 0 }}>
                              {isFan ? (rx.name ?? 'f')[0].toUpperCase() : '?'}
                            </div>
                          ) : (
                            <div className={`av ${rxChar.cls}`} style={{ width: 22, height: 22, fontSize: 9, flexShrink: 0, backgroundImage: `url(/avatars/${rxChar.id}.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                              <span style={{ opacity: 0 }}>{rxChar.init}</span>
                            </div>
                          )}
                          <div style={{ fontSize: 12, lineHeight: 1.4, color: 'rgba(255,255,255,.85)' }}>
                            <span style={{ fontWeight: 700, marginRight: 4 }}>
                              {isFan ? `@${rx.name ?? 'fan'}` : (rxChar?.name ?? rx.char)}
                            </span>
                            {isFan && (
                              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink3)', background: 'rgba(255,255,255,.08)', padding: '1px 5px', borderRadius: 4, marginRight: 5 }}>FAN</span>
                            )}
                            {resolveTokens(rx.text, game.playerName, game.playerGender)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
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
                    {isCricket ? 'MI Season 1' : 'Creator House'} · {isNew ? 'just now · reacting to your move' : `S${post.sit.day}`}
                  </div>
                </div>
                {isNew && <div className="new-pill">NEW</div>}
              </div>
              <div className={`post-img grain ${reactChar.cls}`} style={{ background: charBg(reactChar.id) }}>
                <p className="overlay-txt" style={{ fontSize:14 }}>{resolveTokens(post.reaction.caption, game.playerName, game.playerGender)}</p>
              </div>
              <div className="post-actions">
                <button
                  onClick={() => !liked && likePost(post.postId, reactChar.id, 2)}
                  style={{ background:'none', border:'none', cursor: liked ? 'default' : 'pointer', display:'flex', alignItems:'center', opacity: liked ? 0.6 : 1 }}
                >
                  <svg viewBox="0 0 24 24" fill={liked ? 'var(--accent)' : 'none'} stroke={liked ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
                {POST_COMMENTS[reactChar.id] && !commented && (
                  <button
                    onClick={() => setCommentPost(commentPost === post.postId ? null : post.postId)}
                    style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke={commentPost===post.postId ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </button>
                )}
                {POST_COMMENTS[reactChar.id] && commented && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                )}
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                <div className="spacer" />
              </div>
              {commentPost === post.postId && POST_COMMENTS[reactChar.id] && !commented && (
                <div className="comment-sheet">
                  <div className="comment-sheet-label">Comment as {playingChar?.name ?? 'you'}</div>
                  {POST_COMMENTS[reactChar.id].map((opt, j) => (
                    <button key={j} className="comment-option" onClick={() => handleComment(reactChar.id, post.postId, opt)}>
                      {opt.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Story Drop — dynamic: shows next pending situation */}
        {nextSit && (
          <div className="story-drop" onClick={enterLive}>
            <div className="sd-img" style={isCricket
              ? { background: 'linear-gradient(to bottom, rgba(0,0,0,.25) 0%, rgba(0,0,0,.65) 100%), url(/avatars/cricket-wankhede.png) center/cover' }
              : { background: 'linear-gradient(135deg,#ff2d78,#7a1140)' }}>
              <div className="sd-badge" style={isCricket ? { color: '#FFB020' } : {}}>
                <span className="pulse" style={{ marginRight: 5, background: isCricket ? '#FFB020' : undefined }} />
                {isCricket ? `SITUATION ${game.situation + 1} · ${nextSit.tag.split('·')[1]?.trim() ?? 'NEXT'}` : `STORY DROP · DAY ${nextSit.day}`}
              </div>
              <div className="sd-title">{nextSit.title}</div>
              <div className="sd-sub">{(resolveTokens(nextSit.body[0] ?? '', game.playerName, game.playerGender).replace(/<[^>]+>/g, '').slice(0, 72))}...</div>
              <button className="sd-cta" onClick={(e) => { e.stopPropagation(); enterLive() }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#000"><polygon points="5,3 19,12 5,21"/></svg>
                Play the story
              </button>
            </div>
          </div>
        )}

        {/* Seed posts — world-specific */}
        {isCricket ? (
          <CricketSeedFeed
            likedPosts={likedPosts} commentedPosts={commentedPosts}
            onLike={likePost} onComment={setCommentPost}
            commentOpen={commentPost} onHandleComment={handleComment}
            playingCharName={game.playerName || 'You'}
            onViewChar={setViewingChar}
          />
        ) : (
          <>
        {/* Ria */}
        <SeedPost
          id="ria-seed" charId="ria" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#b03a5e,#4a0820)"
          caption="Pehla din. Pehla room. Pehle mujhe. Kuch cheezein change nahi honti. 🤍"
          fullCaption="Kaafi log poochte hain — 'Ria, tujhe stress nahi hota?' Stress? Main stress ko content mein convert karti hoon. 🤍"
          likes="84,291" time="6 HOURS AGO"
          likedPosts={likedPosts} commentedPosts={commentedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={POST_COMMENTS.ria}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'}
        />

        {/* Zoya */}
        <SeedPost
          id="zoya-seed" charId="zoya" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#aa6a8a,#2a0a1a)"
          caption="Naye log. Naye vibes. Is ghar mein sab interesting lagte hain. Especially ek. 👀🫶"
          fullCaption="Day 1 done. Chai piya. Kuch connections bane. Kuch strategies bhi. #CreatorHouse"
          likes="29,441" time="5 HOURS AGO"
          likedPosts={likedPosts} commentedPosts={commentedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={POST_COMMENTS.zoya}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'}
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
              <div className="post-img grain" style={{ background: '#12121a' }}>
                <p className="overlay-txt" style={{ fontSize:13, color:'rgba(255,255,255,.75)', lineHeight:1.6 }}>
                  #CreatorHouseDay1 — koi quietly khel raha hai. Koi loudly.<br /><br />
                  Jo sabse zyada chup hai woh sabse zyada plan kar raha hai. 🧵 Thread kal.<br /><br />
                  <span style={{ color:'var(--accent)', fontFamily:'var(--sans)', fontSize:11 }}>#CreatorHouse TRENDING #1</span>
                </p>
              </div>
              <div className="post-actions">
                <button
                  onClick={() => !hwLiked && likePost('hw-seed', 'ria', 1)}
                  style={{ background:'none', border:'none', cursor: hwLiked ? 'default' : 'pointer', display:'flex', alignItems:'center', opacity: hwLiked ? 0.6 : 1 }}
                >
                  <svg viewBox="0 0 24 24" fill={hwLiked ? 'var(--accent)' : 'none'} stroke={hwLiked ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
                {!hwCommented ? (
                  <button onClick={() => setCommentPost(commentPost === 'housewatch' ? null : 'housewatch')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={commentPost==='housewatch' ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </button>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                )}
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                <div className="spacer" />
              </div>
              {commentPost === 'housewatch' && !hwCommented && (
                <div className="comment-sheet">
                  <div className="comment-sheet-label">Comment as {playingChar?.name ?? 'you'}</div>
                  {POST_COMMENTS.housewatch.map((opt, i) => (
                    <button key={i} className="comment-option" onClick={() => handleComment('housewatch', 'housewatch', opt)}>{opt.text}</button>
                  ))}
                </div>
              )}
              <div className="likes">94,102 likes</div>
              <div className="caption"><b>housewatch_india</b> Pehla din. Thread kal. 👀 #CreatorHouse</div>
              <div className="ts" style={{ padding:'2px 14px 12px' }}>2 HOURS AGO</div>
            </div>
          )
        })()}

        {/* Kabir */}
        <SeedPost
          id="kabir-seed" charId="kabir" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#2a6f8f,#0a2a40)"
          caption="&quot;Is ghar mein sab serious ho jaate hain jab camera on hota hai. Main serious tab hota hoon jab camera off hota hai.&quot; 😭👀"
          fullCaption="Camera ka psychology. Day 1 observation thread kal. 😭"
          likes="41,882" time="3 HOURS AGO"
          likedPosts={likedPosts} commentedPosts={commentedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={POST_COMMENTS.kabir}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'}
        />

        {/* Dev */}
        <SeedPost
          id="dev-seed" charId="dev" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#3a7a4a,#0a2a1a)"
          caption="5AM. Gym done. Creator House Day 1 different hai. Numbers aayenge. Always do. 💪📈"
          fullCaption="Grind never stops. Villa ya gym — same mindset. #CreatorHouse #Fitness"
          likes="18,204" time="4 HOURS AGO"
          likedPosts={likedPosts} commentedPosts={commentedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={POST_COMMENTS.dev}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'}
        />

        {/* Ananya */}
        <SeedPost
          id="ananya-seed" charId="ananya" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#8a4ab0,#3a1660)"
          caption="2.1M views raat mein. Subah uthke dekha toh ro padi. Phir Ria ko bataya. Usne bola... 'nice.' 🥺✨"
          fullCaption="2.1M. Ro padi. Tumhara pyaar 🥺✨"
          likes="2,108,441" time="45 MINUTES AGO"
          likedPosts={likedPosts} commentedPosts={commentedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={POST_COMMENTS.ananya}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'}
        />

          <div style={{ height: 20 }} />
          </>
        )}
        {isCricket && <div style={{ height: 20 }} />}
      </div>

      {/* Tab bar — 4 tabs for cricket, 3 for Creator House */}
      <div className="tabbar">
        <button className="tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>
          <span>Feed</span>
        </button>
        {isCricket && (
          <button className="tab" onClick={() => handleTab('dms')} style={{ position: 'relative' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {dmBadgeCount > 0 && <div className="badge-num" style={{ top:0, right:8 }}>{dmBadgeCount > 9 ? '9+' : dmBadgeCount}</div>}
            <span>DMs</span>
          </button>
        )}
        <button className="tab" onClick={() => handleTab('live')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4.5 13.5H11L9 22l9-12h-6.5L13 2z" strokeLinejoin="round"/></svg>
          <span>Live</span>
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
                {isCricket ? 'Dressing room mein jao →' : 'Andar aao →'}
              </button>
              <button className="wi-skip-btn" onClick={dismissIntro}>Skip</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
