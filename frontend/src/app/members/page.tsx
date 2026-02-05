// @ts-nocheck - React types are in Docker container
'use client'

// @ts-ignore - react is installed in Docker container
import { useState, useEffect } from 'react'
// @ts-ignore - axios is installed in Docker container
import axios from 'axios'
// @ts-ignore - next is installed in Docker container
import { useRouter } from 'next/navigation'

// @ts-ignore - process is available in Node.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface FamilyMember {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  birthDate?: string
  deathDate?: string
  isLiving?: boolean
}

export default function MembersPage() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/members`)
      setMembers(response.data.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch family members')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-xl text-gray-700">Loading family members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Family Members</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage and view all family members</p>
        </div>

        {/* Add Member Button */}
        <button 
          onClick={() => router.push('/add-member')}
          className="mb-6 w-full sm:w-auto px-6 py-3 sm:py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform sm:hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <span className="text-xl">+</span>
          Add Family Member
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {members.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="text-5xl sm:text-6xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No Family Members Yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Start building your family tree by adding your first family member!</p>
            <button 
              onClick={() => router.push('/add-member')}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
            >
              Add First Member
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Birth Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Death Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {member.firstName} {member.middleName && `${member.middleName} `}{member.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(member.birthDate)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {member.deathDate ? formatDate(member.deathDate) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {member.isLiving !== false ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            Living
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                            Deceased
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => router.push(`/members/${member.id}`)}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => router.push(`/members/${member.id}/edit`)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${member.firstName} ${member.lastName}?`)) {
                                // Delete functionality
                                console.log('Delete:', member.id)
                              }
                            }}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Stats */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Total: <span className="font-semibold text-gray-900">{members.length}</span> family member{members.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
