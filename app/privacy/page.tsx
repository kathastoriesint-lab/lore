import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Lore',
  description: 'How Lore collects, uses, and protects your data.',
}

// Public privacy policy for the Google Play store listing and in-app link.
// Hosted at /privacy on the same deploy → https://lore-next-wine.vercel.app/privacy
const ACCENT = '#FF2D78'
const INK = '#1a1a1c'
const MUTED = '#5b5b63'
const LINE = '#ececef'

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 34 }}>
      <h2 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 10px', display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ color: ACCENT, fontVariantNumeric: 'tabular-nums', fontSize: 15, fontWeight: 800 }}>{n}</span>
        {title}
      </h2>
      <div style={{ color: '#333', fontSize: 15.5 }}>{children}</div>
    </section>
  )
}

export default function PrivacyPolicy() {
  const li: React.CSSProperties = { marginBottom: 8 }
  const mail = (a: string) => (
    <a href={`mailto:${a}`} style={{ color: ACCENT, fontWeight: 600, textDecoration: 'none' }}>{a}</a>
  )
  return (
    <main style={{ background: '#fff', color: INK, fontFamily: '"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', minHeight: '100vh' }}>
      {/* Branded header band */}
      <header style={{ background: 'linear-gradient(135deg,#120820 0%,#08080F 70%)', color: '#fff', padding: '40px 24px 30px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 14px ${ACCENT}` }} />
            <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 26, fontWeight: 600, letterSpacing: '-.01em' }}>Lore</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,.55)' }}>by Kathastories</span>
          </div>
          <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 34, fontWeight: 600, margin: '22px 0 6px' }}>Privacy Policy</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,.6)', fontSize: 13.5 }}>
            Effective 3 July 2026 · Last updated 3 July 2026
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 24px 96px', lineHeight: 1.62 }}>
        <p style={{ fontSize: 16, color: '#2a2a2e' }}>
          This Privacy Policy explains how <strong>Kathastories</strong> (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, and shares information when you use the
          Lore mobile app and website (together, the &ldquo;Service&rdquo;). Lore is an
          interactive-story app intended for users aged 18 and over. By using Lore, you agree to
          this policy.
        </p>

        <Section n="1" title="Information we collect">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}><strong>Account information.</strong> Your mobile phone number (verified via a one-time password) and, if you choose to provide it, your email address.</li>
            <li style={li}><strong>Gameplay data.</strong> Your story progress, choices, in-game meters, and relationship state, so we can save and continue your game.</li>
            <li style={li}><strong>Messages you send in-story.</strong> Text you send to in-story characters, processed to generate their replies (see section 3).</li>
            <li style={li}><strong>Usage &amp; device data.</strong> A randomly generated device identifier, session identifiers, screens viewed, time spent, and in-app events — used for analytics and to improve the Service.</li>
          </ul>
          <p style={{ marginBottom: 0 }}>We do <strong>not</strong> collect your precise location, contacts, photos, or financial information.</p>
        </Section>

        <Section n="2" title="How we use your information">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>To provide, save, and personalise your gameplay.</li>
            <li style={li}>To authenticate you and secure your account.</li>
            <li style={li}>To generate in-character replies in story conversations.</li>
            <li style={li}>To understand how the app is used and improve content, performance, and features.</li>
            <li style={li}>To send optional notifications about your story (you can turn these off).</li>
          </ul>
        </Section>

        <Section n="3" title="Third parties we share data with">
          <p style={{ marginTop: 0 }}>We do <strong>not</strong> sell your personal data. We share data with service providers only as needed to run the Service:</p>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}><strong>Supabase</strong> — database, authentication, and backend hosting for your account and gameplay data.</li>
            <li style={li}><strong>MSG91</strong> — sends and verifies the one-time password that confirms your phone number.</li>
            <li style={li}><strong>OpenAI</strong> — processes the messages you send to in-story characters to generate their responses. Please don&rsquo;t share sensitive personal information in these conversations.</li>
            <li style={li}><strong>Vercel</strong> — hosting and delivery of the app.</li>
          </ul>
          <p style={{ marginBottom: 0 }}>These providers may process data on servers outside India. We share only what each provider needs to perform its function.</p>
        </Section>

        <Section n="4" title="Data retention & deletion">
          <p style={{ margin: 0 }}>
            We keep your account and gameplay data for as long as your account is active. You can
            request deletion of your account and associated data at any time by emailing us at{' '}
            {mail('katha.storiesint@gmail.com')}. We will delete it within 30 days, except where we are
            required to retain it by law.
          </p>
        </Section>

        <Section n="5" title="Your rights">
          <p style={{ margin: 0 }}>
            You may request access to, correction of, or deletion of your personal data, and you may
            withdraw consent to processing, by contacting us at the address in section 8. We will
            respond within a reasonable timeframe.
          </p>
        </Section>

        <Section n="6" title="Children">
          <p style={{ margin: 0 }}>
            Lore is not directed to, or intended for, anyone under 18. We do not knowingly collect
            personal information from children. If you believe a child has provided us data, contact
            us and we will delete it.
          </p>
        </Section>

        <Section n="7" title="Security">
          <p style={{ margin: 0 }}>
            We use industry-standard measures to protect your data in transit and at rest, including
            encryption in transit (HTTPS). No method of transmission or storage is completely secure,
            and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section n="8" title="Contact us">
          <div style={{ border: `1px solid ${LINE}`, borderRadius: 14, padding: '16px 18px', background: '#fafafb' }}>
            <p style={{ margin: 0 }}>Questions, concerns, or data requests:</p>
            <p style={{ margin: '6px 0 0', fontSize: 16 }}>{mail('katha.storiesint@gmail.com')}</p>
          </div>
        </Section>

        <Section n="9" title="Grievance Officer">
          <p style={{ marginTop: 0 }}>
            In accordance with India&rsquo;s Digital Personal Data Protection Act, 2023 and the
            Information Technology Rules, you may reach our Grievance Officer for any complaint about
            the handling of your personal data:
          </p>
          <div style={{ border: `1px solid ${LINE}`, borderRadius: 14, padding: '16px 18px', background: '#fafafb' }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Nabh Garg</div>
            <div style={{ color: MUTED, fontSize: 13.5, margin: '2px 0 8px' }}>Grievance Officer, Kathastories</div>
            <div>{mail('nabhgarg@gmail.com')}</div>
          </div>
          <p style={{ marginBottom: 0, color: MUTED, fontSize: 13.5 }}>
            We aim to acknowledge grievances within 48 hours and resolve them within 30 days.
          </p>
        </Section>

        <Section n="10" title="Changes to this policy">
          <p style={{ margin: 0 }}>
            We may update this policy from time to time. Material changes will be reflected by
            updating the &ldquo;Last updated&rdquo; date at the top of this page.
          </p>
        </Section>

        <footer style={{ marginTop: 48, paddingTop: 20, borderTop: `1px solid ${LINE}`, color: MUTED, fontSize: 13 }}>
          © 2026 Kathastories. Lore is an interactive-fiction app. All trademarks belong to their respective owners.
        </footer>
      </div>
    </main>
  )
}
