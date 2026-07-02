import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Lore',
  description: 'How Lore collects, uses, and protects your data.',
}

// Public privacy policy for the Google Play store listing and in-app link.
// Hosted at /privacy on the same deploy, so the public URL is
// https://lore-next-wine.vercel.app/privacy
export default function PrivacyPolicy() {
  return (
    <main
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '48px 24px 96px',
        background: '#ffffff',
        color: '#1a1a1a',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        lineHeight: 1.6,
        minHeight: '100vh',
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 4 }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Lore, by Kathastories · Last updated: 2 July 2026
      </p>

      <p>
        This Privacy Policy explains how Kathastories (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects, uses, and shares information when you use the
        Lore mobile app and website (the &ldquo;Service&rdquo;). Lore is an
        interactive-story app intended for users aged 18 and over. By using Lore,
        you agree to this policy.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>
          <strong>Account information.</strong> When you sign in, we collect your
          mobile phone number (verified via a one-time password) and, if you
          provide it, your email address.
        </li>
        <li>
          <strong>Gameplay data.</strong> Your story progress, choices, in-game
          meters, and relationship state, so we can save and continue your game.
        </li>
        <li>
          <strong>Messages you send in-story.</strong> Text you send to in-story
          characters is processed to generate their replies (see &ldquo;Third
          parties&rdquo; below).
        </li>
        <li>
          <strong>Usage &amp; device data.</strong> A randomly generated device
          identifier, session identifiers, screens viewed, time spent, and
          in-app events, which we use for analytics and to improve the Service.
        </li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To provide, save, and personalise your gameplay.</li>
        <li>To authenticate you and secure your account.</li>
        <li>To generate in-character replies in story conversations.</li>
        <li>
          To understand how the app is used and to improve content, performance,
          and features.
        </li>
        <li>To send optional notifications about your story (you can disable these).</li>
      </ul>

      <h2>3. Third parties we share data with</h2>
      <p>We do not sell your personal data. We share data with service providers
        only as needed to run the Service:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — database, authentication, and backend
          hosting for your account and gameplay data.
        </li>
        <li>
          <strong>MSG91</strong> — sends and verifies the one-time password used
          to confirm your phone number.
        </li>
        <li>
          <strong>OpenAI</strong> — processes the messages you send to in-story
          characters in order to generate their responses. Do not share sensitive
          personal information in these conversations.
        </li>
        <li>
          <strong>Vercel</strong> — hosting and delivery of the app.
        </li>
      </ul>

      <h2>4. Data retention</h2>
      <p>
        We keep your account and gameplay data for as long as your account is
        active. You may request deletion of your account and associated data at
        any time by contacting us (see below), after which we will delete it
        within a reasonable period, except where we are required to retain it by
        law.
      </p>

      <h2>5. Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal
        data by emailing us at the address below. We will respond within a
        reasonable timeframe.
      </p>

      <h2>6. Children</h2>
      <p>
        Lore is not directed to, or intended for, individuals under 18. We do not
        knowingly collect personal information from children.
      </p>

      <h2>7. Security</h2>
      <p>
        We use industry-standard measures to protect your data in transit and at
        rest. No method of transmission or storage is completely secure, and we
        cannot guarantee absolute security.
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be
        reflected by updating the &ldquo;Last updated&rdquo; date above.
      </p>

      <h2>9. Contact us</h2>
      <p>
        Questions or data requests: <strong>privacy@kathastories.com</strong>
      </p>
    </main>
  )
}
