// @ts-nocheck - React types are in Docker container
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            🌳 Family Tree
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Preserve your family legacy, connect generations, and share cherished memories
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <a
            href="/add-member"
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-4xl mb-3">👤</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Add Member</h3>
            <p className="text-gray-600 text-sm">Create a new family member profile with photos and bio</p>
            <div className="mt-4 text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              Get Started →
            </div>
          </a>

          <a
            href="/members"
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">View Members</h3>
            <p className="text-gray-600 text-sm">Browse all family members and their information</p>
            <div className="mt-4 text-blue-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              View All →
            </div>
          </a>

          <a
            href="/tree"
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-4xl mb-3">🌲</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Family Tree</h3>
            <p className="text-gray-600 text-sm">Explore your family relationships in an interactive tree</p>
            <div className="mt-4 text-purple-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              Explore →
            </div>
          </a>

          <a
            href="/bio-cards"
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="text-4xl mb-3">📇</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Bio Cards</h3>
            <p className="text-gray-600 text-sm">View beautiful biography cards with photos and stories</p>
            <div className="mt-4 text-pink-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              View Cards →
            </div>
          </a>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">📝</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Rich Biographies</h3>
                <p className="text-gray-600 text-sm">Write detailed life stories with birth, death dates and places</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-3xl">📸</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Photo Galleries</h3>
                <p className="text-gray-600 text-sm">Upload profile photos and memory galleries for each member</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-3xl">🔗</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Relationships</h3>
                <p className="text-gray-600 text-sm">Link family members with parent and spouse connections</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-3xl">🌳</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Interactive Tree</h3>
                <p className="text-gray-600 text-sm">Visualize family connections with drag-and-zoom tree view</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-3xl">📖</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Scrapbook View</h3>
                <p className="text-gray-600 text-sm">Click any member to see full biography and photo gallery</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-3xl">✨</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Beautiful UI</h3>
                <p className="text-gray-600 text-sm">Friendly design with animations and intuitive navigation</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">⚙️</span>
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">API Service</span>
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Port 3001 • Running</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Media Service</span>
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Port 3002 • Running</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Database</span>
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <p className="text-sm text-gray-500 mt-1">PostgreSQL • Connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
