'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/lib/context'
import type { World } from '@/lib/types'

// First-run app onboarding — a 6-step cinematic sequence (Android handoff):
// splash → promise → self-playing loop demo → identity → world pick → handoff.
// Steps 4/5 absorb the old OnboardingScreen + WorldsScreen entry; the final CTA
// commits the profile (saveProfile, skipNav) and routes into the world's intro.

type Step = 'splash' | 'live' | 'loop' | 'setup' | 'worlds' | 'done'
const RAIL: Step[] = ['live', 'loop', 'setup', 'worlds']

const WORLDS: {
  id: World; name: string; teaser: string; art: string; handoff: string
  liveColor: string; avatars: string[]; more: string
}[] = [
  { id: 'creator-house', name: 'Creator House', teaser: 'Reality villa · 6 creators · 10 din',
    art: '/avatars/seed-villa.png', handoff: '/avatars/seed-villa.png', liveColor: 'var(--trust)',
    avatars: ['/avatars/ria.png', '/avatars/kabir.png', '/avatars/ananya.png'], more: '+2' },
  { id: 'cricket', name: 'Indian Dressing Room', teaser: '16 saal. MI debut. India tak ka safar.',
    art: '/avatars/cricket-wankhede.png', handoff: '/avatars/cricket-dressing-room.png', liveColor: 'var(--fame)',
    avatars: ['/avatars/rohit.png', '/avatars/bumrah.png', '/avatars/hardik.png'], more: '+9' },
]

// Orbit mark — dashed gradient ring (spins) + inner ring + gold core.
const OrbitMark = ({ size = 96, spin = true }: { size?: number; spin?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" fill="none" style={{ filter: 'drop-shadow(0 0 26px rgba(255,45,120,.55))' }}>
    <defs>
      <linearGradient id="ob-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ff2d78" /><stop offset=".55" stopColor="#ff8a3d" /><stop offset="1" stopColor="#ffd24d" />
      </linearGradient>
    </defs>
    <g style={{ transformOrigin: 'center', animation: spin ? 'loreSpin 16s linear infinite' : undefined }}>
      <circle cx="48" cy="48" r="36" stroke="url(#ob-grad)" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="58 12" />
    </g>
    <circle cx="48" cy="48" r="6.4" stroke="#ff2d78" strokeWidth="2.2" />
    <circle cx="48" cy="48" r="1.9" fill="#ffd24d" />
  </svg>
)

export default function AppOnboardingScreen() {
  const { saveProfile, navigate } = useApp()
  const [step, setStep] = useState<Step>('splash')
  const [phase, setPhase] = useState(0)       // step-3 demo progress (0-3)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [world, setWorld] = useState<World | null>(null)
  const [saving, setSaving] = useState(false)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }, [])
  const buzz = (ms = 10) => { try { navigator.vibrate?.(ms) } catch { /* unsupported */ } }
  const go = useCallback((s: Step) => { buzz(10); setStep(s) }, [])

  // Step 3 — self-playing loop demo timers.
  useEffect(() => {
    if (step !== 'loop') return
    if (reduced.current) { setPhase(3); return }
    setPhase(0)
    const t1 = setTimeout(() => setPhase(1), 350)
    const t2 = setTimeout(() => setPhase(2), 1250)
    const t3 = setTimeout(() => setPhase(3), 2250)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [step])

  const handle = (name.trim() || 'you').toLowerCase().replace(/\s+/g, '')
  const initial = (name.trim()[0] || 'Y').toUpperCase()
  const chosen = WORLDS.find(w => w.id === world)

  const enterWorld = useCallback(async () => {
    if (!world || saving) return
    setSaving(true); buzz(14)
    try {
      if (typeof window !== 'undefined') localStorage.setItem('weev_onboarded', '1')
      await saveProfile(name.trim() || 'Player', gender, undefined, true)
      navigate(world === 'creator-house' ? 'world-intro' : 'cricket-carousel')
    } finally { setSaving(false) }
  }, [world, saving, name, gender, saveProfile, navigate])

  const pickWorld = (id: World) => {
    buzz(12); setWorld(id)
    setTimeout(() => go('done'), 420)
  }

  // ── shared styles ──
  const wrap: React.CSSProperties = { position: 'relative', height: '100%', width: '100%', overflow: 'hidden', background: 'var(--bg)', fontFamily: 'var(--sans)', color: '#fff' }
  const eyebrow = (color = 'var(--accent)'): React.CSSProperties => ({ fontSize: 10, fontWeight: 800, letterSpacing: '.17em', textTransform: 'uppercase', color })
  const cue = (color = 'rgba(255,255,255,.45)'): React.CSSProperties => ({ position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontSize: 9, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color, animation: 'cuePulse 1.9s ease-in-out infinite' })
  const ctaBtn: React.CSSProperties = { width: '100%', padding: '17px 0', borderRadius: 16, border: 'none', background: 'linear-gradient(120deg,#ff2d78,#c01a5a)', color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: 'var(--sans)', cursor: 'pointer', boxShadow: '0 12px 30px rgba(255,45,120,.35)' }
  const railStep = RAIL.indexOf(step) // -1 for splash/done

  return (
    <div style={wrap}>
      {/* Progress rail — steps 2–5 */}
      {railStep >= 0 && (
        <div style={{ position: 'absolute', top: 20, left: 26, right: 26, display: 'flex', gap: 6, zIndex: 5 }}>
          {RAIL.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= railStep ? 'var(--accent)' : 'rgba(255,255,255,.16)', transition: 'background .3s' }} />
          ))}
        </div>
      )}

      {/* ── STEP 1 · SPLASH ── */}
      {step === 'splash' && (
        <div onClick={() => go('live')} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'radial-gradient(ellipse 120% 70% at 50% 34%, #1c0b22 0%, #06060c 66%)' }}>
          <div style={{ marginBottom: 26 }}><OrbitMark size={96} spin={!reduced.current} /></div>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 52, letterSpacing: '.5px' }}>Weev</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 17, color: 'var(--ink2)', marginTop: 4 }}>Live your story.</div>
          <div style={cue('rgba(255,255,255,.4)')}>Tap to begin</div>
        </div>
      )}

      {/* ── STEP 2 · PROMISE ── */}
      {step === 'live' && (
        <div onClick={() => go('loop')} style={{ position: 'absolute', inset: 0, cursor: 'pointer', backgroundImage: 'url(/avatars/scene-terrace-night.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,6,12,.4), rgba(6,6,12,.15) 40%, rgba(6,6,12,.96) 86%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 30px 96px' }}>
            <div style={{ ...eyebrow(), animation: 'tiUp .8s cubic-bezier(.32,.72,0,1) .1s both' }}>Yeh koi show nahi</div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 38, lineHeight: 1.08, letterSpacing: '-.01em', maxWidth: 320, marginTop: 12, animation: 'tiUp .8s cubic-bezier(.32,.72,0,1) .28s both' }}>Tum reality show dekhte nahi. Usme jeete ho.</div>
            <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.6, color: 'rgba(255,255,255,.78)', maxWidth: 300, marginTop: 14, animation: 'tiUp .8s cubic-bezier(.32,.72,0,1) .46s both' }}>Ek jeeti-jaagti duniya mein step karo. Har din ek nayi situation — aur har choice tumhari.</div>
          </div>
          <div style={cue()}>Tap to continue</div>
        </div>
      )}

      {/* ── STEP 3 · LOOP DEMO ── */}
      {step === 'loop' && (
        <div onClick={() => (phase < 3 ? setPhase(3) : go('setup'))} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', cursor: 'pointer', padding: '64px 26px 40px', background: 'radial-gradient(ellipse 130% 60% at 50% 0%, #160a1c 0%, #06060c 62%)' }}>
          <div style={eyebrow()}>Kaise chalta hai</div>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 27, lineHeight: 1.14, maxWidth: 290, marginTop: 8 }}>Har choice duniya ko hilaati hai</div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
            {/* Node 1 — choice */}
            <div style={{ opacity: phase >= 0 ? 1 : 0, transform: phase >= 0 ? 'none' : 'translateY(12px)', transition: 'all .55s cubic-bezier(.32,.72,0,1)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 8 }}>Tum choose karte ho</div>
              <div style={{ background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 16, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ padding: '11px 13px', borderRadius: 11, border: '1px solid var(--line)', background: 'rgba(255,255,255,.03)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink2)' }}>Chup chaap andar aao</div>
                <div style={{ padding: '11px 13px', borderRadius: 11, border: '1px solid var(--accent)', background: 'rgba(255,45,120,.12)', boxShadow: '0 0 0 3px rgba(255,45,120,.1)', fontSize: 13.5, fontWeight: 700, color: '#fff' }}>Loud entry maaro</div>
              </div>
            </div>

            {/* Node 2 — post */}
            <div style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'none' : 'translateY(12px)', transition: 'all .55s cubic-bezier(.32,.72,0,1)' }}>
              <div style={{ textAlign: 'center', color: 'var(--ink3)', opacity: .6, fontSize: 18, margin: '2px 0' }}>↓</div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 8 }}>Woh ek post ban jaati hai</div>
              <div style={{ background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 16, padding: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(140deg,#ff3aa0,#d11668)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>M</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>@manavi</span>
                    <span style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '.06em', color: 'var(--accent)', border: '1px solid rgba(255,45,120,.4)', borderRadius: 4, padding: '1px 4px' }}>YOU</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.9)', marginTop: 9, lineHeight: 1.45 }}>&ldquo;Koi quietly nahi aata.&rdquo; Day 1. 🔥</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 9, fontSize: 12, color: 'var(--ink2)', fontWeight: 600 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--accent)"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  3.4K
                </div>
              </div>
            </div>

            {/* Node 3 — meters + memory line */}
            <div style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'none' : 'translateY(12px)', transition: 'all .55s cubic-bezier(.32,.72,0,1)', marginTop: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 10 }}>Meters hilte hain · ghar yaad rakhta hai</div>
              {([['⭐ Fame', 'var(--fame)', 64, '+3'], ['🤝 Trust', 'var(--trust)', 44, '+1']] as const).map(([lbl, col, pct, chip]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                  <span style={{ width: 66, fontSize: 11.5, fontWeight: 700, color: col }}>{lbl}</span>
                  <div style={{ flex: 1, height: 7, borderRadius: 5, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                    <div style={{ width: phase >= 3 ? `${pct}%` : 0, height: '100%', borderRadius: 5, background: col, transition: 'width .8s cubic-bezier(.32,.72,0,1)' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: col, opacity: phase >= 3 ? 1 : 0, transition: 'opacity .3s .3s' }}>{chip}</span>
                </div>
              ))}
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 15, color: 'rgba(255,255,255,.8)', marginTop: 12, opacity: phase >= 3 ? 1 : 0, transition: 'opacity .4s .2s' }}>Kuch bhi mita nahi. Duniya sab yaad rakhti hai.</div>
            </div>
          </div>

          {phase >= 3 && <div style={{ ...cue('var(--ink3)'), position: 'static', marginTop: 4 }}>Tap to continue</div>}
        </div>
      )}

      {/* ── STEP 4 · IDENTITY ── */}
      {step === 'setup' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 30px', background: 'radial-gradient(ellipse 130% 62% at 50% 0%, #1a0b20 0%, #06060c 62%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={eyebrow()}>Tumhari identity</span>
            <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,45,120,.5), transparent)' }} />
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 30, lineHeight: 1.1, marginTop: 12 }}>Kahani mein tum kaun ho?</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 26 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#ff2d78,#ff8a3d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 22 }}>{initial}</div>
            <input value={name} onChange={e => setName(e.target.value.slice(0, 16))} placeholder="Tumhara naam" maxLength={16}
              style={{ flex: 1, height: 52, background: 'rgba(255,255,255,.06)', border: '1px solid var(--accent)', borderRadius: 12, padding: '0 16px', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 16, color: '#fff', outline: 'none' }} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', marginTop: 10 }}>Characters tumhe isi naam se bulaayenge — @{handle}</div>

          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)', marginTop: 24, marginBottom: 8 }}>Tum ho</div>
          <div style={{ display: 'flex', gap: 9 }}>
            {(['male', 'female'] as const).map(g => (
              <button key={g} onClick={() => { buzz(8); setGender(g) }} style={{ flex: 1, height: 50, borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 14, textTransform: 'capitalize',
                border: `1px solid ${gender === g ? 'var(--accent)' : 'var(--line)'}`, background: gender === g ? 'rgba(255,45,120,.12)' : 'rgba(255,255,255,.03)',
                color: gender === g ? '#fff' : 'var(--ink2)', fontWeight: gender === g ? 700 : 600 }}>{g}</button>
            ))}
          </div>

          <button onClick={() => { if (name.trim()) go('worlds') }} disabled={!name.trim()} style={{ ...ctaBtn, marginTop: 30, opacity: name.trim() ? 1 : 0.45, cursor: name.trim() ? 'pointer' : 'default' }}>Choose your world →</button>
        </div>
      )}

      {/* ── STEP 5 · PICK YOUR WORLD ── */}
      {step === 'worlds' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '58px 20px 26px' }}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 25 }}>Kaun si duniya?</div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink2)', marginTop: 4 }}>Dono live hain. Ek chuno — kabhi bhi doosri mein aa sakte ho.</div>
          <div className="scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16, overflowY: 'auto' }}>
            {WORLDS.map(w => {
              const sel = world === w.id
              return (
                <button key={w.id} onClick={() => pickWorld(w.id)} style={{ position: 'relative', height: 214, borderRadius: 22, overflow: 'hidden', border: `1.5px solid ${sel ? 'var(--accent)' : 'var(--line)'}`, padding: 0, cursor: 'pointer', textAlign: 'left', flexShrink: 0, boxShadow: sel ? '0 0 0 1px var(--accent), 0 14px 34px rgba(255,45,120,.22)' : 'none' }}>
                  <img src={w.art} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'var(--grain)', opacity: .3, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,15,.34) 0%, transparent 32%, rgba(8,8,15,.92) 100%)' }} />
                  {/* LIVE badge */}
                  <span style={{ position: 'absolute', top: 14, left: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 800, letterSpacing: '.06em', color: w.liveColor, background: 'rgba(8,8,15,.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', padding: '5px 10px', borderRadius: 20 }}>
                    <span style={{ position: 'relative', width: 6, height: 6 }}>
                      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: w.liveColor }} />
                      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: w.liveColor, animation: 'pulse 1.8s ease-out infinite' }} />
                    </span>
                    LIVE · SEASON 1
                  </span>
                  {/* checkmark */}
                  {sel && <span style={{ position: 'absolute', top: 12, right: 12, width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </span>}
                  {/* bottom block */}
                  <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                      {w.avatars.map((a, i) => (
                        <div key={a} style={{ width: 29, height: 29, borderRadius: '50%', border: '2px solid var(--bg)', marginLeft: i === 0 ? 0 : -9, backgroundImage: `url(${a})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      ))}
                      <span style={{ marginLeft: 6, fontSize: 10.5, fontWeight: 800, color: 'rgba(255,255,255,.7)' }}>{w.more} more</span>
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 23 }}>{w.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.76)', marginTop: 2 }}>{w.teaser}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── STEP 6 · HANDOFF ── */}
      {step === 'done' && chosen && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${chosen.handoff})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,6,12,.5), rgba(6,6,12,.3) 36%, rgba(6,6,12,.96) 84%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 32px 52px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(255,45,120,.5)', marginBottom: 20 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <div style={{ ...eyebrow(), fontSize: 9.5, letterSpacing: '.16em' }}>You&apos;re in, {name.trim() || 'you'}</div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 32, lineHeight: 1.1, marginTop: 8 }}>{chosen.name}</div>
            <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.6, color: 'rgba(255,255,255,.82)', marginTop: 12, maxWidth: 320 }}>Ab kahani tumhari hai. {chosen.name} ki pehli situation live hai — chalo andar.</div>
            <button onClick={enterWorld} disabled={saving} style={{ ...ctaBtn, marginTop: 24 }}>{saving ? 'Loading…' : `Enter ${chosen.name} →`}</button>
          </div>
        </div>
      )}
    </div>
  )
}
