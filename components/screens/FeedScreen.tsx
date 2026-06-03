'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import type { CharId } from '@/lib/types'
import { CHARS, SITUATIONS, STORY_ORDER, SEEN_CHARS, STORY_CONTENT, POST_COMMENTS, PostCommentOption, getVisibleSituations } from '@/lib/data'

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

  // Story viewer
  const [storyChar, setStoryChar] = useState<CharId | null>(null)
  const [storyActive, setStoryActive] = useState(false)
  const storyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-advance ref — avoids stale closure on recursive schedule
  const scheduleNext = useRef<(id: CharId) => void>(() => {})
  scheduleNext.current = (fromId: CharId) => {
    if (storyTimer.current) clearTimeout(storyTimer.current)
    storyTimer.current = setTimeout(() => {
      const idx = STORY_ORDER.indexOf(fromId)
      const next = STORY_ORDER[idx + 1]
      if (next) { setStoryChar(next); scheduleNext.current(next) }
      else { setStoryActive(false); setStoryChar(null) }
    }, 5000)
  }

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

  const openStory = useCallback((charId: CharId) => {
    setStoryChar(charId)
    setStoryActive(true)
    scheduleNext.current(charId)
  }, [])

  const closeStory = useCallback(() => {
    if (storyTimer.current) clearTimeout(storyTimer.current)
    setStoryActive(false)
    setStoryChar(null)
  }, [])

  const tapStory = useCallback((e: React.MouseEvent) => {
    if (!storyChar) return
    const x = e.clientX
    const w = (e.currentTarget as HTMLElement).offsetWidth
    const idx = STORY_ORDER.indexOf(storyChar)
    if (x < w * 0.35) {
      // tap left → prev character
      const prev = STORY_ORDER[idx - 1]
      if (prev) { setStoryChar(prev); scheduleNext.current(prev) }
      else closeStory()
    } else {
      // tap right → next character
      const next = STORY_ORDER[idx + 1]
      if (next) { setStoryChar(next); scheduleNext.current(next) }
      else closeStory()
    }
  }, [storyChar, closeStory])

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
    if (tab === 'home') {
      // already on feed — no-op (could scroll to top in future)
    } else if (tab === 'messages') {
      if (game.char || game.narrator_done) {
        navigate('dm-inbox')
      } else {
        showToast('Pehle koi character chuno 🔥')
      }
    } else if (tab === 'live') {
      enterLive()
    } else if (tab === 'profile') {
      if (game.char) {
        navigate('profile')
      } else {
        showToast('Choose a character first to see your profile')
      }
    }
  }, [navigate, showToast, game, enterLive])

  const handleDMIcon = useCallback(() => {
    if (game.char || game.narrator_done) {
      navigate('dm-inbox')
    } else {
      showToast('Pehle Creator House mein andar aao 🔥')
    }
  }, [navigate, showToast, game])

  const currentStoryContent = storyChar ? STORY_CONTENT[storyChar] : null
  const currentChar = storyChar ? CHARS[storyChar] : null
  const playingChar = game.char ? CHARS[game.char] : null

  // Reactive feed: show post from last completed situation's feedReaction
  const visibleSits = getVisibleSituations(game.char)
  const lastCompletedSit = game.situation > 0 ? visibleSits[game.situation - 1] : null
  const lastChoice = game.choices.length > 0 ? game.choices[game.choices.length - 1] : null
  const feedReaction = lastCompletedSit?.feedReaction && lastChoice
    ? lastCompletedSit.feedReaction[lastChoice]
    : null
  const feedReactChar = feedReaction ? CHARS[feedReaction.char] : null

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
          <button className="icon-btn" onClick={() => showToast('Notifications coming soon')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className="icon-btn" style={{ position: 'relative' }} onClick={handleDMIcon}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            <span className="badge-num">3</span>
          </button>
        </div>
        <div className="feed-live">
          <div className="pulse" />
          LIVE — Day 1 of 30 · 8 creators just arrived
        </div>
      </div>

      {/* Scrollable feed */}
      <div className="scroll" style={{ flex: 1 }}>

        {/* Stories ring */}
        <div className="stories">
          {/* You */}
          <button className="story" onClick={() => showToast('Apni kahani khud likho 🔥')}>
            <div className="story-ring">
              <div className="av" style={{ width: '100%', height: '100%', border: '2.5px solid var(--bg)', fontSize: 22, background: '#333' }}>
                You
              </div>
            </div>
            <span className="story-label">You</span>
          </button>

          {STORY_ORDER.filter(id => id !== game.char).map((charId) => {
            const char = CHARS[charId]
            const seen = SEEN_CHARS.includes(charId)
            return (
              <button key={charId} className="story" onClick={() => openStory(charId)}>
                <div className={`story-ring${seen ? ' seen' : ''}`}>
                  <div
                    className={`av ${char.cls}`}
                    style={{
                      width: '100%', height: '100%', border: '2.5px solid var(--bg)',
                      fontSize: 22,
                      backgroundImage: `url(/avatars/${charId}.png)`,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                    }}
                  >
                    <span style={{ opacity:0 }}>{char.init}</span>
                  </div>
                </div>
                <span className="story-label">{char.name}</span>
              </button>
            )
          })}
        </div>

        {/* Reactive post — appears after Live choices, proves "world changed" */}
        {feedReaction && feedReactChar && (
          <div className="post" style={{ borderTop: '2px solid rgba(255,45,120,.3)', background: 'rgba(255,45,120,.04)' }}>
            <div className="post-head">
              <div
                className={`av ${feedReactChar.cls}`}
                style={{ width:34, height:34, fontSize:14,
                  backgroundImage:`url(/avatars/${feedReactChar.id}.png)`,
                  backgroundSize:'cover', backgroundPosition:'center' }}
              >
                <span style={{ opacity:0 }}>{feedReactChar.init}</span>
              </div>
              <div className="post-id">
                <div className="h">{feedReactChar.handle}</div>
                <div className="s" style={{ color:'var(--accent)' }}>Creator House · just now · <b>reacting to your move</b></div>
              </div>
              <div className="new-pill">NEW</div>
            </div>
            <div className={`post-img grain ${feedReactChar.cls}`} style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--cc) 70%, #000) 0%, #000 100%)` }}>
              <p className="overlay-txt" style={{ fontSize:14 }}>{feedReaction.caption}</p>
            </div>
            <div className="post-actions">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
          </div>
        )}

        {/* Post: Ria */}
        <div className="post">
          <div className="post-head">
            <button className="av c-reya" style={{ width:34, height:34, fontSize:14, padding:0, backgroundImage:'url(/avatars/reya.png)', backgroundSize:'cover', backgroundPosition:'center', border:'none', cursor:'pointer' }} onClick={() => setViewingChar('ria')}>
              <span style={{ opacity: 0 }}>R</span>
            </button>
            <div className="post-id">
              <div className="h">reya</div>
              <div className="s">Creator House · 6h ago</div>
            </div>
            <button className="icon-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </button>
          </div>
          <div className="post-img grain" style={{ background: 'linear-gradient(135deg,#b03a5e,#7a1140)' }}>
            <p className="overlay-txt">"Stress ko content mein convert karo. Seekho." 🤍</p>
          </div>
          <div className="post-actions">
            <button onClick={() => likePost('reya-post', 'ria', 3)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
              <svg viewBox="0 0 24 24" fill={likedPosts.has('reya-post') ? 'var(--accent)' : 'none'} stroke={likedPosts.has('reya-post') ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button onClick={() => setCommentPost(commentPost === 'ria' ? null : 'ria')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={commentPost==='ria' ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            <div className="spacer" />
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </div>
          {commentPost === 'ria' && (
            <div className="comment-sheet">
              <div className="comment-sheet-label">Comment as {playingChar?.name ?? 'you'}</div>
              {POST_COMMENTS.reya.map((opt, i) => (
                <button key={i} className="comment-option" onClick={() => handleComment('ria', opt)}>
                  {opt.text}
                </button>
              ))}
            </div>
          )}
          <div className="likes">84,291 likes</div>
          <div className="caption"><b>reya</b> Kaafi log poochte hain — "Ria, tujhe stress nahi hota?" Stress? Main stress ko content mein convert karti hoon. 🤍</div>
          <div className="comments-link">View all 2,847 comments</div>
          <div className="ts" style={{ padding: '2px 14px 12px' }}>6 HOURS AGO</div>
        </div>

        {/* Story drop card */}
        <div className="story-drop" onClick={enterLive}>
          <div className="sd-img" style={{ background: 'linear-gradient(135deg,#ff2d78,#7a1140)' }}>
            <div className="sd-badge">
              <span className="pulse" style={{ marginRight: 5 }} />
              STORY DROP
            </div>
            <div className="sd-title">Brand deal ka phone aaya</div>
            <div className="sd-sub">Ria ka deal. Tera choice. Kya karoge?</div>
            <button className="sd-cta" onClick={(e) => { e.stopPropagation(); enterLive() }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#000"><polygon points="5,3 19,12 5,21"/></svg>
              Play the story
            </button>
          </div>
        </div>

        {/* Post: housewatch_india */}
        <div className="post">
          <div className="post-head">
            <div className="av" style={{ width: 34, height: 34, fontSize: 14, background: '#1c1c26' }}>H</div>
            <div className="post-id">
              <div className="h">housewatch_india</div>
              <div className="s">2.8M followers · 2h ago</div>
            </div>
            <button className="icon-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </button>
          </div>
          <div className="post-img grain" style={{ background: '#12121a' }}>
            <p className="overlay-txt" style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>
              #CreatorHouseLeak — jo viral hua, woh screenshot aur woh ek line.<br /><br />
              "yeh zyada hi innocent act karti hai, real nahi lagti."<br /><br />
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--sans)', fontSize: 12 }}>#CreatorHouseLeak TRENDING</span>
            </p>
          </div>
          <div className="post-actions">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            <div className="spacer" />
          </div>
          <div className="likes">94,102 likes</div>
          <div className="caption"><b>housewatch_india</b> Creator House ka sabse calculated player. 94k likes in 3 hours. Thread aa raha hai. 👀</div>
          <div className="ts" style={{ padding: '2px 14px 12px' }}>2 HOURS AGO</div>
        </div>

        {/* Post: Kabir */}
        <div className="post">
          <div className="post-head">
            <button className="av c-kabir" style={{ width:34, height:34, fontSize:14, padding:0, backgroundImage:'url(/avatars/kabir.png)', backgroundSize:'cover', backgroundPosition:'center', border:'none', cursor:'pointer' }} onClick={() => setViewingChar('kabir')}>
              <span style={{ opacity:0 }}>K</span>
            </button>
            <div className="post-id">
              <div className="h">kabirlol</div>
              <div className="s">Creator House · 3h ago</div>
            </div>
            <button className="icon-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </button>
          </div>
          <div className="post-img grain" style={{ background: 'linear-gradient(135deg,#2a6f8f,#0a2a40)' }}>
            <p className="overlay-txt">"Is ghar mein sab serious ho jaate hain jab camera on hota hai. Main serious tab hota hoon jab camera off hota hai." 😭👀</p>
          </div>
          <div className="post-actions">
            <button onClick={() => likePost('kabir-post', 'kabir', 2)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
              <svg viewBox="0 0 24 24" fill={likedPosts.has('kabir-post') ? 'var(--accent)' : 'none'} stroke={likedPosts.has('kabir-post') ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button onClick={() => setCommentPost(commentPost === 'kabir' ? null : 'kabir')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={commentPost==='kabir' ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            <div className="spacer" />
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </div>
          {commentPost === 'kabir' && (
            <div className="comment-sheet">
              <div className="comment-sheet-label">Comment as {playingChar?.name ?? 'you'}</div>
              {POST_COMMENTS.kabir.map((opt, i) => (
                <button key={i} className="comment-option" onClick={() => handleComment('kabir', opt)}>
                  {opt.text}
                </button>
              ))}
            </div>
          )}
          <div className="likes">41,882 likes</div>
          <div className="caption"><b>kabirlol</b> Camera ka psychology. Weekend mein thread dalunga. 😭</div>
          <div className="comments-link">View all 1,204 comments</div>
          <div className="ts" style={{ padding: '2px 14px 12px' }}>3 HOURS AGO</div>
        </div>

        {/* Post: Ananya */}
        <div className="post" style={{ borderBottom: 'none' }}>
          <div className="post-head">
            <button className="av c-ananya" style={{ width:34, height:34, fontSize:14, padding:0, backgroundImage:'url(/avatars/ananya.png)', backgroundSize:'cover', backgroundPosition:'center', border:'none', cursor:'pointer' }} onClick={() => setViewingChar('ananya')}>
              <span style={{ opacity:0 }}>A</span>
            </button>
            <div className="post-id">
              <div className="h">ananya</div>
              <div className="s">Creator House · 45m ago</div>
            </div>
            <button className="icon-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </button>
          </div>
          <div className="post-img grain" style={{ background: 'linear-gradient(135deg,#8a4ab0,#3a1660)' }}>
            <p className="overlay-txt">2.1M views raat mein. Subah uthke dekha toh ro padi. Phir Ria ko bataya. Usne bola... "nice." 🥺✨</p>
          </div>
          <div className="post-actions">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {/* Don't show comment if playing as Ananya — can't comment on your own post */}
            {game.char !== 'ananya' && (
              <button onClick={() => setCommentPost(commentPost === 'ananya' ? null : 'ananya')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={commentPost==='ananya' ? 'var(--accent)' : '#fff'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </button>
            )}
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            <div className="spacer" />
          </div>
          {commentPost === 'ananya' && (
            <div className="comment-sheet">
              <div className="comment-sheet-label">Comment as {playingChar?.name ?? 'you'}</div>
              {POST_COMMENTS.ananya.map((opt, i) => (
                <button key={i} className="comment-option" onClick={() => handleComment('ananya', opt)}>
                  {opt.text}
                </button>
              ))}
            </div>
          )}
          <div className="likes">2,108,441 likes</div>
          <div className="caption"><b>ananya</b> 2.1M. Ro padi. Tumhara pyaar 🥺✨</div>
          <div className="comments-link">View all 18,204 comments</div>
          <div className="ts" style={{ padding: '2px 14px 12px' }}>45 MINUTES AGO</div>
        </div>

        {/* bottom spacing */}
        <div style={{ height: 20 }} />
      </div>

      {/* Tab bar */}
      <div className="tabbar">
        <button className="tab active" onClick={() => handleTab('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>
          </svg>
          <span>Feed</span>
        </button>
        <button className="tab" onClick={() => handleTab('messages')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
          <span>Messages</span>
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
              LIVE · DAY 1 OF 30
            </div>
          </div>
          {/* Line 1: Title */}
          <div className={`wi-line${introLines[1] ? ' in' : ''}`}>
            <div className="wi-title">Creator House.</div>
          </div>
          {/* Line 2: Meta */}
          <div className={`wi-line${introLines[2] ? ' in' : ''}`}>
            <div className="wi-meta">8 creators. Ek villa. 30 din ka experiment.</div>
          </div>
          {/* Line 3: Drama */}
          <div className={`wi-line${introLines[3] ? ' in' : ''}`}>
            <div className="wi-drama">
              <b>Aaj raat, villa khul raha hai.</b> 8 strangers pehli baar mile hain. Koi dushman nahi, koi dost nahi — but by morning, alliances ban jaayengi. Tum kaun banna chahte ho?
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
              <div className="wi-chars-label">8 creators · 1.2M following</div>
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

      {/* Story viewer overlay */}
      <div className={`story-viewer${storyActive ? ' active' : ''}`} onClick={tapStory}>
        {currentChar && currentStoryContent && (
          <>
            <div
              className="sv-bg"
              style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${getCharColor(currentChar.id)} 60%, #000) 0%, #000 100%)` }}
            />
            <div className="sv-vignette" />
            {/* Progress bars — one per character; filled=past, running=current, empty=future */}
            <div className="sv-progress">
              {STORY_ORDER.map((id) => {
                const curIdx = storyChar ? STORY_ORDER.indexOf(storyChar) : -1
                const thisIdx = STORY_ORDER.indexOf(id)
                const cls = thisIdx < curIdx ? 'done' : (id === storyChar && storyActive ? 'run' : '')
                return <span key={id}><i className={cls} /></span>
              })}
            </div>
            {/* Top bar */}
            <div className="sv-top">
              <div className={`av ${currentChar.cls}`} style={{ width: 34, height: 34, fontSize: 14 }}>
                {currentChar.init}
              </div>
              <div className="sinfo">
                <div className="sn">{currentChar.name}</div>
                <div className="st">{currentStoryContent.time}</div>
              </div>
              <button className="sv-close" onClick={(e) => { e.stopPropagation(); closeStory() }}>✕</button>
            </div>
            {/* Body */}
            <div className="sv-body">
              <div className="sv-text">{currentStoryContent.text}</div>
              <div className="sv-sub">TAP TO CLOSE · {currentStoryContent.time.toUpperCase()}</div>
            </div>
            <div className="sv-tap-hint">tap anywhere to close</div>
          </>
        )}
      </div>
    </div>
  )
}

function getCharColor(id: string): string {
  const map: Record<string, string> = {
    reya:'#b03a5e', kabir:'#2a6f8f', meher:'#b07a2a', dev:'#3a7a4a',
    ananya:'#8a4ab0', zoya:'#aa6a8a', rishi:'#4a8a2a', adi:'#d4581a',
  }
  return map[id] ?? '#333'
}
