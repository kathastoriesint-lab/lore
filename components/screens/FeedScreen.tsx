'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useApp } from '@/lib/context'
import type { CharId } from '@/lib/types'
import { CHARS, POST_COMMENTS, PostCommentOption, getVisibleSituations } from '@/lib/data'
import { applyDeltas } from '@/lib/game'
import MeterHUD from '@/components/MeterHUD'

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
  onLike: (id: string, charId: CharId, delta: number) => void
  onComment: (id: string | null) => void
  commentOpen: string | null
  comments: import('@/lib/data').PostCommentOption[]
  onHandleComment: (charId: string, opt: import('@/lib/data').PostCommentOption) => void
  playingCharName: string
}

function SeedPost({ id, charId, onViewChar, bg, caption, fullCaption, likes, time, likedPosts, onLike, onComment, commentOpen, comments, onHandleComment, playingCharName }: SeedPostProps) {
  const char = CHARS[charId as CharId]
  if (!char) return null
  const isOpen = commentOpen === id
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
          <div className="s">Creator House · {time.toLowerCase()}</div>
        </div>
        <button className="icon-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>
      </div>
      <div className="post-img grain" style={{ background: bg }}>
        <p className="overlay-txt" style={{ fontSize:14 }}>{caption}</p>
      </div>
      <div className="post-actions">
        <button onClick={() => onLike(id, char.id, 3)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
          <Heart filled={likedPosts.has(id)} />
        </button>
        <button onClick={() => onComment(isOpen ? null : id)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={isOpen ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        <div className="spacer" />
      </div>
      {isOpen && (
        <div className="comment-sheet">
          <div className="comment-sheet-label">Comment as {playingCharName}</div>
          {comments.map((opt, i) => (
            <button key={i} className="comment-option" onClick={() => onHandleComment(charId, opt)}>{opt.text}</button>
          ))}
        </div>
      )}
      <div className="likes">{likes} likes</div>
      <div className="caption"><b>{char.handle}</b> {fullCaption}</div>
      <div className="ts" style={{ padding:'2px 14px 12px' }}>{time}</div>
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
  const { navigate, goBack, showToast, game, likePost, likedPosts, applyFeedDeltas, setViewingChar } = useApp()
  const [commentPost, setCommentPost] = useState<string | null>(null)

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

  // Tab bar
  const handleTab = useCallback((tab: string) => {
    if (tab === 'live') {
      enterLive()
    } else if (tab === 'profile') {
      navigate('profile')
    }
  }, [navigate, enterLive])


  const playingChar = game.char ? CHARS[game.char] : null

  // Replay game state step-by-step to find the correct situation for each choice.
  // Simple index-mapping breaks when conditional situations (D4-HEAT, D5-FAME, D6-IMAGE)
  // are inserted mid-list — replaying with the actual meters at each step is correct.
  const completedPosts = useMemo(() => {
    if (game.choices.length === 0) return []
    const STARTING_METERS = { fame: 20, heat: 50, image: 30 }
    let meters = { ...STARTING_METERS }
    const posts: Array<{ postId: string; sit: ReturnType<typeof getVisibleSituations>[0]; choice: 'A'|'B'; reaction: { char: string; caption: string }; char: (typeof CHARS)[keyof typeof CHARS] }> = []

    for (let i = 0; i < game.choices.length; i++) {
      const letter = game.choices[i]
      const sitsAtStep = getVisibleSituations(meters, game.choices.slice(0, i) as ('A'|'B')[])
      const sit = sitsAtStep[i]
      if (!sit) continue
      const reaction = sit.feedReaction?.[letter]
      if (reaction) {
        const char = CHARS[reaction.char as CharId]
        if (char) posts.push({ postId: `react-${sit.id}-${letter}`, sit, choice: letter, reaction, char })
      }
      const ch = sit.choices[letter === 'A' ? 0 : 1]
      if (ch) meters = applyDeltas(meters, ch.deltas)
    }
    return posts.reverse()
  }, [game.choices])

  // Current visible situations (for Story Drop CTA only)
  const visibleSits = getVisibleSituations(game.meters, game.choices)
  const nextSit = visibleSits[game.situation]

  const handleComment = useCallback((postKey: string, opt: PostCommentOption) => {
    setCommentPost(null)
    const charName = CHARS[postKey as keyof typeof CHARS]?.name
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
            style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color:'var(--ink2)', fontSize:12, fontWeight:600, fontFamily:'var(--sans)', padding:'4px 0' }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            Exit
          </button>
          <div className="feed-title">
            {playingChar ? (
              <span>
                Creator House
                <span style={{ fontSize:10, color:'var(--accent)', fontWeight:700, marginLeft:7, letterSpacing:'.04em' }}>
                  ● {playingChar.name.toUpperCase()}
                </span>
              </span>
            ) : 'Creator House'}
          </div>
          <button className="icon-btn" onClick={() => navigate('profile')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </button>
        </div>
        <div className="feed-live">
          <div className="pulse" />
          LIVE — Day 1 of 10 · 6 creators just arrived
        </div>
      </div>

      {/* Shared HUD */}
      <MeterHUD />

      {/* Scrollable feed */}
      <div className="scroll" style={{ flex: 1 }}>

        {/* Accumulated reactive posts — newest completed situation first */}
        {completedPosts.map(({ postId, sit, reaction, char: reactChar }, i) => (
          <div key={postId} className="post" style={i === 0 ? { borderTop: '2px solid rgba(255,45,120,.3)', background: 'rgba(255,45,120,.04)' } : {}}>
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
                <div className="s" style={{ color: i === 0 ? 'var(--accent)' : 'var(--ink3)' }}>
                  Creator House · {i === 0 ? 'just now · reacting to your move' : `Day ${sit.day}`}
                </div>
              </div>
              {i === 0 && <div className="new-pill">NEW</div>}
            </div>
            <div className={`post-img grain ${reactChar.cls}`} style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--cc) 70%, #000) 0%, #000 100%)` }}>
              <p className="overlay-txt" style={{ fontSize:14 }}>{reaction.caption}</p>
            </div>
            <div className="post-actions">
              <button onClick={() => likePost(postId, reactChar.id, 2)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
                <svg viewBox="0 0 24 24" fill={likedPosts.has(postId) ? 'var(--accent)' : 'none'} stroke={likedPosts.has(postId) ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              {POST_COMMENTS[reactChar.id] && (
                <button onClick={() => setCommentPost(commentPost === postId ? null : postId)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={commentPost===postId ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </button>
              )}
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              <div className="spacer" />
            </div>
            {commentPost === postId && POST_COMMENTS[reactChar.id] && (
              <div className="comment-sheet">
                <div className="comment-sheet-label">Comment as {playingChar?.name ?? 'you'}</div>
                {POST_COMMENTS[reactChar.id].map((opt, j) => (
                  <button key={j} className="comment-option" onClick={() => handleComment(reactChar.id, opt)}>
                    {opt.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Story Drop — dynamic: shows next pending situation */}
        {nextSit && (
          <div className="story-drop" onClick={enterLive}>
            <div className="sd-img" style={{ background: 'linear-gradient(135deg,#ff2d78,#7a1140)' }}>
              <div className="sd-badge">
                <span className="pulse" style={{ marginRight: 5 }} />
                STORY DROP · DAY {nextSit.day}
              </div>
              <div className="sd-title">{nextSit.title}</div>
              <div className="sd-sub">{(nextSit.body[0]?.replace(/<[^>]+>/g, '').slice(0, 72) ?? '')}...</div>
              <button className="sd-cta" onClick={(e) => { e.stopPropagation(); enterLive() }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#000"><polygon points="5,3 19,12 5,21"/></svg>
                Play the story
              </button>
            </div>
          </div>
        )}

        {/* Seed posts — all 6 Creator House characters + gossip account */}

        {/* Ria */}
        <SeedPost
          id="ria-seed" charId="ria" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#b03a5e,#4a0820)"
          caption="Pehla din. Pehla room. Pehle mujhe. Kuch cheezein change nahi honti. 🤍"
          fullCaption="Kaafi log poochte hain — 'Ria, tujhe stress nahi hota?' Stress? Main stress ko content mein convert karti hoon. 🤍"
          likes="84,291" time="6 HOURS AGO"
          likedPosts={likedPosts} onLike={likePost} onComment={setCommentPost}
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
          likedPosts={likedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={POST_COMMENTS.zoya}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'}
        />

        {/* housewatch_india gossip account */}
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
            <button onClick={() => likePost('hw-seed', 'ria', 1)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
              <svg viewBox="0 0 24 24" fill={likedPosts.has('hw-seed') ? 'var(--accent)' : 'none'} stroke={likedPosts.has('hw-seed') ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button onClick={() => setCommentPost(commentPost === 'housewatch' ? null : 'housewatch')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={commentPost==='housewatch' ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            <div className="spacer" />
          </div>
          {commentPost === 'housewatch' && (
            <div className="comment-sheet">
              <div className="comment-sheet-label">Comment as {playingChar?.name ?? 'you'}</div>
              {POST_COMMENTS.housewatch.map((opt, i) => (
                <button key={i} className="comment-option" onClick={() => handleComment('housewatch', opt)}>{opt.text}</button>
              ))}
            </div>
          )}
          <div className="likes">94,102 likes</div>
          <div className="caption"><b>housewatch_india</b> Pehla din. Thread kal. 👀 #CreatorHouse</div>
          <div className="ts" style={{ padding:'2px 14px 12px' }}>2 HOURS AGO</div>
        </div>

        {/* Kabir */}
        <SeedPost
          id="kabir-seed" charId="kabir" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#2a6f8f,#0a2a40)"
          caption="&quot;Is ghar mein sab serious ho jaate hain jab camera on hota hai. Main serious tab hota hoon jab camera off hota hai.&quot; 😭👀"
          fullCaption="Camera ka psychology. Day 1 observation thread kal. 😭"
          likes="41,882" time="3 HOURS AGO"
          likedPosts={likedPosts} onLike={likePost} onComment={setCommentPost}
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
          likedPosts={likedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={POST_COMMENTS.dev}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'}
        />

        {/* Meher */}
        <SeedPost
          id="meher-seed" charId="meher" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#b07a2a,#3a2000)"
          caption="Villa Day 1. Sab perform kar rahe hain. Main observe kar rahi hoon. Chai mil gayi. Sab theek hai. ☕"
          fullCaption="Kuch cheezein camera ke saamne nahi kehni chahiye. Baaki sab baad mein. 🫶 #CreatorHouse"
          likes="22,318" time="5 HOURS AGO"
          likedPosts={likedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={POST_COMMENTS.meher}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'}
        />

        {/* Ananya */}
        <SeedPost
          id="ananya-seed" charId="ananya" onViewChar={setViewingChar}
          bg="linear-gradient(135deg,#8a4ab0,#3a1660)"
          caption="2.1M views raat mein. Subah uthke dekha toh ro padi. Phir Ria ko bataya. Usne bola... 'nice.' 🥺✨"
          fullCaption="2.1M. Ro padi. Tumhara pyaar 🥺✨"
          likes="2,108,441" time="45 MINUTES AGO"
          likedPosts={likedPosts} onLike={likePost} onComment={setCommentPost}
          commentOpen={commentPost} comments={POST_COMMENTS.ananya}
          onHandleComment={handleComment} playingCharName={playingChar?.name ?? 'you'}
        />

        <div style={{ height: 20 }} />
      </div>

      {/* Tab bar */}
      <div className="tabbar">
        <button className="tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>
          </svg>
          <span>Feed</span>
        </button>
        <button className="tab" onClick={() => handleTab('live')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L4.5 13.5H11L9 22l9-12h-6.5L13 2z" strokeLinejoin="round"/>
          </svg>
          <span>Live</span>
        </button>
        <button className="tab" onClick={() => handleTab('profile')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <span>Profile</span>
        </button>
      </div>

      {/* World intro overlay */}
      {showIntro && (
        <div className={`world-intro${introGone ? ' gone' : ''}`}>
          {/* Line 0: LIVE badge */}
          <div className={`wi-line${introLines[0] ? ' in' : ''}`}>
            <div className="wi-pre">
              <div className="pulse" />
              LIVE · DAY 1 OF 10
            </div>
          </div>
          {/* Line 1: Title */}
          <div className={`wi-line${introLines[1] ? ' in' : ''}`}>
            <div className="wi-title">Creator House.</div>
          </div>
          {/* Line 2: Meta */}
          <div className={`wi-line${introLines[2] ? ' in' : ''}`}>
            <div className="wi-meta">6 creators. Ek villa. 10 din ka experiment.</div>
          </div>
          {/* Line 3: Drama */}
          <div className={`wi-line${introLines[3] ? ' in' : ''}`}>
            <div className="wi-drama">
              <b>Aaj raat, villa khul raha hai.</b> 6 creators pehli baar mile hain. Koi dushman nahi, koi dost nahi — but by morning, alliances ban jaayengi. Tum kaun banna chahte ho?
            </div>
          </div>
          {/* Line 4: Avatars */}
          <div className={`wi-line${introLines[4] ? ' in' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
              <div className="wi-chars">
                {(['ria','kabir','meher','ananya','dev','zoya','rishi','adi'] as const).map((id) => {
                  const c = CHARS[id]
                  return (
                    <div key={id} className={`av ${c.cls}`} style={{ width: 32, height: 32, fontSize: 13, marginLeft: 0 }}>
                      {c.init}
                    </div>
                  )
                })}
              </div>
              <div className="wi-chars-label">6 creators · 1.2M following</div>
            </div>
          </div>
          {/* Line 5: CTAs */}
          <div className={`wi-line${introLines[5] ? ' in' : ''}`}>
            <div className="wi-cta">
              <button className="wi-btn" onClick={dismissIntro}>Andar aao →</button>
              <button className="wi-skip-btn" onClick={dismissIntro}>Skip</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
