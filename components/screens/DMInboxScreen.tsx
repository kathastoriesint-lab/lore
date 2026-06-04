'use client'
import { useApp } from '@/lib/context'
import type { CharId } from '@/lib/types'
import { CHARS, DM_ORDER, DM_PREVIEW, DM_TIME, DM_UNREAD } from '@/lib/data'
import { CRICKET_CHARS, CRICKET_DM_HOOKS } from '@/lib/cricket-data'

import { useCallback, useRef, useState } from 'react'

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

const CRICKET_DM_ORDER: CharId[] = ['hardik', 'rohit', 'surya', 'bumrah', 'tilak', 'coach', 'friend']
const CRICKET_DM_TIMES: Partial<Record<string, string>> = {
  hardik: '2m', rohit: '15m', surya: '8m', bumrah: '1h', tilak: '30m', coach: '3h', friend: 'just now'
}
const CRICKET_DM_UNREAD = ['friend', 'surya', 'hardik']

export default function DMInboxScreen() {
  const { goBack, navigate, showToast, openDMThread, dmHistory, game } = useApp()
  const isCricket = game.world === 'cricket'
  const allChars = { ...CHARS, ...CRICKET_CHARS }

  // Never show the character you're playing as in your own DM list
  const visibleChars = isCricket
    ? CRICKET_DM_ORDER.filter(id => id !== game.char)
    : DM_ORDER.filter(id => id !== game.char)

  // Track which chars have been opened (remove unread dot)
  const [opened, setOpened] = useState<Set<CharId>>(new Set())

  const handleOpen = useCallback((charId: CharId) => {
    setOpened(prev => new Set([...prev, charId]))
    openDMThread(charId)
  }, [openDMThread])

  const handleTab = useCallback((tab: string) => {
    if (tab === 'home') navigate('feed')
    else if (tab === 'live') navigate('live')
    else if (tab === 'profile') showToast('Profile jald aayega 🔥')
  }, [navigate, showToast])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StatusBar />

      {/* App bar */}
      <div className="appbar dm-head">
        <div className="row1">
          <button className="icon-btn" onClick={goBack}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <div className="title">Messages</div>
          <button className="icon-btn" onClick={() => showToast('New message coming soon')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
        <div className="sub">{isCricket ? 'Indian Dressing Room · 7 contacts' : 'Creator House · 8 characters'}</div>
      </div>

      {/* Search bar (decorative) */}
      <div className="dm-search">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        Search
      </div>

      {/* DM list */}
      <div className="scroll" style={{ flex: 1 }}>
        {visibleChars.map((charId) => {
          const char = allChars[charId]
          if (!char) return null
          const isUnread = (isCricket ? CRICKET_DM_UNREAD : DM_UNREAD).includes(charId) && !opened.has(charId)
          const history = dmHistory[charId]
          const dmPreview = isCricket ? (CRICKET_DM_HOOKS[charId] ?? '...') : (DM_PREVIEW[charId] ?? '...')
          const lastMsg = history && history.length > 0
            ? history[history.length - 1].text
            : dmPreview
          const preview = lastMsg.length > 42 ? lastMsg.slice(0, 42) + '…' : lastMsg

          return (
            <button key={charId} className="dm-row" onClick={() => handleOpen(charId)}>
              <div className={`av ${char.cls}`} style={{ width:48, height:48, fontSize:18, backgroundImage:`url(/avatars/${charId}.png)`, backgroundSize:'cover', backgroundPosition:'center' }}>
                <span style={{ opacity:0 }}>{char.init}</span>
              </div>
              <div className="info">
                <div className="nm">{char.name}</div>
                <div className="prev">{preview}</div>
              </div>
              <div className="meta">
                <div className="ts">{isCricket ? (CRICKET_DM_TIMES[charId] ?? '1h') : (DM_TIME[charId] ?? '1h')}</div>
                {isUnread && <div className="unread" />}
              </div>
            </button>
          )
        })}
        <div style={{ height: 20 }} />
      </div>

      {/* Tab bar */}
      <div className="tabbar">
        <button className="tab" onClick={() => handleTab('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>
          <span>Feed</span>
        </button>
        <button className="tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>DMs</span>
        </button>
        <button className="tab" onClick={() => handleTab('live')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4.5 13.5H11L9 22l9-12h-6.5L13 2z" strokeLinejoin="round"/></svg>
          <span>Live</span>
        </button>
        <button className="tab" onClick={() => handleTab('profile')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <span>Profile</span>
        </button>
      </div>
    </div>
  )
}
