'use client'
import { useState, useCallback, useRef } from 'react'
import { useApp } from '@/lib/context'

async function generateAvatarAsync(rawBase64: string, mimeType: string, userId: string) {
  try {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/lore-avatar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ image_base64: rawBase64, user_id: userId, mime_type: mimeType }),
      }
    )
    const data = await resp.json()
    return data.url as string | undefined
  } catch {
    return undefined
  }
}

export default function OnboardingScreen() {
  const { saveProfile, game } = useApp()
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [saving, setSaving] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [photoMime, setPhotoMime] = useState('image/jpeg')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoMime(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = ev => {
      const result = ev.target?.result as string
      // result is "data:image/jpeg;base64,..."
      setPhotoPreview(result)
      // Extract raw base64
      setPhotoBase64(result.split(',')[1])
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSave = useCallback(async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      // Save with raw photo preview as avatarUrl for instant display
      await saveProfile(name.trim(), gender, photoPreview ?? undefined)

      // Fire AI generation in background (non-blocking)
      if (photoBase64) {
        const userId = (await import('@/lib/game').then(m => m.ensureSession()))?.user?.id
        if (userId) {
          generateAvatarAsync(photoBase64, photoMime, userId).then(aiUrl => {
            if (aiUrl) {
              // Update avatarUrl in game state with the AI-generated version
              import('@/lib/game').then(({ saveGameState }) => {
                // We'll update via the app context once the URL arrives
                if (typeof window !== 'undefined') {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ;(window as any).__lore_set_avatar?.(aiUrl)
                }
              })
            }
          })
        }
      }
    } finally {
      setSaving(false)
    }
  }, [name, gender, saving, saveProfile, photoPreview, photoBase64, photoMime])

  const ready = name.trim().length > 0 && !saving

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg)', padding: '0 28px',
      justifyContent: 'center',
    }}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
        Welcome
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 40 }}>
        Tell us once — we'll remember it.
      </div>

      {/* Photo upload */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            background: photoPreview ? 'transparent' : 'rgba(255,45,120,.12)',
            backgroundImage: photoPreview ? `url(${photoPreview})` : undefined,
            backgroundSize: 'cover', backgroundPosition: 'center',
            border: `2px dashed ${photoPreview ? 'var(--accent)' : 'rgba(255,255,255,.2)'}`,
            cursor: 'pointer', display: 'grid', placeItems: 'center',
            fontSize: 24, color: 'rgba(255,255,255,.3)',
          }}
        >
          {!photoPreview && '📷'}
        </button>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>
            {photoPreview ? 'Photo added ✓' : 'Add your photo'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 3 }}>
            {photoPreview
              ? 'We\'ll create your AI avatar in the background'
              : 'Optional — we\'ll create an AI avatar of you'}
          </div>
          {photoPreview && (
            <button
              onClick={() => { setPhotoPreview(null); setPhotoBase64(null) }}
              style={{ fontSize: 11, color: 'var(--ink3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handlePhotoChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Name */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>
          YOUR NAME
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value.slice(0, 24))}
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          placeholder="Your name..."
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'transparent', border: 'none', outline: 'none',
            borderBottom: `1.5px solid ${name ? 'var(--accent)' : 'rgba(255,255,255,.2)'}`,
            paddingBottom: 10,
            color: '#fff', fontSize: 24,
            fontFamily: 'var(--serif)', fontWeight: 500,
            caretColor: 'var(--accent)',
            transition: 'border-color .2s',
          }}
        />
      </div>

      {/* Gender */}
      <div style={{ marginBottom: 40 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.45)', marginBottom: 6 }}>
          YOU ARE
        </label>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 14 }}>
          This shapes who approaches you inside the story.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['male', 'female'] as const).map(g => (
            <button
              key={g}
              onClick={() => setGender(g)}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 14,
                fontWeight: 700, fontSize: 14, fontFamily: 'var(--sans)',
                background: gender === g ? 'rgba(255,45,120,.15)' : 'rgba(255,255,255,.05)',
                border: `1.5px solid ${gender === g ? 'var(--accent)' : 'rgba(255,255,255,.1)'}`,
                color: gender === g ? 'var(--accent)' : 'rgba(255,255,255,.4)',
                transition: 'all .2s',
              }}
            >
              {g === 'male' ? 'He / Him' : 'She / Her'}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!ready}
        style={{
          width: '100%', padding: '16px 0', borderRadius: 16,
          background: ready ? 'var(--accent)' : 'rgba(255,45,120,.25)',
          color: ready ? '#fff' : 'rgba(255,255,255,.4)',
          fontWeight: 700, fontSize: 16, fontFamily: 'var(--sans)',
          transition: 'all .2s',
        }}
      >
        {saving ? 'Saving...' : 'Enter Lore →'}
      </button>
    </div>
  )
}
