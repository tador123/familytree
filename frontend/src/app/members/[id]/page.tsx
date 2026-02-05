'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  isLiving?: boolean;
  biography?: string;
}

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMemberDetails();
  }, [params.id]);

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/family-members/${params.id}`);
      setMember(response.data.data || response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch member details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold mb-4">{error || 'Member not found'}</p>
            <button
              onClick={() => router.push('/members')}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              Back to Members
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/members')}
            className="flex items-center text-emerald-600 hover:text-emerald-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Members
          </button>
          
          <button
            onClick={() => router.push(`/members/${params.id}/edit`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Edit Member
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {member.firstName} {member.middleName && `${member.middleName} `}{member.lastName}
            </h1>
            <div className="flex items-center space-x-4">
              {member.isLiving ? (
                <span className="flex items-center text-green-600 font-semibold">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Living
                </span>
              ) : (
                <span className="text-gray-500">Deceased</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Gender</h3>
              <p className="text-lg text-gray-800">{member.gender || 'Not specified'}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Birth Date</h3>
              <p className="text-lg text-gray-800">{formatDate(member.birthDate)}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Birth Place</h3>
              <p className="text-lg text-gray-800">{member.birthPlace || 'Not specified'}</p>
            </div>

            {!member.isLiving && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Death Date</h3>
                  <p className="text-lg text-gray-800">{formatDate(member.deathDate)}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Death Place</h3>
                  <p className="text-lg text-gray-800">{member.deathPlace || 'Not specified'}</p>
                </div>
              </>
            )}
          </div>

          {member.biography && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Biography</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{member.biography}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
