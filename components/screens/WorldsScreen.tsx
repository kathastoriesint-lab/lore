'use client'
import { useCallback } from 'react'
import { useApp } from '@/lib/context'
import type { World } from '@/lib/types'

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

// Real scene art + character photos per world (never initials placeholders).
const WORLD_ART: Record<World, {
  art: string; name: string; teaser: string; meta: string
  liveColor: string; avatars: string[]; more: string
}> = {
  cricket: {
    art: '/avatars/cricket-wankhede.png',
    name: 'Indian Dressing Room',
    teaser: '16 saal. MI debut. India tak ka safar.',
    meta: 'Mumbai Indians · 30 situations · 5 endings',
    liveColor: 'var(--fame)',
    avatars: ['/avatars/rohit.png', '/avatars/bumrah.png', '/avatars/hardik.png'],
    more: '+9',
  },
  'creator-house': {
    art: '/avatars/seed-villa.png',
    name: 'Creator House',
    teaser: 'Reality villa · 6 creators · 10 din',
    meta: '6 creators · 1.2M following',
    liveColor: 'var(--trust)',
    avatars: ['/avatars/ria.png', '/avatars/kabir.png', '/avatars/ananya.png'],
    more: '+2',
  },
}

const LOCKED = [
  { id: 'college-hostel',   name: 'College Hostel' },
  { id: 'indian-mythology', name: 'Indian Mythology' },
  { id: 'corporate-drama',  name: 'Corporate Drama' },
]

export default function WorldsScreen() {
  const { navigate, game } = useApp()

  const inProgress = useCallback((id: World) => game.world === id && game.situation > 0, [game.world, game.situation])

  // Hierarchy: the active/most-recent world leads. Default to the flagship
  // (cricket) — only feature Creator House when the player has a CH run going.
  const featuredId: World = inProgress('creator-house') ? 'creator-house' : 'cricket'
  const compactId: World = featuredId === 'cricket' ? 'creator-house' : 'cricket'

  const enterWorld = useCallback((id: World) => {
    if (id === 'cricket') {
      // Resume an in-progress run (LiveScreen redirects to the lock screen if an
      // interlude is active); fresh runs play the carousel. Never wipe progress.
      navigate(inProgress('cricket') ? 'live' : 'cricket-carousel')
    } else {
      // Same shape for Creator House: resume in-progress runs straight to Live,
      // fresh runs play the world-intro carousel. (Parity with cricket.)
      navigate(inProgress('creator-house') ? 'live' : 'world-intro')
    }
  }, [navigate, inProgress])

  const badge = (id: World) => {
    if (id === 'cricket') return inProgress('cricket') ? `CONTINUE · WEEK ${game.week ?? 1}` : 'LIVE · SEASON 1'
    return inProgress('creator-house') ? 'IN PROGRESS' : 'LIVE · SEASON 1'
  }

  const LiveBadge = ({ id, top = 15 }: { id: World; top?: number }) => (
    <span style={{
      position: 'absolute', top, left: 15, display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 9.5, fontWeight: 800, letterSpacing: '.06em', color: WORLD_ART[id].liveColor,
      background: 'rgba(8,8,15,.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      padding: '6px 11px', borderRadius: 20,
    }}>
      <span style={{ position: 'relative', width: 6, height: 6 }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: WORLD_ART[id].liveColor }} />
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: WORLD_ART[id].liveColor, animation: 'pulse 1.8s ease-out infinite' }} />
      </span>
      {badge(id)}
    </span>
  )

  const grain = <div style={{ position: 'absolute', inset: 0, background: 'var(--grain)', opacity: 0.32, mixBlendMode: 'overlay', pointerEvents: 'none' }} />

  // Both worlds that are open today get equal space — active/most-recent on top.
  const openWorlds: World[] = [featuredId, compactId]
  const avatar = (url: string, ml = 0) => (
    <div key={url} style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--bg)', marginLeft: ml, backgroundColor: '#0a1a4a', backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)', fontFamily: 'var(--sans)' }}>
      <StatusBar />

      {/* Header */}
      <div style={{ flex: 'none', padding: '8px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 24, color: '#fff' }}>Choose a world</div>
        <button
          className="lo-press"
          onClick={() => navigate('profile-global')}
          aria-label="Profile"
          style={{
            width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            background: game.avatarUrl ? `center/cover url(${game.avatarUrl})` : 'linear-gradient(135deg,#ff2d78,#ff8a3d)',
            fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 18, color: '#fff',
          }}
        >
          {!game.avatarUrl && (game.playerName?.[0]?.toUpperCase() ?? 'A')}
        </button>
      </div>

      {/* Gallery */}
      <div className="scroll" style={{ flex: 1, padding: '4px 18px 14px' }}>

        {/* ===== Open worlds — equal cards, tap the card to enter (no CTA button) ===== */}
        {openWorlds.map(id => {
          const w = WORLD_ART[id]
          return (
            <button
              key={id}
              className="lo-press"
              onClick={() => enterWorld(id)}
              style={{ position: 'relative', display: 'block', width: '100%', height: 244, borderRadius: 24, overflow: 'hidden', marginBottom: 16, border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
            >
              <img src={w.art} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              {grain}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,15,.35) 0%, transparent 30%, rgba(8,8,15,.55) 60%, rgba(8,8,15,.94) 100%)' }} />
              <LiveBadge id={id} />
              <div style={{ position: 'absolute', left: 20, right: 20, bottom: 18 }}>
                <div style={{ display: 'flex', marginBottom: 11 }}>
                  {w.avatars.map((u, i) => avatar(u, i === 0 ? 0 : -10))}
                  <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--bg)', marginLeft: -10, background: 'rgba(8,8,15,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{w.more}</div>
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 25, color: '#fff', lineHeight: 1.1 }}>{w.name}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.75)', marginTop: 5 }}>{w.teaser}</div>
              </div>
            </button>
          )
        })}

        {/* ===== Locked / coming soon ===== */}
        {LOCKED.map(w => (
          <div
            key={w.id}
            style={{ position: 'relative', height: 150, borderRadius: 24, overflow: 'hidden', marginBottom: 16, background: 'linear-gradient(135deg,#22202a,#141219)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 19, color: 'var(--ink2)' }}>{w.name}</div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', color: 'var(--ink3)' }}>COMING SOON</div>
          </div>
        ))}
      </div>

      {/* Tab bar — out-of-world (Worlds · Profile) */}
      <div className="tabbar">
        <button className="tab active" onClick={() => {}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 3c-2.5 3-4 5.7-4 9s1.5 6 4 9M12 3c2.5 3 4 5.7 4 9s-1.5 6-4 9M3 12h18"/>
          </svg>
          <span>Worlds</span>
        </button>
        <button className="tab" onClick={() => navigate('profile-global')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <span>Profile</span>
        </button>
      </div>
    </div>
  )
}
