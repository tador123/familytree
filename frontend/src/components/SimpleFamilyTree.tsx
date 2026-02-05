'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  deathDate?: string;
  isLiving?: boolean;
  profilePhotoId?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
}

export default function SimpleFamilyTree() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/family-members`);
      setMembers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  const getLifespan = (member: FamilyMember) => {
    const birth = formatDate(member.birthDate);
    const death = member.isLiving ? 'Present' : formatDate(member.deathDate);
    return birth && death ? `${birth} - ${death}` : birth || death || '';
  };

  const getMembersByGeneration = () => {
    // Simple grouping - you can enhance this with actual generation logic
    return members;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mb-4"></div>
          <p className="text-xl text-gray-700">Loading Family Tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Family Tree</h1>
          <p className="text-sm sm:text-base text-gray-600">Simple view of all family members</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {getMembersByGeneration().map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-lg active:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform active:scale-95 sm:hover:scale-105"
              onClick={() => setSelectedMember(member)}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                    {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                  </div>
                  {member.isLiving && (
                    <span className="flex items-center text-green-600 text-xs font-semibold">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                      Living
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 line-clamp-2">
                  {member.firstName} {member.middleName && `${member.middleName} `}
                  {member.lastName}
                </h3>

                {getLifespan(member) && (
                  <p className="text-sm text-gray-600 mb-3">{getLifespan(member)}</p>
                )}

                <div className="border-t border-gray-200 pt-3 mt-3 text-xs text-gray-500">
                  Tap to view details
                </div>
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-12 sm:py-16 px-4">
            <svg
              className="mx-auto h-20 w-20 sm:h-24 sm:w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Family Members Yet</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">Start building your family tree by adding members</p>
            <a
              href="/add-member"
              className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 active:bg-emerald-700 font-semibold text-sm sm:text-base"
            >
              Add First Member
            </a>
          </div>
        )}
      </div>

      {/* Mobile-Friendly Modal for Member Details */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-800 pr-4 line-clamp-2">
                {selectedMember.firstName} {selectedMember.middleName && `${selectedMember.middleName} `}
                {selectedMember.lastName}
              </h2>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-500 hover:text-gray-700 p-2 -mr-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center">
                {selectedMember.isLiving ? (
                  <span className="flex items-center text-green-600 font-semibold text-sm sm:text-base">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Living
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm sm:text-base">Deceased</span>
                )}
              </div>

              {selectedMember.birthDate && (
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-500">Birth Date: </span>
                  <span className="text-gray-800">{new Date(selectedMember.birthDate).toLocaleDateString()}</span>
                </div>
              )}

              {!selectedMember.isLiving && selectedMember.deathDate && (
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-500">Death Date: </span>
                  <span className="text-gray-800">{new Date(selectedMember.deathDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href={`/members/${selectedMember.id}`}
                className="flex-1 px-4 py-3 sm:py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 active:bg-emerald-700 text-center font-semibold text-sm sm:text-base"
              >
                View Full Profile
              </a>
              <a
                href={`/members/${selectedMember.id}/edit`}
                className="flex-1 px-4 py-3 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 text-center font-semibold text-sm sm:text-base"
              >
                Edit
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
