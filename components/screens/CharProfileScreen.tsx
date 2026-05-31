'use client'
import { useApp } from '@/lib/context'
import { CHARS, DM_TRUST } from '@/lib/data'
import type { CharId } from '@/lib/types'

// Fame 0–100 → follower string (same formula as ProfileScreen)
function fameToFollowers(fame: number): string {
  const raw = Math.round(fame * fame * 120 + fame * 1000)
  if (raw >= 1_000_000) return `${(raw / 1_000_000).toFixed(1)}M`
  if (raw >= 1_000)     return `${Math.round(raw / 1000)}K`
  return `${raw}`
}

const CHAR_POSTS: Record<string, { caption: string; bg: string }[]> = {
  reya:   [
    { caption: 'Stress → content 🤍', bg: 'linear-gradient(135deg,#b03a5e,#7a1140)' },
    { caption: 'Mornings. Always.', bg: 'linear-gradient(135deg,#c04a6e,#5a0830)' },
    { caption: 'No explanation needed 👑', bg: 'linear-gradient(135deg,#903050,#4a0820)' },
  ],
  kabir:  [
    { caption: 'Content > everything 😭', bg: 'linear-gradient(135deg,#2a6f8f,#0a2a40)' },
    { caption: 'Camera never lies 👀', bg: 'linear-gradient(135deg,#1a5f7f,#082030)' },
    { caption: 'We outside 🔥', bg: 'linear-gradient(135deg,#3a7f9f,#0a3050)' },
  ],
  meher:  [
    { caption: 'Some things stay off camera 🫶', bg: 'linear-gradient(135deg,#b07a2a,#5a3a00)' },
    { caption: 'Real > curated ✨', bg: 'linear-gradient(135deg,#c08a3a,#4a2a00)' },
    { caption: 'House diary', bg: 'linear-gradient(135deg,#906a1a,#3a2000)' },
  ],
  dev:    [
    { caption: '5AM. Always. 💪', bg: 'linear-gradient(135deg,#3a7a4a,#0a2a1a)' },
    { caption: 'Brand deal incoming 🤝', bg: 'linear-gradient(135deg,#2a6a3a,#081a08)' },
    { caption: 'Numbers never lie 📈', bg: 'linear-gradient(135deg,#4a8a5a,#0a3020)' },
  ],
  ananya: [
    { caption: '2.1M views raat mein 🥺✨', bg: 'linear-gradient(135deg,#8a4ab0,#3a1660)' },
    { caption: 'Reels grind 💜', bg: 'linear-gradient(135deg,#6a3a90,#1a0840)' },
    { caption: 'Creator House Day 1 🏠', bg: 'linear-gradient(135deg,#aa6ab0,#4a0880)' },
  ],
  zoya:   [
    { caption: 'Hi babies 🥰', bg: 'linear-gradient(135deg,#aa6a8a,#3a1a2a)' },
    { caption: 'GRWM edition 💅', bg: 'linear-gradient(135deg,#9a5a7a,#2a0a1a)' },
    { caption: 'Not saying anything 👀', bg: 'linear-gradient(135deg,#ba7a9a,#4a2a3a)' },
  ],
  rishi:  [
    { caption: 'Raw footage 🎥', bg: 'linear-gradient(135deg,#4a8a2a,#0a2a00)' },
    { caption: 'You never know who is recording', bg: 'linear-gradient(135deg,#3a7a1a,#081800)' },
    { caption: 'Day 1 archive', bg: 'linear-gradient(135deg,#5a9a3a,#0a3a00)' },
  ],
  adi:    [
    { caption: 'New beginnings 🙏', bg: 'linear-gradient(135deg,#d4581a,#5a1a00)' },
    { caption: 'Still learning the game', bg: 'linear-gradient(135deg,#c44808,#3a0800)' },
    { caption: 'Creator House 🏠', bg: 'linear-gradient(135deg,#e46828,#6a2800)' },
  ],
}

const CHAR_BIO: Record<string, string> = {
  reya:   'Luxury lifestyle · the house alpha · everything looks effortless',
  kabir:  'Comedy creator · chaos merchant · everyone\'s friend, nobody\'s ally',
  meher:  'Lifestyle · the house\'s heart · warm in public, strategic in private',
  dev:    'Fitness creator · grindset · loyalty for sale to highest bidder',
  ananya: 'Dance creator · 19 · went viral overnight and never slept since',
  zoya:   'Beauty · sweet on camera · sharp off it · watching everything',
  rishi:  'Vlogger · records everything · all footage is leverage eventually',
  adi:    'Content creator · newest in the house · still figuring it all out',
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

export default function CharProfileScreen() {
  const { goBack, viewingCharId, charFame, dmTrust, game, navigate, openDMThread } = useApp()
  const charId = viewingCharId
  const char = charId ? CHARS[charId] : null

  if (!char || !charId) {
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)', alignItems:'center', justifyContent:'center' }}>
        <button style={{ color:'var(--accent)', fontWeight:600 }} onClick={goBack}>Go back</button>
      </div>
    )
  }

  const fame = charFame[charId] ?? char.fame
  const followers = fameToFollowers(fame)
  const posts = CHAR_POSTS[charId] ?? []
  const trust = dmTrust[charId] ?? DM_TRUST[charId] ?? 50
  const isPlayingAsThis = game.char === charId
  const trustColor = trust > 60 ? 'var(--trust)' : trust < 35 ? 'var(--heat)' : 'var(--ink2)'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)' }}>
      <StatusBar />

      {/* Header */}
      <div className="appbar" style={{ justifyContent:'space-between', padding:'6px 16px 12px' }}>
        <button className="icon-btn" onClick={goBack}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div style={{ fontWeight:700, fontSize:15 }}>{char.handle}</div>
        <div style={{ width:38 }} />
      </div>

      <div className="scroll">
        {/* Profile header */}
        <div style={{ padding:'16px 18px 0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            {/* Avatar — image if available, else colored initial */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <div
                className={`av ${char.cls}`}
                style={{
                  width:72, height:72, fontSize:28,
                  backgroundImage:`url(/avatars/${charId}.png)`,
                  backgroundSize:'cover', backgroundPosition:'center',
                }}
              >
                {char.init}
              </div>
              {isPlayingAsThis && (
                <div style={{
                  position:'absolute', bottom:-4, right:-4,
                  background:'var(--accent)', borderRadius:'50%',
                  width:20, height:20, display:'grid', placeItems:'center',
                  border:'2px solid var(--bg)', fontSize:10, fontWeight:800,
                }}>
                  ✓
                </div>
              )}
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
                <div style={{ fontWeight:800, fontSize:16, color:trustColor }}>{trust}%</div>
                <div style={{ fontSize:11, color:'var(--ink2)' }}>Trust</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div style={{ marginTop:12 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>{char.name}</div>
            <div style={{ fontSize:12, color:'var(--ink2)', marginTop:2 }}>{char.role}</div>
            <div style={{ fontSize:11, color:'var(--ink3)', marginTop:4 }}>{CHAR_BIO[charId]}</div>
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:8, marginTop:14 }}>
            {!isPlayingAsThis ? (
              <button
                onClick={() => openDMThread(charId)}
                style={{
                  flex:1, height:36, background:'var(--surf)',
                  border:'1px solid var(--line)', borderRadius:10,
                  fontFamily:'var(--sans)', fontWeight:600, fontSize:13,
                  color:'var(--ink)', cursor:'pointer'
                }}
              >
                Message
              </button>
            ) : (
              <button
                onClick={() => navigate('profile')}
                style={{
                  flex:1, height:36, background:'var(--accent)',
                  border:'none', borderRadius:10,
                  fontFamily:'var(--sans)', fontWeight:700, fontSize:13,
                  color:'#fff', cursor:'pointer'
                }}
              >
                My Profile →
              </button>
            )}
            <button
              style={{
                width:36, height:36, background:'var(--surf)',
                border:'1px solid var(--line)', borderRadius:10,
                display:'grid', placeItems:'center', cursor:'pointer'
              }}
              onClick={() => {}}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Posts grid */}
        <div style={{ marginTop:16, borderTop:'1px solid var(--line)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }}>
            {posts.map((p, i) => (
              <div key={i} style={{
                aspectRatio:'1/1', background:p.bg, position:'relative',
                display:'grid', placeItems:'center', cursor:'pointer',
                backgroundImage:`url(/avatars/${charId}.png)`,
                backgroundSize:'cover', backgroundPosition:'center',
              }}>
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.35)' }} />
                <div style={{
                  position:'relative', fontSize:9, color:'rgba(255,255,255,.9)',
                  textAlign:'center', padding:'0 6px',
                  fontStyle:'italic', fontFamily:'var(--serif)',
                }}>
                  {p.caption}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height:24 }} />
      </div>
    </div>
  )
}
