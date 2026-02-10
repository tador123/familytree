// @ts-nocheck - React types are in Docker container
'use client'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to Family Tree
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Preserve your family legacy and connect generations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/add-member"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Add Your First Member
            </a>
            <a
              href="/tree"
              className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border-2 border-purple-200"
            >
              Explore Tree View
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
          <a href="/add-member" className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Add Member</h3>
            <p className="text-gray-600 text-sm">Create family member profiles</p>
          </a>
          
          <a href="/members" className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <h3 className="text-xl font-bold text-gray-800 mb-2">View Members</h3>
            <p className="text-gray-600 text-sm">Browse all family members</p>
          </a>
          
          <a href="/tree" className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Family Tree</h3>
            <p className="text-gray-600 text-sm">Interactive tree visualization</p>
          </a>
          
          <a href="/bio-cards" className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Bio Cards</h3>
            <p className="text-gray-600 text-sm">View beautiful bio cards</p>
          </a>
        </div>
      </div>
    </div>
  )
}
