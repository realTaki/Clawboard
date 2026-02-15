import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clawboard - Agent Incentive Layer on Monad',
  description: 'Tip, rank, and compound agent value with $CLAWDOGE on Monad',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
