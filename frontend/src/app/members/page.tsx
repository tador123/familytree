// @ts-nocheck - React types are in Docker container
'use client'

// @ts-ignore - react is installed in Docker container
import { useState, useEffect } from 'react'
// @ts-ignore - axios is installed in Docker container
import axios from 'axios'

// @ts-ignore - process is available in Node.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface FamilyMember {
  id: string
  firstName: string
  lastName: string
  birthDate?: string
  deathDate?: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/v1/family-members`)
      setMembers(response.data.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch family members')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading family members...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div>
      <h2>Family Members</h2>
      
      <button 
        onClick={() => alert('Add member functionality coming soon!')}
        style={{ 
          padding: '0.5rem 1rem', 
          marginBottom: '1rem',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        + Add Family Member
      </button>

      {members.length === 0 ? (
        <p>No family members found. Add your first family member to get started!</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Birth Date</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Death Date</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                  {member.firstName} {member.lastName}
                </td>
                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                  {member.birthDate || 'N/A'}
                </td>
                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                  {member.deathDate || '-'}
                </td>
                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                  <button style={{ marginRight: '0.5rem' }}>View</button>
                  <button style={{ marginRight: '0.5rem' }}>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
