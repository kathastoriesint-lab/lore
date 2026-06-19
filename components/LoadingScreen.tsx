'use client'

// Full-bleed Lore loading splash (per the loading-page handoff). The orbit mark —
// gradient ring spinning, inner ring counter-rotating, gold core pulsing — over a
// breathing pink halo, with the Fraunces wordmark, an indeterminate pink progress
// bar and an optional status line. Near-black + film-grain + pink wash. Fills its
// container (cold-start boot gate, or any full-screen loading moment).
export default function LoadingScreen({
  status = 'Setting the scene',
  tagline = 'Live your story',
}: {
  status?: string | null
  tagline?: string | null
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--sans)' }}>
      {/* pink wash + film grain */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 85% at 50% 40%, rgba(255,45,120,.16), transparent 62%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'var(--grain)', opacity: 0.4, mixBlendMode: 'overlay', pointerEvents: 'none' }} />

      {/* orbit mark + breathing halo */}
      <div style={{ position: 'relative', width: 96, height: 96, display: 'grid', placeItems: 'center', marginBottom: 24 }}>
        <div className="lo-halo" style={{ position: 'absolute', width: 96, height: 96, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,120,.45), transparent 70%)', filter: 'blur(10px)' }} />
        <svg className="lo-mark" viewBox="0 0 32 32" fill="none" width={64} height={64} style={{ position: 'relative', filter: 'drop-shadow(0 0 18px rgba(255,45,120,.55))' }}>
          <defs>
            <linearGradient id="loadMark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff2d78" />
              <stop offset=".55" stopColor="#ff8a3d" />
              <stop offset="1" stopColor="#ffd24d" />
            </linearGradient>
          </defs>
          <circle className="lo-ring" cx="16" cy="16" r="13.5" stroke="url(#loadMark)" strokeWidth="3" strokeDasharray="58 12" strokeLinecap="round" />
          <circle className="lo-inner" cx="16" cy="16" r="6.4" stroke="#ff2d78" strokeWidth="2.4" />
          <circle className="lo-core" cx="16" cy="16" r="1.9" fill="#ffd24d" />
        </svg>
      </div>

      {/* wordmark + tagline */}
      <div style={{ position: 'relative', fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 34, color: '#fff', letterSpacing: '.5px', lineHeight: 1 }}>Lore</div>
      {tagline && <div style={{ position: 'relative', fontSize: 13.5, color: 'var(--ink2)', marginTop: 8, letterSpacing: '.3px' }}>{tagline}</div>}

      {/* indeterminate progress bar */}
      <div style={{ position: 'relative', marginTop: 30, width: 150, height: 3, borderRadius: 99, background: 'rgba(255,255,255,.10)', overflow: 'hidden' }}>
        <span className="lo-prog" style={{ position: 'absolute', top: 0, bottom: 0, width: '42%', borderRadius: 99, background: 'var(--accent)' }} />
      </div>
      {status && <div style={{ position: 'relative', marginTop: 14, fontSize: 12, color: 'var(--ink3)', letterSpacing: '.04em' }}>{status}</div>}
    </div>
  )
}
