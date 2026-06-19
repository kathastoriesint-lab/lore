'use client'
import type { ReactNode } from 'react'

export interface ChoiceSheetChoice { trueIdx: number; t: string; s: string }

// Shared Live choice surface for BOTH worlds (cricket + Creator House). One bottom
// sheet above the tab bar: collapsed it peeks the question as a bold accent button;
// tapped it expands to a centered question header + frosted choice cards + social
// proof; after a pick it shows the world's result content (impact + post + CTAs),
// passed in as `children`. Extracted from the cricket sheet so the two worlds share
// one code path and can't drift. Strings (question/choices) arrive token-resolved.
export default function ChoiceSheet({
  question, choices, sheetOpen, onOpen, onChoose, social, isResult, children,
}: {
  question: string
  choices: ChoiceSheetChoice[]
  sheetOpen: boolean
  onOpen: () => void
  onChoose: (trueIdx: 0 | 1) => void
  social: { total: number; pctA: number } | null
  isResult: boolean
  children?: ReactNode
}) {
  const expanded = isResult || sheetOpen
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'var(--tabbar)', zIndex: 10, background: 'var(--surf2)', borderRadius: '22px 22px 0 0', borderTop: '1px solid rgba(255,255,255,.08)', boxShadow: '0 -16px 40px rgba(0,0,0,.55)' }}>
      {/* Collapsed: a clear, obvious accent button carrying the question. */}
      {!isResult && !sheetOpen && (
        <div style={{ padding: '14px 16px 16px' }}>
          <button className="lo-press" onClick={onOpen}
            style={{ width: '100%', minHeight: 48, background: 'var(--accent)', border: 'none', borderRadius: 16, padding: '15px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 24px rgba(255,45,120,.35)' }}>
            <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 16.5, color: '#fff', lineHeight: 1.25, textAlign: 'center' }}>{question}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </div>
      )}
      {/* Expanded: question becomes a plain header above the choices. */}
      {!isResult && sheetOpen && (
        <div style={{ padding: '14px 16px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.18)' }} />
          <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 19, color: '#fff', textAlign: 'center', lineHeight: 1.25 }}>{question}</span>
        </div>
      )}
      {/* Result: minimal grab handle only. */}
      {isResult && (
        <div style={{ padding: '12px 0 2px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 38, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.18)' }} />
        </div>
      )}

      <div style={{ maxHeight: isResult ? '62vh' : (sheetOpen ? 360 : 0), opacity: expanded ? 1 : 0, overflowY: isResult ? 'auto' : 'hidden', overflowX: 'hidden', transition: 'max-height .4s cubic-bezier(.32,.72,0,1), opacity .3s' }}>
        {!isResult ? (
          <div style={{ padding: '0 16px 6px' }}>
            {choices.map(c => (
              <button key={c.trueIdx} className="lo-press" onClick={() => onChoose(c.trueIdx as 0 | 1)}
                style={{ width: '100%', minHeight: 48, textAlign: 'left', borderRadius: 16, padding: '14px 16px', marginBottom: 10, background: 'rgba(255,255,255,.10)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer' }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: '#fff' }}>{c.t}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.6)', marginTop: 3 }}>{c.s}</div>
              </button>
            ))}
            {social && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textAlign: 'center', padding: '2px 0 14px' }}>{social.total.toLocaleString()} played · {social.pctA}% chose A</div>}
          </div>
        ) : children}
      </div>
    </div>
  )
}
