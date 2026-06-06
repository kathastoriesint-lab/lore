'use client'
import { useMemo, useState } from 'react'
import { useApp } from '@/lib/context'
import { CHARS, getVisibleSituations } from '@/lib/data'
import { CRICKET_CHARS, CRICKET_SITUATIONS } from '@/lib/cricket-data'
import { fameToFollowers as fameToFollowersNum, applyDeltas, resolveTokens, resolveEnding } from '@/lib/game'
import { resolveCricketEnding, CRICKET_ENDING_DATA } from '@/lib/cricket-data'
import { houseCast, relationshipFor, computeBond, bondColor } from '@/lib/relationships'
import PlayerAvatar from '@/components/PlayerAvatar'
import type { CharId } from '@/lib/types'
import MeterHUD from '@/components/MeterHUD'

function fameToFollowersStr(fame: number): string {
  const raw = fameToFollowersNum(fame)
  if (raw >= 1_000_000) return `${(raw / 1_000_000).toFixed(1)}M`
  if (raw >= 1_000)     return `${(raw / 1_000).toFixed(0)}K`
  return `${raw}`
}
function fameToFollowing(fame: number): string {
  return `${Math.round(200 + fame * 3)}`
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

// Avatar with a bond-colored progress ring around it
function RingAvatar({ id, cls, bond, size = 56 }: { id: string; cls: string; bond: number; size?: number }) {
  const ring = bondColor(bond)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      padding: 2.5,
      background: `conic-gradient(${ring} ${Math.max(6, bond) * 3.6}deg, rgba(255,255,255,.09) 0deg)`,
    }}>
      <div className={`av ${cls}`} style={{
        width: '100%', height: '100%', fontSize: size * 0.32,
        backgroundImage: `url(/avatars/${id}.png)`, backgroundSize: 'cover', backgroundPosition: 'center',
        border: '2.5px solid var(--bg)',
      }}>
        <span style={{ opacity: 0 }}>{id[0].toUpperCase()}</span>
      </div>
    </div>
  )
}

// ── Worlds-level profile (shown when user hasn't entered any world yet) ──────
function WorldsProfileView() {
  const { game, navigate, resetGame } = useApp()
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(game.playerName)

  const worldsPlayed = game.situation > 0
    ? [{ name: game.world === 'cricket' ? 'Indian Dressing Room' : 'Creator House', situations: game.situation }]
    : []

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)' }}>
      <StatusBar />
      <div className="appbar" style={{ justifyContent:'space-between', padding:'6px 16px 12px' }}>
        <div style={{ fontWeight:700, fontSize:16 }}>Profile</div>
      </div>

      <div className="scroll" style={{ padding:'24px 20px', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Avatar + name */}
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <PlayerAvatar size={64} fontSize={26} />
          <div>
            <div style={{ fontWeight:700, fontSize:20 }}>{game.playerName || '—'}</div>
            <div style={{ fontSize:13, color:'var(--ink3)', marginTop:2 }}>
              {game.playerGender === 'male' ? 'He / Him' : 'She / Her'}
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {/* Name */}
          <div style={{ background:'var(--surf)', borderRadius:14, padding:'14px 16px', border:'1px solid var(--line)' }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.08em', color:'var(--ink3)', marginBottom:6 }}>NAAM</div>
            {editing ? (
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value.slice(0,24))}
                  style={{ flex:1, background:'transparent', border:'none', borderBottom:'1.5px solid var(--accent)', color:'var(--ink)', fontSize:16, fontFamily:'var(--sans)', outline:'none', paddingBottom:4 }}
                  autoFocus
                />
                <button
                  onClick={() => { setEditing(false) }}
                  style={{ fontSize:13, color:'var(--ink3)', fontWeight:500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { /* save handled via resetGame context — for now just close */ setEditing(false) }}
                  style={{ fontSize:13, color:'var(--accent)', fontWeight:700 }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:16, fontWeight:600 }}>{game.playerName || '—'}</div>
                <button onClick={() => setEditing(true)} style={{ fontSize:12, color:'var(--accent)', fontWeight:600 }}>Edit</button>
              </div>
            )}
          </div>

          {/* Gender */}
          <div style={{ background:'var(--surf)', borderRadius:14, padding:'14px 16px', border:'1px solid var(--line)' }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.08em', color:'var(--ink3)', marginBottom:6 }}>ROLE</div>
            <div style={{ fontSize:16, fontWeight:600 }}>
              {game.playerGender === 'male' ? 'He / Him' : 'She / Her'}
            </div>
          </div>

          {/* Worlds played */}
          <div style={{ background:'var(--surf)', borderRadius:14, padding:'14px 16px', border:'1px solid var(--line)' }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.08em', color:'var(--ink3)', marginBottom:10 }}>WORLDS PLAYED</div>
            {worldsPlayed.length === 0 ? (
              <div style={{ fontSize:14, color:'var(--ink3)', fontStyle:'italic' }}>Abhi koi world nahi khela.</div>
            ) : worldsPlayed.map(w => (
              <div key={w.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:15, fontWeight:600 }}>{w.name}</div>
                <div style={{ fontSize:12, color:'var(--ink3)' }}>S{w.situations} completed</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset option */}
        <button
          onClick={() => resetGame()}
          style={{ marginTop:8, fontSize:13, color:'var(--ink3)', fontWeight:500, textAlign:'left', padding:'4px 0' }}
        >
          Naya shuru karein (reset) →
        </button>

      </div>

      {/* Tab bar */}
      <div className="tabbar">
        <button className="tab" onClick={() => navigate('worlds')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3c-2.5 3-4 5.7-4 9s1.5 6 4 9"/><path d="M12 3c2.5 3 4 5.7 4 9s-1.5 6-4 9"/><path d="M3 12h18"/></svg>
          <span>Worlds</span>
        </button>
        <button className="tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <span>Profile</span>
        </button>
      </div>
    </div>
  )
}

export default function ProfileScreen() {
  const { game, navigate, goBack, dmTrust, setViewingChar } = useApp()

  // When the user hasn't entered any world yet, or is in cricket (player sentinel), show simple profile
  if (!game.char || game.char === 'player') {
    if (game.world !== 'cricket') return <WorldsProfileView />
  }

  const isCricket = game.world === 'cricket'
  const allChars = { ...CHARS, ...CRICKET_CHARS }
  const charId = (game.char ?? (isCricket ? 'hardik' : 'kabir')) as CharId
  const char = allChars[charId] ?? allChars['kabir']!

  const [tab, setTab] = useState<'posts' | 'house'>('house')

  // In cricket, public Fame ⭐ lives in the heat slot; Creator House uses fame slot
  const fameMeter = isCricket ? game.meters.heat : game.meters.fame
  const followers = fameToFollowersStr(fameMeter)
  const following = fameToFollowing(fameMeter)
  const worldLabel = isCricket ? 'Mumbai Indians' : 'Creator House'

  // Player's own posts from choices
  const posts = useMemo(() => {
    if (game.choices.length === 0) return []
    const start = isCricket ? { fame: 45, heat: 55, image: 35 } : { fame: 20, heat: 50, image: 30 }
    let meters = { ...start }
    const result: { caption: string }[] = []
    for (let i = 0; i < game.choices.length; i++) {
      const letter = game.choices[i]
      // Use situationQueue for world-aware, index-shift-safe lookup
      const sitId = game.situationQueue[i]
      const sit = sitId
        ? (isCricket
            ? CRICKET_SITUATIONS.find(s => s.id === sitId)
            : getVisibleSituations(meters, game.choices.slice(0, i) as ('A'|'B')[]).find(s => s.id === sitId))
        : undefined
      if (!sit) continue
      const ch = sit.choices[letter === 'A' ? 0 : 1]
      if (ch?.caption) result.push({ caption: resolveTokens(ch.caption, game.playerName, game.playerGender) })
      if (ch) meters = applyDeltas(meters, ch.deltas)
    }
    return result.reverse()
  }, [game.choices, game.playerName, game.playerGender, isCricket])

  // THE HOUSE — all characters with bond + relationship, sorted by bond desc
  const cast = useMemo(() => {
    return houseCast(game.world).map(id => {
      const c = allChars[id]
      const rel = relationshipFor(id, game.playerGender)
      const { bond, moments } = computeBond(id, game.world, game.choices, game.playerName, game.playerGender, dmTrust)
      return { id, c, rel, bond, momentCount: moments.length }
    }).filter(x => x.c && x.rel).sort((a, b) => b.bond - a.bond)
  }, [game.world, game.choices, game.playerName, game.playerGender, dmTrust]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)' }}>
      <StatusBar />

      {/* Header */}
      <div className="appbar" style={{ justifyContent:'space-between', padding:'6px 16px 12px' }}>
        <button className="icon-btn" onClick={goBack}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div style={{ fontWeight:700, fontSize:15 }}>{game.playerName || 'You'}</div>
        <div style={{ width:38 }} />
      </div>

      <div className="scroll">
        {/* Profile info */}
        <div style={{ padding:'12px 18px 0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <PlayerAvatar size={64} fontSize={26} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:17 }}>{game.playerName || 'You'}</div>
              <div style={{ fontSize:12, color:'var(--ink3)', marginTop:1 }}>{followers} followers · {worldLabel}</div>
              <div style={{ fontSize:11, color:'var(--ink3)', marginTop:2 }}>
                {isCricket ? `Season 1 · Situation ${game.situation + 1}` : `Day ${Math.ceil((game.situation + 1) / 3)} of 10`}
              </div>
            </div>
          </div>
        </div>

        {/* Shared HUD */}
        <div style={{ marginTop:12 }}><MeterHUD /></div>

        {/* T5: Your Ending trajectory */}
        {game.choices.length >= 3 && (() => {
          const FINALE_DATA = {
            heart: { arc: 'Heat King/Queen', color: '#FF5C3A', emoji: '🔥' },
            main:  { arc: 'Main Character',  color: '#FFB020', emoji: '⭐' },
            brand: { arc: 'Brand Icon',       color: '#3DD6C8', emoji: '🤝' },
            dark:  { arc: 'Dark Horse',       color: '#8a4ab0', emoji: '🌑' },
            realDeal:        { arc: 'The Real Deal',        color: '#3DD6C8', emoji: '🏏' },
            captainsProject: { arc: "Captain's Project",    color: '#FFB020', emoji: '💙' },
            paltanWonderkid: { arc: 'Paltan Wonderkid',     color: '#FF2D78', emoji: '🔥' },
            tooMuchTooSoon:  { arc: 'Too Much Too Soon',    color: '#FF5C3A', emoji: '⚠️' },
            quietClimber:    { arc: 'Quiet Climber',        color: '#8a4ab0', emoji: '📈' },
          } as Record<string, { arc: string; color: string; emoji: string }>
          const key = isCricket ? resolveCricketEnding(game.meters) : resolveEnding(game.meters)
          const ending = FINALE_DATA[key]
          if (!ending) return null
          return (
            <div style={{ margin:'8px 16px 0', background:'var(--surf)', border:`1px solid color-mix(in srgb, ${ending.color} 30%, transparent)`, borderRadius:14, padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ fontSize:22, flexShrink:0 }}>{ending.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:9, fontWeight:800, letterSpacing:'.08em', color:'var(--ink3)' }}>AT THIS RATE</div>
                <div style={{ fontFamily:'var(--serif)', fontWeight:600, fontSize:17, color:ending.color, marginTop:2 }}>{ending.arc}</div>
              </div>
              <div style={{ fontSize:11, color:'var(--ink3)' }}>ending →</div>
            </div>
          )
        })()}

        {/* Tab switcher */}
        <div style={{ display:'flex', borderBottom:'1px solid var(--line)', marginTop:6 }}>
          <button
            onClick={() => setTab('house')}
            style={{ flex:1, padding:'13px 0', background:'none', border:'none', cursor:'pointer',
              fontFamily:'var(--sans)', fontWeight:800, fontSize:12, letterSpacing:'.08em',
              color: tab==='house' ? 'var(--ink)' : 'var(--ink3)',
              borderBottom: tab==='house' ? '2px solid var(--accent)' : '2px solid transparent' }}>
            {isCricket ? 'THE ROOM' : 'THE HOUSE'}
          </button>
          <button
            onClick={() => setTab('posts')}
            style={{ flex:1, padding:'13px 0', background:'none', border:'none', cursor:'pointer',
              fontFamily:'var(--sans)', fontWeight:800, fontSize:12, letterSpacing:'.08em',
              color: tab==='posts' ? 'var(--ink)' : 'var(--ink3)',
              borderBottom: tab==='posts' ? '2px solid var(--accent)' : '2px solid transparent' }}>
            POSTS
          </button>
        </div>

        {/* THE HOUSE / THE ROOM */}
        {tab === 'house' && (
          <div style={{ padding:'14px 16px 0', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ fontSize:11, color:'var(--ink3)' }}>
              {cast.length} {isCricket ? 'teammates' : 'creators'} · how they see you so far
            </div>
            {cast.map(({ id, c, rel, bond, momentCount }) => (
              <button
                key={id}
                onClick={() => setViewingChar(id as CharId)}
                style={{ display:'flex', alignItems:'center', gap:13, background:'var(--surf)', border:'1px solid var(--line)',
                  borderRadius:16, padding:'12px 14px', cursor:'pointer', textAlign:'left', width:'100%' }}>
                <RingAvatar id={id} cls={c!.cls} bond={bond} size={56} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700, fontSize:16 }}>{c!.name}</span>
                    <span style={{ fontSize:9, fontWeight:800, letterSpacing:'.05em', color:rel!.labelColor,
                      background:`color-mix(in srgb, ${rel!.labelColor} 16%, transparent)`,
                      border:`1px solid color-mix(in srgb, ${rel!.labelColor} 35%, transparent)`,
                      padding:'2px 7px', borderRadius:6 }}>{rel!.label}</span>
                  </div>
                  <div style={{ fontSize:12, color:'var(--ink3)', marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{rel!.tagline}</div>
                  <div style={{ fontSize:11, color:'var(--ink3)', marginTop:4, display:'flex', alignItems:'center', gap:5 }}>
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                    {momentCount} {momentCount === 1 ? 'moment' : 'moments'} shared
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontFamily:'var(--serif)', fontWeight:600, fontSize:26, color:bondColor(bond), lineHeight:1 }}>{bond}</div>
                  <div style={{ width:46, height:4, borderRadius:2, background:'rgba(255,255,255,.08)', marginTop:6, overflow:'hidden' }}>
                    <div style={{ width:`${bond}%`, height:'100%', background:bondColor(bond), borderRadius:2 }} />
                  </div>
                </div>
              </button>
            ))}
            <div style={{ height:24 }} />
          </div>
        )}

        {/* POSTS grid */}
        {tab === 'posts' && (
          posts.length === 0 ? (
            <div style={{ padding:'40px 20px', textAlign:'center', color:'var(--ink3)', fontSize:13 }}>
              <div style={{ fontSize:24, marginBottom:8 }}>📸</div>
              No posts yet — make your first move in Live
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2, marginTop:2 }}>
              {posts.map((p, i) => (
                <div key={i} className={`av ${char.cls}`} style={{ aspectRatio:'1/1', borderRadius:0,
                  background:`linear-gradient(160deg, var(--cc) 0%, #131323 100%)`, position:'relative',
                  display:'grid', placeItems:'center', cursor:'pointer', width:'100%', height:'auto' }}>
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.2)' }} />
                  <div style={{ position:'relative', fontSize:9, color:'rgba(255,255,255,.9)', textAlign:'left',
                    padding:'0 8px', fontStyle:'italic', fontFamily:'var(--serif)', lineHeight:1.3 }}>{p.caption}</div>
                </div>
              ))}
            </div>
          )
        )}

        <div style={{ height:24 }} />
      </div>

      {/* Tab bar */}
      <div className="tabbar">
        <button className="tab" onClick={() => navigate('feed')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>
          <span>Feed</span>
        </button>
        {isCricket && (
          <button className="tab" onClick={() => navigate('dm-inbox')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>DMs</span>
          </button>
        )}
        <button className="tab" onClick={() => navigate('live')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4.5 13.5H11L9 22l9-12h-6.5L13 2z"/></svg>
          <span>Live</span>
        </button>
        <button className="tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <span>Profile</span>
        </button>
      </div>
    </div>
  )
}
