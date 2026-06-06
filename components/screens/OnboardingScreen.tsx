'use client'
import { useState, useCallback, useRef } from 'react'
import { useApp } from '@/lib/context'

async function generateAvatarAsync(rawBase64: string, mimeType: string, userId: string) {
  try {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/lore-avatar`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ image_base64: rawBase64, user_id: userId, mime_type: mimeType }),
      }
    )
    const data = await resp.json()
    return data.url as string | undefined
  } catch { return undefined }
}

// ── Card 1 — choices ─────────────────────────────────────────────────────────
function Card1() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'0 28px', flex:1, justifyContent:'center' }}>
      <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.12em', color:'var(--accent)', marginBottom:12, textAlign:'center' }}>TUMHARA CHOICE</div>
      <div style={{ fontFamily:'var(--serif)', fontWeight:600, fontSize:34, lineHeight:1.1, textAlign:'center', marginBottom:14 }}>
        Har choice se story badlti hai.
      </div>
      <div style={{ fontSize:15, color:'var(--ink2)', textAlign:'center', lineHeight:1.6, marginBottom:32 }}>
        Dono options defensible hain. Koi right answer nahi — sirf tumhara answer.
      </div>
      {/* Demo choice buttons */}
      <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ padding:'14px 16px', borderRadius:16, background:'rgba(255,45,120,.15)', border:'1.5px solid var(--accent)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent)', flexShrink:0 }} />
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'var(--accent)' }}>Phone side pe rakho, family ke saath raho</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginTop:2 }}>Yeh pehle ghar ka pal hai.</div>
          </div>
        </div>
        <div style={{ padding:'14px 16px', borderRadius:16, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.14)' }}>
          <div style={{ fontWeight:700, fontSize:14 }}>Emotional MI story post karo</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginTop:2 }}>Moment bada hai. Duniya ko pata chale.</div>
        </div>
      </div>
    </div>
  )
}

// ── Card 2 — meters ───────────────────────────────────────────────────────────
function Card2() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'0 28px', flex:1, justifyContent:'center' }}>
      <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.12em', color:'var(--accent)', marginBottom:12, textAlign:'center' }}>DUNIYA REACT KARTI HAI</div>
      <div style={{ fontFamily:'var(--serif)', fontWeight:600, fontSize:32, lineHeight:1.1, textAlign:'center', marginBottom:14 }}>
        Dressing room, fans, seniors — sab dekh rahe hain.
      </div>
      <div style={{ fontSize:15, color:'var(--ink2)', textAlign:'center', lineHeight:1.6, marginBottom:28 }}>
        Teen cheezein badlengi. Ek decision, teen alag impacts.
      </div>
      {/* Meter bars */}
      <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:14 }}>
        {[
          { label:'🏏 FORM', color:'#FFB020', val:47, prev:45 },
          { label:'⭐ FAME',  color:'#FF5C3A', val:54, prev:55 },
          { label:'🤝 TRUST', color:'#3DD6C8', val:37, prev:35 },
        ].map(m => (
          <div key={m.label}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
              <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.06em', color:m.color }}>{m.label}</span>
              <span style={{ fontSize:13, fontWeight:800, color:m.color }}>
                {m.prev} <span style={{ fontSize:11, color:m.val > m.prev ? '#3DD6C8' : '#FF5C3A', marginLeft:4 }}>{m.val > m.prev ? `+${m.val-m.prev}` : `${m.val-m.prev}`} → {m.val}</span>
              </span>
            </div>
            <div style={{ height:8, borderRadius:4, background:'rgba(255,255,255,.07)', overflow:'hidden' }}>
              <div style={{ width:`${m.val}%`, height:'100%', borderRadius:4, background:m.color, transition:'width .8s cubic-bezier(.32,.72,0,1)' }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:20, padding:'12px 16px', background:'rgba(255,255,255,.04)', borderRadius:12, width:'100%' }}>
        <span style={{ fontSize:13, color:'var(--ink3)' }}>Coach Sir: </span>
        <span style={{ fontSize:13, color:'var(--ink2)', fontStyle:'italic' }}>"Beta, khushi mana. Par yaad rakh."</span>
      </div>
    </div>
  )
}

// ── Card 3 — DMs + name input ─────────────────────────────────────────────────
function Card3({
  name, setName, gender, setGender, photoPreview, saving, fileInputRef, handlePhotoChange, handleSave,
}: {
  name: string; setName: (n: string) => void
  gender: 'male'|'female'; setGender: (g: 'male'|'female') => void
  photoPreview: string|null; saving: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSave: () => void
}) {
  return (
    <div style={{ display:'flex', flexDirection:'column', padding:'0 28px', flex:1, overflowY:'auto' }}>
      <div style={{ paddingTop:24 }}>
        <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.12em', color:'var(--accent)', marginBottom:12, textAlign:'center' }}>AB TUMHARA BAARI</div>
        <div style={{ fontFamily:'var(--serif)', fontWeight:600, fontSize:28, lineHeight:1.15, textAlign:'center', marginBottom:20 }}>
          Characters tumse DM pe baat karte hain.
        </div>
        {/* DM preview */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#1a3a6e', display:'grid', placeItems:'center', fontWeight:800, fontSize:12, flexShrink:0 }}>R</div>
            <div style={{ background:'#1c1c1f', borderRadius:18, borderBottomLeftRadius:4, padding:'10px 14px', fontSize:13, lineHeight:1.4, maxWidth:'78%' }}>
              Dekh raha hoon tujhe. Kuch poochh agar kuch samajh nahi aa raha.
            </div>
          </div>
          <div style={{ alignSelf:'flex-end', background:'linear-gradient(120deg,#FF2D78,#ff6a3d)', borderRadius:18, borderBottomRightRadius:4, padding:'10px 14px', fontSize:13, color:'#fff', maxWidth:'72%' }}>
            Rohit bhai, tempo kaise build karein?
          </div>
          <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#1a3a6e', display:'grid', placeItems:'center', fontWeight:800, fontSize:12, flexShrink:0 }}>R</div>
            <div style={{ background:'#1c1c1f', borderRadius:18, borderBottomLeftRadius:4, padding:'10px 14px', fontSize:13, lineHeight:1.4, maxWidth:'78%' }}>
              Pehle 12 ball survive karo. Baaki sab baad mein.
            </div>
          </div>
        </div>
      </div>

      {/* Name input */}
      <div style={{ marginBottom:20 }}>
        <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'.1em', color:'rgba(255,255,255,.45)', marginBottom:14 }}>
          TUMHARA NAAM
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value.slice(0,24))}
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          placeholder="Apna naam likho..."
          style={{
            width:'100%', boxSizing:'border-box',
            background:'transparent', border:'none', outline:'none',
            borderBottom:`1.5px solid ${name ? 'var(--accent)' : 'rgba(255,255,255,.2)'}`,
            paddingBottom:10, color:'#fff', fontSize:24,
            fontFamily:'var(--serif)', fontWeight:500, caretColor:'var(--accent)',
            transition:'border-color .2s',
          }}
        />
      </div>

      {/* Gender */}
      <div style={{ marginBottom:20 }}>
        <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'.1em', color:'rgba(255,255,255,.45)', marginBottom:6 }}>
          TUMHARA ROLE
        </label>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginBottom:14 }}>
          Story mein kaunse characters tumse pehle baat karenge.
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {(['male','female'] as const).map(g => (
            <button key={g} onClick={() => setGender(g)} style={{
              flex:1, padding:'14px 0', borderRadius:14,
              fontWeight:700, fontSize:14, fontFamily:'var(--sans)',
              background: gender===g ? 'rgba(255,45,120,.15)' : 'rgba(255,255,255,.05)',
              border:`1.5px solid ${gender===g ? 'var(--accent)' : 'rgba(255,255,255,.1)'}`,
              color: gender===g ? 'var(--accent)' : 'rgba(255,255,255,.4)',
              transition:'all .2s',
            }}>
              {g === 'male' ? 'He / Him' : 'She / Her'}
            </button>
          ))}
        </div>
      </div>

      {/* Optional photo */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
        <button onClick={() => fileInputRef.current?.click()} style={{
          width:56, height:56, borderRadius:'50%', flexShrink:0,
          background: photoPreview ? 'transparent' : 'rgba(255,45,120,.1)',
          backgroundImage: photoPreview ? `url(${photoPreview})` : undefined,
          backgroundSize:'cover', backgroundPosition:'center',
          border:`2px dashed ${photoPreview ? 'var(--accent)' : 'rgba(255,255,255,.2)'}`,
          cursor:'pointer', display:'grid', placeItems:'center',
          fontSize:20, color:'rgba(255,255,255,.3)',
        }}>
          {!photoPreview && '📷'}
        </button>
        <div style={{ fontSize:13, color:'var(--ink3)' }}>
          {photoPreview ? 'Photo added ✓' : 'Optional — add photo for AI avatar'}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" capture="user" onChange={handlePhotoChange} style={{ display:'none' }} />
      </div>

      <button onClick={handleSave} disabled={!name.trim() || saving} style={{
        width:'100%', padding:'16px 0', borderRadius:16,
        background: name.trim() ? 'var(--accent)' : 'rgba(255,45,120,.25)',
        color: name.trim() ? '#fff' : 'rgba(255,255,255,.4)',
        fontWeight:700, fontSize:16, fontFamily:'var(--sans)',
        transition:'all .2s', marginBottom:32,
      }}>
        {saving ? 'Saving...' : 'Start →'}
      </button>
    </div>
  )
}

// ── Progress dots ─────────────────────────────────────────────────────────────
function Dots({ cur }: { cur: number }) {
  return (
    <div style={{ display:'flex', gap:6, justifyContent:'center', paddingTop:16 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          height:6, borderRadius:3,
          width: i === cur ? 20 : 6,
          background: i === cur ? 'var(--accent)' : 'rgba(255,255,255,.2)',
          transition:'all .3s',
        }} />
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const { saveProfile } = useApp()
  const [card, setCard] = useState(0)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male'|'female'>('male')
  const [saving, setSaving] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string|null>(null)
  const [photoBase64, setPhotoBase64] = useState<string|null>(null)
  const [photoMime, setPhotoMime] = useState('image/jpeg')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoMime(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = ev => {
      const result = ev.target?.result as string
      setPhotoPreview(result)
      setPhotoBase64(result.split(',')[1])
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSave = useCallback(async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      await saveProfile(name.trim(), gender, photoPreview ?? undefined)
      if (photoBase64) {
        const userId = (await import('@/lib/game').then(m => m.ensureSession()))?.user?.id
        if (userId) {
          generateAvatarAsync(photoBase64, photoMime, userId).then(aiUrl => {
            if (aiUrl && typeof window !== 'undefined') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(window as any).__lore_set_avatar?.(aiUrl)
            }
          })
        }
      }
    } finally {
      setSaving(false)
    }
  }, [name, gender, saving, saveProfile, photoPreview, photoBase64, photoMime])

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)' }}>
      <Dots cur={card} />

      {/* Skip — only on cards 0 and 1 */}
      {card < 2 && (
        <button
          onClick={() => setCard(2)}
          style={{ position:'absolute', top:12, right:16, fontSize:12, color:'rgba(255,255,255,.35)', fontWeight:600, padding:'8px 12px', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--sans)', zIndex:10 }}
        >
          Skip →
        </button>
      )}

      {/* Sliding cards */}
      <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
        <div style={{
          display:'flex', height:'100%',
          transform:`translateX(-${card * 100}%)`,
          transition:'transform .4s cubic-bezier(.32,.72,0,1)',
        }}>
          <div style={{ minWidth:'100%', height:'100%', display:'flex', flexDirection:'column' }}><Card1 /></div>
          <div style={{ minWidth:'100%', height:'100%', display:'flex', flexDirection:'column' }}><Card2 /></div>
          <div style={{ minWidth:'100%', height:'100%', display:'flex', flexDirection:'column' }}>
            <Card3
              name={name} setName={setName}
              gender={gender} setGender={setGender}
              photoPreview={photoPreview} saving={saving}
              fileInputRef={fileInputRef}
              handlePhotoChange={handlePhotoChange}
              handleSave={handleSave}
            />
          </div>
        </div>
      </div>

      {/* Nav — only on cards 0 and 1 */}
      {card < 2 && (
        <div style={{ padding:'0 28px 36px', display:'flex', gap:12 }}>
          {card > 0 && (
            <button onClick={() => setCard(c => c - 1)} style={{ flex:1, height:50, background:'rgba(255,255,255,.07)', color:'var(--ink2)', fontWeight:600, fontSize:14, borderRadius:14, border:'1px solid rgba(255,255,255,.1)', cursor:'pointer', fontFamily:'var(--sans)' }}>
              ← Back
            </button>
          )}
          <button onClick={() => setCard(c => c + 1)} style={{ flex:2, height:50, background:'var(--accent)', color:'#fff', fontWeight:700, fontSize:15, borderRadius:14, border:'none', cursor:'pointer', fontFamily:'var(--sans)', boxShadow:'0 8px 24px rgba(255,45,120,.35)' }}>
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
