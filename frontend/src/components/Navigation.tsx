'use client';

import { useAuth } from '@/contexts/AuthContext';

// Navigation Link Component
function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const icons: Record<string, JSX.Element> = {
    home: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    tree: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
      </svg>
    ),
    cards: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  };

  return (
    <a
      href={href}
      className="group relative px-4 py-2 rounded-full text-gray-700 font-medium hover:text-purple-600 transition-all duration-300 flex items-center space-x-2"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      <span className="relative">{icons[icon]}</span>
      <span className="relative">{label}</span>
    </a>
  );
}

// Mobile Navigation Link Component
function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-600 transition-all"
    >
      {label}
    </a>
  );
}

export default function Navigation() {
  const { isAuthenticated, logout, isLoading, user } = useAuth();
  
  const toggleMobileMenu = () => {
    const menu = document.getElementById('mobile-menu');
    menu?.classList.toggle('hidden');
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Brand */}
          <a href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Family Tree
            </h1>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink href="/" icon="home" label="Home" />
            <NavLink href="/members" icon="users" label="Members" />
            <NavLink href="/tree" icon="tree" label="Tree View" />
            <NavLink href="/bio-cards" icon="cards" label="Bio Cards" />
            <a 
              href="/add-member"
              className="ml-4 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Member</span>
            </a>
            
            {!isLoading && (
              <div className="ml-2">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={user.name || 'User'} 
                          className="w-9 h-9 rounded-full border-2 border-purple-200 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate hidden lg:block">
                        {user.name || user.email || 'User'}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all"
                      title="Logout"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <a
                    href="/login"
                    className="px-4 py-2 text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Login</span>
                  </a>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-purple-100 transition-colors"
            onClick={toggleMobileMenu}
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu" className="hidden md:hidden pb-4 space-y-2">
          <MobileNavLink href="/" label="Home" />
          <MobileNavLink href="/members" label="Members" />
          <MobileNavLink href="/tree" label="Tree View" />
          <MobileNavLink href="/bio-cards" label="Bio Cards" />
          <a 
            href="/add-member"
            className="block w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-center hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            + Add Member
          </a>
          
          {!isLoading && (
            <div className="pt-2">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.name || 'User'} 
                        className="w-10 h-10 rounded-full border-2 border-purple-200 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 font-semibold text-center transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <a
                  href="/login"
                  className="block w-full px-4 py-3 text-purple-600 rounded-lg hover:bg-purple-50 font-semibold text-center transition-all"
                >
                  Login
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
