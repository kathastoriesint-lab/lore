'use client'
import { useApp } from '@/lib/context'
import type { CharId } from '@/lib/types'
import { getCricketChars, getCHChars, getCHDMOrder } from '@/lib/content'
import GoalCard from '@/components/GoalCard'

import { useCallback, useEffect, useMemo, useState } from 'react'

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

// Character subtexts shown under name in DM list
const CHAR_SUBTEXT: Partial<Record<string, string>> = {
  hardik:  'Captain · Mumbai Indians',
  rohit:   'Senior batsman · MI legend',
  surya:   'T20 specialist · Dressing room warmth',
  bumrah:  'Pace spearhead · The standard',
  tilak:   'Young batsman · Your mirror',
  coach:   'Childhood coach · Cricket conscience',
  friend:  'School friend · Real life',
  naman:   'Young Table · Competition',
  robin:   'Young Table · Keeper-batter',
  mahela:  'Head Coach · Selection calls',
}

// Read/write opened state from localStorage (persists across navigation)
function getOpened(userId: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(`lore_dm_opened_${userId || 'anon'}`)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
function setOpened(userId: string, charId: string) {
  try {
    const key = `lore_dm_opened_${userId || 'anon'}`
    const raw = localStorage.getItem(key)
    const all = raw ? JSON.parse(raw) : {}
    localStorage.setItem(key, JSON.stringify({ ...all, [charId]: Date.now() }))
  } catch {}
}

export default function DMInboxScreen() {
  const { goBack, navigate, showToast, openDMThread, dmHistory, dmLastUpdated, game } = useApp()
  const isCricket = game.world === 'cricket'
  const allChars = { ...getCHChars(), ...getCricketChars() }
  const [userId, setUserId] = useState('anon')
  const [openedMap, setOpenedMap] = useState<Record<string, number>>({})

  // Load userId + opened state on mount
  useEffect(() => {
    import('@/lib/game').then(({ ensureSession }) => {
      ensureSession().then(session => {
        const uid = session?.user?.id ?? 'anon'
        setUserId(uid)
        setOpenedMap(getOpened(uid))
      }).catch(() => setOpenedMap(getOpened('anon')))
    })
  }, [])

  const visibleChars = useMemo(() => {
    const baseOrder = isCricket
      ? CRICKET_DM_ORDER
      : getCHDMOrder().filter(id => id !== game.char)
    return [...baseOrder].sort((a, b) => {
      const aHasMessages = (dmHistory[a]?.length ?? 0) > 0
      const bHasMessages = (dmHistory[b]?.length ?? 0) > 0
      if (aHasMessages !== bHasMessages) return aHasMessages ? -1 : 1
      return (dmLastUpdated[b] ?? 0) - (dmLastUpdated[a] ?? 0)
    })
  }, [dmHistory, dmLastUpdated, game.char, isCricket])

  const handleOpen = useCallback((charId: CharId) => {
    if ((dmHistory[charId]?.length ?? 0) === 0) {
      showToast('No messages yet')
      return
    }
    setOpened(userId, charId)
    setOpenedMap(prev => ({ ...prev, [charId]: Date.now() }))
    openDMThread(charId)
  }, [dmHistory, openDMThread, showToast, userId])

  const handleTab = useCallback((tab: string) => {
    if (tab === 'home') navigate('feed')
    else if (tab === 'live') navigate('live')
    else if (tab === 'profile') showToast('Profile jald aayega 🔥')
  }, [navigate, showToast])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StatusBar />

      {/* App bar — no search, no compose button */}
      <div className="appbar dm-head">
        <div className="row1">
          <button className="icon-btn" onClick={goBack}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <div className="title">Messages</div>
          <div style={{ width:38 }} />
        </div>
        <div className="sub">{isCricket ? 'Indian Dressing Room' : 'Creator House'} · {visibleChars.length} contacts</div>
      </div>

      {/* Season goal — slim pinned variant */}
      <GoalCard variant="slim" />

      {/* DM list */}
      <div className="scroll" style={{ flex: 1 }}>
        {visibleChars.map((charId) => {
          const char = allChars[charId]
          if (!char) return null
          const history = dmHistory[charId] ?? []
          const hasMessages = history.length > 0
          const lastUpdated = dmLastUpdated[charId] ?? 0
          const lastOpened = openedMap[charId] ?? 0
          const isUnread = hasMessages && lastUpdated > lastOpened
          const lastMsg = hasMessages ? history[history.length - 1].text : null
          const preview = lastMsg
            ? (lastMsg.length > 42 ? lastMsg.slice(0, 42) + '…' : lastMsg)
            : CHAR_SUBTEXT[charId] ?? char.role.split(' · ')[0]

          return (
            <button key={charId} className="dm-row" onClick={() => handleOpen(charId)}>
              <div className={`av ${char.cls}`} style={{ width:48, height:48, fontSize:18, backgroundImage:`url(/avatars/${charId}.png)`, backgroundSize:'cover', backgroundPosition:'center' }}>
                <span style={{ opacity:0 }}>{char.init}</span>
              </div>
              <div className="info">
                <div className="nm">{char.name}</div>
                <div className="prev" style={{ color: isUnread ? 'var(--ink)' : undefined, fontWeight: isUnread ? 600 : undefined }}>
                  {preview}
                </div>
              </div>
              <div className="meta">
                <div className="ts">{hasMessages ? 'now' : ''}</div>
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
          <span>Messages</span>
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
