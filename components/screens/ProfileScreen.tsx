'use client'
import { useApp } from '@/lib/context'
import { CHARS, DM_TRUST } from '@/lib/data'
import { fameToFollowers as fameToFollowersNum } from '@/lib/game'
import MeterHUD from '@/components/MeterHUD'

// Fame 0-100 → followers string (formatted)
function fameToFollowersStr(fame: number): string {
  const raw = fameToFollowersNum(fame)
  if (raw >= 1_000_000) return `${(raw / 1_000_000).toFixed(1)}M`
  if (raw >= 1_000)     return `${(raw / 1_000).toFixed(0)}K`
  return `${raw}`
}

function fameToFollowing(fame: number): string {
  return `${Math.round(200 + fame * 3)}`
}

const CHAR_POSTS: Record<string, { caption: string; bg: string }[]> = {
  ananya: [
    { caption: '2.1M views raat mein 🥺✨', bg: 'linear-gradient(135deg,#8a4ab0,#3a1660)' },
    { caption: 'Reels grind never stops 💜', bg: 'linear-gradient(135deg,#6a3a90,#1a0840)' },
    { caption: 'Creator House Day 1 🏠', bg: 'linear-gradient(135deg,#aa6ab0,#4a0880)' },
  ],
  ria: [
    { caption: 'Stress → content 🤍', bg: 'linear-gradient(135deg,#b03a5e,#7a1140)' },
    { caption: 'Mornings. Always.', bg: 'linear-gradient(135deg,#c04a6e,#5a0830)' },
    { caption: 'No explanation needed 👑', bg: 'linear-gradient(135deg,#903050,#4a0820)' },
  ],
  kabir: [
    { caption: 'Content > everything 😭', bg: 'linear-gradient(135deg,#2a6f8f,#0a2a40)' },
    { caption: 'Camera never lies 👀', bg: 'linear-gradient(135deg,#1a5f7f,#082030)' },
    { caption: 'We outside 🔥', bg: 'linear-gradient(135deg,#3a7f9f,#0a3050)' },
  ],
  meher: [
    { caption: 'Some things stay off camera 🫶', bg: 'linear-gradient(135deg,#b07a2a,#5a3a00)' },
    { caption: 'Real > curated ✨', bg: 'linear-gradient(135deg,#c08a3a,#4a2a00)' },
    { caption: 'House diary 🏠', bg: 'linear-gradient(135deg,#906a1a,#3a2000)' },
  ],
  dev: [
    { caption: '5AM. Always. 💪', bg: 'linear-gradient(135deg,#3a7a4a,#0a2a1a)' },
    { caption: 'Brand deal incoming 🤝', bg: 'linear-gradient(135deg,#2a6a3a,#081a08)' },
    { caption: 'Numbers never lie 📈', bg: 'linear-gradient(135deg,#4a8a5a,#0a3020)' },
  ],
  zoya: [
    { caption: 'Hi babies 🥰', bg: 'linear-gradient(135deg,#aa6a8a,#3a1a2a)' },
    { caption: 'GRWM Creator House edition 💅', bg: 'linear-gradient(135deg,#9a5a7a,#2a0a1a)' },
    { caption: 'Not saying anything 👀', bg: 'linear-gradient(135deg,#ba7a9a,#4a2a3a)' },
  ],
  rishi: [
    { caption: 'Raw footage 🎥', bg: 'linear-gradient(135deg,#4a8a2a,#0a2a00)' },
    { caption: 'You never know who is recording', bg: 'linear-gradient(135deg,#3a7a1a,#081800)' },
    { caption: 'Day 1 archive', bg: 'linear-gradient(135deg,#5a9a3a,#0a3a00)' },
  ],
  adi: [
    { caption: 'New beginnings 🙏', bg: 'linear-gradient(135deg,#d4581a,#5a1a00)' },
    { caption: 'Still learning the game', bg: 'linear-gradient(135deg,#c44808,#3a0800)' },
    { caption: 'Creator House 🏠', bg: 'linear-gradient(135deg,#e46828,#6a2800)' },
  ],
}

const StatusBar = () => (
  <div className="statusbar">
    <span>9:41</span>
    <span className="sb-right">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="#fff"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
      <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="1" y="1" width="20" height="10" rx="2.6" stroke="#fff" strokeOpacity=".45"/><rect x="2.6" y="2.6" width="14.5" height="6.8" rx="1.3" fill="#fff"/><rect x="22.4" y="4" width="1.6" height="4" rx="1" fill="#fff" fillOpacity=".45"/></svg>
    </span>
  </div>
)

export default function ProfileScreen() {
  const { game, navigate, goBack, dmTrust } = useApp()
  const charId = (game.char ?? 'adi') as import('@/lib/types').CharId
  const char = CHARS[charId]

  const fame = game.meters.fame
  const followers = fameToFollowersStr(fame)
  const following = fameToFollowing(fame)
  const posts = CHAR_POSTS[charId] ?? []

  // Relationships from DM trust
  const relationships = Object.entries(dmTrust)
    .filter(([id]) => id !== charId)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)' }}>
      <StatusBar />

      {/* Header */}
      <div className="appbar" style={{ justifyContent:'space-between', padding:'6px 16px 12px' }}>
        <button className="icon-btn" onClick={goBack}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div style={{ fontWeight:700, fontSize:15 }}>{game.playerName || char.name}</div>
        <div style={{ width:38 }} />
      </div>

      <div className="scroll">
        {/* Profile info */}
        <div style={{ padding:'16px 18px 0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            {/* Avatar */}
            <div className="av" style={{ width:72, height:72, fontSize:28, flexShrink:0, background:'var(--accent)' }}>
              {(game.playerName?.[0] ?? 'Y').toUpperCase()}
            </div>
            {/* Stats */}
            <div style={{ display:'flex', gap:20, flex:1, justifyContent:'center' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontWeight:800, fontSize:16 }}>{posts.length}</div>
                <div style={{ fontSize:11, color:'var(--ink2)' }}>Posts</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div key={followers} style={{ fontWeight:800, fontSize:16, animation:'meterFlash .4s ease-out' }}>{followers}</div>
                <div style={{ fontSize:11, color:'var(--ink2)' }}>Followers</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontWeight:800, fontSize:16 }}>{following}</div>
                <div style={{ fontSize:11, color:'var(--ink2)' }}>Following</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:12, color:'var(--ink2)', marginTop:2 }}>Creator • Day {Math.ceil((game.situation + 1) / 3)} of 10</div>
            <div style={{ fontSize:12, color:'var(--ink3)', marginTop:2 }}>Creator House</div>
          </div>

        </div>

        {/* Shared HUD — same meters as Live + Feed */}
        <MeterHUD />

        {/* Relationships */}
        {relationships.length > 0 && (
          <div style={{ padding:'16px 18px 0' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--ink3)', letterSpacing:'.08em', marginBottom:10 }}>RELATIONSHIPS</div>
            <div style={{ display:'flex', gap:14, overflowX:'auto', paddingBottom:4 }}>
              {relationships.map(([id, trust]) => {
                const r = CHARS[id as keyof typeof CHARS]
                if (!r) return null
                const trustColor = trust > 60 ? 'var(--trust)' : trust < 35 ? 'var(--heat)' : 'var(--ink2)'
                return (
                  <div key={id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, flexShrink:0 }}>
                    <div className={`av ${r.cls}`} style={{ width:42, height:42, fontSize:16 }}>{r.init}</div>
                    <div style={{ fontSize:10, fontWeight:600, color:'var(--ink2)' }}>{r.name}</div>
                    <div style={{ fontSize:9, fontWeight:800, color:trustColor }}>{trust}% trust</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Posts grid */}
        <div style={{ marginTop:16, borderTop:'1px solid var(--line)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }}>
            {posts.map((p, i) => (
              <div key={i} style={{ aspectRatio:'1/1', background:p.bg, position:'relative', display:'grid', placeItems:'center', cursor:'pointer' }}>
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.15)' }} />
                <div style={{ position:'relative', fontSize:9, color:'rgba(255,255,255,.85)', textAlign:'center', padding:'0 6px', fontStyle:'italic', fontFamily:'var(--serif)' }}>
                  {p.caption}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height:24 }} />
      </div>

      {/* Tab bar */}
      <div className="tabbar">
        <button className="tab" onClick={() => navigate('feed')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>
          </svg>
          <span>Feed</span>
        </button>
        <button className="tab" onClick={() => navigate('live')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L4.5 13.5H11L9 22l9-12h-6.5L13 2z"/>
          </svg>
          <span>Live</span>
        </button>
        <button className="tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <span>Profile</span>
        </button>
      </div>
    </div>
  )
}
