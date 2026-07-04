'use client'
import { useState, useEffect, type CSSProperties } from 'react'
import { useApp } from '@/lib/context'
import { getAuthInfo, signOutToGuest, deleteAccountFully, type AuthInfo } from '@/lib/auth'
import { getProfileStats, type ProfileStats } from '@/lib/profile-stats'

// Global profile — world-agnostic, reached from the Worlds tab. About YOU across
// all of Lore: identity, your worlds hub, account/settings. (The per-world profile
// is a separate screen.)

const WORLD_META: Record<string, { name: string; cover: string; livePink: boolean }> = {
  cricket: { name: 'Indian Dressing Room', cover: 'linear-gradient(135deg,#003087,#001540)', livePink: false },
  'creator-house': { name: 'Creator House', cover: 'linear-gradient(135deg,#ff2d78,#7a1140)', livePink: true },
}

export default function GlobalProfileScreen() {
  const { goBack, game, navigate, saveProfile, showToast, resetGame } = useApp()
  const [auth, setAuth] = useState<AuthInfo | null>(null)
  const [stats, setStats] = useState<ProfileStats>({ worlds: 0, choices: 0, streak: 0 })
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => { getAuthInfo().then(setAuth) }, [])
  useEffect(() => { setStats(getProfileStats()) }, [])

  const name = game.playerName || 'Player'
  const initial = (name[0] || 'P').toUpperCase()
  const handle = '@' + name.toLowerCase().replace(/\s+/g, '_')

  const saveName = () => {
    const n = draft.trim()
    if (n) saveProfile(n, game.playerGender, game.avatarUrl)
    setEditing(false)
  }

  const hasRun = game.char !== null
  const wm = WORLD_META[game.world] ?? WORLD_META.cricket
  const worldProgress = game.world === 'cricket'
    ? `Week ${game.week ?? 1} · Situation ${Math.min(game.situation + 1, game.situationQueue.length || 30)} of ${game.situationQueue.length || 30}`
    : `Day ${Math.min(10, Math.ceil((game.situation + 1) / 3))} of 10`
  const resumeWorld = () => {
    // Resume into the Feed (the world hub); Live is entered from its banner.
    if (game.world === 'cricket') navigate(game.situation > 0 ? 'feed' : 'cricket-carousel')
    else navigate(game.char ? 'feed' : 'world-intro')
  }

  const deleteAccount = () => {
    if (typeof window !== 'undefined' && !window.confirm('Delete your account and wipe all progress? This cannot be undone.')) return
    // Full deletion: removes gameplay data AND the auth account (phone record)
    // via the delete-account edge fn; falls back to a local data-wipe if that
    // function isn't deployed yet. Reload either way → fresh guest.
    resetGame()
    deleteAccountFully().finally(() => { if (typeof window !== 'undefined') window.location.reload() })
  }

  const contact = auth?.email
    ? { icon: '✉', label: 'Email', meta: auth.email, color: 'var(--ink)', onClick: undefined as (() => void) | undefined }
    : auth?.phone
      ? { icon: '☏', label: 'Phone', meta: auth.phone, color: 'var(--ink)', onClick: undefined }
      : { icon: '☁', label: 'Save progress', meta: 'Sign in', color: 'var(--accent)', onClick: () => navigate('login') }

  const accountRows: { icon: string; label: string; meta?: string; color: string; onClick?: () => void }[] = [
    contact,
    { icon: '🔔', label: 'Notifications', meta: 'On', color: 'var(--ink)' },
    { icon: '↪', label: 'Log out', color: 'var(--ink)', onClick: () => signOutToGuest().then(() => { if (typeof window !== 'undefined') window.location.reload() }) },
    { icon: '🗑', label: 'Delete account', color: 'var(--heat)', onClick: deleteAccount },
  ]

  const sectionLabel: CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)', padding: '0 4px 12px' }
  const statCol = (value: string | number, label: string, gold = false) => (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 22, color: gold ? 'var(--fame)' : '#fff' }}>{value}</div>
      <div style={{ fontSize: 11, letterSpacing: '.04em', color: 'var(--ink3)', marginTop: 2 }}>{label}</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', background: 'var(--bg)' }}>
      <div className="scroll" style={{ flex: 1 }}>

        {/* ── Identity ── */}
        <div style={{ padding: '24px 22px 22px', position: 'relative', background: 'radial-gradient(120% 80% at 50% 0%, rgba(255,45,120,.14), transparent 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button onClick={goBack} aria-label="Back" style={{ position: 'absolute', top: 14, left: 14, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 92, height: 92, borderRadius: '50%', background: game.avatarUrl ? `url(${game.avatarUrl}) center/cover` : 'linear-gradient(135deg,#ff2d78,#ff8a3d)', display: 'grid', placeItems: 'center', fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 38, color: '#fff', boxShadow: '0 8px 24px rgba(255,45,120,.3)' }}>
              {!game.avatarUrl && initial}
            </div>
            <button onClick={() => showToast('Photo upload jald aayega 📸')} aria-label="Edit photo"
              style={{ position: 'absolute', right: -2, bottom: -2, width: 30, height: 30, borderRadius: '50%', background: 'var(--surf)', border: '1px solid var(--line)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--ink2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
            </button>
          </div>

          {editing ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
              <input value={draft} onChange={e => setDraft(e.target.value)} autoFocus maxLength={24}
                onKeyDown={e => { if (e.key === 'Enter') saveName() }}
                style={{ height: 42, padding: '0 12px', background: 'var(--surf)', border: '1px solid var(--accent)', borderRadius: 10, color: 'var(--ink)', fontSize: 18, textAlign: 'center', fontFamily: 'var(--sans)', outline: 'none', width: 180 }} />
              <button onClick={saveName} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Save</button>
            </div>
          ) : (
            <button onClick={() => { setDraft(name); setEditing(true) }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
              <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 26, color: '#fff' }}>{name}</span>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--ink3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
            </button>
          )}
          <div style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 4 }}>{handle}</div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: 22, width: '100%' }}>
            {statCol(stats.worlds, 'Worlds')}
            <div style={{ width: 1, height: 30, background: 'var(--line)' }} />
            {statCol(stats.choices, 'Choices')}
            <div style={{ width: 1, height: 30, background: 'var(--line)' }} />
            {statCol(`${stats.streak}🔥`, 'Day streak', true)}
          </div>
        </div>

        {/* ── Your Worlds ── */}
        <div style={{ padding: '8px 18px 0' }}>
          <div style={sectionLabel}>YOUR WORLDS</div>
          {hasRun && (
            <button onClick={resumeWorld} style={{ display: 'block', width: '100%', textAlign: 'left', borderRadius: 18, border: `1.5px solid ${game.world === 'cricket' ? 'rgba(0,48,135,.5)' : 'rgba(255,45,120,.4)'}`, background: 'var(--surf)', cursor: 'pointer', overflow: 'hidden', padding: 0 }}>
              <div style={{ height: 96, background: wm.cover, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9.5, fontWeight: 800, letterSpacing: '.06em', color: game.world === 'cricket' ? '#FFB020' : '#fff' }}>
                  <span className="pulse" style={{ background: game.world === 'cricket' ? '#FFB020' : '#fff' }} />LIVE · SEASON 1
                </span>
                <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 20, color: '#fff' }}>{wm.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{worldProgress}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink3)', marginTop: 1 }}>Tap to continue your story →</div>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><polygon points="6,4 20,12 6,20" /></svg>
                </div>
              </div>
            </button>
          )}
          <button onClick={() => navigate('worlds')} style={{ width: '100%', height: 48, marginTop: hasRun ? 12 : 0, border: '1px dashed var(--line)', borderRadius: 14, background: 'none', color: 'var(--ink2)', fontSize: 14, fontFamily: 'var(--sans)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Explore {hasRun ? 'more ' : ''}worlds
          </button>
        </div>

        {/* ── Account ── */}
        <div style={{ padding: '22px 18px 0' }}>
          <div style={sectionLabel}>ACCOUNT</div>
          <div style={{ background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
            {accountRows.map((row, i) => (
              <button key={row.label} onClick={row.onClick} disabled={!row.onClick}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--line)', background: 'none', border: 'none', cursor: row.onClick ? 'pointer' : 'default', textAlign: 'left' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{row.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: row.color }}>{row.label}</span>
                </span>
                {row.meta && <span style={{ fontSize: 13, color: 'var(--ink3)' }}>{row.meta}</span>}
              </button>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink3)', marginTop: 16 }}>Lore v1.0 · Made in India 🇮🇳</div>
        </div>

        <div style={{ height: 20 }} />
      </div>

      {/* Tab bar — global (Worlds · Profile) */}
      <div className="tabbar">
        <button className="tab" onClick={() => navigate('worlds')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 3c-2.5 3-4 5.7-4 9s1.5 6 4 9" /><path d="M12 3c2.5 3 4 5.7 4 9s-1.5 6-4 9" /><path d="M3 12h18" /></svg>
          <span>Worlds</span>
        </button>
        <button className="tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          <span>Profile</span>
        </button>
      </div>
    </div>
  )
}
