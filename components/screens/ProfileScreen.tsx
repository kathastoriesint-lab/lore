'use client'
import { useApp } from '@/lib/context'
import PlayerAvatar from '@/components/PlayerAvatar'
import { fameToFollowers } from '@/lib/game'

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtFollowers(fame: number): string {
  const n = fameToFollowers(fame)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M followers`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K followers`
  return `${n} followers`
}
void fmtFollowers // used conditionally later

// ── Row ───────────────────────────────────────────────────────────────────────
function Row({
  icon, label, sublabel, danger = false, onClick,
}: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  danger?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', width: '100%', background: 'none',
        border: 'none', cursor: onClick ? 'pointer' : 'default',
        padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,.07)',
        gap: 14, textAlign: 'left',
      }}
    >
      {/* icon box */}
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: danger ? 'rgba(255,80,80,.12)' : 'rgba(255,255,255,.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>

      {/* text */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 15, fontWeight: 600,
          color: danger ? 'var(--heat)' : 'var(--ink)',
        }}>{label}</div>
        {sublabel && (
          <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 2 }}>{sublabel}</div>
        )}
      </div>

      {/* chevron */}
      {onClick && !danger && (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
          stroke="rgba(255,255,255,.28)" strokeWidth="2.2" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </button>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { game, navigate, goBack, resetGame } = useApp()

  const isCricket   = game.world === 'cricket'
  const isCreator   = game.world === 'creator-house'
  // "In a world" = a run is active. Key off char (set the moment you enter — 'player'
  // is the cricket sentinel), NOT situation>0. Cricket runs start at situation 0, so
  // the old check made the profile read "No Active World" until the first choice.
  const inWorld     = game.char !== null
  const hasProgress = inWorld

  const worldLabel = isCricket ? 'Indian Dressing Room'
    : isCreator ? 'Creator House'
    : null

  const progressSub = isCricket
    ? `Season 1 · Situation ${game.situation + 1} of ~30`
    : isCreator
      ? `Day ${Math.ceil((game.situation + 1) / 3)} of 10`
      : 'No world entered yet'

  // Each world names its meters differently. Cricket: fame=FORM, heat=FAME, image=TEAM TRUST.
  // (Per-senior trust — Rohit/Hardik — lives on the Live goal card and in DMs.)
  // Creator House: fame=FAME, heat=HEAT, image=IMAGE.
  const statsLabel = hasProgress
    ? (isCricket
        ? `FORM ${game.meters.fame}  ·  FAME ${game.meters.heat}  ·  TEAM TRUST ${game.meters.image}`
        : `FAME ${game.meters.fame}  ·  HEAT ${game.meters.heat}  ·  IMAGE ${game.meters.image}`)
    : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '52px 20px 12px',
      }}>
        <button
          onClick={goBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginLeft: -4 }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
            stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: 17 }}>Profile</div>
      </div>

      <div className="scroll" style={{ padding: '0 20px 32px' }}>

        {/* ── Avatar + name ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 24 }}>
          <PlayerAvatar size={64} fontSize={26} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.2 }}>
              {game.playerName || 'You'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 3 }}>
              {inWorld ? worldLabel : 'Lore Player'}
            </div>
          </div>
        </div>

        {/* ── Status card ── */}
        <div style={{
          background: 'var(--surf)', borderRadius: 16, padding: '16px 18px 18px',
          border: '1px solid rgba(255,255,255,.08)', marginBottom: 28,
        }}>
          {hasProgress ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--trust)', flexShrink: 0 }} />
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: 'var(--trust)' }}>ACTIVE</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>
                {worldLabel ?? 'In Game'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink3)' }}>{progressSub}</div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--heat)', flexShrink: 0 }} />
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: 'var(--heat)' }}>INACTIVE</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>No Active World</div>
              <button
                onClick={() => navigate('worlds')}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 12,
                  border: '1px solid rgba(255,255,255,.15)',
                  background: 'rgba(255,255,255,.05)', color: 'var(--ink)',
                  fontWeight: 700, fontSize: 14, fontFamily: 'var(--sans)', cursor: 'pointer',
                }}
              >
                Explore Worlds →
              </button>
            </>
          )}
        </div>

        {/* ── Settings heading ── */}
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>Settings</div>

        {/* ── Menu rows ── */}
        <Row
          icon={
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
              stroke="rgba(255,255,255,.55)" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          }
          label="Profile Details"
          sublabel={`${game.playerName || 'You'} · ${game.playerGender === 'male' ? 'He/Him' : 'She/Her'}`}
          onClick={() => {}}
        />

        {hasProgress && isCricket && (
          <Row
            icon={
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
                stroke="rgba(255,255,255,.55)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            label="The Room"
            sublabel="Your teammates & bonds"
            onClick={() => {}}
          />
        )}

        {hasProgress && (
          <Row
            icon={
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
                stroke="rgba(255,255,255,.55)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
            }
            label="My Stats"
            sublabel={statsLabel}
            onClick={() => {}}
          />
        )}

        {hasProgress && (
          <Row
            icon={
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
                stroke="rgba(255,255,255,.55)" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            }
            label="My Posts"
            sublabel={`${game.choices.length} choice${game.choices.length !== 1 ? 's' : ''} made`}
            onClick={() => {}}
          />
        )}

        <Row
          icon={
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
              stroke="rgba(255,255,255,.55)" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          }
          label="FAQ"
          onClick={() => {}}
        />

        <Row
          icon={
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
              stroke="rgba(255,255,255,.55)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          }
          label="Terms of Service"
          onClick={() => {}}
        />

        {/* danger */}
        <div style={{ marginTop: 6 }}>
          <Row
            icon={
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
                stroke="var(--heat)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            }
            label="Start Over"
            danger
            onClick={resetGame}
          />
        </div>

      </div>

      {/* ── Tab bar ── */}
      <div className="tabbar">
        {(isCricket || isCreator) ? (
          <>
            <button className="tab" onClick={() => navigate('feed')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
              </svg>
              <span>Feed</span>
            </button>
            <button className="tab" onClick={() => navigate('dm-inbox')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>DMs</span>
            </button>
            <button className="tab" onClick={() => navigate('live')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L4.5 13.5H11L9 22l9-12h-6.5L13 2z" />
              </svg>
              <span>Live</span>
            </button>
          </>
        ) : (
          <button className="tab" onClick={() => navigate('worlds')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3c-2.5 3-4 5.7-4 9s1.5 6 4 9" />
              <path d="M12 3c2.5 3 4 5.7 4 9s-1.5 6-4 9" />
              <path d="M3 12h18" />
            </svg>
            <span>Worlds</span>
          </button>
        )}
        <button className="tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <span>Profile</span>
        </button>
      </div>

    </div>
  )
}
