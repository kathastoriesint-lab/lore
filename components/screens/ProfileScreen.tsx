'use client'
import type { CSSProperties } from 'react'
import { useApp } from '@/lib/context'
import { getCHChars } from '@/lib/content'
import { derivePosts, deriveKeyDecisions, feedLikes } from '@/lib/feed-posts'
import { getWeek, evaluateGate, weekForSituationId, SEASON_WEEKS } from '@/lib/season'
import { resolveTokens } from '@/lib/game'

// World profile — per-world identity for the in-world Profile tab. Shared structure,
// world-specific accent / meters / role / copy (cricket fully designed; Creator House
// mirrors it). The cross-world Global profile is a separate screen.

// Short name for what clearing the next cricket stage unlocks (mirrors GoalCard).
const UNLOCK_SHORT: Record<number, string> = {
  2: 'Main nets group', 3: 'Wankhede debut', 4: 'Apni jagah pakki',
  5: 'Seniors ka bharosa', 6: 'India tumhari baat kare', 7: 'India ka call-up',
}

export default function ProfileScreen() {
  const { game, navigate, dmTrust } = useApp()
  const isCricket = game.world === 'cricket'
  const r = (t: string) => resolveTokens(t, game.playerName, game.playerGender)

  const name = game.playerName || 'Player'
  const initial = (name[0] || 'P').toUpperCase()
  const chChar = !isCricket && game.char && game.char !== 'player' ? getCHChars()[game.char] : null

  const cover = isCricket ? 'linear-gradient(135deg,#003087,#001540)' : 'linear-gradient(135deg,#ff2d78,#7a1140)'
  const eyebrow = isCricket ? 'SEASON 1 · MUMBAI INDIANS' : 'CREATOR HOUSE · SEASON 1'
  const eyebrowColor = isCricket ? '#FFB020' : '#fff'
  const role = isCricket ? 'Rookie batsman · 16 saal' : (chChar ? chChar.role : 'Housemate')

  const meters = isCricket
    ? [
        { icon: '🏏', label: 'FORM', color: '#FFB020', val: game.meters.fame, note: 'Nets mein consistency. Selectors notice kar rahe hain.' },
        { icon: '⭐', label: 'FAME', color: '#FF5C3A', val: game.meters.heat, note: 'Debut buzz — followers roz badh rahe hain.' },
        { icon: '🤝', label: 'TEAM TRUST', color: '#3DD6C8', val: game.meters.image, note: 'Dressing room abhi judge kar raha hai. Earn it.' },
      ]
    : [
        { icon: '⭐', label: 'FAME', color: '#FFB020', val: game.meters.fame, note: 'Ghar ke bahar log baat kar rahe hain.' },
        { icon: '🔥', label: 'HEAT', color: '#FF5C3A', val: game.meters.heat, note: 'Drama level. Zyada heat = zyada nazar.' },
        { icon: '🤝', label: 'TRUST', color: '#3DD6C8', val: game.meters.image, note: 'Housemates ka bharosa — alliances yahin bante hain.' },
      ]

  const queueLen = game.situationQueue.length || 30
  const pos = Math.min(game.situation + 1, queueLen)
  const progressLabel = isCricket ? `Week ${game.week ?? 1} · ${pos}/${queueLen}` : `Day ${Math.min(10, Math.ceil(pos / 3))} of 10`
  const progressPct = Math.round((pos / queueLen) * 100)

  let nextTarget: string | null = null
  if (isCricket) {
    const curSitId = game.situationQueue[game.situation]
    const curWeekNum = curSitId ? weekForSituationId(curSitId) : (game.week ?? 1)
    const goalWeekNum = curWeekNum + 1
    if (goalWeekNum <= SEASON_WEEKS.length) {
      const { gaps } = evaluateGate(getWeek(goalWeekNum).gate, game.meters, dmTrust)
      const unmet = gaps.find(g => !g.passed)
      const unlock = UNLOCK_SHORT[goalWeekNum] ?? getWeek(goalWeekNum).name
      nextTarget = unmet
        ? `Agla target: ${unlock} · ${Math.max(0, unmet.threshold - unmet.current)} ${/trust/i.test(unmet.label) ? 'trust' : unmet.label.toLowerCase()} aur chahiye`
        : `Agla target: ${unlock} · ready ✓`
    }
  }

  const decisions = deriveKeyDecisions(game).slice(0, 4)
  const posts = derivePosts(game).filter((p): p is Extract<typeof p, { type: 'authored' }> => p.type === 'authored').slice(0, 6)

  const sectionLabel: CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)', padding: '0 4px 12px' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', background: 'var(--bg)' }}>
      <div className="scroll" style={{ flex: 1 }}>

        {/* ── Character header ── */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, height: 150, background: cover }} />
          <div style={{ position: 'absolute', inset: 0, height: 150, background: 'var(--grain)', opacity: 0.3, mixBlendMode: 'overlay' }} />
          <div style={{ position: 'absolute', inset: 0, height: 150, background: 'linear-gradient(180deg, transparent 40%, var(--bg))' }} />
          <div style={{ position: 'relative', padding: '14px 18px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.06em', color: eyebrowColor }}>{eyebrow}</span>
              <button onClick={() => navigate('profile-global')} aria-label="Account & settings"
                style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: 30 }}>
              <div style={{ width: 84, height: 84, borderRadius: 22, background: game.avatarUrl ? `url(${game.avatarUrl}) center/cover` : '#0a1a4a', border: '2px solid rgba(255,255,255,.15)', display: 'grid', placeItems: 'center', fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 34, color: '#fff', flexShrink: 0 }}>
                {!game.avatarUrl && initial}
              </div>
              <div style={{ minWidth: 0, paddingBottom: 4 }}>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 24, color: '#fff', lineHeight: 1.1 }}>{name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 2 }}>{role}</div>
              </div>
            </div>

            <div style={{ marginTop: 18, background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--ink2)' }}>{isCricket ? 'Season progress' : 'House progress'}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{progressLabel}</span>
              </div>
              <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,.08)', overflow: 'hidden', marginTop: 9 }}>
                <div style={{ height: '100%', width: `${progressPct}%`, borderRadius: 4, background: 'var(--accent)', transition: 'width .6s cubic-bezier(.32,.72,0,1)' }} />
              </div>
              {nextTarget && <div style={{ fontSize: 11.5, fontWeight: 600, color: '#FFB020', marginTop: 9 }}>{nextTarget}</div>}
            </div>
          </div>
        </div>

        {/* ── Meters ── */}
        <div style={{ padding: '22px 16px 0' }}>
          <div style={sectionLabel}>YOUR METERS</div>
          <div style={{ background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
            {meters.map((m, i) => (
              <div key={m.label} style={{ padding: '13px 15px', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,.05)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.05em', color: m.color }}>{m.icon} {m.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: m.color, fontVariantNumeric: 'tabular-nums' }}>{m.val}<span style={{ color: 'var(--ink3)', fontWeight: 500 }}>/100</span></span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, m.val))}%`, borderRadius: 4, background: m.color, transition: 'width .6s cubic-bezier(.32,.72,0,1)' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 6, lineHeight: 1.4 }}>{m.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Key decisions ── */}
        {decisions.length > 0 && (
          <div style={{ padding: '22px 16px 0' }}>
            <div style={sectionLabel}>KEY DECISIONS</div>
            <div style={{ padding: '0 4px' }}>
              {decisions.map((d, i) => (
                <div key={d.id} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 11, height: 11, borderRadius: '50%', background: d.color, border: '2px solid var(--bg)', boxShadow: `0 0 0 1px ${d.color}` }} />
                    {i < decisions.length - 1 && <div style={{ width: 2, flex: 1, marginTop: 4, background: 'var(--line)' }} />}
                  </div>
                  <div style={{ paddingBottom: 18, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.04em', color: 'var(--ink3)' }}>{d.when}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', lineHeight: 1.3, marginTop: 2 }}>{r(d.title)}</div>
                    <div style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--ink2)', lineHeight: 1.4, marginTop: 2 }}>{d.outcome}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Your posts ── */}
        {posts.length > 0 && (
          <div style={{ padding: '14px 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px 12px' }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>YOUR POSTS</span>
              <button onClick={() => navigate('feed')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>See all →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {posts.map((p, i) => {
                const bg = p.imageUrl
                  ? `linear-gradient(to bottom, rgba(0,0,0,.05), rgba(0,0,0,.62)), url(${p.imageUrl}) center/cover`
                  : `linear-gradient(150deg, ${p.owner.color} 0%, #04267a 60%, #0a0a18 100%)`
                return (
                  <div key={p.postId} style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--surf)', border: '1px solid var(--line)' }}>
                    <div style={{ position: 'relative', aspectRatio: '1 / 1', background: bg, display: 'flex', alignItems: 'flex-end', padding: 10 }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'var(--grain)', opacity: 0.4, mixBlendMode: 'overlay' }} />
                      <p style={{ position: 'relative', margin: 0, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11.5, lineHeight: 1.35, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>{r(p.caption)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 21s-7-4.4-9.5-8.5C.8 9.6 2 6 5.2 6c1.9 0 3 .9 3.8 2 .8-1.1 1.9-2 3.8-2C16 6 17.2 9.6 15.5 12.5 13 16.6 12 21 12 21z" /></svg>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#fff' }}>{feedLikes(i, isCricket)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>

      {/* Tab bar — in-world */}
      <div className="tabbar">
        <button className="tab" onClick={() => navigate('feed')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
          <span>Feed</span>
        </button>
        <button className="tab" onClick={() => navigate('dm-inbox')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          <span>Messages</span>
        </button>
        <button className="tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          <span>Profile</span>
        </button>
      </div>
    </div>
  )
}
