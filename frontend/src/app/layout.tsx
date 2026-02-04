// @ts-nocheck - React types are in Docker container
// @ts-ignore - next is installed in Docker container
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Family Tree Application',
  description: 'Manage and visualize your family tree',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ddd' }}>
          <h1>Family Tree</h1>
          <nav>
            <a href="/" style={{ marginRight: '1rem' }}>Home</a>
            <a href="/members" style={{ marginRight: '1rem' }}>Members</a>
            <a href="/tree" style={{ marginRight: '1rem' }}>Tree View</a>
            <a href="/bio-cards" style={{ marginRight: '1rem' }}>Bio Cards</a>
          </nav>
        </header>
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
        <footer style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderTop: '1px solid #ddd', marginTop: '2rem' }}>
          <p>&copy; 2026 Family Tree Application</p>
        </footer>
      </body>
    </html>
  )
}
