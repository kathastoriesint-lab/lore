'use client'
import { useState, useEffect } from 'react'
import type { ImpactNotif } from '@/lib/context'
import { getCHChars } from '@/lib/content'

function fmt(n: number, showSign = true): string {
  const sign = n > 0 ? '+' : ''
  if (Math.abs(n) >= 1_000_000) return `${showSign ? sign : ''}${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000)     return `${showSign ? sign : ''}${Math.round(n / 1000)}K`
  return `${showSign ? sign : ''}${n}`
}

export default function ImpactPill({ notif }: { notif: ImpactNotif }) {
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(true)
  const charAvatar = notif.charId ? getCHChars()[notif.charId] : null

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3800)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  const followerStr = fmt(notif.followerDelta)
  const followerPos = notif.followerDelta >= 0

  if (!expanded) {
    return (
      <button
        className="impact-pill"
        onClick={() => setExpanded(true)}
        aria-label="See impact details"
      >
        <span className="impact-pill-icon">
          {followerPos ? '⭐' : '📉'}
        </span>
        <div>
          <div className="impact-pill-main" style={{ color: followerPos ? 'var(--fame)' : 'var(--heat)' }}>
            {followerStr} followers
          </div>
          {notif.charName && notif.trustDelta !== undefined && notif.trustDelta !== 0 && (
            <div className="impact-pill-sub">
              {notif.charName} trust {notif.trustDelta > 0 ? '+' : ''}{notif.trustDelta}%
            </div>
          )}
        </div>
      </button>
    )
  }

  // Expanded card
  return (
    <div className="impact-expanded">
      {/* Header */}
      <div className="impact-exp-head">
        <div className="impact-exp-action">{notif.action}</div>
        <button className="impact-exp-close" onClick={() => setVisible(false)}>✕</button>
      </div>

      {/* 3 stat cells */}
      <div className="impact-exp-grid">
        <div className="impact-exp-cell">
          <div className="impact-exp-val" style={{ color: followerPos ? 'var(--fame)' : 'var(--heat)' }}>
            {followerStr}
          </div>
          <div className="impact-exp-lbl">FOLLOWERS</div>
        </div>

        <div className="impact-exp-cell">
          {notif.trustDelta !== undefined && notif.trustDelta !== 0 ? (
            <>
              <div className="impact-exp-val" style={{ color: notif.trustDelta > 0 ? 'var(--trust)' : 'var(--heat)' }}>
                {notif.trustDelta > 0 ? '+' : ''}{notif.trustDelta}%
              </div>
              <div className="impact-exp-lbl">{notif.charName?.toUpperCase() ?? ''} TRUST</div>
            </>
          ) : (
            <>
              <div className="impact-exp-val" style={{ color: 'var(--ink3)' }}>—</div>
              <div className="impact-exp-lbl">TRUST</div>
            </>
          )}
        </div>

        <div className="impact-exp-cell">
          {notif.tasksLeft !== undefined ? (
            <>
              <div className="impact-exp-val" style={{ color: 'var(--ink2)' }}>{notif.tasksLeft}/{notif.tasksTotal}</div>
              <div className="impact-exp-lbl">LEFT TODAY</div>
            </>
          ) : (
            <>
              <div className="impact-exp-val" style={{ color: 'var(--ink3)' }}>—</div>
              <div className="impact-exp-lbl">TODAY</div>
            </>
          )}
        </div>
      </div>

      {/* Relationship sentence */}
      {charAvatar && notif.trustDelta !== undefined && notif.trustDelta !== 0 && (
        <div className="impact-exp-rel">
          <div
            className={`av ${charAvatar.cls}`}
            style={{ width:24, height:24, fontSize:10,
              backgroundImage:`url(/avatars/${notif.charId}.png)`,
              backgroundSize:'cover', backgroundPosition:'center' }}
          >
            <span style={{ opacity:0 }}>{charAvatar.init}</span>
          </div>
          <div className="impact-exp-rel-text">
            <b>{notif.charName}</b>
            {notif.trustDelta > 0
              ? ' noticed — trust warming up'
              : ' noticed — trust cooling down'}
          </div>
        </div>
      )}

      {/* Auto-dismiss bar */}
      <div className="impact-exp-bar"><i /></div>
    </div>
  )
}
