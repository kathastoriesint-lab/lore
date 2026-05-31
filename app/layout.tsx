import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lore — Worlds you can live in',
  description: 'Deep characters. Real drama. Two ways to live them.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
