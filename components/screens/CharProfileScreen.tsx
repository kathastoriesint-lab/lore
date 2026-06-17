'use client'
import { useEffect, useMemo } from 'react'
import { useApp } from '@/lib/context'
import { getCricketChars, getCHChars, getCHDossiers } from '@/lib/content'
import { relationshipFor, computeBond, bondColor, bondWord } from '@/lib/relationships'
import { TRUTH_BOND, SECRET_BOND } from '@/lib/ch-rules'
import type { CharId } from '@/lib/types'

const TIE_COLOR: Record<string, string> = {
  heat: 'var(--heat)', trust: 'var(--trust)', fame: 'var(--fame)', ink3: 'var(--ink3)',
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
  const { goBack, viewingCharId, dmTrust, game, openDMThread, screen, setViewingChar } = useApp()
  const allChars = { ...getCHChars(), ...getCricketChars() }
  const charId = viewingCharId
  const char = charId ? (allChars[charId] ?? null) : null

  useEffect(() => {
    if (screen === 'char-profile' && (!charId || !char)) goBack()
  }, [screen, charId, char, goBack])

  const rel = charId ? relationshipFor(charId, game.playerGender) : null
  const { bond, moments, latestPost } = useMemo(() => {
    if (!charId) return { bond: 50, moments: [], latestPost: undefined }
    return computeBond(charId, game.world, game.choices, game.playerName, game.playerGender, dmTrust)
  }, [charId, game.world, game.choices, game.playerName, game.playerGender, dmTrust])

  if (!char || !charId || !rel) {
    return <div style={{ height: '100%', background: 'var(--bg)' }} />
  }

  const isPlayingAsThis = game.char === charId
  const bc = bondColor(bond)
  const word = bondWord(bond, rel)
  const isCricket = game.world === 'cricket'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)' }}>
      <StatusBar />

      {/* Header */}
      <div className="appbar" style={{ justifyContent:'space-between', padding:'6px 16px 12px' }}>
        <button className="icon-btn" onClick={goBack}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div style={{ fontWeight:700, fontSize:15 }}>{char.name}</div>
        <div style={{ width:38 }} />
      </div>

      <div className="scroll">
        {/* Identity */}
        <div style={{ padding:'16px 18px 0', display:'flex', alignItems:'center', gap:16 }}>
          {/* Avatar with bond ring */}
          <div style={{ width:88, height:88, borderRadius:'50%', flexShrink:0, padding:3,
            background:`conic-gradient(${bc} ${Math.max(6, bond)*3.6}deg, rgba(255,255,255,.09) 0deg)` }}>
            <div className={`av ${char.cls}`} style={{ width:'100%', height:'100%', fontSize:30,
              backgroundImage:`url(/avatars/${charId}.png)`, backgroundSize:'cover', backgroundPosition:'center',
              border:'3px solid var(--bg)' }}>
              <span style={{ opacity:0 }}>{char.init}</span>
            </div>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:22, fontFamily:'var(--serif)' }}>{char.name}</div>
            <div style={{ fontSize:13, color:'var(--ink3)', marginTop:1 }}>@{char.handle}</div>
            <div style={{ marginTop:8, display:'inline-block', fontSize:10, fontWeight:800, letterSpacing:'.05em',
              color:rel.labelColor, background:`color-mix(in srgb, ${rel.labelColor} 16%, transparent)`,
              border:`1px solid color-mix(in srgb, ${rel.labelColor} 35%, transparent)`, padding:'4px 10px', borderRadius:8 }}>
              {rel.label}
            </div>
          </div>
        </div>

        {/* Bond strength */}
        <div style={{ margin:'18px 16px 0', background:'var(--surf)', border:'1px solid var(--line)', borderRadius:16, padding:'16px' }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.08em', color:'var(--ink3)' }}>BOND STRENGTH</div>
            <div>
              <span style={{ fontFamily:'var(--serif)', fontWeight:600, fontSize:30, color:bc }}>{bond}</span>
              <span style={{ fontSize:13, color:'var(--ink3)' }}>/100</span>
            </div>
          </div>
          <div style={{ height:8, borderRadius:5, background:'rgba(255,255,255,.07)', marginTop:12, overflow:'hidden' }}>
            <div style={{ width:`${bond}%`, height:'100%', borderRadius:5,
              background:`linear-gradient(90deg, color-mix(in srgb, ${bc} 60%, #000), ${bc})` }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:11, color:'var(--ink3)' }}>
            <span>← {rel.spectrumLeft}</span>
            <span style={{ fontWeight:800, color:bc }}>{word}</span>
            <span>{rel.spectrumRight} →</span>
          </div>
        </div>

        {/* About */}
        <div style={{ padding:'20px 18px 0' }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.08em', color:'var(--ink3)', marginBottom:8 }}>ABOUT</div>
          <div style={{ fontSize:15, color:'var(--ink2)', lineHeight:1.55 }}>{rel.about}</div>
        </div>

        {/* Dossier — the bible's history layer. Persona/wants always shown;
            the mask and the receipts unlock as your bond grows. */}
        {(() => {
          const d = getCHDossiers()[charId]
          if (!d) return null
          const truthOpen = bond >= TRUTH_BOND
          const secretOpen = bond >= SECRET_BOND
          const Locked = ({ at, label }: { at: number; label: string }) => (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 14px', borderRadius:12,
              background:'var(--surf)', border:'1px dashed var(--line)' }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--ink3)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <div style={{ fontSize:12, color:'var(--ink3)', lineHeight:1.4 }}>
                {label} — <span style={{ color:'var(--ink2)' }}>bond {at} pe khulega</span>
              </div>
            </div>
          )
          return (
            <div style={{ padding:'22px 18px 0' }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.08em', color:'var(--ink3)', marginBottom:4 }}>POORI KUNDLI</div>
              <div style={{ fontSize:13, color:'var(--ink2)', fontStyle:'italic', lineHeight:1.5, marginBottom:14 }}>{d.tagline}</div>

              {/* Persona — always */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.06em', color:'var(--ink3)', marginBottom:5 }}>GHAR JO DEKHTA HAI</div>
                <div style={{ fontSize:13.5, color:'var(--ink2)', lineHeight:1.5 }}>{d.persona}</div>
              </div>

              {/* Wants — always */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.06em', color:'var(--ink3)', marginBottom:5 }}>CHAHTE KYA HAIN</div>
                <div style={{ fontSize:13.5, color:'var(--ink2)', lineHeight:1.5 }}>{d.wants}</div>
              </div>

              {/* Behind the mask — truth + fears, unlocks at TRUTH_BOND */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.06em', color:'var(--ink3)', marginBottom:5 }}>MASK KE PEECHE</div>
                {truthOpen ? (
                  <>
                    <div style={{ fontSize:13.5, color:'var(--ink2)', lineHeight:1.5 }}>{d.truth}</div>
                    <div style={{ fontSize:12.5, color:'var(--ink3)', lineHeight:1.5, marginTop:6 }}>
                      <span style={{ fontWeight:700, color:'var(--ink2)' }}>Darr:</span> {d.fears}
                    </div>
                  </>
                ) : <Locked at={TRUTH_BOND} label="Abhi mask ke peeche nahi dekha" />}
              </div>

              {/* The receipts — the secret, unlocks at SECRET_BOND */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.06em', color:'var(--ink3)', marginBottom:5 }}>ASLI POL</div>
                {secretOpen ? (
                  <div style={{ fontSize:13.5, color:'var(--ink)', lineHeight:1.5, padding:'12px 14px', borderRadius:12,
                    background:'color-mix(in srgb, var(--heat) 8%, transparent)', border:'1px solid color-mix(in srgb, var(--heat) 22%, transparent)' }}>
                    {d.secret}
                  </div>
                ) : <Locked at={SECRET_BOND} label="Kuch bada chhupa rahe hain" />}
              </div>

              {/* The feud map — always; tap a name to open them */}
              {d.ties.length > 0 && (
                <div>
                  <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.06em', color:'var(--ink3)', marginBottom:8 }}>GHAR MEIN RISHTE</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {d.ties.map(t => {
                      const tc = allChars[t.charId]
                      if (!tc) return null
                      const col = TIE_COLOR[t.color]
                      return (
                        <button key={t.charId} onClick={() => setViewingChar(t.charId)}
                          style={{ display:'flex', alignItems:'center', gap:11, textAlign:'left', width:'100%',
                            background:'var(--surf)', border:'1px solid var(--line)', borderRadius:14, padding:'11px 13px', cursor:'pointer' }}>
                          <div className={`av ${tc.cls}`} style={{ width:36, height:36, fontSize:14, flexShrink:0,
                            backgroundImage:`url(/avatars/${t.charId}.png)`, backgroundSize:'cover', backgroundPosition:'center' }}>
                            <span style={{ opacity:0 }}>{tc.init}</span>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                              <span style={{ fontWeight:700, fontSize:14 }}>{tc.name}</span>
                              <span style={{ fontSize:8.5, fontWeight:800, letterSpacing:'.05em', color:col,
                                background:`color-mix(in srgb, ${col} 16%, transparent)`,
                                border:`1px solid color-mix(in srgb, ${col} 35%, transparent)`, padding:'2px 6px', borderRadius:6 }}>{t.label}</span>
                            </div>
                            <div style={{ fontSize:11.5, color:'var(--ink3)', marginTop:3, lineHeight:1.4 }}>{t.note}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* Your story — moments with this character */}
        <div style={{ padding:'22px 18px 0' }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.08em', color:'var(--ink3)', marginBottom:12 }}>YOUR STORY</div>
          {moments.length === 0 ? (
            <div style={{ fontSize:13, color:'var(--ink3)', lineHeight:1.5 }}>
              You haven&apos;t crossed paths yet. Play through the {isCricket ? 'season' : 'house'} and {char.name.split(' ')[0]} will start reacting to your moves.
            </div>
          ) : (
            <div style={{ position:'relative', paddingLeft:18 }}>
              {/* timeline line */}
              <div style={{ position:'absolute', left:5, top:6, bottom:6, width:1.5, background:'var(--line)' }} />
              {moments.map((m, i) => (
                <div key={i} style={{ position:'relative', marginBottom:18 }}>
                  <div style={{ position:'absolute', left:-18, top:3, width:11, height:11, borderRadius:'50%',
                    border:`2px solid ${m.delta >= 0 ? bc : '#FF5C3A'}`, background:'var(--bg)' }} />
                  <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.06em', color:'var(--ink3)' }}>
                    {m.tag.replace('⚡', '').trim()}
                  </div>
                  <div style={{ fontFamily:'var(--serif)', fontWeight:600, fontSize:17, marginTop:3 }}>{m.title}</div>
                  <div style={{ fontSize:13, color:'var(--ink2)', lineHeight:1.5, marginTop:5, fontStyle:'italic' }}>
                    &ldquo;{m.text}&rdquo;
                  </div>
                  <div style={{ marginTop:8, display:'inline-block', fontSize:11, fontWeight:800,
                    color: m.delta >= 0 ? bc : '#FF5C3A',
                    background: m.delta >= 0 ? `color-mix(in srgb, ${bc} 14%, transparent)` : 'rgba(255,92,58,.14)',
                    padding:'3px 9px', borderRadius:7 }}>
                    Bond {m.delta >= 0 ? '+' : ''}{m.delta}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest post */}
        {latestPost && (
          <div style={{ padding:'14px 16px 0' }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.08em', color:'var(--ink3)', marginBottom:10 }}>LATEST</div>
            <div style={{ background:'var(--surf)', border:'1px solid var(--line)', borderRadius:14, padding:'12px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div className={`av ${char.cls}`} style={{ width:30, height:30, fontSize:12,
                  backgroundImage:`url(/avatars/${charId}.png)`, backgroundSize:'cover', backgroundPosition:'center' }}>
                  <span style={{ opacity:0 }}>{char.init}</span>
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13 }}>{char.name}</div>
                  <div style={{ fontSize:10, color:'var(--ink3)' }}>{isCricket ? 'MI Season 1' : 'Creator House'} · just now</div>
                </div>
              </div>
              <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15, color:'rgba(255,255,255,.9)', marginTop:10, lineHeight:1.45 }}>
                &ldquo;{latestPost}&rdquo;
              </div>
            </div>
          </div>
        )}

        <div style={{ height:120 }} />
      </div>

      {/* Sticky message button */}
      {isCricket && !isPlayingAsThis && (
        <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'12px 16px 18px',
          background:'linear-gradient(to top, var(--bg) 60%, transparent)' }}>
          <button
            onClick={() => openDMThread(charId)}
            style={{ width:'100%', height:52, background:'var(--accent)', color:'#fff', border:'none', borderRadius:14,
              fontFamily:'var(--sans)', fontWeight:700, fontSize:15, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Message {char.name.split(' ')[0]}
          </button>
        </div>
      )}
    </div>
  )
}
