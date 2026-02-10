// @ts-nocheck - React types are in Docker container
// @ts-ignore - next is installed in Docker container
import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import Providers from '@/components/Providers'

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
      <body className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
        <Providers>
          {/* Navigation Header */}
          <Navigation />

          {/* Main Content */}
          <main className="min-h-[calc(100vh-12rem)]">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* About Section */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Family Tree</span>
                </h3>
                <p className="text-purple-200 text-sm">
                  Preserve your family legacy and share stories that connect generations. Build, explore, and celebrate your family history.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-purple-200 text-sm">
                  <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                  <li><a href="/members" className="hover:text-white transition-colors">View Members</a></li>
                  <li><a href="/tree" className="hover:text-white transition-colors">Family Tree</a></li>
                  <li><a href="/bio-cards" className="hover:text-white transition-colors">Bio Cards</a></li>
                  <li><a href="/add-member" className="hover:text-white transition-colors">Add New Member</a></li>
                </ul>
              </div>

              {/* Info */}
              <div>
                <h3 className="text-lg font-bold mb-4">Features</h3>
                <ul className="space-y-2 text-purple-200 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-pink-400">✓</span>
                    <span>Interactive family tree visualization</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-pink-400">✓</span>
                    <span>Beautiful bio cards for each member</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-pink-400">✓</span>
                    <span>Photo galleries and memories</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-pink-400">✓</span>
                    <span>Relationship management</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-purple-800 mt-8 pt-8 text-center text-purple-300 text-sm">
              <p>© 2026 Family Tree Application. Preserving memories, connecting generations.</p>
            </div>
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  )
}
