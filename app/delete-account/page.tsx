import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Delete your account — Lore',
  description: 'How to request deletion of your Lore account and associated data.',
}

// Google Play requires a public account-deletion page (separate from the privacy
// policy) that shows the steps to delete an account + what data is removed/kept.
// Hosted at /delete-account → https://lore-next-wine.vercel.app/delete-account
const ACCENT = '#FF2D78'
const INK = '#1a1a1c'
const MUTED = '#5b5b63'
const LINE = '#ececef'

export default function DeleteAccount() {
  const mail = (a: string, subject?: string) => (
    <a href={`mailto:${a}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`} style={{ color: ACCENT, fontWeight: 600, textDecoration: 'none' }}>{a}</a>
  )
  const step: React.CSSProperties = { display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }
  const num: React.CSSProperties = { flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: ACCENT, color: '#fff', fontWeight: 800, fontSize: 15, display: 'grid', placeItems: 'center', marginTop: 1 }
  const li: React.CSSProperties = { marginBottom: 7 }

  return (
    <main style={{ background: '#fff', color: INK, fontFamily: '"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', minHeight: '100vh' }}>
      <header style={{ background: 'linear-gradient(135deg,#120820 0%,#08080F 70%)', color: '#fff', padding: '40px 24px 30px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 14px ${ACCENT}` }} />
            <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 26, fontWeight: 600, letterSpacing: '-.01em' }}>Lore</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,.55)' }}>by Kathastories</span>
          </div>
          <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 34, fontWeight: 600, margin: '22px 0 6px' }}>Delete your account</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,.6)', fontSize: 13.5 }}>How to remove your Lore account and data · Last updated 3 July 2026</p>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 96px', lineHeight: 1.62 }}>
        <p style={{ fontSize: 16, color: '#2a2a2e', marginTop: 0 }}>
          You can request deletion of your <strong>Lore</strong> account (by Kathastories) and all
          associated data at any time. Because Lore accounts are created with a phone number, we
          verify and process deletions by email. Here&rsquo;s how:
        </p>

        <h2 style={{ fontSize: 19, fontWeight: 700, margin: '30px 0 16px' }}>Steps to request deletion</h2>
        <div style={step}>
          <div style={num}>1</div>
          <div>Email us at {mail('katha.storiesint@gmail.com', 'Delete my Lore account')} with the subject <strong>&ldquo;Delete my Lore account&rdquo;</strong>.</div>
        </div>
        <div style={step}>
          <div style={num}>2</div>
          <div>In the email, include the <strong>phone number you use to sign in to Lore</strong> (and your email, if you added one), so we can locate your account.</div>
        </div>
        <div style={step}>
          <div style={num}>3</div>
          <div>We verify the request and <strong>delete your account and data within 30 days</strong>, then send you a confirmation.</div>
        </div>

        <div style={{ border: `1px solid ${LINE}`, borderRadius: 14, padding: '18px 20px', background: '#fafafb', marginTop: 30 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>What gets deleted</h3>
          <ul style={{ paddingLeft: 20, margin: 0, color: '#333', fontSize: 15 }}>
            <li style={li}>Your account and phone number</li>
            <li style={li}>Your email address (if provided)</li>
            <li style={li}>All gameplay data — story progress, choices, meters, and relationship state</li>
            <li style={li}>Messages you sent to in-story characters</li>
            <li style={li}>Device and session identifiers and account-linked analytics</li>
          </ul>
        </div>

        <div style={{ border: `1px solid ${LINE}`, borderRadius: 14, padding: '18px 20px', background: '#fafafb', marginTop: 16 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>What we keep, and for how long</h3>
          <p style={{ margin: 0, color: '#333', fontSize: 15 }}>
            After deletion we retain only <strong>anonymised or aggregate data</strong> that can no
            longer identify you, and any records we are <strong>legally required</strong> to keep.
            Everything that identifies you is removed within <strong>30 days</strong> of your request.
          </p>
        </div>

        <p style={{ marginTop: 30, color: MUTED, fontSize: 14 }}>
          Questions about deletion or your data? Contact {mail('katha.storiesint@gmail.com')}, or our
          Grievance Officer, Nabh Garg, at {mail('nabhgarg@gmail.com')}. See our{' '}
          <a href="/privacy" style={{ color: ACCENT, fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</a> for full details.
        </p>

        <footer style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${LINE}`, color: MUTED, fontSize: 13 }}>
          © 2026 Kathastories · Lore
        </footer>
      </div>
    </main>
  )
}
